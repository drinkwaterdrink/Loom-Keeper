#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '.');
const findings = [];

function add(severity, message, location = target) {
  findings.push({ severity, message, location });
}

function readJson(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch (error) { add('Critical', `Invalid JSON: ${error.message}`, file); return null; }
}

function scanBackend(file) {
  if (!existsSync(file)) return;
  const text = readFileSync(file, 'utf8');
  const redFlags = [
    ['Critical', 'direct filesystem access', /\b(?:node:fs|readFileSync|writeFileSync|Bun\.file|Bun\.write)\b/],
    ['Critical', 'subprocess/system access', /\bchild_process\b|\bBun\.spawn\b|\bprocess\.(?:env|exit|kill)\b/],
    ['High', 'dynamic code execution', /\beval\s*\(|\bFunction\s*\(|new\s+Function\b/],
  ];
  for (const [severity, label, regex] of redFlags) {
    if (regex.test(text)) add(severity, `Backend bundle contains ${label}`, file);
  }
}

if (statSync(target).isDirectory()) {
  const manifestPath = path.join(target, 'spindle.json');
  if (existsSync(manifestPath)) {
    const manifest = readJson(manifestPath);
    if (manifest) {
      if (!/^[a-z][a-z0-9_]*$/.test(manifest.identifier || '')) add('Critical', 'Invalid spindle identifier', manifestPath);
      const sourceFallbacks = {
        entry_backend: 'src/backend.ts',
        entry_frontend: 'src/frontend.ts',
      };
      for (const entry of ['entry_backend', 'entry_frontend']) {
        if (manifest[entry] && !existsSync(path.join(target, manifest[entry]))) {
          const sourceFallback = sourceFallbacks[entry];
          const severity = sourceFallback && existsSync(path.join(target, sourceFallback)) ? 'Medium' : 'Critical';
          add(severity, `${entry} does not exist yet: ${manifest[entry]}`, manifestPath);
        }
      }
      if ((manifest.permissions || []).includes('chat_mutation')) add('Medium', 'chat_mutation permission requires strong justification', manifestPath);
      if ((manifest.permissions || []).includes('app_manipulation')) add('Medium', 'app_manipulation permission requires strong justification', manifestPath);
      if (manifest.entry_backend) scanBackend(path.join(target, manifest.entry_backend));
    }
  } else {
    const jsonFiles = readdirSync(target).filter((name) => name.endsWith('.json'));
    for (const name of jsonFiles) {
      const file = path.join(target, name);
      const json = readJson(file);
      if (json?.lumiaItems || json?.packName) auditPack(json, file);
    }
  }
} else if (target.endsWith('.json')) {
  const json = readJson(target);
  if (json?.lumiaItems || json?.packName) auditPack(json, target);
} else if (target.endsWith('.js')) {
  scanBackend(target);
}

function auditPack(pack, file) {
  for (const key of ['packName', 'packAuthor', 'coverUrl', 'version', 'packExtras', 'lumiaItems', 'loomItems']) {
    if (!(key in pack)) add('Critical', `Pack missing field ${key}`, file);
  }
  if (Array.isArray(pack.lumiaItems)) {
    pack.lumiaItems.forEach((lumia, index) => {
      for (const key of ['lumiaName', 'lumiaDefinition', 'lumiaPersonality', 'lumiaBehavior', 'avatarUrl', 'genderIdentity', 'authorName', 'version']) {
        if (!(key in lumia)) add('High', `Lumia ${index} missing ${key}`, file);
      }
      if ((lumia.lumiaBehavior || '').length < 80) add('Medium', `Lumia ${index} behavior looks thin`, file);
    });
  }
  if (Array.isArray(pack.loomItems) && pack.loomItems.length) add('Medium', 'loomItems present; verify raw schema against export', file);
  if (Array.isArray(pack.packExtras) && pack.packExtras.length) add('Medium', 'packExtras present; verify raw schema against export', file);
}

if (!findings.length) {
  console.log(JSON.stringify({ target, status: 'ok', findings: [] }, null, 2));
} else {
  console.log(JSON.stringify({ target, status: 'findings', findings }, null, 2));
  process.exit(findings.some((f) => f.severity === 'Critical') ? 1 : 0);
}
