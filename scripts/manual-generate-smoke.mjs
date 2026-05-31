import assert from 'node:assert/strict';

const frontendMessages = [];
const frontendHandlers = [];
const storage = new Map();

function storageKey(userId, key) {
  return `${userId}:${key}`;
}

globalThis.spindle = {
  log: {
    info() {},
    warn() {},
  },
  userStorage: {
    async getJson(key, options = {}) {
      return storage.get(storageKey(options.userId || 'default', key)) ?? options.fallback;
    },
    async setJson(key, value, options = {}) {
      storage.set(storageKey(options.userId || 'default', key), value);
    },
  },
  permissions: {
    async has(permission) {
      return ['chats', 'chat_mutation', 'generation', 'app_manipulation'].includes(permission);
    },
  },
  chats: {
    async getActive() {
      return { id: 'chat-1', name: 'Smoke Chat' };
    },
  },
  chat: {
    async getMessages(chatId) {
      assert.equal(chatId, 'chat-1');
      return [
        { id: 'msg-user-1', role: 'user', content: 'Where are we?' },
        {
          id: 'msg-assistant-1',
          role: 'assistant',
          content: 'The room is quiet and lit by a blue lantern.',
          swipe_id: 0,
          swipes: ['The room is quiet and lit by a blue lantern.'],
        },
      ];
    },
    async updateMessage() {},
  },
  connections: {
    async list() {
      return [{ id: 'default-conn', name: 'Default', provider: 'mock', model: 'mock-model', is_default: true }];
    },
  },
  generate: {
    async quiet(payload) {
      assert.equal(payload.source, 'loom_keeper');
      assert.ok(payload.messages.some((message) => message.content.includes('blue lantern')));
      return {
        content: JSON.stringify({
          schemaVersion: '1',
          sceneTitle: 'Blue Lantern Room',
          location: 'Quiet room',
          time: 'Now',
          mood: 'calm',
          delta: 'The latest assistant message established a quiet blue-lit room.',
          showCast: false,
          cast: [],
          showInventory: false,
          inventory: [],
          showThreads: true,
          activeThread: 'Understand the room.',
          anchors: ['A blue lantern lights the room.'],
          avoidNext: [],
        }),
      };
    },
  },
  onFrontendMessage(handler) {
    frontendHandlers.push(handler);
  },
  sendToFrontend(message, userId) {
    frontendMessages.push({ message, userId });
  },
  on() {},
};

const backendUrl = new URL('../dist/backend.js', import.meta.url);
backendUrl.searchParams.set('manual-generate-smoke', String(Date.now()));
await import(backendUrl.href);

assert.equal(frontendHandlers.length, 1, 'backend should register one frontend message handler');
await frontendHandlers[0]({ type: 'ready' }, 'smoke-user');

const initialState = frontendMessages.find((entry) => entry.message?.type === 'state')?.message.state;
assert.ok(initialState, 'ready should return state');
assert.equal(initialState.activeChat.id, 'chat-1');
assert.equal(initialState.generation.disabledReason, undefined);

await frontendHandlers[0]({ type: 'generate_tracker' }, 'smoke-user');

const generated = frontendMessages.find((entry) => entry.message?.type === 'tracker_generated')?.message;
assert.ok(generated, 'manual generate should send tracker_generated');
assert.equal(generated.tracker.messageId, 'msg-assistant-1');
assert.equal(generated.state.latestTracker?.messageId, 'msg-assistant-1');
assert.equal(generated.state.messageTrackers.length, 1);
assert.match(generated.state.latestTracker.compactSummary, /Blue Lantern Room|Quiet room|calm/);

console.log('OK: manual generate smoke passed');
