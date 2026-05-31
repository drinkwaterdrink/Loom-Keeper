import { buildContinuityInjection, describeInjectionStatus, estimateTokens } from './injectionService.js';
import { getCompanionMilestoneStatus } from './companionService.js';
import { getEntityCaptureMilestoneStatus } from './entityCaptureService.js';
import { LoomGenerationFailure, LoomGenerationService, type GenerationTarget } from './generationService.js';
import {
  getActiveChat,
  getGlobalSpindle,
  getPermissionState,
  onFrontendMessage,
  registerPromptInterceptor,
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
  LoomChatMessage,
  LoomChatMessageSummary,
  LoomPreset,
  LoomSettings,
  LoomTrackerState,
  LoomPipelineReport,
  LoomSwipeReport,
} from '../shared/types.js';
import { makeCompactSummary } from '../shared/renderer.js';
import { getPresetOrigin, validateAgainstSchema, checkPresetReadiness } from '../shared/validation.js';

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

function previewRawOutput(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const compact = value.replace(/\s+/g, ' ').trim();
  return compact.length > 700 ? `${compact.slice(0, 700)}...` : compact;
}

function activeSwipeByMessageId(messages: LoomChatMessage[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const message of messages) {
    if (message.id && typeof message.swipe_id === 'number') {
      map[message.id] = message.swipe_id;
    }
  }
  return map;
}

function assistantMessageSummaries(messages: LoomChatMessage[]): LoomChatMessageSummary[] {
  return messages
    .map((message, index) => ({ message, index }))
    .filter(({ message }) => Boolean(message.id) && isAssistantMessage(message))
    .map(({ message, index }) => ({
      id: message.id as string,
      role: message.role || 'assistant',
      swipeId: typeof message.swipe_id === 'number' ? message.swipe_id : undefined,
      index,
    }));
}

function latestAssistantMessage(messages: LoomChatMessage[]): LoomChatMessage | undefined {
  return [...messages].reverse().find(isAssistantMessage);
}

function countSwipeAlternatives(trackers: LoomTrackerState[]): { stored: number; alternatives: number } {
  const grouped = new Map<string, number>();
  let stored = 0;
  for (const tracker of trackers) {
    if (!tracker.messageId || typeof tracker.swipeId !== 'number') continue;
    stored += 1;
    grouped.set(tracker.messageId, (grouped.get(tracker.messageId) ?? 0) + 1);
  }
  let alternatives = 0;
  for (const count of grouped.values()) {
    if (count > 1) alternatives += count - 1;
  }
  return { stored, alternatives };
}

