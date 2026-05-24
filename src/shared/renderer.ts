import type { LoomPreset, LoomTrackerState } from './types.js';

export function safeObjectToString(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val !== 'object') return String(val);
  if (Array.isArray(val)) {
    return val.map(safeObjectToString).join(', ');
  }
  const obj = val as Record<string, unknown>;
  const keys = ['text', 'value', 'label', 'name', 'title', 'summary', 'description'];
  for (const key of keys) {
    if (key in obj && obj[key] !== undefined && obj[key] !== null) {
      const fieldVal = obj[key];
      if (typeof fieldVal !== 'object') {
        return String(fieldVal);
      }
    }
  }
  try {
    return JSON.stringify(obj);
  } catch {
    return '[Object]';
  }
}

function escapeHtml(value: unknown): string {
  return safeObjectToString(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readPath(data: unknown, path: string): unknown {
  if (path === '.') return data;
  return path.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return '';
    return (current as Record<string, unknown>)[part] ?? '';
  }, data);
}

function truthy(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function renderTemplate(template: string, data: Record<string, unknown>): string {
  let output = template;

  const sectionPattern = /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g;
  output = output.replace(sectionPattern, (_match, path: string, inner: string) => {
    return truthy(readPath(data, path)) ? renderTemplate(inner, data) : '';
  });

  const eachPattern = /{{#each\s+([\w.]+)}}([\s\S]*?){{\/each}}/g;
  output = output.replace(eachPattern, (_match, path: string, inner: string) => {
    const value = readPath(data, path);
    if (!Array.isArray(value) || value.length === 0) return '<p class="sotl-empty">None</p>';
    return value.map((item) => {
      const scope = item && typeof item === 'object' ? item as Record<string, unknown> : { '.': item };
      return renderTemplate(inner, { ...data, ...scope, '.': item });
    }).join('');
  });

  return output.replace(/{{\s*([\w.]+|\.)\s*}}/g, (_match, path: string) => escapeHtml(readPath(data, path)));
}

export function renderTrackerHtml(tracker: LoomTrackerState, preset: LoomPreset): string {
  const data = {
    ...tracker.data,
    density: preset.renderOptions.density,
    theme: preset.renderOptions.theme,
    compactSummary: tracker.compactSummary,
  };
  return renderTemplate(preset.htmlTemplate, data);
}

export function makeCompactSummary(data: Record<string, unknown>): string {
  const scene = String(data.sceneTitle || data.location || 'Current scene');
  const delta = String(data.delta || data.activeThread || '').trim();
  return delta ? `${scene}: ${delta}` : scene;
}
