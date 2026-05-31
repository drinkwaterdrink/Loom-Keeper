#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const target = process.argv[2] || 'dist/backend.js';
const resolved = path.resolve(target);

const patterns = [
  ['direct filesystem', /\b(?:fs|node:fs|readFileSync|writeFileSync)\b/],
  ['Bun filesystem/process', /\bBun\.(?:file|write|spawn|serve)\b/],
  ['subprocess', /\bchild_process\b|\bspawnSync\b|\bexecSync\b/],
  ['raw workers/process control', /\bworker_threads\b|\bcluster\b|\bprocess\.(?:env|exit|kill)\b/],
  ['raw network modules', /\bnode:(?:http|https|net|tls|dgram)\b|require\(['"](?:http|https|net|tls|dgram)['"]\)/],
  ['direct sqlite', /\b(?:bun:sqlite|node:sqlite)\b/],
  ['dynamic code execution', /\beval\s*\(|\bFunction\s*\(|new\s+Function\b/],
  ['base64 decode', /Buffer\.from\s*\([^)]*['"]base64['"]/],
];

let text;
try {
  statSync(resolved);
  text = readFileSync(resolved, 'utf8');
} catch (error) {
  console.error(`[scan-spindle-dist] Cannot read ${resolved}: ${error.message}`);
  process.exit(2);
}

const findings = [];
for (const [name, regex] of patterns) {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const matches = [...text.matchAll(new RegExp(regex.source, flags))];
  if (matches.length) {
    findings.push({ name, count: matches.length, samples: matches.slice(0, 5).map((m) => m[0]) });
  }
}

if (!findings.length) {
  console.log(`[scan-spindle-dist] OK: no scanner red flags found in ${resolved}`);
  process.exit(0);
}

console.log(`[scan-spindle-dist] Potential scanner red flags in ${resolved}:`);
for (const finding of findings) {
  console.log(`- ${finding.name}: ${finding.count} match(es); samples: ${finding.samples.join(', ')}`);
}
console.log('Review each match. Prefer removing it or replacing it with Spindle APIs before declaring capabilities.');
process.exit(1);
