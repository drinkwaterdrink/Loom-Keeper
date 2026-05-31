import type { LoomFrontendState, LoomTrackerState } from '../shared/types.js';
import { getFallbackField } from '../shared/renderer.js';
import { bearPawSvg } from './icons.js';
import { renderTrackerForState, resolveActiveTrackerForState } from './rendering.js';
import { iconButton } from './ui.js';

type FrontendContext = Record<string, unknown>;

export interface MessageCardMountStatus {
  status: string;
  messageId?: string | undefined;
}

const injectedWrappers = new Map<string, HTMLElement>();
const injectedMessagePaws = new Map<string, HTMLElement>();
const injectedMessageHistoryBadges = new Map<string, HTMLElement>();
const MESSAGE_HOST_SELECTOR = "[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid], [id^=\"message-\"]";
const injectedContextMenuItems = new Set<HTMLElement>();
let lastMessageActionTarget: { messageId: string; swipeId?: number | undefined; seenAt: number } | null = null;
let isChatLoomPanelExpanded = false;
let isDrawerOpen = false;
let isSettingsOpen = false;
let rerenderCallback: (() => void) | null = null;
let openDrawerCallback: (() => void) | null = null;
let chatPanelContainer: HTMLElement | null = null;

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

function findMessageHostById(doc: Document, messageId: string): Element | null {
  const id = escapeSelector(messageId);
  return doc.querySelector(`[data-message-id="${id}"]`)
    ?? doc.querySelector(`[data-lumiverse-message-id="${id}"]`)
    ?? doc.querySelector(`[data-lv-message-id="${id}"]`)
    ?? doc.querySelector(`[data-chat-message-id="${id}"]`)
    ?? doc.querySelector(`[data-message_id="${id}"]`)
    ?? doc.querySelector(`[data-messageid="${id}"]`)
    ?? doc.getElementById(`message-${messageId}`);
}

function messageIdFromElement(element: Element | null): string | undefined {
  const host = element?.closest?.('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid]');
  if (host instanceof HTMLElement) {
    return host.dataset.messageId
      ?? host.dataset.lumiverseMessageId
      ?? host.dataset.lvMessageId
      ?? host.dataset.chatMessageId
      ?? host.dataset.message_id
      ?? host.dataset.messageid
      ?? undefined;
  }
  const id = element instanceof HTMLElement ? element.id : '';
  const match = id.match(/^message-(.+)$/);
  return match?.[1];
}

function findNearestTrackedMessageIdForElement(element: HTMLElement, state: LoomFrontendState): string | undefined {
  const doc = element.ownerDocument || documentRef();
  if (!doc) return undefined;
  const rect = element.getBoundingClientRect();
  const ids = new Set<string>();
  for (const tracker of state.messageTrackers) {
    if (tracker.messageId) ids.add(tracker.messageId);
  }
  if (state.latestTracker?.messageId) ids.add(state.latestTracker.messageId);

  let best: { id: string; score: number } | undefined;
  for (const id of ids) {
    const host = findMessageHostById(doc, id);
    if (!(host instanceof HTMLElement) || !isVisibleElement(host)) continue;
    const hostRect = host.getBoundingClientRect();
    const verticalGap = rect.top > hostRect.bottom
      ? rect.top - hostRect.bottom
      : hostRect.top > rect.bottom
        ? hostRect.top - rect.bottom
        : 0;
    const horizontalGap = rect.left > hostRect.right
      ? rect.left - hostRect.right
      : hostRect.left > rect.right
        ? hostRect.left - rect.right
        : 0;
    const score = verticalGap + horizontalGap;
    if (score <= 96 && (!best || score < best.score)) {
      best = { id, score };
    }
  }
  return best?.id;
}

export function rememberMessageActionTarget(target: HTMLElement | null, state: LoomFrontendState | null): void {
  if (!target || !state) return;
  const messageId = messageIdFromElement(target) ?? findNearestTrackedMessageIdForElement(target, state);
  if (!messageId) return;
  lastMessageActionTarget = {
    messageId,
    swipeId: state.activeSwipeByMessageId ? state.activeSwipeByMessageId[messageId] : undefined,
    seenAt: Date.now(),
  };
}

function findMessageHost(doc: Document, tracker: LoomTrackerState): Element | null {
  if (!tracker.messageId) return null;
  return findMessageHostById(doc, tracker.messageId);
}

function isVisibleElement(element: Element | null): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const style = typeof getComputedStyle === 'function' ? getComputedStyle(element) : null;
  return style?.display !== 'none' && style?.visibility !== 'hidden' && style?.opacity !== '0';
}

