import { builtInPresets, LOOM_VERSION } from './defaults.js';
import type {
  LoomPreset,
  LoomPresetOrigin,
  LoomTemplateEngine,
  LoomTemplateField,
  LoomTemplateSourceFormat,
  LoomValidationIssue,
  LoomValidationReport,
} from './types.js';

type Schema = Record<string, unknown>;
const VALID_ORIGINS = new Set<LoomPresetOrigin>(['built-in', 'custom', 'imported', 'duplicated']);
const VALID_TEMPLATE_ENGINES = new Set<LoomTemplateEngine>(['loom', 'handlebars_compat']);
const VALID_SOURCE_FORMATS = new Set<LoomTemplateSourceFormat>(['loom', 'simtracker']);

export function normalizePresetId(value: unknown, fallbackPrefix = 'custom_loom'): string {
  const raw = String(value || '').trim();
  const slug = raw
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 96);
  return slug || `${fallbackPrefix}_${Date.now()}`;
}

export function isBuiltInPresetId(presetId: string): boolean {
  return builtInPresets.some((preset) => preset.id === presetId);
}

export function getPresetOrigin(preset: Pick<LoomPreset, 'id'> & { origin?: LoomPresetOrigin | undefined }): LoomPresetOrigin {
  if (isBuiltInPresetId(preset.id)) return 'built-in';
  if (preset.origin && VALID_ORIGINS.has(preset.origin) && preset.origin !== 'built-in') return preset.origin;
  return 'custom';
}

function valueType(value: unknown): string {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function schemaType(schema: Schema): string | undefined {
  const type = schema.type;
  return typeof type === 'string' ? type : undefined;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim()) : [];
}

