import { LOOM_VERSION, STORAGE_KEYS } from '../shared/defaults.js';
import type { LoomTrackerState } from '../shared/types.js';
import type { LoomSpindle } from './lumiverseApi.js';
import { getJsonWithRecovery, setJsonWithRecovery, type StorageWarningSink } from './storageRecovery.js';

interface StoredChatTrackers {
  latest?: LoomTrackerState;
  messages: Record<string, LoomTrackerState>;
}

type ChatTrackerIndex = Record<string, StoredChatTrackers>;

export interface LoomSwipeCleanupResult {
  removedCount: number;
  keptCount: number;
  warning?: string | undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function makeMessageKey(messageId?: string, swipeId?: number): string {
  const base = messageId || 'latest';
  return typeof swipeId === 'number' ? `${base}::swipe:${swipeId}` : base;
}

function sameMessage(tracker: LoomTrackerState, messageId?: string): boolean {
  return (tracker.messageId || 'latest') === (messageId || 'latest');
}

function newestTracker(trackers: LoomTrackerState[]): LoomTrackerState | undefined {
  return trackers
    .filter((tracker) => tracker.version === LOOM_VERSION)
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
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

  async getLatestForActive(
    userId: string,
    chatId: string | null,
    messageId?: string | undefined,
    swipeId?: number | undefined,
  ): Promise<LoomTrackerState | null> {
    if (!chatId) return null;
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return null;
    if (messageId) {
      if (typeof swipeId === 'number') {
        const exact = chat.messages[makeMessageKey(messageId, swipeId)];
        if (exact?.version === LOOM_VERSION) return exact;
        const sameMessageTrackers = Object.values(chat.messages).filter((tracker) => sameMessage(tracker, messageId));
        const hasSwipeAwareTracker = sameMessageTrackers.some((tracker) => typeof tracker.swipeId === 'number');
        if (hasSwipeAwareTracker) return null;
      }
      const matching = newestTracker(Object.values(chat.messages).filter((tracker) => sameMessage(tracker, messageId)));
      if (matching) return matching;
    }
    if (chat.latest?.version === LOOM_VERSION) return chat.latest;
    return newestTracker(Object.values(chat.messages)) ?? null;
  }

  async listForChat(userId: string, chatId: string | null): Promise<LoomTrackerState[]> {
    if (!chatId) return [];
    const index = await this.loadIndex(userId);
    return Object.values(index[chatId]?.messages ?? {})
      .filter((tracker) => tracker.version === LOOM_VERSION)
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
      .slice(0, 20);
  }

  async save(userId: string, tracker: LoomTrackerState, limit: number = 5): Promise<void> {
    const index = await this.loadIndex(userId);
    const existing = index[tracker.chatId] ?? { messages: {} };
    const key = makeMessageKey(tracker.messageId, tracker.swipeId);
    existing.messages[key] = tracker;
    existing.latest = tracker;
    index[tracker.chatId] = existing;
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);

    if (limit > 0) {
      await this.pruneChatHistory(userId, tracker.chatId, limit);
    }
  }

  async pruneChatHistory(
    userId: string,
    chatId: string | null,
    limit: number,
    protectedMessageId?: string | undefined,
  ): Promise<void> {
    if (!chatId || limit <= 0) return;
    const index = await this.loadIndex(userId);
    const existing = index[chatId];
    if (!existing || !existing.messages) return;

    const allTrackers = Object.entries(existing.messages)
      .map(([k, t]) => ({ k, t }))
      .sort((a, b) => b.t.generatedAt.localeCompare(a.t.generatedAt));

    if (allTrackers.length > limit) {
      const kept = allTrackers.slice(0, limit);
      const keptKeys = new Set(kept.map((item) => item.k));

      // Always protect the latest Current Loom tracker state
      if (existing.latest) {
        keptKeys.add(makeMessageKey(existing.latest.messageId, existing.latest.swipeId));
      }
      if (protectedMessageId) {
        for (const [key, tracker] of Object.entries(existing.messages)) {
          if (sameMessage(tracker, protectedMessageId)) keptKeys.add(key);
        }
      }

      const newMessages: Record<string, LoomTrackerState> = {};
      for (const [k, t] of Object.entries(existing.messages)) {
        if (keptKeys.has(k)) {
          newMessages[k] = t;
        }
      }
      existing.messages = newMessages;
      index[chatId] = existing;
      await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
    }
  }

