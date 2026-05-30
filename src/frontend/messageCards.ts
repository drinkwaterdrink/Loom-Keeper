import type { LoomFrontendState, LoomTrackerState } from '../shared/types.js';
import { getFallbackField } from '../shared/renderer.js';
import { renderCompactTrackerForState, renderTrackerForState } from './rendering.js';
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
let openDrawerCallback: (() => void) | null = null;

export function registerOpenDrawerCallback(cb: () => void): void {
  openDrawerCallback = cb;
}

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
  const id = tracker.messageId || '';
  const meta = { swipeId: tracker.swipeId };
  const controls = state.settings.showMessageButtons
    ? `<div class="sotl-message-controls">${iconButton('Regenerate', 'card-regenerate', id, meta)}${iconButton('Edit', 'card-edit', id, meta)}${iconButton('Hide', 'card-hide', id, meta)}${iconButton('Delete', 'card-delete', id, meta)}</div>`
    : '';
  return controls + renderTrackerForState(tracker, state).html;
}

function isActiveSwipeTracker(tracker: LoomTrackerState, state: LoomFrontendState): boolean {
  if (!tracker.messageId) return true;
  const activeSwipe = state.activeSwipeByMessageId[tracker.messageId];
  if (typeof activeSwipe !== 'number') return true;
  return tracker.swipeId === activeSwipe;
}

function trackerMountKey(tracker: LoomTrackerState): string {
  return `${tracker.messageId || 'latest'}::swipe:${typeof tracker.swipeId === 'number' ? tracker.swipeId : 'main'}`;
}

function selectVisibleMessageTrackers(trackers: LoomTrackerState[], state: LoomFrontendState): LoomTrackerState[] {
  const grouped = new Map<string, LoomTrackerState[]>();
  for (const tracker of trackers) {
    const id = tracker.messageId || 'latest';
    const list = grouped.get(id) ?? [];
    list.push(tracker);
    grouped.set(id, list);
  }
  const selected: LoomTrackerState[] = [];
  for (const [id, list] of grouped) {
    const activeSwipe = state.activeSwipeByMessageId[id];
    const active = typeof activeSwipe === 'number'
      ? list.find((tracker) => tracker.swipeId === activeSwipe)
      : undefined;
    if (typeof activeSwipe === 'number' && !active && list.some((tracker) => typeof tracker.swipeId === 'number')) {
      continue;
    }
    const newest = list.slice().sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0];
    const chosen = active ?? newest;
    if (chosen) selected.push(chosen);
  }
  return selected;
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

  const showCards = state.settings.renderInMessages;
  if (!showCards) {
    cleanupMessageCards(ctx);
    return { status: 'Message-card rendering is disabled in settings.' };
  }

  // Retrieve official Spindle context helper APIs
  const domApi = ctx.dom && typeof ctx.dom === 'object' ? ctx.dom as Record<string, unknown> : null;
  const inject = domApi && typeof domApi.inject === 'function' ? domApi.inject as (target: HTMLElement, html: string, pos?: string) => HTMLElement : null;
  const findMessageElement = domApi && typeof domApi.findMessageElement === 'function' ? domApi.findMessageElement as (id: string) => HTMLElement | null : null;

  // Clear existing injections safely before remounting
  cleanupMessageCards(ctx);

  const trackers = selectVisibleMessageTrackers(
    state.messageTrackers.length > 0 ? state.messageTrackers : state.latestTracker ? [state.latestTracker] : [],
    state,
  ).filter((tracker) => isActiveSwipeTracker(tracker, state));
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
          injectedWrappers.set(trackerMountKey(tracker), wrapper);
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
      if (typeof tracker.swipeId === 'number') wrapper.dataset.sotlSwipeId = String(tracker.swipeId);
      wrapper.innerHTML = cardHtml;
      if (tracker.placement === 'bottom') {
        hostElement.append(wrapper);
      } else {
        hostElement.prepend(wrapper);
      }
      injectedWrappers.set(trackerMountKey(tracker), wrapper);
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

