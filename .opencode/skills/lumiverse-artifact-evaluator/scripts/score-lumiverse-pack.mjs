#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node score-lumiverse-pack.mjs <pack.json>');
  process.exit(2);
}

const pack = JSON.parse(readFileSync(file, 'utf8'));
const lumias = Array.isArray(pack.lumiaItems) ? pack.lumiaItems : [];
const warnings = [];

function clamp(n) { return Math.max(0, Math.min(10, n)); }
function wordCount(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }

let purpose = pack.packName && pack.packAuthor ? 8 : 4;
let schema = ['packName','packAuthor','coverUrl','version','packExtras','lumiaItems','loomItems'].every((k) => k in pack) ? 10 : 4;
let distinct = 5;
let council = 5;
let token = 8;

if (lumias.length >= 3 && lumias.length <= 8) council += 2;
if (lumias.length > 12) token -= 2;
if (lumias.length === 0) warnings.push('No Lumias found.');

const names = new Set();
const behaviorStarts = new Set();
for (const [i, l] of lumias.entries()) {
  if (!l.lumiaName) warnings.push(`Lumia ${i} missing name.`);
  names.add(String(l.lumiaName || '').toLowerCase());
  behaviorStarts.add(String(l.lumiaBehavior || '').slice(0, 80).toLowerCase());
  const wc = wordCount(l.lumiaDefinition) + wordCount(l.lumiaPersonality) + wordCount(l.lumiaBehavior);
  if (wc < 80) warnings.push(`${l.lumiaName || `Lumia ${i}`} may be underdeveloped.`);
  if (wc > 650) warnings.push(`${l.lumiaName || `Lumia ${i}`} may be token-heavy.`);
  if (!/advise|analysis|story|tool|council|generation|suggest|focus|do not/i.test(l.lumiaBehavior || '')) {
    warnings.push(`${l.lumiaName || `Lumia ${i}`} behavior may lack advisory boundaries.`);
  }
}

if (names.size === lumias.length && behaviorStarts.size === lumias.length) distinct = 8;
if (warnings.length) {
  council -= Math.min(3, warnings.length / 3);
  distinct -= Math.min(2, warnings.length / 5);
}

const scores = {
  purpose: clamp(purpose),
  schema: clamp(schema),
  councilUsefulness: clamp(council),
  distinctiveness: clamp(distinct),
  tokenEconomy: clamp(token),
};
const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length * 10);

console.log(JSON.stringify({ file, packName: pack.packName, counts: { lumias: lumias.length }, overall, scores, warnings }, null, 2));

