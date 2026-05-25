import type {
  LoomCustomTemplateMode,
  LoomPreset,
  LoomRenderReport,
  LoomTemplateCompatibilityReport,
  LoomTemplateEngine,
  LoomTemplateSourceFormat,
  LoomTrackerState,
} from './types.js';
import { builtInPresets } from './defaults.js';

type RenderNode =
  | { type: 'text'; value: string }
  | { type: 'var'; expression: string }
  | { type: 'each'; expression: string; body: RenderNode[]; alternate: RenderNode[] }
  | { type: 'if'; branches: Array<{ expression: string; body: RenderNode[] }>; alternate: RenderNode[]; inverted: boolean };

type TemplateToken = {
  command: string;
  start: number;
  end: number;
};

type RenderContext = {
  root: Record<string, unknown>;
  current: unknown;
  locals: Record<string, unknown>;
  missingFields: Set<string>;
  usedFields: Set<string>;
};

const HELPER_NAMES = new Set([
  'eq', 'eqi', 'gt', 'gte', 'lt', 'lte', 'and', 'or', 'not',
  'add', 'subtract', 'multiply', 'divide', 'divideRoundUp', 'abs',
  'initials', 'rawFirstLetter', 'slugifyDash', 'slugifyUnderscore', 'camelCase',
  'clampPercent', 'percentOf',
]);

export function safeObjectToString(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val !== 'object') return String(val);
  if (Array.isArray(val)) return val.map(safeObjectToString).filter(Boolean).join(', ');

  const obj = val as Record<string, unknown>;
  const keys = ['text', 'value', 'label', 'name', 'title', 'summary', 'description', 'status'];
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

