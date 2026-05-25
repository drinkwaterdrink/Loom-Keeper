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

const validation = await importBundled('src/shared/validation.ts');

const simTrackerPreset = {
  templateName: 'Ward House Character Ledger',
  templatePosition: 'TOP',
  htmlTemplate: [
    '<section class="ledger">',
    '{{#each characters}}',
    '<article>{{characterName}} {{stats.trust}} {{statusTag}}</article>',
    '{{/each}}',
    '</section>',
  ].join('\n'),
  sysPrompt: 'SIMTRACKER PROMPT TOKEN. Track every visible character.',
  customFields: [
    { key: 'statusTag', label: 'Status Tag', type: 'string', description: 'Short status pill.' },
    { key: 'stats.trust', label: 'Trust', type: 'number', description: 'Trust score.' },
    { key: 'worldData.sceneHazard', label: 'Scene Hazard', type: 'string' },
    { key: 'isWatching', label: 'Watching', type: 'boolean' },
  ],
  extSettings: {
    codeBlockIdentifier: 'simtracker',
  },
};

const nativePreset = {
  id: 'native_custom',
  name: 'Native Custom',
  version: '1.0.13',
  origin: 'custom',
  mode: 'hybrid',
  schemaJson: {
    type: 'object',
    required: ['schemaVersion', 'sceneTitle'],
    properties: {
      schemaVersion: { type: 'string' },
      sceneTitle: { type: 'string' },
    },
  },
  htmlTemplate: '<section>{{sceneTitle}}</section>',
  promptInstructions: 'Native prompt token.',
  injectionTemplate: '[Native]\n{{compactSummary}}',
  maxInjectionTokens: 100,
  defaultPlacement: 'top',
  renderOptions: { density: 'compact', theme: 'system', showControls: true },
  parserOptions: { fenceNames: ['tracker'], strictJson: true, repairInvalidJson: false },
  sampleData: { schemaVersion: '1', sceneTitle: 'Native Sample' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const single = validation.coerceImportedPreset(simTrackerPreset);
assert.ok(single, 'SimTracker preset should normalize');
assert.equal(single.id, 'Ward_House_Character_Ledger');
assert.equal(single.origin, 'imported');
assert.equal(single.templateEngine, 'handlebars_compat');
assert.equal(single.sourceFormat, 'simtracker');
assert.match(single.promptInstructions, /SIMTRACKER PROMPT TOKEN/);
assert.match(single.promptInstructions, /Return raw JSON only/);
assert.deepEqual(single.parserOptions.fenceNames.slice(0, 1), ['simtracker']);
assert.equal(single.defaultPlacement, 'top');
assert.equal(single.schemaJson.properties.characters.type, 'array');
assert.equal(single.schemaJson.properties.characters.items.properties.stats.properties.trust.type, 'number');
assert.equal(single.schemaJson.properties.worldData.properties.sceneHazard.type, 'string');
assert.equal(single.sampleData.characters[0].stats.trust, 55);
assert.equal(single.sampleData.characters[0].isWatching, true);

const pack = validation.coerceImportedPresets({ presets: [simTrackerPreset, nativePreset, { nope: true }] });
assert.equal(pack.presets.length, 2);
assert.equal(pack.failures.length, 1);
assert.equal(pack.presets[1].id, 'native_custom');
assert.equal(pack.presets[1].sourceFormat, 'loom');

const collision = validation.coerceImportedPreset({ ...nativePreset, id: 'micro_loom', name: 'Micro Loom Copy' });
assert.ok(collision);
assert.notEqual(collision.id, 'micro_loom');
assert.match(collision.id, /^micro_loom_imported_/);

console.log('OK: import compatibility smoke passed');
