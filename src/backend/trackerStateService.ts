import { LOOM_VERSION, STORAGE_KEYS } from '../shared/defaults.js';
import type { LoomTrackerState } from '../shared/types.js';
import type { LoomSpindle } from './lumiverseApi.js';
import { getJsonWithRecovery, setJsonWithRecovery, type StorageWarningSink } from './storageRecovery.js';

interface StoredChatTrackers {
  latest?: LoomTrackerState;
  messages: Record<string, LoomTrackerState>;
}

type ChatTrackerIndex = Record<string, StoredChatTrackers>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function makeMessageKey(messageId?: string, swipeId?: number): string {
  const base = messageId || 'latest';
  return typeof swipeId === 'number' ? `${base}::swipe:${swipeId}` : base;
}

function normalizeIndex(value: unknown): ChatTrackerIndex {
  if (!isRecord(value)) return {};
  const index: ChatTrackerIndex = {};
  for (const [chatId, chatValue] of Object.entries(value)) {
    if (!isRecord(chatValue)) continue;
    const messages = isRecord(chatValue.messages) ? chatValue.messages as unknown as Record<string, LoomTrackerState> : {};
    const latest = isRecord(chatValue.latest) ? chatValue.latest as unknown as LoomTrackerState : undefined;
    index[chatId] = { messages };
    if (latest) index[chatId].latest = latest;
  }
  return index;
}

export class LoomTrackerStateService {
  constructor(
    private readonly spindle: LoomSpindle,
    private readonly onStorageWarning?: StorageWarningSink,
  ) {}

  async loadIndex(userId: string): Promise<ChatTrackerIndex> {
    const stored = await getJsonWithRecovery<ChatTrackerIndex>(
      this.spindle,
      STORAGE_KEYS.trackerStates,
      userId,
      {},
      this.onStorageWarning,
    );
    return normalizeIndex(stored);
  }

  async getLatest(userId: string, chatId: string | null): Promise<LoomTrackerState | null> {
    if (!chatId) return null;
    const index = await this.loadIndex(userId);
    return index[chatId]?.latest ?? null;
  }

  async listForChat(userId: string, chatId: string | null): Promise<LoomTrackerState[]> {
    if (!chatId) return [];
    const index = await this.loadIndex(userId);
    return Object.values(index[chatId]?.messages ?? {})
      .filter((tracker) => tracker.version === LOOM_VERSION)
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
      .slice(0, 20);
  }

  async save(userId: string, tracker: LoomTrackerState): Promise<void> {
    const index = await this.loadIndex(userId);
    const existing = index[tracker.chatId] ?? { messages: {} };
    const key = makeMessageKey(tracker.messageId, tracker.swipeId);
    existing.messages[key] = tracker;
    existing.latest = tracker;
    index[tracker.chatId] = existing;
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
  }

  async delete(userId: string, chatId: string, messageId?: string): Promise<void> {
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return;
    if (messageId) {
      delete chat.messages[makeMessageKey(messageId)];
      if (chat.latest?.messageId === messageId) {
        chat.latest = Object.values(chat.messages).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
      }
    } else {
      delete index[chatId];
    }
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
  }

  async setHidden(userId: string, chatId: string, messageId: string | undefined, hidden: boolean): Promise<LoomTrackerState | null> {
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return null;
    const key = makeMessageKey(messageId);
    const tracker = messageId ? chat.messages[key] : chat.latest;
    if (!tracker) return null;
    const updated: LoomTrackerState = { ...tracker, hidden, placement: hidden ? 'hidden' : tracker.placement };
    if (messageId) chat.messages[key] = updated;
    if (!messageId || chat.latest?.messageId === messageId) chat.latest = updated;
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
    return updated;
  }

  async reset(userId: string): Promise<void> {
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, {});
  }
}
