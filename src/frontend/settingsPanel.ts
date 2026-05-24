import type { LoomFrontendState } from '../shared/types.js';
import { badge, button, escapeHtml, type LoomUiStatus } from './ui.js';

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
      ? 'Backend is not responding. Try Reset Loom Storage, then Refresh after the extension reloads.'
      : 'Frontend loaded. Waiting for backend state...';
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
      '</div>',
    ].join('');
  }
  return [
    '<div class="sotl-root sotl-settings" data-sotl-settings="true">',
    '<section class="sotl-panel">',
    '<h2>State of the Loom</h2>',
    `<p class="sotl-note">Active chat: ${escapeHtml(state.activeChat.name || state.activeChat.id || 'None')}</p>`,
    '<div class="sotl-status">',
    badge('Backend ready', state.backendReady),
    badge('Chats', state.permissions.chats),
    badge('Chat mutation', state.permissions.chat_mutation),
    badge('Generation', state.permissions.generation),
    '</div>',
    '<div class="sotl-actions">',
    button('Open Loom Drawer', 'open-drawer', { primary: true }),
    button('Reset Loom Storage', 'reset-storage', { title: 'Resets State of the Loom settings, presets, and trackers for this user.' }),
    '</div>',
    status.lastToast ? `<p class="sotl-note">${escapeHtml(status.lastToast.message)}</p>` : '',
    '</section>',
    '<section class="sotl-panel">',
    '<h3>Core configuration status</h3>',
    '<p class="sotl-note" style="margin-bottom: 12px;">All detailed settings, preset configurations, sidecar connections, and diagnostics are managed within the main Loom Drawer.</p>',
    '<div class="sotl-fields">',
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="enabled" ${state.settings.enabled ? 'checked' : ''}> Extension enabled</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatHudLauncher" ${state.settings.showChatHudLauncher ? 'checked' : ''}> Show chat HUD button</label>`,
    '</div>',
    '</section>',
    '</div>',
  ].join('');
}
