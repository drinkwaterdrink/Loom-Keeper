import { renderTrackerHtml } from '../shared/renderer.js';
import type { LoomFrontendState } from '../shared/types.js';
import { renderPresetDetails } from './presetEditor.js';
import { renderFeatureBreakdown } from './settingsPanel.js';
import { badge, button, escapeHtml, type LoomUiStatus } from './ui.js';

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

function renderPresetOptions(state: LoomFrontendState): string {
  return state.presets.map((preset) => {
    const selected = preset.id === state.settings.activePresetId ? ' selected' : '';
    return `<option value="${escapeHtml(preset.id)}"${selected}>${escapeHtml(preset.name)}</option>`;
  }).join('');
}

function renderTrackerPlacementOptions(state: LoomFrontendState): string {
  return ['drawer', 'chat_panel', 'message_card', 'both'].map((placement) => {
    let label = placement;
    if (placement === 'drawer') label = 'Drawer only';
    if (placement === 'chat_panel') label = 'Floating HUD only';
    if (placement === 'message_card') label = 'Attach to messages';
    if (placement === 'both') label = 'Floating HUD + message cards';
    const selected = state.settings.trackerPlacement === placement ? ' selected' : '';
    return `<option value="${placement}"${selected}>${label}</option>`;
  }).join('');
}

