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

const renderer = await importBundled('src/shared/renderer.ts');
const rendering = await importBundled('src/frontend/rendering.ts');

const activePreset = {
  id: 'slim_scene_loom',
  name: 'Slim Scene Loom',
  version: '1.0.13',
  description: '',
  origin: 'built-in',
  mode: 'hybrid',
  schemaJson: { type: 'object' },
  htmlTemplate: '<section>{{sceneTitle}}</section>',
  promptInstructions: 'Return JSON.',
  injectionTemplate: '',
  maxInjectionTokens: 150,
  defaultPlacement: 'top',
  renderOptions: { density: 'compact', theme: 'system', showControls: true },
  parserOptions: { fenceNames: ['tracker'], strictJson: true, repairInvalidJson: false },
  sampleData: {},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const customPreset = {
  ...activePreset,
  id: 'custom_reputation_loom',
  name: 'Custom Reputation Loom',
  origin: 'custom',
  templateEngine: 'handlebars_compat',
  sourceFormat: 'loom',
  htmlTemplate: '<section class="sotl-card"><h3>{{threadName}}</h3><p>{{reputation}}</p></section>',
  sampleData: { threadName: 'Guild ledger', reputation: 'trusted' },
};

const tracker = {
  version: '1.0.13',
  schemaVersion: '1',
  presetId: 'custom_reputation_loom',
  chatId: 'chat-render',
  messageId: 'msg-render',
  generatedAt: new Date().toISOString(),
  source: 'sidecar_generate',
  placement: 'top',
  data: {
    schemaVersion: '1',
    threadName: 'Guild ledger',
    reputation: 'trusted',
    clues: [{ label: 'brass key', status: 'north archive' }],
  },
  compactSummary: 'Guild ledger: trusted',
  validation: { ok: true, issues: [] },
};

const state = {
  backendReady: true,
  settings: { useSafeRenderer: true, customTemplateMode: 'safe_generic' },
  permissions: { chats: true, chat_mutation: true, generation: true },
  presets: [activePreset, customPreset],
  activePreset,
  activeChat: { id: 'chat-render', name: 'Render Chat' },
  connections: [],
  latestTracker: tracker,
  messageTrackers: [tracker],
  generation: { running: false },
  diagnostics: { backendReady: true },
};

const resolved = rendering.resolvePresetForTracker(state, tracker);
assert.equal(resolved.preset.id, 'custom_reputation_loom');
assert.equal(resolved.missing, false);

const compact = rendering.renderCompactTrackerForState(tracker, state);
assert.match(compact, /Custom Reputation Loom/);
assert.match(compact, /Guild ledger/);
assert.doesNotMatch(compact, /\[object Object\]/);

const report = rendering.renderTrackerForState(tracker, state);
assert.equal(report.fallbackUsed, true, 'safe renderer setting should force generic fallback');
assert.match(report.html, /brass key/);
assert.doesNotMatch(report.html, /\[object Object\]/);

const missingState = { ...state, presets: [activePreset] };
const missingReport = rendering.renderTrackerForState(tracker, missingState);
assert.equal(missingReport.fallbackUsed, true);
assert.match(missingReport.warning, /not available/);

const brokenPreset = {
  ...customPreset,
  htmlTemplate: '<section><h3>{{missingField}}</h3></section>',
};
const originalError = console.error;
console.error = () => {};
const brokenReport = renderer.renderTrackerHtmlDetailed(tracker, brokenPreset, 'trusted_layout');
console.error = originalError;
assert.equal(brokenReport.fallbackUsed, true);
assert.match(brokenReport.html, /Custom template failed|Safe Renderer/);

const simPreset = {
  ...customPreset,
  id: 'simtracker_style_import',
  name: 'SimTracker Style Import',
  sourceFormat: 'simtracker',
  htmlTemplate: [
    '<section class="sim-card" style="display:grid;gap:4px" onclick="bad()">',
    '<script>bad()</script>',
    '{{#each characters}}',
    '<label class="person" style="color:#123">{{@index}} {{characterName}} {{initials characterName}}</label>',
    '<p>{{#if (gt stats.trust 50)}}trusted{{else}}wary{{/if}} / {{divide stats.energy 2}}</p>',
    '{{/each}}',
    '</section>',
  ].join(''),
  sampleData: {
    characters: [
      { name: 'Mara Venn', stats: { trust: 72, energy: 8 } },
      { characterName: 'Ilan', stats: { trust: 20, energy: 4 } },
    ],
  },
};
const simTracker = {
  ...tracker,
  presetId: simPreset.id,
  data: simPreset.sampleData,
};
const simReport = renderer.renderTrackerHtmlDetailed(simTracker, simPreset, 'trusted_layout');
assert.equal(simReport.fallbackUsed, false);
assert.match(simReport.html, /0 Mara Venn MV/);
assert.match(simReport.html, /trusted/);
assert.match(simReport.html, /wary/);
assert.match(simReport.html, /display:grid/);
assert.doesNotMatch(simReport.html, /onclick=/);
assert.doesNotMatch(simReport.html, /<script/i);
assert.equal(simReport.sanitizerRemovedContent, true);

const missingTemplatePreset = {
  ...customPreset,
  id: 'custom_missing_paths',
  htmlTemplate: '<section><h3>{{threadName}}</h3><p>{{missing.deep.path}}</p></section>',
};
const missingFieldsReport = renderer.renderTrackerHtmlDetailed(tracker, missingTemplatePreset, 'trusted_layout');
assert.equal(missingFieldsReport.fallbackUsed, false, 'missing optional paths should not hide valid rendered content');
assert.match(missingFieldsReport.warning, /Missing template fields/);
assert.match(missingFieldsReport.html, /Unrendered tracker data/);

const compatibility = renderer.buildTemplateCompatibilityReport(missingTemplatePreset, missingTemplatePreset.sampleData, tracker.data);
assert.ok(compatibility.referencedFields.includes('missing.deep.path'));
assert.ok(compatibility.missingFromLatest.includes('missing.deep.path'));

console.log('OK: renderer smoke passed');