  async pruneInactiveSwipeAlternatives(
    userId: string,
    chatId: string | null,
    activeSwipeByMessageId: Record<string, number>,
    protectedMessageId?: string | undefined,
  ): Promise<LoomSwipeCleanupResult> {
    if (!chatId) return { removedCount: 0, keptCount: 0 };
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return { removedCount: 0, keptCount: 0 };

    const groups = new Map<string, Array<{ key: string; tracker: LoomTrackerState }>>();
    for (const [key, tracker] of Object.entries(chat.messages)) {
      if (!tracker.messageId || tracker.version !== LOOM_VERSION) continue;
      const group = groups.get(tracker.messageId) ?? [];
      group.push({ key, tracker });
      groups.set(tracker.messageId, group);
    }

    const keptKeys = new Set<string>();
    let removedCount = 0;
    let warning: string | undefined;

    for (const [messageId, items] of groups) {
      if (items.length <= 1) {
        keptKeys.add(items[0].key);
        continue;
      }
      if (messageId === protectedMessageId) {
        for (const item of items) keptKeys.add(item.key);
        continue;
      }

      const activeSwipe = activeSwipeByMessageId[messageId];
      const exact = typeof activeSwipe === 'number'
        ? items.find((item) => item.tracker.swipeId === activeSwipe)
        : undefined;
      const keeper = exact ?? items.sort((a, b) => b.tracker.generatedAt.localeCompare(a.tracker.generatedAt))[0];
      if (!exact) {
        warning = warning || `Active swipe could not be determined for message ${messageId}; kept newest tracker.`;
      }
      keptKeys.add(keeper.key);
      removedCount += items.filter((item) => item.key !== keeper.key).length;
    }

    if (removedCount === 0) {
      return { removedCount: 0, keptCount: Object.keys(chat.messages).length, warning };
    }

    const nextMessages: Record<string, LoomTrackerState> = {};
    for (const [key, tracker] of Object.entries(chat.messages)) {
      const grouped = tracker.messageId ? groups.get(tracker.messageId) : undefined;
      if (!grouped || grouped.length <= 1 || keptKeys.has(key)) {
        nextMessages[key] = tracker;
      }
    }
    chat.messages = nextMessages;
    if (chat.latest) {
      const latestKey = makeMessageKey(chat.latest.messageId, chat.latest.swipeId);
      if (!chat.messages[latestKey]) {
        const nextLatest = newestTracker(Object.values(chat.messages));
        if (nextLatest) chat.latest = nextLatest;
        else delete chat.latest;
      }
    }
    index[chatId] = chat;
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
    return { removedCount, keptCount: Object.keys(chat.messages).length, warning };
  }

  async delete(userId: string, chatId: string, messageId?: string, swipeId?: number): Promise<void> {
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return;
    if (messageId) {
      if (typeof swipeId === 'number') {
        delete chat.messages[makeMessageKey(messageId, swipeId)];
      } else {
        for (const [key, tracker] of Object.entries(chat.messages)) {
          if (sameMessage(tracker, messageId)) delete chat.messages[key];
        }
      }
      if (chat.latest?.messageId === messageId && (typeof swipeId !== 'number' || chat.latest.swipeId === swipeId)) {
        const nextLatest = newestTracker(Object.values(chat.messages));
        if (nextLatest) chat.latest = nextLatest;
        else delete chat.latest;
      }
    } else {
      delete index[chatId];
    }
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
  }

  async setHidden(
    userId: string,
    chatId: string,
    messageId: string | undefined,
    swipeId: number | undefined,
    hidden: boolean,
  ): Promise<LoomTrackerState | null> {
    const index = await this.loadIndex(userId);
    const chat = index[chatId];
    if (!chat) return null;
    const key = makeMessageKey(messageId, swipeId);
    const tracker = messageId
      ? (typeof swipeId === 'number'
        ? chat.messages[key]
        : newestTracker(Object.values(chat.messages).filter((candidate) => sameMessage(candidate, messageId))))
      : chat.latest;
    if (!tracker) return null;
    const updated: LoomTrackerState = { ...tracker, hidden, placement: hidden ? 'hidden' : tracker.placement };
    const updatedKey = makeMessageKey(updated.messageId, updated.swipeId);
    if (messageId) chat.messages[updatedKey] = updated;
    if (!messageId || (chat.latest?.messageId === updated.messageId && chat.latest?.swipeId === updated.swipeId)) chat.latest = updated;
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, index);
    return updated;
  }

  async reset(userId: string): Promise<void> {
    await setJsonWithRecovery(this.spindle, STORAGE_KEYS.trackerStates, userId, {});
  }
}