function isLargeBlockingSurface(element: Element): boolean {
  if (!isVisibleElement(element)) return false;
  const rect = element.getBoundingClientRect();
  const ariaModal = element.getAttribute('aria-modal') === 'true';
  const role = element.getAttribute('role');
  if (ariaModal || role === 'dialog' || role === 'menu') return true;
  return rect.width >= 160 && rect.height >= 140;
}

function findFirstVisibleBlockingSurface(doc: Document): HTMLElement | null {
  const selectors = [
    '.lumiverse-drawer',
    '.drawer',
    '[data-drawer]',
    '#drawer',
    '.sotl-drawer',
    '.lumiverse-settings',
    '.settings-modal',
    '[data-settings]',
    '#settings',
    '.sotl-settings',
    '[role="dialog"]',
    '[aria-modal="true"]',
    '.modal',
    '.popover',
    '[role="menu"]',
    '[data-context-menu]',
    '[data-lv-context-menu]',
    '.context-menu',
    '.lv-context-menu',
    '[data-sotl-tracker-preview="true"]',
    '[data-route*="branch" i]',
    '[data-screen*="branch" i]',
    '[data-route*="settings" i]',
    '[data-screen*="settings" i]',
  ].join(',');
  const candidates = Array.from(doc.querySelectorAll<HTMLElement>(selectors));
  for (const candidate of candidates) {
    if (candidate.closest('.sotl-chat-panel-container')) continue;
    if (isLargeBlockingSurface(candidate)) return candidate;
  }
  return null;
}

function isInExtensionOrMenu(element: HTMLElement): boolean {
  return Boolean(element.closest('.sotl-root, .sotl-chat-panel-container, [data-sotl-drawer-fallback], [data-sotl-tracker-preview], [role="dialog"], [role="menu"], .popover, .context-menu, .drawer, .lumiverse-drawer, .settings-modal'));
}

function hasVisibleComposer(doc: Document): boolean {
  const selectors = [
    '[data-chat-input]',
    '[data-input-bar]',
    '[data-composer]',
    '.chat-input',
    '.composer',
    '.input-bar',
    'textarea[placeholder*="message" i]',
    'input[placeholder*="message" i]',
    '[contenteditable="true"]',
  ].join(',');
  const viewportHeight = doc.defaultView?.innerHeight ?? 0;
  return Array.from(doc.querySelectorAll<HTMLElement>(selectors)).some((candidate) => {
    if (!isVisibleElement(candidate) || isInExtensionOrMenu(candidate)) return false;
    const rect = candidate.getBoundingClientRect();
    return rect.width >= 120 && rect.bottom >= viewportHeight * 0.55;
  });
}

function hasVisibleChatContent(doc: Document): boolean {
  const selectors = [
    '[data-message-id]',
    '[data-lumiverse-message-id]',
    '[data-lv-message-id]',
    '[data-chat-message-id]',
    '[data-message_id]',
    '[data-messageid]',
    '[class*="message" i]',
    '[class*="chat" i]',
  ].join(',');
  return Array.from(doc.querySelectorAll<HTMLElement>(selectors)).some((candidate) => {
    if (!isVisibleElement(candidate) || isInExtensionOrMenu(candidate)) return false;
    const rect = candidate.getBoundingClientRect();
    return rect.width >= 160 && rect.height >= 40;
  });
}

let lastGlobalPawHideReason = '';

export function getGlobalPawHideReason(): string {
  return lastGlobalPawHideReason;
}

export function shouldShowGlobalPaw(doc: Document, state: LoomFrontendState | null): boolean {
  if (!state) {
    lastGlobalPawHideReason = 'state-unavailable';
    return false;
  }
  if (!state.settings.showChatHudLauncher) {
    lastGlobalPawHideReason = 'disabled-in-settings';
    return false;
  }
  if (isDrawerOpen || isSettingsOpen) {
    lastGlobalPawHideReason = 'drawer-or-settings-open';
    return false;
  }
  if (isChatLoomPanelExpanded) {
    lastGlobalPawHideReason = '';
    return true;
  }
  
  const blockingEl = findFirstVisibleBlockingSurface(doc);
  if (blockingEl) {
    lastGlobalPawHideReason = `blocking-surface-active:${blockingEl.className || blockingEl.tagName}`;
    return false;
  }
  
  if (!hasVisibleComposer(doc)) {
    lastGlobalPawHideReason = 'no-visible-composer';
    return false;
  }
  if (!hasVisibleChatContent(doc) && !state.activeChat.id) {
    lastGlobalPawHideReason = 'no-chat-content';
    return false;
  }
  
  lastGlobalPawHideReason = '';
  return true;
}