function renderCompactPanel(tracker: LoomTrackerState | null, state: LoomFrontendState): string {
  const isGenerating = state.generation.running;
  const isCompact = state.settings.hudDefaultView === 'compact';

  // Top header icons next to Close button
  const drawerIcon = `
    <button class="sotl-chat-panel__action-btn" data-sotl-panel-action="drawer" title="Open Loom Drawer" aria-label="Open Loom Drawer">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
      </svg>
    </button>
  `;

  const generateIcon = `
    <button class="sotl-chat-panel__action-btn" data-sotl-panel-action="generate" ${isGenerating || state.generation.disabledReason ? 'disabled' : ''} title="${escapeHtml(state.generation.disabledReason || 'Generate Tracker State')}" aria-label="Generate Tracker State">
      <svg class="${isGenerating ? 'sotl-spin' : ''}" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
        <path d="M23 4v6h-6"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
    </button>
  `;

  const toggleIcon = `
    <button class="sotl-chat-panel__action-btn" data-sotl-panel-action="toggle-hud-view" title="${isCompact ? 'Show Full Tracker View' : 'Show Compact Summary View'}" aria-label="Toggle HUD Detail Level">
      ${isCompact 
        ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
           </svg>`
        : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
           </svg>`
      }
    </button>
  `;

  const closeIcon = `
    <button class="sotl-chat-panel__action-btn sotl-chat-panel__action-btn--close" data-sotl-panel-action="collapse" title="Close Panel" aria-label="Close Panel">✕</button>
  `;

  const header = `
    <header class="sotl-chat-panel__head">
      <span class="sotl-chat-panel__title">Loom HUD</span>
      <div class="sotl-chat-panel__head-actions">
        ${toggleIcon}
        ${drawerIcon}
        ${generateIcon}
        ${closeIcon}
      </div>
    </header>
  `;

  if (!tracker) {
    return [
      '<div class="sotl-chat-panel">',
      header,
      '  <div class="sotl-chat-panel__body">',
      '    <p class="sotl-chat-panel__desc">No tracker has been stored for this chat yet.</p>',
      `    <button class="sotl-button" data-sotl-panel-action="generate" ${isGenerating || state.generation.disabledReason ? 'disabled' : ''} style="margin-top: 6px; width: 100%; justify-content: center;">Generate Tracker</button>`,
      '  </div>',
      '</div>'
    ].join('\n');
  }

  if (isCompact) {
    const bodyContent = renderCompactTrackerForState(tracker, state);
    const swipeChip = typeof tracker.swipeId === 'number'
      ? `<span class="sotl-swipe-chip" title="Active assistant swipe">Swipe ${tracker.swipeId + 1}</span>`
      : '';
    return [
      '<div class="sotl-chat-panel">',
      header,
      '  <div class="sotl-chat-panel__body">',
      swipeChip,
      bodyContent,
      '  </div>',
      '</div>'
    ].join('\n');
  }

  let bodyContent = '';
  if (isCompact) {
    const castData = getFallbackField(tracker.data, ['cast', 'present', 'characters', 'cast_present', 'actors']);
    const castArray = Array.isArray(castData) ? castData : [];
    const castChips = castArray.length > 0
      ? `<div class="sotl-cast-grid" style="margin-top: 4px;">` +
        castArray.slice(0, 3).map((c: any) => `<span class="sotl-chip" style="font-size: 11px; padding: 1px 6px;">${escapeHtml(c?.name || c || 'Cast')}</span>`).join('') +
        (castArray.length > 3 ? `<span class="sotl-chip" style="font-size: 11px; padding: 1px 6px;">+${castArray.length - 3}</span>` : '') +
        `</div>`
      : '';

    const title = String(getFallbackField(tracker.data, ['sceneTitle', 'title', 'name', 'sceneName', 'scene']) || 'Active Scene');
    const location = String(getFallbackField(tracker.data, ['location', 'current_location', 'place', 'scene_location', 'environment']) || 'Unknown');
    const time = String(getFallbackField(tracker.data, ['time', 'current_time', 'timeOfDay', 'scene_time']) || 'Unknown');
    const delta = String(getFallbackField(tracker.data, ['delta', 'summary', 'description', 'updates', 'delta_summary', 'scene_delta']) || 'No deltas recorded.');

    bodyContent = [
      `    <p class="sotl-chat-panel__scene">${escapeHtml(title)}</p>`,
      `    <div class="sotl-chat-panel__meta">📍 ${escapeHtml(location)} • 🕒 ${escapeHtml(time)}</div>`,
      `    <p class="sotl-chat-panel__desc">${escapeHtml(delta)}</p>`,
      castChips,
    ].join('\n');
  } else {
    const swipeChip = typeof tracker.swipeId === 'number'
      ? `<span class="sotl-swipe-chip" title="Active assistant swipe">Swipe ${tracker.swipeId + 1}</span>`
      : '';
    bodyContent = `
      <div class="sotl-chat-panel__scroll-body">
        ${swipeChip}
        ${renderTrackerForState(tracker, state).html}
      </div>
    `;
  }

  return [
    '<div class="sotl-chat-panel">',
    header,
    '  <div class="sotl-chat-panel__body">',
    bodyContent,
    '  </div>',
    '</div>'
  ].join('\n');
}

