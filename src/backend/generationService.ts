import { LOOM_SCHEMA_VERSION, LOOM_VERSION } from '../shared/defaults.js';
import { extractTrackerBlock, parseJsonObject } from '../shared/parser.js';
import { buildTrackerPrompt } from '../shared/prompts.js';
import { makeCompactSummary } from '../shared/renderer.js';
import type {
  LoomChatMessage,
  LoomConnectionProfile,
  LoomGenerationStatus,
  LoomPermissionState,
  LoomPreset,
  LoomSettings,
  LoomTrackerState,
} from '../shared/types.js';
import { validateAgainstSchema } from '../shared/validation.js';
import {
  getActiveChat,
  getChatMessages,
  listConnectionProfiles,
  runSidecarGeneration,
  updateMessageContent,
  type LoomSpindle,
} from './lumiverseApi.js';

export interface GenerationTarget {
  chatId: string;
  message: LoomChatMessage;
  recentContext: string;
}

export interface GenerationResult {
  tracker: LoomTrackerState;
  cleanedContent?: string | undefined;
}

export class LoomGenerationService {
  private readonly runningKeys = new Set<string>();
  private readonly activeGenerations = new Map<string, () => void>();
  private status: LoomGenerationStatus = { running: false };

  constructor(private readonly spindle: LoomSpindle) {}

  getStatus(): LoomGenerationStatus {
    return { ...this.status };
  }

  cancel(userId: string): boolean {
    const cancelFn = this.activeGenerations.get(userId);
    if (cancelFn) {
      cancelFn();
      return true;
    }
    return false;
  }

  clearStuckState(): void {
    this.runningKeys.clear();
    this.activeGenerations.clear();
    this.status = { running: false };
  }

  async listConnections(userId: string, permissions: LoomPermissionState): Promise<LoomConnectionProfile[]> {
    if (!permissions.generation) return [];
    return listConnectionProfiles(this.spindle, userId);
  }

  getDisabledReason(input: {
    settings: LoomSettings;
    permissions: LoomPermissionState;
    activeChatId: string | null;
    activePreset: LoomPreset | null;
    connections: LoomConnectionProfile[];
  }): string | undefined {
    if (!input.settings.enabled) return 'State of the Loom is disabled.';
    if (!input.activeChatId) return 'No active chat.';
    if (!input.activePreset) return 'No active preset.';
    if (this.status.running) return 'Generation already running.';
    if (!input.permissions.chat_mutation) return 'Missing chat mutation permission; cannot read chat messages.';
    const needsSidecarOnly = input.activePreset.mode === 'sidecar_generate';
    if (!input.permissions.generation && needsSidecarOnly) return 'Missing generation permission.';
    if (
      input.permissions.generation
      && !input.settings.useDefaultConnectionFallback
      && !input.settings.sidecarConnectionId
    ) {
      return 'No sidecar connection profile selected.';
    }
    if (
      input.settings.sidecarConnectionId
      && input.connections.length > 0
      && !input.connections.some((connection) => connection.id === input.settings.sidecarConnectionId)
    ) {
      return 'Selected sidecar connection profile is unavailable.';
    }
    return undefined;
  }

  async findLatestAssistantTarget(userId: string, requestedChatId?: string | null, requestedMessageId?: string): Promise<GenerationTarget | null> {
    const { chat, messages } = await getActiveChat(this.spindle, userId);
    const chatId = requestedChatId || chat.id;
    if (!chatId) return null;
    const assistantMessages = messages.filter((message) => {
      const role = (message.role || '').toLowerCase();
      return role === 'assistant' || role === 'model' || role === 'ai' || (!role && Boolean(message.content));
    });
    const selected = requestedMessageId
      ? assistantMessages.find((message) => message.id === requestedMessageId)
      : assistantMessages[assistantMessages.length - 1];
    if (!selected || !selected.content) return null;
    const context = messages.slice(Math.max(0, messages.length - 8)).map((message) => {
      const role = message.role || 'message';
      return `${role}: ${message.content || ''}`;
    }).join('\n\n');
    return { chatId, message: selected, recentContext: context };
  }

  async findPayloadTarget(input: {
    userId: string;
    chatId: string;
    messageId?: string | undefined;
    content?: string | undefined;
  }): Promise<GenerationTarget | null> {
    if (!input.chatId) return null;
    const messages = await getChatMessages(this.spindle, input.chatId, input.userId);
    const selected = input.messageId
      ? messages.find((message) => message.id === input.messageId)
      : null;
    const message = selected ?? {
      id: input.messageId,
      role: 'assistant',
      content: input.content || '',
    };
    if (!message.content) return null;
    const contextMessages = messages.length > 0 ? messages : [message];
    const recentContext = contextMessages.slice(Math.max(0, contextMessages.length - 8)).map((item) => {
      const role = item.role || 'message';
      return `${role}: ${item.content || ''}`;
    }).join('\n\n');
    return { chatId: input.chatId, message, recentContext };
  }

