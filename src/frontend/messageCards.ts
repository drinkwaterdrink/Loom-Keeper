import { renderTrackerHtml } from '../shared/renderer.js';
import type { LoomFrontendState, LoomTrackerState } from '../shared/types.js';
import { iconButton } from './ui.js';

type FrontendContext = Record<string, unknown>;

export interface MessageCardMountStatus {
  status: string;
  messageId?: string | undefined;
}

const injectedWrappers = new Map<string, HTMLElement>();
let isChatLoomPanelExpanded = false;
let isDrawerOpen = false;
let isSettingsOpen = false;
let rerenderCallback: (() => void) | null = null;

function documentRef(): Document | null {
  return typeof document === 'undefined' ? null : document;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeSelector(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value);
  return value.replace(/["\\]/g, '\\$&');
}

export function registerRerenderCallback(cb: () => void): void {
  rerenderCallback = cb;
}

function triggerRerender(): void {
  if (rerenderCallback) {
    rerenderCallback();
  }
}

export function setDrawerOpenState(open: boolean): void {
  isDrawerOpen = open;
}

export function setSettingsOpenState(open: boolean): void {
  isSettingsOpen = open;
}

function findMessageHost(doc: Document, tracker: LoomTrackerState): Element | null {
  if (!tracker.messageId) return null;
  const id = escapeSelector(tracker.messageId);
  return doc.querySelector(`[data-message-id="${id}"]`)
    ?? doc.querySelector(`[data-lumiverse-message-id="${id}"]`)
    ?? doc.querySelector(`[data-lv-message-id="${id}"]`)
    ?? doc.querySelector(`[data-chat-message-id="${id}"]`)
    ?? doc.querySelector(`[data-message_id="${id}"]`)
    ?? doc.querySelector(`[data-messageid="${id}"]`)
    ?? doc.getElementById(`message-${tracker.messageId}`);
}

function renderTrackerHtmlCard(tracker: LoomTrackerState, state: LoomFrontendState): string {
  const controls = state.settings.showMessageButtons
    ? `<div class="sotl-message-controls">${iconButton('Regenerate', 'card-regenerate', tracker.messageId || '')}${iconButton('Edit', 'card-edit', tracker.messageId || '')}${iconButton('Hide', 'card-hide', tracker.messageId || '')}${iconButton('Delete', 'card-delete', tracker.messageId || '')}</div>`
    : '';
  return controls + renderTrackerHtml(tracker, state.activePreset);
}

export function cleanupMessageCards(ctx: FrontendContext): void {
  const domApi = ctx.dom && typeof ctx.dom === 'object' ? ctx.dom as Record<string, unknown> : null;
  const uninject = domApi && typeof domApi.uninject === 'function' ? domApi.uninject as (el: HTMLElement) => void : null;

  for (const wrapper of injectedWrappers.values()) {
    try {
      if (uninject) {
        uninject(wrapper);
      } else {
        wrapper.remove();
      }
    } catch {
      // Ignored
    }
  }
  injectedWrappers.clear();
}

export function mountMessageCards(ctx: FrontendContext, state: LoomFrontendState | null): MessageCardMountStatus {
  const doc = documentRef();
  if (!doc) return { status: 'Message-card renderer unavailable: no document.' };
  if (!state) return { status: 'Message-card renderer waiting for backend state.' };

  if (!state.settings.renderTrackersInMessages) {
    cleanupMessageCards(ctx);
    return { status: 'Message-card rendering is disabled in settings.' };
  }

  // Retrieve official Spindle context helper APIs
  const domApi = ctx.dom && typeof ctx.dom === 'object' ? ctx.dom as Record<string, unknown> : null;
  const inject = domApi && typeof domApi.inject === 'function' ? domApi.inject as (target: HTMLElement, html: string, pos?: string) => HTMLElement : null;
  const findMessageElement = domApi && typeof domApi.findMessageElement === 'function' ? domApi.findMessageElement as (id: string) => HTMLElement | null : null;

  // Clear existing injections safely before remounting
  cleanupMessageCards(ctx);

  const trackers = state.messageTrackers.length > 0 ? state.messageTrackers : state.latestTracker ? [state.latestTracker] : [];
  if (trackers.length === 0) return { status: 'No tracker available for message-card mounting.' };

  let mounted = 0;
  let lastMissing: string | undefined;
  let virtualizationActive = false;

  for (const tracker of trackers) {
    if (tracker.hidden || tracker.placement === 'hidden' || tracker.placement === 'drawer' || tracker.placement === 'disabled') {
      continue;
    }
    const messageId = tracker.messageId;
    if (!messageId) continue;

    const cardHtml = renderTrackerHtmlCard(tracker, state);
    if (!cardHtml) continue;

    let hostElement: HTMLElement | null = null;
    if (findMessageElement) {
      hostElement = findMessageElement(messageId);
      virtualizationActive = true;
    } else {
      hostElement = findMessageHost(doc, tracker) as HTMLElement | null;
    }

    if (!hostElement) {
      lastMissing = messageId;
      continue;
    }

    const pos = tracker.placement === 'bottom' ? 'beforeend' : 'afterbegin';

    if (inject) {
      try {
        const wrapper = inject(hostElement, cardHtml, pos);
        if (wrapper) {
          injectedWrappers.set(messageId, wrapper);
          mounted += 1;
        }
      } catch (err) {
        console.warn('DOM Helper inject failed', err);
      }
    } else {
      // Legacy DOM injection fallback
      const wrapper = doc.createElement('div');
      wrapper.className = 'sotl-message-card';
      wrapper.dataset.sotlMounted = 'true';
      wrapper.dataset.sotlMessageId = messageId;
      wrapper.innerHTML = cardHtml;
      if (tracker.placement === 'bottom') {
        hostElement.append(wrapper);
      } else {
        hostElement.prepend(wrapper);
      }
      injectedWrappers.set(messageId, wrapper);
      mounted += 1;
    }
  }

  const reports: string[] = [];
  if (mounted > 0) reports.push(`Mounted ${mounted} Loom tracker card${mounted === 1 ? '' : 's'}.`);
  if (virtualizationActive) reports.push(`Replay handled by virtualization registry.`);
  if (lastMissing) {
    reports.push(`Message host not currently mounted for messageId ${lastMissing}.`);
  }

  const fullStatus = reports.join(' ');
  return {
    status: fullStatus || 'No mounted tracker cards.',
    messageId: lastMissing,
  };
}

function renderCompactPanel(tracker: LoomTrackerState | null): string {
  if (!tracker) {
    return [
      '<div class="sotl-chat-panel">',
      '  <header class="sotl-chat-panel__head">',
      '    <span class="sotl-chat-panel__title">Loom HUD</span>',
      '    <button class="sotl-chat-panel__close" data-sotl-panel-action="collapse" title="Collapse panel">✕</button>',
      '  </header>',
      '  <div class="sotl-chat-panel__body">',
      '    <p class="sotl-chat-panel__desc">No tracker has been stored for this chat yet. Click Generate below to start tracking.</p>',
      '  </div>',
      '  <div class="sotl-chat-panel__actions">',
      '    <button class="sotl-button sotl-chat-panel__btn" data-sotl-panel-action="drawer">Open Drawer</button>',
      '    <button class="sotl-button sotl-chat-panel__btn" data-sotl-panel-action="generate" style="background: var(--lv-accent, #3864d9); color: var(--lv-on-accent, #fff); border-color: var(--lv-accent, #3864d9);">Generate</button>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  const castChips = Array.isArray(tracker.data.cast) && tracker.data.cast.length > 0
    ? `<div class="sotl-cast-grid" style="margin-top: 4px;">` +
      tracker.data.cast.slice(0, 3).map((c: any) => `<span class="sotl-chip" style="font-size: 11px; padding: 1px 6px;">${escapeHtml(c.name || 'Cast')}</span>`).join('') +
      (tracker.data.cast.length > 3 ? `<span class="sotl-chip" style="font-size: 11px; padding: 1px 6px;">+${tracker.data.cast.length - 3}</span>` : '') +
      `</div>`
    : '';

  return [
    '<div class="sotl-chat-panel">',
    '  <header class="sotl-chat-panel__head">',
    '    <span class="sotl-chat-panel__title">Loom HUD</span>',
    '    <button class="sotl-chat-panel__close" data-sotl-panel-action="collapse" title="Collapse panel">✕</button>',
    '  </header>',
    '  <div class="sotl-chat-panel__body">',
    `    <p class="sotl-chat-panel__scene">${escapeHtml(tracker.data.sceneTitle || 'Active Scene')}</p>`,
    `    <div class="sotl-chat-panel__meta">📍 ${escapeHtml(tracker.data.location || 'Unknown')} • 🕒 ${escapeHtml(tracker.data.time || 'Unknown')}</div>`,
    `    <p class="sotl-chat-panel__desc">${escapeHtml(tracker.data.delta || 'No deltas recorded.')}</p>`,
    castChips,
    '  </div>',
    '  <div class="sotl-chat-panel__actions">',
    '    <button class="sotl-button sotl-chat-panel__btn" data-sotl-panel-action="drawer">Open Drawer</button>',
    '    <button class="sotl-button sotl-chat-panel__btn" data-sotl-panel-action="generate" style="background: var(--lv-accent, #3864d9); color: var(--lv-on-accent, #fff); border-color: var(--lv-accent, #3864d9);">Generate</button>',
    '  </div>',
    '</div>'
  ].join('\n');
}

export function ensureChatLoomPanel(ctx: FrontendContext, state: LoomFrontendState | null): void {
  const doc = documentRef();
  if (!doc) return;

  // Clean up any existing panel first
  doc.querySelector('.sotl-chat-panel-container')?.remove();

  if (!state || !state.settings.showChatLoomPanel) return;

  // Auto-hide when either the full drawer HUD or settings modal are active
  if (isDrawerOpen || isSettingsOpen) return;

  const container = doc.createElement('div');
  container.className = 'sotl-chat-panel-container';
  container.dataset.sotlChatPanel = 'true';

  if (!isChatLoomPanelExpanded) {
    container.innerHTML = `<div class="sotl-chat-pill" data-sotl-panel-action="expand">Loom HUD</div>`;
  } else {
    container.innerHTML = renderCompactPanel(state.latestTracker);
  }

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const action = target.dataset.sotlPanelAction || target.closest('[data-sotl-panel-action]')?.getAttribute('data-sotl-panel-action');
    
    if (action === 'collapse') {
      isChatLoomPanelExpanded = false;
      triggerRerender();
    } else if (action === 'expand') {
      isChatLoomPanelExpanded = true;
      triggerRerender();
    } else if (action === 'drawer') {
      const ui = ctx.ui && typeof ctx.ui === 'object' ? ctx.ui as Record<string, unknown> : {};
      const openDrawer = ui.openDrawer ?? ui.showDrawer ?? ui.openPanel ?? ui.activateDrawer;
      if (typeof openDrawer === 'function') {
        (openDrawer as (id: string) => void)('state_of_the_loom');
      } else {
        // Fallback clicking
        const openBtn = doc.querySelector('[data-sotl-action="open-drawer"]') as HTMLElement | null;
        openBtn?.click();
      }
    } else if (action === 'generate') {
      if (typeof ctx.sendToBackend === 'function') {
        ctx.sendToBackend({ type: 'generate_tracker' });
      } else {
        const genBtn = doc.querySelector('[data-sotl-action="generate"]') as HTMLElement | null;
        genBtn?.click();
      }
    }
  });

  doc.body.append(container);
}

/**
 * Experimental: Floating compatibility button launcher.
 * Defaults to disabled (showFloatingButton: false in defaultSettings).
 * Avoids mobile viewport layouts and is kept as an experimental toggle.
 */
export function ensureFloatingButton(ctx: FrontendContext, state: LoomFrontendState | null): void {
  const doc = documentRef();
  if (!doc) return;
  doc.querySelector('[data-sotl-dynamic-float="true"]')?.remove();
  
  if (!state?.settings.showFloatingButton) return;
  if (isDrawerOpen || isSettingsOpen) return;
  if (typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(max-width: 720px)').matches) return;
  
  const button = doc.createElement('button');
  button.className = 'sotl-float';
  button.type = 'button';
  button.dataset.sotlDynamicFloat = 'true';
  button.title = 'State of the Loom (Experimental)';
  button.textContent = 'L';
  button.addEventListener('click', () => {
    const ui = ctx.ui && typeof ctx.ui === 'object' ? ctx.ui as Record<string, unknown> : {};
    const openDrawer = ui.openDrawer ?? ui.showDrawer ?? ui.openPanel;
    if (typeof openDrawer === 'function') {
      (openDrawer as (id: string) => void)('state_of_the_loom');
    }
  });
  doc.body.append(button);
}
