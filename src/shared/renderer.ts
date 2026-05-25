import type { LoomPreset, LoomTrackerState } from './types.js';
import { builtInPresets } from './defaults.js';

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

export function sanitizeDomHtml(html: string): string {
  if (typeof document === 'undefined') {
    return '';
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    // Strict Presentation Elements Allowlist (including style, table, and SVG structures)
    const allowedTags = new Set([
      'div', 'section', 'article', 'header', 'footer', 'span', 'p', 'b', 'strong', 
      'i', 'em', 'small', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'details', 'summary', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'br', 'style',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
      'svg', 'path', 'line', 'rect', 'circle', 'polygon', 'ellipse', 'g', 'text', 'defs', 'lineargradient', 'stop'
    ]);

    // Strict Safe Attributes Allowlist (allowing inline styles, table dimensions, and SVG parameters)
    const allowedAttrs = new Set([
      'class', 'title', 'aria-label', 'role', 'style',
      'viewbox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'transform', 'points', 'opacity',
      'colspan', 'rowspan', 'cellspacing', 'cellpadding', 'border', 'id', 'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform'
    ]);

    function sanitizeNode(node: Node): Node | null {
      if (node.nodeType === Node.TEXT_NODE) {
        return node;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        // 1. Enforce strict Tag Allowlist
        if (!allowedTags.has(tag)) {
          return null;
        }

        const cleanEl = document.createElement(tag);

        // 2. Enforce strict Attributes Allowlist (No event handlers, allowing inline styles)
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          const name = attr.name.toLowerCase();

          if (allowedAttrs.has(name) || name.startsWith('data-')) {
            const value = attr.value;
            const cleanVal = value.trim().toLowerCase();
            
            // 3. Block Javascript link URIs or HTML data URIs
            if (cleanVal.includes('javascript:') || cleanVal.includes('data:')) {
              continue;
            }
            cleanEl.setAttribute(name, value);
          }
        }

        // 4. Recursively sanitize children
        let child = el.firstChild;
        while (child) {
          const cleanChild = sanitizeNode(child);
          if (cleanChild) {
            cleanEl.appendChild(cleanChild);
          }
          child = child.nextSibling;
        }

        return cleanEl;
      }

      return null;
    }

    // Build purified DOM tree
    const cleanBody = document.createElement('body');
    let rootChild = body.firstChild;
    while (rootChild) {
      const cleanChild = sanitizeNode(rootChild);
      if (cleanChild) {
        cleanBody.appendChild(cleanChild);
      }
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
    if (key in data) {
      return data[key];
    }
    // Case-insensitive fallback
    const lowerKey = key.toLowerCase();
    for (const k of Object.keys(data)) {
      if (k.toLowerCase() === lowerKey) {
        return data[k];
      }
    }
  }
  return undefined;
}

export function renderGenericSafeCard(tracker: LoomTrackerState, preset: LoomPreset, warningMessage?: string): string {
  const title = escapeHtml(String(getFallbackField(tracker.data, ['sceneTitle', 'title', 'name', 'sceneName', 'scene']) || 'Continuity State'));
  const mood = escapeHtml(String(getFallbackField(tracker.data, ['mood', 'tone', 'emotion', 'scene_mood']) || ''));
  
  let warningHtml = '';
  if (warningMessage) {
    warningHtml = `
      <div class="sotl-pipeline-warning" style="margin-bottom: 8px; padding: 6px 10px; background: rgba(220,10,10,0.06); border: 1px solid rgba(220,10,10,0.15); border-radius: 4px; font-size: 11px; color: var(--lv-error-text, #bd2130);">
        <strong>⚠️ Notice:</strong> ${escapeHtml(warningMessage)}
      </div>
    `;
  }

  const density = preset.renderOptions?.density || 'compact';
  const theme = preset.renderOptions?.theme || 'system';

  // Compile entries dynamically
  const rows: string[] = [];
  const details: string[] = [];

  for (const [key, value] of Object.entries(tracker.data)) {
    if (key === 'schemaVersion' || key === 'schema_version') continue;
    // Skip title, mood, location, time if we render them at the top
    if (['scenetitle', 'title', 'name', 'mood', 'tone', 'emotion', 'scenemood'].includes(key.toLowerCase())) continue;

    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      const itemsHtml = value.map((item) => {
        if (item && typeof item === 'object') {
          const props = Object.entries(item)
            .map(([k, v]) => `<strong>${escapeHtml(k)}:</strong> ${escapeHtml(safeObjectToString(v))}`)
            .join(' • ');
          return `<div style="font-size: 11px; padding: 4px; background: rgba(255,255,255,0.03); border-radius: 4px; margin-bottom: 2px;">${props}</div>`;
        }
        return `<li>${escapeHtml(safeObjectToString(item))}</li>`;
      }).join('');

      const listContent = value[0] && typeof value[0] === 'object'
        ? `<div style="display: grid; gap: 4px; margin-top: 4px;">${itemsHtml}</div>`
        : `<ul class="sotl-anchors-list">${itemsHtml}</ul>`;

      details.push(`
        <details class="sotl-card-details" open>
          <summary>${escapeHtml(key)}</summary>
          ${listContent}
        </details>
      `);
    } else if (typeof value === 'object') {
      details.push(`
        <details class="sotl-card-details">
          <summary>${escapeHtml(key)}</summary>
          <pre style="font-size: 10px; margin: 4px 0 0; white-space: pre-wrap; font-family: monospace;">${escapeHtml(JSON.stringify(value, null, 2))}</pre>
        </details>
      `);
    } else {
      rows.push(`
        <div class="sotl-grid-item">
          <dt>${escapeHtml(key)}</dt>
          <dd>${escapeHtml(String(value))}</dd>
        </div>
      `);
    }
  }

  const gridHtml = rows.length > 0
    ? `<dl class="sotl-grid">${rows.join('')}</dl>`
    : '';

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

export function renderTrackerHtml(tracker: LoomTrackerState, preset: LoomPreset, useSafeRenderer = false): string {
  if (useSafeRenderer) {
    return renderGenericSafeCard(tracker, preset, 'Safe generic renderer active.');
  }

  const data = {
    ...tracker.data,
    data: tracker.data, // Map data property to itself for backward compatibility with WTracker templates
    density: preset.renderOptions.density,
    theme: preset.renderOptions.theme,
    compactSummary: tracker.compactSummary,
  };

  try {
    const rawHtml = renderTemplate(preset.htmlTemplate, data);
    
    // Custom presets undergo strict allowlist DOM sanitization; built-ins remain rich
    const isCustom = !builtInPresets.some((p) => p.id === preset.id);
    if (isCustom) {
      const sanitized = sanitizeDomHtml(rawHtml);
      if (!sanitized || sanitized.trim() === '') {
        throw new Error('Purified HTML is empty. The template might have invalid/unsupported tags or failed sanitization.');
      }
      return sanitized;
    }
    return rawHtml;
  } catch (error) {
    console.error('Loom template rendering failed, falling back to safe card:', error);
    return renderGenericSafeCard(
      tracker,
      preset,
      `Custom template failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export function makeCompactSummary(data: Record<string, unknown>): string {
  const scene = String(data.sceneTitle || data.location || 'Current scene');
  const delta = String(data.delta || data.activeThread || '').trim();
  return delta ? `${scene}: ${delta}` : scene;
}
