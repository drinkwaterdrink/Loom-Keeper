#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const [inputFile, outputFile] = process.argv.slice(2);
if (!inputFile || !outputFile) {
  console.error('Usage: node build-lumia-pack.mjs <normalized-pack.json> <out.json>');
  process.exit(2);
}

const spec = JSON.parse(readFileSync(inputFile, 'utf8'));
const pack = spec.pack || {};
const lumias = Array.isArray(spec.lumias) ? spec.lumias : [];

const genderMap = {
  feminine: 0,
  masculine: 1,
  neutral: 2,
  any: 3,
};

const out = {
  packName: pack.name || 'Untitled Pack',
  packAuthor: pack.author || 'Unknown',
  coverUrl: pack.coverUrl || '',
  version: Number(pack.version || 1),
  packExtras: [],
  lumiaItems: lumias.map((lumia) => ({
    lumiaName: lumia.name || 'Unnamed Lumia',
    lumiaDefinition: lumia.definition || '',
    lumiaPersonality: lumia.personality || '',
    lumiaBehavior: lumia.behavior || '',
    avatarUrl: lumia.avatarUrl || lumia.avatar || '',
    genderIdentity: typeof lumia.genderIdentity === 'number'
      ? lumia.genderIdentity
      : genderMap[String(lumia.genderIdentity || 'neutral').toLowerCase()] ?? 2,
    authorName: lumia.authorName || pack.author || 'Unknown',
    version: Number(lumia.version || 1),
  })),
  loomItems: [],
};

writeFileSync(outputFile, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(`Wrote Lumia pack JSON to ${outputFile}`);