function renderPlacementOptions(state: LoomFrontendState): string {
  return ['top', 'bottom', 'drawer', 'hidden', 'disabled'].map((placement) => {
    let label = placement;
    if (placement === 'top') label = 'Top of message';
    if (placement === 'bottom') label = 'Bottom of message';
    if (placement === 'drawer') label = 'Drawer only';
    if (placement === 'hidden') label = 'Hidden';
    if (placement === 'disabled') label = 'Disabled';
    const selected = state.settings.defaultPlacement === placement ? ' selected' : '';
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

function renderLatestTracker(state: LoomFrontendState): string {
  if (!state.latestTracker) {
    return '<p class="sotl-note">No tracker has been stored for this chat yet.</p>';
  }
  const html = renderTrackerHtml(state.latestTracker, state.activePreset);
  const attachmentStatus = state.settings.renderTrackersInMessages && state.latestTracker.messageId
    ? `<p class="sotl-note" style="color: var(--lv-success-text, #176b43); font-weight: 600; margin-top: 8px;">🔗 Attached to message card (${escapeHtml(state.latestTracker.messageId)})</p>`
    : '<p class="sotl-note" style="margin-top: 8px;">Status: Not attached to a message card.</p>';

  return [
    `<p class="sotl-note">${escapeHtml(state.latestTracker.compactSummary)}</p>`,
    `<div class="sotl-preview">${html}</div>`,
    attachmentStatus,
    '<details class="sotl-details"><summary>Manual JSON edit</summary>',
    '<div class="sotl-fields" style="margin-top: 10px;">',
    `<textarea class="sotl-textarea" data-sotl-field="latestJson">${escapeHtml(JSON.stringify(state.latestTracker.data, null, 2))}</textarea>`,
    '<div class="sotl-actions">',
    button('Save JSON', 'save-json'),
    '</div>',
    '</div>',
    '</details>',
  ].join('');
}

function renderMessageList(state: LoomFrontendState): string {
  if (state.messageTrackers.length === 0) return '<p class="sotl-note">No per-message trackers yet.</p>';
  return state.messageTrackers.map((tracker) => {
    const id = tracker.messageId || 'latest';
    return [
      '<div class="sotl-panel">',
      `<h3>${escapeHtml(tracker.compactSummary || id)}</h3>`,
      `<p class="sotl-note">${escapeHtml(tracker.source)} - ${escapeHtml(tracker.generatedAt)}</p>`,
      '<div class="sotl-actions">',
      button('Regenerate', `regenerate:${id}`),
      button(tracker.hidden ? 'Show' : 'Hide', `hide:${id}`),
      button('Delete', `delete:${id}`),
      '</div>',
      '</div>',
    ].join('');
  }).join('');
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
    '<section class="sotl-panel">',
    '<h2>State of the Loom</h2>',
    `<p class="sotl-note">Active chat: ${escapeHtml(state.activeChat.name || state.activeChat.id || 'Unavailable')}</p>`,
    '<div class="sotl-status">',
    badge('Backend ready', state.backendReady),
    badge('Chats', state.permissions.chats),
    badge('Chat mutation', state.permissions.chat_mutation),
    badge('Generation', state.permissions.generation),
    badge('Settings UI', Boolean(state.permissions.app_manipulation)),
    '</div>',
    '</section>',
    '<section class="sotl-panel">',
    '<h3>Controls</h3>',
    '<div class="sotl-fields">',
    '<label class="sotl-label">Preset',
    `<select class="sotl-select" data-sotl-field="preset">${renderPresetOptions(state)}</select>`,
    '</label>',
    '<label class="sotl-label">Sidecar connection',
    `<select class="sotl-select" data-sotl-field="connection">${renderConnectionOptions(state)}</select>`,
    '</label>',
    `<p class="sotl-note">Connection: ${escapeHtml(selectedConnection?.name || (state.settings.useDefaultConnectionFallback ? 'default/current fallback' : 'none selected'))}</p>`,
    !state.permissions.generation ? '<p class="sotl-note">Generation permission is missing; passive fenced extraction is still available.</p>' : '',
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="autoGenerate" ' + (state.settings.autoGenerate ? 'checked' : '') + '> Auto-generate after assistant messages</label>',
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatLoomPanel" ' + (state.settings.showChatLoomPanel ? 'checked' : '') + '> Show chat-screen Loom panel</label>',
    
    '<label class="sotl-label">HUD detail level',
    `<select class="sotl-select" data-sotl-field="trackerHudView">`,
    `  <option value="compact"${state.settings.trackerHudView === 'compact' ? ' selected' : ''}>Compact summary</option>`,
    `  <option value="full"${state.settings.trackerHudView === 'full' ? ' selected' : ''}>Full tracker</option>`,
    `</select>`,
    '</label>',

    '<label class="sotl-label">Where to show tracker',
    `<select class="sotl-select" data-sotl-field="trackerPlacement">${renderTrackerPlacementOptions(state)}</select>`,
    '</label>',

    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="renderTrackersInMessages" ' + (state.settings.renderTrackersInMessages ? 'checked' : '') + '> Render trackers inside chat messages (Experimental)</label>',

    '<label class="sotl-label">Message card placement',
    `<select class="sotl-select" data-sotl-field="placement">${renderPlacementOptions(state)}</select>`,
    '</label>',

    '<label class="sotl-label">Card density',
    `<select class="sotl-select" data-sotl-field="cardDensity">${renderCardDensityOptions(state)}</select>`,
    '</label>',

    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="stripBlocks" ' + (state.settings.stripTrackerBlocksFromMessages ? 'checked' : '') + '> Strip passive tracker blocks when allowed</label>',
    '</div>',
    '<div class="sotl-actions">',
    button('Generate tracker', 'generate', { primary: true, disabled: Boolean(disabledReason), title: disabledReason }),
    button('Refresh', 'refresh'),
    button('Reset Loom Storage', 'reset-storage', { title: 'Resets State of the Loom settings, presets, and trackers for this user.' }),
    '</div>',
    disabledReason ? `<p class="sotl-note">${escapeHtml(disabledReason)}</p>` : '<p class="sotl-note">Ready to track the latest assistant message.</p>',
    status.lastToast ? `<p class="sotl-note">${escapeHtml(status.lastToast.message)}</p>` : '',
    '</section>',
    '<section class="sotl-panel">',
    '<h3>Current Loom</h3>',
    renderLatestTracker(state),
    '</section>',
    '<section class="sotl-panel">',
    '<h3>Message Tracker List</h3>',
    renderMessageList(state),
    '</section>',
    renderFeatureBreakdown(true),
    '<section class="sotl-panel">',
    '<details class="sotl-details"><summary>Preset Details</summary>',
    '<div style="margin-top: 10px;">',
    renderPresetDetails(state.activePreset),
    '</div>',
    '</details>',
    '</section>',
    '<section class="sotl-panel">',
    '<h3>Diagnostics</h3>',
    state.diagnostics.storageWarning ? `<p class="sotl-note sotl-warning">${escapeHtml(state.diagnostics.storageWarning)}</p>` : '',
    `<p class="sotl-note">${escapeHtml(state.diagnostics.renderLimitation || '')}</p>`,
    state.diagnostics.lastError ? `<p class="sotl-note">${escapeHtml(state.diagnostics.lastError)}</p>` : '',
    state.diagnostics.lastGenerationError ? `<p class="sotl-note">${escapeHtml(state.diagnostics.lastGenerationError)}</p>` : '',
    status.lastRenderStatus ? `<p class="sotl-note">${escapeHtml(status.lastRenderStatus)}</p>` : '',
    state.diagnostics.lastRenderStatus ? `<p class="sotl-note">${escapeHtml(state.diagnostics.lastRenderStatus)}</p>` : '',
    '</section>',
    '</div>',
  ].join('');
}
