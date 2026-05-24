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

export function sanitizeDomHtml(html: string): string {
  if (typeof document === 'undefined') {
    return '';
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    // Strict Presentation Elements Allowlist
    const allowedTags = new Set([
      'div', 'section', 'article', 'header', 'footer', 'span', 'p', 'b', 'strong', 
      'i', 'em', 'small', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'details', 'summary', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'br'
    ]);

    // Strict Safe Attributes Allowlist (No inline style attribute is allowed)
    const allowedAttrs = new Set([
      'class', 'title', 'aria-label', 'role'
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

        // 2. Enforce strict Attributes Allowlist (No event handlers, no inline styles)
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

export function renderTrackerHtml(tracker: LoomTrackerState, preset: LoomPreset): string {
  const data = {
    ...tracker.data,
    density: preset.renderOptions.density,
    theme: preset.renderOptions.theme,
    compactSummary: tracker.compactSummary,
  };

  try {
    const rawHtml = renderTemplate(preset.htmlTemplate, data);
    
    // Custom presets undergo strict allowlist DOM sanitization; built-ins remain rich
    const isCustom = !builtInPresets.some((p) => p.id === preset.id);
    if (isCustom) {
      return sanitizeDomHtml(rawHtml);
    }
    return rawHtml;
  } catch (error) {
    console.error('Loom template rendering failed, falling back to safe card:', error);
    // Safe fallback default layout: guaranteed never to crash the UI
    const title = escapeHtml(tracker.compactSummary || 'Continuity State');
    return `
      <section class="sotl-card sotl-density-compact sotl-theme-system" data-sotl-card="true">
        <header class="sotl-card__head">
          <div class="sotl-card__header-main">
            <div class="sotl-card__eyebrow">State of the Loom (Fallback)</div>
            <h3 class="sotl-card__title">${title}</h3>
          </div>
        </header>
        <p class="sotl-delta">${escapeHtml(tracker.compactSummary || 'Continuity render failed due to a template rendering error.')}</p>
      </section>
    `;
  }
}

export function makeCompactSummary(data: Record<string, unknown>): string {
  const scene = String(data.sceneTitle || data.location || 'Current scene');
  const delta = String(data.delta || data.activeThread || '').trim();
  return delta ? `${scene}: ${delta}` : scene;
}
