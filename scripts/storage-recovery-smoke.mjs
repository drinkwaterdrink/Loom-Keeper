import assert from 'node:assert/strict';

const frontendMessages = [];
const frontendHandlers = [];
const writes = [];

globalThis.spindle = {
  log: {
    info() {},
    warn() {},
  },
  userStorage: {
    async getJson(key) {
      if (key === 'settings.json') throw new Error('Failed to parse JSON from settings.json');
      return undefined;
    },
    async setJson(key, value, options) {
      writes.push({ key, value, options });
    },
  },
  permissions: {
    async has() {
      return false;
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
backendUrl.searchParams.set('smoke', String(Date.now()));
await import(backendUrl.href);

assert.equal(frontendHandlers.length, 1, 'backend should register one frontend message handler');
await frontendHandlers[0]({ type: 'ready' }, 'smoke-user');

const stateMessage = frontendMessages.find((entry) => entry.message?.type === 'state');
assert.ok(stateMessage, 'backend should return a state packet after corrupt settings recovery');
assert.equal(stateMessage.userId, 'smoke-user');
assert.equal(stateMessage.message.state.backendReady, true);
assert.match(stateMessage.message.state.diagnostics.storageWarning, /Recovered corrupt settings\.json/);
assert.ok(writes.some((entry) => entry.key === 'settings.json'), 'settings.json should be rewritten to defaults');

await frontendHandlers[0]({ type: 'reset_storage' }, 'smoke-user');
assert.ok(writes.some((entry) => entry.key === 'presets.json'), 'reset should rewrite presets.json');
assert.ok(writes.some((entry) => entry.key === 'tracker-states.json'), 'reset should rewrite tracker-states.json');

console.log('OK: storage recovery smoke passed');