function cleanupDisconnectedMessagePaws(): void {
  for (const [key, button] of injectedMessagePaws.entries()) {
    if (!button.isConnected) injectedMessagePaws.delete(key);
  }
}

function isMobileViewport(doc: Document): boolean {
  const view = doc.defaultView;
  if (!view) return false;
  try {
    if (typeof view.matchMedia === 'function' && view.matchMedia('(max-width: 720px)').matches) return true;
  } catch {
    // Fall back to width below.
  }
  return view.innerWidth <= 720;
}

function cleanupMessageHistoryDom(doc: Document): void {
  doc.querySelectorAll('[data-sotl-message-paw="true"], [data-sotl-message-history-badge="true"], [data-sotl-message-history-slot="true"], .sotl-message-paw-btn').forEach((node) => {
    try {
      node.remove();
    } catch {
      // Ignored
    }
  });
  doc.querySelectorAll<HTMLElement>('.sotl-message-history-host').forEach((host) => {
    host.classList.remove('sotl-message-history-host');
  });
  for (const button of injectedMessagePaws.values()) {
    try {
      button.remove();
    } catch {
      // Ignored
    }
  }
  injectedMessagePaws.clear();
  for (const button of injectedMessageHistoryBadges.values()) {
    try {
      button.remove();
    } catch {
      // Ignored
    }
  }
  injectedMessageHistoryBadges.clear();
}

export function cleanupMessageTrackerActions(): void {
  const doc = documentRef();
  if (!doc) return;
  cleanupMessageHistoryDom(doc);
  doc.querySelectorAll('[data-sotl-context-menu-item="true"]').forEach((node) => {
    try {
      node.remove();
    } catch {
      // Ignored
    }
  });
  for (const item of injectedContextMenuItems) {
    try {
      item.remove();
    } catch {
      // Ignored
    }
  }
  injectedContextMenuItems.clear();
}



function syncNativeLikeButtonVariables(target: HTMLElement, reference: HTMLElement): void {
  try {
    const rect = reference.getBoundingClientRect();
    const style = getComputedStyle(reference);
    if (rect.width > 0) {
      target.style.setProperty('--sotl-native-size', `${Math.round(Math.max(rect.width, rect.height))}px`);
      target.style.setProperty('--sotl-native-width', `${Math.round(rect.width)}px`);
    }
    if (rect.height > 0) target.style.setProperty('--sotl-native-height', `${Math.round(rect.height)}px`);
    target.style.setProperty('--sotl-native-radius', style.borderRadius);
    target.style.setProperty('--sotl-native-bg', style.background || style.backgroundColor);
    target.style.setProperty('--sotl-native-color', style.color);
    target.style.setProperty('--sotl-native-border', style.border);
    target.style.setProperty('--sotl-native-shadow', style.boxShadow);
    target.style.setProperty('--sotl-native-opacity', style.opacity);
    target.style.setProperty('--sotl-native-backdrop', style.backdropFilter && style.backdropFilter !== 'none' ? style.backdropFilter : 'blur(12px)');
    target.style.setProperty('--sotl-native-padding', style.padding);
    const inner = reference.querySelector<HTMLElement>('svg, img, [class*="icon" i], [data-icon]');
    const innerRect = inner?.getBoundingClientRect();
    if (innerRect && innerRect.width > 0 && innerRect.height > 0) {
      const glyphSize = Math.round(Math.max(innerRect.width, innerRect.height) * 1.12);
      target.style.setProperty('--sotl-native-glyph-size', `${glyphSize}px`);
    }
  } catch {
    // Computed-style matching is best-effort only.
  }
}

function findNativeSideRail(doc: Document): HTMLElement | null {
  const selectors = [
    '[data-lv-side-rail]',
    '[data-lumiverse-side-rail]',
    '[data-chat-side-actions]',
    '[data-lv-chat-actions]',
    '.lv-side-rail',
    '.lumiverse-side-rail',
    '.chat-side-rail',
    '.chat-side-actions',
    '.right-side-actions',
    '.floating-actions',
  ];
  for (const selector of selectors) {
    const candidate = doc.querySelector(selector);
    if (isVisibleElement(candidate)) return candidate;
  }
  return null;
}

