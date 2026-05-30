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

const injection = await importBundled('src/backend/injectionService.ts');
const { defaultSettings } = await importBundled('src/shared/defaults.ts');

const latestTracker = {
  version: '1.0.17',
  schemaVersion: '1',
  presetId: 'grand_continuity_atlas',
  chatId: 'chat-1',
  messageId: 'm3',
  generatedAt: '2026-05-29T12:03:00.000Z',
  source: 'sidecar_generate',
  placement: 'top',
  compactSummary: 'Kitchen threshold: Josh is hurt, Bridget has the cellar key, and Diane is nearby.',
  validation: { ok: true, issues: [] },
  data: {
    sceneIdentity: {
      title: 'Kitchen Threshold',
      location: 'Ward House kitchen',
      time: '5:35 PM',
      weather: 'hot rain',
      privacy: 'semi-private',
      tension: 'strained but quiet',
    },
    narrativeDelta: {
      summary: 'The cellar key landed in Bridget hand.',
      whatChanged: ['Bridget now has proof Josh went below stairs.'],
      unresolvedBeats: ['Josh still has not explained the injury.'],
      continuityWarnings: ['Do not move the key back to Josh unless shown.'],
    },
    characters: [
      {
        name: 'Josh',
        role: 'injured visitor',
        identity: {
          fullDesc: 'Damp hair, tight jaw, one leg braced against pain, and watchful eyes measuring the exit.',
        },
        clothing: { summary: 'rain-wet shirt, muddied shoes, tense silhouette' },
        state: { injury: 'right leg cramp active', emotion: 'strained', intent: 'avoid explaining the cellar' },
        relSummary: 'He wants Bridget calm but does not trust the room.',
      },
      {
        name: 'Bridget',
        role: 'host',
        identity: {
          fullDesc: 'Warm, practical presence with searching eyes and a folded towel twisted in one hand.',
        },
        clothing: { summary: 'cream blouse, apron, house socks' },
        state: { emotion: 'concerned suspicion', intent: 'make Josh explain' },
      },
    ],
    items: [{ name: 'brass cellar key', location: 'Bridget hand', condition: 'warm and newly noticed' }],
    rules: {
      cant: ['Josh cannot sprint until the leg cramp resolves.'],
      offscreen: ['Diane is close enough to hear raised voices.'],
    },
    nextTurnGuidance: {
      likelyFocus: 'Bridget asks where the key came from.',
      thingsNotToForget: ['Josh is visibly hurt.', 'The cellar key is in Bridget hand.'],
    },
  },
};

const previous = [
  latestTracker,
  { ...latestTracker, messageId: 'm2', generatedAt: '2026-05-29T12:02:00.000Z', compactSummary: 'Josh entered from the rain and tried to hide the limp.' },
  { ...latestTracker, messageId: 'm1', generatedAt: '2026-05-29T12:01:00.000Z', compactSummary: 'The cellar door was established behind Josh.' },
];

const settings = {
  ...defaultSettings,
  promptInjectionEnabled: true,
  promptInjectionMode: 'latest_plus_history',
  promptInjectionTrackerLimit: 3,
  promptInjectionTokenBudget: 700,
};

const { content, report } = injection.buildContinuityInjection({
  settings,
  latestTracker,
  trackers: previous,
  registered: true,
  injectedAt: '2026-05-29T12:04:00.000Z',
});

assert.match(content, /STATE OF THE LOOM CONTINUITY BRIEF/);
assert.match(content, /Josh/);
assert.match(content, /brass cellar key/);
assert.match(content, /Diane is close enough/);
assert.doesNotMatch(content, /\[object Object\]/);
assert.equal(report.enabled, true);
assert.equal(report.registered, true);
assert.equal(report.historyCount, 2);
assert.ok(report.estimatedTokens <= 700, `expected <= 700 tokens, got ${report.estimatedTokens}`);

const latestOnly = injection.buildContinuityInjection({
  settings: { ...settings, promptInjectionMode: 'latest_brief' },
  latestTracker,
  trackers: previous,
  registered: true,
});
assert.equal(latestOnly.report.historyCount, 0);

console.log('OK: injection smoke passed');
