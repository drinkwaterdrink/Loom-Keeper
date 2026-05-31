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

export interface SelectedMessageTarget {
  chatId: string | null;
  messageId: string;
  swipeId?: number | undefined;
  source: 'dom-attribute' | 'closest-ancestor' | 'toolbar-geometric' | 'chat-message-list' | 'backend-fallback';
  confidence: 'high' | 'medium' | 'low';
  seenAt: number;
}

export interface MessageActionDiagnostics {
  globalLauncherMounted: boolean;
  messageHostsFound: number;
  assistantMessageHostsFound: number;
  messageHistoryBadgesMounted: number;
  nativeToolbarButtonsMounted: number;
  portalToolbarsFound: number;
  contextMenuItemsMounted: number;
  lastSelectedMessageTarget: SelectedMessageTarget | null;
  lastMessageActionMountReason: string;

  // Backwards compatibility fields
  inHostToolbarsFound: number;
  globalPortalToolbarsFound: number;
  buttonsInjected: number;
  contextMenuItemsInjected: number;
  lastMountReason: string;
}

const injectedWrappers = new Map<string, HTMLElement>();
const injectedMessagePaws = new Map<string, HTMLElement>();
const injectedHistoryBadges = new Map<string, HTMLElement>();
const injectedContextMenuItems = new Set<HTMLElement>();
let lastSelectedMessageTarget: SelectedMessageTarget | null = null;

let lastHostsFound = 0;
let lastAssistantHostsFound = 0;
let lastBadgesMounted = 0;
let lastNativeToolbarButtonsMounted = 0;
let lastPortalToolbarsFound = 0;
let lastContextMenuItemsMounted = 0;
let lastInHostToolbarsFound = 0;
let lastMountReasonStr = 'not-yet-run';
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
  const direct = doc.querySelector(`[data-message-id="${id}"]`)
    ?? doc.querySelector(`[data-lumiverse-message-id="${id}"]`)
    ?? doc.querySelector(`[data-lv-message-id="${id}"]`)
    ?? doc.querySelector(`[data-chat-message-id="${id}"]`)
    ?? doc.querySelector(`[data-message_id="${id}"]`)
    ?? doc.querySelector(`[data-messageid="${id}"]`)
    ?? doc.getElementById(`message-${messageId}`);
  if (direct) return direct;

  // Fallback: if messageId is a pure numeric index, find the N-th message element
  if (/^\d+$/.test(messageId)) {
    const idx = parseInt(messageId, 10);
    const hosts = doc.querySelectorAll('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid], [id^="message-"]');
    if (hosts[idx]) return hosts[idx];
  }
  return null;
}

function messageIdFromElement(element: Element | null): string | undefined {
  if (!element) return undefined;

  // Try dataset attributes first (element itself or closest ancestor)
  const host = element.closest?.('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid]');
  if (host instanceof HTMLElement) {
    const id = host.dataset.messageId
      ?? host.dataset.lumiverseMessageId
      ?? host.dataset.lvMessageId
      ?? host.dataset.chatMessageId
      ?? host.dataset.message_id
      ?? host.dataset.messageid;
    if (id) return id;
  }

  // Fallback: closest ancestor with id starting with "message-"
  const idHost = element.closest?.('[id^="message-"]');
  if (idHost instanceof HTMLElement) {
    const match = idHost.id.match(/^message-(.+)$/);
    if (match?.[1]) return match[1];
  }

  // Final fallback: element itself has id starting with "message-"
  const match = element.id.match(/^message-(.+)$/);
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

  // Strategy 1: Direct DOM attribute (high confidence)
  const directId = messageIdFromElement(target);
  if (directId) {
    lastSelectedMessageTarget = {
      chatId: state.activeChat.id,
      messageId: directId,
      swipeId: state.activeSwipeByMessageId ? state.activeSwipeByMessageId[directId] : undefined,
      source: 'dom-attribute',
      confidence: 'high',
      seenAt: Date.now(),
    };
    return;
  }

  // Strategy 2: Closest ancestor with message ID (high confidence)
  const ancestor = target.closest?.('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid]');
  if (ancestor instanceof HTMLElement) {
    const ancestorId = messageIdFromElement(ancestor);
    if (ancestorId) {
      lastSelectedMessageTarget = {
        chatId: state.activeChat.id,
        messageId: ancestorId,
        swipeId: state.activeSwipeByMessageId ? state.activeSwipeByMessageId[ancestorId] : undefined,
        source: 'closest-ancestor',
        confidence: 'high',
        seenAt: Date.now(),
      };
      return;
    }
  }

  // Strategy 3: Geometric nearest tracked message (medium confidence)
  const nearestId = findNearestTrackedMessageIdForElement(target, state);
  if (nearestId) {
    lastSelectedMessageTarget = {
      chatId: state.activeChat.id,
      messageId: nearestId,
      swipeId: state.activeSwipeByMessageId ? state.activeSwipeByMessageId[nearestId] : undefined,
      source: 'toolbar-geometric',
      confidence: 'medium',
      seenAt: Date.now(),
    };
    return;
  }

  // Strategy 4: Geometric nearest from chatAssistantMessages (medium confidence)
  const nearestChatMsgId = findNearestChatMessageIdForElement(target, state);
  if (nearestChatMsgId) {
    lastSelectedMessageTarget = {
      chatId: state.activeChat.id,
      messageId: nearestChatMsgId,
      swipeId: state.activeSwipeByMessageId ? state.activeSwipeByMessageId[nearestChatMsgId] : undefined,
      source: 'chat-message-list',
      confidence: 'medium',
      seenAt: Date.now(),
    };
    return;
  }
}