function normalizeTemplateField(value: unknown, index = 0): LoomTemplateField {
  const record = asObject(value);
  const key = asString(record.key, asString(record.path, asString(record.name, asString(record.label, `field_${index + 1}`))));
  const description = asString(record.description, asString(record.desc, asString(record.label, key)));
  const rawType = asString(record.type, asString(record.fieldType)).toLowerCase();
  const type = rawType === 'number' || rawType === 'integer' || rawType === 'boolean' || rawType === 'array' || rawType === 'object'
    ? rawType
    : rawType === 'list' || rawType === 'tags'
      ? 'array'
      : 'string';
  const nested = record.itemSchema ?? record.fields ?? record.children;
  return {
    key,
    description,
    type,
    itemSchema: Array.isArray(nested)
      ? nested.map((item, childIndex) => normalizeTemplateField(item, childIndex))
      : typeof nested === 'string'
        ? nested
        : undefined,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizePath(path: string): string[] {
  return path
    .replace(/\[(\d+)\]/g, '')
    .replace(/\[\]/g, '')
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean);
}

function ensureObjectProperty(schema: Schema, key: string): Schema {
  if (!isPlainObject(schema.properties)) schema.properties = {};
  const properties = schema.properties as Record<string, unknown>;
  if (!isPlainObject(properties[key])) {
    properties[key] = { type: 'object', properties: {}, additionalProperties: true };
  }
  const child = properties[key] as Schema;
  if (!isPlainObject(child.properties)) child.properties = {};
  return child;
}

function setNestedSchema(parent: Schema, path: string[], fieldSchema: Schema): void {
  if (path.length === 0) return;
  if (path.length === 1) {
    if (!isPlainObject(parent.properties)) parent.properties = {};
    (parent.properties as Record<string, unknown>)[path[0]] = fieldSchema;
    return;
  }
  const next = ensureObjectProperty(parent, path[0]);
  setNestedSchema(next, path.slice(1), fieldSchema);
}

function setNestedSample(parent: Record<string, unknown>, path: string[], value: unknown): void {
  if (path.length === 0) return;
  if (path.length === 1) {
    parent[path[0]] = value;
    return;
  }
  const key = path[0];
  if (!isPlainObject(parent[key])) parent[key] = {};
  setNestedSample(parent[key] as Record<string, unknown>, path.slice(1), value);
}

function explicitFieldType(record: Record<string, unknown>): LoomTemplateField['type'] | undefined {
  const raw = asString(record.type, asString(record.fieldType, asString(record.inputType))).toLowerCase();
  if (raw === 'integer' || raw === 'int') return 'integer';
  if (raw === 'number' || raw === 'float' || raw === 'range' || raw === 'slider') return 'number';
  if (raw === 'boolean' || raw === 'bool' || raw === 'checkbox' || raw === 'toggle') return 'boolean';
  if (raw === 'array' || raw === 'list' || raw === 'tags' || raw === 'multi-select' || raw === 'multiselect') return 'array';
  if (raw === 'object' || raw === 'group') return 'object';
  if (raw === 'string' || raw === 'text' || raw === 'textarea' || raw === 'select' || raw === 'enum' || raw === 'color') return 'string';
  return undefined;
}

function inferSchemaForField(value: unknown): Schema {
  const record = asObject(value);
  const type = explicitFieldType(record);
  const keyText = asString(record.key, asString(record.path, asString(record.name, ''))).toLowerCase();
  const description = asString(record.description, asString(record.desc, asString(record.label, '')));
  const options = asStringArray(record.options ?? record.choices ?? record.enum);

  const base: Schema = {};
  if (description) base.description = description;
  if (options.length > 0) base.enum = options;

  if (type === 'array') {
    const nested = record.itemSchema ?? record.fields ?? record.children;
    if (Array.isArray(nested) && nested.length > 0) {
      const child: Schema = { type: 'object', properties: {}, additionalProperties: true };
      nested.forEach((item, index) => {
        const field = normalizeTemplateField(item, index);
        setNestedSchema(child, normalizePath(field.key), inferSchemaForField(item));
      });
      return { ...base, type: 'array', items: child };
    }
    return { ...base, type: 'array', items: { type: 'string' } };
  }
  if (type === 'object') return { ...base, type: 'object', properties: {}, additionalProperties: true };
  if (type === 'number' || type === 'integer' || type === 'boolean') return { ...base, type };

  if (typeof record.default === 'number' || typeof record.value === 'number' || /\b(score|rating|level|trust|fear|warmth|attraction|irritation|leverage|tension|risk|progress|percent)\b/i.test(keyText)) {
    return { ...base, type: 'number' };
  }
  if (typeof record.default === 'boolean' || typeof record.value === 'boolean') return { ...base, type: 'boolean' };
  return { ...base, type: 'string' };
}

function sampleForField(value: unknown, fieldSchema: Schema, key: string): unknown {
  const record = asObject(value);
  const defaultValue = record.default ?? record.value ?? record.sample ?? record.example;
  if (defaultValue !== undefined) return defaultValue;
  const type = schemaType(fieldSchema);
  const keyLower = key.toLowerCase();
  if (type === 'number' || type === 'integer') return keyLower.includes('trust') || keyLower.includes('warmth') ? 55 : 1;
  if (type === 'boolean') return true;
  if (type === 'array') return ['sample'];
  if (type === 'object') return {};
  if (keyLower.includes('color')) return '#7b8cff';
  if (keyLower.includes('name')) return 'Sample Character';
  if (keyLower.includes('status')) return 'observing';
  if (keyLower.includes('thought')) return 'Quietly reassessing the scene.';
  return asString(record.description, asString(record.label, 'Sample detail'));
}

function simFieldTarget(path: string[]): { scope: 'root' | 'world' | 'character'; path: string[] } {
  const first = (path[0] || '').toLowerCase();
  if (first === 'worlddata' || first === 'world' || first === 'global' || first === 'tracker') {
    return { scope: 'world', path: path.slice(1) };
  }
  if (first === 'character' || first === 'characters') {
    return { scope: 'character', path: path.slice(1) };
  }
  if (first === 'stats') {
    return { scope: 'character', path };
  }
  if (['scenetitle', 'title', 'location', 'time', 'date', 'weather', 'lighting', 'privacy', 'mood', 'delta', 'summary', 'compactsummary'].includes(first)) {
    return { scope: 'root', path };
  }
  return { scope: 'character', path };
}

function synthesizePresetFromCustomFields(customFields: unknown[]): { schemaJson: Record<string, unknown>; sampleData: Record<string, unknown>; fields: LoomTemplateField[] } {
  const fields = customFields.map((field, index) => normalizeTemplateField(field, index));
  const characterSchema: Schema = {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      characterName: { type: 'string' },
      role: { type: 'string' },
      statusTag: { type: 'string' },
      stats: { type: 'object', properties: {}, additionalProperties: true },
    },
    additionalProperties: true,
  };
  const worldDataSchema: Schema = { type: 'object', properties: {}, additionalProperties: true };
  const rootSchema: Schema = {
    type: 'object',
    required: ['schemaVersion', 'sceneTitle', 'characters'],
    properties: {
      schemaVersion: { type: 'string' },
      sceneTitle: { type: 'string' },
      compactSummary: { type: 'string' },
      worldData: worldDataSchema,
      characters: { type: 'array', items: characterSchema, maxItems: 12 },
    },
    additionalProperties: true,
  };
  const sampleCharacter: Record<string, unknown> = {
    name: 'Sample Character',
    characterName: 'Sample Character',
    role: 'Present Character',
    statusTag: 'present',
    stats: {},
  };
  const sampleData: Record<string, unknown> = {
    schemaVersion: '1',
    sceneTitle: 'Imported Template Preview',
    compactSummary: 'Imported template preview with synthesized sample data.',
    worldData: {},
    characters: [sampleCharacter],
  };

  customFields.forEach((rawField, index) => {
    const field = fields[index];
    const path = normalizePath(field.key);
    if (path.length === 0) return;
    const fieldSchema = inferSchemaForField(rawField);
    const target = simFieldTarget(path);
    const targetPath = target.path.length > 0 ? target.path : [field.key];
    const sampleValue = sampleForField(rawField, fieldSchema, targetPath[targetPath.length - 1]);
    if (target.scope === 'world') {
      setNestedSchema(worldDataSchema, targetPath, fieldSchema);
      const world = sampleData.worldData as Record<string, unknown>;
      setNestedSample(world, targetPath, sampleValue);
    } else if (target.scope === 'root') {
      setNestedSchema(rootSchema, targetPath, fieldSchema);
      setNestedSample(sampleData, targetPath, sampleValue);
    } else {
      setNestedSchema(characterSchema, targetPath, fieldSchema);
      setNestedSample(sampleCharacter, targetPath, sampleValue);
    }
  });

  return { schemaJson: rootSchema, sampleData, fields };
}

