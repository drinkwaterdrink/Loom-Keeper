#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node score-text-artifact.mjs <file.md>');
  process.exit(2);
}

const text = readFileSync(file, 'utf8');
const warnings = [];
const words = text.trim().split(/\s+/).filter(Boolean).length;
const hasPurpose = /purpose|mission|goal|user value|workflow/i.test(text);
const hasValidation = /validation|test|check|import|build|scanner/i.test(text);
const hasFailure = /failure|degrade|fallback|risk|warning/i.test(text);
const hasLumiverse = /Lumiverse|Spindle|Lumia|Loom|Council|World Book|preset/i.test(text);

if (!hasPurpose) warnings.push('No obvious purpose/workflow section.');
if (!hasValidation) warnings.push('No validation/test section.');
if (!hasFailure) warnings.push('No failure/risk handling.');
if (!hasLumiverse) warnings.push('No obvious Lumiverse-native surface references.');
if (words > 2500) warnings.push('Text may be too large for routine prompt injection.');

const score = Math.max(0, 100 - warnings.length * 12 - (words > 2500 ? 10 : 0));
console.log(JSON.stringify({ file, words, score, checks: { hasPurpose, hasValidation, hasFailure, hasLumiverse }, warnings }, null, 2));

