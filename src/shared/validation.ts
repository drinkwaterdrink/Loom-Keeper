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
