import type {
  LoomActiveChatState,
  LoomChatMessage,
  LoomConnectionProfile,
  LoomPermissionState,
} from '../shared/types.js';

type AnyRecord = Record<string, unknown>;

export type LoomSpindle = AnyRecord & {
  sendToFrontend?: (message: unknown, userId?: string) => void | Promise<void>;
  onFrontendMessage?: (handler: (message: unknown, userId?: string) => void | Promise<void>) => void | (() => void);
  on?: (eventName: string, handler: (payload?: unknown) => void | Promise<void>) => void | (() => void);
  log?: {
    info?: (message: string) => void;
    warn?: (message: string) => void;
    error?: (message: string) => void;
  };
  userStorage?: {
    getJson?: (key: string, options?: AnyRecord) => Promise<unknown>;
    setJson?: (key: string, value: unknown, options?: AnyRecord) => Promise<void>;
    remove?: (key: string, options?: AnyRecord) => Promise<void>;
  };
  chat?: AnyRecord;
  chats?: AnyRecord;
  generate?: AnyRecord;
  generation?: AnyRecord;
  connections?: AnyRecord;
  frontend?: {
    send?: (message: unknown, options?: AnyRecord) => void | Promise<void>;
    sendToFrontend?: (message: unknown, userId?: string) => void | Promise<void>;
    onMessage?: (handler: (message: unknown, meta?: AnyRecord) => void | Promise<void>) => void | (() => void);
  };
  permissions?: {
    has?: (permission: string, options?: AnyRecord) => boolean | Promise<boolean>;
    getGranted?: () => string[] | Promise<string[]>;
    onChanged?: (handler: () => void | Promise<void>) => void | (() => void);
  };
  events?: {
    on?: (eventName: string, handler: (payload?: unknown) => void | Promise<void>) => void | (() => void);
  };
};

declare const spindle: LoomSpindle | undefined;

export function getGlobalSpindle(): LoomSpindle {
  if (typeof spindle !== 'undefined' && spindle && typeof spindle === 'object') return spindle;
  const globalValue = globalThis as unknown as AnyRecord;
  const candidate = globalValue.spindle ?? globalValue.lumiverseSpindle;
  if (candidate && typeof candidate === 'object') return candidate as LoomSpindle;
  return {};
}

export function getSenderUserId(meta?: AnyRecord): string {
  const direct = meta?.userId ?? meta?.user_id ?? meta?.senderUserId;
  return typeof direct === 'string' && direct.trim() ? direct : 'default';
}

export async function hasPermission(spindle: LoomSpindle, permission: keyof LoomPermissionState): Promise<boolean> {
  const api = spindle.permissions;
  if (!api) return false;
  if (typeof api.has === 'function') {
    try {
      return Boolean(await api.has(permission));
    } catch {
      return false;
    }
  }
  if (typeof api.getGranted === 'function') {
    try {
      return (await api.getGranted()).includes(permission);
    } catch {
      return false;
    }
  }
  return false;
}

export async function getPermissionState(spindle: LoomSpindle): Promise<LoomPermissionState> {
  const [chats, chatMutation, generation, appManipulation] = await Promise.all([
    hasPermission(spindle, 'chats'),
    hasPermission(spindle, 'chat_mutation'),
    hasPermission(spindle, 'generation'),
    hasPermission(spindle, 'app_manipulation' as keyof LoomPermissionState),
  ]);
  return {
    chats,
    chat_mutation: chatMutation,
    generation,
    app_manipulation: appManipulation,
  };
}

function asRecord(value: unknown): AnyRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as AnyRecord : null;
}