export function ensureChatLoomPanel(ctx: FrontendContext, state: LoomFrontendState | null): void {
  const doc = documentRef();
  if (!doc) return;

  // Clean up any existing panel first
  doc.querySelector('.sotl-chat-panel-container')?.remove();

  if (!state) return;

  // Enforce new simplified display model
  const showPanel = state.settings.showChatHudLauncher;
  if (!showPanel) return;

  // Self-healing Soft Conflict Detection Strategy
  const visibleDrawer = doc.querySelector('.lumiverse-drawer, .drawer, [data-drawer], #drawer, .sotl-drawer');
  const visibleSettings = doc.querySelector('.lumiverse-settings, .settings-modal, [data-settings], #settings, .sotl-settings');
  
  let softHide = false;
  if (visibleDrawer) {
    const rect = visibleDrawer.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) softHide = true;
  }
  if (visibleSettings) {
    const rect = visibleSettings.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) softHide = true;
  }

  // Heal state flags dynamically if DOM confirms drawer/settings are absent
  if (!visibleDrawer && isDrawerOpen) isDrawerOpen = false;
  if (!visibleSettings && isSettingsOpen) isSettingsOpen = false;

  // Supplemental soft hide based on state flags
  if (isDrawerOpen || isSettingsOpen) softHide = true;

  const container = doc.createElement('div');
  container.className = 'sotl-chat-panel-container';
  if (isChatLoomPanelExpanded) {
    container.classList.add('sotl-chat-panel-container--expanded');
  }
  container.dataset.sotlChatPanel = 'true';

  if (softHide) {
    container.style.setProperty('display', 'none', 'important');
  }

  const pawSvg = `<svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor" style="display: block;" aria-hidden="true"><path d="M226.5 282.7c-5.5-12.8-18-20.7-31.9-20.7h-.2c-14 0-26.6 7.9-32.1 20.7l-35.3 82.5c-4 9.4-3.5 20.2 1.3 29.1 4.8 8.9 14.1 14.4 24.2 14.4h149c10.1 0 19.4-5.5 24.2-14.4 4.8-8.9 5.3-19.7 1.3-29.1l-35.3-82.5zM128 208c0-26.5-21.5-48-48-48S32 181.5 32 208s21.5 48 48 48 48-21.5 48-48zm256 0c0-26.5-21.5-48-48-48s-48 21.5-48 48 21.5 48 48 48 48-21.5 48-48zM192 96c0-26.5-21.5-48-48-48S96 69.5 96 96s21.5 48 48 48 48-21.5 48-48zm128 0c0-26.5-21.5-48-48-48s-48 21.5-48 48 21.5 48 48 48 48-21.5 48-48z"/></svg>`;

  if (!isChatLoomPanelExpanded) {
    container.innerHTML = `
      <div class="sotl-chat-pill" data-sotl-panel-action="expand" title="Open Loom HUD" role="button" aria-label="Open Loom HUD" tabindex="0">
        ${pawSvg}
      </div>
    `;

    // Attempt native host attachment: look for the right-side action strip containing the star/spark icon.
    // Lumiverse typically places action icons in a vertical flex column on the right side of the chat.
    // We look for common host selectors for the right action column, then find the star/spark button inside it,
    // and insert our paw pill immediately after it.
    if (!isChatLoomPanelExpanded && !softHide) {
      const hostSelectors = [
        '.chat-action-buttons',
        '.chat-actions',
        '.message-actions',
        '.right-actions',
        '[data-chat-actions]',
        '[data-message-actions]',
        '.lv-chat-actions',
        '.lv-action-strip',
      ];
      let hostContainer: Element | null = null;
      for (const sel of hostSelectors) {
        hostContainer = doc.querySelector(sel);
        if (hostContainer) break;
      }

      if (hostContainer) {
        // Found a native action strip — inject pill as sibling after the last child
        // Remove the fixed-position overlay style and use flow layout instead
        container.style.removeProperty('position');
        container.style.setProperty('display', 'block');
        container.style.setProperty('margin-top', '8px');
        hostContainer.append(container);
        // Attach click handler and return early (skip doc.body.append below)
        attachContainerClickHandler(container, ctx, state, doc);
        return;
      }
    }
  } else {
    container.innerHTML = renderCompactPanel(state.latestTracker, state);
  }

  attachContainerClickHandler(container, ctx, state, doc);
  doc.body.append(container);
}

