import { describeInjectionStatus } from './injectionService.js';
import { getCompanionMilestoneStatus } from './companionService.js';
import { getEntityCaptureMilestoneStatus } from './entityCaptureService.js';
import { LoomGenerationService, type GenerationTarget } from './generationService.js';
import {
  getActiveChat,
  getGlobalSpindle,
  getPermissionState,
  onFrontendMessage,
  sendFrontend,
  type LoomSpindle,
} from './lumiverseApi.js';
import { LoomPresetService } from './presetService.js';
import { LoomSettingsService } from './settingsService.js';
import { getSimulationMilestoneStatus } from './simulationService.js';
import { LoomTrackerStateService } from './trackerStateService.js';
import type {
  LoomBackendMessage,
  LoomDiagnostics,
  LoomFrontendMessage,
  LoomFrontendState,
  LoomPreset,
  LoomSettings,
  LoomTrackerState,
} from '../shared/types.js';
import { makeCompactSummary } from '../shared/renderer.js';
import { validateAgainstSchema } from '../shared/validation.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isFrontendMessage(value: unknown): value is LoomFrontendMessage {
  return isRecord(value) && typeof value.type === 'string';
}

function activeChatName(id: string | null, fallback: string): string {
  if (!id) return fallback;
  return fallback || `Chat ${id}`;
}

function isAssistantMessage(message: { role?: string | undefined; content?: string | undefined }): boolean {
  const role = (message.role || '').toLowerCase();
  return role === 'assistant' || role === 'model' || role === 'ai' || (!role && Boolean(message.content));
}

function messageChatId(message: LoomFrontendMessage): string | null {
  const record = message as Record<string, unknown>;
  return typeof record.chatId === 'string' && record.chatId.trim() ? record.chatId : null;
}

class StateOfTheLoomBackend {
  private readonly settingsService: LoomSettingsService;
  private readonly presetService: LoomPresetService;
  private readonly trackerService: LoomTrackerStateService;
  private readonly generationService: LoomGenerationService;
  private readonly knownUsers = new Set<string>();
  private readonly chatUsers = new Map<string, string>();
  private lastFrontendUserId: string | null = null;
  private reportedUnknownGenerationUser = false;
  private diagnostics: LoomDiagnostics = {
    backendReady: true,
    renderLimitation: 'Top-of-message rendering uses Lumiverse render hooks when available and a scoped compatibility mount otherwise.',
  };

  constructor(private readonly spindle: LoomSpindle) {
    const onStorageWarning = (warning: string) => this.recordStorageWarning(warning);
    this.settingsService = new LoomSettingsService(spindle, onStorageWarning);
    this.presetService = new LoomPresetService(spindle, onStorageWarning);
    this.trackerService = new LoomTrackerStateService(spindle, onStorageWarning);
    this.generationService = new LoomGenerationService(spindle);
  }

  setup(): void {
    onFrontendMessage(this.spindle, async (message, userId) => {
      if (!isFrontendMessage(message)) return;
      this.rememberUser(userId, messageChatId(message));
      await this.handleMessage(userId, message);
    });

    this.spindle.permissions?.onChanged?.(async () => {
      await this.notifyPermissionsChanged();
    });

    const onEvent = this.spindle.on ?? this.spindle.events?.on;
    onEvent?.('generation_ended', async (payload) => {
      await this.handleGenerationEnded(payload);
    });
    onEvent?.('GENERATION_ENDED', async (payload) => {
      await this.handleGenerationEnded(payload);
    });
    onEvent?.('PERMISSION_CHANGED', async () => {
      await this.notifyPermissionsChanged();
    });
    this.spindle.log?.info?.('State of the Loom backend loaded.');
  }

  private rememberUser(userId: string, chatId?: string | null): void {
    this.knownUsers.add(userId);
    if (userId && userId !== 'default') this.lastFrontendUserId = userId;
    if (chatId && userId && userId !== 'default') this.chatUsers.set(chatId, userId);
  }

  private recordStorageWarning(warning: string): void {
    this.diagnostics = { ...this.diagnostics, storageWarning: warning };
  }

  private recordRuntimeError(message: string, error?: unknown): void {
    const detail = error instanceof Error ? error.message : error ? String(error) : '';
    const text = detail ? `${message}: ${detail}` : message;
    this.diagnostics = { ...this.diagnostics, lastError: text };
    this.spindle.log?.warn?.(`State of the Loom: ${text}`);
  }

