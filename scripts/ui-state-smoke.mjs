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

const uiState = await importBundled('src/frontend/uiState.ts');

uiState.resetUiStateForTests();
assert.equal(uiState.isUiSectionOpen('tracking', true), true);
assert.equal(uiState.isUiSectionOpen('injection', false), false);

uiState.setUiSectionOpen('injection', true);
uiState.setUiSectionOpen('tracking', false);
assert.equal(uiState.isUiSectionOpen('injection'), true);
assert.equal(uiState.isUiSectionOpen('tracking', true), false);
assert.deepEqual(uiState.getOpenSectionIds(), ['injection']);

uiState.resetUiStateForTests();
const snapshot = uiState.captureUiState(null);
assert.deepEqual(snapshot.openSections, []);
uiState.restoreUiState(null, snapshot);

uiState.setFocusedTrackerRef({ messageId: 'm1', swipeId: 0, notice: 'old swipe' });
uiState.syncFocusedTrackerSwipe({ m1: 2 });
assert.deepEqual(uiState.getFocusedTrackerRef(), { messageId: 'm1', swipeId: 2 }, 'focused tracker should sync to the active swipe for that message');

console.log('OK: UI state smoke passed');