function activeSwipeTrackers(trackers: LoomTrackerState[], swipeMap: Record<string, number>): LoomTrackerState[] {
  const grouped = new Map<string, LoomTrackerState[]>();
  const passthrough: LoomTrackerState[] = [];
  for (const tracker of trackers) {
    if (!tracker.messageId) {
      passthrough.push(tracker);
      continue;
    }
    const group = grouped.get(tracker.messageId) ?? [];
    group.push(tracker);
    grouped.set(tracker.messageId, group);
  }
  for (const [messageId, group] of grouped) {
    const activeSwipe = swipeMap[messageId];
    const chosen = typeof activeSwipe === 'number'
      ? group.find((tracker) => tracker.swipeId === activeSwipe)
      : undefined;
    const newest = group.slice().sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
    const active = chosen ?? newest;
    if (active) passthrough.push(active);
  }
  return passthrough
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

class LoomKeeperBackend {
  private readonly settingsService: LoomSettingsService;
  private readonly presetService: LoomPresetService;
  private readonly trackerService: LoomTrackerStateService;
  private readonly generationService: LoomGenerationService;
  private readonly knownUsers = new Set<string>();
  private readonly chatUsers = new Map<string, string>();
  private lastFrontendUserId: string | null = null;
  private reportedUnknownGenerationUser = false;
  private interceptorRegistered = false;
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
    const unregisterInterceptor = registerPromptInterceptor(this.spindle, async (messages, context) => {
      return this.handlePromptInjection(messages, context);
    }, 80);
    this.interceptorRegistered = typeof unregisterInterceptor === 'function' || typeof this.spindle.registerInterceptor === 'function' || Boolean((this.spindle.interceptors as Record<string, unknown> | undefined)?.register);
    if (!this.interceptorRegistered) {
      this.diagnostics = {
        ...this.diagnostics,
        injectionReport: {
          enabled: false,
          registered: false,
          available: false,
          mode: 'latest_plus_history',
          trackerCount: 0,
          historyCount: 0,
          estimatedTokens: 0,
          tokenBudget: 700,
          truncated: false,
          lastSkippedReason: 'Lumiverse interceptor API was not detected in this runtime.',
        },
      };
    }
    this.spindle.log?.info?.('Loom Keeper backend loaded.');
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
    this.spindle.log?.warn?.(`Loom Keeper: ${text}`);
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

  private async handlePromptInjection(
    messages: Array<Record<string, unknown>>,
    context?: Record<string, unknown>,
  ): Promise<Array<Record<string, unknown>>> {
    try {
      const source = context?.source ?? context?.extensionId ?? context?.extension_id;
      const generationType = context?.generationType ?? context?.generation_type;
      const internal = context?.internal;
      if (source === 'loom_keeper' || generationType === 'quiet' || internal === true) return messages;
      const looksLikeTrackerSidecar = messages.some((message) => {
        const content = typeof message.content === 'string' ? message.content : '';
        return content.includes('Latest assistant message to track:') && content.includes('Return JSON only. No markdown.');
      });
      if (looksLikeTrackerSidecar) return messages;

      let chatId = this.payloadString(context?.chatId ?? context?.chat_id ?? context?.conversationId ?? context?.conversation_id);
      const contextUserId = this.payloadString(context?.userId ?? context?.user_id);
      const userId = contextUserId ?? this.resolveUserForEvent(context ?? {}, chatId) ?? this.lastFrontendUserId;
      if (!userId) return messages;
      if (!chatId) {
        const active = await getActiveChat(this.spindle, userId).catch(() => null);
        chatId = active?.chat.id ?? null;
      }
      if (!chatId) {
        this.diagnostics = {
          ...this.diagnostics,
          injectionReport: {
            enabled: false,
            registered: this.interceptorRegistered,
            available: false,
            mode: 'latest_plus_history',
            trackerCount: 0,
            historyCount: 0,
            estimatedTokens: 0,
            tokenBudget: 700,
            truncated: false,
            lastSkippedReason: 'Skipped prompt injection because no active chat id was available.',
          },
        };
        return messages;
      }

      const settings = await this.settingsService.load(userId);
      const activeForInjection = await getActiveChat(this.spindle, userId).catch(() => null);
      const activeInjectionMessage = activeForInjection?.chat.id === chatId
        ? latestAssistantMessage(activeForInjection.messages)
        : undefined;
      const injectionSwipeMap = activeForInjection?.chat.id === chatId
        ? activeSwipeByMessageId(activeForInjection.messages)
        : {};
      const latestTracker = await this.trackerService.getLatestForActive(
        userId,
        chatId,
        activeInjectionMessage?.id,
        activeInjectionMessage?.swipe_id,
      ).catch(() => null);
      const trackers = activeSwipeTrackers(await this.trackerService.listForChat(userId, chatId).catch(() => []), injectionSwipeMap);
      const { content, report } = buildContinuityInjection({
        settings,
        latestTracker,
        trackers,
        registered: this.interceptorRegistered,
        injectedAt: new Date().toISOString(),
      });
      report.latestTrackerAvailable = Boolean(latestTracker);
      report.activeMessageId = activeInjectionMessage?.id;
      report.activeSwipeId = activeInjectionMessage?.swipe_id;
      report.activeSwipeTrackerUsed = Boolean(
        latestTracker
        && activeInjectionMessage?.id
        && latestTracker.messageId === activeInjectionMessage.id
        && (typeof activeInjectionMessage.swipe_id !== 'number' || latestTracker.swipeId === activeInjectionMessage.swipe_id),
      );
      report.wrongSwipeFallbackAvoided = Boolean(
        activeInjectionMessage?.id
        && typeof activeInjectionMessage.swipe_id === 'number'
        && !latestTracker
        && trackers.some((tracker) => tracker.messageId === activeInjectionMessage.id && typeof tracker.swipeId === 'number'),
      );
      report.contextDepthSetting = settings.promptInjectionTrackerLimit ?? 5;
      report.storageRetentionSetting = settings.trackerHistoryLimit;
      report.historyCompactOnly = true;
      this.diagnostics = {
        ...this.diagnostics,
        injectionReport: report,
      };
      if (!content) return messages;

      const injectionMessage = {
        role: 'system',
        content,
        source: 'loom_keeper',
      };
      const firstNonSystem = messages.findIndex((message) => String(message.role || '').toLowerCase() !== 'system');
      if (firstNonSystem <= 0) return [injectionMessage, ...messages];
      return [
        ...messages.slice(0, firstNonSystem),
        injectionMessage,
        ...messages.slice(firstNonSystem),
      ];
    } catch (error) {
      this.recordRuntimeError('Prompt injection failed', error);
      return messages;
    }
  }

  private async buildState(userId: string): Promise<LoomFrontendState> {
    let [settings, permissions] = await Promise.all([
      this.settingsService.load(userId),
      getPermissionState(this.spindle).catch((error) => {
        this.recordRuntimeError('Permission lookup failed', error);
        return { chats: false, chat_mutation: false, generation: false, app_manipulation: false };
      }),
    ]);
    const presets = await this.presetService.loadAll(userId);
    const activePreset = await this.presetService.resolve(userId, settings.activePresetId);
    if (activePreset.id !== settings.activePresetId) {
      settings = await this.settingsService.save(userId, { activePresetId: activePreset.id });
    }
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
    const activeSwipeMap = activeSwipeByMessageId(active.messages);
    const activeAssistant = latestAssistantMessage(active.messages);
    const chatAssistantMessages = assistantMessageSummaries(active.messages);
    const connections = await this.generationService.listConnections(userId, permissions).catch((error) => {
      this.recordRuntimeError('Connection profile lookup failed', error);
      return [];
    });
    const [latestTracker, messageTrackers] = await Promise.all([
      this.trackerService.getLatestForActive(userId, activeChat.id, activeAssistant?.id, activeAssistant?.swipe_id).catch((error) => {
        this.recordRuntimeError('Latest tracker lookup failed', error);
        return null;
      }),
      this.trackerService.listForChat(userId, activeChat.id).catch((error) => {
        this.recordRuntimeError('Message tracker lookup failed', error);
        return [];
      }),
    ]);
    const activeMessageTrackers = activeSwipeTrackers(messageTrackers, activeSwipeMap);
    const injectionPreview = buildContinuityInjection({
      settings,
      latestTracker,
      trackers: activeMessageTrackers,
      registered: this.interceptorRegistered,
      skippedReason: this.interceptorRegistered ? undefined : 'Lumiverse interceptor API was not detected in this runtime.',
    }).report;
    injectionPreview.latestTrackerAvailable = Boolean(latestTracker);
    injectionPreview.activeMessageId = activeAssistant?.id;
    injectionPreview.activeSwipeId = activeAssistant?.swipe_id;
    injectionPreview.activeSwipeTrackerUsed = Boolean(
      latestTracker
      && activeAssistant?.id
      && latestTracker.messageId === activeAssistant.id
      && (typeof activeAssistant.swipe_id !== 'number' || latestTracker.swipeId === activeAssistant.swipe_id),
    );
    injectionPreview.wrongSwipeFallbackAvoided = Boolean(
      activeAssistant?.id
      && typeof activeAssistant.swipe_id === 'number'
      && !latestTracker
      && messageTrackers.some((tracker) => tracker.messageId === activeAssistant.id && typeof tracker.swipeId === 'number'),
    );
    injectionPreview.contextDepthSetting = settings.promptInjectionTrackerLimit ?? 5;
    injectionPreview.storageRetentionSetting = settings.trackerHistoryLimit;
    injectionPreview.historyCompactOnly = true;
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
      const activeSwipe = latestTracker.messageId ? activeSwipeMap[latestTracker.messageId] : undefined;
      if (trackedMsgIndex === -1) {
        isStale = true;
      } else if (typeof activeSwipe === 'number' && latestTracker.swipeId !== activeSwipe) {
        isStale = true;
      } else if (trackedMsgIndex < active.messages.length - 1) {
        isStale = true;
      }
    }
    const swipeCounts = countSwipeAlternatives(messageTrackers);
    const previousSwipeReport = this.diagnostics.swipeReport;
    const swipeReport: LoomSwipeReport = {
      activeMessageId: activeAssistant?.id,
      activeSwipeId: activeAssistant?.swipe_id,
      activeSwipeByMessageId: activeSwipeMap,
      storedSwipeTrackerCount: swipeCounts.stored,
      alternativeSwipeTrackerCount: swipeCounts.alternatives,
      cleanupLastRunAt: previousSwipeReport?.cleanupLastRunAt,
      cleanupRemovedCount: previousSwipeReport?.cleanupRemovedCount,
      cleanupKeptCount: previousSwipeReport?.cleanupKeptCount,
      cleanupWarning: previousSwipeReport?.cleanupWarning,
    };

    const diagnostics: LoomDiagnostics = {
      ...this.diagnostics,
      backendReady: true,
      lastParserError: this.diagnostics.lastParserError,
      lastGenerationError: this.diagnostics.lastGenerationError,
      storageWarning: this.diagnostics.storageWarning,
      lastRenderStatus: isStale
        ? (latestTracker?.messageId && typeof activeSwipeMap[latestTracker.messageId] === 'number' && latestTracker.swipeId !== activeSwipeMap[latestTracker.messageId]
          ? 'Current Loom state is Stale (active swipe changed).'
          : 'Current Loom state is Stale (new user or assistant messages have been added).')
        : this.diagnostics.lastRenderStatus,
      swipeReport,
    };
    const simulationNote = getSimulationMilestoneStatus();
    const entityNote = getEntityCaptureMilestoneStatus();
    const companionNote = getCompanionMilestoneStatus();
    const injectionNote = describeInjectionStatus(settings, permissions, this.interceptorRegistered);
    const lastInjectionReport = this.diagnostics.injectionReport;
    diagnostics.injectionReport = lastInjectionReport?.injectedAt && lastInjectionReport.chatId === activeChat.id
      ? {
        ...injectionPreview,
        injectedAt: lastInjectionReport.injectedAt,
        lastSkippedReason: lastInjectionReport.lastSkippedReason,
        registered: this.interceptorRegistered,
      }
      : injectionPreview;
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
      chatAssistantMessages,
      activeSwipeByMessageId: activeSwipeMap,
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
        this.recordStorageWarning('Loom Keeper storage was reset to defaults.');
        const state = await this.buildState(userId);
        await this.send(userId, { type: 'storage_reset', state });
        await this.send(userId, { type: 'toast', level: 'success', message: 'Loom Keeper storage was reset.' });
        return;
      }

      if (message.type === 'save_settings') {
        const settings = await this.settingsService.save(userId, message.settings);
        const active = await getActiveChat(this.spindle, userId).catch(() => null);
        const activeChatId = active?.chat?.id;
        const activeAssistant = active ? latestAssistantMessage(active.messages) : undefined;
        if (activeChatId && settings.trackerHistoryLimit > 0) {
          await this.trackerService.pruneChatHistory(userId, activeChatId, settings.trackerHistoryLimit, activeAssistant?.id);
        }
        await this.send(userId, { type: 'settings_saved', settings });
        await this.send(userId, { type: 'state', state: await this.buildState(userId) });
        return;
      }

      if (message.type === 'select_preset') {
        const settings = await this.settingsService.save(userId, { activePresetId: message.presetId });
        const active = await getActiveChat(this.spindle, userId).catch(() => null);
        const activeChatId = active?.chat?.id;
        const activeAssistant = active ? latestAssistantMessage(active.messages) : undefined;
        if (activeChatId && settings.trackerHistoryLimit > 0) {
          await this.trackerService.pruneChatHistory(userId, activeChatId, settings.trackerHistoryLimit, activeAssistant?.id);
        }
        await this.send(userId, { type: 'settings_saved', settings });
        await this.send(userId, { type: 'state', state: await this.buildState(userId) });
        return;
      }

      if (message.type === 'generate_tracker') {
        await this.generateTrackerForUser(userId, message.chatId, message.messageId, message.swipeId);
        return;
      }

      if (message.type === 'cancel_generation') {
        const cancelled = this.generationService.cancel(userId);
        if (cancelled) {
          await this.send(userId, { type: 'toast', level: 'info', message: 'Generation cancelled.' });
        } else {
          this.generationService.clearStuckState();
          await this.send(userId, { type: 'toast', level: 'info', message: 'Stuck generation state cleared.' });
        }
        const state = await this.buildState(userId);
        await this.send(userId, { type: 'state', state });
        return;
      }

      if (message.type === 'edit_tracker') {
        await this.saveManualTracker(userId, message.tracker);
        return;
      }

      if (message.type === 'delete_tracker') {
        await this.trackerService.delete(userId, message.chatId, message.messageId, message.swipeId);
        await this.send(userId, { type: 'tracker_deleted', state: await this.buildState(userId) });
        return;
      }

      if (message.type === 'hide_tracker') {
        const tracker = await this.trackerService.setHidden(userId, message.chatId, message.messageId, message.swipeId, message.hidden);
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
        const savedPreset = await this.presetService.save(userId, message.preset);
        if (message.makeActive) {
          await this.settingsService.save(userId, { activePresetId: savedPreset.id });
        }
        const state = await this.buildState(userId);
        await this.send(userId, { type: 'state', state });
        await this.send(userId, { type: 'toast', level: 'success', message: `Template '${savedPreset.name}' saved.` });
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
    swipeId?: number | undefined,
    targetOverride?: GenerationTarget | null,
  ): Promise<void> {
    try {
      const state = await this.buildState(userId);
      const target = targetOverride ?? await this.generationService.findLatestAssistantTarget(userId, chatId, messageId, swipeId);
      if (state.generation.disabledReason && state.generation.disabledReason !== 'No assistant message is available to track.') {
        await this.send(userId, { type: 'toast', level: 'error', message: `Generation blocked: ${state.generation.disabledReason}` });
        await this.send(userId, { type: 'tracker_error', message: state.generation.disabledReason, state });
        return;
      }

      if (!target) {
        const latestState = await this.buildState(userId);
        await this.send(userId, { type: 'toast', level: 'warning', message: 'No assistant message is available to track.' });
        await this.send(userId, { type: 'tracker_error', message: 'No assistant message is available to track.', state: latestState });
        return;
      }

      const settings = state.settings;
      const preset = state.activePreset;
      
      // Perform preset readiness checks before attempting generation
      const readiness = checkPresetReadiness(preset);
      if (!readiness.ready) {
        const blockerMsg = `Template '${preset.name}' (${preset.origin}) is not ready for generation: ${readiness.reasons.join(', ')}.`;
        await this.send(userId, { type: 'toast', level: 'error', message: blockerMsg });
        await this.send(userId, { type: 'tracker_error', message: blockerMsg, state });
        return;
      }

      // Send starting notification indicating backend received request and active preset details
      const swipeNum = target.message.swipe_id !== undefined ? target.message.swipe_id + 1 : 1;
      const startMsg = `Backend received generation request for Swipe ${swipeNum}. Active preset: '${preset.name}' (${preset.origin}). Schema: ${readiness.schemaValid ? 'Valid' : 'Invalid'}, Template: ${readiness.templateSafe ? 'Safe' : 'Unsafe'}.`;
      await this.send(userId, { type: 'toast', level: 'info', message: startMsg });

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
      const recentTrackers = activeSwipeTrackers(
        await this.trackerService.listForChat(userId, target.chatId),
        state.activeSwipeByMessageId,
      );
      const generationHistoryLimit = settings.trackerGenerationHistoryLimit ?? 5;
      const previousSummaries = recentTrackers
        .slice(1, 1 + Math.max(0, generationHistoryLimit))
        .map((t) => `${t.generatedAt}: ${t.compactSummary}`);
      const previousFullTrackerIncluded = Boolean(state.latestTracker);
      const estimatedSidecarPromptTokens = estimateTokens([
        preset.promptInstructions,
        JSON.stringify(preset.schemaJson),
        state.latestTracker ? JSON.stringify(state.latestTracker.data) : '',
        previousSummaries.join('\n'),
        target.recentContext,
        target.message.content || '',
      ].join('\n'));

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
          onProgress: async () => {
            try {
              const statePatch = await this.buildState(userId);
              await this.send(userId, { type: 'state', state: statePatch });
            } catch {
              // Ignored
            }
          }
        });

      await this.trackerService.save(userId, result.tracker, 0);
      const cleanup = await this.cleanupSwipeAlternatives(
        userId,
        target.chatId,
        settings.trackerHistoryLimit,
        target.message.id,
      );
      const retainedTrackers = await this.trackerService.listForChat(userId, target.chatId).catch(() => recentTrackers);
      await this.generationService.stripPassiveBlockIfAllowed({
        permissions: state.permissions,
        settings,
        userId,
        chatId: target.chatId,
        messageId: target.message.id,
        cleanedContent: result.cleanedContent,
      });

      // Construct and record Pipeline Report
      const presetSource = getPresetOrigin(preset);
      const completedAt = result.generationCompletedAt ?? result.tracker.generatedAt;
      const report: LoomPipelineReport = {
        activePresetId: preset.id,
        presetName: preset.name,
        presetSource,
        timestamp: completedAt,
        generationStartedAt: result.generationStartedAt ?? result.tracker.generatedAt,
        generationCompletedAt: completedAt,
        elapsedMs: result.elapsedMs,
        timeoutMs: result.timeoutMs ?? settings.sidecarGenerationTimeoutMs ?? 180000,
        previousFullTrackerIncluded,
        previousFullTrackerMessageId: state.latestTracker?.messageId,
        previousFullTrackerSwipeId: state.latestTracker?.swipeId,
        recentTrackerSummariesIncluded: previousSummaries.length,
        recentTrackerSummariesCompactOnly: true,
        recentChatContextIncluded: Boolean(target.recentContext),
        recentChatContextMessageCount: target.recentContextMessageCount,
        estimatedSidecarPromptTokens,
        worldInfoIncluded: false,
        worldInfoStatus: 'Not included: no stable Lumiverse world info/lorebook context API was detected in this runtime.',
        storageRetentionLimit: settings.trackerHistoryLimit,
        trackerGenerationHistoryLimit: generationHistoryLimit,
        promptInjectionTrackerLimit: settings.promptInjectionTrackerLimit ?? 5,
        rawResponseAvailable: Boolean(result.tracker.rawOutput),
        rawResponsePreview: previewRawOutput(result.tracker.rawOutput),
        parseSuccess: true,
        schemaValidationSuccess: result.tracker.validation.ok,
        schemaValidationIssues: result.tracker.validation.issues,
        renderSuccess: true, // Will be updated dynamically on frontend
        sanitizerRemovedContent: false, // Will be updated dynamically on frontend
        templateMode: settings.useSafeRenderer ? 'safe_generic' : (settings.customTemplateMode || 'trusted_layout'),
        preservedData: false,
        fallbackUsed: false, // Will be updated dynamically on frontend
        trackerPresetId: result.tracker.presetId,
        messageId: target.message.id || 'latest',
        swipeId: result.tracker.swipeId,
        chatId: target.chatId,
        hudView: settings.hudDefaultView,
        retainedCount: retainedTrackers.length,
      };

      const valError = result.tracker.validation.issues.filter(i => i.severity === 'error').map(i => i.message).join(', ');
      if (valError) {
        report.schemaValidationError = valError;
      }

      this.diagnostics = {
        ...this.diagnostics,
        lastParserError: undefined,
        lastGenerationError: undefined,
        pipelineReport: report,
        swipeReport: {
          activeMessageId: cleanup.activeMessageId,
          activeSwipeId: cleanup.activeSwipeId,
          activeSwipeByMessageId: cleanup.activeSwipeByMessageId,
          storedSwipeTrackerCount: countSwipeAlternatives(retainedTrackers).stored,
          alternativeSwipeTrackerCount: countSwipeAlternatives(retainedTrackers).alternatives,
          cleanupLastRunAt: cleanup.cleanupLastRunAt,
          cleanupRemovedCount: cleanup.cleanupRemovedCount,
          cleanupKeptCount: cleanup.cleanupKeptCount,
          cleanupWarning: cleanup.cleanupWarning,
        },
      };

      await this.send(userId, { type: 'tracker_generated', tracker: result.tracker, state: await this.buildState(userId) });
    } catch (error) {
      // Clear generation spinner running state
      this.generationService.clearStuckState();
      
      const message = error instanceof Error ? error.message : String(error);
      this.diagnostics = {
        ...this.diagnostics,
        lastGenerationError: message,
      };

      await this.send(userId, { type: 'toast', level: 'error', message: `Generation failed: ${message}` });
      await this.send(userId, { type: 'tracker_error', message: `Generation failed: ${message}`, state: await this.buildState(userId) });
      
      // Attempt to build a failed pipeline report to expose diagnostics
      try {
        const state = await this.buildState(userId);
        const preset = state.activePreset;
        const presetSource = getPresetOrigin(preset);
        const recentTrackers = chatId ? await this.trackerService.listForChat(userId, chatId).catch(() => []) : [];
        const generationFailure = error instanceof LoomGenerationFailure ? error : null;
        const rawOutput = generationFailure?.rawOutput;
        const generationHistoryLimit = state.settings.trackerGenerationHistoryLimit ?? 5;
        
        const report: LoomPipelineReport = {
          activePresetId: preset.id,
          presetName: preset.name,
          presetSource,
          timestamp: new Date().toISOString(),
          generationCompletedAt: new Date().toISOString(),
          timeoutMs: state.settings.sidecarGenerationTimeoutMs ?? 180000,
          previousFullTrackerIncluded: Boolean(state.latestTracker),
          previousFullTrackerMessageId: state.latestTracker?.messageId,
          previousFullTrackerSwipeId: state.latestTracker?.swipeId,
          recentTrackerSummariesIncluded: Math.min(Math.max(0, recentTrackers.length - 1), Math.max(0, generationHistoryLimit)),
          recentTrackerSummariesCompactOnly: true,
          recentChatContextIncluded: false,
          recentChatContextMessageCount: 0,
          estimatedSidecarPromptTokens: undefined,
          worldInfoIncluded: false,
          worldInfoStatus: 'Not included: no stable Lumiverse world info/lorebook context API was detected in this runtime.',
          storageRetentionLimit: state.settings.trackerHistoryLimit,
          trackerGenerationHistoryLimit: generationHistoryLimit,
          promptInjectionTrackerLimit: state.settings.promptInjectionTrackerLimit ?? 5,
          rawResponseAvailable: Boolean(rawOutput),
          rawResponsePreview: previewRawOutput(rawOutput),
          parseSuccess: false,
          parseFailureCategory: generationFailure?.parseFailureCategory ?? 'unknown',
          schemaValidationSuccess: false,
          renderSuccess: false,
          sanitizerRemovedContent: false,
          templateMode: state.settings.useSafeRenderer ? 'safe_generic' : (state.settings.customTemplateMode || 'trusted_layout'),
          preservedData: false,
          fallbackUsed: true,
          trackerPresetId: preset.id,
          messageId: messageId || 'latest',
          swipeId,
          chatId: chatId || 'unknown',
          hudView: state.settings.hudDefaultView,
          retainedCount: recentTrackers.length,
          lastError: message,
        };
        
        report.parseError = message;
        
        this.diagnostics.pipelineReport = report;
      } catch {
        // Ignored
      }
      
      const errorState = await this.buildState(userId);
      await this.send(userId, { type: 'tracker_error', message, state: errorState });
    }
  }

  private async cleanupSwipeAlternatives(
    userId: string,
    chatId: string,
    historyLimit: number,
    protectedMessageId?: string | undefined,
  ): Promise<LoomSwipeReport> {
    const active = await getActiveChat(this.spindle, userId).catch(() => null);
    const activeMessages = active?.chat.id === chatId ? active.messages : [];
    const activeSwipeMap = activeSwipeByMessageId(activeMessages);
    const activeAssistant = latestAssistantMessage(activeMessages);
    const protect = activeAssistant?.id ?? protectedMessageId;
    const cleanup = await this.trackerService.pruneInactiveSwipeAlternatives(userId, chatId, activeSwipeMap, protect);
    if (historyLimit > 0) {
      await this.trackerService.pruneChatHistory(userId, chatId, historyLimit, protect);
    }
    const trackers = await this.trackerService.listForChat(userId, chatId).catch(() => []);
    const counts = countSwipeAlternatives(trackers);
    return {
      activeMessageId: activeAssistant?.id,
      activeSwipeId: activeAssistant?.swipe_id,
      activeSwipeByMessageId: activeSwipeMap,
      storedSwipeTrackerCount: counts.stored,
      alternativeSwipeTrackerCount: counts.alternatives,
      cleanupLastRunAt: new Date().toISOString(),
      cleanupRemovedCount: cleanup.removedCount,
      cleanupKeptCount: cleanup.keptCount,
      cleanupWarning: cleanup.warning,
    };
  }

  private async saveManualTracker(userId: string, tracker: LoomTrackerState): Promise<void> {
    const preset: LoomPreset = await this.presetService.resolve(userId, tracker.presetId);
    const settings = await this.settingsService.load(userId);
    const validation = validateAgainstSchema(tracker.data, preset.schemaJson);
    const updated: LoomTrackerState = {
      ...tracker,
      generatedAt: new Date().toISOString(),
      source: 'manual_edit',
      validation,
      compactSummary: makeCompactSummary(tracker.data),
    };
    await this.trackerService.save(userId, updated, 0);
    await this.cleanupSwipeAlternatives(userId, updated.chatId, settings.trackerHistoryLimit, updated.messageId);
    await this.send(userId, { type: 'tracker_updated', tracker: updated, state: await this.buildState(userId) });
  }

  private async handleGenerationEnded(payload: unknown): Promise<void> {
    try {
      if (!isRecord(payload)) return;
      const source = payload.source ?? payload.extensionId ?? payload.extension_id;
      const generationType = payload.generationType ?? payload.generation_type;
      if (source === 'loom_keeper' || generationType === 'quiet') return;
      const chatId = this.payloadString(payload.chatId ?? payload.chat_id);
      const messageId = this.payloadString(payload.messageId ?? payload.message_id ?? payload.targetMessageId ?? payload.target_message_id) ?? undefined;
      const content = this.payloadString(payload.content) ?? undefined;
      const swipeId = this.payloadNumber(payload.swipeId ?? payload.swipe_id ?? payload.swipeIndex ?? payload.swipe_index);
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
          ? await this.generationService.findPayloadTarget({ userId, chatId, messageId, content, swipeId })
          : null;
        await this.generateTrackerForUser(userId, chatId ?? state.activeChat.id, messageId, swipeId, target);
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

  private payloadNumber(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return undefined;
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

const backend = new LoomKeeperBackend(getGlobalSpindle());
backend.setup();
