import assert from 'node:assert/strict';

const frontendMessages = [];
const frontendHandlers = [];
const storage = new Map();
let generationPayload = null;

function storageKey(userId, key) {
  return `${userId}:${key}`;
}

function latestState() {
  return frontendMessages.filter((entry) => entry.message?.type === 'state').at(-1)?.message.state;
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
      return { id: 'chat-custom', name: 'Custom Preset Smoke' };
    },
  },
  chat: {
    async getMessages(chatId) {
      assert.equal(chatId, 'chat-custom');
      return [
        { id: 'msg-user-1', role: 'user', content: 'What changed in the guild ledger?' },
        {
          id: 'msg-assistant-1',
          role: 'assistant',
          content: 'The guild now trusts Mara, and the brass key clue moved to the north archive.',
        },
      ];
    },
  },
  connections: {
    async list() {
      return [{ id: 'default-conn', name: 'Default', provider: 'mock', model: 'mock-model', is_default: true }];
    },
  },
  generate: {
    async quiet(payload) {
      generationPayload = payload;
      const joined = payload.messages.map((message) => message.content).join('\n');
      assert.match(joined, /CUSTOM LOOM PROMPT TOKEN/);
      assert.match(joined, /threadName/);
      assert.match(joined, /reputation/);
      return {
        content: JSON.stringify({
          schemaVersion: '1',
          threadName: 'Guild ledger',
          reputation: 'trusted',
          clues: [{ label: 'brass key', status: 'north archive' }],
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
backendUrl.searchParams.set('custom-preset-smoke', String(Date.now()));
await import(backendUrl.href);

assert.equal(frontendHandlers.length, 1, 'backend should register one frontend message handler');
await frontendHandlers[0]({ type: 'ready' }, 'smoke-user');

const customPreset = {
  id: 'custom fancy loom',
  name: 'Custom Fancy Loom',
  version: '1.0.13',
  description: 'Custom smoke-test preset.',
  origin: 'imported',
  mode: 'sidecar_generate',
  schemaJson: {
    type: 'object',
    required: ['schemaVersion', 'threadName', 'reputation', 'clues'],
    properties: {
      schemaVersion: { type: 'string' },
      threadName: { type: 'string' },
      reputation: { type: 'string' },
      clues: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            status: { type: 'string' },
          },
        },
      },
    },
  },
  htmlTemplate: '<section class="sotl-card"><h3>{{threadName}}</h3><p>{{reputation}}</p>{{#each clues}}<p>{{label}}: {{status}}</p>{{/each}}</section>',
  promptInstructions: 'CUSTOM LOOM PROMPT TOKEN. Return valid JSON only for the custom schema.',
  injectionTemplate: '[Custom Fancy Loom]\n{{compactSummary}}',
  maxInjectionTokens: 180,
  defaultPlacement: 'top',
  renderOptions: { density: 'compact', theme: 'system', showControls: true },
  parserOptions: { fenceNames: ['tracker', 'loom'], strictJson: true, repairInvalidJson: false },
  sampleData: { schemaVersion: '1', threadName: 'Preview', reputation: 'neutral', clues: [] },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

await frontendHandlers[0]({ type: 'save_preset', preset: customPreset, makeActive: true }, 'smoke-user');

const savedState = latestState();
assert.ok(savedState, 'saving should return a state packet');
assert.equal(savedState.settings.activePresetId, 'custom_fancy_loom');
assert.equal(savedState.activePreset.id, 'custom_fancy_loom');
assert.equal(savedState.activePreset.origin, 'imported');
assert.ok(savedState.presets.some((preset) => preset.id === 'custom_fancy_loom'), 'custom preset should be in state presets');

await frontendHandlers[0]({ type: 'generate_tracker' }, 'smoke-user');

const generated = frontendMessages.find((entry) => entry.message?.type === 'tracker_generated')?.message;
assert.ok(generated, 'custom preset generate should send tracker_generated');
assert.ok(generationPayload, 'sidecar generation should have been called');
assert.equal(generated.tracker.presetId, 'custom_fancy_loom');
assert.equal(generated.tracker.validation.ok, true);
assert.equal(generated.state.latestTracker?.presetId, 'custom_fancy_loom');
assert.equal(generated.state.diagnostics.pipelineReport.activePresetId, 'custom_fancy_loom');
assert.equal(generated.state.diagnostics.pipelineReport.presetSource, 'imported');
assert.equal(generated.state.diagnostics.pipelineReport.rawResponseAvailable, true);
assert.equal(generated.state.diagnostics.pipelineReport.parseSuccess, true);
assert.equal(generated.state.diagnostics.pipelineReport.schemaValidationSuccess, true);

console.log('OK: custom preset smoke passed');
