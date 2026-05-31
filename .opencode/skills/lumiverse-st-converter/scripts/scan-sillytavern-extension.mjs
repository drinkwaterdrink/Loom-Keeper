#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const maxFiles = 500;
const patterns = [
  ['extension_settings', /extension_settings/g],
  ['eventSource hooks', /eventSource\.(?:on|once|makeFirst|makeLast)/g],
  ['jQuery/DOM patching', /\$\(.*\)|document\.querySelector|appendChild|insertAdjacentHTML/g],
  ['slash commands', /SlashCommand|SlashCommandParser|registerSlashCommand/g],
  ['quick replies', /quickReply|QuickReply|quick_reply/g],
  ['chat metadata', /chat_metadata|chatMetadata/g],
  ['world info/lorebook', /world_info|WorldInfo|lorebook|worldbook/gi],
  ['regex scripts', /regex|Regex/g],
  ['fetch/network', /\bfetch\s*\(|XMLHttpRequest|axios/g],
  ['eval/dynamic code', /\beval\s*\(|new\s+Function|\bFunction\s*\(/g],
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (files.length >= maxFiles) return files;
    if (['node_modules', '.git', 'dist', 'build'].includes(name)) continue;
    const full = path.join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (/\.(js|ts|json|html|css|md)$/i.test(name)) files.push(full);
  }
  return files;
}

const files = statSync(root).isDirectory() ? walk(root) : [root];
const findings = new Map(patterns.map(([name]) => [name, []]));

for (const file of files) {
  let text = '';
  try { text = readFileSync(file, 'utf8'); } catch { continue; }
  for (const [name, regex] of patterns) {
    const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
    const matches = [...text.matchAll(new RegExp(regex.source, flags))];
    if (matches.length) findings.get(name).push({ file, count: matches.length });
  }
}

console.log(JSON.stringify({
  root,
  scannedFiles: files.length,
  findings: Object.fromEntries([...findings.entries()].filter(([, value]) => value.length)),
}, null, 2));