  tryPassiveExtract(input: {
    preset: LoomPreset;
    settings: LoomSettings;
    chatId: string;
    message: LoomChatMessage;
  }): GenerationResult | null {
    const parse = extractTrackerBlock(input.message.content || '', input.preset.parserOptions.fenceNames);
    if (!parse.found || !parse.data) return null;
    const validation = validateAgainstSchema(parse.data, input.preset.schemaJson);
    const tracker: LoomTrackerState = {
      version: LOOM_VERSION,
      schemaVersion: String(parse.data.schemaVersion || LOOM_SCHEMA_VERSION),
      presetId: input.preset.id,
      chatId: input.chatId,
      messageId: input.message.id,
      swipeId: input.message.swipe_id,
      generatedAt: new Date().toISOString(),
      source: 'passive_extract',
      placement: input.settings.messageCardPlacement || 'top',
      data: parse.data,
      compactSummary: makeCompactSummary(parse.data),
      validation,
      rawOutput: parse.rawBlock,
    };
    return {
      tracker,
      cleanedContent: parse.cleanedContent,
    };
  }

  async generateSidecar(input: {
    userId: string;
    settings: LoomSettings;
    preset: LoomPreset;
    previousTracker: LoomTrackerState | null;
    previousSummaries?: string[] | undefined;
    chatId: string;
    message: LoomChatMessage;
    recentContext: string;
    onProgress?: (() => void) | undefined;
  }): Promise<GenerationResult> {
    const messageId = input.message.id || 'latest';
    const key = `${input.chatId}:${messageId}:${input.message.swipe_id ?? 'main'}`;
    if (this.runningKeys.has(key)) throw new Error('Generation already running for this message.');
    this.runningKeys.add(key);

    const startTime = Date.now();
    this.status = { running: true, message: 'Generating tracker... 0s' };

    let elapsedTimer: any;
    let timeoutTimer: any;

    try {
      const prompt = buildTrackerPrompt({
        preset: input.preset,
        latestAssistantMessage: input.message.content || '',
        previousTracker: input.previousTracker,
        previousSummaries: input.previousSummaries,
        recentContext: input.recentContext,
      });

      // 1. Configurable Timeout setup
      const timeoutMs = typeof input.settings.sidecarGenerationTimeoutMs === 'number'
        ? input.settings.sidecarGenerationTimeoutMs
        : 180000; // Default 180 seconds (3 minutes)

      const timeoutPromise = new Promise<never>((_, reject) => {
        if (timeoutMs > 0) {
          timeoutTimer = setTimeout(() => {
            reject(new Error(`Generation timed out after ${timeoutMs / 1000} seconds.`));
          }, timeoutMs);
        }
      });

      // 2. Cancellation setup
      let cancelFn: (() => void) | undefined;
      const cancelPromise = new Promise<never>((_, reject) => {
        cancelFn = () => reject(new Error('Generation cancelled by user.'));
      });
      this.activeGenerations.set(input.userId, cancelFn!);

      // 3. Elapsed Time Interval setup
      elapsedTimer = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
        let timeStr = `${elapsedSec}s`;
        if (elapsedSec >= 60) {
          const min = Math.floor(elapsedSec / 60);
          const sec = elapsedSec % 60;
          timeStr = `${min}m ${sec}s`;
        }
        this.status = { running: true, message: `Generating tracker... ${timeStr}` };
        if (input.onProgress) {
          try {
            input.onProgress();
          } catch {
            // Ignored
          }
        }
      }, 1000);

      const generationPromise = runSidecarGeneration(this.spindle, input.userId, prompt, input.settings.sidecarConnectionId);

      const raw = await Promise.race([
        generationPromise,
        timeoutPromise,
        cancelPromise
      ]);

      if (elapsedTimer) clearInterval(elapsedTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);

      const data = parseJsonObject(raw);
      const validation = validateAgainstSchema(data, input.preset.schemaJson);
      const tracker: LoomTrackerState = {
        version: LOOM_VERSION,
        schemaVersion: String(data.schemaVersion || LOOM_SCHEMA_VERSION),
        presetId: input.preset.id,
        chatId: input.chatId,
        messageId: input.message.id,
        swipeId: input.message.swipe_id,
        generatedAt: new Date().toISOString(),
        source: 'sidecar_generate',
        placement: input.settings.messageCardPlacement || 'top',
        data,
        compactSummary: makeCompactSummary(data),
        validation,
        rawOutput: raw,
      };
      return { tracker };
    } finally {
      if (elapsedTimer) clearInterval(elapsedTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      this.runningKeys.delete(key);
      this.activeGenerations.delete(input.userId);
      this.status = { running: false };
    }
  }

  async stripPassiveBlockIfAllowed(input: {
    permissions: LoomPermissionState;
    settings: LoomSettings;
    userId: string;
    chatId: string;
    messageId?: string | undefined;
    cleanedContent?: string | undefined;
  }): Promise<boolean> {
    if (!input.permissions.chat_mutation || !input.settings.stripTrackerBlocksFromMessages) return false;
    if (!input.messageId || input.cleanedContent === undefined) return false;
    return updateMessageContent(this.spindle, input.chatId, input.messageId, input.cleanedContent, input.userId);
  }
}