  private async notifyPermissionsChanged(): Promise<void> {
    try {
      for (const userId of this.knownUsers) {
        const state = await this.buildState(userId);
        await this.send(userId, { type: 'permissions_changed', permissions: state.permissions, state });
      }
    } catch (error) {
      this.recordRuntimeError('Permission change handling failed', error);
    }
  }

  private async send(userId: string, message: LoomBackendMessage): Promise<void> {
    await sendFrontend(this.spindle, userId, message);
  }

  private async buildState(userId: string): Promise<LoomFrontendState> {
    const [settings, permissions] = await Promise.all([
      this.settingsService.load(userId),
      getPermissionState(this.spindle).catch((error) => {
        this.recordRuntimeError('Permission lookup failed', error);
        return { chats: false, chat_mutation: false, generation: false, app_manipulation: false };
      }),
    ]);
    const presets = await this.presetService.loadAll(userId);
    const activePreset = await this.presetService.resolve(userId, settings.activePresetId);
    const active = permissions.chats
      ? await getActiveChat(this.spindle, userId).catch((error) => {
        this.recordRuntimeError('Active chat lookup failed', error);
        return { chat: { id: null, name: 'Active chat unavailable' }, messages: [] };
      })
      : { chat: { id: null, name: 'Chat permission missing' }, messages: [] };
    const activeChat = {
      id: active.chat.id,
      name: activeChatName(active.chat.id, active.chat.name),
    };
    if (activeChat.id) this.rememberUser(userId, activeChat.id);
    const connections = await this.generationService.listConnections(userId, permissions).catch((error) => {
      this.recordRuntimeError('Connection profile lookup failed', error);
      return [];
    });
    const [latestTracker, messageTrackers] = await Promise.all([
      this.trackerService.getLatest(userId, activeChat.id).catch((error) => {
        this.recordRuntimeError('Latest tracker lookup failed', error);
        return null;
      }),
      this.trackerService.listForChat(userId, activeChat.id).catch((error) => {
        this.recordRuntimeError('Message tracker lookup failed', error);
        return [];
      }),
    ]);
    const baseGenerationStatus = this.generationService.getStatus();
    const disabledReason = this.generationService.getDisabledReason({
        settings,
        permissions,
        activeChatId: activeChat.id,
        activePreset,
        connections,
      }) ?? (activeChat.id && !active.messages.some(isAssistantMessage)
        ? 'No assistant message is available to track.'
        : undefined);
    const generation = {
      ...baseGenerationStatus,
      disabledReason,
    };

    let isStale = false;
    if (latestTracker && active.messages && active.messages.length > 0) {
      const trackedMsgIndex = active.messages.findIndex((m) => m.id === latestTracker.messageId);
      if (trackedMsgIndex === -1) {
        isStale = true;
      } else if (trackedMsgIndex < active.messages.length - 1) {
        isStale = true;
      }
    }

    const diagnostics: LoomDiagnostics = {
      ...this.diagnostics,
      backendReady: true,
      lastParserError: this.diagnostics.lastParserError,
      lastGenerationError: this.diagnostics.lastGenerationError,
      storageWarning: this.diagnostics.storageWarning,
      lastRenderStatus: isStale ? 'Current Loom state is Stale (new user or assistant messages have been added).' : this.diagnostics.lastRenderStatus,
    };
    const simulationNote = getSimulationMilestoneStatus();
    const entityNote = getEntityCaptureMilestoneStatus();
    const companionNote = getCompanionMilestoneStatus();
    const injectionNote = describeInjectionStatus(settings, permissions);
    diagnostics.renderLimitation = [
      this.diagnostics.renderLimitation,
      injectionNote,
      simulationNote,
      entityNote,
      companionNote,
    ].filter(Boolean).join(' ');

    return {
      backendReady: true,
      settings,
      permissions,
      presets,
      activePreset,
      activeChat,
      connections,
      latestTracker,
      messageTrackers,
      generation,
      diagnostics,
    };
  }

