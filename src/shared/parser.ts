import type { LoomParseResult } from './types.js';

function findMatchingBrace(text: string, start: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function parseJsonObject(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const firstBrace = trimmed.indexOf('{');
  if (firstBrace < 0) throw new Error('No JSON object found.');
  const lastBrace = findMatchingBrace(trimmed, firstBrace);
  if (lastBrace < 0) throw new Error('JSON object is not closed.');
  const objectText = trimmed.slice(firstBrace, lastBrace + 1);
  const parsed: unknown = JSON.parse(objectText);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Tracker JSON must be an object.');
  }
  return parsed as Record<string, unknown>;
}

export function extractTrackerBlock(content: string, fenceNames: string[]): LoomParseResult {
  const names = fenceNames.length > 0 ? fenceNames : ['tracker', 'loom'];
  const escapedNames = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const fencePattern = new RegExp('```\\s*(' + escapedNames + ')\\s*\\r?\\n([\\s\\S]*?)\\r?\\n```', 'i');
  const match = fencePattern.exec(content);
  if (!match) return { found: false };

  const rawBlock = match[0];
  const fenceName = match[1] || 'tracker';
  const body = match[2] || '';
  try {
    const data = parseJsonObject(body);
    const cleanedContent = content.slice(0, match.index) + content.slice(match.index + rawBlock.length);
    return { found: true, data, rawBlock, cleanedContent, fenceName };
  } catch (error) {
    return {
      found: true,
      rawBlock,
      error: error instanceof Error ? error.message : String(error),
      fenceName,
    };
  }
}

export function stringifyTracker(data: Record<string, unknown>): string {
  return JSON.stringify(data, null, 2);
}
