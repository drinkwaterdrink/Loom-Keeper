import { renderTrackerHtml } from '../shared/renderer.js';
import type { LoomFrontendState } from '../shared/types.js';
import { renderPresetEditor } from './presetEditor.js';
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
    let suffix = `[~${preset.maxInjectionTokens || 200}t - Custom]`;
    if (preset.id === 'micro_loom') suffix = '[~150t - Tiny]';
    else if (preset.id === 'slim_scene_loom') suffix = '[~350t - Slim]';
    else if (preset.id === 'balanced_story_loom') suffix = '[~400t - Balanced]';
    else if (preset.id === 'cast_continuity_loom') suffix = '[~400t - Detailed]';
    else if (preset.id === 'full_continuity_ledger') suffix = '[~450t - Full]';
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

function renderLatestTracker(state: LoomFrontendState): string {
  if (!state.latestTracker) {
    return '<p class="sotl-note">No tracker has been stored for this chat yet.</p>';
  }
  const html = renderTrackerHtml(state.latestTracker, state.activePreset, state.settings.useSafeRenderer);
  const attachmentStatus = state.settings.renderInMessages && state.latestTracker.messageId
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
    button('Copy JSON', 'copy-json', { title: 'Copy Loom JSON to clipboard' }),
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
    ? `<span style="color: ${errorColor}; font-weight: 600;">Yes (Check template safe tags)</span>` 
    : `<span style="color: ${successColor}; font-weight: 600;">No (Clean)</span>`;
  const fallbackVal = report.fallbackUsed 
    ? `<span style="color: #b58900; font-weight: 600;">Yes (Fallback active)</span>` 
    : `<span style="color: ${successColor}; font-weight: 600;">No (Template OK)</span>`;

  return `
    <div style="font-size: 11px; display: grid; gap: 4px; padding: 10px; background: rgba(0,0,0,0.06); border-radius: 6px; border: 1px solid var(--lumiverse-border, rgba(80,88,100,0.15)); margin-top: 8px; line-height: 1.4;">
      <div><strong>Active Preset ID:</strong> <code>${escapeHtml(report.activePresetId)}</code></div>
      <div><strong>Preset Name:</strong> ${escapeHtml(report.presetName)}</div>
      <div><strong>Preset Source:</strong> <code>${escapeHtml(report.presetSource)}</code></div>
      <div><strong>Timestamp:</strong> <code>${escapeHtml(report.timestamp)}</code></div>
      <div><strong>Raw Response Available:</strong> ${rawVal}</div>
      <div><strong>JSON Parse:</strong> ${parseVal}</div>
      <div><strong>Schema Validation:</strong> ${valVal}</div>
      <div><strong>HTML Render:</strong> ${renderVal}</div>
      <div><strong>Sanitizer Removed Content:</strong> ${sanitizerVal}</div>
      <div><strong>Fallback Card Used:</strong> ${fallbackVal}</div>
      <div><strong>Latest Tracker Message ID:</strong> <code>${escapeHtml(report.messageId)}</code></div>
      <div><strong>Chat ID:</strong> <code>${escapeHtml(report.chatId)}</code></div>
      <div><strong>HUD View Mode:</strong> <code>${escapeHtml(report.hudView)}</code></div>
      <div><strong>Retained Tracker Count:</strong> <code>${report.retainedCount}</code></div>
    </div>
  `;
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
    
    // Collapsible Active Preset Preview & Render (QoL #1)
    '<details class="sotl-details" style="margin-top: 4px; margin-bottom: 8px;"><summary>ℹ️ Active Template Preview & Sample Render</summary>',
    '<div style="margin-top: 8px;">',
    `  <p class="sotl-note" style="margin-bottom: 8px; color: var(--lv-accent, #3864d9); font-weight: 600;">Template: ${escapeHtml(state.activePreset.name)}</p>`,
    `  <p class="sotl-note" style="margin-bottom: 8px; font-style: italic;">${escapeHtml(state.activePreset.description || 'No description.')}</p>`,
    '  <div class="sotl-preview" style="border: 1px dashed var(--lumiverse-border, rgba(80,88,100,0.18)); border-radius: 6px; padding: 4px; max-height: 200px; background: rgba(0,0,0,0.05); overflow-y: auto;">',
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
        return renderTrackerHtml(mockTracker, state.activePreset, state.settings.useSafeRenderer);
      } catch (err) {
        return `<p class="sotl-note sotl-warning" style="color: var(--lv-error-text,#bd2130);">⚠️ Preview Render Failed: ${escapeHtml(err instanceof Error ? err.message : String(err))}</p>`;
      }
    })(),
    '  </div>',
    '</div>',
    '</details>',

    '<label class="sotl-label">Sidecar connection',
    `<select class="sotl-select" data-sotl-field="connection">${renderConnectionOptions(state)}</select>`,
    '</label>',
    `<p class="sotl-note">Connection: ${escapeHtml(selectedConnection?.name || (state.settings.useDefaultConnectionFallback ? 'default/current fallback' : 'none selected'))}</p>`,
    !state.permissions.generation ? '<p class="sotl-note">Generation permission is missing; passive fenced extraction is still available.</p>' : '',
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="autoGenerate" ' + (state.settings.autoGenerate ? 'checked' : '') + '> Auto-generate after assistant messages</label>',
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="showChatHudLauncher" ' + (state.settings.showChatHudLauncher ? 'checked' : '') + '> Show chat HUD button</label>',
    
    '<label class="sotl-label">HUD detail level',
    `<select class="sotl-select" data-sotl-field="hudDefaultView">`,
    `  <option value="compact"${state.settings.hudDefaultView === 'compact' ? ' selected' : ''}>Compact summary</option>`,
    `  <option value="full"${state.settings.hudDefaultView === 'full' ? ' selected' : ''}>Full tracker</option>`,
    `</select>`,
    '</label>',
 
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="renderInMessages" ' + (state.settings.renderInMessages ? 'checked' : '') + '> Attach tracker cards to messages (Experimental)</label>',
 
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="useSafeRenderer" ' + (state.settings.useSafeRenderer ? 'checked' : '') + '> Use safe generic renderer for custom presets</label>',
 
    '<label class="sotl-label">Message card position',
    `<select class="sotl-select" data-sotl-field="messageCardPlacement">${renderPlacementOptions(state)}</select>`,
    '</label>',
 
    '<label class="sotl-label">Card density',
    `<select class="sotl-select" data-sotl-field="cardDensity">${renderCardDensityOptions(state)}</select>`,
    '</label>',
 
    '<label class="sotl-toggle"><input type="checkbox" data-sotl-field="stripBlocks" ' + (state.settings.stripTrackerBlocksFromMessages ? 'checked' : '') + '> Strip passive tracker blocks when allowed</label>',

    // Configurable Generation Timeout Dropdown (Issue 7)
    '<label class="sotl-label">Generation timeout',
    (() => {
      const timeoutMs = state.settings.sidecarGenerationTimeoutMs ?? 180000;
      const options = [
        `<option value="60000"${timeoutMs === 60000 ? ' selected' : ''}>60 seconds</option>`,
        `<option value="120000"${timeoutMs === 120000 ? ' selected' : ''}>120 seconds</option>`,
        `<option value="180000"${timeoutMs === 180000 ? ' selected' : ''}>180 seconds (default)</option>`,
        `<option value="300000"${timeoutMs === 300000 ? ' selected' : ''}>300 seconds</option>`,
        `<option value="0"${timeoutMs === 0 ? ' selected' : ''}>No timeout (manual cancel only)</option>`,
      ];
      return `<select class="sotl-select" data-sotl-field="sidecarGenerationTimeoutMs">${options.join('')}</select>`;
    })(),
    '</label>',

    '<label class="sotl-label">Tracker history limit',
    (() => {
      const limit = state.settings.trackerHistoryLimit ?? 5;
      const options = [
        `<option value="1"${limit === 1 ? ' selected' : ''}>Last 1 tracker</option>`,
        `<option value="3"${limit === 3 ? ' selected' : ''}>Last 3 trackers</option>`,
        `<option value="5"${limit === 5 ? ' selected' : ''}>Last 5 trackers (default)</option>`,
        `<option value="10"${limit === 10 ? ' selected' : ''}>Last 10 trackers</option>`,
        `<option value="20"${limit === 20 ? ' selected' : ''}>Last 20 trackers</option>`,
        `<option value="0"${limit === 0 ? ' selected' : ''}>Unlimited (keep all)</option>`,
      ];
      return `<select class="sotl-select" data-sotl-field="trackerHistoryLimit">${options.join('')}</select>`;
    })(),
    `<p class="sotl-note">Controls how many tracker snapshots are kept per chat. Generation context always uses a safe compact subset. Latest tracker is always preserved.</p>`,
    '</label>',
    '</div>',
    '<div class="sotl-actions">',
    button('Generate tracker', 'generate', { primary: true, disabled: Boolean(disabledReason) && !state.generation.running, title: disabledReason }),
    state.generation.running ? button('Cancel Generation', 'cancel-generation', { primary: false, style: 'background: rgba(220,53,69,0.1); color: var(--lv-error-text,#bd2130); border-color: rgba(220,53,69,0.2);' }) : '',
    button('Refresh', 'refresh'),
    button('Reset Loom Storage', 'reset-storage', { title: 'Resets State of the Loom settings, presets, and trackers for this user.' }),
    '</div>',

    // Refined Generate Status Banner (Issue 7 & QoL #3)
    (() => {
      if (state.generation.running) {
        return `<div style="margin-top: 10px; padding: 8px 12px; border-radius: 6px; border-left: 4px solid var(--lv-accent, #3864d9); background: rgba(56, 100, 217, 0.08); display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--lv-accent, #3864d9);">
          <span class="sotl-spin" style="display: inline-block;">⏳</span>
          <div style="flex: 1;">${escapeHtml(state.generation.message || 'Generating tracker...')}</div>
        </div>`;
      }
      if (disabledReason) {
        return `<div style="margin-top: 10px; padding: 8px 12px; border-radius: 6px; border-left: 4px solid var(--lv-warning-border, #b06800); background: rgba(255, 193, 7, 0.08); display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--lv-warning-text, #8a4f00);">
          <span>🚫</span>
          <div style="flex: 1;">Blocked: ${escapeHtml(disabledReason)}</div>
        </div>`;
      }
      return `<div style="margin-top: 10px; padding: 8px 12px; border-radius: 6px; border-left: 4px solid var(--lv-success-border, #176b43); background: rgba(27, 126, 80, 0.08); display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--lv-success-text, #176b43);">
        <span>🟢</span>
        <div style="flex: 1;">Ready to track the latest assistant message.</div>
      </div>`;
    })(),

    // Refined premium banner toasts (QoL #3)
    status.lastToast 
      ? `<div style="margin-top: 10px; padding: 8px 12px; border-radius: 6px; border-left: 4px solid ${
          status.lastToast.level === 'success' ? '#176b43' : status.lastToast.level === 'error' ? '#bd2130' : '#b06800'
        }; background: ${
          status.lastToast.level === 'success' ? 'rgba(27,126,80,0.07)' : status.lastToast.level === 'error' ? 'rgba(220,53,69,0.08)' : 'rgba(255,193,7,0.08)'
        }; display: flex; align-items: center; gap: 8px; font-size: 12px;">
          <span>${status.lastToast.level === 'success' ? '✅' : status.lastToast.level === 'error' ? '❌' : '⚠️'}</span>
          <div style="flex: 1; line-height: 1.4; color: ${
            status.lastToast.level === 'success' ? 'var(--lv-success-text,#176b43)' : status.lastToast.level === 'error' ? 'var(--lv-error-text,#bd2130)' : 'var(--lv-warning-text,#8a4f00)'
          }; font-weight: 500;">${escapeHtml(status.lastToast.message)}</div>
        </div>`
      : '',
    '</section>',
    '<section class="sotl-panel">',
    '<h3>Current Loom' + (state.diagnostics.lastRenderStatus?.includes('Stale') ? ' <span style="display: inline-block; background: rgba(255, 193, 7, 0.12); border: 1px solid #ffc107; color: #b58900; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; margin-left: 8px; vertical-align: middle;">⚠️ Stale: New messages sent</span>' : '') + '</h3>',
    renderLatestTracker(state),
    '</section>',
    '<section class="sotl-panel">',
    '<h3>Message Tracker List</h3>',
    renderMessageList(state),
    '</section>',
    renderFeatureBreakdown(true),
    '<section class="sotl-panel">',
    '<details class="sotl-details"><summary>Custom Template Editor</summary>',
    '<div style="margin-top: 10px;">',
    renderPresetEditor(state),
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
    '<details class="sotl-details" open style="margin-top: 8px;"><summary>🔍 Tracker Pipeline Report</summary>',
    renderPipelineReport(state),
    '</details>',
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
        '<div style="font-size: 11px; margin-top: 8px; border-top: 1px solid var(--lumiverse-border, rgba(80,88,100,0.15)); padding-top: 8px; display: grid; gap: 4px; color: var(--lumiverse-text-muted, var(--lv-text-muted, #64707d));">',
        `  <div><strong>HUD Launcher:</strong> ${state.settings.showChatHudLauncher ? '<span style="color: var(--lv-success-text, #176b43); font-weight: 600;">Enabled</span>' : 'Disabled'}</div>`,
        `  <div><strong>HUD DOM Status:</strong> ${isMounted ? '<span style="color: var(--lv-success-text, #176b43); font-weight: 600;">Mounted</span>' : 'Not Mounted'}</div>`,
        `  <div><strong>HUD Placement State:</strong> <em>${escapeHtml(reason)}</em></div>`,
        `  <div><strong>Message Cards:</strong> ${state.settings.renderInMessages ? '<span style="color: var(--lv-accent, #3864d9); font-weight: 600;">Enabled (Experimental)</span>' : 'Disabled'}</div>`,
        '</div>'
      ].join('');
    })(),
    '</section>',
    '</div>',
  ].join('');
}