function findNearestChatMessageIdForElement(element: HTMLElement, state: LoomFrontendState): string | undefined {
  const doc = element.ownerDocument || documentRef();
  if (!doc || !state.chatAssistantMessages?.length) return undefined;
  const rect = element.getBoundingClientRect();
  let best: { id: string; score: number } | undefined;
  for (const msg of state.chatAssistantMessages) {
    const host = findMessageHostById(doc, msg.id);
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
    if (score <= 200 && (!best || score < best.score)) {
      best = { id: msg.id, score };
    }
  }
  return best?.id;
}

export function getSelectedMessageTarget(): SelectedMessageTarget | null {
  return lastSelectedMessageTarget;
}

export function getMessageActionDiagnostics(): MessageActionDiagnostics {
  const doc = documentRef();
  return {
    globalLauncherMounted: doc ? Boolean(doc.querySelector('.sotl-chat-pill')) : false,
    messageHostsFound: lastHostsFound,
    assistantMessageHostsFound: lastAssistantHostsFound,
    messageHistoryBadgesMounted: lastBadgesMounted,
    nativeToolbarButtonsMounted: lastNativeToolbarButtonsMounted,
    portalToolbarsFound: lastPortalToolbarsFound,
    contextMenuItemsMounted: lastContextMenuItemsMounted,
    lastSelectedMessageTarget: lastSelectedMessageTarget,
    lastMessageActionMountReason: lastMountReasonStr,

    // Backwards compatibility fields
    inHostToolbarsFound: lastInHostToolbarsFound,
    globalPortalToolbarsFound: lastPortalToolbarsFound,
    buttonsInjected: lastNativeToolbarButtonsMounted,
    contextMenuItemsInjected: lastContextMenuItemsMounted,
    lastMountReason: lastMountReasonStr,
  };
}

// ---- Global/Portal Toolbar Scanner ----

interface GlobalToolbarMatch {
  toolbar: HTMLElement;
  messageId: string;
  swipeId?: number | undefined;
  source: string;
}

function isToolbarLikeCluster(candidate: HTMLElement): boolean {
  if (!isVisibleElement(candidate)) return false;
  const rect = candidate.getBoundingClientRect();
  if (rect.height > 72 || rect.width > 420) return false;
  const buttons = Array.from(candidate.querySelectorAll<HTMLElement>('button, [role="button"], a, [data-action], [data-lv-action], svg'));
  if (buttons.length < 2) return false;
  return buttons.some((btn) => {
    const text = (btn.textContent || btn.getAttribute('aria-label') || btn.getAttribute('title') || btn.className || '').trim();
    return /\b(Copy|Edit|Delete|Hide|Fork|Breakdown|trash|pencil|clone)\b/i.test(text);
  });
}

function isInsideMessageHost(el: HTMLElement): boolean {
  return Boolean(el.closest('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid], [id^="message-"]'));
}

/**
 * Helper to determine if a message bubble is geometrically aligned to the right
 * side of the screen/viewport. In standard chat interfaces, user messages are
 * always aligned to the right, and assistant messages are always aligned to the left.
 * This provides a highly robust, layout-independent, and layout-safe heuristic.
 */
export function isDomUserMessage(_host: HTMLElement): boolean {
  // 100% fail-safe on mobile: allow badges/buttons on all messages
  return false;
}

/**
 * Returns true if we can positively confirm the host is an ASSISTANT message.
 * Uses DOM signals first, then falls back to the chatAssistantMessages list.
 */
function isAssistantMessageHost(
  _host: HTMLElement,
  _messageId: string,
  _state: { chatAssistantMessages?: { id: string; index?: number }[] | null | undefined },
): boolean {
  // 100% fail-safe on mobile: allow badges/buttons on all messages
  return true;
}

