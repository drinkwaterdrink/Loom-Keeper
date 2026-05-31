#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const [inputFile, outputFile] = process.argv.slice(2);
if (!inputFile || !outputFile) {
  console.error('Usage: node normalize-worldbook-entries.mjs <entries.json> <out.json>');
  process.exit(2);
}

const input = JSON.parse(readFileSync(inputFile, 'utf8'));
const entries = Array.isArray(input) ? input : input.entries || [];

const normalized = entries.map((entry, index) => ({
  key: Array.isArray(entry.key) ? entry.key : Array.isArray(entry.keys) ? entry.keys : entry.key ? [String(entry.key)] : [],
  keysecondary: Array.isArray(entry.keysecondary) ? entry.keysecondary : Array.isArray(entry.secondaryKeys) ? entry.secondaryKeys : [],
  content: String(entry.content || entry.text || ''),
  comment: String(entry.comment || entry.name || `Entry ${index + 1}`),
  position: Number(entry.position ?? 0),
  depth: Number(entry.depth ?? 4),
  role: entry.role ?? null,
  order_value: Number(entry.order_value ?? entry.order ?? 100),
  selective: Boolean(entry.selective ?? false),
  constant: Boolean(entry.constant ?? false),
  disabled: Boolean(entry.disabled ?? false),
  probability: Number(entry.probability ?? 100),
  use_probability: Boolean(entry.use_probability ?? false),
  case_sensitive: Boolean(entry.case_sensitive ?? false),
  match_whole_words: Boolean(entry.match_whole_words ?? true),
  use_regex: Boolean(entry.use_regex ?? false),
  prevent_recursion: Boolean(entry.prevent_recursion ?? false),
  priority: Number(entry.priority ?? 10),
  sticky: Number(entry.sticky ?? 0),
  cooldown: Number(entry.cooldown ?? 0),
  delay: Number(entry.delay ?? 0),
  extensions: entry.extensions || {},
}));

writeFileSync(outputFile, `${JSON.stringify({ entries: normalized }, null, 2)}\n`, 'utf8');
console.log(`Wrote ${normalized.length} normalized entries to ${outputFile}`);