function mountLauncherInNativeRail(doc: Document, container: HTMLElement): boolean {
  const rail = findNativeSideRail(doc);
  if (!rail) return false;
  const pill = container.querySelector<HTMLElement>('.sotl-chat-pill');
  const stockReference = findStockSideIcon(doc);
  const reference = stockReference && rail.contains(stockReference)
    ? stockReference
    : Array.from(rail.querySelectorAll<HTMLElement>('button, [role="button"], a, [tabindex]'))
    .find((entry) => isVisibleElement(entry));
  if (pill && reference) syncNativeLikeButtonVariables(pill, reference);
  container.dataset.sotlNativeMounted = 'true';
  container.style.removeProperty('position');
  container.style.removeProperty('right');
  container.style.removeProperty('top');
  if (reference?.parentElement === rail) {
    reference.insertAdjacentElement('afterend', container);
  } else {
    rail.append(container);
  }
  return true;
}

function isStockSideIconCandidate(doc: Document, candidate: HTMLElement): boolean {
  if (!isVisibleElement(candidate) || candidate.closest('.sotl-chat-panel-container')) return false;
  const rect = candidate.getBoundingClientRect();
  const viewportWidth = doc.defaultView?.innerWidth ?? 0;
  return rect.width >= 24
    && rect.width <= 72
    && rect.height >= 24
    && rect.height <= 72
    && rect.right >= viewportWidth - 112
    && rect.top >= 56
    && rect.bottom <= (doc.defaultView?.innerHeight ?? 1000) - 72;
}

function findStockSideIcon(doc: Document): HTMLElement | null {
  const textMatches = [
    '[aria-label*="spark" i]',
    '[title*="spark" i]',
    '[aria-label*="star" i]',
    '[title*="star" i]',
    '[aria-label*="magic" i]',
    '[title*="magic" i]',
    '[data-action*="spark" i]',
    '[data-lv-action*="spark" i]',
    '[data-testid*="spark" i]',
    '[class*="spark" i]',
  ];
  for (const selector of textMatches) {
    const found = Array.from(doc.querySelectorAll<HTMLElement>(selector))
      .find((candidate) => candidate.dataset.sotlChatPanel !== 'true' && isStockSideIconCandidate(doc, candidate));
    if (found) return found;
  }

  const candidates = Array.from(doc.querySelectorAll<HTMLElement>('button, [role="button"], a, [tabindex]'))
    .filter((candidate) => {
      return isStockSideIconCandidate(doc, candidate) && Boolean(candidate.querySelector('svg'));
    })
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  return candidates[0] ?? null;
}

function syncFixedLauncherToStockIcon(doc: Document, container: HTMLElement): void {
  const reference = findStockSideIcon(doc);
  const pill = container.querySelector<HTMLElement>('.sotl-chat-pill');
  if (!pill) return;
  
  if (reference) {
    syncNativeLikeButtonVariables(pill, reference);
    const rect = reference.getBoundingClientRect();
    const gap = Math.max(6, Math.min(10, rect.height * 0.22));

    const nextLeft = Math.round(rect.left);
    const nextTop = Math.round(rect.bottom + gap);
    const nextWidth = Math.round(rect.width);

    const curLeft = parseInt(container.style.left || '0', 10);
    const curTop = parseInt(container.style.top || '0', 10);
    const curWidth = parseInt(container.style.width || '0', 10);

    if (
      Math.abs(nextLeft - curLeft) > 1 ||
      Math.abs(nextTop - curTop) > 1 ||
      Math.abs(nextWidth - curWidth) > 1 ||
      container.style.position !== 'fixed'
    ) {
      container.style.position = 'fixed';
      container.style.left = `${nextLeft}px`;
      container.style.right = 'auto';
      container.style.top = `${nextTop}px`;
      container.style.width = `${nextWidth}px`;
    }
  } else {
    // Robust fixed-position right-margin gutter fallback (no bottom-bar)
    // Sits floating on the right side aligned vertically near the rail area
    container.style.position = 'fixed';
    container.style.right = '12px';
    container.style.left = 'auto';
    container.style.top = '180px';
    container.style.bottom = 'auto';
    container.style.width = '36px';
    container.style.height = '36px';
    container.style.zIndex = '10002';
    
    pill.style.width = '100%';
    pill.style.height = '100%';
  }
}



function visibleContextMenuCandidate(element: Element): element is HTMLElement {
  if (!isVisibleElement(element)) return false;
  const text = element.textContent || '';
  return /\b(Copy|Edit|Delete|Hide from AI context|Fork chat here|Prompt Breakdown)\b/i.test(text);
}