function asMessageArray(value: unknown): LoomChatMessage[] {
  const recordValue = asRecord(value);
  const source = Array.isArray(value)
    ? value
    : Array.isArray(recordValue?.messages)
      ? recordValue.messages as unknown[]
      : Array.isArray(recordValue?.data)
        ? recordValue.data as unknown[]
        : [];
  return source.map((item, index) => {
    const record = asRecord(item) ?? {};
    const swipes = Array.isArray(record.swipes) ? record.swipes : [];
    const swipeId = typeof record.swipe_id === 'number'
      ? record.swipe_id
      : typeof record.swipeId === 'number'
        ? record.swipeId
        : 0;
    const activeSwipe = typeof swipes[swipeId] === 'string' ? swipes[swipeId] : undefined;
    const content = record.content ?? activeSwipe ?? record.text ?? record.message;
    const role = record.role ?? record.sender ?? record.type;
    const id = record.id ?? record.messageId ?? record.message_id ?? String(index);
    const metadata = asRecord(record.metadata) ?? undefined;
    const swipe = record.swipeId ?? record.swipe_id;
    const normalized: LoomChatMessage = {
      id: typeof id === 'string' || typeof id === 'number' ? String(id) : String(index),
      role: typeof role === 'string' ? role : undefined,
      content: typeof content === 'string' ? content : '',
    };
    if (metadata) normalized.metadata = metadata;
    if (typeof swipe === 'number') normalized.swipe_id = swipe;
    return normalized;
  });
}

export async function sendFrontend(spindle: LoomSpindle, userId: string, message: unknown): Promise<void> {
  if (typeof spindle.sendToFrontend === 'function') {
    await spindle.sendToFrontend(message, userId);
    return;
  }
  const frontend = spindle.frontend;
  if (frontend?.sendToFrontend) {
    await frontend.sendToFrontend(message, userId);
    return;
  }
  if (frontend?.send) await frontend.send(message, { userId });
}

export function onFrontendMessage(
  spindle: LoomSpindle,
  handler: (message: unknown, userId: string) => void | Promise<void>,
): (() => void) | undefined {
  if (typeof spindle.onFrontendMessage === 'function') {
    const unsubscribe = spindle.onFrontendMessage(async (message, userId) => {
      await handler(message, typeof userId === 'string' ? userId : 'default');
    });
    return typeof unsubscribe === 'function' ? unsubscribe : undefined;
  }
  if (!spindle.frontend?.onMessage) return undefined;
  const unsubscribe = spindle.frontend.onMessage(async (message, meta) => {
    await handler(message, getSenderUserId(meta));
  });
  return typeof unsubscribe === 'function' ? unsubscribe : undefined;
}

async function tryCall<T>(fn: unknown, args: unknown[][]): Promise<T | null> {
  if (typeof fn !== 'function') return null;
  for (const callArgs of args) {
    try {
      const value = await (fn as (...values: unknown[]) => Promise<T> | T)(...callArgs);
      if (value !== undefined && value !== null) return value;
    } catch {
      // Capability probes are expected to fail across Lumiverse versions.
    }
  }
  return null;
}

export async function getActiveChat(spindle: LoomSpindle, userId: string): Promise<{ chat: LoomActiveChatState; messages: LoomChatMessage[] }> {
  const chatsApi = asRecord(spindle.chats) ?? {};
  const legacyChatApi = asRecord(spindle.chat) ?? {};
  const active = await tryCall<unknown>(chatsApi.getActive ?? chatsApi.getCurrent ?? chatsApi.active, [
    [{ userId }],
    [userId],
    [],
  ]) ?? await tryCall<unknown>(legacyChatApi.getActive ?? legacyChatApi.getCurrent ?? legacyChatApi.active, [
    [{ userId }],
    [userId],
    [],
  ]);
  const activeRecord = asRecord(active);
  const chatId = activeRecord?.id ?? activeRecord?.chatId ?? activeRecord?.chat_id;
  const chatName = activeRecord?.name ?? activeRecord?.title ?? activeRecord?.label;
  const chat: LoomActiveChatState = {
    id: typeof chatId === 'string' || typeof chatId === 'number' ? String(chatId) : null,
    name: typeof chatName === 'string' ? chatName : '',
  };
  if (!chat.id) return { chat, messages: asMessageArray(activeRecord?.messages) };
  const messages = await getChatMessages(spindle, chat.id, userId);
  if (messages.length > 0) return { chat, messages };
  return { chat, messages: asMessageArray(activeRecord?.messages) };
}

