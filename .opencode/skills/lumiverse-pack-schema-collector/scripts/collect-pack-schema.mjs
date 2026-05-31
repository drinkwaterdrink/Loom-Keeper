#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [inputArg, outArg] = process.argv.slice(2);
if (!inputArg || !outArg) {
  console.error('Usage: node collect-pack-schema.mjs <pack-folder-or-json> <out.md>');
  process.exit(2);
}

const input = path.resolve(inputArg);
const out = path.resolve(outArg);

function filesFrom(target) {
  const stat = statSync(target);
  if (stat.isDirectory()) {
    return readdirSync(target)
      .filter((name) => name.toLowerCase().endsWith('.json'))
      .map((name) => path.join(target, name));
  }
  return [target];
}

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function observe(value, prefix, map) {
  const type = typeOf(value);
  const entry = map.get(prefix) || { count: 0, types: new Map(), examples: [] };
  entry.count += 1;
  entry.types.set(type, (entry.types.get(type) || 0) + 1);
  if (entry.examples.length < 3 && type !== 'object' && type !== 'array') entry.examples.push(String(value).slice(0, 80));
  map.set(prefix, entry);
  if (Array.isArray(value)) {
    for (const item of value) observe(item, `${prefix}[]`, map);
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) observe(child, prefix ? `${prefix}.${key}` : key, map);
  }
}

const maps = { all: new Map(), lumia: new Map(), loom: new Map(), extra: new Map() };
const summaries = [];
for (const file of filesFrom(input)) {
  const json = JSON.parse(readFileSync(file, 'utf8'));
  summaries.push({
    file,
    packName: json.packName,
    lumias: json.lumiaItems?.length || 0,
    looms: json.loomItems?.length || 0,
    extras: json.packExtras?.length || 0,
  });
  observe(json, '', maps.all);
  for (const item of json.lumiaItems || []) observe(item, '', maps.lumia);
  for (const item of json.loomItems || []) observe(item, '', maps.loom);
  for (const item of json.packExtras || []) observe(item, '', maps.extra);
}

function renderMap(title, map) {
  const lines = [`## ${title}`, '', '| Field | Count | Types | Examples |', '| --- | --- | --- | --- |'];
  for (const [field, entry] of [...map.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (!field) continue;
    const types = [...entry.types.entries()].map(([k, v]) => `${k}:${v}`).join(', ');
    lines.push(`| \`${field}\` | ${entry.count} | ${types} | ${entry.examples.join('<br>')} |`);
  }
  return lines.join('\n');
}

const md = [
  '# Lumiverse Pack Schema Report',
  '',
  `Generated: ${new Date().toISOString()}`,
  `Files scanned: ${summaries.length}`,
  '',
  '## Packs',
  '',
  '| File | Pack | Lumias | Looms | Extras |',
  '| --- | --- | --- | --- | --- |',
  ...summaries.map((s) => `| ${s.file} | ${s.packName || ''} | ${s.lumias} | ${s.looms} | ${s.extras} |`),
  '',
  renderMap('All Fields', maps.all),
  '',
  renderMap('Lumia Fields', maps.lumia),
  '',
  renderMap('Loom Item Fields', maps.loom),
  '',
  renderMap('Pack Extra Fields', maps.extra),
  '',
  '## Recommendations',
  '',
  '- Treat fields in empty sections as unverified.',
  '- Promote fields to verified only after export evidence is present.',
].join('\n');

writeFileSync(out, `${md}\n`, 'utf8');
console.log(`Wrote schema report to ${out}`);

