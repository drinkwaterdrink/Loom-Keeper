import assert from 'node:assert/strict';
import path from 'node:path';
import { readFileSync } from 'node:fs';
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

function tracker(messageId, swipeId, summary) {
  return {
    version: defaults.LOOM_VERSION,
    schemaVersion: '1',
    presetId: defaults.builtInPresets[0].id,
    chatId: 'chat-ui',
    messageId,
    swipeId,
    generatedAt: new Date(Date.now() - swipeId * 1000).toISOString(),
    source: 'sidecar_generate',
    placement: 'top',
    data: {
      schemaVersion: '1',
      sceneTitle: summary,
      location: 'Very long location name that should not widen the drawer',
      delta: summary,
    },
    compactSummary: summary,
    validation: { ok: true, issues: [] },
  };
}

const latest = tracker('m1', 1, 'Selected swipe tracker');
const state = {
  backendReady: true,
  settings: {
    ...defaults.defaultSettings,
    activePresetId: defaults.builtInPresets[0].id,
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
  activePreset: defaults.builtInPresets[0],
  activeChat: { id: 'chat-ui', name: 'Swipe UI Test' },
  connections: [],
  latestTracker: latest,
  messageTrackers: [
    tracker('m1', 0, 'First swipe tracker'),
    latest,
    tracker('m1', 2, 'Third swipe tracker'),
  ],
  activeSwipeByMessageId: { m1: 1 },
  generation: { running: false },
  diagnostics: {
    backendReady: true,
    swipeReport: {
      activeMessageId: 'm1',
      activeSwipeId: 1,
      activeSwipeByMessageId: { m1: 1 },
      storedSwipeTrackerCount: 3,
      alternativeSwipeTrackerCount: 2,
      cleanupRemovedCount: 0,
      cleanupKeptCount: 3,
    },
  },
};

const html = drawer.renderDrawer(state);
assert.match(html, /Swipe 2 active/, 'current loom should show active swipe chip');
assert.match(html, /Swipe Alternatives/, 'drawer should group same-message alternatives');
assert.match(html, /data-sotl-swipe-id="1"/, 'active row actions should carry swipe id');
assert.match(html, /data-sotl-swipe-id="0"/, 'alternative row actions should carry swipe id');
assert.match(html, /Swipe Tracker Report/, 'diagnostics should expose swipe report');

const styles = readFileSync('src/frontend/styles.ts', 'utf8');
const frontend = readFileSync('src/frontend/frontend.ts', 'utf8');
const messageCards = readFileSync('src/frontend/messageCards.ts', 'utf8');
const drawerSource = readFileSync('src/frontend/drawer.ts', 'utf8');
assert.match(styles, /\.sotl-root[\s\S]*overflow-x:\s*hidden/, 'drawer root should prevent horizontal overflow');
assert.match(styles, /\.sotl-select[\s\S]*text-overflow:\s*ellipsis/, 'selects should truncate long preset names');
assert.match(styles, /\.sotl-preview[\s\S]*contain:\s*inline-size/, 'custom previews should be width-contained');
assert.match(styles, /\.sotl-message-row,\s*\.sotl-swipe-row/, 'message rows should share constrained mobile layout');
assert.match(frontend, /shortName:\s*'Track'/, 'drawer tab should be labeled Track');
assert.match(frontend, /title:\s*'Track'/, 'drawer title should be Track');
assert.match(frontend, /viewBox="0 0 512 512"/, 'drawer tab should use the paw icon');
assert.match(frontend, /SWIPE_CHANGED/, 'frontend should listen for swipe change events');
assert.match(frontend, /scheduleSwipeStateRefresh/, 'frontend should refresh backend state after swipe changes');
assert.match(frontend, /message-paw/, 'frontend should route message paw actions');
assert.match(frontend, /setFocusedTrackerRef/, 'message paw should focus an exact tracker in the drawer');
assert.match(frontend, /MutationObserver/, 'message paw mounting should react to native toolbar visibility changes');
assert.match(messageCards, /mountMessageTrackerActions/, 'message paw actions should have a dedicated mount path');
assert.match(messageCards, /dataset\.sotlMessagePaw = 'true'/, 'message paw actions should be marked for duplicate cleanup');
assert.match(messageCards, /activeSwipeByMessageId\[messageId\]/, 'message paw action should use active swipe metadata');
assert.doesNotMatch(messageCards, /const hostSelectors = \[[\s\S]*'\.message-actions'[\s\S]*\]/, 'HUD launcher fallback should not attach to message action toolbars');
assert.match(styles, /sotl-chat-pill--generating/, 'floating paw should expose an active generation animation state');
assert.match(styles, /sotl-paw-pad-bounce/, 'floating paw should animate individual pads');
assert.match(styles, /prefers-reduced-motion:\s*reduce/, 'paw animation should respect reduced motion');
assert.match(styles, /sotl-message-paw-action/, 'per-message paw should have native-styled action CSS');
assert.match(drawerSource, /Focused Tracker/, 'drawer should render focused tracker state');

console.log('OK: swipe UI smoke passed');