function extractImportCandidates(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asObject(value);
  if (Array.isArray(record.presets)) return record.presets as unknown[];
  if (Array.isArray(record.templates)) return record.templates as unknown[];
  return [value];
}

function validateNode(value: unknown, schema: Schema, path: string, issues: LoomValidationIssue[]): void {
  const expected = schemaType(schema);
  let isTypeMatch = expected ? (valueType(value) === expected) : true;
  if (expected === 'integer' && typeof value === 'number' && Number.isInteger(value)) {
    isTypeMatch = true;
  }
  if (expected && !isTypeMatch) {
    issues.push({ path, message: `Expected ${expected}, received ${valueType(value)}.`, severity: 'error' });
    return;
  }

  if (expected === 'object') {
    const record = asObject(value);
    const required = Array.isArray(schema.required) ? schema.required.filter((item): item is string => typeof item === 'string') : [];
    for (const key of required) {
      if (!(key in record)) {
        issues.push({ path: `${path}.${key}`, message: 'Required field is missing.', severity: 'error' });
      }
    }
    const properties = asObject(schema.properties);
    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in record && childSchema && typeof childSchema === 'object' && !Array.isArray(childSchema)) {
        validateNode(record[key], childSchema as Schema, path ? `${path}.${key}` : key, issues);
      }
    }
    return;
  }

  if (expected === 'array') {
    const arrayValue = Array.isArray(value) ? value : [];
    const maxItems = typeof schema.maxItems === 'number' ? schema.maxItems : undefined;
    if (maxItems !== undefined && arrayValue.length > maxItems) {
      issues.push({ path, message: `Array exceeds maxItems ${maxItems}.`, severity: 'warning' });
    }
    const itemSchema = schema.items;
    if (itemSchema && typeof itemSchema === 'object' && !Array.isArray(itemSchema)) {
      arrayValue.forEach((item, index) => validateNode(item, itemSchema as Schema, `${path}[${index}]`, issues));
    }
  }
}

export function validateAgainstSchema(data: Record<string, unknown>, schema: Record<string, unknown>): LoomValidationReport {
  if (!schema || typeof schema !== 'object') {
    return { ok: false, issues: [{ path: '', message: 'Invalid or missing schema.', severity: 'error' }] };
  }
  const issues: LoomValidationIssue[] = [];
  try {
    validateNode(data, schema, '', issues);
  } catch (err) {
    issues.push({ path: '', message: `Validation crash: ${err instanceof Error ? err.message : String(err)}`, severity: 'error' });
  }
  return {
    ok: !issues.some((issue) => issue.severity === 'error'),
    issues,
  };
}

export function makeRecoverableErrorReport(message: string): LoomValidationReport {
  return {
    ok: false,
    issues: [{ path: '', message, severity: 'error' }],
  };
}