function stripHtml(html: string): string {
  return html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizePath(path: string): string {
  return path.trim().replace(/^\.\//, '').replace(/^\$root\./, '');
}

function readRecordPath(source: unknown, rawPath: string): unknown {
  if (!rawPath) return undefined;
  if (rawPath === '.' || rawPath === 'this') return source;
  let path = normalizePath(rawPath);
  if (path.startsWith('this.')) path = path.slice(5);
  const parts = path.split('.').filter(Boolean);
  let current = source;
  for (const part of parts) {
    if (part === 'length' && Array.isArray(current)) return current.length;
    if (!isRecord(current) && !Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function readPath(ctx: RenderContext, rawPath: string): unknown {
  const path = normalizePath(rawPath);
  if (!path) return undefined;
  if (path in ctx.locals) return ctx.locals[path];
  if (path.startsWith('@')) return ctx.locals[path];
  if (path === '.' || path === 'this' || path.startsWith('this.')) {
    return readRecordPath(ctx.current, path);
  }

  const fromCurrent = readRecordPath(ctx.current, path);
  if (fromCurrent !== undefined && fromCurrent !== '') return fromCurrent;
  return readRecordPath(ctx.root, path);
}

function truthy(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value === 'false' || value === '0') return false;
  return Boolean(value);
}

function tokenizeExpression(expression: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote = '';
  let depth = 0;

  for (let i = 0; i < expression.length; i += 1) {
    const ch = expression[i];
    if (quote) {
      current += ch;
      if (ch === quote && expression[i - 1] !== '\\') quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === '(') {
      depth += 1;
      current += ch;
      continue;
    }
    if (ch === ')') {
      depth = Math.max(0, depth - 1);
      current += ch;
      continue;
    }
    if (/\s/.test(ch) && depth === 0) {
      if (current.trim()) tokens.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
}

function stripWrappedParens(value: string): string {
  let out = value.trim();
  while (out.startsWith('(') && out.endsWith(')')) {
    let depth = 0;
    let balanced = true;
    for (let i = 0; i < out.length; i += 1) {
      if (out[i] === '(') depth += 1;
      if (out[i] === ')') depth -= 1;
      if (depth === 0 && i < out.length - 1) {
        balanced = false;
        break;
      }
    }
    if (!balanced) break;
    out = out.slice(1, -1).trim();
  }
  return out;
}

function numberValue(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function slugify(value: unknown, separator: '-' | '_'): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, separator);
}

function callHelper(name: string, values: unknown[]): unknown {
  switch (name) {
    case 'eq': return values[0] === values[1] || String(values[0]) === String(values[1]);
    case 'eqi': return String(values[0] || '').toLowerCase() === String(values[1] || '').toLowerCase();
    case 'gt': return numberValue(values[0]) > numberValue(values[1]);
    case 'gte': return numberValue(values[0]) >= numberValue(values[1]);
    case 'lt': return numberValue(values[0]) < numberValue(values[1]);
    case 'lte': return numberValue(values[0]) <= numberValue(values[1]);
    case 'and': return values.every(truthy);
    case 'or': return values.some(truthy);
    case 'not': return !truthy(values[0]);
    case 'add': return numberValue(values[0]) + numberValue(values[1]);
    case 'subtract': return numberValue(values[0]) - numberValue(values[1]);
    case 'multiply': return numberValue(values[0]) * numberValue(values[1]);
    case 'divide': return numberValue(values[1]) === 0 ? 0 : numberValue(values[0]) / numberValue(values[1]);
    case 'divideRoundUp': return numberValue(values[1]) === 0 ? 0 : Math.ceil(numberValue(values[0]) / numberValue(values[1]));
    case 'abs': return Math.abs(numberValue(values[0]));
    case 'initials': return String(values[0] || '?')
      .replace(/[^a-zA-Z0-9\s_-]+/g, ' ')
      .trim()
      .split(/[\s_-]+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((word) => word.charAt(0).toUpperCase())
      .join('') || '?';
    case 'rawFirstLetter': return String(values[0] || '?').charAt(0) || '?';
    case 'slugifyDash': return slugify(values[0], '-');
    case 'slugifyUnderscore': return slugify(values[0], '_');
    case 'camelCase': {
      const words = String(values[0] || '').toLowerCase().replace(/[^a-z0-9\s]+/g, ' ').trim().split(/\s+/);
      return words.map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join('');
    }
    case 'clampPercent': return Math.max(0, Math.min(100, Math.round(numberValue(values[0]))));
    case 'percentOf': return numberValue(values[1]) === 0 ? 0 : Math.max(0, Math.min(100, Math.round(numberValue(values[0]) / numberValue(values[1]) * 100)));
    default: return '';
  }
}

function evalExpression(expression: string, ctx: RenderContext): unknown {
  const expr = stripWrappedParens(expression);
  if (!expr) return '';
  if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) return expr.slice(1, -1);
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  if (expr === 'null') return null;
  if (/^-?\d+(?:\.\d+)?$/.test(expr)) return Number(expr);

  const tokens = tokenizeExpression(expr);
  if (tokens.length > 1 && HELPER_NAMES.has(tokens[0])) {
    return callHelper(tokens[0], tokens.slice(1).map((token) => evalExpression(token, ctx)));
  }

  const value = readPath(ctx, expr);
  if (value === undefined || value === null || value === '') ctx.missingFields.add(expr);
  else ctx.usedFields.add(expr);
  return value ?? '';
}

function tokenizeTemplate(template: string): TemplateToken[] {
  const tokens: TemplateToken[] = [];
  const re = /{{{?\s*([^{}]+?)\s*}?}}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(template)) !== null) {
    tokens.push({ command: match[1].trim(), start: match.index, end: match.index + match[0].length });
  }
  return tokens;
}

function parseTemplate(template: string): RenderNode[] {
  const tokens = tokenizeTemplate(template);

  function parseNodes(index: number, cursor: number, shouldStop: (cmd: string) => boolean): {
    nodes: RenderNode[];
    index: number;
    cursor: number;
    stopCommand?: string;
  } {
    const nodes: RenderNode[] = [];
    while (index < tokens.length) {
      const token = tokens[index];
      const command = token.command;
      if (shouldStop(command)) {
        if (token.start > cursor) nodes.push({ type: 'text', value: template.slice(cursor, token.start) });
        return { nodes, index, cursor: token.end, stopCommand: command };
      }
      if (token.start > cursor) nodes.push({ type: 'text', value: template.slice(cursor, token.start) });
      index += 1;

      if (command.startsWith('!')) {
        cursor = token.end;
        continue;
      }

      if (command.startsWith('#each ')) {
        const expression = command.slice(6).trim();
        const bodyResult = parseNodes(index, token.end, (cmd) => cmd === '/each' || cmd === 'else');
        let alternate: RenderNode[] = [];
        let endIndex = bodyResult.index;
        if (bodyResult.stopCommand === 'else') {
          const altResult = parseNodes(bodyResult.index + 1, tokens[bodyResult.index].end, (cmd) => cmd === '/each');
          alternate = altResult.nodes;
          endIndex = altResult.index;
        }
        nodes.push({ type: 'each', expression, body: bodyResult.nodes, alternate });
        cursor = tokens[endIndex]?.end ?? bodyResult.cursor;
        index = endIndex + 1;
        continue;
      }

      if (command.startsWith('#if ') || command.startsWith('#unless ')) {
        const inverted = command.startsWith('#unless ');
        let expression = command.slice(inverted ? 8 : 4).trim();
        const branches: Array<{ expression: string; body: RenderNode[] }> = [];
        let alternate: RenderNode[] = [];
        let nextIndex = index;
        let nextCursor = token.end;
        let endIndex = index - 1;

        while (nextIndex <= tokens.length) {
          const bodyResult = parseNodes(nextIndex, nextCursor, (cmd) => cmd === (inverted ? '/unless' : '/if') || cmd === 'else' || cmd.startsWith('else if '));
          branches.push({ expression, body: bodyResult.nodes });
          endIndex = bodyResult.index;
          if (bodyResult.stopCommand?.startsWith('else if ')) {
            expression = bodyResult.stopCommand.slice(8).trim();
            nextIndex = bodyResult.index + 1;
            nextCursor = tokens[bodyResult.index].end;
            continue;
          }
          if (bodyResult.stopCommand === 'else') {
            const altResult = parseNodes(bodyResult.index + 1, tokens[bodyResult.index].end, (cmd) => cmd === (inverted ? '/unless' : '/if'));
            alternate = altResult.nodes;
            endIndex = altResult.index;
          }
          break;
        }
        nodes.push({ type: 'if', branches, alternate, inverted });
        cursor = tokens[endIndex]?.end ?? token.end;
        index = endIndex + 1;
        continue;
      }

      if (!command.startsWith('/')) {
        nodes.push({ type: 'var', expression: command });
      }
      cursor = token.end;
    }
    if (cursor < template.length) nodes.push({ type: 'text', value: template.slice(cursor) });
    return { nodes, index, cursor: template.length };
  }

  return parseNodes(0, 0, () => false).nodes;
}

function renderNodes(nodes: RenderNode[], ctx: RenderContext): string {
  return nodes.map((node) => {
    if (node.type === 'text') return node.value;
    if (node.type === 'var') return escapeHtml(evalExpression(node.expression, ctx));
    if (node.type === 'each') {
      const value = evalExpression(node.expression, ctx);
      if (!Array.isArray(value) || value.length === 0) {
        return node.alternate.length > 0 ? renderNodes(node.alternate, ctx) : '';
      }
      return value.map((item, index) => {
        const current = node.expression.trim() === 'characters' && isRecord(item)
          ? buildCharacterContext(ctx.root, item)
          : item;
        return renderNodes(node.body, {
        ...ctx,
        current,
        locals: {
          ...ctx.locals,
          '@index': index,
          '@first': index === 0,
          '@last': index === value.length - 1,
        },
      });
      }).join('');
    }
    if (node.type === 'if') {
      for (const branch of node.branches) {
        const ok = truthy(evalExpression(branch.expression, ctx));
        if (node.inverted ? !ok : ok) return renderNodes(branch.body, ctx);
      }
      return renderNodes(node.alternate, ctx);
    }
    return '';
  }).join('');
}

function darkenHexColor(value: unknown): string {
  const raw = String(value || '#475569').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return '#1f2937';
  const n = parseInt(raw, 16);
  const r = Math.max(0, Math.round(((n >> 16) & 255) * 0.72));
  const g = Math.max(0, Math.round(((n >> 8) & 255) * 0.72));
  const b = Math.max(0, Math.round((n & 255) * 0.72));
  return `#${[r, g, b].map((part) => part.toString(16).padStart(2, '0')).join('')}`;
}

function buildCharacterContext(root: Record<string, unknown>, character: Record<string, unknown>): Record<string, unknown> {
  const worldData = isRecord(root.worldData) ? root.worldData : {};
  const name = String(character.name || character.characterName || 'Character');
  const nestedStats = isRecord(character.stats) ? character.stats : {};
  const stats = { ...character, ...nestedStats };
  const bgColor = String(character.bg || stats.bg || '#475569');
  return {
    ...root,
    ...character,
    name,
    characterName: name,
    currentDate: worldData.current_date || worldData.date || root.currentDate || '',
    currentTime: worldData.current_time || worldData.time || root.currentTime || '',
    stats,
    bgColor,
    darkerBgColor: darkenHexColor(bgColor),
    reactionEmoji: Number(stats.last_react) === 1 ? '+' : Number(stats.last_react) === 2 ? '-' : '=',
    healthIcon: Number(stats.health) === 1 ? 'injured' : Number(stats.health) === 2 ? 'critical' : '',
  };
}

function buildRenderData(tracker: LoomTrackerState, preset: LoomPreset): Record<string, unknown> {
  const sceneIdentity = isRecord(tracker.data.sceneIdentity) ? tracker.data.sceneIdentity : {};
  const narrativeDelta = isRecord(tracker.data.narrativeDelta) ? tracker.data.narrativeDelta : {};
  const data: Record<string, unknown> = {
    ...tracker.data,
    data: tracker.data,
    density: preset.renderOptions.density,
    theme: preset.renderOptions.theme,
    compactSummary: tracker.compactSummary,
  };
  if (sceneIdentity.title && !data.sceneTitle) data.sceneTitle = sceneIdentity.title;
  if (sceneIdentity.location && !data.location) data.location = sceneIdentity.location;
  if (sceneIdentity.time && !data.time) data.time = sceneIdentity.time;
  if (sceneIdentity.weather && !data.weather) data.weather = sceneIdentity.weather;
  if (sceneIdentity.lighting && !data.lighting) data.lighting = sceneIdentity.lighting;
  if (sceneIdentity.mood && !data.mood) data.mood = sceneIdentity.mood;
  if (narrativeDelta.summary && !data.delta) data.delta = narrativeDelta.summary;
  return data;
}

function shouldRenderPerCharacter(template: string, data: Record<string, unknown>, preset: LoomPreset): boolean {
  if (!Array.isArray(data.characters) || data.characters.length === 0) return false;
  if (template.includes('#each characters')) return false;
  if (preset.sourceFormat !== 'simtracker' && preset.templateEngine !== 'handlebars_compat') return false;
  return /\{\{\s*(?:characterName|stats\.|bgColor|darkerBgColor|reactionEmoji|healthIcon)\b/.test(template);
}

function renderTemplate(template: string, data: Record<string, unknown>, preset: LoomPreset): {
  html: string;
  missingFields: string[];
  usedFields: string[];
} {
  const nodes = parseTemplate(template);
  const missingFields = new Set<string>();
  const usedFields = new Set<string>();
  const baseContext: RenderContext = { root: data, current: data, locals: {}, missingFields, usedFields };

  if (shouldRenderPerCharacter(template, data, preset)) {
    const characters = data.characters as unknown[];
    return {
      html: characters.map((item) => {
        const character = isRecord(item) ? item : { name: String(item) };
        const root = buildCharacterContext(data, character);
        return renderNodes(nodes, { root, current: root, locals: {}, missingFields, usedFields });
      }).join(''),
      missingFields: [...missingFields],
      usedFields: [...usedFields],
    };
  }

  return {
    html: renderNodes(nodes, baseContext),
    missingFields: [...missingFields],
    usedFields: [...usedFields],
  };
}

function cleanupTrustedHtml(html: string): { html: string; removed: boolean } {
  let cleaned = html;
  cleaned = cleaned.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '');
  cleaned = cleaned.replace(/<object\b[\s\S]*?<\/object>/gi, '');
  cleaned = cleaned.replace(/<embed\b[\s\S]*?>/gi, '');
  cleaned = cleaned.replace(/\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/g, '');
  cleaned = cleaned.replace(/javascript\s*:/gi, '');
  return { html: cleaned, removed: cleaned !== html };
}

export function sanitizeDomHtml(html: string): string {
  if (typeof document === 'undefined') return cleanupTrustedHtml(html).html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const body = doc.body;

    const allowedTags = new Set([
      'div', 'section', 'article', 'header', 'footer', 'span', 'p', 'b', 'strong',
      'i', 'em', 'small', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'details', 'summary',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'br', 'style', 'label', 'input',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
      'svg', 'path', 'line', 'rect', 'circle', 'polygon', 'ellipse', 'g', 'text', 'defs', 'lineargradient', 'stop',
    ]);

    const allowedAttrs = new Set([
      'class', 'title', 'aria-label', 'role', 'style', 'for', 'type', 'checked', 'name', 'value',
      'viewbox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'x', 'y', 'width', 'height',
      'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'transform', 'points', 'opacity',
      'colspan', 'rowspan', 'cellspacing', 'cellpadding', 'border', 'id',
      'offset', 'stop-color', 'stop-opacity', 'gradientunits', 'gradienttransform',
    ]);

    function sanitizeNode(node: Node): Node | null {
      if (node.nodeType === Node.TEXT_NODE) return node;
      if (node.nodeType !== Node.ELEMENT_NODE) return null;

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (!allowedTags.has(tag)) return null;

      const cleanEl = document.createElement(tag);
      for (let i = 0; i < el.attributes.length; i += 1) {
        const attr = el.attributes[i];
        const name = attr.name.toLowerCase();
        if (!allowedAttrs.has(name) && !name.startsWith('data-')) continue;
        const cleanVal = attr.value.trim().toLowerCase();
        if (name.startsWith('on') || cleanVal.includes('javascript:')) continue;
        cleanEl.setAttribute(name, attr.value);
      }

      let child = el.firstChild;
      while (child) {
        const cleanChild = sanitizeNode(child);
        if (cleanChild) cleanEl.appendChild(cleanChild);
        child = child.nextSibling;
      }
      return cleanEl;
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
    return cleanupTrustedHtml(html).html;
  }
}

function getByPath(data: Record<string, unknown>, path: string): unknown {
  const value = readRecordPath(data, path);
  if (value !== undefined && value !== '') return value;
  const lowerKey = path.toLowerCase();
  for (const [key, entryValue] of Object.entries(data)) {
    if (key.toLowerCase() === lowerKey) return entryValue;
  }
  return undefined;
}

export function getFallbackField(data: Record<string, unknown>, keys: string[]): unknown {
  if (!data || typeof data !== 'object') return undefined;
  for (const key of keys) {
    const value = getByPath(data, key);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function isCustomPreset(preset: LoomPreset): boolean {
  return !builtInPresets.some((p) => p.id === preset.id);
}

function resolveTemplateMode(modeOrSafe: boolean | LoomCustomTemplateMode | undefined, preset: LoomPreset): LoomCustomTemplateMode {
  if (modeOrSafe === true) return 'safe_generic';
  if (modeOrSafe === 'trusted_layout' || modeOrSafe === 'strict_sanitized' || modeOrSafe === 'safe_generic') return modeOrSafe;
  return isCustomPreset(preset) ? 'trusted_layout' : 'trusted_layout';
}

function isVisuallyEmptyHtml(html: string): boolean {
  if (!html.trim()) return true;
  if (stripHtml(html)) return false;
  return !/<(?:svg|path|rect|circle|line|polygon|ellipse|table|td|th|hr|input)\b/i.test(html);
}

function renderValueBlock(value: unknown, depth = 0): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value !== 'object') return `<span>${escapeHtml(String(value))}</span>`;
  if (depth >= 3) {
    try {
      return `<pre class="sotl-code">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
    } catch {
      return '';
    }
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '<p class="sotl-empty">None</p>';
    const items = value.slice(0, 12).map((item) => `<li>${renderValueBlock(item, depth + 1)}</li>`).join('');
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

function renderPreservedDataDetails(tracker: LoomTrackerState): string {
  return `
    <details class="sotl-card-details sotl-template-remainder">
      <summary>Unrendered tracker data</summary>
      ${renderValueBlock(tracker.data)}
    </details>
  `;
}

export function renderGenericSafeCard(tracker: LoomTrackerState, preset: LoomPreset, warningMessage?: string): string {
  const title = escapeHtml(String(getFallbackField(tracker.data, [
    'sceneIdentity.title', 'sceneTitle', 'title', 'name', 'sceneName', 'scene',
  ]) || 'Continuity State'));
  const mood = escapeHtml(String(getFallbackField(tracker.data, [
    'sceneIdentity.mood', 'mood', 'tone', 'emotion', 'scene_mood',
  ]) || ''));
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

function collectPresentFields(value: unknown, prefix = '', out: Set<string> = new Set()): Set<string> {
  if (value === null || value === undefined || value === '') return out;
  if (prefix) out.add(prefix);
  if (Array.isArray(value)) {
    value.slice(0, 3).forEach((item) => collectPresentFields(item, prefix, out));
    return out;
  }
  if (isRecord(value)) {
    for (const [key, entryValue] of Object.entries(value)) {
      collectPresentFields(entryValue, prefix ? `${prefix}.${key}` : key, out);
    }
  }
  return out;
}

function isLiteralOrHelper(token: string): boolean {
  return HELPER_NAMES.has(token)
    || token === 'else'
    || token.startsWith('/')
    || token.startsWith('#')
    || token.startsWith('@')
    || token === 'this'
    || token === '.'
    || token === 'true'
    || token === 'false'
    || token === 'null'
    || /^-?\d+(?:\.\d+)?$/.test(token)
    || /^['"]/.test(token);
}

function collectExpressionFields(expression: string, out: Set<string>): void {
  const cleaned = stripWrappedParens(expression.replace(/^#(?:if|unless|each)\s+/, '').replace(/^else if\s+/, ''));
  for (const token of tokenizeExpression(cleaned)) {
    const inner = stripWrappedParens(token);
    if (inner !== token) {
      collectExpressionFields(inner, out);
      continue;
    }
    if (!isLiteralOrHelper(token)) out.add(token.replace(/^this\./, ''));
  }
}

export function extractTemplateReferences(template: string): string[] {
  const out = new Set<string>();
  for (const token of tokenizeTemplate(template)) collectExpressionFields(token.command, out);
  return [...out].filter(Boolean).sort();
}

export function buildTemplateCompatibilityReport(
  preset: LoomPreset,
  sampleData: Record<string, unknown>,
  latestData?: Record<string, unknown> | null,
): LoomTemplateCompatibilityReport {
  const referencedFields = extractTemplateReferences(preset.htmlTemplate || '');
  const samplePresentFields = [...collectPresentFields(sampleData)].sort();
  const latestPresentFields = latestData ? [...collectPresentFields(latestData)].sort() : [];
  const hasPath = (fields: string[], field: string) => fields.some((candidate) => candidate === field || candidate.startsWith(`${field}.`) || field.startsWith(`${candidate}.`));
  return {
    templateEngine: (preset.templateEngine || 'loom') as LoomTemplateEngine,
    sourceFormat: (preset.sourceFormat || 'loom') as LoomTemplateSourceFormat,
    referencedFields,
    samplePresentFields,
    latestPresentFields,
    missingFromSample: referencedFields.filter((field) => !hasPath(samplePresentFields, field)),
    missingFromLatest: latestData ? referencedFields.filter((field) => !hasPath(latestPresentFields, field)) : [],
  };
}

export function renderTrackerHtmlDetailed(
  tracker: LoomTrackerState,
  preset: LoomPreset,
  modeOrSafe: boolean | LoomCustomTemplateMode = false,
): LoomRenderReport {
  const templateMode = resolveTemplateMode(modeOrSafe, preset);
  if (templateMode === 'safe_generic') {
    return {
      html: renderGenericSafeCard(tracker, preset, 'Safe generic renderer active.'),
      success: true,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      templateMode,
      preservedData: true,
      warning: 'Safe generic renderer active.',
      missingFields: [],
      compatibility: buildTemplateCompatibilityReport(preset, preset.sampleData || {}, tracker.data),
    };
  }

  try {
    const data = buildRenderData(tracker, preset);
    const rendered = renderTemplate(preset.htmlTemplate, data, preset);
    let html = rendered.html;
    let sanitizerRemovedContent = false;

    if (isCustomPreset(preset)) {
      if (templateMode === 'strict_sanitized') {
        const sanitized = sanitizeDomHtml(html);
        sanitizerRemovedContent = sanitized.trim() !== html.trim();
        html = sanitized;
      } else {
        const cleanup = cleanupTrustedHtml(html);
        sanitizerRemovedContent = cleanup.removed;
        html = cleanup.html;
      }
    }

    const missing = rendered.missingFields.filter((field) => !field.startsWith('@'));
    const compatibility = buildTemplateCompatibilityReport(preset, preset.sampleData || {}, tracker.data);

    if (isVisuallyEmptyHtml(html)) {
      const message = missing.length > 0
        ? `Custom template rendered no visible tracker content. Missing fields: ${missing.join(', ')}.`
        : 'Template rendered no visible tracker content.';
      return {
        html: renderGenericSafeCard(tracker, preset, message),
        success: false,
        fallbackUsed: true,
        sanitizerRemovedContent,
        templateMode,
        preservedData: true,
        warning: message,
        error: message,
        missingFields: missing,
        compatibility,
      };
    }

    const preservedData = isCustomPreset(preset) && missing.length > 0;
    if (preservedData) html += renderPreservedDataDetails(tracker);

    return {
      html,
      success: true,
      fallbackUsed: false,
      sanitizerRemovedContent,
      templateMode,
      preservedData,
      warning: missing.length > 0 ? `Missing template fields: ${missing.join(', ')}` : undefined,
      missingFields: missing,
      compatibility,
    };
  } catch (error) {
    console.error('Loom template rendering failed, falling back to safe card:', error);
    const message = `Custom template failed: ${error instanceof Error ? error.message : String(error)}`;
    return {
      html: renderGenericSafeCard(tracker, preset, message),
      success: false,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      templateMode,
      preservedData: true,
      warning: message,
      error: error instanceof Error ? error.message : String(error),
      missingFields: [],
      compatibility: buildTemplateCompatibilityReport(preset, preset.sampleData || {}, tracker.data),
    };
  }
}

export function renderTrackerHtml(
  tracker: LoomTrackerState,
  preset: LoomPreset,
  modeOrSafe: boolean | LoomCustomTemplateMode = false,
): string {
  return renderTrackerHtmlDetailed(tracker, preset, modeOrSafe).html;
}

export function makeCompactSummary(data: Record<string, unknown>): string {
  const scene = String(getFallbackField(data, [
    'sceneIdentity.title', 'sceneTitle', 'location', 'title', 'name', 'scene',
  ]) || 'Current scene');
  const delta = String(getFallbackField(data, [
    'narrativeDelta.summary', 'delta', 'activeThread', 'summary', 'description',
  ]) || '').trim();
  return delta ? `${scene}: ${delta}` : scene;
}
