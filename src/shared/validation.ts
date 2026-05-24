import type { LoomValidationIssue, LoomValidationReport } from './types.js';

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
  const issues: LoomValidationIssue[] = [];
  validateNode(data, schema, '', issues);
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
