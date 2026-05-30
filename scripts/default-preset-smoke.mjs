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
const prompts = await importBundled('src/shared/prompts.ts');

assert.equal(defaults.LOOM_VERSION, '1.0.14');
assert.equal(defaults.defaultSettings.activePresetId, 'grand_continuity_atlas');

const atlas = defaults.builtInPresets.find((preset) => preset.id === 'grand_continuity_atlas');
assert.ok(atlas, 'Grand Continuity Atlas should be a built-in preset');
assert.equal(defaults.builtInPresets[0].id, 'grand_continuity_atlas');
assert.equal(atlas.templateEngine, 'handlebars_compat');
assert.equal(atlas.sourceFormat, 'loom');
assert.match(atlas.promptInstructions, /2200-2800 JSON tokens/);
assert.match(atlas.promptInstructions, /raw JSON only/i);
assert.ok(atlas.schemaJson.properties.sceneIdentity, 'Atlas should track scene identity');
assert.ok(atlas.schemaJson.properties.characters, 'Atlas should track rich character state');
assert.ok(atlas.schemaJson.properties.relationships, 'Atlas should track relationship state');
assert.ok(atlas.schemaJson.properties.worldState, 'Atlas should track world state');

const prompt = prompts.buildTrackerPrompt({
  preset: atlas,
  latestAssistantMessage: 'Josh limps into the kitchen and Bridget notices.',
  previousTracker: null,
  recentContext: 'assistant: Bridget watches him from the counter.',
});
const joined = prompt.map((message) => message.content).join('\n');
assert.match(joined, /Grand Continuity Atlas/);
assert.match(joined, /2200-2800 JSON tokens/);
assert.match(joined, /Sample JSON shape and naming conventions/);
assert.match(joined, /sceneIdentity/);
assert.match(joined, /characters/);
assert.match(joined, /Return JSON only/);

console.log('OK: default preset smoke passed');
