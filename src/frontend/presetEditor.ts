import type { LoomFrontendState, LoomPreset, LoomRenderReport } from '../shared/types.js';
import { escapeHtml, button } from './ui.js';
import { validateTemplateSafety, checkPresetReadiness } from '../shared/validation.js';
import { renderTrackerHtmlDetailed } from '../shared/renderer.js';
import { builtInPresets } from '../shared/defaults.js';

export let editingPreset: LoomPreset | null = null;
export let lastPreviewHtml: string = '';
export let lastPreviewReport: LoomRenderReport | null = null;
export let lastSanitizerWarnings: string[] = [];
export let lastJsonParseError: string | null = null;
export let lastImportStatus: { ok: boolean; message: string; presetName?: string; presetId?: string } | null = null;

export function clearImportStatus(): void {
  lastImportStatus = null;
}

export function setImportStatus(status: { ok: boolean; message: string; presetName?: string; presetId?: string }): void {
  lastImportStatus = status;
}

export function selectPresetForEditing(preset: LoomPreset): void {
  editingPreset = JSON.parse(JSON.stringify(preset));
  lastPreviewHtml = '';
  lastPreviewReport = null;
  lastSanitizerWarnings = [];
  lastJsonParseError = null;
}

export function updateEditingField(field: string, value: string): void {
  if (!editingPreset) return;
  
  if (field === 'name') editingPreset.name = value;
  if (field === 'description') editingPreset.description = value;
  if (field === 'mode') editingPreset.mode = value as LoomPreset['mode'];
  if (field === 'defaultPlacement') editingPreset.defaultPlacement = value as LoomPreset['defaultPlacement'];
  if (field === 'maxInjectionTokens') editingPreset.maxInjectionTokens = parseInt(value, 10) || 150;
  
  if (field === 'htmlTemplate') {
    editingPreset.htmlTemplate = value;
    lastSanitizerWarnings = validateTemplateSafety(value);
  }
  if (field === 'promptInstructions') editingPreset.promptInstructions = value;
  if (field === 'injectionTemplate') editingPreset.injectionTemplate = value;
  
  if (field === 'schemaJson') {
    try {
      editingPreset.schemaJson = JSON.parse(value);
      lastJsonParseError = null;
    } catch (err) {
      lastJsonParseError = `Schema JSON error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
  
  if (field === 'sampleData') {
    try {
      editingPreset.sampleData = JSON.parse(value);
      lastJsonParseError = null;
    } catch (err) {
      lastJsonParseError = `Sample data JSON error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}

export function runPreview(): void {
  if (!editingPreset) return;
  try {
    lastSanitizerWarnings = validateTemplateSafety(editingPreset.htmlTemplate);
    
    // We render a mock tracker state using sampleData
    const mockTracker = {
      version: editingPreset.version || '1.0.0',
      schemaVersion: '1',
      presetId: editingPreset.id,
      chatId: 'preview-chat',
      generatedAt: new Date().toISOString(),
      source: 'manual_edit' as const,
      placement: editingPreset.defaultPlacement,
      data: editingPreset.sampleData || {},
      compactSummary: 'Preview compact summary',
      validation: { ok: true, issues: [] },
    };
    
    lastPreviewReport = renderTrackerHtmlDetailed(mockTracker, editingPreset);
    lastPreviewHtml = lastPreviewReport.html;
    lastJsonParseError = null;
  } catch (err) {
    lastJsonParseError = `Preview failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export function isPresetValid(value: unknown): value is LoomPreset {
  return Boolean(value)
    && typeof value === 'object'
    && !Array.isArray(value)
    && typeof (value as LoomPreset).id === 'string'
    && typeof (value as LoomPreset).name === 'string'
    && typeof (value as LoomPreset).htmlTemplate === 'string';
}

export function renderPresetEditor(state: LoomFrontendState): string {
  if (!editingPreset || !state.presets.some((p) => p.id === editingPreset!.id)) {
    const active = state.presets.find((p) => p.id === state.settings.activePresetId);
    editingPreset = active ? JSON.parse(JSON.stringify(active)) : state.presets[0] ? JSON.parse(JSON.stringify(state.presets[0])) : null;
  }

  if (!editingPreset) {
    return '<p class="sotl-note">No templates are available to edit.</p>';
  }

  const isBuiltIn = builtInPresets.some((p) => p.id === editingPreset!.id);
  const presetsOptions = state.presets.map((p) => {
    const selected = p.id === editingPreset!.id ? ' selected' : '';
    const isB = builtInPresets.some((bp) => bp.id === p.id);
    return `<option value="${escapeHtml(p.id)}"${selected}>${escapeHtml(p.name)}${isB ? ' (Built-in)' : ' (Custom)'}</option>`;
  }).join('');

  return [
    '<div class="sotl-fields" style="margin-top: 10px;">',
    '<label class="sotl-label">Template to edit/inspect',
    `  <select class="sotl-select" data-sotl-editor-field="selectedPresetId">${presetsOptions}</select>`,
    '</label>',
    isBuiltIn
      ? '<p class="sotl-note" style="color: var(--lv-accent, #3864d9);">ℹ️ Built-in templates are read-only. Click "Duplicate to Edit" to customize.</p>'
      : '<p class="sotl-note" style="color: var(--lv-success-text, #176b43);">✏️ You are editing a custom template.</p>',
    
    (() => {
      const readiness = checkPresetReadiness(editingPreset!);
      const warningsList = readiness.templateWarnings.length > 0
        ? `<div style="margin-top: 4px; padding: 4px 6px; border-radius: 4px; background: rgba(220,53,69,0.06); color: var(--lv-error-text,#bd2130); font-size: 10px;">⚠️ Unsafe elements: ${readiness.templateWarnings.map(w => escapeHtml(w)).join(', ')}</div>`
        : '';
      return [
        '<div class="sotl-panel" style="margin-top: 6px; padding: 10px; background: var(--lumiverse-fill-subtle, rgba(255, 255, 255, 0.45)); display: grid; gap: 4px; border: 1px dashed var(--lumiverse-border, rgba(80,88,100,0.2));">',
        '  <strong style="font-size: 11px; display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">',
        readiness.ready 
          ? '🟢 <span style="color: var(--lv-success-text, #176b43);">Ready to Generate</span>' 
          : '🔴 <span style="color: var(--lv-error-text, #bd2130);">Not Ready to Generate</span>',
        '  </strong>',
        '  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; font-size: 11px;">',
        `    <div>${readiness.schemaValid ? '✅' : '❌'} <strong>Schema:</strong> ${readiness.schemaValid ? 'Valid' : `<span style="color:var(--lv-error-text,#bd2130);">${escapeHtml(readiness.schemaError || 'Invalid')}</span>`}</div>`,
        `    <div>${readiness.sampleDataValid ? '✅' : '❌'} <strong>Sample Data:</strong> ${readiness.sampleDataValid ? 'Valid' : `<span style="color:var(--lv-error-text,#bd2130);">${escapeHtml(readiness.sampleDataError || 'Invalid')}</span>`}</div>`,
        `    <div>${readiness.templateSafe ? '✅' : '⚠️'} <strong>Safety:</strong> ${readiness.templateSafe ? 'Safe' : 'Unsafe elements'}</div>`,
        `    <div>${readiness.promptPresent ? '✅' : '❌'} <strong>Instructions:</strong> ${readiness.promptPresent ? 'Present' : 'Missing'}</div>`,
        '  </div>',
        warningsList,
        readiness.reasons.length > 0
          ? `  <p style="margin: 2px 0 0; font-size: 10px; color: var(--lv-error-text, #bd2130);"><strong>Blockers:</strong> ${escapeHtml(readiness.reasons.join(', '))}</p>`
          : '',
        '</div>'
      ].join('\n');
    })(),

    '<div class="sotl-actions" style="margin-top: 8px; margin-bottom: 12px;">',
    button('New Template', 'editor-new', { primary: !isBuiltIn }),
    button('Duplicate to Edit', 'editor-duplicate', { primary: isBuiltIn }),
    button('Save Template', 'editor-save', { disabled: isBuiltIn, primary: !isBuiltIn, title: isBuiltIn ? 'Built-in templates are read-only' : 'Save edits' }),
    button('Delete Custom', 'editor-delete', { disabled: isBuiltIn, title: isBuiltIn ? 'Built-in templates cannot be deleted' : 'Delete custom template' }),
    button('Reset Custom Templates', 'editor-reset', { title: 'Delete all custom templates' }),
    '</div>',

    // Collapsible Details Sections (All collapsed by default)
    '<details class="sotl-details" style="margin-top: 8px;"><summary>Metadata (Name, Description, Mode)</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    '  <label class="sotl-label">Template Name',
    `    <input class="sotl-input" type="text" data-sotl-editor-field="name" value="${escapeHtml(editingPreset.name)}" ${isBuiltIn ? 'disabled' : ''}>`,
    '  </label>',
    '  <label class="sotl-label">Description',
    `    <input class="sotl-input" type="text" data-sotl-editor-field="description" value="${escapeHtml(editingPreset.description)}" ${isBuiltIn ? 'disabled' : ''}>`,
    '  </label>',
    '  <label class="sotl-label">Mode',
    `    <select class="sotl-select" data-sotl-editor-field="mode" ${isBuiltIn ? 'disabled' : ''}>`,
    `      <option value="hybrid"${editingPreset.mode === 'hybrid' ? ' selected' : ''}>Hybrid (passive extract + sidecar)</option>`,
    `      <option value="sidecar_generate"${editingPreset.mode === 'sidecar_generate' ? ' selected' : ''}>Sidecar generation only</option>`,
    `      <option value="passive_extract"${editingPreset.mode === 'passive_extract' ? ' selected' : ''}>Passive extraction only</option>`,
    '    </select>',
    '  </label>',
    '  <label class="sotl-label">Default Placement',
    `    <select class="sotl-select" data-sotl-editor-field="defaultPlacement" ${isBuiltIn ? 'disabled' : ''}>`,
    `      <option value="top"${editingPreset.defaultPlacement === 'top' ? ' selected' : ''}>Top of message</option>`,
    `      <option value="bottom"${editingPreset.defaultPlacement === 'bottom' ? ' selected' : ''}>Bottom of message</option>`,
    '    </select>',
    '  </label>',
    '  <label class="sotl-label">Max Injection Tokens',
    `    <input class="sotl-input" type="number" data-sotl-editor-field="maxInjectionTokens" value="${editingPreset.maxInjectionTokens}" ${isBuiltIn ? 'disabled' : ''}>`,
    '  </label>',
    '</div>',
    '</details>',

    '<details class="sotl-details" style="margin-top: 8px;"><summary>HTML Template</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    `  <textarea class="sotl-textarea" data-sotl-editor-field="htmlTemplate" ${isBuiltIn ? 'disabled' : ''}>${escapeHtml(editingPreset.htmlTemplate)}</textarea>`,
    '</div>',
    '</details>',

    '<details class="sotl-details" style="margin-top: 8px;"><summary>Prompt Instructions</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    `  <textarea class="sotl-textarea" data-sotl-editor-field="promptInstructions" ${isBuiltIn ? 'disabled' : ''}>${escapeHtml(editingPreset.promptInstructions)}</textarea>`,
    '</div>',
    '</details>',

    '<details class="sotl-details" style="margin-top: 8px;"><summary>Schema JSON</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    `  <textarea class="sotl-textarea" data-sotl-editor-field="schemaJson" ${isBuiltIn ? 'disabled' : ''}>${escapeHtml(JSON.stringify(editingPreset.schemaJson, null, 2))}</textarea>`,
    '</div>',
    '</details>',

    '<details class="sotl-details" style="margin-top: 8px;"><summary>Sample Data JSON</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    `  <textarea class="sotl-textarea" data-sotl-editor-field="sampleData" ${isBuiltIn ? 'disabled' : ''}>${escapeHtml(JSON.stringify(editingPreset.sampleData, null, 2))}</textarea>`,
    '</div>',
    '</details>',

    '<details class="sotl-details" style="margin-top: 8px;"><summary>Injection Template</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    `  <textarea class="sotl-textarea" data-sotl-editor-field="injectionTemplate" ${isBuiltIn ? 'disabled' : ''}>${escapeHtml(editingPreset.injectionTemplate)}</textarea>`,
    '</div>',
    '</details>',

    '<details class="sotl-details" style="margin-top: 8px;"><summary>Import / Export</summary>',
    '<div class="sotl-fields" style="margin-top: 8px;">',
    '  <div class="sotl-actions" style="margin-bottom: 8px; flex-wrap: wrap;">',
    button('Copy Template JSON', 'editor-export'),
    button('Download Template JSON', 'editor-download', { title: 'Download current template as a .json file' }),
    '  </div>',
    '  <div class="sotl-actions" style="margin-bottom: 8px; flex-wrap: wrap;">',
    button('Upload Template JSON', 'editor-upload-single', { title: 'Upload a template .json file from your device' }),
    button('Download All Custom', 'editor-download-all', { title: 'Download all custom templates as a pack .json file' }),
    button('Upload Template Pack', 'editor-upload-pack', { title: 'Upload a template pack .json file' }),
    '  </div>',
    '  <input type="file" id="sotl-upload-single" accept=".json" style="display:none;" data-sotl-file-action="file-upload-single">',
    '  <input type="file" id="sotl-upload-pack" accept=".json" style="display:none;" data-sotl-file-action="file-upload-pack">',
    '  <label class="sotl-label">Paste Template JSON to Import',
    '    <textarea class="sotl-textarea" id="sotl-import-paste" placeholder=\'Paste preset JSON here (single preset or array of presets)...\'></textarea>',
    '  </label>',
    '  <div class="sotl-actions">',
    button('Import Pasted Template', 'editor-import', { primary: true }),
    '  </div>',
    lastImportStatus
      ? [
          `<div style="margin-top: 10px; padding: 8px 10px; border-radius: 6px; border-left: 3px solid ${lastImportStatus.ok ? 'var(--lv-success-text,#176b43)' : '#dc3545'}; background: ${lastImportStatus.ok ? 'rgba(27,126,80,0.07)' : 'rgba(220,53,69,0.08)'};">`,
          `  <strong style="font-size: 11px; color: ${lastImportStatus.ok ? 'var(--lv-success-text,#176b43)' : 'var(--lv-error-text,#bd2130)'};">`,
          lastImportStatus.ok ? '✅ Import succeeded' : '❌ Import failed',
          '</strong>',
          `  <p style="margin: 4px 0 0; font-size: 12px; line-height: 1.4;">${escapeHtml(lastImportStatus.message)}</p>`,
          lastImportStatus.presetName ? `  <p style="margin: 4px 0 0; font-size: 11px; color: var(--lumiverse-text-muted,#64707d);">Template: <strong>${escapeHtml(lastImportStatus.presetName)}</strong></p>` : '',
          lastImportStatus.presetId ? `  <p style="margin: 2px 0 0; font-size: 11px; color: var(--lumiverse-text-muted,#64707d);">ID: <code>${escapeHtml(lastImportStatus.presetId)}</code></p>` : '',
          '</div>',
        ].join('')
      : '',
    '</div>',
    '</details>',

    // Preview / Validation Section
    '<details class="sotl-details" style="margin-top: 8px;" open><summary>Preview & Validation</summary>',
    '<div style="margin-top: 8px;">',
    '  <div class="sotl-actions" style="margin-bottom: 8px;">',
    button('Run Template Preview', 'editor-preview', { primary: true }),
    '  </div>',
    
    lastJsonParseError ? `<p class="sotl-note sotl-warning" style="margin-bottom: 8px; color: var(--lv-error-text, #bd2130);">${escapeHtml(lastJsonParseError)}</p>` : '',
    
    lastSanitizerWarnings.length > 0
      ? [
          '<div style="background: rgba(220,53,69,0.08); border-left: 3px solid var(--lv-error-border, #dc3545); padding: 8px; margin-bottom: 8px; border-radius: 4px;">',
          '  <strong style="color: var(--lv-error-text, #bd2130); font-size: 11px;">⚠️ Sanitizer Allowlist Warnings:</strong>',
          '  <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 11px; color: var(--lv-error-text, #bd2130);">',
          ...lastSanitizerWarnings.map((w) => `    <li>${escapeHtml(w)}</li>`),
          '  </ul>',
          '</div>',
        ].join('\n')
      : '',

    lastPreviewReport
      ? `<p class="sotl-note" style="margin-bottom: 8px;">Preview render: ${lastPreviewReport.success ? 'template rendered' : 'fallback used'}${lastPreviewReport.warning ? ` - ${escapeHtml(lastPreviewReport.warning)}` : ''}</p>`
      : '',

    lastPreviewHtml
      ? [
          '<div style="margin-top: 8px;">',
          '  <span style="font-size: 11px; font-weight: 600; color: var(--lumiverse-text-muted, #64707d);">Mock Render Preview:</span>',
          `  <div class="sotl-preview" style="margin-top: 4px; max-height: 250px; overflow-y: auto;">${lastPreviewHtml}</div>`,
          '</div>',
        ].join('\n')
      : '<p class="sotl-note">Click "Run Template Preview" to check how this template renders with the sample data.</p>',
    '</div>',
    '</details>',

    '</div>',
  ].join('');
}
