import type { LoomPreset } from '../shared/types.js';
import { escapeHtml } from './ui.js';

export function renderPresetDetails(preset: LoomPreset): string {
  return [
    '<div class="sotl-fields">',
    '<details class="sotl-details"><summary>Prompt instructions</summary>',
    `<pre class="sotl-code">${escapeHtml(preset.promptInstructions)}</pre>`,
    '</details>',
    '<details class="sotl-details"><summary>Schema JSON</summary>',
    `<pre class="sotl-code">${escapeHtml(JSON.stringify(preset.schemaJson, null, 2))}</pre>`,
    '</details>',
    '<details class="sotl-details"><summary>HTML Template</summary>',
    `<pre class="sotl-code">${escapeHtml(preset.htmlTemplate)}</pre>`,
    '</details>',
    '</div>',
  ].join('');
}
