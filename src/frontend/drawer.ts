import { renderTrackerHtml } from '../shared/renderer.js';
import type { LoomCustomTemplateMode, LoomFrontendState, LoomTrackerState } from '../shared/types.js';
import { renderTrackerForState, resolveActiveTrackerForState } from './rendering.js';
import { renderPresetEditor } from './presetEditor.js';
import { renderFeatureBreakdown } from './settingsPanel.js';
import { badge, button, escapeHtml, type LoomUiStatus } from './ui.js';
import { getFocusedTrackerRef, isUiSectionOpen, type FocusedTrackerRef } from './uiState.js';

function renderConnectionOptions(state: LoomFrontendState): string {
  const selected = state.settings.sidecarConnectionId || '';
  const options = [
    `<option value=""${selected ? '' : ' selected'}>Use default/current connection</option>`,
    ...state.connections.map((connection) => {
      const label = [
        connection.name,
        connection.model ? `(${connection.model})` : '',
        connection.is_default ? 'default' : '',
      ].filter(Boolean).join(' ');
      return `<option value="${escapeHtml(connection.id)}"${selected === connection.id ? ' selected' : ''}>${escapeHtml(label)}</option>`;
    }),
  ];
  return options.join('');
}

function effectiveTemplateMode(state: LoomFrontendState): LoomCustomTemplateMode {
  return state.settings.useSafeRenderer ? 'safe_generic' : (state.settings.customTemplateMode || 'trusted_layout');
}

function renderPresetOptions(state: LoomFrontendState): string {
  return state.presets.map((preset) => {
    const selected = preset.id === state.settings.activePresetId ? ' selected' : '';
    let suffix = `[~${preset.maxInjectionTokens || 200}t - Custom]`;
    if (preset.id === 'micro_loom') suffix = '[~150t - Tiny]';
    else if (preset.id === 'slim_scene_loom') suffix = '[~350t - Slim]';
    else if (preset.id === 'balanced_story_loom') suffix = '[~400t - Balanced]';
    else if (preset.id === 'cast_continuity_loom') suffix = '[~400t - Detailed]';
    else if (preset.id === 'full_continuity_ledger') suffix = '[~450t - Full]';
    else if (preset.id === 'grand_continuity_atlas') suffix = '[~2500t - Grand]';
    return `<option value="${escapeHtml(preset.id)}"${selected}>${escapeHtml(preset.name)} ${suffix}</option>`;
  }).join('');
}

function renderPlacementOptions(state: LoomFrontendState): string {
  return ['top', 'bottom'].map((placement) => {
    let label = placement === 'top' ? 'Top of message' : 'Bottom of message';
    const selected = state.settings.messageCardPlacement === placement ? ' selected' : '';
    return `<option value="${placement}"${selected}>${label}</option>`;
  }).join('');
}

function renderCardDensityOptions(state: LoomFrontendState): string {
  return ['compact', 'normal'].map((density) => {
    let label = density === 'compact' ? 'Compact density' : 'Normal density';
    const selected = state.settings.cardDensity === density ? ' selected' : '';
    return `<option value="${density}"${selected}>${label}</option>`;
  }).join('');
}

function detailOpenAttr(id: string, defaultOpen = false): string {
  return isUiSectionOpen(id, defaultOpen) ? ' open' : '';
}

function renderSettingsSection(id: string, title: string, meta: string, body: string, defaultOpen = false): string {
  return [
    `<details class="sotl-details sotl-settings-section" data-sotl-section="${escapeHtml(id)}"${detailOpenAttr(id, defaultOpen)}>`,
    `<summary><span class="sotl-summary-title">${escapeHtml(title)}</span>${meta ? `<span class="sotl-summary-meta">${escapeHtml(meta)}</span>` : ''}</summary>`,
    body,
    '</details>',
  ].join('');
}

function renderSavePulse(status: LoomUiStatus): string {
  if (!status.lastSettingsSavedAt) return '';
  return '<span class="sotl-save-pulse">Saved</span>';
}

