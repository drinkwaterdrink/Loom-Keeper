import type { LoomValidationIssue, LoomValidationReport, LoomPreset } from './types.js';

type Schema = Record<string, unknown>;

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

function validateNode(value: unknown, schema: Schema, path: string, issues: LoomValidationIssue[]): void {
  const expected = schemaType(schema);
  if (expected && valueType(value) !== expected) {
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
  if (lower.includes('style=')) {
    warnings.push('Inline style attributes (style=) are stripped. Use CSS classes instead.');
  }
  if (/\bon[a-zA-Z]+\s*=/i.test(template)) {
    warnings.push('Inline event handlers (e.g. onclick=) are blocked for safety.');
  }
  if (lower.includes('javascript:') || lower.includes('data:')) {
    warnings.push('javascript: and data: URIs inside attributes are blocked for safety.');
  }

  // Check tags in template to see if any are not in our allowlist
  const allowedTags = new Set([
    'div', 'section', 'article', 'header', 'footer', 'span', 'p', 'b', 'strong', 
    'i', 'em', 'small', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'details', 'summary', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'br'
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

export function normalizePreset(preset: Partial<LoomPreset>): LoomPreset {
  const now = new Date().toISOString();
  return {
    id: String(preset.id || `custom_loom_${Date.now()}`),
    name: String(preset.name || 'Custom Loom Template'),
    version: String(preset.version || '1.0.8'),
    description: String(preset.description || ''),
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
      fenceNames: Array.isArray(preset.parserOptions?.fenceNames) ? preset.parserOptions.fenceNames : ['tracker', 'loom'],
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