function mountContextMenuTrackerAction(doc: Document, state: LoomFrontendState): number {
  void state;
  const target = lastMessageActionTarget;
  doc.querySelectorAll<HTMLElement>('[data-sotl-context-menu-item="true"]').forEach((item) => {
    if (!target || Date.now() - target.seenAt > 30000 || item.dataset.sotlMessageId !== target.messageId) {
      item.remove();
      injectedContextMenuItems.delete(item);
    }
  });
  if (!target || Date.now() - target.seenAt > 30000) return 0;
  
  let menus = Array.from(doc.querySelectorAll('[role="menu"], [role="listbox"], [role="dialog"], [class*="dropdown" i], [class*="menu" i], [class*="popup" i], .context-menu, .lv-context-menu, .menu, .popover, .dropdown'))
    .filter(visibleContextMenuCandidate);

  // Keep only the innermost menus
  menus = menus.filter((menu) => {
    return !menus.some((other) => other !== menu && menu.contains(other));
  });

  let mounted = 0;
  for (const menu of menus) {
    if (menu.querySelector('[data-sotl-context-menu-item="true"]')) continue;
    const candidates = Array.from(menu.querySelectorAll<HTMLElement>('button, [role="menuitem"], [role="button"], [data-menu-item], li, div, span, a'));
    const reference = candidates.find((candidate) => isVisibleElement(candidate) && /\b(Copy|Edit|Hide from AI context|Fork chat here|Prompt Breakdown)\b/i.test(candidate.textContent || ''));
    const item = doc.createElement(reference?.tagName.toLowerCase() === 'button' ? 'button' : 'div');
    if (item instanceof HTMLButtonElement) item.type = 'button';
    item.className = 'sotl-context-menu-item ' + (reference?.className || '');
    item.dataset.sotlContextMenuItem = 'true';
    item.dataset.sotlAction = 'message-paw';
    item.dataset.sotlMessageId = target.messageId;
    if (typeof target.swipeId === 'number') item.dataset.sotlSwipeId = String(target.swipeId);
    item.setAttribute('role', reference?.getAttribute('role') || 'menuitem');
    item.setAttribute('tabindex', '0');
    item.innerHTML = `<span class="sotl-context-menu-item__icon">${bearPawSvg('sotl-message-paw-svg')}</span><span>Tracker History</span>`;
    if (reference) syncNativeLikeButtonVariables(item, reference);

    const promptBreakdownItem = candidates.find((candidate) => isVisibleElement(candidate) && /Prompt Breakdown/i.test(candidate.textContent || ''));
    const deleteItem = candidates.find((candidate) => isVisibleElement(candidate) && /Delete/i.test(candidate.textContent || ''));

    if (promptBreakdownItem) {
      promptBreakdownItem.insertAdjacentElement('afterend', item);
    } else if (deleteItem) {
      deleteItem.insertAdjacentElement('beforebegin', item);
    } else {
      menu.insertBefore(item, menu.firstChild);
    }

    injectedContextMenuItems.add(item);
    mounted += 1;
  }
  return mounted;
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
  const activeSwipe = state.activeSwipeByMessageId ? state.activeSwipeByMessageId[tracker.messageId] : undefined;
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
    const activeSwipe = state.activeSwipeByMessageId ? state.activeSwipeByMessageId[id] : undefined;
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
  if (isMobileViewport(doc)) {
    cleanupMessageCards(ctx);
    return { status: 'Message-card rendering disabled on mobile to preserve chat scroll layout.' };
  }

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

function messageHistoryKey(messageId: string, swipeId?: number): string {
  return `${messageId}::swipe:${typeof swipeId === 'number' ? swipeId : 'main'}`;
}

function assistantSummaryForMessage(state: LoomFrontendState, messageId: string): { swipeId?: number | undefined } | undefined {
  return (state.chatAssistantMessages || []).find((summary) => summary.id === messageId);
}

function resolveMessageSwipeId(state: LoomFrontendState, messageId: string): number | undefined {
  const activeSwipe = state.activeSwipeByMessageId ? state.activeSwipeByMessageId[messageId] : undefined;
  if (typeof activeSwipe === 'number') return activeSwipe;
  const summarySwipe = assistantSummaryForMessage(state, messageId)?.swipeId;
  return typeof summarySwipe === 'number' ? summarySwipe : undefined;
}

function messageHasExactTracker(state: LoomFrontendState, messageId: string, swipeId?: number): boolean {
  return state.messageTrackers.some((tracker) => {
    if (tracker.hidden || tracker.messageId !== messageId) return false;
    return typeof swipeId === 'number' ? tracker.swipeId === swipeId : typeof tracker.swipeId !== 'number';
  });
}

function assistantMessageIds(state: LoomFrontendState): Set<string> {
  return new Set((state.chatAssistantMessages || []).map((summary) => summary.id));
}

function fallbackMessageIds(state: LoomFrontendState): Set<string> {
  const ids = new Set<string>();
  for (const tracker of state.messageTrackers) {
    if (tracker.messageId) ids.add(tracker.messageId);
  }
  if (state.latestTracker?.messageId) ids.add(state.latestTracker.messageId);
  for (const id of Object.keys(state.activeSwipeByMessageId || {})) ids.add(id);
  return ids;
}

function collectVisibleAssistantMessageHosts(doc: Document, state: LoomFrontendState): HTMLElement[] {
  const assistantIds = assistantMessageIds(state);
  const fallbackIds = fallbackMessageIds(state);
  const byId = new Map<string, HTMLElement>();
  const candidates = Array.from(doc.querySelectorAll<HTMLElement>(MESSAGE_HOST_SELECTOR));
  for (const host of candidates) {
    if (!isVisibleElement(host) || isInExtensionOrMenu(host)) continue;
    const messageId = messageIdFromElement(host);
    if (!messageId) continue;
    if (assistantIds.size > 0 ? !assistantIds.has(messageId) : !fallbackIds.has(messageId)) continue;
    const rect = host.getBoundingClientRect();
    if (rect.width < 160 || rect.height < 48) continue;
    const existing = byId.get(messageId);
    if (!existing) {
      byId.set(messageId, host);
      continue;
    }
    const existingRect = existing.getBoundingClientRect();
    if ((rect.width * rect.height) > (existingRect.width * existingRect.height)) byId.set(messageId, host);
  }
  return Array.from(byId.values()).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
}

function mountMessageHistoryBadges(doc: Document, state: LoomFrontendState, hosts: HTMLElement[]): number {
  const activeKeys = new Set<string>();
  let mounted = 0;

  for (const host of hosts) {
    const messageId = messageIdFromElement(host);
    if (!messageId) continue;
    const swipeId = resolveMessageSwipeId(state, messageId);
    const key = messageHistoryKey(messageId, swipeId);
    activeKeys.add(key);
    const hasTracker = messageHasExactTracker(state, messageId, swipeId);

    let button = host.querySelector<HTMLButtonElement>('[data-sotl-message-history-badge="true"]');
    if (!button) {
      button = doc.createElement('button');
      button.type = 'button';
      button.className = 'sotl-message-history-badge';
      button.dataset.sotlMessageHistoryBadge = 'true';
      mounted += 1;
    }

    button.dataset.sotlAction = 'message-paw';
    button.dataset.sotlMessageId = messageId;
    if (typeof swipeId === 'number') button.dataset.sotlSwipeId = String(swipeId);
    else delete button.dataset.sotlSwipeId;
    button.title = 'Tracker History';
    button.setAttribute('aria-label', 'Open tracker history for this response');
    button.innerHTML = bearPawSvg('sotl-message-paw-svg');
    button.classList.toggle('sotl-message-history-badge--has-tracker', hasTracker);
    button.classList.toggle('sotl-message-history-badge--missing-tracker', !hasTracker);
    button.classList.toggle('sotl-message-history-badge--generating', state.generation.running);

    const oldSlot = button.closest<HTMLElement>('[data-sotl-message-history-slot="true"]');
    host.classList.add('sotl-message-history-host');
    button.classList.remove('sotl-message-history-badge--floating');
    if (button.parentElement !== host) host.append(button);
    if (oldSlot && !oldSlot.querySelector('[data-sotl-message-history-badge="true"]')) oldSlot.remove();
    host.querySelectorAll<HTMLElement>('[data-sotl-message-history-slot="true"]').forEach((slot) => {
      if (!slot.querySelector('[data-sotl-message-history-badge="true"]')) slot.remove();
    });

    injectedMessageHistoryBadges.set(key, button);
  }

  for (const [key, button] of injectedMessageHistoryBadges.entries()) {
    if (!button.isConnected || !activeKeys.has(key)) {
      button.remove();
      injectedMessageHistoryBadges.delete(key);
    }
  }

  doc.querySelectorAll<HTMLElement>('[data-sotl-message-history-badge="true"]').forEach((button) => {
    const messageId = button.dataset.sotlMessageId || '';
    const rawSwipeId = button.dataset.sotlSwipeId;
    const parsedSwipeId = rawSwipeId === undefined ? undefined : Number(rawSwipeId);
    const key = messageHistoryKey(messageId, Number.isFinite(parsedSwipeId) ? parsedSwipeId : undefined);
    if (!activeKeys.has(key)) {
      const slot = button.closest<HTMLElement>('[data-sotl-message-history-slot="true"]');
      button.remove();
      if (slot && !slot.querySelector('[data-sotl-message-history-badge="true"]')) slot.remove();
    }
  });

  return mounted;
}
export function mountMessageTrackerActions(ctx: FrontendContext, state: LoomFrontendState | null): MessageCardMountStatus {
  void ctx;
  const doc = documentRef();
  if (!doc) return { status: 'Message tracker history unavailable: no document.' };
  cleanupDisconnectedMessagePaws();

  if (!state) {
    doc.querySelectorAll<HTMLElement>('.sotl-message-paw-btn, [data-sotl-message-history-badge="true"], [data-sotl-message-history-slot="true"]').forEach((btn) => btn.remove());
    injectedMessagePaws.clear();
    injectedMessageHistoryBadges.clear();
    return { status: 'Message tracker history waiting for backend state.' };
  }

  if (isMobileViewport(doc)) {
    cleanupMessageHistoryDom(doc);
    const menuMounted = mountContextMenuTrackerAction(doc, state);
    return { status: menuMounted > 0 ? `Mounted ${menuMounted} context menu tracker action(s).` : 'Inline message tracker history disabled on mobile to preserve chat scroll layout.' };
  }

  const hosts = collectVisibleAssistantMessageHosts(doc, state);
  const badgeMounted = mountMessageHistoryBadges(doc, state, hosts);

  // Centered in-message badges are the desktop path; native toolbar injection overlaps Lumiverse controls.
  doc.querySelectorAll<HTMLElement>('.sotl-message-paw-btn').forEach((btn) => btn.remove());
  injectedMessagePaws.clear();

  const menuMounted = mountContextMenuTrackerAction(doc, state);
  const reports: string[] = [];
  if (badgeMounted > 0) reports.push(`Mounted ${badgeMounted} message history badge(s).`);
  if (menuMounted > 0) reports.push(`Mounted ${menuMounted} context menu tracker action(s).`);
  if (hosts.length === 0) reports.push('No visible assistant message hosts found for history badges.');
  return { status: reports.join(' ') || 'Message history badges stable.' };
}
function renderCompactPanel(tracker: LoomTrackerState | null, state: LoomFrontendState, missingSwipeId?: number | undefined): string {
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
    <button class="sotl-chat-panel__action-btn" data-sotl-panel-action="generate" ${!isGenerating && state.generation.disabledReason ? 'disabled' : ''} title="${escapeHtml(isGenerating ? 'Stop tracker generation' : state.generation.disabledReason || 'Generate Tracker State')}" aria-label="${isGenerating ? 'Stop tracker generation' : 'Generate Tracker State'}">
      <svg class="${isGenerating ? 'sotl-spin' : ''}" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
        ${isGenerating ? '<rect x="6" y="6" width="12" height="12" rx="2"/>' : '<path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'}
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
    const missingText = typeof missingSwipeId === 'number'
      ? `No tracker retained/generated for Swipe ${missingSwipeId + 1}. Loom Keeper will not show a sibling swipe's tracker here.`
      : 'No tracker has been stored for this chat yet.';
    return [
      '<div class="sotl-chat-panel">',
      header,
      '  <div class="sotl-chat-panel__body">',
      `    <p class="sotl-chat-panel__desc">${escapeHtml(missingText)}</p>`,
      `    <button class="sotl-button" data-sotl-panel-action="generate" ${!isGenerating && state.generation.disabledReason ? 'disabled' : ''} style="margin-top: 6px; width: 100%; justify-content: center;">${isGenerating ? 'Stop Generation' : 'Generate Tracker'}</button>`,
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

  const show = Boolean(state && shouldShowGlobalPaw(doc, state));
  const container = chatPanelContainer && chatPanelContainer.isConnected
    ? chatPanelContainer
    : doc.querySelector<HTMLElement>('.sotl-chat-panel-container') ?? doc.createElement('div');
  chatPanelContainer = container;
  container.className = 'sotl-chat-panel-container';
  container.dataset.sotlChatPanel = 'true';
  if (!show || !state) {
    isChatLoomPanelExpanded = false;
    container.hidden = true;
    container.setAttribute('aria-hidden', 'true');
    container.dataset.sotlHiddenReason = !state ? 'state-unavailable' : (lastGlobalPawHideReason || 'not-normal-chat');
    if (!container.isConnected) doc.body.append(container);
    return;
  }
  container.hidden = false;
  container.removeAttribute('aria-hidden');
  container.dataset.sotlHiddenReason = '';
  container.classList.remove('sotl-chat-panel-container--expanded');
  if (isChatLoomPanelExpanded) {
    container.classList.add('sotl-chat-panel-container--expanded');
    container.removeAttribute('style');
    delete container.dataset.sotlNativeMounted;
  }

  if (!isChatLoomPanelExpanded) {
    const generatingClass = state.generation.running ? ' sotl-chat-pill--generating' : '';
    const pill = container.querySelector('.sotl-chat-pill');
    if (pill) {
      if (state.generation.running) {
        pill.classList.add('sotl-chat-pill--generating');
      } else {
        pill.classList.remove('sotl-chat-pill--generating');
      }
    } else {
      container.innerHTML = `
        <div class="sotl-chat-pill${generatingClass}" data-sotl-panel-action="expand" title="Open Loom HUD" role="button" aria-label="Open Loom HUD" tabindex="0">
          ${bearPawSvg()}
        </div>
      `;
    }

    if (mountLauncherInNativeRail(doc, container)) {
      attachContainerClickHandler(container, ctx, state, doc);
      return;
    }

    // Attempt native host attachment: look for the right-side action strip containing the star/spark icon.
    // Lumiverse typically places action icons in a vertical flex column on the right side of the chat.
    // We look for common host selectors for the right action column, then find the star/spark button inside it,
    // and insert our paw pill immediately after it.
    if (false) {
      if (false) {
        // Found a native action strip — inject pill as sibling after the last child
        // Remove the fixed-position overlay style and use flow layout instead
        container.style.removeProperty('position');
        container.style.setProperty('display', 'block');
        container.style.setProperty('margin-top', '8px');
        container.hidden = true;
        // Attach click handler and return early (skip doc.body.append below)
        attachContainerClickHandler(container, ctx, state as LoomFrontendState, doc as Document);
        return;
      }
    }
  } else {
    const resolution = resolveActiveTrackerForState(state);
    container.innerHTML = renderCompactPanel(resolution.tracker, state, resolution.missingSwipeId);
  }

  if (!isChatLoomPanelExpanded) {
    syncFixedLauncherToStockIcon(doc, container);
  }

  attachContainerClickHandler(container, ctx, state, doc);
  if (!container.isConnected || container.parentElement !== doc.body) doc.body.append(container);
}

function attachContainerClickHandler(
  container: HTMLElement,
  ctx: FrontendContext,
  state: LoomFrontendState,
  doc: Document,
): void {
  (container as HTMLElement & { __sotlState?: LoomFrontendState }).__sotlState = state;
  if ((container as HTMLElement & { __sotlClickBound?: boolean }).__sotlClickBound) return;
  (container as HTMLElement & { __sotlClickBound?: boolean }).__sotlClickBound = true;
  container.addEventListener('click', (e) => {
    const currentState = (container as HTMLElement & { __sotlState?: LoomFrontendState }).__sotlState ?? state;
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const pill = target.closest('.sotl-chat-pill');
    if (pill && !isChatLoomPanelExpanded) {
      isChatLoomPanelExpanded = true;
      triggerRerender();
      return;
    }
    const action = target.dataset.sotlPanelAction || target.closest('[data-sotl-panel-action]')?.getAttribute('data-sotl-panel-action');
    
    if (action === 'collapse') {
      isChatLoomPanelExpanded = false;
      triggerRerender();
    } else if (action === 'expand') {
      isChatLoomPanelExpanded = true;
      triggerRerender();
    } else if (action === 'toggle-hud-view') {
      const nextView = currentState.settings.hudDefaultView === 'compact' ? 'full' : 'compact';
      currentState.settings.hudDefaultView = nextView;
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
            (openDrawer as (id: string) => void)('loom_keeper');
          } else {
            // Fallback clicking
            const openBtn = doc.querySelector('[data-sotl-action="open-drawer"]') as HTMLElement | null;
            openBtn?.click();
          }
        }
      }, 100);
    } else if (action === 'generate') {
      if (typeof ctx.sendToBackend === 'function') {
        if (currentState.generation.running) ctx.sendToBackend({ type: 'cancel_generation' });
        else ctx.sendToBackend({ type: 'generate_tracker' });
      } else {
        const genBtn = doc.querySelector(`[data-sotl-action="${currentState.generation.running ? 'cancel-generation' : 'generate'}"]`) as HTMLElement | null;
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
  button.title = 'Loom Keeper (Experimental)';
  button.textContent = 'L';
  button.addEventListener('click', () => {
    const ui = ctx.ui && typeof ctx.ui === 'object' ? ctx.ui as Record<string, unknown> : {};
    const openDrawer = ui.openDrawer ?? ui.showDrawer ?? ui.openPanel;
    if (typeof openDrawer === 'function') {
      (openDrawer as (id: string) => void)('loom_keeper');
    }
  });
  doc.body.append(button);
}