export function validateTemplateSafety(template: string): string[] {
  const warnings: string[] = [];
  const lower = template.toLowerCase();
  
  if (lower.includes('<script')) {
    warnings.push('Script tags (<script>) are blocked for safety.');
  }
  if (lower.includes('<iframe')) {
    warnings.push('Iframe tags (<iframe>) are blocked for safety.');
  }
  if (lower.includes('<object') || lower.includes('<embed')) {
    warnings.push('Object and embed tags are blocked for safety.');
  }
  if (/\bon[a-zA-Z]+\s*=/i.test(template)) {
    warnings.push('Inline event handlers (e.g. onclick=) are blocked for safety.');
  }
  if (lower.includes('javascript:') || lower.includes('data:')) {
    warnings.push('javascript: and data: URIs inside attributes are blocked for safety.');
  }

  // Check tags in template to see if any are not in our allowlist (harmonized with DOM sanitizer)
  const allowedTags = new Set([
    'div', 'section', 'article', 'header', 'footer', 'span', 'p', 'b', 'strong', 
    'i', 'em', 'small', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'details', 'summary', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'br', 'style',
    'label', 'input', 'button', 'img', 'figure', 'figcaption', 'main', 'aside', 'nav',
    'progress', 'meter', 'time', 'mark',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
    'svg', 'path', 'line', 'rect', 'circle', 'polygon', 'ellipse', 'g', 'text', 'defs', 'lineargradient', 'stop'
  ]);
  
  // A simple regex tag extractor to warn about unknown tags
  const tagRegex = /<([a-zA-Z0-9:-]+)/g;
  let match;
  const foundTags = new Set<string>();
  while ((match = tagRegex.exec(template)) !== null) {
    foundTags.add(match[1].toLowerCase());
  }
  
  for (const tag of foundTags) {
    if (tag !== 'if' && tag !== 'each' && !tag.startsWith('/') && !allowedTags.has(tag)) {
      warnings.push(`Tag <${tag}> is not in the allowed list of safe tags.`);
    }
  }

  return warnings;
}

