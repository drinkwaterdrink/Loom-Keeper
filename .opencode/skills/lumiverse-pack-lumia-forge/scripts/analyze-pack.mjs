#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node analyze-pack.mjs <pack.json>');
  process.exit(2);
}

const pack = JSON.parse(readFileSync(file, 'utf8'));
const lumias = Array.isArray(pack.lumiaItems) ? pack.lumiaItems : [];
const looms = Array.isArray(pack.loomItems) ? pack.loomItems : [];
const extras = Array.isArray(pack.packExtras) ? pack.packExtras : [];

const requiredTop = ['packName', 'packAuthor', 'coverUrl', 'version', 'packExtras', 'lumiaItems', 'loomItems'];
const requiredLumia = ['lumiaName', 'lumiaDefinition', 'lumiaPersonality', 'lumiaBehavior', 'avatarUrl', 'genderIdentity', 'authorName', 'version'];

function keys(items) {
  return [...new Set(items.flatMap((item) => Object.keys(item || {})))].sort();
}

function missing(obj, fields) {
  return fields.filter((field) => !(field in obj));
}

const warnings = [];
for (const field of missing(pack, requiredTop)) warnings.push(`missing top-level field: ${field}`);
lumias.forEach((item, index) => {
  for (const field of missing(item, requiredLumia)) warnings.push(`lumiaItems[${index}] missing ${field}`);
  if (![0, 1, 2, 3].includes(item.genderIdentity)) warnings.push(`lumiaItems[${index}] genderIdentity is unusual: ${item.genderIdentity}`);
});
if (looms.length) warnings.push('loomItems are present; raw schema should be verified against a real export before generation.');
if (extras.length) warnings.push('packExtras are present; raw schema should be verified before generation.');

console.log(JSON.stringify({
  file: path.resolve(file),
  packName: pack.packName,
  packAuthor: pack.packAuthor,
  version: pack.version,
  counts: { lumias: lumias.length, loomItems: looms.length, packExtras: extras.length },
  topLevelKeys: Object.keys(pack).sort(),
  lumiaKeys: keys(lumias),
  loomKeys: keys(looms),
  extraKeys: keys(extras),
  warnings,
}, null, 2));

