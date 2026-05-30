import type { LoomCustomTemplateMode, LoomFrontendState, LoomPreset, LoomRenderReport, LoomTrackerState } from '../shared/types.js';
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
  mode: LoomCustomTemplateMode = state.settings.useSafeRenderer ? 'safe_generic' : (state.settings.customTemplateMode || 'trusted_layout'),
): LoomRenderReport {
  const { preset, missing } = resolvePresetForTracker(state, tracker);
  if (missing) {
    const warning = `Preset '${tracker.presetId}' is not available. Showing tracker data with the safe generic renderer.`;
    return {
      html: renderGenericSafeCard(tracker, preset, warning),
      success: false,
      fallbackUsed: true,
      sanitizerRemovedContent: false,
      templateMode: 'safe_generic',
      preservedData: true,
      warning,
      error: warning,
      missingFields: [],
    };
  }
  return renderTrackerHtmlDetailed(tracker, preset, mode);
}

export interface ActiveTrackerResolution {
  tracker: LoomTrackerState | null;
  missingMessageId?: string | undefined;
  missingSwipeId?: number | undefined;
}

export function resolveActiveTrackerForState(state: LoomFrontendState): ActiveTrackerResolution {
  const latest = state.latestTracker;
  if (!latest?.messageId) {
    const activeMessageId = state.diagnostics.swipeReport?.activeMessageId;
    const activeSwipe = typeof activeMessageId === 'string'
      ? state.activeSwipeByMessageId[activeMessageId] ?? state.diagnostics.swipeReport?.activeSwipeId
      : undefined;
    if (activeMessageId) {
      const sameMessageTrackers = state.messageTrackers.filter((tracker) => tracker.messageId === activeMessageId);
      const exact = typeof activeSwipe === 'number'
        ? sameMessageTrackers.find((tracker) => tracker.swipeId === activeSwipe)
        : undefined;
      if (exact) return { tracker: exact };
      if (typeof activeSwipe === 'number' && sameMessageTrackers.some((tracker) => typeof tracker.swipeId === 'number')) {
        return {
          tracker: null,
          missingMessageId: activeMessageId,
          missingSwipeId: activeSwipe,
        };
      }
      const newest = sameMessageTrackers.slice().sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
      if (newest) return { tracker: newest };
    }
    return { tracker: latest };
  }

  const activeSwipe = state.activeSwipeByMessageId[latest.messageId];
  if (typeof activeSwipe !== 'number' || latest.swipeId === activeSwipe) {
    return { tracker: latest };
  }

  const sameMessageTrackers = state.messageTrackers.filter((tracker) => tracker.messageId === latest.messageId);
  const exact = sameMessageTrackers.find((tracker) => tracker.swipeId === activeSwipe);
  if (exact) return { tracker: exact };
  if (sameMessageTrackers.some((tracker) => typeof tracker.swipeId === 'number')) {
    return {
      tracker: null,
      missingMessageId: latest.messageId,
      missingSwipeId: activeSwipe,
    };
  }
  return { tracker: latest };
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
  const characters = getFallbackField(data, ['characters', 'cast', 'present']);
  const preferred = [
    { key: 'Location', value: compactValue(getFallbackField(data, ['sceneIdentity.location', 'location', 'current_location', 'place'])) },
    { key: 'Time', value: compactValue(getFallbackField(data, ['sceneIdentity.time', 'time', 'timeOfDay', 'scene_time'])) },
    { key: 'Weather', value: compactValue(getFallbackField(data, ['sceneIdentity.weather', 'weather'])) },
    { key: 'Characters', value: Array.isArray(characters) ? characters.slice(0, 4).map(compactValue).filter(Boolean).join(', ') : '' },
  ].filter((entry) => entry.value);
  const skip = new Set(['schemaversion', 'schema_version', 'scenetitle', 'title', 'name', 'scene', 'scenename', 'sceneidentity', 'narrativedelta', 'characters', 'cast', 'present']);
  const remaining = Object.entries(data)
    .filter(([key, value]) => !skip.has(key.toLowerCase()) && value !== null && value !== undefined && value !== '')
    .map(([key, value]) => ({ key, value: compactValue(value) }))
    .filter((entry) => entry.value)
    .slice(0, 5);
  return [...preferred, ...remaining].slice(0, 5);
}

export function renderCompactTrackerForState(tracker: LoomTrackerState, state: LoomFrontendState): string {
  const { preset, missing } = resolvePresetForTracker(state, tracker);
  const title = String(getFallbackField(tracker.data, [
    'sceneIdentity.title',
    'sceneTitle',
    'title',
    'name',
    'sceneName',
    'scene',
  ]) || tracker.compactSummary || 'Continuity State');
  const fields = collectCompactFields(tracker.data);
  const summary = String(getFallbackField(tracker.data, [
    'narrativeDelta.whatChangedThisTurn',
    'narrativeDelta.summary',
    'delta',
    'summary',
    'compactSummary',
  ]) || (tracker.compactSummary && tracker.compactSummary !== title ? tracker.compactSummary : fields[0]?.value) || 'No compact summary recorded.');

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