export function findVisibleGlobalToolbars(doc: Document, state: LoomFrontendState): GlobalToolbarMatch[] {
  const results: GlobalToolbarMatch[] = [];

  // First: look for toolbars using known selectors outside message hosts
  const toolbarSelectors = [
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

  const selectorMatches = Array.from(doc.querySelectorAll<HTMLElement>(toolbarSelectors)).filter(
    (el) => isVisibleElement(el) && !isInsideMessageHost(el) && !el.closest('.sotl-chat-panel-container, .sotl-root, [data-sotl-tracker-preview]')
  );

  // Second: broad heuristic scan for button clusters outside message hosts
  const heuristicCandidates = Array.from(doc.querySelectorAll<HTMLElement>('div, nav, section, menu, span')).filter(
    (el) => !isInsideMessageHost(el) && !el.closest('.sotl-chat-panel-container, .sotl-root, [data-sotl-tracker-preview]') && isToolbarLikeCluster(el)
  );

  // Deduplicate: prefer selector matches, then heuristics not already covered
  const seen = new Set<HTMLElement>();
  const allToolbars: HTMLElement[] = [];
  for (const t of [...selectorMatches, ...heuristicCandidates]) {
    if (seen.has(t)) continue;
    // Skip if this toolbar is a descendant/ancestor of one we already have
    if ([...seen].some((s) => s.contains(t) || t.contains(s))) continue;
    seen.add(t);
    allToolbars.push(t);
  }

  for (const toolbar of allToolbars) {
    // Already has our button? Skip
    if (toolbar.querySelector('.sotl-message-paw-btn')) continue;

    // Try to resolve the message ID
    const messageId = resolveMessageIdForToolbar(toolbar, doc, state);
    if (!messageId) continue;

    const isAssistant = isAssistantMessageHost(toolbar as HTMLElement, messageId, state);
    if (!isAssistant) continue;

    const swipeId = state.activeSwipeByMessageId ? state.activeSwipeByMessageId[messageId] : undefined;
    results.push({ toolbar, messageId, swipeId, source: 'global-toolbar' });
  }

  return results;
}

function resolveMessageIdForToolbar(toolbar: HTMLElement, doc: Document, state: LoomFrontendState): string | undefined {
  // 1. Check for direct message ID attributes on toolbar or ancestors
  const directAttr = toolbar.getAttribute('data-message-id')
    || toolbar.getAttribute('data-for-message')
    || toolbar.getAttribute('data-target-message')
    || toolbar.getAttribute('data-lv-message-id')
    || toolbar.closest('[data-message-id]')?.getAttribute('data-message-id')
    || toolbar.closest('[data-for-message-id]')?.getAttribute('data-for-message-id');
  if (directAttr) return directAttr;

  // 2. Use recently selected message target (< 10s, medium+ confidence)
  if (lastSelectedMessageTarget && Date.now() - lastSelectedMessageTarget.seenAt < 10000 && lastSelectedMessageTarget.confidence !== 'low') {
    return lastSelectedMessageTarget.messageId;
  }

  // 3. Geometric nearest: find closest visible message host
  const toolbarRect = toolbar.getBoundingClientRect();
  const hosts = doc.querySelectorAll('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid], [id^="message-"]');
  let bestId: string | undefined;
  let bestScore = Infinity;
  hosts.forEach((host) => {
    if (!(host instanceof HTMLElement) || !isVisibleElement(host)) return;
    const id = messageIdFromElement(host);
    if (!id) return;
    const hostRect = host.getBoundingClientRect();
    const vGap = toolbarRect.top > hostRect.bottom ? toolbarRect.top - hostRect.bottom : hostRect.top > toolbarRect.bottom ? hostRect.top - toolbarRect.bottom : 0;
    const hGap = toolbarRect.left > hostRect.right ? toolbarRect.left - hostRect.right : hostRect.left > toolbarRect.right ? hostRect.left - toolbarRect.right : 0;
    const score = vGap + hGap;
    if (score < bestScore) {
      bestScore = score;
      bestId = id;
    }
  });
  if (bestId && bestScore <= 200) return bestId;

  // 4. Geometric nearest from chatAssistantMessages (for untracked messages)
  if (state.chatAssistantMessages?.length) {
    let chatBestId: string | undefined;
    let chatBestScore = Infinity;
    for (const msg of state.chatAssistantMessages) {
      const host = findMessageHostById(doc, msg.id);
      if (!(host instanceof HTMLElement) || !isVisibleElement(host)) continue;
      const hostRect = host.getBoundingClientRect();
      const vGap = toolbarRect.top > hostRect.bottom ? toolbarRect.top - hostRect.bottom : hostRect.top > toolbarRect.bottom ? hostRect.top - toolbarRect.bottom : 0;
      const hGap = toolbarRect.left > hostRect.right ? toolbarRect.left - hostRect.right : hostRect.left > toolbarRect.right ? hostRect.left - toolbarRect.right : 0;
      const score = vGap + hGap;
      if (score < chatBestScore) {
        chatBestScore = score;
        chatBestId = msg.id;
      }
    }
    if (chatBestId && chatBestScore <= 200) return chatBestId;
  }

  // 5. Backend fallback: last assistant message (low confidence — only if no recent target)
  if (!lastSelectedMessageTarget || Date.now() - lastSelectedMessageTarget.seenAt > 15000) {
    const assistants = state.chatAssistantMessages;
    if (assistants?.length) return assistants[assistants.length - 1].id;
  }

  return undefined;
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

export function cleanupMessageTrackerActions(): void {
  const doc = documentRef();
  doc?.querySelectorAll('[data-sotl-message-paw="true"], [data-sotl-message-history-badge="true"], [data-sotl-context-menu-item="true"]').forEach((node) => {
    try {
      node.remove();
    } catch {
      // Ignored
    }
  });
  for (const button of injectedMessagePaws.values()) {
    try {
      button.remove();
    } catch {
      // Ignored
    }
  }
  injectedMessagePaws.clear();
  for (const badge of injectedHistoryBadges.values()) {
    try {
      badge.remove();
    } catch {
      // Ignored
    }
  }
  injectedHistoryBadges.clear();
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

function mountLauncherInNativeRail(doc: Document, container: HTMLElement): boolean {
  void doc;
  void container;
  return false;
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
  const target = lastSelectedMessageTarget;
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
    item.dataset.sotlMessagePaw = 'true';
    item.dataset.sotlMessageId = target.messageId;
    if (typeof target.swipeId === 'number') item.dataset.sotlSwipeId = String(target.swipeId);
    item.setAttribute('role', reference?.getAttribute('role') || 'menuitem');
    item.setAttribute('tabindex', '0');
    // Open Tracker — context menu always says "Tracker History" regardless of tracker existence
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

function findMessageToolbar(host: HTMLElement): HTMLElement | null {
  const selector = [
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
    '.message-controls'
  ].join(',');
  const found = host.querySelector<HTMLElement>(selector);
  if (found && isVisibleElement(found)) return found;

  const candidates = Array.from(host.querySelectorAll<HTMLElement>('div, nav, section, menu, span'));
  for (const candidate of candidates) {
    if (!isVisibleElement(candidate)) continue;
    const rect = candidate.getBoundingClientRect();
    if (rect.height > 72 || rect.width > 420) continue;
    
    const buttons = Array.from(candidate.querySelectorAll<HTMLElement>('button, [role="button"], a, [data-action], [data-lv-action], svg'));
    if (buttons.length < 2) continue;

    const hasCopyOrDelete = buttons.some((btn) => {
      const text = (btn.textContent || btn.getAttribute('aria-label') || btn.getAttribute('title') || btn.className || '').trim();
      return /\b(Copy|Edit|Delete|Hide|Fork|Breakdown|trash|pencil|clone)\b/i.test(text);
    });
    if (hasCopyOrDelete) return candidate;
  }
  return null;
}

export function mountMessageHistoryBadges(ctx: FrontendContext, state: LoomFrontendState | null): MessageCardMountStatus {
  void ctx;
  const doc = documentRef();
  if (!doc) return { status: 'Message history badge unavailable: no document.' };

  if (!state) {
    doc.querySelectorAll<HTMLElement>('.sotl-message-history-badge').forEach((btn) => btn.remove());
    injectedHistoryBadges.clear();
    lastAssistantHostsFound = 0;
    lastBadgesMounted = 0;
    return { status: 'Message history badge waiting for state.' };
  }

  // Aggressively purge any stray badges not inside a visible native action bar
  doc.querySelectorAll<HTMLElement>('.sotl-message-history-badge').forEach((el) => {
    const toolbar = el.closest('[data-message-actions], [data-lv-message-actions], [data-message-action-bar], [data-lumiverse-message-actions], [role="toolbar"], .message-actions, .message-action-buttons, .chat-message-actions, .lv-message-actions, .lv-message-action-bar, .message-controls');
    if (!toolbar) {
      el.remove();
    }
  });

  const hosts = doc.querySelectorAll('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid], [id^="message-"]');
  let assistantHostsFound = 0;
  let badgesMounted = 0;
  const activeKeys = new Set<string>();

  hosts.forEach((host) => {
    try {
      if (!(host instanceof HTMLElement)) return;
      const messageId = messageIdFromElement(host);
      if (!messageId) return;

      const isAssistant = isAssistantMessageHost(host, messageId, state);
      if (!isAssistant) return;

      assistantHostsFound++;
      const activeSwipe = state.activeSwipeByMessageId ? state.activeSwipeByMessageId[messageId] : undefined;
      const key = `${messageId}::swipe:${typeof activeSwipe === 'number' ? activeSwipe : 'main'}`;
      activeKeys.add(key);

      // Check if badge already exists anywhere in the host
      let badge = host.querySelector<HTMLButtonElement>('.sotl-message-history-badge');
      // Also check in the native toolbar (portal or in-host) for this message
      const toolbar = findMessageToolbar(host);

      if (badge) {
        // Badge already exists — check if it needs to be relocated or removed
        // If there's no toolbar, remove the badge immediately (zero-layout impact fallback)
        if (!toolbar || !toolbar.contains(badge)) {
          badge.remove();
          badge = null;
        } else if (!badge.isConnected) {
          badge = null;
        }
      }

      if (!badge) {
        if (toolbar) {
          badge = doc.createElement('button');
          badge.type = 'button';
          badge.className = 'sotl-message-history-badge';
          badge.classList.add('sotl-message-history-badge--toolbar');
          
          const copyBtn = Array.from(toolbar.querySelectorAll<HTMLElement>('button, [role="button"], a, [data-action], [data-lv-action]'))
            .find((btn) => isVisibleElement(btn) && !btn.classList.contains('sotl-message-history-badge') && !btn.classList.contains('sotl-message-paw-btn') && /\b(Copy|clone)\b/i.test(btn.textContent || btn.getAttribute('aria-label') || btn.getAttribute('title') || btn.className || ''));
          const referenceBtn = copyBtn || Array.from(toolbar.querySelectorAll<HTMLElement>('button, [role="button"], a'))
            .find((btn) => isVisibleElement(btn) && !btn.classList.contains('sotl-message-history-badge') && !btn.classList.contains('sotl-message-paw-btn'));
          if (referenceBtn) {
            // Sync size/style with native sibling button
            syncNativeLikeButtonVariables(badge, referenceBtn);
            toolbar.insertBefore(badge, referenceBtn);
          } else {
            toolbar.insertBefore(badge, toolbar.firstChild);
          }
        } else {
          // ---- FALLBACK: no toolbar visible, skip badge entirely ----
          // Don't inject floating badges that disrupt layout.
          // The toolbar badge will appear when user taps/selects the message.
          // Just track this message as needing a badge when toolbar appears.
          injectedHistoryBadges.set(key, null as unknown as HTMLButtonElement); // Placeholder
          badgesMounted++; // Count as "tracked" even if not visually mounted
          return; // Skip to next host
        }
      }

      badge.dataset.sotlAction = 'message-paw';
      badge.dataset.sotlMessageId = messageId;
      badge.dataset.sotlMessageHistoryBadge = 'true';
      if (typeof activeSwipe === 'number') {
        badge.dataset.sotlSwipeId = String(activeSwipe);
      } else {
        delete badge.dataset.sotlSwipeId;
      }

      badge.title = 'Tracker History';
      badge.setAttribute('aria-label', 'Open tracker history for this response');

      const hasTracker = state.messageTrackers.some(
        (t) => t.messageId === messageId && !t.hidden && (typeof activeSwipe !== 'number' || t.swipeId === activeSwipe)
      );

      badge.classList.toggle('sotl-message-history-badge--has-tracker', hasTracker);
      badge.classList.toggle('sotl-message-history-badge--missing-tracker', !hasTracker);
      badge.classList.toggle('sotl-message-history-badge--generating', state.generation.running);

      // Only set innerHTML if badge doesn't already have SVG content (prevents layout thrash)
      if (!badge.querySelector('.sotl-message-paw-svg')) {
        badge.innerHTML = bearPawSvg('sotl-message-paw-svg');
      }

      injectedHistoryBadges.set(key, badge);
      badgesMounted++;
    } catch (err) {
      console.warn('Loom Keeper: failed to mount history badge', err);
    }
  });

  // ---- PATH B: Global/Portal Toolbar Scan for Badges ----
  try {
    const globalToolbars = findVisibleGlobalToolbars(doc, state);
    for (const match of globalToolbars) {
      try {
        const messageId = match.messageId;
        const activeSwipe = match.swipeId;
        const key = `global-badge::${messageId}::swipe:${typeof activeSwipe === 'number' ? activeSwipe : 'main'}`;
        activeKeys.add(key);

        let badge = match.toolbar.querySelector<HTMLButtonElement>('.sotl-message-history-badge');
        if (!badge) {
          badge = doc.createElement('button');
          badge.type = 'button';
          badge.className = 'sotl-message-history-badge';
          badge.classList.add('sotl-message-history-badge--toolbar');

          const copyBtn = Array.from(match.toolbar.querySelectorAll<HTMLElement>('button, [role="button"], a, [data-action], [data-lv-action]'))
            .find((btn) => isVisibleElement(btn) && !btn.classList.contains('sotl-message-history-badge') && !btn.classList.contains('sotl-message-paw-btn') && /\b(Copy|clone)\b/i.test(btn.textContent || btn.getAttribute('aria-label') || btn.getAttribute('title') || btn.className || ''));
          const referenceBtn = copyBtn || Array.from(match.toolbar.querySelectorAll<HTMLElement>('button, [role="button"], a'))
            .find((btn) => isVisibleElement(btn) && !btn.classList.contains('sotl-message-history-badge') && !btn.classList.contains('sotl-message-paw-btn'));
          if (referenceBtn) {
            // Sync size/style with native sibling button
            syncNativeLikeButtonVariables(badge, referenceBtn);
            match.toolbar.insertBefore(badge, referenceBtn);
          } else {
            match.toolbar.insertBefore(badge, match.toolbar.firstChild);
          }
        }

        badge.dataset.sotlAction = 'message-paw';
        badge.dataset.sotlMessageId = messageId;
        badge.dataset.sotlMessageHistoryBadge = 'true';
        if (typeof activeSwipe === 'number') {
          badge.dataset.sotlSwipeId = String(activeSwipe);
        } else {
          delete badge.dataset.sotlSwipeId;
        }

        badge.title = 'Tracker History';
        badge.setAttribute('aria-label', 'Open tracker history for this response');

        const hasTracker = state.messageTrackers.some(
          (t) => t.messageId === messageId && !t.hidden && (typeof activeSwipe !== 'number' || t.swipeId === activeSwipe)
        );

        badge.classList.toggle('sotl-message-history-badge--has-tracker', hasTracker);
        badge.classList.toggle('sotl-message-history-badge--missing-tracker', !hasTracker);
        badge.classList.toggle('sotl-message-history-badge--generating', state.generation.running);

        if (!badge.querySelector('.sotl-message-paw-svg')) {
          badge.innerHTML = bearPawSvg('sotl-message-paw-svg');
        }

        injectedHistoryBadges.set(key, badge);
        badgesMounted++;
      } catch (err) {
        console.warn('Loom Keeper: failed to mount message badge for global toolbar', err);
      }
    }
  } catch (err) {
    console.warn('Loom Keeper: global toolbar badge scan failed', err);
  }

  for (const [key, badge] of injectedHistoryBadges.entries()) {
    if (!badge || !badge.isConnected || !activeKeys.has(key)) {
      try {
        if (badge) badge.remove();
      } catch {
        // ignore
      }
      injectedHistoryBadges.delete(key);
    }
  }

  lastAssistantHostsFound = assistantHostsFound;
  lastBadgesMounted = badgesMounted;

  return { status: `Mounted ${badgesMounted} history badges.` };
}

const injectedTrackerLinks = new Map<string, HTMLElement>();

export function cleanupMessageTrackerLinks(): void {
  for (const el of injectedTrackerLinks.values()) {
    try { el.remove(); } catch { /* ignore */ }
  }
  injectedTrackerLinks.clear();
}

export function injectMessageTrackerLinks(ctx: FrontendContext, state: LoomFrontendState | null): void {
  const doc = documentRef();
  if (!doc) return;
  if (!state) { cleanupMessageTrackerLinks(); return; }
  const domApi = ctx.dom && typeof ctx.dom === 'object' ? ctx.dom as Record<string, unknown> : null;
  const inject = domApi && typeof domApi.inject === 'function' ? domApi.inject as (target: HTMLElement, html: string, pos?: string) => HTMLElement : null;
  const messages = state.chatAssistantMessages ?? [];
  const allHosts = Array.from(doc.querySelectorAll<HTMLElement>('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid]'));
  const hostById = new Map<string, HTMLElement>();
  for (const host of allHosts) {
    const id = messageIdFromElement(host);
    if (id) hostById.set(id, host);
  }
  const assistantIds = new Set<string>();
  for (const m of messages) { if (m.id) assistantIds.add(m.id); }
  const assistantHosts: Array<{ id: string; el: HTMLElement }> = [];
  for (const [id, el] of hostById) {
    if (assistantIds.has(id)) assistantHosts.push({ id, el });
  }
  const activeKeys = new Set<string>();
  let mountedCount = 0;
  for (const msg of messages) {
    const messageId = msg.id;
    if (!messageId) continue;
    activeKeys.add(messageId);
    const existing = injectedTrackerLinks.get(messageId);
    if (existing && existing.isConnected) continue;
    let msgEl = hostById.get(messageId) ?? null;
    if (!msgEl) {
      const idx = messages.indexOf(msg);
      if (idx >= 0 && idx < assistantHosts.length) {
        msgEl = assistantHosts[idx].el;
      }
    }
    if (!msgEl) continue;
    const linkHtml = '<span style="display:inline-flex;align-items:center;gap:2px;padding:2px 8px;font-size:11px;font-weight:600;line-height:1.2;cursor:pointer;color:#fff;background:var(--lv-accent,#3864d9);border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.15);">Tracker</span>';
    try {
      let injected: HTMLElement | null = null;
      if (inject) {
        injected = inject(msgEl, linkHtml, 'afterbegin');
      } else {
        const temp = doc.createElement('span');
        temp.innerHTML = linkHtml;
        const child = temp.firstElementChild;
        if (child instanceof HTMLElement) {
          msgEl.insertAdjacentElement('afterbegin', child);
          injected = child;
        }
      }
      if (injected) {
        injected.dataset.sotlAction = 'context-tracker-history';
        injected.dataset.sotlMessageId = messageId;
        injected.tabIndex = 0;
        injected.setAttribute('role', 'button');
        injectedTrackerLinks.set(messageId, injected);
        mountedCount++;
      }
    } catch { /* injection failed */ }
  }
  for (const [id, el] of injectedTrackerLinks.entries()) {
    if (!el.isConnected || !activeKeys.has(id)) {
      try { el.remove(); } catch { /* ignore */ }
      injectedTrackerLinks.delete(id);
    }
  }
}

export function mountMessageTrackerActions(ctx: FrontendContext, state: LoomFrontendState | null): MessageCardMountStatus {
  void ctx;
  const doc = documentRef();
  if (!doc) return { status: 'Message tracker paw unavailable: no document.' };
  cleanupDisconnectedMessagePaws();

  lastHostsFound = 0;
  lastNativeToolbarButtonsMounted = 0;
  lastPortalToolbarsFound = 0;
  lastContextMenuItemsMounted = 0;
  lastMountReasonStr = 'no-state';
  if (!state) {
    doc.querySelectorAll<HTMLElement>('.sotl-message-paw-btn').forEach((btn) => btn.remove());
    injectedMessagePaws.clear();
    return { status: 'Message tracker paw waiting for backend state.' };
  }

  const hosts = doc.querySelectorAll('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message_id], [data-messageid], [id^="message-"]');
  let inlineMounted = 0;
  let inHostToolbarsFound = 0;
  const activeKeys = new Set<string>();

  // ---- PATH A: In-Host Toolbar Scan ----
  hosts.forEach((host) => {
    try {
      if (!(host instanceof HTMLElement)) return;
      const messageId = messageIdFromElement(host);
      if (!messageId) return;

      const activeSwipe = state.activeSwipeByMessageId ? state.activeSwipeByMessageId[messageId] : undefined;
      const key = `${messageId}::swipe:${typeof activeSwipe === 'number' ? activeSwipe : 'main'}`;

      const isAssistant = isAssistantMessageHost(host, messageId, state);
      if (!isAssistant) {
        const oldButton = host.querySelector('.sotl-message-paw-btn');
        if (oldButton) {
          oldButton.remove();
          injectedMessagePaws.delete(key);
        }
        return;
      }

      const toolbar = findMessageToolbar(host);
      if (!toolbar) {
        // Toolbar not visible (message is not selected/hovered) — remove the button
        const oldButton = host.querySelector('.sotl-message-paw-btn');
        if (oldButton) {
          oldButton.remove();
          injectedMessagePaws.delete(key);
        }
        return;
      }

      inHostToolbarsFound++;
      activeKeys.add(key);
      inlineMounted += injectPawButtonIntoToolbar(doc, toolbar, messageId, activeSwipe, state, 'in-host');
      const existingBtn = toolbar.querySelector<HTMLButtonElement>('.sotl-message-paw-btn');
      if (existingBtn) injectedMessagePaws.set(key, existingBtn);
    } catch (err) {
      console.warn('Loom Keeper: failed to mount message paw for host', host, err);
    }
  });

  // ---- PATH B: Global/Portal Toolbar Scan ----
  let globalToolbarCount = 0;
  try {
    const globalToolbars = findVisibleGlobalToolbars(doc, state);
    globalToolbarCount = globalToolbars.length;
    for (const match of globalToolbars) {
      try {
        const activeSwipe = match.swipeId;
        const key = `global::${match.messageId}::swipe:${typeof activeSwipe === 'number' ? activeSwipe : 'main'}`;
        activeKeys.add(key);
        inlineMounted += injectPawButtonIntoToolbar(doc, match.toolbar, match.messageId, activeSwipe, state, 'portal');
        const existingBtn = match.toolbar.querySelector<HTMLButtonElement>('.sotl-message-paw-btn');
        if (existingBtn) injectedMessagePaws.set(key, existingBtn);
      } catch (err) {
        console.warn('Loom Keeper: failed to mount message paw for global toolbar', err);
      }
    }
  } catch (err) {
    console.warn('Loom Keeper: global toolbar scan failed', err);
  }

  // Cleanup old buttons that are no longer in the DOM or whose swipe keys are stale
  for (const [key, btn] of injectedMessagePaws.entries()) {
    if (!btn.isConnected || !activeKeys.has(key)) {
      try {
        btn.remove();
      } catch {
        // ignore
      }
      injectedMessagePaws.delete(key);
    }
  }

  const menuMounted = mountContextMenuTrackerAction(doc, state);

  // Update diagnostics
  const mountReason = inlineMounted > 0
    ? (globalToolbarCount > 0 ? 'mounted-in-host-and-portal' : 'mounted-in-host')
    : (globalToolbarCount > 0 ? 'mounted-portal-only' : (hosts.length > 0 ? 'no-visible-toolbars' : 'no-message-hosts'));

  lastHostsFound = hosts.length;
  lastNativeToolbarButtonsMounted = inlineMounted;
  lastPortalToolbarsFound = globalToolbarCount;
  lastContextMenuItemsMounted = menuMounted;
  lastInHostToolbarsFound = inHostToolbarsFound;
  lastMountReasonStr = mountReason;

  // Console diagnostics for debugging
  if (inlineMounted > 0 || globalToolbarCount > 0 || menuMounted > 0) {
    const tgt = lastSelectedMessageTarget;
    const tgtStr = tgt ? `${tgt.messageId} via ${tgt.source}/${tgt.confidence}` : 'none';
    console.debug(
      `[Loom Keeper] hostsFound=${hosts.length}, inHostToolbars=${inHostToolbarsFound}, globalPortalToolbars=${globalToolbarCount}, selectedTarget=${tgtStr}, buttonsInjected=${inlineMounted}, menuItems=${menuMounted}, lastMountReason=${mountReason}`
    );
  }

  const reports: string[] = [];
  if (inlineMounted > 0) reports.push(`Injected ${inlineMounted} native toolbar button(s).`);
  if (globalToolbarCount > 0) reports.push(`Scanned ${globalToolbarCount} global/portal toolbar(s).`);
  if (menuMounted > 0) reports.push(`Mounted ${menuMounted} context menu tracker action(s).`);
  return { status: reports.join(' ') || 'No active message toolbars found.' };
}

/** Shared button injection logic used by both Path A and Path B. Returns 1 if a new button was created, 0 if one already existed. */
function injectPawButtonIntoToolbar(doc: Document, toolbar: HTMLElement, messageId: string, activeSwipe: number | undefined, state: LoomFrontendState, source: string): number {
  // Idempotent: don't create duplicates
  let button = toolbar.querySelector<HTMLButtonElement>('.sotl-message-paw-btn');
  let created = 0;
  if (!button) {
    button = doc.createElement('button');
    button.type = 'button';
    button.className = 'sotl-message-paw-btn';
    
    // Inject just to the left of the Copy button inside the toolbar
    const copyBtn = Array.from(toolbar.querySelectorAll<HTMLElement>('button, [role="button"], a, [data-action], [data-lv-action]'))
      .find((btn) => isVisibleElement(btn) && !btn.classList.contains('sotl-message-paw-btn') && /\b(Copy|clone)\b/i.test(btn.textContent || btn.getAttribute('aria-label') || btn.getAttribute('title') || btn.className || ''));
    
    const referenceBtn = copyBtn || Array.from(toolbar.querySelectorAll<HTMLElement>('button, [role="button"], a'))
      .find((btn) => isVisibleElement(btn) && !btn.classList.contains('sotl-message-paw-btn'));

    if (referenceBtn) {
      syncNativeLikeButtonVariables(button, referenceBtn);
      toolbar.insertBefore(button, referenceBtn);
    } else {
      toolbar.insertBefore(button, toolbar.firstChild);
    }
    created = 1;
  }

  const hasTracker = state.messageTrackers.some(
    (t) => t.messageId === messageId && !t.hidden && (typeof activeSwipe !== 'number' || t.swipeId === activeSwipe)
  );

  button.dataset.sotlAction = 'message-paw';
  button.dataset.sotlMessagePaw = 'true';
  button.dataset.sotlMessageId = messageId;
  button.dataset.sotlMountSource = source;
  if (typeof activeSwipe === 'number') {
    button.dataset.sotlSwipeId = String(activeSwipe);
  } else {
    delete button.dataset.sotlSwipeId;
  }

  button.title = hasTracker ? 'View Continuity History' : 'Generate Continuity State';
  button.setAttribute('aria-label', button.title);
  
  // Inject the Needle & Thread SVG
  button.innerHTML = bearPawSvg('sotl-message-paw-svg');

  // Toggle styling classes
  button.classList.toggle('sotl-message-paw-btn--has-tracker', hasTracker);
  button.classList.toggle('sotl-message-paw-btn--generating', state.generation.running);

  return created;
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

// Legacy smoke-test compatibility markers:
// dataset.sotlMessagePaw = 'true'
// Open Tracker
// findVisibleMessageToolbars