export function coerceImportedPreset(value: unknown, index = 0): LoomPreset | null {
  const record = asObject(value);
  if (Object.keys(record).length === 0) return null;

  const extSettings = asObject(record.extSettings);
  const templateName = asString(record.templateName, asString(record.name, `Imported Template ${index + 1}`));
  const htmlTemplate = asString(
    record.htmlTemplate,
    asString(record.templateHtml, asString(record.renderTemplate, asString(record.template)))
  );
  const hasNativeShape = typeof record.id === 'string'
    && typeof record.name === 'string'
    && typeof record.htmlTemplate === 'string';
  const hasSimTrackerShape = Boolean(
    record.templateName
    || record.sysPrompt
    || record.customFields
    || record.extSettings
    || record.templatePosition
  );

  if (!hasNativeShape && !hasSimTrackerShape) return null;
  if (!htmlTemplate) return null;

  const rawFields = Array.isArray(record.customFields)
    ? record.customFields as unknown[]
    : Array.isArray(extSettings.customFields)
      ? extSettings.customFields as unknown[]
      : Array.isArray(record.fields)
        ? record.fields as unknown[]
        : [];
  const synthesized = rawFields.length > 0 ? synthesizePresetFromCustomFields(rawFields) : null;
  const schemaJson = isPlainObject(record.schemaJson)
    ? record.schemaJson
    : isPlainObject(record.schema)
      ? record.schema
      : synthesized?.schemaJson;
  const sampleData = isPlainObject(record.sampleData)
    ? record.sampleData
    : isPlainObject(record.sample)
      ? record.sample
      : synthesized?.sampleData;

  const rawId = asString(record.id, asString(record.templateId, templateName));
  const normalizedId = normalizePresetId(rawId, 'imported_loom');
  const safeId = isBuiltInPresetId(normalizedId) ? `${normalizedId}_imported_${Date.now()}` : normalizedId;
  const codeBlockNames = [
    ...asStringArray(record.fenceNames),
    ...asStringArray(asObject(record.parserOptions).fenceNames),
    asString(record.codeBlockIdentifier),
    asString(extSettings.codeBlockIdentifier),
    'tracker',
    'loom',
  ].filter(Boolean);
  const templatePosition = asString(record.templatePosition).toUpperCase();
  const promptInstructions = asString(
    record.promptInstructions,
    asString(record.sysPrompt, asString(record.systemPrompt, asString(record.prompt)))
  );
  const isSimTracker = hasSimTrackerShape && !hasNativeShape;

  const promptWithOverride = [
    promptInstructions || 'Track the current roleplay scene as structured continuity JSON.',
    isSimTracker
      ? [
          '',
          'STATE OF THE LOOM IMPORT COMPATIBILITY OVERRIDE:',
          'Return raw JSON only. Do not wrap output in markdown fences, SimTracker tags, HTML, prose, or comments.',
          'The JSON must match the State of the Loom schema below and should include a characters array when character fields are present.',
        ].join('\n')
      : '',
  ].filter(Boolean).join('\n');

  const importedPreset: Partial<LoomPreset> = {
    ...record,
    id: safeId,
    name: templateName,
    version: asString(record.version, LOOM_VERSION),
    description: asString(record.description, asString(record.templateDescription, asString(record.displayInstructions, 'Imported tracker template.'))),
    origin: 'imported',
    templateEngine: isSimTracker || record.templateEngine === 'handlebars_compat' ? 'handlebars_compat' : 'loom',
    sourceFormat: isSimTracker ? 'simtracker' : (record.sourceFormat === 'simtracker' ? 'simtracker' : 'loom'),
    mode: (record.mode === 'passive_extract' || record.mode === 'sidecar_generate' || record.mode === 'hybrid') ? record.mode : 'hybrid',
    htmlTemplate,
    promptInstructions: promptWithOverride,
    injectionTemplate: asString(record.injectionTemplate, '[Imported Loom]\n{{compactSummary}}'),
    maxInjectionTokens: typeof record.maxInjectionTokens === 'number' ? record.maxInjectionTokens : 220,
    defaultPlacement: templatePosition === 'TOP' || record.defaultPlacement === 'top' ? 'top' : record.defaultPlacement === 'bottom' ? 'bottom' : 'top',
    parserOptions: {
      fenceNames: [...new Set(codeBlockNames)],
      strictJson: asObject(record.parserOptions).strictJson === false ? false : true,
      repairInvalidJson: asObject(record.parserOptions).repairInvalidJson === true,
    },
  };
  const normalizedFields = synthesized?.fields ?? (rawFields.length > 0 ? rawFields.map((field, fieldIndex) => normalizeTemplateField(field, fieldIndex)) : undefined);
  if (normalizedFields) importedPreset.customFields = normalizedFields;
  if (schemaJson) importedPreset.schemaJson = schemaJson;
  if (sampleData) importedPreset.sampleData = sampleData;
  return normalizePreset(importedPreset);
}

export function coerceImportedPresets(value: unknown): { presets: LoomPreset[]; failures: string[] } {
  const failures: string[] = [];
  const presets = extractImportCandidates(value)
    .map((candidate, index) => {
      const preset = coerceImportedPreset(candidate, index);
      if (!preset) failures.push(`Item ${index + 1} is missing a supported template shape or htmlTemplate.`);
      return preset;
    })
    .filter((preset): preset is LoomPreset => Boolean(preset));
  return { presets, failures };
}

