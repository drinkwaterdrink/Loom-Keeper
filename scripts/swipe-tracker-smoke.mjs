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

const { LoomTrackerStateService } = await importBundled('src/backend/trackerStateService.ts');
const { LOOM_VERSION } = await importBundled('src/shared/defaults.ts');

const storage = {};
const spindle = {
  userStorage: {
    async getJson(key) {
      return storage[key];
    },
    async setJson(key, value) {
      storage[key] = value;
    },
  },
};

function tracker(messageId, swipeId, minutesAgo = 0) {
  return {
    version: LOOM_VERSION,
    schemaVersion: '1',
    presetId: 'grand_continuity_atlas',
    chatId: 'chat-swipe',
    messageId,
    swipeId,
    generatedAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    source: 'sidecar_generate',
    placement: 'top',
    data: { schemaVersion: '1', sceneTitle: `Message ${messageId} Swipe ${swipeId}` },
    compactSummary: `Message ${messageId} Swipe ${swipeId}`,
    validation: { ok: true, issues: [] },
  };
}

const service = new LoomTrackerStateService(spindle);

await service.save('user-swipe', tracker('m1', 0, 3), 0);
await service.save('user-swipe', tracker('m1', 1, 2), 0);
await service.save('user-swipe', tracker('m1', 2, 1), 0);

let list = await service.listForChat('user-swipe', 'chat-swipe');
assert.equal(list.filter((item) => item.messageId === 'm1').length, 3, 'same-message swipe trackers should coexist');

const activeSwipe = await service.getLatestForActive('user-swipe', 'chat-swipe', 'm1', 1);
assert.equal(activeSwipe?.swipeId, 1, 'active swipe lookup should return exact messageId + swipeId tracker');
const missingSwipe = await service.getLatestForActive('user-swipe', 'chat-swipe', 'm1', 9);
assert.equal(missingSwipe, null, 'active swipe lookup should not show a sibling swipe when the selected swipe has no tracker');

await service.save('user-swipe', tracker('m2', 0, 0), 0);
await service.save('user-swipe', tracker('m2', 1, 0), 0);

const cleanup = await service.pruneInactiveSwipeAlternatives(
  'user-swipe',
  'chat-swipe',
  { m1: 1, m2: 0 },
  'm2',
);
assert.equal(cleanup.removedCount, 2, 'cleanup should remove older non-active m1 swipe alternatives');

list = await service.listForChat('user-swipe', 'chat-swipe');
assert.deepEqual(
  list.filter((item) => item.messageId === 'm1').map((item) => item.swipeId),
  [1],
  'older message should keep only active swipe',
);
assert.equal(list.filter((item) => item.messageId === 'm2').length, 2, 'latest message should keep all swipe alternatives while choosing');

await service.setHidden('user-swipe', 'chat-swipe', 'm2', 1, true);
const hidden = await service.getLatestForActive('user-swipe', 'chat-swipe', 'm2', 1);
assert.equal(hidden?.hidden, true, 'hide should target exact messageId + swipeId');

await service.delete('user-swipe', 'chat-swipe', 'm2', 1);
list = await service.listForChat('user-swipe', 'chat-swipe');
assert.equal(list.some((item) => item.messageId === 'm2' && item.swipeId === 1), false, 'delete should target exact messageId + swipeId');
assert.equal(list.some((item) => item.messageId === 'm2' && item.swipeId === 0), true, 'delete should preserve sibling swipe tracker');

console.log('OK: swipe tracker storage smoke passed');