  private async handleMessage(userId: string, message: LoomFrontendMessage): Promise<void> {
    try {
      this.rememberUser(userId, messageChatId(message));
      if (message.type === 'ready' || message.type === 'refresh_state') {
        await this.send(userId, { type: 'state', state: await this.buildState(userId) });
        return;
      }

      if (message.type === 'reset_storage') {
        await Promise.all([
          this.settingsService.reset(userId),
          this.presetService.reset(userId),
          this.trackerService.reset(userId),
        ]);
        this.recordStorageWarning('State of the Loom storage was reset to defaults.');
        const state = await this.buildState(userId);
        await this.send(userId, { type: 'storage_reset', state });
        await this.send(userId, { type: 'toast', level: 'success', message: 'State of the Loom storage was reset.' });
        return;
      }

      if (message.type === 'save_settings') {
        const settings = await this.settingsService.save(userId, message.settings);
        const active = await getActiveChat(this.spindle, userId).catch(() => null);
        const activeChatId = active?.chat?.id;
        if (activeChatId && settings.trackerHistoryLimit > 0) {
          await this.trackerService.pruneChatHistory(userId, activeChatId, settings.trackerHistoryLimit);
        }
        await this.send(userId, { type: 'settings_saved', settings });
        await this.send(userId, { type: 'state', state: await this.buildState(userId) });
        return;
      }

      if (message.type === 'select_preset') {
        const settings = await this.settingsService.save(userId, { activePresetId: message.presetId });
        const active = await getActiveChat(this.spindle, userId).catch(() => null);
        const activeChatId = active?.chat?.id;
        if (activeChatId && settings.trackerHistoryLimit > 0) {
          await this.trackerService.pruneChatHistory(userId, activeChatId, settings.trackerHistoryLimit);
        }
        await this.send(userId, { type: 'settings_saved', settings });
        await this.send(userId, { type: 'state', state: await this.buildState(userId) });
        return;
      }

      if (message.type === 'generate_tracker') {
        await this.generateTrackerForUser(userId, message.chatId, message.messageId);
        return;
      }

      if (message.type === 'edit_tracker') {
        await this.saveManualTracker(userId, message.tracker);
        return;
      }

      if (message.type === 'delete_tracker') {
        await this.trackerService.delete(userId, message.chatId, message.messageId);
        await this.send(userId, { type: 'tracker_deleted', state: await this.buildState(userId) });
        return;
      }

      if (message.type === 'hide_tracker') {
        const tracker = await this.trackerService.setHidden(userId, message.chatId, message.messageId, message.hidden);
        const state = await this.buildState(userId);
        if (tracker) await this.send(userId, { type: 'tracker_updated', tracker, state });
        else await this.send(userId, { type: 'tracker_error', message: 'Tracker was not found.', state });
        return;
      }

      if (message.type === 'export_diagnostics') {
        await this.send(userId, { type: 'diagnostics', diagnostics: this.diagnostics });
        return;
      }

      if (message.type === 'save_preset') {
        await this.presetService.save(userId, message.preset);
        const state = await this.buildState(userId);
        await this.send(userId, { type: 'state', state });
        await this.send(userId, { type: 'toast', level: 'success', message: `Template '${message.preset.name}' saved.` });
        return;
      }

      if (message.type === 'delete_preset') {
        await this.presetService.delete(userId, message.presetId);
        const state = await this.buildState(userId);
        await this.send(userId, { type: 'state', state });
        await this.send(userId, { type: 'toast', level: 'success', message: 'Template deleted.' });
        return;
      }

      if (message.type === 'reset_presets') {
        await this.presetService.reset(userId);
        const state = await this.buildState(userId);
        await this.send(userId, { type: 'state', state });
        await this.send(userId, { type: 'toast', level: 'success', message: 'Custom templates reset to defaults.' });
        return;
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      this.diagnostics = { ...this.diagnostics, lastError: text };
      await this.send(userId, { type: 'error', message: text });
    }
  }

  private async generateTrackerForUser(
    userId: string,
    chatId?: string | null,
    messageId?: string,
    targetOverride?: GenerationTarget | null,
  ): Promise<void> {
    const state = await this.buildState(userId);
    const target = targetOverride ?? await this.generationService.findLatestAssistantTarget(userId, chatId, messageId);
    if (state.generation.disabledReason && state.generation.disabledReason !== 'No assistant message is available to track.') {
      await this.send(userId, { type: 'tracker_error', message: state.generation.disabledReason, state });
      return;
    }

    if (!target) {
      const latestState = await this.buildState(userId);
      await this.send(userId, { type: 'tracker_error', message: 'No assistant message is available to track.', state: latestState });
      return;
    }

    const settings = state.settings;
    const preset = state.activePreset;
    const passive = preset.mode !== 'sidecar_generate'
      ? this.generationService.tryPassiveExtract({ preset, settings, chatId: target.chatId, message: target.message })
      : null;
    if (!passive && !state.permissions.generation) {
      await this.send(userId, {
        type: 'tracker_error',
        message: 'Missing generation permission; no passive tracker block was found in the assistant message.',
        state: await this.buildState(userId),
      });
      return;
    }
    if (!passive && !settings.useDefaultConnectionFallback && !settings.sidecarConnectionId) {
      await this.send(userId, {
        type: 'tracker_error',
        message: 'No sidecar connection profile selected.',
        state: await this.buildState(userId),
      });
      return;
    }
    const recentTrackers = await this.trackerService.listForChat(userId, target.chatId);
    const contextLimit = settings.trackerHistoryLimit > 0 ? settings.trackerHistoryLimit : 5;
    const previousSummaries = recentTrackers
      .slice(1, contextLimit)
      .map((t) => `${t.generatedAt}: ${t.compactSummary}`);

    const result = passive
      ?? await this.generationService.generateSidecar({
        userId,
        settings,
        preset,
        previousTracker: state.latestTracker,
        previousSummaries,
        chatId: target.chatId,
        message: target.message,
        recentContext: target.recentContext,
      });

    await this.trackerService.save(userId, result.tracker, settings.trackerHistoryLimit);
    await this.generationService.stripPassiveBlockIfAllowed({
      permissions: state.permissions,
      settings,
      userId,
      chatId: target.chatId,
      messageId: target.message.id,
      cleanedContent: result.cleanedContent,
    });
    this.diagnostics = { ...this.diagnostics, lastParserError: undefined, lastGenerationError: undefined };
    await this.send(userId, { type: 'tracker_generated', tracker: result.tracker, state: await this.buildState(userId) });
  }

  private async saveManualTracker(userId: string, tracker: LoomTrackerState): Promise<void> {
    const preset: LoomPreset = await this.presetService.resolve(userId, tracker.presetId);
    const validation = validateAgainstSchema(tracker.data, preset.schemaJson);
    const updated: LoomTrackerState = {
      ...tracker,
      generatedAt: new Date().toISOString(),
      source: 'manual_edit',
      validation,
      compactSummary: makeCompactSummary(tracker.data),
    };
    await this.trackerService.save(userId, updated);
    await this.send(userId, { type: 'tracker_updated', tracker: updated, state: await this.buildState(userId) });
  }

  private async handleGenerationEnded(payload: unknown): Promise<void> {
    try {
      if (!isRecord(payload)) return;
      const source = payload.source ?? payload.extensionId ?? payload.extension_id;
      const generationType = payload.generationType ?? payload.generation_type;
      if (source === 'state_of_the_loom' || generationType === 'quiet') return;
      const chatId = this.payloadString(payload.chatId ?? payload.chat_id);
      const messageId = this.payloadString(payload.messageId ?? payload.message_id ?? payload.targetMessageId ?? payload.target_message_id) ?? undefined;
      const content = this.payloadString(payload.content) ?? undefined;
      const userId = this.resolveUserForEvent(payload, chatId);
      if (!userId) {
        if (!this.reportedUnknownGenerationUser) {
          this.reportedUnknownGenerationUser = true;
          this.diagnostics = {
            ...this.diagnostics,
            lastGenerationError: 'Skipped auto-generation because no frontend user is known yet. Open the Loom drawer once, then refresh.',
          };
        }
        return;
      }
      this.rememberUser(userId, chatId);
      const settings: LoomSettings = await this.settingsService.load(userId);
      if (!settings.enabled || !settings.autoGenerate) return;
      const state = await this.buildState(userId);
      if (!state.permissions.chats) return;
      try {
        const target = chatId
          ? await this.generationService.findPayloadTarget({ userId, chatId, messageId, content })
          : null;
        await this.generateTrackerForUser(userId, chatId ?? state.activeChat.id, messageId, target);
      } catch (error) {
        this.diagnostics = {
          ...this.diagnostics,
          lastGenerationError: error instanceof Error ? error.message : String(error),
        };
      }
    } catch (error) {
      this.recordRuntimeError('Generation event handling failed', error);
    }
  }

  private payloadString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private resolveUserForEvent(payload: Record<string, unknown>, chatId: string | null): string | null {
    const payloadUserId = this.payloadString(payload.userId ?? payload.user_id);
    if (payloadUserId && payloadUserId !== 'default') return payloadUserId;
    if (chatId) {
      const chatUser = this.chatUsers.get(chatId);
      if (chatUser && chatUser !== 'default') return chatUser;
    }
    const concreteUsers = [...this.knownUsers].filter((candidate) => candidate && candidate !== 'default');
    if (concreteUsers.length === 1) return concreteUsers[0];
    if (this.lastFrontendUserId && this.lastFrontendUserId !== 'default') return this.lastFrontendUserId;
    return null;
  }
}

const backend = new StateOfTheLoomBackend(getGlobalSpindle());
backend.setup();
