import type { LoomFrontendState } from '../shared/types.js';
import { badge, button, escapeHtml, type LoomUiStatus } from './ui.js';

export function renderFeatureBreakdown(collapsible = false): string {
  const content = [
    '<div class="sotl-feature-grid">',
    '<article><strong>Drawer HUD</strong><span>Shows status, current tracker, controls, diagnostics, and preset details.</span></article>',
    '<article><strong>Settings panel</strong><span>Works from the extension list and exposes the core toggles.</span></article>',
    '<article><strong>Grand Continuity Atlas</strong><span>New default tracker with rich scene, appearance, relationship, world-state, and next-turn continuity sections.</span></article>',
    '<article><strong>Passive extraction</strong><span>Reads fenced <code>tracker</code> and <code>loom</code> JSON blocks from assistant replies.</span></article>',
    '<article><strong>Generate tracker</strong><span>Uses a sidecar connection or default fallback to make tracker JSON for the latest assistant message.</span></article>',
    '<article><strong>Context Injection Lite</strong><span>Compresses the latest tracker into a configurable continuity brief for live roleplay prompts.</span></article>',
    '<article><strong>Per-chat storage</strong><span>Saves latest and per-message tracker state through user storage.</span></article>',
    '<article><strong>Message cards</strong><span>Best-effort top or bottom card mounting when Lumiverse exposes message host ids.</span></article>',
    '<article><strong>Manual JSON edit</strong><span>Lets you correct the current tracker without regenerating.</span></article>',
    '<article><strong>Runtime recovery</strong><span>Repairs corrupt Loom storage and exposes Reset Loom Storage when the backend is slow or offline.</span></article>',
    '</div>',
    '<p class="sotl-note">Not in this milestone: simulation clocks, entity inbox, companion autonomy, Council tools, and arbitrary template JavaScript.</p>',
  ].join('');

  if (collapsible) {
    return [
      '<section class="sotl-panel">',
      '<details class="sotl-details" data-sotl-section="features"><summary>What this version does (Features)</summary>',
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
    badge('Prompt injection', Boolean(state.permissions.interceptor || state.diagnostics.injectionReport?.registered)),
    '</div>',
    '<div class="sotl-actions">',
    button('Open Loom Drawer', 'open-drawer', { primary: true }),
    button('Reset Loom Storage', 'reset-storage', { title: 'Resets State of the Loom settings, presets, and trackers for this user.' }),
    '</div>',
    status.lastToast 
      ? `<div style="margin-top: 10px; padding: 8px 12px; border-radius: 6px; border-left: 4px solid ${
          status.lastToast.level === 'success' ? '#176b43' : status.lastToast.level === 'error' ? '#bd2130' : '#b06800'
        }; background: ${
          status.lastToast.level === 'success' ? 'rgba(27,126,80,0.07)' : status.lastToast.level === 'error' ? 'rgba(220,53,69,0.08)' : 'rgba(255,193,7,0.08)'
        }; display: flex; align-items: center; gap: 8px; font-size: 12px;">
          <strong>${escapeHtml(status.lastToast.level)}</strong>
          <div style="flex: 1; line-height: 1.4; color: ${
            status.lastToast.level === 'success' ? 'var(--lv-success-text,#176b43)' : status.lastToast.level === 'error' ? 'var(--lv-error-text,#bd2130)' : 'var(--lv-warning-text,#8a4f00)'
          }; font-weight: 500;">${escapeHtml(status.lastToast.message)}</div>
        </div>`
      : '',
    '</section>',
    '<section class="sotl-panel">',
    '<h3>Core configuration status</h3>',
    '<p class="sotl-note" style="margin-bottom: 12px;">All detailed settings, preset configurations, sidecar connections, and diagnostics are managed within the main Loom Drawer.</p>',
    '<div class="sotl-fields">',
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="enabled" ${state.settings.enabled ? 'checked' : ''}> Extension enabled</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatHudLauncher" ${state.settings.showChatHudLauncher ? 'checked' : ''}> Show chat HUD button</label>`,
    `<label class="sotl-toggle"><input type="checkbox" data-sotl-field="promptInjectionEnabled" ${state.settings.promptInjectionEnabled ? 'checked' : ''}> Inject compact continuity brief</label>`,
    state.diagnostics.injectionReport ? `<p class="sotl-note">Injection estimate: ~${state.diagnostics.injectionReport.estimatedTokens} / ${state.diagnostics.injectionReport.tokenBudget} tokens.</p>` : '',
    '</div>',
    '</section>',
    '</div>',
  ].join('');
}