export async function getChatMessages(spindle: LoomSpindle, chatId: string, userId: string): Promise<LoomChatMessage[]> {
  const chatApi = asRecord(spindle.chat) ?? {};
  const chatsApi = asRecord(spindle.chats) ?? {};
  const messages = await tryCall<unknown>(chatApi.getMessages ?? chatApi.messages ?? chatApi.listMessages, [
    [chatId, { userId }],
    [{ chatId, userId }],
    [chatId],
  ]).catch(() => null);
  if (messages !== null) return asMessageArray(messages);
  const fallback = await tryCall<unknown>(chatsApi.getMessages ?? chatsApi.messages ?? chatsApi.listMessages, [
    [chatId, { userId }],
    [{ chatId, userId }],
    [chatId],
  ]);
  return asMessageArray(fallback);
}

export async function listConnectionProfiles(spindle: LoomSpindle, userId: string): Promise<LoomConnectionProfile[]> {
  const connectionsApi = asRecord(spindle.connections) ?? {};
  const generationApi = asRecord(spindle.generate) ?? asRecord(spindle.generation) ?? {};
  const raw = await tryCall<unknown>(
    connectionsApi.list
      ?? connectionsApi.getAll
      ?? generationApi.listConnectionProfiles
      ?? generationApi.getConnectionProfiles
      ?? generationApi.listConnections,
    [
      [{ userId }],
      [userId],
      [],
    ],
  );
  const list = Array.isArray(raw) ? raw : Array.isArray(asRecord(raw)?.profiles) ? asRecord(raw)?.profiles as unknown[] : [];
  return list.map((item, index) => {
    const record = asRecord(item) ?? {};
    const id = record.id ?? record.connectionId ?? record.connection_id ?? record.name ?? String(index);
    const name = record.name ?? record.label ?? record.displayName ?? id;
    const provider = record.provider ?? record.providerName;
    const model = record.model ?? record.modelName ?? record.selectedModel;
    const isDefault = record.is_default ?? record.isDefault ?? record.default;
    const hasApiKey = record.has_api_key ?? record.hasApiKey;
    const profile: LoomConnectionProfile = {
      id: String(id),
      name: String(name),
    };
    if (typeof provider === 'string') profile.provider = provider;
    if (typeof model === 'string') profile.model = model;
    if (typeof isDefault === 'boolean') profile.is_default = isDefault;
    if (typeof hasApiKey === 'boolean') profile.has_api_key = hasApiKey;
    return profile;
  });
}

export async function runSidecarGeneration(
  spindle: LoomSpindle,
  userId: string,
  messages: Array<{ role: 'system' | 'user'; content: string }>,
  connectionId?: string,
): Promise<string> {
  const generationApi = asRecord(spindle.generate) ?? asRecord(spindle.generation) ?? {};
  const payload: AnyRecord = {
    messages,
    internal: true,
    source: 'state_of_the_loom',
    reasoning: 'off',
    userId,
  };
  if (connectionId) payload.connectionId = connectionId;
  if (connectionId) payload.connection_id = connectionId;
  if (connectionId) payload.connectionProfileId = connectionId;
  const response = await tryCall<unknown>(
    generationApi.quiet
      ?? generationApi.generate
      ?? generationApi.create
      ?? generationApi.complete
      ?? generationApi.run,
    [
      [payload],
      [payload, { userId }],
      [{ ...payload, userId }],
      [messages, { userId, connectionId }],
    ],
  );
  const record = asRecord(response);
  const content = record?.content
    ?? record?.text
    ?? record?.message
    ?? record?.output
    ?? record?.response
    ?? response;
  if (typeof content !== 'string') throw new Error('Generation API did not return text content.');
  return content;
}

export async function updateMessageContent(
  spindle: LoomSpindle,
  chatId: string,
  messageId: string,
  content: string,
  userId: string,
): Promise<boolean> {
  const chatApi = asRecord(spindle.chat) ?? {};
  const chatsApi = asRecord(spindle.chats) ?? {};
  const result = await tryCall<unknown>(chatApi.updateMessage ?? chatApi.editMessage ?? chatApi.setMessageContent, [
    [chatId, messageId, { content, userId }],
    [{ chatId, messageId, content, userId }],
    [messageId, content],
  ]) ?? await tryCall<unknown>(chatsApi.updateMessage ?? chatsApi.editMessage ?? chatsApi.setMessageContent, [
    [chatId, messageId, { content, userId }],
    [{ chatId, messageId, content, userId }],
    [messageId, content],
  ]);
  return result !== null;
}
