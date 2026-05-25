import type { LoomFrontendState, LoomPreset, LoomRenderReport, LoomTrackerState } from '../shared/types.js';
import { getFallbackField, renderGenericSafeCard, renderTrackerHtmlDetailed } from '../shared/renderer.js';
import { escapeHtml } from './ui.js';

export function resolvePresetForTracker(
  state: LoomFrontendState,
  tracker: LoomTrackerState,
): { preset: LoomPreset; missing: boolean } {
  const preset = state.presets.find((candidate) => candidate.id === tracker.presetId);
  if (preset) return { preset, missing: false };
  return { preset: state.activePreset, missing: true };
}

export function renderTrackerForState(
  tracker: LoomTrackerState,
  state: LoomFrontendState,
  useSafeRenderer = Boolean(state.settings.useSafeRenderer),
): LoomRenderReport {
  const { preset, missing } = resolvePresetForTracker(state, tracker);
  if (missing) {
    const warning = `Preset '${tracker.presetId}' is not available. Showing tracker data with the safe generic renderer.`;
    return {
      html: renderGenericSafeCard(tracker, preset, warning),
      success: false,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      warning,
      error: warning,
      missingFields: [],
    };
  }
  return renderTrackerHtmlDetailed(tracker, preset, useSafeRenderer);
}

function compactValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) {
    return value.slice(0, 3).map(compactValue).filter(Boolean).join(', ');
  }

  const record = value as Record<string, unknown>;
  for (const key of ['name', 'title', 'label', 'summary', 'description', 'value', 'text']) {
    if (record[key] !== undefined && record[key] !== null && typeof record[key] !== 'object') return String(record[key]);
  }

  return Object.entries(record)
    .filter(([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== '')
    .slice(0, 3)
    .map(([key, entryValue]) => `${key}: ${compactValue(entryValue)}`)
    .filter(Boolean)
    .join('; ');
}

function collectCompactFields(data: Record<string, unknown>): Array<{ key: string; value: string }> {
  const skip = new Set(['schemaversion', 'schema_version', 'scenetitle', 'title', 'name', 'scene', 'scenename']);
  return Object.entries(data)
    .filter(([key, value]) => !skip.has(key.toLowerCase()) && value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({ key, value: compactValue(value) }))
    .filter((entry) => entry.value)
    .slice(0, 5);
}

export function renderCompactTrackerForState(tracker: LoomTrackerState, state: LoomFrontendState): string {
  const { preset, missing } = resolvePresetForTracker(state, tracker);
  const title = String(getFallbackField(tracker.data, ['sceneTitle', 'title', 'name', 'sceneName', 'scene']) || tracker.compactSummary || 'Continuity State');
  const fields = collectCompactFields(tracker.data);
  const summary = tracker.compactSummary && tracker.compactSummary !== title
    ? tracker.compactSummary
    : fields[0]?.value || 'No compact summary recorded.';

  const chips = fields.slice(1, 5).map((field) => {
    return `<span class="sotl-chip" style="font-size: 11px; padding: 1px 6px;">${escapeHtml(field.key)}: ${escapeHtml(field.value)}</span>`;
  }).join('');

  return [
    `    <p class="sotl-chat-panel__scene">${escapeHtml(title)}</p>`,
    `    <div class="sotl-chat-panel__meta">Preset: ${escapeHtml(preset.name)}${missing ? ' (missing original preset)' : ''}</div>`,
    `    <p class="sotl-chat-panel__desc">${escapeHtml(summary)}</p>`,
    chips ? `    <div class="sotl-cast-grid" style="margin-top: 4px;">${chips}</div>` : '',
    tracker.validation.ok ? '' : '    <p class="sotl-chat-panel__desc sotl-warning">Tracker JSON has validation warnings. Open the drawer for details.</p>',
  ].filter(Boolean).join('\n');
}
