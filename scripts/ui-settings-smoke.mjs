import assert from 'node:assert/strict';
import path from 'node:path';
import * as esbuild from 'esbuild';

async function importBundled(entryPoint) {
  const root = process.cwd();
  const result = await esbuild.build({
    absWorkingDir: root,
    entryPoints: [path.resolve(root, entryPoint)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'es2020',
    write: false,
  });
  const code = result.outputFiles[0].text;
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  return import(url);
}

const defaults = await importBundled('src/shared/defaults.ts');
const drawer = await importBundled('src/frontend/drawer.ts');
const uiState = await importBundled('src/frontend/uiState.ts');

uiState.resetUiStateForTests();
uiState.setUiSectionOpen('injection', true);

const atlas = defaults.builtInPresets[0];
const state = {
  backendReady: true,
  settings: {
    ...defaults.defaultSettings,
    promptInjectionEnabled: true,
    renderInMessages: true,
  },
  permissions: {
    chats: true,
    chat_mutation: true,
    generation: true,
    interceptor: true,
    app_manipulation: true,
  },
  presets: defaults.builtInPresets,
  activePreset: atlas,
  activeChat: { id: 'chat-1', name: 'Kitchen Test' },
  connections: [{ id: 'conn-1', name: 'Sidecar Test', model: 'test-model', is_default: true }],
  latestTracker: null,
  messageTrackers: [],
  generation: { running: false },
  diagnostics: {
    backendReady: true,
    injectionReport: {
      enabled: true,
      registered: true,
      available: true,
      mode: 'latest_plus_history',
      chatId: 'chat-1',
      trackerCount: 3,
      historyCount: 2,
      estimatedTokens: 420,
      tokenBudget: 700,
      truncated: false,
      preview: 'STATE OF THE LOOM CONTINUITY BRIEF',
    },
  },
};

const html = drawer.renderDrawer(state, { lastSettingsSavedAt: Date.now() });

for (const id of [
  'tracking',
  'injection',
  'hud-display',
  'templates-rendering',
  'storage-cleanup',
  'advanced-diagnostics',
  'pipeline-report',
  'injection-report',
  'template-editor',
]) {
  assert.match(html, new RegExp(`data-sotl-section="${id}"`), `missing settings section ${id}`);
}

assert.match(html, /Quick Status/);
assert.match(html, /Use default\/current connection when none is selected/);
assert.match(html, /Show message-card action buttons/);
assert.match(html, /Legacy desktop floating button/);
assert.match(html, /Legacy density setting/);
assert.match(html, /Saved/);
assert.doesNotMatch(html, /data-sotl-field="debugMode"/);
assert.doesNotMatch(html, /Debug mode/i);
assert.doesNotMatch(html, /<h3>Controls<\/h3>/);

console.log('OK: UI settings smoke passed');
