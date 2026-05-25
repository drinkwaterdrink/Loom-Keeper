import type { LoomPreset, LoomRenderReport, LoomTrackerState } from './types.js';
import { builtInPresets } from './defaults.js';

export function safeObjectToString(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val !== 'object') return String(val);
  if (Array.isArray(val)) return val.map(safeObjectToString).join(', ');

  const obj = val as Record<string, unknown>;
  const keys = ['text', 'value', 'label', 'name', 'title', 'summary', 'description'];
  for (const key of keys) {
    if (key in obj && obj[key] !== undefined && obj[key] !== null && typeof obj[key] !== 'object') {
      return String(obj[key]);
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
  let cleanPath = path;
  if (cleanPath.startsWith('this.')) {
    cleanPath = cleanPath.slice(5);
  } else if (cleanPath === 'this') {
    return data;
  }
  return cleanPath.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object') return '';
    return (current as Record<string, unknown>)[part] ?? '';
  }, data);
}

function truthy(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function renderTemplate(template: string, data: Record<string, unknown>, missingFields: Set<string> = new Set()): string {
  let output = template;

  const sectionPattern = /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g;
  output = output.replace(sectionPattern, (_match, path: string, inner: string) => {
    return truthy(readPath(data, path)) ? renderTemplate(inner, data, missingFields) : '';
  });

  const eachPattern = /{{#each\s+([\w.]+)}}([\s\S]*?){{\/each}}/g;
  output = output.replace(eachPattern, (_match, path: string, inner: string) => {
    const value = readPath(data, path);
    if (value === '' || value === undefined || value === null) missingFields.add(path);
    if (!Array.isArray(value) || value.length === 0) return '<p class="sotl-empty">None</p>';
    return value.map((item) => {
      const scope = item && typeof item === 'object' ? item as Record<string, unknown> : { '.': item };
      return renderTemplate(inner, { ...data, ...scope, '.': item }, missingFields);
    }).join('');
  });

  return output.replace(/{{\s*([\w.]+|\.)\s*}}/g, (_match, path: string) => {
    const value = readPath(data, path);
    if (value === '' || value === undefined || value === null) missingFields.add(path);
    return escapeHtml(value);
  });
}

export function sanitizeDomHtml(html: string): string {
  if (typeof document === 'undefined') return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    const allowedTags = new Set([
      'div', 'section', 'article', 'header', 'footer', 'span', 'p', 'b', 'strong',
      'i', 'em', 'small', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'details', 'summary',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'br', 'style',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
      'svg', 'path', 'line', 'rect', 'circle', 'polygon', 'ellipse', 'g', 'text', 'defs', 'lineargradient', 'stop',
    ]);

    const allowedAttrs = new Set([
      'class', 'title', 'aria-label', 'role', 'style',
      'viewbox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'x', 'y', 'width', 'height',
      'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'transform', 'points', 'opacity',
      'colspan', 'rowspan', 'cellspacing', 'cellpadding', 'border', 'id',
      'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform',
    ]);

    function sanitizeNode(node: Node): Node | null {
      if (node.nodeType === Node.TEXT_NODE) return node;

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (!allowedTags.has(tag)) return null;

        const cleanEl = document.createElement(tag);
        for (let i = 0; i < el.attributes.length; i += 1) {
          const attr = el.attributes[i];
          const name = attr.name.toLowerCase();
          if (!allowedAttrs.has(name) && !name.startsWith('data-')) continue;

          const value = attr.value;
          const cleanVal = value.trim().toLowerCase();
          if (cleanVal.includes('javascript:') || cleanVal.includes('data:')) continue;
          cleanEl.setAttribute(name, value);
        }

        let child = el.firstChild;
        while (child) {
          const cleanChild = sanitizeNode(child);
          if (cleanChild) cleanEl.appendChild(cleanChild);
          child = child.nextSibling;
        }

        return cleanEl;
      }

      return null;
    }

    const cleanBody = document.createElement('body');
    let rootChild = body.firstChild;
    while (rootChild) {
      const cleanChild = sanitizeNode(rootChild);
      if (cleanChild) cleanBody.appendChild(cleanChild);
      rootChild = rootChild.nextSibling;
    }

    return cleanBody.innerHTML;
  } catch (err) {
    console.error('DOM Parser sanitization failed:', err);
    return '';
  }
}

export function getFallbackField(data: Record<string, unknown>, keys: string[]): unknown {
  if (!data || typeof data !== 'object') return undefined;
  for (const key of keys) {
    if (key in data) return data[key];
    const lowerKey = key.toLowerCase();
    for (const k of Object.keys(data)) {
      if (k.toLowerCase() === lowerKey) return data[k];
    }
  }
  return undefined;
}

function isCustomPreset(preset: LoomPreset): boolean {
  return !builtInPresets.some((p) => p.id === preset.id);
}

function isVisuallyEmptyHtml(html: string, missingFields: string[]): boolean {
  if (!html.trim()) return true;
  if (typeof document === 'undefined') return false;
  try {
    const template = document.createElement('template');
    template.innerHTML = html;
    const text = (template.content.textContent || '').replace(/\s+/g, '').trim();
    const hasVisualElement = Boolean(template.content.querySelector('svg,path,rect,circle,line,polygon,ellipse,table,td,th,hr'));
    return missingFields.length > 0 && !text && !hasVisualElement;
  } catch {
    return false;
  }
}

function renderValueBlock(value: unknown, depth = 0): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value !== 'object') return `<span>${escapeHtml(String(value))}</span>`;
  if (depth >= 3) return `<pre class="sotl-code">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;

  if (Array.isArray(value)) {
    if (value.length === 0) return '<p class="sotl-empty">None</p>';
    const items = value.slice(0, 12).map((item) => {
      if (item && typeof item === 'object') return `<li>${renderValueBlock(item, depth + 1)}</li>`;
      return `<li>${escapeHtml(String(item))}</li>`;
    }).join('');
    const more = value.length > 12 ? `<li>${escapeHtml(`+${value.length - 12} more`)}</li>` : '';
    return `<ul class="sotl-anchors-list">${items}${more}</ul>`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== '')
    .slice(0, 16);
  if (entries.length === 0) return '<p class="sotl-empty">None</p>';
  return `<dl class="sotl-grid">${entries.map(([key, entryValue]) => `
    <div class="sotl-grid-item">
      <dt>${escapeHtml(key)}</dt>
      <dd>${renderValueBlock(entryValue, depth + 1)}</dd>
    </div>
  `).join('')}</dl>`;
}

export function renderGenericSafeCard(tracker: LoomTrackerState, preset: LoomPreset, warningMessage?: string): string {
  const title = escapeHtml(String(getFallbackField(tracker.data, ['sceneTitle', 'title', 'name', 'sceneName', 'scene']) || 'Continuity State'));
  const mood = escapeHtml(String(getFallbackField(tracker.data, ['mood', 'tone', 'emotion', 'scene_mood']) || ''));
  const density = preset.renderOptions?.density || 'compact';
  const theme = preset.renderOptions?.theme || 'system';

  const warningHtml = warningMessage
    ? `
      <div class="sotl-pipeline-warning" style="margin-bottom: 8px; padding: 6px 10px; background: rgba(220,10,10,0.06); border: 1px solid rgba(220,10,10,0.15); border-radius: 4px; font-size: 11px; color: var(--lv-error-text, #bd2130);">
        <strong>Notice:</strong> ${escapeHtml(warningMessage)}
      </div>
    `
    : '';

  const rows: string[] = [];
  const details: string[] = [];

  for (const [key, value] of Object.entries(tracker.data)) {
    if (key === 'schemaVersion' || key === 'schema_version') continue;
    if (['scenetitle', 'title', 'name', 'mood', 'tone', 'emotion', 'scenemood'].includes(key.toLowerCase())) continue;
    if (value === null || value === undefined || value === '') continue;

    if (Array.isArray(value) || typeof value === 'object') {
      details.push(`
        <details class="sotl-card-details" ${Array.isArray(value) ? 'open' : ''}>
          <summary>${escapeHtml(key)}</summary>
          ${renderValueBlock(value)}
        </details>
      `);
      continue;
    }

    rows.push(`
      <div class="sotl-grid-item">
        <dt>${escapeHtml(key)}</dt>
        <dd>${escapeHtml(String(value))}</dd>
      </div>
    `);
  }

  const gridHtml = rows.length > 0 ? `<dl class="sotl-grid">${rows.join('')}</dl>` : '';

  return `
    <section class="sotl-card sotl-density-${density} sotl-theme-${theme}" data-sotl-card="true">
      <header class="sotl-card__head">
        <div class="sotl-card__header-main">
          <div class="sotl-card__eyebrow">State of the Loom (Safe Renderer)</div>
          <h3 class="sotl-card__title">${title}</h3>
        </div>
        ${mood ? `<span class="sotl-pill sotl-pill--mood">${mood}</span>` : ''}
      </header>
      ${warningHtml}
      ${gridHtml}
      ${details.join('')}
    </section>
  `;
}

export function renderTrackerHtmlDetailed(tracker: LoomTrackerState, preset: LoomPreset, useSafeRenderer = false): LoomRenderReport {
  if (useSafeRenderer) {
    return {
      html: renderGenericSafeCard(tracker, preset, 'Safe generic renderer active.'),
      success: true,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      warning: 'Safe generic renderer active.',
      missingFields: [],
    };
  }

  const data = {
    ...tracker.data,
    data: tracker.data,
    density: preset.renderOptions.density,
    theme: preset.renderOptions.theme,
    compactSummary: tracker.compactSummary,
  };

  try {
    const missingFields = new Set<string>();
    const rawHtml = renderTemplate(preset.htmlTemplate, data, missingFields);
    const missing = [...missingFields];

    if (isCustomPreset(preset)) {
      const sanitized = sanitizeDomHtml(rawHtml);
      if (!sanitized || sanitized.trim() === '') {
        throw new Error('Purified HTML is empty. The template might have invalid/unsupported tags or failed sanitization.');
      }
      if (isVisuallyEmptyHtml(sanitized, missing)) {
        throw new Error(`Custom template rendered no visible tracker content. Missing fields: ${missing.join(', ') || 'unknown'}.`);
      }
      return {
        html: sanitized,
        success: true,
        fallbackUsed: false,
        sanitizerRemovedContent: sanitized.trim() !== rawHtml.trim(),
        warning: missing.length > 0 ? `Missing template fields: ${missing.join(', ')}` : undefined,
        missingFields: missing,
      };
    }

    return {
      html: rawHtml,
      success: true,
      fallbackUsed: false,
      sanitizerRemovedContent: false,
      warning: missing.length > 0 ? `Missing template fields: ${missing.join(', ')}` : undefined,
      missingFields: missing,
    };
  } catch (error) {
    console.error('Loom template rendering failed, falling back to safe card:', error);
    const message = `Custom template failed: ${error instanceof Error ? error.message : String(error)}`;
    return {
      html: renderGenericSafeCard(tracker, preset, message),
      success: false,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      warning: message,
      error: error instanceof Error ? error.message : String(error),
      missingFields: [],
    };
  }
}

export function renderTrackerHtml(tracker: LoomTrackerState, preset: LoomPreset, useSafeRenderer = false): string {
  return renderTrackerHtmlDetailed(tracker, preset, useSafeRenderer).html;
}

export function makeCompactSummary(data: Record<string, unknown>): string {
  const scene = String(data.sceneTitle || data.location || data.title || data.name || 'Current scene');
  const delta = String(data.delta || data.activeThread || data.summary || data.description || '').trim();
  return delta ? `${scene}: ${delta}` : scene;
}