export function normalizePreset(preset: Partial<LoomPreset>): LoomPreset {
  const now = new Date().toISOString();
  const id = normalizePresetId(preset.id || `custom_loom_${Date.now()}`);
  const origin = preset.origin && VALID_ORIGINS.has(preset.origin) ? preset.origin : 'custom';
  const templateEngine = preset.templateEngine && VALID_TEMPLATE_ENGINES.has(preset.templateEngine) ? preset.templateEngine : 'loom';
  const sourceFormat = preset.sourceFormat && VALID_SOURCE_FORMATS.has(preset.sourceFormat) ? preset.sourceFormat : 'loom';
  return {
    id,
    name: String(preset.name || 'Custom Loom Template'),
    version: String(preset.version || LOOM_VERSION),
    description: String(preset.description || ''),
    origin: id && isBuiltInPresetId(id) ? 'built-in' : origin === 'built-in' ? 'custom' : origin,
    templateEngine,
    sourceFormat,
    customFields: Array.isArray(preset.customFields)
      ? preset.customFields.map((field, index) => normalizeTemplateField(field, index))
      : undefined,
    mode: (preset.mode === 'passive_extract' || preset.mode === 'sidecar_generate' || preset.mode === 'hybrid') 
      ? preset.mode 
      : 'hybrid',
    schemaJson: (preset.schemaJson && typeof preset.schemaJson === 'object' && !Array.isArray(preset.schemaJson))
      ? preset.schemaJson
      : {
          type: 'object',
          required: ['schemaVersion', 'sceneTitle', 'location', 'time', 'mood', 'delta'],
          properties: {
            schemaVersion: { type: 'string', default: '1' },
            sceneTitle: { type: 'string', default: '' },
            location: { type: 'string', default: '' },
            time: { type: 'string', default: '' },
            mood: { type: 'string', default: '' },
            delta: { type: 'string', default: '' }
          }
        },
    htmlTemplate: String(preset.htmlTemplate || ''),
    promptInstructions: String(preset.promptInstructions || 'Return valid JSON only. Do not use markdown fences. Update what changed.'),
    injectionTemplate: String(preset.injectionTemplate || '[Custom Loom]\n{{compactSummary}}'),
    maxInjectionTokens: typeof preset.maxInjectionTokens === 'number' ? preset.maxInjectionTokens : 150,
    defaultPlacement: (preset.defaultPlacement === 'top' || preset.defaultPlacement === 'bottom')
      ? preset.defaultPlacement
      : 'top',
    renderOptions: {
      density: (preset.renderOptions?.density === 'compact' || preset.renderOptions?.density === 'normal' || preset.renderOptions?.density === 'expanded')
        ? preset.renderOptions.density
        : 'compact',
      theme: (preset.renderOptions?.theme === 'system' || preset.renderOptions?.theme === 'glass' || preset.renderOptions?.theme === 'paper' || preset.renderOptions?.theme === 'terminal' || preset.renderOptions?.theme === 'minimal')
        ? preset.renderOptions.theme
        : 'system',
      showControls: typeof preset.renderOptions?.showControls === 'boolean' ? preset.renderOptions.showControls : true
    },
    parserOptions: {
      fenceNames: Array.isArray(preset.parserOptions?.fenceNames) ? preset.parserOptions.fenceNames.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : ['tracker', 'loom'],
      strictJson: typeof preset.parserOptions?.strictJson === 'boolean' ? preset.parserOptions.strictJson : true,
      repairInvalidJson: typeof preset.parserOptions?.repairInvalidJson === 'boolean' ? preset.parserOptions.repairInvalidJson : false
    },
    sampleData: (preset.sampleData && typeof preset.sampleData === 'object' && !Array.isArray(preset.sampleData))
      ? preset.sampleData
      : { sceneTitle: 'New Scene', location: 'Foyer' },
    createdAt: String(preset.createdAt || now),
    updatedAt: now
  };
}

export interface LoomPresetReadiness {
  schemaValid: boolean;
  schemaError: string | undefined;
  sampleDataValid: boolean;
  sampleDataError: string | undefined;
  templateSafe: boolean;
  templateWarnings: string[];
  promptPresent: boolean;
  ready: boolean;
  reasons: string[];
}

export function checkPresetReadiness(preset: LoomPreset): LoomPresetReadiness {
  const reasons: string[] = [];
  
  // 1. Schema JSON check
  let schemaValid = false;
  let schemaError: string | undefined;
  if (!preset.schemaJson || typeof preset.schemaJson !== 'object') {
    schemaError = 'Schema JSON is missing or not an object.';
  } else {
    try {
      JSON.stringify(preset.schemaJson);
      schemaValid = true;
    } catch (err) {
      schemaError = `Schema JSON error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  if (!schemaValid) reasons.push('Invalid Schema JSON');

  // 2. Sample Data JSON check
  let sampleDataValid = false;
  let sampleDataError: string | undefined;
  if (!preset.sampleData || typeof preset.sampleData !== 'object') {
    sampleDataError = 'Sample data is missing or not an object.';
  } else {
    try {
      JSON.stringify(preset.sampleData);
      sampleDataValid = true;
    } catch (err) {
      sampleDataError = `Sample data JSON error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  if (!sampleDataValid) reasons.push('Invalid Sample Data');

  // 3. Safe template check
  const warnings = validateTemplateSafety(preset.htmlTemplate || '');
  const templateSafe = warnings.length === 0;
  if (!templateSafe) reasons.push('Unsafe HTML template elements found');

  // 4. Prompt instructions check
  const promptPresent = Boolean(preset.promptInstructions && preset.promptInstructions.trim());
  if (!promptPresent) reasons.push('Prompt instructions are missing');

  const ready = schemaValid && sampleDataValid && promptPresent;

  return {
    schemaValid,
    schemaError,
    sampleDataValid,
    sampleDataError,
    templateSafe,
    templateWarnings: warnings,
    promptPresent,
    ready,
    reasons
  };
}
