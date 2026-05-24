import type { LoomFrontendState } from '../shared/types.js';
import { badge, button, escapeHtml, type LoomUiStatus } from './ui.js';

function renderPlacementOptions(state: LoomFrontendState): string {
  return ['top', 'bottom', 'drawer', 'hidden', 'disabled'].map((placement) => {
    const selected = state.settings.defaultPlacement === placement ? ' selected' : '';
    return `<option value="${placement}"${selected}>${placement}</option>`;
  }).join('');
}

function renderConnectionOptions(state: LoomFrontendState): string {
  const selected = state.settings.sidecarConnectionId || '';
  const options = [
    `<option value=""${selected ? '' : ' selected'}>Default/current connection</option>`,
    ...state.connections.map((connection) => {
      const label = [connection.name, connection.model ? `(${connection.model})` : ''].filter(Boolean).join(' ');
      return `<option value="${escapeHtml(connection.id)}"${selected === connection.id ? ' selected' : ''}>${escapeHtml(label)}</option>`;
    }),
  ];
  return options.join('');
}

function renderTrackerPlacementOptions(state: LoomFrontendState): string {
  return ['drawer', 'chat_panel', 'message_card', 'both'].map((placement) => {
    const selected = state.settings.trackerPlacement === placement ? ' selected' : '';
    return `<option value="${placement}"${selected}>${placement}</option>`;
  }).join('');
}

function renderCardDensityOptions(state: LoomFrontendState): string {
  return ['compact', 'normal'].map((density) => {
    const selected = state.settings.cardDensity === density ? ' selected' : '';
    return `<option value="${density}"${selected}>${density}</option>`;
  }).join('');
}

export function renderFeatureBreakdown(collapsible = false): string {
  const content = [
    '<div class="sotl-feature-grid">',
    '<article><strong>Drawer HUD</strong><span>Shows status, current tracker, controls, diagnostics, and preset details.</span></article>',
    '<article><strong>Settings panel</strong><span>Works from the extension list and exposes the core toggles.</span></article>',
    '<article><strong>Slim Scene Loom</strong><span>Tracks scene title, location, time, mood, cast, inventory, anchors, and avoid-next notes.</span></article>',
    '<article><strong>Passive extraction</strong><span>Reads fenced <code>tracker</code> and <code>loom</code> JSON blocks from assistant replies.</span></article>',
    '<article><strong>Generate tracker</strong><span>Uses a sidecar connection or default fallback to make tracker JSON for the latest assistant message.</span></article>',
    '<article><strong>Per-chat storage</strong><span>Saves latest and per-message tracker state through user storage.</span></article>',
    '<article><strong>Message cards</strong><span>Best-effort top or bottom card mounting when Lumiverse exposes message host ids.</span></article>',
    '<article><strong>Manual JSON edit</strong><span>Lets you correct the current tracker without regenerating.</span></article>',
    '<article><strong>Runtime recovery</strong><span>Repairs corrupt Loom storage and exposes Reset Loom Storage when the backend is slow or offline.</span></article>',
    '</div>',
    '<p class="sotl-note">Not in this milestone: prompt injection, simulation clocks, entity inbox, companion autonomy, Council tools, and the large Universal Loom Ledger preset.</p>',
  ].join('');

  if (collapsible) {
    return [
      '<section class="sotl-panel">',
      '<details class="sotl-details"><summary>What this version does (Features)</summary>',
      content,
      '</details>',
      '</section>',
    ].join('');
  }

  return [
    '<section class="sotl-panel">',
    '<h3>What this version does</h3>',
    content,
    '</section>',
  ].join('');
}

export function renderSettingsPanel(state: LoomFrontendState | null, status: LoomUiStatus = {}): string {
  if (!state) {
    const offlineText = status.backendTimedOut
      ? 'Backend is not responding. The runtime may still be crashed; use Reset Loom Storage, then Refresh after the extension reloads.'
      : 'Frontend loaded. Waiting for the backend state packet...';
    return [
      '<div class="sotl-root sotl-settings" data-sotl-settings="true">',
      '<section class="sotl-panel">',
      '<h2>State of the Loom</h2>',
      `<p class="sotl-note">${escapeHtml(offlineText)}</p>`,
      status.lastFrontendError ? `<p class="sotl-note sotl-warning">${escapeHtml(status.lastFrontendError)}</p>` : '',
      '<div class="sotl-actions">',
      button('Refresh', 'refresh'),
      button('Open Loom Drawer', 'open-drawer'),
      button('Reset Loom Storage', 'reset-storage', { title: 'Resets State of the Loom settings, presets, and trackers for this user.' }),
      '</div>',
      '</section>',
      renderFeatureBreakdown(),
      '</div>',
    ].join('');
  }
  const disabledReason = state.generation.disabledReason || '';
  return [
    '<div class="sotl-root sotl-settings" data-sotl-settings="true">',
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
    '<div class="sotl-actions">',
    button('Open Loom Drawer', 'open-drawer', { primary: true }),
    button('Generate tracker', 'generate', { disabled: Boolean(disabledReason), title: disabledReason }),
    button('Refresh', 'refresh'),
    button('Reset Loom Storage', 'reset-storage', { title: 'Resets State of the Loom settings, presets, and trackers for this user.' }),
    '</div>',
    disabledReason ? `<p class="sotl-note">${escapeHtml(disabledReason)}</p>` : '<p class="sotl-note">Ready. Use Generate after an assistant reply, or open the drawer for the full HUD.</p>',
    status.lastToast ? `<p class="sotl-note">${escapeHtml(status.lastToast.message)}</p>` : '',
    '</section>',
    '<section class="sotl-panel">',
    '<h3>Core settings</h3>',
    '<div class="sotl-fields">',
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="enabled" ${state.settings.enabled ? 'checked' : ''}> Extension enabled</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="autoGenerate" ${state.settings.autoGenerate ? 'checked' : ''}> Auto-generate after assistant messages</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="fallback" ${state.settings.useDefaultConnectionFallback ? 'checked' : ''}> Use default/current connection fallback</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="floating" ${state.settings.showFloatingButton ? 'checked' : ''}> Show desktop floating launcher</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatLoomPanel" ${state.settings.showChatLoomPanel ? 'checked' : ''}> Show chat-screen Loom panel</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="renderTrackersInMessages" ${state.settings.renderTrackersInMessages ? 'checked' : ''}> Render trackers inside chat messages</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="messageButtons" ${state.settings.showMessageButtons ? 'checked' : ''}> Show message card buttons</label>`,
    '<label class="sotl-label">Sidecar connection',
    `<select class="sotl-select" data-sotl-field="connection">${renderConnectionOptions(state)}</select>`,
    '</label>',
    '<label class="sotl-label">Default placement',
    `<select class="sotl-select" data-sotl-field="placement">${renderPlacementOptions(state)}</select>`,
    '</label>',
    '<label class="sotl-label">Tracker display scope',
    `<select class="sotl-select" data-sotl-field="trackerPlacement">${renderTrackerPlacementOptions(state)}</select>`,
    '</label>',
    '<label class="sotl-label">Card density',
    `<select class="sotl-select" data-sotl-field="cardDensity">${renderCardDensityOptions(state)}</select>`,
    '</label>',
    '</div>',
    '</section>',
    renderFeatureBreakdown(),
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
