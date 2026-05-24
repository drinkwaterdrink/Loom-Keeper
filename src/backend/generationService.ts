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
  private status: LoomGenerationStatus = { running: false };

  constructor(private readonly spindle: LoomSpindle) {}

  getStatus(): LoomGenerationStatus {
    return { ...this.status };
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
      placement: input.settings.defaultPlacement === 'disabled' ? 'hidden' : input.settings.defaultPlacement,
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
    chatId: string;
    message: LoomChatMessage;
    recentContext: string;
  }): Promise<GenerationResult> {
    const messageId = input.message.id || 'latest';
    const key = `${input.chatId}:${messageId}:${input.message.swipe_id ?? 'main'}`;
    if (this.runningKeys.has(key)) throw new Error('Generation already running for this message.');
    this.runningKeys.add(key);
    this.status = { running: true, message: 'Generating tracker...' };
    try {
      const prompt = buildTrackerPrompt({
        preset: input.preset,
        latestAssistantMessage: input.message.content || '',
        previousTracker: input.previousTracker,
        recentContext: input.recentContext,
      });
      const raw = await runSidecarGeneration(this.spindle, input.userId, prompt, input.settings.sidecarConnectionId);
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
        placement: input.settings.defaultPlacement === 'disabled' ? 'hidden' : input.settings.defaultPlacement,
        data,
        compactSummary: makeCompactSummary(data),
        validation,
        rawOutput: raw,
      };
      return { tracker };
    } finally {
      this.runningKeys.delete(key);
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