function formatTrackerAge(generatedAt?: string): string {
  if (!generatedAt) return 'none yet';
  const time = Date.parse(generatedAt);
  if (Number.isNaN(time)) return generatedAt;
  const seconds = Math.max(0, Math.round((Date.now() - time) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

function renderTimeoutOptions(state: LoomFrontendState): string {
  const timeoutMs = state.settings.sidecarGenerationTimeoutMs ?? 180000;
  return [
    `<option value="60000"${timeoutMs === 60000 ? ' selected' : ''}>60 seconds</option>`,
    `<option value="120000"${timeoutMs === 120000 ? ' selected' : ''}>120 seconds</option>`,
    `<option value="180000"${timeoutMs === 180000 ? ' selected' : ''}>180 seconds (default)</option>`,
    `<option value="300000"${timeoutMs === 300000 ? ' selected' : ''}>300 seconds</option>`,
    `<option value="0"${timeoutMs === 0 ? ' selected' : ''}>No timeout (manual cancel only)</option>`,
  ].join('');
}

function renderHistoryLimitOptions(state: LoomFrontendState): string {
  const limit = state.settings.trackerHistoryLimit ?? 20;
  return [
    `<option value="5"${limit === 5 ? ' selected' : ''}>Last 5 full trackers</option>`,
    `<option value="10"${limit === 10 ? ' selected' : ''}>Last 10 full trackers</option>`,
    `<option value="20"${limit === 20 ? ' selected' : ''}>Last 20 full trackers (default)</option>`,
    `<option value="50"${limit === 50 ? ' selected' : ''}>Last 50 full trackers</option>`,
    `<option value="0"${limit === 0 ? ' selected' : ''}>Unlimited (manual cleanup)</option>`,
  ].join('');
}

function renderInjectionBudgetOptions(state: LoomFrontendState): string {
  const budget = state.settings.promptInjectionTokenBudget ?? 700;
  return [300, 500, 700, 1000, 1500, 2000].map((value) => (
    `<option value="${value}"${budget === value ? ' selected' : ''}>~${value} tokens</option>`
  )).join('');
}

function renderInjectionLimitOptions(state: LoomFrontendState): string {
  const limit = state.settings.promptInjectionTrackerLimit ?? 5;
  return [1, 3, 5, 10].map((value) => (
    `<option value="${value}"${limit === value ? ' selected' : ''}>Latest + ${value} compact summar${value === 1 ? 'y' : 'ies'}</option>`
  )).join('');
}

function renderGenerationHistoryLimitOptions(state: LoomFrontendState): string {
  const limit = state.settings.trackerGenerationHistoryLimit ?? 5;
  return [0, 3, 5, 10].map((value) => (
    `<option value="${value}"${limit === value ? ' selected' : ''}>Previous full + ${value} compact summar${value === 1 ? 'y' : 'ies'}</option>`
  )).join('');
}

function formatSwipeLabel(swipeId?: number | undefined): string {
  return typeof swipeId === 'number' ? `Swipe ${swipeId + 1}` : 'Main swipe';
}

function renderSwipeChip(swipeId?: number | undefined, active = false): string {
  if (typeof swipeId !== 'number') return '';
  return `<span class="sotl-swipe-chip${active ? ' sotl-swipe-chip--active' : ''}" title="${active ? 'Currently selected assistant swipe' : 'Stored assistant swipe'}">${escapeHtml(formatSwipeLabel(swipeId))}${active ? ' active' : ''}</span>`;
}

function trackerActionButton(label: string, action: string, tracker: LoomTrackerState, options: { primary?: boolean } = {}): string {
  const id = tracker.messageId || 'latest';
  const primary = options.primary ? ' data-primary="true"' : '';
  const swipe = typeof tracker.swipeId === 'number' ? ` data-sotl-swipe-id="${tracker.swipeId}"` : '';
  return `<button class="sotl-button" type="button" data-sotl-action="${escapeHtml(action)}" data-sotl-message-id="${escapeHtml(id)}"${swipe}${primary}>${escapeHtml(label)}</button>`;
}

function formatMessageReference(id: string, index: number): string {
  const match = id.match(/(?:message[-_:#]?|msg[-_:#]?|^)(\d+)$/i);
  if (match?.[1]) return `Message #${match[1]}`;
  return `Retained message ${index + 1}`;
}

function resolveFocusedTracker(state: LoomFrontendState, ref: FocusedTrackerRef): { tracker?: LoomTrackerState | undefined; swipeId?: number | undefined; notice?: string | undefined } {
  const trackers = state.messageTrackers.filter((tracker) => tracker.messageId === ref.messageId);
  const activeSwipe = typeof ref.swipeId === 'number' ? ref.swipeId : state.activeSwipeByMessageId[ref.messageId];
  if (typeof activeSwipe === 'number') {
    const exact = trackers.find((tracker) => tracker.swipeId === activeSwipe);
    if (exact) return { tracker: exact, swipeId: activeSwipe, notice: ref.notice };
    if (trackers.some((tracker) => typeof tracker.swipeId === 'number')) {
      return {
        swipeId: activeSwipe,
        notice: ref.notice || `No tracker is stored for ${formatSwipeLabel(activeSwipe)} on this message. It may not have generated yet or may have been pruned by the tracker history limit.`,
      };
    }
  }
  if (trackers.length === 1 && trackers[0] && typeof trackers[0].swipeId !== 'number') {
    return { tracker: trackers[0], swipeId: trackers[0].swipeId, notice: ref.notice };
  }
  if (trackers.length === 0) {
    return { swipeId: activeSwipe, notice: ref.notice || 'No tracker is stored for this message.' };
  }
  return {
    swipeId: activeSwipe,
    notice: ref.notice || 'State of the Loom did not guess between multiple stored swipe trackers because the active swipe is unclear.',
  };
}

function renderFocusedTracker(state: LoomFrontendState): string {
  const ref = getFocusedTrackerRef();
  if (!ref) return '';
  const resolved = resolveFocusedTracker(state, ref);
  const swipeLabel = typeof resolved.swipeId === 'number' ? formatSwipeLabel(resolved.swipeId) : 'active swipe';
  const headerMeta = [
    `Message ${ref.messageId}`,
    swipeLabel,
  ].filter(Boolean).join(' - ');
  const backButton = button('Back to Current Loom', 'clear-focused-tracker', { title: 'Return the drawer to the normal current tracker view.' });

  if (!resolved.tracker) {
    return [
      '<section class="sotl-panel sotl-focused-tracker" data-sotl-focused-tracker="true">',
      '<h3>Focused Tracker</h3>',
      `<p class="sotl-note">${escapeHtml(headerMeta)}</p>`,
      `<p class="sotl-note sotl-warning">${escapeHtml(resolved.notice || 'No tracker is available for this exact message and swipe.')}</p>`,
      '<div class="sotl-actions">',
      backButton,
      '</div>',
      '</section>',
    ].join('');
  }

  const render = renderTrackerForState(resolved.tracker, state);
  const warning = render.warning
    ? `<p class="sotl-note sotl-warning" style="margin-top: 8px;">${escapeHtml(render.warning)}</p>`
    : '';
  return [
    '<section class="sotl-panel sotl-focused-tracker" data-sotl-focused-tracker="true">',
    '<h3>Focused Tracker</h3>',
    `<p class="sotl-note">${escapeHtml(headerMeta)} ${renderSwipeChip(resolved.tracker.swipeId, true)}</p>`,
    resolved.notice ? `<p class="sotl-note sotl-warning">${escapeHtml(resolved.notice)}</p>` : '',
    `<p class="sotl-note">${escapeHtml(resolved.tracker.compactSummary)}</p>`,
    `<div class="sotl-preview">${render.html}</div>`,
    warning,
    '<div class="sotl-actions">',
    backButton,
    trackerActionButton('Regenerate', `regenerate:${resolved.tracker.messageId || 'latest'}`, resolved.tracker, { primary: true }),
    '</div>',
    '</section>',
  ].join('');
}

function renderLatestTracker(state: LoomFrontendState): string {
  const activeResolution = resolveActiveTrackerForState(state);
  const tracker = activeResolution.tracker;
  if (!tracker) {
    if (activeResolution.missingMessageId && typeof activeResolution.missingSwipeId === 'number') {
      return `<p class="sotl-note sotl-warning">No tracker retained/generated for ${escapeHtml(formatSwipeLabel(activeResolution.missingSwipeId))} on the currently selected response. State of the Loom will not show another swipe's tracker here.</p>`;
    }
    const activeMessageId = state.diagnostics.swipeReport?.activeMessageId;
    const activeSwipeId = state.diagnostics.swipeReport?.activeSwipeId;
    const hasOtherSwipeTracker = Boolean(activeMessageId && state.messageTrackers.some((tracker) => tracker.messageId === activeMessageId));
    if (hasOtherSwipeTracker && typeof activeSwipeId === 'number') {
      return `<p class="sotl-note">No tracker has been stored for the selected ${escapeHtml(formatSwipeLabel(activeSwipeId))} yet. Generate a tracker while this swipe is visible to attach the right state.</p>`;
    }
    return '<p class="sotl-note">No tracker has been stored for this chat yet.</p>';
  }
  const render = renderTrackerForState(tracker, state);
  const html = render.html;
  const renderWarning = render.warning
    ? `<p class="sotl-note sotl-warning" style="margin-top: 8px;">${escapeHtml(render.warning)}</p>`
    : '';
  const isActiveSwipe = Boolean(
    tracker.messageId
    && typeof tracker.swipeId === 'number'
    && state.activeSwipeByMessageId[tracker.messageId] === tracker.swipeId,
  );
  const attachmentStatus = state.settings.renderInMessages && tracker.messageId
    ? `<p class="sotl-note" style="color: var(--lv-success-text, #176b43); font-weight: 600; margin-top: 8px;">Attached to message card (${escapeHtml(tracker.messageId)})</p>`
    : '<p class="sotl-note" style="margin-top: 8px;">Status: Not attached to a message card.</p>';

  return [
    typeof tracker.swipeId === 'number' ? `<div class="sotl-chip-row">${renderSwipeChip(tracker.swipeId, isActiveSwipe)}</div>` : '',
    `<p class="sotl-note">${escapeHtml(tracker.compactSummary)}</p>`,
    `<div class="sotl-preview">${html}</div>`,
    renderWarning,
    attachmentStatus,
    '<details class="sotl-details"><summary>Manual JSON edit</summary>',
    '<div class="sotl-fields" style="margin-top: 10px;">',
    `<textarea class="sotl-textarea" data-sotl-field="latestJson">${escapeHtml(JSON.stringify(tracker.data, null, 2))}</textarea>`,
    '<div class="sotl-actions">',
    button('Save JSON', 'save-json'),
    button('Copy JSON', 'copy-json', { title: 'Copy Loom JSON to clipboard' }),
    '</div>',
    '</div>',
    '</details>',
  ].join('');
}

function renderMessageList(state: LoomFrontendState): string {
  if (state.messageTrackers.length === 0) return '<p class="sotl-note">No retained message trackers yet. The list uses your tracker history limit and shows message/swipe snapshots that have not been cleaned.</p>';
  const focused = getFocusedTrackerRef();
  const groups = new Map<string, LoomTrackerState[]>();
  for (const tracker of state.messageTrackers) {
    const id = tracker.messageId || 'latest';
    const list = groups.get(id) ?? [];
    list.push(tracker);
    groups.set(id, list);
  }

  const currentTracker = resolveActiveTrackerForState(state).tracker;
  const renderTrackerRow = (tracker: LoomTrackerState, activeSwipe?: number | undefined, compact = false, index = 0): string => {
    const id = tracker.messageId || 'latest';
    const active = typeof activeSwipe === 'number' && tracker.swipeId === activeSwipe;
    const isFocused = Boolean(focused && focused.messageId === id && (typeof focused.swipeId !== 'number' || focused.swipeId === tracker.swipeId));
    const isCurrent = Boolean(currentTracker && currentTracker.messageId === tracker.messageId && currentTracker.swipeId === tracker.swipeId);
    const rowClass = `${compact ? 'sotl-swipe-row' : 'sotl-message-row'}${isFocused ? ' sotl-message-row--focused' : ''}`;
    const exactSwipe = typeof tracker.swipeId === 'number' ? ` data-sotl-swipe-id="${tracker.swipeId}"` : '';
    const status = isCurrent ? 'Current selected tracker' : active ? 'Selected swipe tracker' : 'Previous retained tracker';
    return [
      `<div class="${rowClass}" data-sotl-action="view-tracker" data-sotl-message-id="${escapeHtml(id)}"${exactSwipe} role="button" tabindex="0" title="Open this retained tracker">`,
      '  <div class="sotl-message-row__main">',
      `    <p class="sotl-note sotl-message-row__eyebrow">${escapeHtml(formatMessageReference(id, index))} - ${escapeHtml(status)}</p>`,
      `    <h3>${escapeHtml(tracker.compactSummary || id)}</h3>`,
      `    <p class="sotl-note">${renderSwipeChip(tracker.swipeId, active)} ${escapeHtml(tracker.source)} - ${escapeHtml(tracker.generatedAt)}</p>`,
      '  </div>',
      '  <div class="sotl-actions">',
      trackerActionButton('View', 'view-tracker', tracker, { primary: isCurrent }),
      trackerActionButton('Regenerate', `regenerate:${id}`, tracker, { primary: false }),
      trackerActionButton(tracker.hidden ? 'Show' : 'Hide', `hide:${id}`, tracker),
      trackerActionButton('Delete', `delete:${id}`, tracker),
      '  </div>',
      '</div>',
    ].join('');
  };

  const intro = '<p class="sotl-note">Retained tracker snapshots for this chat. The list follows your tracker history limit; rows open the exact message/swipe tracker.</p>';
  return intro + Array.from(groups.entries()).map(([id, trackers], groupIndex) => {
    const activeSwipe = state.activeSwipeByMessageId[id];
    const sorted = trackers
      .slice()
      .sort((a, b) => {
        if (typeof activeSwipe === 'number') {
          if (a.swipeId === activeSwipe) return -1;
          if (b.swipeId === activeSwipe) return 1;
        }
        return b.generatedAt.localeCompare(a.generatedAt);
      });
    const primary = sorted[0];
    const alternatives = sorted.slice(1);
    if (!primary) return '';
    return [
      '<div class="sotl-panel sotl-message-group">',
      renderTrackerRow(primary, activeSwipe, false, groupIndex),
      alternatives.length > 0
        ? [
          `<details class="sotl-details sotl-swipe-alternatives" data-sotl-section="swipe-alternatives-${escapeHtml(id)}">`,
          `<summary><span class="sotl-summary-title">Swipe Alternatives</span><span class="sotl-summary-meta">${alternatives.length} stored</span></summary>`,
          '<div class="sotl-fields">',
          alternatives.map((tracker) => renderTrackerRow(tracker, activeSwipe, true, groupIndex)).join(''),
          '</div>',
          '</details>',
        ].join('')
        : '',
      '</div>',
    ].join('');
  }).join('');
}

function renderPipelineReport(state: LoomFrontendState): string {
  const report = state.diagnostics.pipelineReport;
  if (!report) {
    return '<p class="sotl-note" style="margin-top: 4px;">No generation has been performed yet in this session.</p>';
  }

  const successColor = 'var(--lv-success-text, #176b43)';
  const errorColor = 'var(--lv-error-text, #bd2130)';

  const rawVal = report.rawResponseAvailable ? `<span style="color: ${successColor}; font-weight: 600;">Yes</span>` : `<span style="color: ${errorColor}; font-weight: 600;">No</span>`;
  const parseVal = report.parseSuccess 
    ? `<span style="color: ${successColor}; font-weight: 600;">Success</span>` 
    : `<span style="color: ${errorColor}; font-weight: 600;">Failed: ${escapeHtml(report.parseError || 'Unknown parser error')}</span>`;
  const valVal = report.schemaValidationSuccess 
    ? `<span style="color: ${successColor}; font-weight: 600;">Success</span>` 
    : `<span style="color: ${errorColor}; font-weight: 600;">Failed: ${escapeHtml(report.schemaValidationError || 'Invalid schema')}</span>`;
  const renderVal = report.renderSuccess 
    ? `<span style="color: ${successColor}; font-weight: 600;">Success</span>` 
    : `<span style="color: ${errorColor}; font-weight: 600;">Failed: ${escapeHtml(report.renderError || 'Render error')}</span>`;
  const sanitizerVal = report.sanitizerRemovedContent 
    ? `<span style="color: ${errorColor}; font-weight: 600;">Yes (cleanup removed unsafe content)</span>`
    : `<span style="color: ${successColor}; font-weight: 600;">No (layout preserved)</span>`;
  const fallbackVal = report.fallbackUsed 
    ? `<span style="color: #b58900; font-weight: 600;">Yes (Fallback active)</span>` 
    : `<span style="color: ${successColor}; font-weight: 600;">No (Template OK)</span>`;

  return `
    <div style="font-size: 11px; display: grid; gap: 4px; padding: 10px; background: rgba(0,0,0,0.06); border-radius: 6px; border: 1px solid var(--lumiverse-border, rgba(80,88,100,0.15)); margin-top: 8px; line-height: 1.4;">
      <div><strong>Active Preset ID:</strong> <code>${escapeHtml(report.activePresetId)}</code></div>
      <div><strong>Preset Name:</strong> ${escapeHtml(report.presetName)}</div>
      <div><strong>Preset Source:</strong> <code>${escapeHtml(report.presetSource)}</code></div>
      <div><strong>Timestamp:</strong> <code>${escapeHtml(report.timestamp)}</code></div>
      <div><strong>Generation Started:</strong> <code>${escapeHtml(report.generationStartedAt || 'n/a')}</code></div>
      <div><strong>Generation Completed:</strong> <code>${escapeHtml(report.generationCompletedAt || 'n/a')}</code></div>
      <div><strong>Elapsed:</strong> <code>${report.elapsedMs !== undefined ? `${Math.round(report.elapsedMs / 100) / 10}s` : 'n/a'}</code></div>
      <div><strong>Timeout:</strong> <code>${report.timeoutMs === 0 ? 'manual cancel only' : report.timeoutMs ? `${Math.round(report.timeoutMs / 1000)}s` : 'n/a'}</code></div>
      <div><strong>Previous Full Tracker JSON Included:</strong> <code>${report.previousFullTrackerIncluded ? 'yes' : 'no'}</code></div>
      ${report.previousFullTrackerMessageId ? `<div><strong>Previous Full Tracker Source:</strong> <code>${escapeHtml(report.previousFullTrackerMessageId)}${typeof report.previousFullTrackerSwipeId === 'number' ? ` - ${escapeHtml(formatSwipeLabel(report.previousFullTrackerSwipeId))}` : ''}</code></div>` : ''}
      <div><strong>Recent Tracker Summaries Included:</strong> <code>${report.recentTrackerSummariesIncluded ?? 0}</code></div>
      <div><strong>Recent Summaries Compact Only:</strong> <code>${report.recentTrackerSummariesCompactOnly === false ? 'no' : 'yes'}</code></div>
      <div><strong>Recent Chat Context Included:</strong> <code>${report.recentChatContextIncluded ? 'yes' : 'no'}${typeof report.recentChatContextMessageCount === 'number' ? ` - ${report.recentChatContextMessageCount} messages` : ''}</code></div>
      <div><strong>Activated World Info / Lorebook Included:</strong> <code>${report.worldInfoIncluded ? 'yes' : 'no'}</code></div>
      ${report.worldInfoStatus ? `<div><strong>World Info Status:</strong> <code>${escapeHtml(report.worldInfoStatus)}</code></div>` : ''}
      <div><strong>Estimated Sidecar Prompt:</strong> <code>${typeof report.estimatedSidecarPromptTokens === 'number' ? `~${report.estimatedSidecarPromptTokens} tokens` : 'n/a'}</code></div>
      <div><strong>Stored Snapshot Retention:</strong> <code>${report.storageRetentionLimit === 0 ? 'unlimited' : `last ${report.storageRetentionLimit ?? 'n/a'}`}</code></div>
      <div><strong>Tracker Generation History:</strong> <code>previous full + ${report.trackerGenerationHistoryLimit ?? 5} compact summaries</code></div>
      <div><strong>RP Context Depth:</strong> <code>latest + ${report.promptInjectionTrackerLimit ?? 5} compact summaries setting</code></div>
      <div><strong>Raw Response Available:</strong> ${rawVal}</div>
      ${report.rawResponsePreview ? `<div><strong>Raw Response Preview:</strong> <code>${escapeHtml(report.rawResponsePreview)}</code></div>` : ''}
      <div><strong>JSON Parse:</strong> ${parseVal}</div>
      ${report.parseFailureCategory ? `<div><strong>Parse Category:</strong> <code>${escapeHtml(report.parseFailureCategory)}</code></div>` : ''}
      <div><strong>Schema Validation:</strong> ${valVal}</div>
      ${report.schemaValidationIssues && report.schemaValidationIssues.length > 0 ? `<div><strong>Schema Issues:</strong> <code>${escapeHtml(report.schemaValidationIssues.map((issue) => `${issue.path || '(root)'} ${issue.message}`).join(' | '))}</code></div>` : ''}
      <div><strong>HTML Render:</strong> ${renderVal}</div>
      ${report.renderWarning ? `<div><strong>Render Warning:</strong> <code>${escapeHtml(report.renderWarning)}</code></div>` : ''}
      <div><strong>Template Mode:</strong> <code>${escapeHtml(report.templateMode || 'n/a')}</code></div>
      <div><strong>Template Cleanup Removed Content:</strong> ${sanitizerVal}</div>
      <div><strong>Fallback Card Used:</strong> ${fallbackVal}</div>
      <div><strong>Unrendered Data Appended:</strong> ${report.preservedData ? `<span style="color: ${successColor}; font-weight: 600;">Yes</span>` : 'No'}</div>
      ${report.templateCompatibility ? `<div><strong>Template Missing Latest Fields:</strong> <code>${escapeHtml(report.templateCompatibility.missingFromLatest.join(', ') || 'none')}</code></div>` : ''}
      ${report.trackerPresetId ? `<div><strong>Tracker Preset ID:</strong> <code>${escapeHtml(report.trackerPresetId)}</code></div>` : ''}
      <div><strong>Latest Tracker Message ID:</strong> <code>${escapeHtml(report.messageId)}</code></div>
      ${typeof report.swipeId === 'number' ? `<div><strong>Latest Tracker Swipe:</strong> <code>${escapeHtml(formatSwipeLabel(report.swipeId))}</code></div>` : ''}
      <div><strong>Chat ID:</strong> <code>${escapeHtml(report.chatId)}</code></div>
      <div><strong>HUD View Mode:</strong> <code>${escapeHtml(report.hudView)}</code></div>
      <div><strong>Retained Tracker Count:</strong> <code>${report.retainedCount}</code></div>
      ${report.lastError ? `<div><strong>Last Error:</strong> <code>${escapeHtml(report.lastError)}</code></div>` : ''}
    </div>
  `;
}

function renderSwipeReport(state: LoomFrontendState): string {
  const report = state.diagnostics.swipeReport;
  if (!report) return '<p class="sotl-note">No swipe report is available yet.</p>';
  return [
    '<div class="sotl-diagnostic-grid sotl-swipe-report">',
    `  <div><strong>Active Message ID:</strong> <code>${escapeHtml(report.activeMessageId || 'unknown')}</code></div>`,
    `  <div><strong>Active Swipe ID:</strong> <code>${typeof report.activeSwipeId === 'number' ? escapeHtml(formatSwipeLabel(report.activeSwipeId)) : 'unknown'}</code></div>`,
    `  <div><strong>Stored Swipe Trackers:</strong> <code>${report.storedSwipeTrackerCount}</code></div>`,
    `  <div><strong>Swipe Alternatives:</strong> <code>${report.alternativeSwipeTrackerCount}</code></div>`,
    `  <div><strong>Last Cleanup:</strong> <code>${escapeHtml(report.cleanupLastRunAt || 'not run yet')}</code></div>`,
    `  <div><strong>Cleanup Result:</strong> <code>${report.cleanupRemovedCount ?? 0} removed / ${report.cleanupKeptCount ?? 0} kept</code></div>`,
    report.cleanupWarning ? `  <div><strong>Cleanup Warning:</strong> <code>${escapeHtml(report.cleanupWarning)}</code></div>` : '',
    '</div>',
  ].filter(Boolean).join('');
}

function renderInjectionReport(state: LoomFrontendState): string {
  const report = state.diagnostics.injectionReport;
  const successColor = 'var(--lv-success-text, #176b43)';
  const warningColor = 'var(--lv-warning-text, #8a4f00)';
  if (!report) return '<p class="sotl-note">No injection report is available yet.</p>';
  const enabled = report.enabled
    ? `<span style="color: ${successColor}; font-weight: 600;">Enabled</span>`
    : `<span style="color: ${warningColor}; font-weight: 600;">Disabled</span>`;
  const registered = report.registered
    ? `<span style="color: ${successColor}; font-weight: 600;">Interceptor detected</span>`
    : `<span style="color: ${warningColor}; font-weight: 600;">Interceptor not detected</span>`;
  const tokenColor = report.estimatedTokens > report.tokenBudget ? 'var(--lv-error-text, #bd2130)' : successColor;
  return [
    '<div class="sotl-injection-report">',
    `<div><strong>Status:</strong> ${enabled} - ${registered}</div>`,
    `<div><strong>Mode:</strong> <code>${escapeHtml(report.mode)}</code></div>`,
    `<div><strong>Latest tracker available:</strong> <code>${report.latestTrackerAvailable ?? report.available ? 'yes' : 'no'}</code></div>`,
    report.activeMessageId ? `<div><strong>Active message / swipe:</strong> <code>${escapeHtml(report.activeMessageId)}${typeof report.activeSwipeId === 'number' ? ` - ${escapeHtml(formatSwipeLabel(report.activeSwipeId))}` : ''}</code></div>` : '',
    `<div><strong>Used current active swipe tracker:</strong> <code>${report.activeSwipeTrackerUsed ? 'yes' : 'no'}</code></div>`,
    `<div><strong>Wrong-swipe fallback avoided:</strong> <code>${report.wrongSwipeFallbackAvoided ? 'yes' : 'not needed'}</code></div>`,
    `<div><strong>Estimated prompt cost:</strong> <span style="color:${tokenColor};font-weight:700;">~${report.estimatedTokens} tokens</span> / ${report.tokenBudget}</div>`,
    `<div><strong>Trackers included in RP context:</strong> ${report.latestTrackerAvailable ?? report.available ? 1 : 0} latest + ${report.historyCount} compact summaries</div>`,
    `<div><strong>Tracker context depth setting:</strong> <code>latest + ${report.contextDepthSetting ?? state.settings.promptInjectionTrackerLimit ?? 5}</code></div>`,
    `<div><strong>Full tracker retention setting:</strong> <code>${(report.storageRetentionSetting ?? state.settings.trackerHistoryLimit) === 0 ? 'unlimited' : `last ${report.storageRetentionSetting ?? state.settings.trackerHistoryLimit}`}</code></div>`,
    `<div><strong>History format:</strong> <code>${report.historyCompactOnly === false ? 'rich/full' : 'compact summaries only'}</code></div>`,
    report.trackerPresetId ? `<div><strong>Latest preset:</strong> <code>${escapeHtml(report.trackerPresetId)}</code></div>` : '',
    report.trackerGeneratedAt ? `<div><strong>Latest tracker:</strong> <code>${escapeHtml(report.trackerGeneratedAt)}</code></div>` : '',
    report.truncated ? `<div><strong>Budget trim:</strong> <span style="color:${warningColor};font-weight:600;">Lower-priority details omitted</span></div>` : '',
    report.injectedAt ? `<div><strong>Last injected:</strong> <code>${escapeHtml(report.injectedAt)}</code></div>` : '',
    report.lastSkippedReason ? `<div><strong>Note:</strong> ${escapeHtml(report.lastSkippedReason)}</div>` : '',
    report.preview ? `<details class="sotl-details"><summary>Injection Preview</summary><pre class="sotl-code">${escapeHtml(report.preview)}</pre></details>` : '',
    '</div>',
  ].filter(Boolean).join('');
}

function renderActiveTemplatePreview(state: LoomFrontendState): string {
  return renderSettingsSection(
    'active-template-preview',
    'Active Template Preview',
    state.activePreset.name,
    [
      '<div class="sotl-fields">',
      `  <p class="sotl-note sotl-strong-note">Template: ${escapeHtml(state.activePreset.name)}</p>`,
      `  <p class="sotl-note">${escapeHtml(state.activePreset.description || 'No description.')}</p>`,
      '  <div class="sotl-preview sotl-preview--short">',
      (() => {
        try {
          const mockTracker = {
            version: state.activePreset.version || '1.0.0',
            schemaVersion: '1',
            presetId: state.activePreset.id,
            chatId: 'preview-chat',
            generatedAt: new Date().toISOString(),
            source: 'manual_edit' as const,
            placement: state.activePreset.defaultPlacement,
            data: state.activePreset.sampleData || {},
            compactSummary: 'Sample preview for ' + state.activePreset.name,
            validation: { ok: true, issues: [] },
          };
          return renderTrackerHtml(mockTracker, state.activePreset, effectiveTemplateMode(state));
        } catch (err) {
          return `<p class="sotl-note sotl-warning">Preview render failed: ${escapeHtml(err instanceof Error ? err.message : String(err))}</p>`;
        }
      })(),
      '  </div>',
      '</div>',
    ].join(''),
  );
}

function renderGenerationBanner(state: LoomFrontendState, disabledReason: string): string {
  if (state.generation.running) {
    return [
      '<div class="sotl-status-banner sotl-status-banner--info">',
      '  <span class="sotl-spin sotl-status-dot"></span>',
      `  <div>${escapeHtml(state.generation.message || 'Generating tracker...')}</div>`,
      '</div>',
    ].join('');
  }
  if (disabledReason) {
    return [
      '<div class="sotl-status-banner sotl-status-banner--warning">',
      '  <span class="sotl-status-dot">!</span>',
      `  <div>Blocked: ${escapeHtml(disabledReason)}</div>`,
      '</div>',
    ].join('');
  }
  return [
    '<div class="sotl-status-banner sotl-status-banner--success">',
    '  <span class="sotl-status-dot"></span>',
    '  <div>Ready to track the latest assistant message.</div>',
    '</div>',
  ].join('');
}

function renderToast(status: LoomUiStatus): string {
  if (!status.lastToast) return '';
  return [
    `<div class="sotl-toast sotl-toast--${escapeHtml(status.lastToast.level)}">`,
    `  <strong>${escapeHtml(status.lastToast.level)}</strong>`,
    `  <span>${escapeHtml(status.lastToast.message)}</span>`,
    '</div>',
  ].join('');
}

function renderControlsPanel(
  state: LoomFrontendState,
  status: LoomUiStatus,
  selectedConnection: LoomFrontendState['connections'][number] | undefined,
  disabledReason: string,
): string {
  const report = state.diagnostics.injectionReport;
  const tokenMeta = report ? `~${report.estimatedTokens}/${report.tokenBudget} tokens` : 'no estimate';
  const latestAge = formatTrackerAge(state.latestTracker?.generatedAt);
  const swipeMeta = state.diagnostics.swipeReport?.activeSwipeId !== undefined
    ? formatSwipeLabel(state.diagnostics.swipeReport.activeSwipeId)
    : 'active swipe unknown';
  return [
    '<section class="sotl-panel sotl-control-panel">',
    '<div class="sotl-panel-head">',
    '  <div>',
    '    <h3>Quick Status</h3>',
    `    <p class="sotl-note">Active chat: ${escapeHtml(state.activeChat.name || state.activeChat.id || 'Unavailable')}</p>`,
    '  </div>',
    renderSavePulse(status),
    '</div>',
    '<div class="sotl-quick-grid">',
    `  <article><span>Preset</span><strong>${escapeHtml(state.activePreset.name)}</strong><em>${escapeHtml(state.activePreset.origin || 'built-in')}</em></article>`,
    `  <article><span>Generation</span><strong>${state.generation.running ? 'Running' : disabledReason ? 'Blocked' : 'Ready'}</strong><em>${escapeHtml(disabledReason || state.generation.message || 'manual or auto')}</em></article>`,
    `  <article><span>Injection</span><strong>${state.settings.promptInjectionEnabled ? 'Enabled' : 'Disabled'}</strong><em>${escapeHtml(tokenMeta)}</em></article>`,
    `  <article><span>Latest Tracker</span><strong>${escapeHtml(latestAge)}</strong><em>${state.messageTrackers.length} retained cards - ${escapeHtml(swipeMeta)}</em></article>`,
    '</div>',
    '<div class="sotl-status">',
    badge('Backend ready', state.backendReady),
    badge('Chats', state.permissions.chats),
    badge('Chat mutation', state.permissions.chat_mutation),
    badge('Generation', state.permissions.generation),
    badge('Prompt injection', Boolean(state.permissions.interceptor || state.diagnostics.injectionReport?.registered)),
    badge('Settings UI', Boolean(state.permissions.app_manipulation)),
    '</div>',
    renderSettingsSection(
      'tracking',
      'Tracking',
      state.generation.running ? 'generating' : selectedConnection?.name || 'default connection',
      [
        '<div class="sotl-fields">',
        '<label class="sotl-label">Preset',
        `<select class="sotl-select" data-sotl-field="preset">${renderPresetOptions(state)}</select>`,
        '</label>',
        renderActiveTemplatePreview(state),
        '<label class="sotl-label">Sidecar connection',
        `<select class="sotl-select" data-sotl-field="connection">${renderConnectionOptions(state)}</select>`,
        '</label>',
        `<p class="sotl-note">Connection: ${escapeHtml(selectedConnection?.name || (state.settings.useDefaultConnectionFallback ? 'default/current fallback' : 'none selected'))}</p>`,
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="fallback" ' + (state.settings.useDefaultConnectionFallback ? 'checked' : '') + '> Use default/current connection when none is selected</label>',
        !state.permissions.generation ? '<p class="sotl-note">Generation permission is missing; passive fenced extraction is still available.</p>' : '',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="autoGenerate" ' + (state.settings.autoGenerate ? 'checked' : '') + '> Auto-generate after assistant messages</label>',
        '<label class="sotl-label">Generation timeout',
        `<select class="sotl-select" data-sotl-field="sidecarGenerationTimeoutMs">${renderTimeoutOptions(state)}</select>`,
        '</label>',
        '<div class="sotl-actions">',
        state.generation.running
          ? button('Stop Generation', 'cancel-generation', { primary: true, style: 'background: rgba(220,53,69,0.1); color: var(--lv-error-text,#bd2130); border-color: rgba(220,53,69,0.2);' })
          : button('Generate tracker', 'generate', { primary: true, disabled: Boolean(disabledReason), title: disabledReason }),
        button('Refresh', 'refresh'),
        '</div>',
        renderGenerationBanner(state, disabledReason),
        renderToast(status),
        '</div>',
      ].filter(Boolean).join(''),
      true,
    ),
    renderSettingsSection(
      'injection',
      'Context Injection',
      state.settings.promptInjectionEnabled ? tokenMeta : 'off',
      [
        '<div class="sotl-fields">',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="promptInjectionEnabled" ' + (state.settings.promptInjectionEnabled ? 'checked' : '') + '> Inject compact continuity into roleplay prompts</label>',
        '<label class="sotl-label">Injection mode',
        `<select class="sotl-select" data-sotl-field="promptInjectionMode">`,
        `  <option value="latest_plus_history"${state.settings.promptInjectionMode !== 'latest_brief' ? ' selected' : ''}>Latest tracker + recent summaries</option>`,
        `  <option value="latest_brief"${state.settings.promptInjectionMode === 'latest_brief' ? ' selected' : ''}>Latest tracker only</option>`,
        '</select>',
        '</label>',
        '<div class="sotl-mini-grid">',
        '<label class="sotl-label">Token budget',
        `<select class="sotl-select" data-sotl-field="promptInjectionTokenBudget">${renderInjectionBudgetOptions(state)}</select>`,
        '</label>',
        '<label class="sotl-label">Tracker context depth',
        `<select class="sotl-select" data-sotl-field="promptInjectionTrackerLimit">${renderInjectionLimitOptions(state)}</select>`,
        '</label>',
        '</div>',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="promptInjectionIncludeAppearance" ' + (state.settings.promptInjectionIncludeAppearance !== false ? 'checked' : '') + '> Include character appearance anchors</label>',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="promptInjectionIncludeRules" ' + (state.settings.promptInjectionIncludeRules !== false ? 'checked' : '') + '> Include continuity rules and warnings</label>',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="promptInjectionIncludeNextTurn" ' + (state.settings.promptInjectionIncludeNextTurn !== false ? 'checked' : '') + '> Include next-turn guidance</label>',
        '<p class="sotl-note">Best setup: latest detailed tracker plus a few compact summaries. This controls live RP context only; it does not delete stored tracker snapshots.</p>',
        renderInjectionReport(state),
        '</div>',
      ].join(''),
      Boolean(state.settings.promptInjectionEnabled),
    ),
    renderSettingsSection(
      'hud-display',
      'HUD & Display',
      `${state.settings.hudDefaultView} HUD`,
      [
        '<div class="sotl-fields">',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatHudLauncher" ' + (state.settings.showChatHudLauncher ? 'checked' : '') + '> Show paw HUD launcher</label>',
        '<label class="sotl-label">HUD default view',
        `<select class="sotl-select" data-sotl-field="hudDefaultView">`,
        `  <option value="compact"${state.settings.hudDefaultView === 'compact' ? ' selected' : ''}>Compact summary</option>`,
        `  <option value="full"${state.settings.hudDefaultView === 'full' ? ' selected' : ''}>Full tracker</option>`,
        `</select>`,
        '</label>',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="renderInMessages" ' + (state.settings.renderInMessages ? 'checked' : '') + '> Attach tracker cards to messages</label>',
        '<label class="sotl-label">New tracker card position',
        `<select class="sotl-select" data-sotl-field="messageCardPlacement">${renderPlacementOptions(state)}</select>`,
        '</label>',
        state.settings.renderInMessages
          ? '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="messageButtons" ' + (state.settings.showMessageButtons ? 'checked' : '') + '> Show message-card action buttons</label>'
          : '',
        '<p class="sotl-note">Message-card placement applies when trackers are created or regenerated.</p>',
        '</div>',
      ].join(''),
    ),
    renderSettingsSection(
      'templates-rendering',
      'Templates & Rendering',
      effectiveTemplateMode(state).replace('_', ' '),
      [
        '<div class="sotl-fields">',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="useSafeRenderer" ' + (state.settings.useSafeRenderer ? 'checked' : '') + '> Force safe generic renderer for custom presets</label>',
        '<label class="sotl-label">Custom template mode',
        `<select class="sotl-select" data-sotl-field="customTemplateMode" ${state.settings.useSafeRenderer ? 'disabled' : ''}>`,
        `  <option value="trusted_layout"${effectiveTemplateMode(state) === 'trusted_layout' ? ' selected' : ''}>Trusted layout (preserve custom HTML/CSS)</option>`,
        `  <option value="strict_sanitized"${effectiveTemplateMode(state) === 'strict_sanitized' ? ' selected' : ''}>Strict sanitized</option>`,
        `  <option value="safe_generic"${effectiveTemplateMode(state) === 'safe_generic' ? ' selected' : ''}>Safe generic renderer only</option>`,
        '</select>',
        '</label>',
        '<p class="sotl-note">Trusted layout keeps your custom styling but still removes executable hazards like scripts, event handlers, and javascript URLs.</p>',
        '</div>',
      ].join(''),
    ),
    renderSettingsSection(
      'storage-cleanup',
      'Storage & Cleanup',
      `${state.settings.trackerHistoryLimit === 0 ? 'unlimited' : `last ${state.settings.trackerHistoryLimit}`} full trackers`,
      [
        '<div class="sotl-fields">',
        '<label class="sotl-label">Full tracker retention',
        `<select class="sotl-select" data-sotl-field="trackerHistoryLimit">${renderHistoryLimitOptions(state)}</select>`,
        '</label>',
        '<p class="sotl-note">Controls how many complete tracker snapshots are stored and viewable per chat. This is separate from live prompt context.</p>',
        '<label class="sotl-label">Tracker generation history',
        `<select class="sotl-select" data-sotl-field="trackerGenerationHistoryLimit">${renderGenerationHistoryLimitOptions(state)}</select>`,
        '</label>',
        '<p class="sotl-note">Controls what the sidecar tracker generator sees: the latest previous tracker as full JSON plus older compact summaries. This does not delete stored trackers.</p>',
        '<div class="sotl-actions">',
        button('Reset Loom Storage', 'reset-storage', { title: 'Resets State of the Loom settings, presets, and trackers for this user.' }),
        '</div>',
        '</div>',
      ].join(''),
    ),
    renderSettingsSection(
      'advanced-diagnostics',
      'Advanced & Diagnostics',
      'power-user controls',
      [
        '<div class="sotl-fields">',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="stripBlocks" ' + (state.settings.stripTrackerBlocksFromMessages ? 'checked' : '') + '> Strip passive tracker blocks when allowed</label>',
        '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="floating" ' + (state.settings.showFloatingButton ? 'checked' : '') + '> Legacy desktop floating button</label>',
        '<label class="sotl-label">Legacy density setting',
        `<select class="sotl-select" data-sotl-field="cardDensity">${renderCardDensityOptions(state)}</select>`,
        '</label>',
        '<p class="sotl-note">Density is stored for compatibility; current cards use each preset renderer density.</p>',
        state.diagnostics.storageWarning ? `<p class="sotl-note sotl-warning">${escapeHtml(state.diagnostics.storageWarning)}</p>` : '',
        state.diagnostics.renderLimitation ? `<p class="sotl-note">${escapeHtml(state.diagnostics.renderLimitation)}</p>` : '',
        state.diagnostics.lastError ? `<p class="sotl-note">${escapeHtml(state.diagnostics.lastError)}</p>` : '',
        state.diagnostics.lastGenerationError ? `<p class="sotl-note">${escapeHtml(state.diagnostics.lastGenerationError)}</p>` : '',
        status.lastRenderStatus ? `<p class="sotl-note">${escapeHtml(status.lastRenderStatus)}</p>` : '',
        state.diagnostics.lastRenderStatus ? `<p class="sotl-note">${escapeHtml(state.diagnostics.lastRenderStatus)}</p>` : '',
        renderSettingsSection('pipeline-report', 'Tracker Pipeline Report', state.diagnostics.pipelineReport ? 'available' : 'empty', renderPipelineReport(state)),
        renderSettingsSection('swipe-report', 'Swipe Tracker Report', state.diagnostics.swipeReport ? `${state.diagnostics.swipeReport.storedSwipeTrackerCount} stored` : 'empty', renderSwipeReport(state)),
        renderSettingsSection('injection-report', 'Context Injection Report', report ? tokenMeta : 'empty', renderInjectionReport(state)),
        (() => {
          const doc = typeof document !== 'undefined' ? document : null;
          const isMounted = doc ? Boolean(doc.querySelector('[data-sotl-chat-panel="true"]')) : false;
          const visibleDrawer = doc ? Boolean(doc.querySelector('.lumiverse-drawer, .drawer, [data-drawer], #drawer, .sotl-drawer')) : false;
          const visibleSettings = doc ? Boolean(doc.querySelector('.lumiverse-settings, .settings-modal, [data-settings], #settings, .sotl-settings')) : false;
          let reason = 'Active';
          if (!state.settings.showChatHudLauncher) reason = 'Disabled by user settings';
          else if (visibleDrawer) reason = 'Soft-hidden: Loom Drawer is open';
          else if (visibleSettings) reason = 'Soft-hidden: Extension Settings are open';
          else if (!isMounted) reason = 'Not mounted (waiting for DOM render)';
          return [
            '<div class="sotl-diagnostic-grid">',
            `  <div><strong>HUD Launcher:</strong> ${state.settings.showChatHudLauncher ? 'Enabled' : 'Disabled'}</div>`,
            `  <div><strong>HUD DOM Status:</strong> ${isMounted ? 'Mounted' : 'Not mounted'}</div>`,
            `  <div><strong>HUD Placement State:</strong> ${escapeHtml(reason)}</div>`,
            `  <div><strong>Message Cards:</strong> ${state.settings.renderInMessages ? 'Enabled' : 'Disabled'}</div>`,
            '</div>',
          ].join('');
        })(),
        '</div>',
      ].filter(Boolean).join(''),
    ),
    '</section>',
  ].join('');
}

export function renderDrawer(state: LoomFrontendState | null, status: LoomUiStatus = {}): string {
  if (!state) {
    const offlineText = status.backendTimedOut
      ? 'Backend is not responding. Try Reset Loom Storage, then Refresh after the extension reloads.'
      : 'Frontend loaded. Waiting for backend state...';
    return [
      '<div class="sotl-root">',
      '<section class="sotl-panel">',
      '<h2>State of the Loom</h2>',
      `<p class="sotl-note">${escapeHtml(offlineText)}</p>`,
      status.lastFrontendError ? `<p class="sotl-note sotl-warning">${escapeHtml(status.lastFrontendError)}</p>` : '',
      '<div class="sotl-actions">',
      button('Refresh', 'refresh'),
      button('Reset Loom Storage', 'reset-storage', { title: 'Resets State of the Loom settings, presets, and trackers for this user.' }),
      '</div>',
      '</section>',
      renderFeatureBreakdown(true),
      '</div>',
    ].join('');
  }
  const disabledReason = state.generation.disabledReason || '';
  const selectedConnection = state.connections.find((connection) => connection.id === state.settings.sidecarConnectionId);
  return [
    '<div class="sotl-root" data-sotl-root="true">',
    renderControlsPanel(state, status, selectedConnection, disabledReason),
    renderFocusedTracker(state),
    '<section class="sotl-panel">',
    '<h3>Current Loom' + (state.diagnostics.lastRenderStatus?.includes('Stale') ? ' <span class="sotl-inline-warning">Stale: New messages sent</span>' : '') + '</h3>',
    renderLatestTracker(state),
    '</section>',
    '<section class="sotl-panel">',
    '<h3>Message Tracker List</h3>',
    renderMessageList(state),
    '</section>',
    renderFeatureBreakdown(true),
    '<section class="sotl-panel">',
    `<details class="sotl-details sotl-settings-section" data-sotl-section="template-editor"${detailOpenAttr('template-editor')}>`,
    '<summary><span class="sotl-summary-title">Custom Template Editor</span><span class="sotl-summary-meta">import, edit, preview</span></summary>',
    '<div class="sotl-section-pad">',
    renderPresetEditor(state),
    '</div>',
    '</details>',
    '</section>',
    '</div>',
  ].join('');

}