function attachContainerClickHandler(
  container: HTMLElement,
  ctx: FrontendContext,
  state: LoomFrontendState,
  doc: Document,
): void {
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
    } else if (action === 'toggle-hud-view') {
      const nextView = state.settings.hudDefaultView === 'compact' ? 'full' : 'compact';
      state.settings.hudDefaultView = nextView;
      triggerRerender();
      
      const msg = { type: 'save_settings' as const, settings: { hudDefaultView: nextView } };
      if (typeof ctx.sendToBackend === 'function') {
        ctx.sendToBackend(msg);
      } else {
        const direct = ctx.sendToBackend || (ctx.backend && typeof ctx.backend === 'object' && (ctx.backend as any).postMessage);
        if (typeof direct === 'function') {
          direct(msg);
        }
      }
    } else if (action === 'drawer') {
      isChatLoomPanelExpanded = false;
      triggerRerender();
      setTimeout(() => {
        if (openDrawerCallback) {
          openDrawerCallback();
        } else {
          const ui = ctx.ui && typeof ctx.ui === 'object' ? ctx.ui as Record<string, unknown> : {};
          const openDrawer = ui.openDrawer ?? ui.showDrawer ?? ui.openPanel ?? ui.activateDrawer;
          if (typeof openDrawer === 'function') {
            (openDrawer as (id: string) => void)('state_of_the_loom');
          } else {
            // Fallback clicking
            const openBtn = doc.querySelector('[data-sotl-action="open-drawer"]') as HTMLElement | null;
            openBtn?.click();
          }
        }
      }, 100);
    } else if (action === 'generate') {
      if (typeof ctx.sendToBackend === 'function') {
        ctx.sendToBackend({ type: 'generate_tracker' });
      } else {
        const genBtn = doc.querySelector('[data-sotl-action="generate"]') as HTMLElement | null;
        genBtn?.click();
      }
    }
  });
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
