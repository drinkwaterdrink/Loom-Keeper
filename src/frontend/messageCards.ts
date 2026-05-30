import type { LoomFrontendState, LoomTrackerState } from '../shared/types.js';
import { getFallbackField } from '../shared/renderer.js';
import { renderCompactTrackerForState, renderTrackerForState, resolveActiveTrackerForState } from './rendering.js';
import { iconButton } from './ui.js';

type FrontendContext = Record<string, unknown>;

export interface MessageCardMountStatus {
  status: string;
  messageId?: string | undefined;
}

const injectedWrappers = new Map<string, HTMLElement>();
const injectedMessagePaws = new Map<string, HTMLElement>();
const injectedContextMenuItems = new Set<HTMLElement>();
let lastMessageActionTarget: { messageId: string; swipeId?: number | undefined } | null = null;
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

function pawSvg(className = 'sotl-paw-svg'): string {
  return [
    `<svg class="${className}" viewBox="0 0 512 512" width="20" height="20" fill="currentColor" aria-hidden="true">`,
    '  <circle class="sotl-paw-pad sotl-paw-pad--1" cx="80" cy="208" r="48"/>',
    '  <circle class="sotl-paw-pad sotl-paw-pad--2" cx="144" cy="96" r="48"/>',
    '  <circle class="sotl-paw-pad sotl-paw-pad--3" cx="272" cy="96" r="48"/>',
    '  <circle class="sotl-paw-pad sotl-paw-pad--4" cx="336" cy="208" r="48"/>',
    '  <path class="sotl-paw-main" d="M226.5 282.7c-5.5-12.8-18-20.7-31.9-20.7h-.2c-14 0-26.6 7.9-32.1 20.7l-35.3 82.5c-4 9.4-3.5 20.2 1.3 29.1 4.8 8.9 14.1 14.4 24.2 14.4h149c10.1 0 19.4-5.5 24.2-14.4 4.8-8.9 5.3-19.7 1.3-29.1l-35.3-82.5z"/>',
    '</svg>',
  ].join('');
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
  if (!state.messageTrackers.some((tracker) => tracker.messageId === messageId) && state.latestTracker?.messageId !== messageId) return;
  lastMessageActionTarget = {
    messageId,
    swipeId: state.activeSwipeByMessageId[messageId],
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

function visibleToolbarCandidate(element: Element): element is HTMLElement {
  if (!isVisibleElement(element)) return false;
  if (element.querySelector('[data-sotl-message-paw="true"]')) return true;
  const controls = element.querySelectorAll('button, [role="button"], a, [data-action], [data-lv-action]');
  return controls.length > 0;
}

function visibleToolbarClusterCandidate(element: Element, hostElement: Element): element is HTMLElement {
  if (!isVisibleElement(element) || !isNearMessageHost(element, hostElement)) return false;
  const rect = element.getBoundingClientRect();
  if (rect.height > 72 || rect.width > 420) return false;
  const controls = Array.from(element.querySelectorAll<HTMLElement>('button, [role="button"], a, [data-action], [data-lv-action], svg'))
    .filter((control) => isVisibleElement(control));
  if (controls.length < 3) return false;
  const text = element.textContent?.trim() || '';
  return text.length < 160;
}

function isNearMessageHost(candidate: Element, hostElement: Element): boolean {
  if (!(candidate instanceof HTMLElement) || !(hostElement instanceof HTMLElement)) return false;
  const hostRect = hostElement.getBoundingClientRect();
  const candidateRect = candidate.getBoundingClientRect();
  if (hostRect.width <= 0 || hostRect.height <= 0 || candidateRect.width <= 0 || candidateRect.height <= 0) return false;
  const verticalOverlap = candidateRect.bottom >= hostRect.top - 8 && candidateRect.top <= hostRect.bottom + 64;
  const horizontalOverlap = candidateRect.right >= hostRect.left && candidateRect.left <= hostRect.right + 64;
  return verticalOverlap && horizontalOverlap;
}

function findVisibleMessageToolbar(hostElement: Element): HTMLElement | null {
  const selectors = [
    '[data-message-actions]',
    '[data-lv-message-actions]',
    '[data-message-action-bar]',
    '[data-lumiverse-message-actions]',
    '[role="toolbar"]',
    '.message-actions',
    '.message-action-buttons',
    '.chat-message-actions',
    '.lv-message-actions',
    '.lv-message-action-bar',
    '.message-controls',
  ];
  for (const selector of selectors) {
    const direct = Array.from(hostElement.querySelectorAll(selector)).find(visibleToolbarCandidate);
    if (direct) return direct;
  }

  const parent = hostElement.parentElement;
  if (!parent) return null;
  for (const selector of selectors) {
    const nearby = Array.from(parent.querySelectorAll(selector)).find((candidate) => {
      if (!visibleToolbarCandidate(candidate)) return false;
      const closestMessage = candidate.closest('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid]');
      return closestMessage === hostElement || (!closestMessage && isNearMessageHost(candidate, hostElement));
    });
    if (nearby instanceof HTMLElement) return nearby;
  }
  return null;
}

function findDocumentMessageToolbar(doc: Document, hostElement: Element): HTMLElement | null {
  const selectors = [
    '[data-message-actions]',
    '[data-lv-message-actions]',
    '[data-message-action-bar]',
    '[data-lumiverse-message-actions]',
    '[role="toolbar"]',
    '.message-actions',
    '.message-action-buttons',
    '.chat-message-actions',
    '.lv-message-actions',
    '.lv-message-action-bar',
    '.message-controls',
  ].join(',');
  return Array.from(doc.querySelectorAll(selectors))
    .find((candidate) => visibleToolbarCandidate(candidate) && isNearMessageHost(candidate, hostElement)) as HTMLElement | undefined
    ?? Array.from(doc.querySelectorAll('div, nav, section, menu'))
      .find((candidate) => visibleToolbarClusterCandidate(candidate, hostElement)) as HTMLElement | undefined
    ?? null;
}

function cleanupDisconnectedMessagePaws(): void {
  for (const [key, button] of injectedMessagePaws.entries()) {
    if (!button.isConnected) injectedMessagePaws.delete(key);
  }
}

export function cleanupMessageTrackerActions(): void {
  for (const button of injectedMessagePaws.values()) {
    try {
      button.remove();
    } catch {
      // Ignored
    }
  }
  injectedMessagePaws.clear();
  for (const item of injectedContextMenuItems) {
    try {
      item.remove();
    } catch {
      // Ignored
    }
  }
  injectedContextMenuItems.clear();
}

function messageActionKey(messageId: string, swipeId?: number): string {
  return `${messageId}::swipe:${typeof swipeId === 'number' ? swipeId : 'active'}`;
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
  if (!reference || !pill) return;
  syncNativeLikeButtonVariables(pill, reference);
  const rect = reference.getBoundingClientRect();
  const gap = Math.max(6, Math.min(10, rect.height * 0.22));
  container.style.position = 'fixed';
  container.style.left = `${Math.round(rect.left)}px`;
  container.style.right = 'auto';
  container.style.top = `${Math.round(rect.bottom + gap)}px`;
  container.style.width = `${Math.round(rect.width)}px`;
}

function createMessagePawButton(doc: Document, messageId: string, swipeId?: number): HTMLButtonElement {
  const button = doc.createElement('button');
  button.className = 'sotl-message-paw-action';
  button.type = 'button';
  button.dataset.sotlMessagePaw = 'true';
  button.dataset.sotlAction = 'message-paw';
  button.dataset.sotlMessageId = messageId;
  if (typeof swipeId === 'number') button.dataset.sotlSwipeId = String(swipeId);
  button.title = typeof swipeId === 'number'
    ? `Open Loom tracker for Swipe ${swipeId + 1}`
    : 'Open Loom tracker for this message';
  button.setAttribute('aria-label', button.title);
  button.innerHTML = pawSvg('sotl-message-paw-svg');
  return button;
}

function mountAnchoredMessagePaw(doc: Document, hostElement: HTMLElement, messageId: string, swipeId?: number): HTMLElement {
  const button = createMessagePawButton(doc, messageId, swipeId);
  button.classList.add('sotl-message-paw-action--anchored');
  const rect = hostElement.getBoundingClientRect();
  button.style.position = 'fixed';
  button.style.right = `${Math.max(8, Math.round((doc.defaultView?.innerWidth ?? rect.right) - rect.right + 10))}px`;
  button.style.top = `${Math.max(72, Math.round(rect.top + 8))}px`;
  doc.body.append(button);
  return button;
}

function visibleContextMenuCandidate(element: Element): element is HTMLElement {
  if (!isVisibleElement(element)) return false;
  const text = element.textContent || '';
  return /\b(Copy|Edit|Delete|Hide from AI context|Fork chat here|Prompt Breakdown)\b/i.test(text);
}

function mountContextMenuTrackerAction(doc: Document, state: LoomFrontendState): number {
  const target = lastMessageActionTarget;
  if (!target) return 0;
  const hasTracker = state.messageTrackers.some((tracker) => tracker.messageId === target.messageId)
    || state.latestTracker?.messageId === target.messageId;
  if (!hasTracker) return 0;
  const menus = Array.from(doc.querySelectorAll('[role="menu"], [data-context-menu], [data-lv-context-menu], .context-menu, .lv-context-menu, .menu, .popover'))
    .filter(visibleContextMenuCandidate);
  let mounted = 0;
  for (const menu of menus) {
    if (menu.querySelector('[data-sotl-context-menu-item="true"]')) continue;
    const reference = Array.from(menu.querySelectorAll<HTMLElement>('button, [role="menuitem"], [data-menu-item], li, div'))
      .find((candidate) => isVisibleElement(candidate) && /\b(Copy|Edit|Hide from AI context|Fork chat here|Prompt Breakdown)\b/i.test(candidate.textContent || ''));
    const item = doc.createElement(reference?.tagName.toLowerCase() === 'button' ? 'button' : 'div');
    if (item instanceof HTMLButtonElement) item.type = 'button';
    item.className = 'sotl-context-menu-item';
    item.dataset.sotlContextMenuItem = 'true';
    item.dataset.sotlAction = 'message-paw';
    item.dataset.sotlMessageId = target.messageId;
    if (typeof target.swipeId === 'number') item.dataset.sotlSwipeId = String(target.swipeId);
    item.setAttribute('role', reference?.getAttribute('role') || 'menuitem');
    item.setAttribute('tabindex', '0');
    item.innerHTML = `<span class="sotl-context-menu-item__icon">${pawSvg('sotl-message-paw-svg')}</span><span>Open Tracker</span>`;
    if (reference) syncNativeLikeButtonVariables(item, reference);
    const deleteItem = Array.from(menu.children).find((child) => /\bDelete\b/i.test(child.textContent || ''));
    menu.insertBefore(item, deleteItem ?? null);
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

export function mountMessageTrackerActions(ctx: FrontendContext, state: LoomFrontendState | null): MessageCardMountStatus {
  const doc = documentRef();
  if (!doc) return { status: 'Message tracker paw unavailable: no document.' };
  cleanupDisconnectedMessagePaws();
  cleanupMessageTrackerActions();
  if (!state) return { status: 'Message tracker paw waiting for backend state.' };

  const domApi = ctx.dom && typeof ctx.dom === 'object' ? ctx.dom as Record<string, unknown> : null;
  const findMessageElement = domApi && typeof domApi.findMessageElement === 'function'
    ? domApi.findMessageElement as (id: string) => HTMLElement | null
    : null;

  const messageIds = new Set<string>();
  for (const tracker of state.messageTrackers) {
    if (tracker.messageId) messageIds.add(tracker.messageId);
  }
  if (state.latestTracker?.messageId) messageIds.add(state.latestTracker.messageId);
  if (messageIds.size === 0) return { status: 'No message trackers available for message paw actions.' };

  let mounted = 0;
  let missingToolbar = 0;
  let missingHost = 0;

  for (const messageId of messageIds) {
    const activeSwipe = state.activeSwipeByMessageId[messageId];
    const key = messageActionKey(messageId, activeSwipe);
    const hostElement = findMessageElement?.(messageId) ?? findMessageHostById(doc, messageId) as HTMLElement | null;
    if (!hostElement) {
      missingHost += 1;
      continue;
    }

    const toolbar = findVisibleMessageToolbar(hostElement) ?? findDocumentMessageToolbar(doc, hostElement);
    if (!toolbar) {
      if (lastMessageActionTarget?.messageId === messageId && hostElement instanceof HTMLElement) {
        const anchored = mountAnchoredMessagePaw(doc, hostElement, messageId, activeSwipe);
        injectedMessagePaws.set(key, anchored);
        mounted += 1;
        continue;
      }
      missingToolbar += 1;
      continue;
    }

    const button = createMessagePawButton(doc, messageId, activeSwipe);

    const reference = Array.from(toolbar.querySelectorAll<HTMLElement>('button, [role="button"], a'))
      .find((entry) => isVisibleElement(entry) && entry.dataset.sotlMessagePaw !== 'true');
    if (reference) syncNativeLikeButtonVariables(button, reference);

    const deleteLike = Array.from(toolbar.children).find((child) => /\b(delete|trash)\b/i.test(child.getAttribute('aria-label') || child.getAttribute('title') || child.textContent || ''));
    if (deleteLike) toolbar.insertBefore(button, deleteLike);
    else toolbar.append(button);
    injectedMessagePaws.set(key, button);
    mounted += 1;
  }

  const reports: string[] = [];
  if (mounted > 0) reports.push(`Mounted ${mounted} message paw action${mounted === 1 ? '' : 's'}.`);
  const menuMounted = mountContextMenuTrackerAction(doc, state);
  if (menuMounted > 0) reports.push(`Mounted ${menuMounted} context menu tracker action${menuMounted === 1 ? '' : 's'}.`);
  if (missingToolbar > 0) reports.push(`${missingToolbar} message toolbar${missingToolbar === 1 ? '' : 's'} not visible.`);
  if (missingHost > 0) reports.push(`${missingHost} tracked message host${missingHost === 1 ? '' : 's'} not mounted.`);
  return { status: reports.join(' ') || 'No visible message toolbar found for paw actions.' };
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
    const missingText = typeof missingSwipeId === 'number'
      ? `No tracker retained/generated for Swipe ${missingSwipeId + 1}. State of the Loom will not show a sibling swipe's tracker here.`
      : 'No tracker has been stored for this chat yet.';
    return [
      '<div class="sotl-chat-panel">',
      header,
      '  <div class="sotl-chat-panel__body">',
      `    <p class="sotl-chat-panel__desc">${escapeHtml(missingText)}</p>`,
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

  if (!isChatLoomPanelExpanded) {
    const generatingClass = state.generation.running ? ' sotl-chat-pill--generating' : '';
    container.innerHTML = `
      <div class="sotl-chat-pill${generatingClass}" data-sotl-panel-action="expand" title="Open Loom HUD" role="button" aria-label="Open Loom HUD" tabindex="0">
        ${pawSvg()}
      </div>
    `;

    if (!isChatLoomPanelExpanded && !softHide && mountLauncherInNativeRail(doc, container)) {
      attachContainerClickHandler(container, ctx, state, doc);
      return;
    }

    // Attempt native host attachment: look for the right-side action strip containing the star/spark icon.
    // Lumiverse typically places action icons in a vertical flex column on the right side of the chat.
    // We look for common host selectors for the right action column, then find the star/spark button inside it,
    // and insert our paw pill immediately after it.
    if (false && !isChatLoomPanelExpanded && !softHide) {
      const hostSelectors = [
        '.chat-action-buttons',
        '.chat-actions',
        '.right-actions',
        '[data-chat-actions]',
        '.lv-chat-actions',
        '.lv-action-strip',
      ];
      let hostContainer: Element | null = null;
      for (const sel of hostSelectors) {
        hostContainer = (doc as Document).querySelector(sel);
        if (hostContainer) break;
      }

      if (hostContainer) {
        // Found a native action strip — inject pill as sibling after the last child
        // Remove the fixed-position overlay style and use flow layout instead
        container.style.removeProperty('position');
        container.style.setProperty('display', 'block');
        container.style.setProperty('margin-top', '8px');
        (hostContainer as Element).append(container);
        // Attach click handler and return early (skip doc.body.append below)
        attachContainerClickHandler(container, ctx, state as LoomFrontendState, doc as Document);
        return;
      }
    }
  } else {
    const resolution = resolveActiveTrackerForState(state);
    container.innerHTML = renderCompactPanel(resolution.tracker, state, resolution.missingSwipeId);
  }

  if (!isChatLoomPanelExpanded && !softHide) {
    syncFixedLauncherToStockIcon(doc, container);
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
      container.remove();
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
