#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const [dirArg, ...nameParts] = process.argv.slice(2);
if (!dirArg || !nameParts.length) {
  console.error('Usage: node create-artifact-workspace.mjs <target-dir> <project-name>');
  process.exit(2);
}

const root = path.resolve(dirArg);
const name = nameParts.join(' ');
if (existsSync(root)) {
  console.error(`Target already exists: ${root}`);
  process.exit(2);
}

mkdirSync(path.join(root, 'drafts'), { recursive: true });

const files = {
  '00-brief.md': `# ${name}\n\nOne-line value:\n\nTarget user:\n\nPrimary workflow:\n\nNon-goals:\n`,
  '01-architecture.md': `# Architecture\n\nArtifact shape:\n\nLumiverse surfaces:\n\nData ownership:\n\nPrompt influence:\n\nCouncil integration:\n`,
  '02-spindle-extension.md': `# Spindle Extension\n\nManifest:\n\nPermissions:\n\nFrontend:\n\nBackend:\n\nStorage:\n\nValidation:\n`,
  '03-pack-lumia-blueprint.md': `# Pack and Lumia Blueprint\n\nPack:\n\nLumias:\n\nLoom items:\n\nLoom tools:\n\nCouncil setup:\n`,
  '04-preset-worldbook-plan.md': `# Preset and World Book Plan\n\nPrompt blocks:\n\nVariables:\n\nWorld books:\n\nCharacter/persona links:\n`,
  '05-json-manifest.md': `# JSON Manifest\n\nVerified raw JSON:\n\nNormalized specs:\n\nSchema confidence:\n`,
  '06-validation.md': `# Validation\n\nBuild:\n\nScanner:\n\nImport/export:\n\nEvaluator:\n\nRuntime:\n`,
  '07-ai-builder-prompt.md': `# AI Builder Prompt\n\nUse the Lumiverse skill suite to build ${name}. Follow the architecture and validation files in this folder.\n`,
};

for (const [file, content] of Object.entries(files)) {
  writeFileSync(path.join(root, file), content, 'utf8');
}

writeFileSync(path.join(root, 'drafts', 'normalized-pack.json'), JSON.stringify({
  pack: { name, author: 'Author', version: 1, coverUrl: '' },
  lumias: [],
  loomItems: [],
  loomTools: [],
}, null, 2) + '\n', 'utf8');

console.log(`Created Lumiverse artifact workspace at ${root}`);

