import type { LoomBackendMessage, LoomFrontendMessage, LoomFrontendState, LoomSettings, LoomTrackerState } from '../shared/types.js';
import { renderDrawer } from './drawer.js';
import { ensureFloatingButton, mountMessageCards, ensureChatLoomPanel, mountMessageTrackerActions, cleanupMessageTrackerActions, registerRerenderCallback, setDrawerOpenState, setSettingsOpenState, registerOpenDrawerCallback, rememberMessageActionTarget } from './messageCards.js';
import { bearPawSvg } from './icons.js';
import { renderTrackerForState, resolveActiveTrackerForState } from './rendering.js';
import { renderSettingsPanel } from './settingsPanel.js';
import { loomStyles } from './styles.js';
import { escapeHtml, type LoomUiStatus } from './ui.js';
import { captureUiState, clearFocusedTrackerRef, restoreUiState, setFocusedTrackerRef, setUiSectionOpen, syncFocusedTrackerSwipe } from './uiState.js';
import {
  editingPreset,
  selectPresetForEditing,
  updateEditingField,
  runPreview,
  setImportStatus,
  clearImportStatus,
} from './presetEditor.js';
import { builtInPresets, LOOM_VERSION } from '../shared/defaults.js';
import { coerceImportedPresets } from '../shared/validation.js';

type FrontendContext = Record<string, unknown>;

interface PlacementHandle {
  root?: HTMLElement;
  update?: (html: string) => void;
  activate?: () => void;
  destroy?: () => void;
  onClick?: (handler: () => void) => (() => void);
}

let state: LoomFrontendState | null = null;
let contextRef: FrontendContext | null = null;
let drawerHandle: PlacementHandle | null = null;
let settingsHandle: PlacementHandle | null = null;
let drawerRoot: HTMLElement | null = null;
let settingsRoot: HTMLElement | null = null;
let fallbackRoot: HTMLElement | null = null;
let backendTimedOut = false;
let backendTimer: number | undefined;
let messageCardRetryTimer: number | undefined;
let lastFrontendError: string | undefined;
let lastRenderStatus: string | undefined;
let lastToast: LoomUiStatus['lastToast'];
let lastSettingsSavedAt: number | undefined;
let settingsSavedTimer: number | undefined;
let ignoreMessageActionMutationsUntil = 0;
const cleanupFns: Array<() => void> = [];
const rootListenerCleanups = new Map<HTMLElement, () => void>();
const pawIconSvg = bearPawSvg('sotl-drawer-tab-paw');
let swipeStateRefreshTimer: number | undefined;
let swipeStateRefreshBurstTimers: number[] = [];
let swipeDomPollTimer: number | undefined;
let lastSwipeControlSignature = '';
let trackerPreviewRef: { messageId: string; swipeId?: number | undefined; notice?: string | undefined } | null = null;

function documentRef(): Document | null {
  return typeof document === 'undefined' ? null : document;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isElement(value: unknown): value is HTMLElement {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
}

function getUi(ctx: FrontendContext): Record<string, unknown> {
  return ctx.ui && typeof ctx.ui === 'object' ? ctx.ui as Record<string, unknown> : {};
}

function postToBackend(ctx: FrontendContext, message: LoomFrontendMessage): void {
  if (typeof ctx.sendToBackend === 'function') {
    (ctx.sendToBackend as (value: LoomFrontendMessage) => void)(message);
    return;
  }
  const backend = ctx.backend && typeof ctx.backend === 'object' ? ctx.backend as Record<string, unknown> : {};
  const send = backend.send ?? backend.postMessage ?? backend.emit;
  if (typeof send === 'function') {
    (send as (value: LoomFrontendMessage) => void)(message);
    return;
  }
  const direct = ctx.sendToBackend ?? ctx.postMessage;
  if (typeof direct === 'function') (direct as (value: LoomFrontendMessage) => void)(message);
}

function uiStatus(): LoomUiStatus {
  return {
    backendTimedOut,
    lastFrontendError,
    lastRenderStatus,
    lastToast,
    lastSettingsSavedAt,
  };
}

function clearBackendTimer(): void {
  if (backendTimer !== undefined && typeof globalThis.clearTimeout === 'function') {
    globalThis.clearTimeout(backendTimer);
  }
  backendTimer = undefined;
}

function startBackendTimer(): void {
  clearBackendTimer();
  backendTimedOut = false;
  if (typeof globalThis.setTimeout !== 'function') return;
  backendTimer = globalThis.setTimeout(() => {
    if (!state) {
      backendTimedOut = true;
      rerender();
    }
  }, 3500);
}

function requestBackendState(message: LoomFrontendMessage = { type: 'refresh_state' }): void {
  if (!contextRef) return;
  postToBackend(contextRef, message);
  startBackendTimer();
}

function scheduleSwipeStateRefresh(delayMs = 160): void {
  if (swipeStateRefreshTimer !== undefined && typeof globalThis.clearTimeout === 'function') {
    globalThis.clearTimeout(swipeStateRefreshTimer);
  }
  if (typeof globalThis.setTimeout !== 'function') {
    requestBackendState({ type: 'refresh_state' });
    return;
  }
  swipeStateRefreshTimer = globalThis.setTimeout(() => {
    swipeStateRefreshTimer = undefined;
    requestBackendState({ type: 'refresh_state' });
    scheduleMessageCardRetry();
  }, delayMs);
}

function scheduleSwipeStateRefreshBurst(): void {
  if (typeof globalThis.clearTimeout === 'function') {
    for (const timer of swipeStateRefreshBurstTimers) globalThis.clearTimeout(timer);
  }
  swipeStateRefreshBurstTimers = [];
  const delays = [80, 260, 700];
  if (typeof globalThis.setTimeout !== 'function') {
    scheduleSwipeStateRefresh(80);
    return;
  }
  for (const delay of delays) {
    const timer = globalThis.setTimeout(() => {
      scheduleSwipeStateRefresh(delay);
    }, delay);
    swipeStateRefreshBurstTimers.push(timer);
  }
}

function looksLikeSwipeControl(target: HTMLElement): boolean {
  const control = target.closest<HTMLElement>('button, [role="button"], [data-action], [data-lv-action], [aria-label], [title]');
  if (!control) return false;
  const clusterText = control.closest('div, nav, section, menu')?.textContent ?? '';
  const text = [
    control.getAttribute('aria-label'),
    control.getAttribute('title'),
    control.dataset.action,
    control.dataset.lvAction,
    control.dataset.swipeAction,
    control.textContent,
    clusterText,
  ].filter(Boolean).join(' ');
  return /\b(swipe|variant|alternate|previous response|next response|prev response|regenerate)\b/i.test(text)
    || /\b\d+\s*\/\s*\d+\b/.test(text)
    || /^[‹›<>←→]$/.test((control.textContent || '').trim());
}

function readSwipeControlSignature(doc: Document): string {
  const candidates = Array.from(doc.querySelectorAll<HTMLElement>('button, [role="button"], [aria-label], [title], [data-action], [data-lv-action], div, span'))
    .filter((candidate) => {
      const rect = candidate.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0 || rect.width > 220 || rect.height > 80) return false;
      const style = typeof getComputedStyle === 'function' ? getComputedStyle(candidate) : null;
      if (style?.display === 'none' || style?.visibility === 'hidden' || style?.opacity === '0') return false;
      const text = [
        candidate.getAttribute('aria-label'),
        candidate.getAttribute('title'),
        candidate.dataset.action,
        candidate.dataset.lvAction,
        candidate.textContent,
      ].filter(Boolean).join(' ');
      return /\b(swipe|variant|alternate|previous response|next response)\b/i.test(text) || /\b\d+\s*\/\s*\d+\b/.test(text);
    })
    .slice(0, 12)
    .map((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return `${Math.round(rect.left)},${Math.round(rect.top)}:${(candidate.textContent || candidate.getAttribute('aria-label') || candidate.getAttribute('title') || '').replace(/\s+/g, ' ').trim()}`;
    });
  return candidates.join('|');
}

function resolveActiveJsonTracker(): ReturnType<typeof resolveActiveTrackerForState>['tracker'] {
  if (!state) return null;
  return resolveActiveTrackerForState(state).tracker ?? state.latestTracker;
}

function datasetSwipeId(element: HTMLElement): number | undefined {
  const value = element.dataset.sotlSwipeId;
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function resolveTrackerForMessageSwipe(
  currentState: LoomFrontendState | null,
  messageId: string | undefined,
  requestedSwipeId?: number | undefined,
): { tracker: LoomTrackerState | null; swipeId?: number | undefined; notice?: string | undefined } {
  if (!currentState || !messageId) return { tracker: null, swipeId: requestedSwipeId, notice: 'Tracker state is not ready yet.' };
  const trackers = currentState.messageTrackers.filter((tracker) => tracker.messageId === messageId);
  const activeSwipe = typeof requestedSwipeId === 'number'
    ? requestedSwipeId
    : (currentState.activeSwipeByMessageId ? currentState.activeSwipeByMessageId[messageId] : undefined);
  if (typeof activeSwipe === 'number') {
    const exact = trackers.find((tracker) => tracker.swipeId === activeSwipe);
    if (exact) return { tracker: exact, swipeId: activeSwipe };
    if (trackers.some((tracker) => typeof tracker.swipeId === 'number')) {
      return {
        tracker: null,
        swipeId: activeSwipe,
        notice: `No tracker is stored for Swipe ${activeSwipe + 1}. It may not have generated yet or may have been pruned by the tracker history limit.`,
      };
    }
  }
  if (trackers.length === 0) {
    return { tracker: null, swipeId: activeSwipe, notice: 'No tracker is stored for this message.' };
  }
  const onlyTracker = trackers[0];
  if (trackers.length === 1 && onlyTracker && typeof onlyTracker.swipeId !== 'number') {
    return { tracker: onlyTracker, swipeId: onlyTracker.swipeId };
  }
  return {
    tracker: null,
    swipeId: activeSwipe,
    notice: 'The active swipe could not be determined clearly, so Loom Keeper did not guess between stored swipe trackers.',
  };
}

function installStyle(ctx: FrontendContext): void {
  const dom = ctx.dom && typeof ctx.dom === 'object' ? ctx.dom as Record<string, unknown> : {};
  const addStyle = dom.addStyle ?? getUi(ctx).addStyle ?? ctx.addStyle;
  if (typeof addStyle === 'function') {
    const cleanup = (addStyle as (css: string, id?: string) => void | (() => void))(loomStyles, 'loom-keeper-styles');
    if (typeof cleanup === 'function') cleanupFns.push(cleanup);
    return;
  }
  const doc = documentRef();
  if (!doc || doc.getElementById('loom-keeper-styles')) return;
  const style = doc.createElement('style');
  style.id = 'loom-keeper-styles';
  style.textContent = loomStyles;
  doc.head.append(style);
  cleanupFns.push(() => style.remove());
}

function renderInto(root: HTMLElement | null, html: string): void {
  if (root) root.innerHTML = html;
}

function formatShortId(value?: string | undefined): string {
  if (!value) return 'unknown';
  return value.length > 12 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}

function formatSwipeLabel(swipeId?: number | undefined): string {
  return typeof swipeId === 'number' ? `Swipe ${swipeId + 1}` : 'Main swipe';
}

function formatGeneratedAt(value?: string | undefined): string {
  if (!value) return 'unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function isMobileViewport(): boolean {
  const doc = documentRef();
  const width = doc?.defaultView?.innerWidth ?? 1024;
  return width <= 720;
}

function markGenerationPending(message: string): void {
  if (!state) return;
  state = {
    ...state,
    generation: {
      ...state.generation,
      running: true,
      message,
    },
  };
}

function markGenerationStopping(): void {
  if (!state) return;
  state = {
    ...state,
    generation: {
      ...state.generation,
      running: true,
      message: 'Stopping generation...',
    },
  };
}
function isCurrentTracker(tracker: LoomTrackerState | null, currentState: LoomFrontendState | null): boolean {
  if (!tracker || !currentState) return false;
  const current = resolveActiveTrackerForState(currentState).tracker;
  return Boolean(current && current.messageId === tracker.messageId && current.swipeId === tracker.swipeId);
}

let lastPreviewRenderKey = '';

function closeTrackerPreview(): void {
  trackerPreviewRef = null;
  lastPreviewRenderKey = '';
  documentRef()?.querySelector('[data-sotl-tracker-preview="true"]')?.remove();
}

function openTrackerPreview(messageId: string | undefined, swipeId?: number | undefined): void {
  if (!messageId) return;
  const resolved = resolveTrackerForMessageSwipe(state, messageId, swipeId);
  trackerPreviewRef = {
    messageId,
    swipeId: resolved.swipeId,
    notice: resolved.notice,
  };
  renderTrackerPreviewOverlay();
}

function renderTrackerPreviewOverlay(): void {
  const doc = documentRef();
  if (!doc) return;
  let overlay = doc.querySelector<HTMLElement>('[data-sotl-tracker-preview="true"]');
  if (!trackerPreviewRef) {
    overlay?.remove();
    lastPreviewRenderKey = '';
    return;
  }

  const resolved = resolveTrackerForMessageSwipe(state, trackerPreviewRef.messageId, trackerPreviewRef.swipeId);
  const isGenerating = Boolean(state?.generation.running);
  const trackerKey = resolved.tracker ? `${resolved.tracker.generatedAt}::${resolved.tracker.validation.ok}` : 'missing';

  const coreRenderKey = `${trackerPreviewRef.messageId}::${resolved.swipeId}::${trackerKey}`;
  const tracker = resolved.tracker;
  const current = isCurrentTracker(tracker, state);
  const status = tracker ? (current ? 'current' : 'previous retained') : 'missing';

  if (coreRenderKey === lastPreviewRenderKey && overlay && overlay.isConnected) {
    // Dynamic updates for badge, buttons, and progress message without destroying the body DOM
    const badge = overlay.querySelector('.sotl-tracker-preview__badge');
    if (badge) {
      badge.textContent = status;
      badge.setAttribute('data-status', status);
    }

    let progressBanner = overlay.querySelector('.sotl-tracker-preview__progress-banner');
    if (isGenerating) {
      if (!progressBanner) {
        progressBanner = doc.createElement('p');
        progressBanner.className = 'sotl-note sotl-tracker-preview__progress-banner';
        progressBanner.setAttribute('style', 'font-size: 11px; margin: 0 0 2px;');
        const head = overlay.querySelector('.sotl-card-details') || overlay.querySelector('.sotl-tracker-preview__head');
        head?.insertAdjacentElement('afterend', progressBanner);
      }
      progressBanner.textContent = `${state?.generation.message || 'Generating tracker...'} Existing content remains until replacement is saved.`;
    } else if (progressBanner) {
      progressBanner.remove();
    }

    const buttons = overlay.querySelectorAll<HTMLButtonElement>('[data-sotl-action="preview-regenerate"]');
    buttons.forEach((btn) => {
      btn.textContent = isGenerating ? 'Stop Generation' : (tracker ? 'Regenerate' : 'Generate Tracker');
    });

    return;
  }
  lastPreviewRenderKey = coreRenderKey;

  if (!overlay) overlay = doc.createElement('div');
  overlay.className = 'sotl-tracker-preview-overlay';
  overlay.dataset.sotlTrackerPreview = 'true';

  const preset = tracker && state
    ? state.presets.find((candidate) => candidate.id === tracker.presetId)
    : undefined;
  const jsonButton = tracker ? '<button class="sotl-button" type="button" data-sotl-action="preview-copy-json">Copy JSON</button>' : '';
  
  const regenerateButton = tracker
    ? `<button class="sotl-button" type="button" data-sotl-action="preview-regenerate" data-sotl-message-id="${escapeHtml(tracker.messageId || trackerPreviewRef.messageId)}"${typeof tracker.swipeId === 'number' ? ` data-sotl-swipe-id="${tracker.swipeId}"` : ''}>${isGenerating ? 'Stop Generation' : 'Regenerate'}</button>`
    : `<button class="sotl-button" type="button" data-sotl-action="preview-regenerate" data-sotl-message-id="${escapeHtml(trackerPreviewRef.messageId)}"${typeof resolved.swipeId === 'number' ? ` data-sotl-swipe-id="${resolved.swipeId}"` : ''} style="margin-top: 10px; width: 100%; justify-content: center;">${isGenerating ? 'Stop Generation' : 'Generate Tracker'}</button>`;
  
  const drawerButton = tracker && !isMobileViewport() ? '<button class="sotl-button" type="button" data-sotl-action="preview-open-drawer">Open in Track drawer</button>' : '';
  
  const body = tracker && state
    ? renderTrackerForState(tracker, state).html
    : `<div class="sotl-tracker-preview__missing" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center;">
         <p style="margin: 0 0 10px; font-weight: 500; font-size: 14px;">No tracker exists for this message/swipe.</p>
         ${regenerateButton}
       </div>`;
  
  const meta = [
    `Msg ${formatShortId(tracker?.messageId || trackerPreviewRef.messageId)}`,
    formatSwipeLabel(resolved.swipeId ?? tracker?.swipeId),
    tracker ? formatGeneratedAt(tracker.generatedAt) : 'not generated',
    tracker ? (preset?.name || tracker.presetId) : 'no template',
  ];

  const detailsHtml = [
    '<details class="sotl-card-details" style="margin-top: 2px; width: 100%; border: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80, 88, 100, 0.2))); border-radius: 6px; padding: 4px 8px; background: rgba(0,0,0,0.15); box-sizing: border-box;">',
    '  <summary style="font-size: 11px; font-weight: 600; cursor: pointer; user-select: none; outline: none;">Show Scene Summary & Metadata</summary>',
    '  <div style="margin-top: 6px; display: grid; gap: 4px;">',
    `    <h4 style="margin: 0; font-size: 12px; font-weight: 700; color: inherit;">${tracker ? escapeHtml(tracker.compactSummary || preset?.name || 'Retained Continuity') : 'No Continuity Retained'}</h4>`,
    `    <p style="margin: 0; font-size: 10px; color: var(--lumiverse-text-muted, var(--lv-text-muted, #8f9baa));">${meta.map(escapeHtml).join(' - ')}</p>`,
    '  </div>',
    '</details>'
  ].join('\n');

  overlay.innerHTML = [
    '<div class="sotl-tracker-preview__scrim" data-sotl-action="close-tracker-preview"></div>',
    '<section class="sotl-tracker-preview" role="dialog" aria-modal="true" aria-label="Loom Keeper tracker preview" style="padding: 10px; gap: 6px; display: flex; flex-direction: column;">',
    '  <header class="sotl-tracker-preview__head" style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 4px; border-bottom: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80,88,100,0.15))); gap: 8px;">',
    '    <div style="display: flex; align-items: center; gap: 6px;">',
    `      <span style="font-size: 13px; font-weight: 700; color: var(--lv-accent, #3864d9);">Loom History</span>`,
    `      <span class="sotl-tracker-preview__badge" data-status="${escapeHtml(status)}" style="padding: 1px 6px; font-size: 10px; height: auto;">${escapeHtml(status)}</span>`,
    '    </div>',
    '    <button class="sotl-icon-button sotl-tracker-preview__close" type="button" data-sotl-action="close-tracker-preview" aria-label="Close tracker preview" style="width: 24px; height: 24px; font-size: 14px; display: flex; align-items: center; justify-content: center; line-height: 1;">×</button>',
    '  </header>',
    detailsHtml,
    isGenerating ? `<p class="sotl-note" style="font-size: 11px; margin: 0 0 2px;">${escapeHtml(state?.generation.message || 'Generating tracker...')} Existing content remains until replacement is saved.</p>` : '',
    resolved.notice && tracker ? `<p class="sotl-note sotl-warning" style="font-size: 11px; margin: 0 0 2px;">${escapeHtml(resolved.notice)}</p>` : '',
    `  <div class="sotl-tracker-preview__body" style="flex: 1; min-height: 120px; overflow-y: auto; padding-right: 2px;">${body}</div>`,
    '  <footer class="sotl-tracker-preview__actions" style="display: flex; gap: 6px; padding-top: 6px; border-top: 1px solid var(--lumiverse-border, var(--lv-border, rgba(80,88,100,0.15))); flex-wrap: wrap;">',
    '    <button class="sotl-button" type="button" data-sotl-action="close-tracker-preview" style="min-height: 28px; font-size: 12px; padding: 0 8px; height: 28px;">Close</button>',
    drawerButton ? drawerButton.replace('sotl-button', 'sotl-button" style="min-height: 28px; font-size: 12px; padding: 0 8px; height: 28px;') : '',
    jsonButton ? jsonButton.replace('sotl-button', 'sotl-button" style="min-height: 28px; font-size: 12px; padding: 0 8px; height: 28px;') : '',
    tracker ? regenerateButton.replace('sotl-button', 'sotl-button" style="min-height: 28px; font-size: 12px; padding: 0 8px; height: 28px;') : '',
    '  </footer>',
    '</section>',
  ].filter(Boolean).join('\n');

  if (!overlay.isConnected) doc.body.append(overlay);
}

function bindRootEvents(root: HTMLElement): void {
  if (rootListenerCleanups.has(root)) return;
  const click = (event: Event) => handleDrawerEvent(event);
  const change = (event: Event) => handleDrawerEvent(event);
  const toggle = (event: Event) => handleDrawerEvent(event);
  root.addEventListener('click', click);
  root.addEventListener('change', change);
  root.addEventListener('toggle', toggle, true);
  const cleanup = () => {
    root.removeEventListener('click', click);
    root.removeEventListener('change', change);
    root.removeEventListener('toggle', toggle, true);
    rootListenerCleanups.delete(root);
  };
  rootListenerCleanups.set(root, cleanup);
  cleanupFns.push(cleanup);
}

function registerDrawer(ctx: FrontendContext): void {
  const ui = getUi(ctx);
  const register = ui.registerDrawerTab ?? ui.registerTab ?? ui.addDrawerTab;
  const html = renderDrawer(state, uiStatus());
  if (typeof register === 'function') {
    try {
    const result = (register as (definition: Record<string, unknown>) => PlacementHandle | void)({
      id: 'loom_keeper',
      title: 'Track',
      shortName: 'Track',
      headerTitle: 'Track',
      description: 'Open the Loom Keeper tracker HUD',
      keywords: ['state', 'loom', 'tracker', 'continuity', 'roleplay'],
      iconSvg: pawIconSvg,
    });
    drawerHandle = result ?? null;
    if (isRecord(result) && isElement(result.root)) {
      drawerRoot = result.root;
      bindRootEvents(drawerRoot);
      renderInto(drawerRoot, html);
      return;
    }
    if (drawerHandle?.update) drawerHandle.update(html);
    return;
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      console.warn?.(`Loom Keeper drawer registration failed: ${text}`);
    }
  }
  const doc = documentRef();
  if (!doc) return;
  fallbackRoot = doc.createElement('div');
  fallbackRoot.dataset.sotlDrawerFallback = 'true';
  bindRootEvents(fallbackRoot);
  fallbackRoot.innerHTML = html;
  doc.body.append(fallbackRoot);
}

function registerSettingsMount(ctx: FrontendContext): void {
  const mount = getUi(ctx).mount;
  if (typeof mount !== 'function') return;
  try {
    const result = (mount as (name: string) => PlacementHandle | HTMLElement | void)('settings_extensions');
    if (isElement(result)) {
      settingsRoot = result;
      bindRootEvents(settingsRoot);
      renderInto(settingsRoot, renderSettingsPanel(state, uiStatus()));
      return;
    }
    if (isRecord(result) && isElement(result.root)) {
      settingsHandle = result;
      settingsRoot = result.root;
      bindRootEvents(settingsRoot);
      renderInto(settingsRoot, renderSettingsPanel(state, uiStatus()));
    }
  } catch {
    // Older Lumiverse builds may not expose settings_extensions; the drawer remains available.
  }
}

function registerInputActions(ctx: FrontendContext): void {
  void ctx;
  // v1.0.21 stability pass: keep Loom Keeper out of the composer/input bar.
}

function activateDrawer(): void {
  setDrawerOpenState(true);
  const launcher = documentRef()?.querySelector<HTMLElement>('.sotl-chat-panel-container');
  if (launcher) {
    launcher.hidden = true;
    launcher.setAttribute('aria-hidden', 'true');
  }
  if (drawerHandle?.activate) {
    drawerHandle.activate();
  }
  const doc = documentRef();
  if (doc) {
    setTimeout(() => {
      const currentLoom = doc.querySelector('[data-sotl-focused-tracker="true"]')
        ?? doc.querySelector('.sotl-card')
        ?? doc.querySelector('[data-sotl-card="true"]')
        ?? drawerRoot?.querySelector('.sotl-card');
      if (currentLoom) {
        currentLoom.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (currentLoom instanceof HTMLElement) currentLoom.focus?.();
      } else {
        drawerRoot?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        fallbackRoot?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  }
}

function activateHudTarget(): void {
  if (isMobileViewport()) {
    const resolved = state ? resolveActiveTrackerForState(state) : { tracker: null };
    const messageId = resolved.tracker?.messageId ?? state?.diagnostics.swipeReport?.activeMessageId;
    if (messageId) {
      openTrackerPreview(messageId, resolved.tracker?.swipeId ?? state?.diagnostics.swipeReport?.activeSwipeId);
      return;
    }
    lastToast = {
      level: 'info',
      message: 'Open the Track tab for settings; mobile drawer opening is disabled from the HUD to avoid layout splits.',
    };
    rerender();
    return;
  }
  activateDrawer();
}

function paint(status: LoomUiStatus): void {
  if (state && state.latestTracker && state.diagnostics.pipelineReport) {
    try {
      const render = renderTrackerForState(state.latestTracker, state);
      const report = state.diagnostics.pipelineReport;
      report.fallbackUsed = render.fallbackUsed;
      report.renderSuccess = render.success;
      report.sanitizerRemovedContent = render.sanitizerRemovedContent;
      report.templateMode = render.templateMode;
      report.preservedData = render.preservedData;
      report.templateCompatibility = render.compatibility;
      report.renderWarning = render.warning;
      report.renderError = render.error;
      report.trackerPresetId = state.latestTracker.presetId;
    } catch {
      // Ignored
    }
  }

  const doc = documentRef();
  const restoreRoot = drawerRoot ?? settingsRoot ?? fallbackRoot ?? doc;
  const snapshot = captureUiState(restoreRoot);
  const drawerHtml = renderDrawer(state, status);
  const settingsHtml = renderSettingsPanel(state, status);

  renderInto(drawerRoot, drawerHtml);
  renderInto(settingsRoot, settingsHtml);
  if (drawerHandle?.update) drawerHandle.update(drawerHtml);
  if (settingsHandle?.update) settingsHandle.update(settingsHtml);
  if (fallbackRoot) fallbackRoot.innerHTML = drawerHtml;

  restoreUiState(drawerRoot ?? fallbackRoot ?? doc, snapshot);
  restoreUiState(settingsRoot ?? doc, snapshot);
}

function updateMessageCardStatus(): void {
  if (contextRef) {
    let cardStatus = '';
    let pawStatus = '';

    try {
      const cardResult = mountMessageCards(contextRef, state);
      cardStatus = cardResult.status;
    } catch (err) {
      console.warn('Loom Keeper: mountMessageCards failed', err);
      cardStatus = 'Cards failed to mount';
    }

    ignoreMessageActionMutationsUntil = Date.now() + 250;

    try {
      const pawResult = mountMessageTrackerActions(contextRef, state);
      pawStatus = pawResult.status;
    } catch (err) {
      console.warn('Loom Keeper: mountMessageTrackerActions failed', err);
      pawStatus = 'Tracker actions failed to mount';
    }

    lastRenderStatus = [cardStatus, pawStatus].filter(Boolean).join(' ');

    try {
      ensureFloatingButton(contextRef, state);
    } catch (err) {
      console.warn('Loom Keeper: ensureFloatingButton failed', err);
    }

    try {
      ensureChatLoomPanel(contextRef, state);
    } catch (err) {
      console.warn('Loom Keeper: ensureChatLoomPanel failed', err);
    }
  }
}

function rerender(): void {
  const before = uiStatus();
  paint(before);
  updateMessageCardStatus();
  renderTrackerPreviewOverlay();
  if (lastRenderStatus !== before.lastRenderStatus) paint(uiStatus());
}

function scheduleMessageCardRetry(): void {
  if (messageCardRetryTimer !== undefined && typeof globalThis.clearTimeout === 'function') {
    globalThis.clearTimeout(messageCardRetryTimer);
  }
  if (typeof globalThis.setTimeout !== 'function') return;
  messageCardRetryTimer = globalThis.setTimeout(() => {
    messageCardRetryTimer = undefined;
    updateMessageCardStatus();
    paint(uiStatus());
  }, 400);
}

function pulseSettingsSaved(): void {
  lastSettingsSavedAt = Date.now();
  if (settingsSavedTimer !== undefined && typeof globalThis.clearTimeout === 'function') {
    globalThis.clearTimeout(settingsSavedTimer);
  }
  if (typeof globalThis.setTimeout !== 'function') return;
  settingsSavedTimer = globalThis.setTimeout(() => {
    settingsSavedTimer = undefined;
    lastSettingsSavedAt = undefined;
    paint(uiStatus());
  }, 1600);
}

function saveSettings(patch: Partial<LoomSettings>): void {
  if (!contextRef) return;
  if (state) {
    state = { ...state, settings: { ...state.settings, ...patch } };
    pulseSettingsSaved();
    paint(uiStatus());
  }
  postToBackend(contextRef, { type: 'save_settings', settings: patch });
}

function handleDrawerEvent(event: Event): void {
  const markedEvent = event as Event & { __sotlHandled?: boolean };
  if (markedEvent.__sotlHandled) return;
  const target = event.target as HTMLElement | null;
  if (event.type === 'toggle') {
    const section = target?.closest?.('details[data-sotl-section]') as HTMLDetailsElement | null;
    if (section?.dataset.sotlSection) {
      setUiSectionOpen(section.dataset.sotlSection, section.open);
    }
    return;
  }
  if (!target || !contextRef) return;
  const actionButton = target.closest<HTMLElement>('[data-sotl-action]');
  if (actionButton) {
    markedEvent.__sotlHandled = true;
    const action = actionButton.dataset.sotlAction || '';
    if (action === 'open-drawer') activateDrawer();
    if (action === 'clear-focused-tracker') {
      clearFocusedTrackerRef();
      rerender();
      return;
    }
    if (action === 'message-paw') {
      const messageId = actionButton.dataset.sotlMessageId;
      const actionSwipeId = datasetSwipeId(actionButton);
      openTrackerPreview(messageId, actionSwipeId);
      return;
    }
    if (action === 'close-tracker-preview') {
      closeTrackerPreview();
      return;
    }
    if (action === 'preview-open-drawer') {
      if (trackerPreviewRef) {
        const resolved = resolveTrackerForMessageSwipe(state, trackerPreviewRef.messageId, trackerPreviewRef.swipeId);
        setFocusedTrackerRef({
          messageId: trackerPreviewRef.messageId,
          swipeId: resolved.swipeId,
          notice: resolved.notice,
        });
        closeTrackerPreview();
        rerender();
        activateDrawer();
      }
      return;
    }
    if (action === 'preview-copy-json') {
      if (trackerPreviewRef) {
        const resolved = resolveTrackerForMessageSwipe(state, trackerPreviewRef.messageId, trackerPreviewRef.swipeId);
        if (resolved.tracker) {
          const jsonText = JSON.stringify(resolved.tracker, null, 2);
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(jsonText).catch((err) => console.error('Failed to copy preview JSON:', err));
          }
        }
      }
      return;
    }
    if (action === 'preview-regenerate') {
      if (state?.generation.running) {
        markGenerationStopping();
        postToBackend(contextRef, { type: 'cancel_generation' });
        renderTrackerPreviewOverlay();
        rerender();
        return;
      }
      const messageId = actionButton.dataset.sotlMessageId || trackerPreviewRef?.messageId;
      const actionSwipeId = datasetSwipeId(actionButton) ?? trackerPreviewRef?.swipeId;
      markGenerationPending('Generating tracker for this message...');
      postToBackend(contextRef, { type: 'generate_tracker', messageId, swipeId: actionSwipeId });
      renderTrackerPreviewOverlay();
      rerender();
      startBackendTimer();
      return;
    }
    if (action === 'view-tracker') {
      const messageId = actionButton.dataset.sotlMessageId;
      const actionSwipeId = datasetSwipeId(actionButton);
      const resolved = resolveTrackerForMessageSwipe(state, messageId, actionSwipeId);
      if (messageId) {
        setFocusedTrackerRef({
          messageId,
          swipeId: typeof actionSwipeId === 'number' ? actionSwipeId : resolved.swipeId,
          notice: resolved.notice,
        });
      }
      rerender();
      return;
    }
    if (action === 'generate') {
      if (state?.generation.running) {
        markGenerationStopping();
        postToBackend(contextRef, { type: 'cancel_generation' });
      } else {
        markGenerationPending('Generating tracker...');
        postToBackend(contextRef, { type: 'generate_tracker' });
      }
      rerender();
      return;
    }
    if (action === 'cancel-generation') {
      markGenerationStopping();
      postToBackend(contextRef, { type: 'cancel_generation' });
      rerender();
      return;
    }
    if (action === 'refresh') requestBackendState({ type: 'refresh_state' });
    if (action === 'reset-storage') {
      const confirmFn = typeof globalThis.confirm === 'function' ? globalThis.confirm : null;
      if (confirmFn && !confirmFn('Reset Loom Keeper settings, presets, and trackers for this user?')) return;
      postToBackend(contextRef, { type: 'reset_storage' });
      startBackendTimer();
    }
    const actionSwipeId = datasetSwipeId(actionButton);
    if (action.startsWith('regenerate:')) {
      if (state?.generation.running) {
        markGenerationStopping();
        postToBackend(contextRef, { type: 'cancel_generation' });
      } else {
        markGenerationPending('Regenerating tracker...');
        postToBackend(contextRef, { type: 'generate_tracker', messageId: action.slice('regenerate:'.length), swipeId: actionSwipeId });
      }
      rerender();
    }
    if (action.startsWith('hide:') && state?.activeChat.id) postToBackend(contextRef, { type: 'hide_tracker', chatId: state.activeChat.id, messageId: action.slice('hide:'.length), swipeId: actionSwipeId, hidden: true });
    if (action.startsWith('delete:') && state?.activeChat.id) postToBackend(contextRef, { type: 'delete_tracker', chatId: state.activeChat.id, messageId: action.slice('delete:'.length), swipeId: actionSwipeId });
    if (action === 'card-regenerate') {
      if (state?.generation.running) {
        markGenerationStopping();
        postToBackend(contextRef, { type: 'cancel_generation' });
      } else {
        markGenerationPending('Regenerating tracker...');
        postToBackend(contextRef, { type: 'generate_tracker', messageId: actionButton.dataset.sotlMessageId, swipeId: actionSwipeId });
      }
      rerender();
    }
    if (action === 'card-edit') activateDrawer();
    if (action === 'card-hide' && state?.activeChat.id) postToBackend(contextRef, { type: 'hide_tracker', chatId: state.activeChat.id, messageId: actionButton.dataset.sotlMessageId, swipeId: actionSwipeId, hidden: true });
    if (action === 'card-delete' && state?.activeChat.id) postToBackend(contextRef, { type: 'delete_tracker', chatId: state.activeChat.id, messageId: actionButton.dataset.sotlMessageId, swipeId: actionSwipeId });
    const activeJsonTracker = resolveActiveJsonTracker();
    if (action === 'save-json' && activeJsonTracker) {
      const doc = documentRef();
      const textarea = doc?.querySelector<HTMLTextAreaElement>('[data-sotl-field="latestJson"]');
      if (!textarea) return;
      try {
        const parsed: unknown = JSON.parse(textarea.value);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Tracker JSON must be an object.');
        postToBackend(contextRef, {
          type: 'edit_tracker',
          tracker: {
            ...activeJsonTracker,
            data: parsed as Record<string, unknown>,
          },
        });
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        const alertFn = typeof globalThis.alert === 'function' ? globalThis.alert : null;
        alertFn?.(`Loom Keeper JSON edit failed: ${text}`);
      }
    }

    if (action === 'copy-json' && activeJsonTracker) {
      const jsonText = JSON.stringify(activeJsonTracker.data, null, 2);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(jsonText)
          .then(() => {
            const alertFn = typeof globalThis.alert === 'function' ? globalThis.alert : null;
            alertFn?.('Current Loom JSON copied to clipboard.');
          })
          .catch((err) => {
            console.error('Failed to copy JSON:', err);
          });
      }
      return;
    }

    // Custom Preset Editor Action Buttons
    if (action === 'editor-new') {
      const newId = `custom_loom_${Date.now()}`;
      const newPreset = {
        id: newId,
        name: 'New Custom Loom',
        version: LOOM_VERSION,
        description: 'User custom continuity tracker.',
        mode: 'hybrid' as const,
        templateEngine: 'handlebars_compat' as const,
        sourceFormat: 'loom' as const,
        schemaJson: {
          type: 'object',
          required: ['schemaVersion', 'sceneTitle', 'location', 'time', 'mood', 'delta'],
          properties: {
            schemaVersion: { type: 'string', default: '1' },
            sceneTitle: { type: 'string', default: '' },
            location: { type: 'string', default: '' },
            time: { type: 'string', default: '' },
            mood: { type: 'string', default: '' },
            delta: { type: 'string', default: '' },
          },
        },
        htmlTemplate: [
          '<section class="sotl-card sotl-density-{{density}} sotl-theme-{{theme}}" data-sotl-card="true">',
          '  <header class="sotl-card__head">',
          '    <div class="sotl-card__header-main">',
          '      <h3 class="sotl-card__title">{{sceneTitle}}</h3>',
          '    </div>',
          '  </header>',
          '  <dl class="sotl-grid">',
          '    <div class="sotl-grid-item"><dt>Location</dt><dd>{{location}}</dd></div>',
          '  </dl>',
          '</section>',
        ].join('\n'),
        promptInstructions: 'Return valid JSON only. Do not use markdown fences. Update what changed.',
        injectionTemplate: '[Custom Loom]\n{{compactSummary}}',
        maxInjectionTokens: 150,
        defaultPlacement: 'top' as const,
        renderOptions: { density: 'compact' as const, theme: 'system' as const, showControls: true },
        parserOptions: { fenceNames: ['tracker', 'loom'], strictJson: true, repairInvalidJson: false },
        sampleData: { sceneTitle: 'New Scene', location: 'Foyer' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      selectPresetForEditing(newPreset);
      rerender();
      return;
    }

    if (action === 'editor-duplicate' && editingPreset) {
      const baseId = editingPreset.id.replace(/_copy_\d+/g, '');
      const newId = `${baseId}_copy_${Date.now()}`;
      const newPreset = {
        ...editingPreset,
        id: newId,
        name: `${editingPreset.name} Copy`,
        origin: 'duplicated' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // Save and activate atomically so generation sees the same preset as the UI.
      postToBackend(contextRef, { type: 'save_preset', preset: newPreset, makeActive: true });
      selectPresetForEditing(newPreset);
      lastToast = { level: 'success', message: `Duplicated and active preset set to custom duplicate '${newPreset.name}'.` };
      rerender();
      return;
    }

    if (action === 'editor-save' && editingPreset) {
      postToBackend(contextRef, { type: 'save_preset', preset: editingPreset });
      return;
    }

    if (action === 'editor-delete' && editingPreset) {
      const confirmFn = typeof globalThis.confirm === 'function' ? globalThis.confirm : null;
      if (confirmFn && !confirmFn(`Delete custom template '${editingPreset.name}'?`)) return;
      postToBackend(contextRef, { type: 'delete_preset', presetId: editingPreset.id });
      selectPresetForEditing(null as any);
      rerender();
      return;
    }

    if (action === 'editor-reset') {
      const confirmFn = typeof globalThis.confirm === 'function' ? globalThis.confirm : null;
      if (confirmFn && !confirmFn('Are you sure you want to delete all custom templates? This cannot be undone.')) return;
      postToBackend(contextRef, { type: 'reset_presets' });
      selectPresetForEditing(null as any);
      rerender();
      return;
    }

    if (action === 'editor-preview') {
      runPreview();
      rerender();
      return;
    }

    if (action === 'editor-export' && editingPreset) {
      const jsonText = JSON.stringify(editingPreset, null, 2);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(jsonText)
          .then(() => {
            const alertFn = typeof globalThis.alert === 'function' ? globalThis.alert : null;
            alertFn?.('Template JSON copied to clipboard.');
          })
          .catch((err) => {
            console.error('Failed to copy template JSON:', err);
          });
      }
      return;
    }

    if (action === 'editor-download' && editingPreset) {
      try {
        const jsonText = JSON.stringify(editingPreset, null, 2);
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${editingPreset.id}.json`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
      } catch (err) {
        console.error('Failed to download template:', err);
      }
      return;
    }

    if (action === 'editor-download-all') {
      try {
        const customPresets = state?.presets.filter((p) => !builtInPresets.some((bp) => bp.id === p.id)) ?? [];
        if (customPresets.length === 0) {
          const alertFn = typeof globalThis.alert === 'function' ? globalThis.alert : null;
          alertFn?.('No custom templates to download.');
          return;
        }
        const jsonText = JSON.stringify({ presets: customPresets }, null, 2);
        const blob = new Blob([jsonText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'loom-custom-templates.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
      } catch (err) {
        console.error('Failed to download custom templates pack:', err);
      }
      return;
    }

    if (action === 'editor-upload-single') {
      const doc = documentRef();
      const fileInput = doc?.getElementById('sotl-upload-single') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
        fileInput.click();
      } else {
        setImportStatus({ ok: false, message: 'File upload is unavailable in this environment. Use the Paste import instead.' });
        rerender();
      }
      return;
    }

    if (action === 'editor-upload-pack') {
      const doc = documentRef();
      const fileInput = doc?.getElementById('sotl-upload-pack') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
        fileInput.click();
      } else {
        setImportStatus({ ok: false, message: 'File upload is unavailable in this environment. Use the Paste import instead.' });
        rerender();
      }
      return;
    }

    if (action === 'editor-import') {
      const doc = documentRef();
      // Read from the id-based paste textarea (not data-sotl-editor-field, which is reserved for live-edit fields)
      const textarea = doc?.getElementById('sotl-import-paste') as HTMLTextAreaElement | null;
      const rawText = textarea?.value?.trim() ?? '';
      if (!rawText) {
        setImportStatus({ ok: false, message: 'Paste area is empty. Paste valid template JSON above then click Import.' });
        rerender();
        return;
      }
      try {
        const parsed: unknown = JSON.parse(rawText);
        // Normalize to array: support single object, array, or { presets: [] } pack shape
        let candidates: unknown[];
        if (Array.isArray(parsed)) {
          candidates = parsed;
        } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).presets)) {
          candidates = (parsed as Record<string, unknown>).presets as unknown[];
        } else {
          candidates = [parsed];
        }
        const { presets: valid, failures } = coerceImportedPresets(candidates);
        if (valid.length === 0) {
          const failMsg = failures.length > 0 ? failures[0] : 'No valid presets found in the pasted JSON.';
          setImportStatus({ ok: false, message: failMsg });
          rerender();
          return;
        }
        // Save all valid presets; auto-select the first one
        for (let i = 0; i < valid.length; i += 1) {
          postToBackend(contextRef, { type: 'save_preset', preset: valid[i], makeActive: i === 0 });
        }
        const first = valid[0];
        selectPresetForEditing(first);
        if (textarea) textarea.value = '';
        const plural = valid.length > 1 ? `${valid.length} templates` : `"${first.name}"`;
        const failNote = failures.length > 0 ? ` (${failures.length} item(s) skipped — missing required fields)` : '';
        setImportStatus({
          ok: true,
          message: `Imported ${plural} successfully. Now auto-selected as active preset.${failNote}`,
          presetName: first.name,
          presetId: first.id,
        });
        rerender();
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        setImportStatus({ ok: false, message: `JSON parse error: ${text}` });
        rerender();
      }
      return;
    }

    return;
  }

  // File input change handlers — file inputs use data-sotl-file-action to avoid collision with click routing
  if (event.type === 'change' && target instanceof HTMLInputElement && target.type === 'file') {
    const fileAction = target.dataset.sotlFileAction || target.getAttribute('data-sotl-file-action') || '';
    const file = target.files?.[0];
    if (!file || !contextRef) {
      setImportStatus({ ok: false, message: 'No file was selected or file upload is unavailable.' });
      rerender();
      return;
    }
    markedEvent.__sotlHandled = true;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : '';
        const parsed: unknown = JSON.parse(text);
        // Normalize: single preset, array, or pack { presets: [] }
        let candidates: unknown[];
        if (fileAction === 'file-upload-pack') {
          if (Array.isArray(parsed)) {
            candidates = parsed;
          } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).presets)) {
            candidates = (parsed as Record<string, unknown>).presets as unknown[];
          } else {
            candidates = [parsed];
          }
        } else {
          // Single file: support single object, array, or pack
          if (Array.isArray(parsed)) {
            candidates = parsed;
          } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as Record<string, unknown>).presets)) {
            candidates = (parsed as Record<string, unknown>).presets as unknown[];
          } else {
            candidates = [parsed];
          }
        }
        const { presets: valid, failures } = coerceImportedPresets(candidates);
        if (valid.length === 0) {
          const failMsg = failures.length > 0 ? failures[0] : 'No valid presets found in the file.';
          setImportStatus({ ok: false, message: failMsg });
          rerender();
          target.value = '';
          return;
        }
        for (let i = 0; i < valid.length; i += 1) {
          if (contextRef) postToBackend(contextRef, { type: 'save_preset', preset: valid[i], makeActive: i === 0 });
        }
        const first = valid[0];
        selectPresetForEditing(first);
        const plural = valid.length > 1 ? `${valid.length} templates` : `"${first.name}"`;
        const failNote = failures.length > 0 ? ` (${failures.length} skipped — missing fields)` : '';
        setImportStatus({
          ok: true,
          message: `Imported ${plural} from file. Auto-selected as active preset.${failNote}`,
          presetName: first.name,
          presetId: first.id,
        });
        rerender();
      } catch (err) {
        const text = err instanceof Error ? err.message : String(err);
        setImportStatus({ ok: false, message: `File parse error: ${text}` });
        rerender();
      }
      target.value = '';
    };
    reader.onerror = () => {
      setImportStatus({ ok: false, message: 'Failed to read the uploaded file. Please try again.' });
      rerender();
      target.value = '';
    };
    reader.readAsText(file);
    return;
  }

  const editorField = target.closest<HTMLElement>('[data-sotl-editor-field]');
  if (editorField) {
    if (event.type !== 'change') return;
    markedEvent.__sotlHandled = true;
    const fieldName = editorField.dataset.sotlEditorField || '';
    
    if (fieldName === 'selectedPresetId' && target instanceof HTMLSelectElement) {
      const preset = state?.presets.find((p) => p.id === target.value);
      if (preset) {
        selectPresetForEditing(preset);
      }
    } else if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
      updateEditingField(fieldName, target.value);
    }
    rerender();
    return;
  }

  const field = target.closest<HTMLElement>('[data-sotl-field]');
  if (!field) return;
  if (event.type !== 'change') return;
  markedEvent.__sotlHandled = true;
  const fieldName = field.dataset.sotlField;
  if (fieldName === 'enabled' && field instanceof HTMLInputElement) {
    saveSettings({ enabled: field.checked });
  }
  if (fieldName === 'preset' && field instanceof HTMLSelectElement) {
    postToBackend(contextRef, { type: 'select_preset', presetId: field.value });
  }
  if (fieldName === 'connection' && field instanceof HTMLSelectElement) {
    saveSettings({ sidecarConnectionId: field.value || undefined });
  }
  if (fieldName === 'autoGenerate' && field instanceof HTMLInputElement) {
    saveSettings({ autoGenerate: field.checked });
  }
  if (fieldName === 'promptInjectionEnabled' && field instanceof HTMLInputElement) {
    saveSettings({ promptInjectionEnabled: field.checked });
  }
  if (fieldName === 'promptInjectionMode' && field instanceof HTMLSelectElement) {
    const value = field.value as LoomSettings['promptInjectionMode'];
    if (value === 'latest_brief' || value === 'latest_plus_history') saveSettings({ promptInjectionMode: value });
  }
  if (fieldName === 'promptInjectionTokenBudget' && field instanceof HTMLSelectElement) {
    const val = parseInt(field.value, 10);
    if (!isNaN(val)) saveSettings({ promptInjectionTokenBudget: val });
  }
  if (fieldName === 'promptInjectionTrackerLimit' && field instanceof HTMLSelectElement) {
    const val = parseInt(field.value, 10);
    if (!isNaN(val)) saveSettings({ promptInjectionTrackerLimit: val });
  }
  if (fieldName === 'promptInjectionIncludeAppearance' && field instanceof HTMLInputElement) {
    saveSettings({ promptInjectionIncludeAppearance: field.checked });
  }
  if (fieldName === 'promptInjectionIncludeRules' && field instanceof HTMLInputElement) {
    saveSettings({ promptInjectionIncludeRules: field.checked });
  }
  if (fieldName === 'promptInjectionIncludeNextTurn' && field instanceof HTMLInputElement) {
    saveSettings({ promptInjectionIncludeNextTurn: field.checked });
  }
  if (fieldName === 'fallback' && field instanceof HTMLInputElement) {
    saveSettings({ useDefaultConnectionFallback: field.checked });
  }
  if (fieldName === 'floating' && field instanceof HTMLInputElement) {
    saveSettings({ showFloatingButton: field.checked });
  }
  if (fieldName === 'messageButtons' && field instanceof HTMLInputElement) {
    saveSettings({ showMessageButtons: field.checked });
  }
  if (fieldName === 'stripBlocks' && field instanceof HTMLInputElement) {
    saveSettings({ stripTrackerBlocksFromMessages: field.checked });
  }
  if (fieldName === 'useSafeRenderer' && field instanceof HTMLInputElement) {
    saveSettings({
      useSafeRenderer: field.checked,
      customTemplateMode: field.checked ? 'safe_generic' : 'trusted_layout',
    });
  }
  if (fieldName === 'customTemplateMode' && field instanceof HTMLSelectElement) {
    const value = field.value as LoomSettings['customTemplateMode'];
    if (value === 'trusted_layout' || value === 'strict_sanitized' || value === 'safe_generic') {
      saveSettings({ customTemplateMode: value, useSafeRenderer: false });
    }
  }
  if (fieldName === 'messageCardPlacement' && field instanceof HTMLSelectElement) {
    saveSettings({ messageCardPlacement: field.value as LoomSettings['messageCardPlacement'] });
  }
  if (fieldName === 'showChatHudLauncher' && field instanceof HTMLInputElement) {
    saveSettings({ showChatHudLauncher: field.checked });
  }
  if (fieldName === 'renderInMessages' && field instanceof HTMLInputElement) {
    saveSettings({ renderInMessages: field.checked });
  }
  if (fieldName === 'cardDensity' && field instanceof HTMLSelectElement) {
    saveSettings({ cardDensity: field.value as LoomSettings['cardDensity'] });
  }
  if (fieldName === 'hudDefaultView' && field instanceof HTMLSelectElement) {
    saveSettings({ hudDefaultView: field.value as LoomSettings['hudDefaultView'] });
  }
  if (fieldName === 'trackerHistoryLimit' && field instanceof HTMLSelectElement) {
    const val = parseInt(field.value, 10);
    if (!isNaN(val)) saveSettings({ trackerHistoryLimit: val });
  }
  if (fieldName === 'trackerGenerationHistoryLimit' && field instanceof HTMLSelectElement) {
    const val = parseInt(field.value, 10);
    if (!isNaN(val)) saveSettings({ trackerGenerationHistoryLimit: val });
  }
  if (fieldName === 'sidecarGenerationTimeoutMs' && field instanceof HTMLSelectElement) {
    const val = parseInt(field.value, 10);
    if (!isNaN(val)) saveSettings({ sidecarGenerationTimeoutMs: val });
  }
}

function handleBackendMessage(message: LoomBackendMessage): void {
  if (message.type === 'state') state = message.state;
  if (message.type === 'tracker_generated' || message.type === 'tracker_updated' || message.type === 'tracker_deleted' || message.type === 'tracker_error' || message.type === 'permissions_changed' || message.type === 'storage_reset') {
    state = message.state;
  }
  if (message.type === 'tracker_error') {
    lastToast = { level: 'error', message: message.message };
    lastFrontendError = message.message;
  }
  if (message.type === 'storage_reset') clearImportStatus();
  if (message.type === 'settings_saved' && state) {
    state = { ...state, settings: message.settings };
    pulseSettingsSaved();
  }
  if (message.type === 'error') lastFrontendError = message.message;
  if (message.type === 'toast') lastToast = { level: message.level, message: message.message };
  if (state) {
    backendTimedOut = false;
    clearBackendTimer();
    syncFocusedTrackerSwipe(state.activeSwipeByMessageId);
  }
  rerender();
  if (message.type === 'tracker_generated' || message.type === 'tracker_updated' || message.type === 'state') {
    scheduleMessageCardRetry();
  }
}

function registerBackendListener(ctx: FrontendContext): void {
  const backend = ctx.backend && typeof ctx.backend === 'object' ? ctx.backend as Record<string, unknown> : {};
  const on = ctx.onBackendMessage ?? backend.onMessage ?? backend.on;
  if (typeof on === 'function') {
    const unsubscribe = (on as (handler: (message: LoomBackendMessage) => void) => void | (() => void))(handleBackendMessage);
    if (typeof unsubscribe === 'function') cleanupFns.push(unsubscribe);
  }
}

function registerFrontendEvents(ctx: FrontendContext): void {
  const events = ctx.events && typeof ctx.events === 'object' ? ctx.events as Record<string, unknown> : {};
  const on = events.on;
  if (typeof on !== 'function') return;
  for (const eventName of ['CHARACTER_MESSAGE_RENDERED', 'MESSAGE_RENDERED', 'CHAT_CHANGED', 'CHAT_SWITCHED']) {
    try {
      const unsubscribe = (on as (name: string, handler: (payload?: unknown) => void) => void | (() => void))(eventName, () => {
        scheduleMessageCardRetry();
        if (eventName === 'MESSAGE_RENDERED' || eventName === 'CHAT_CHANGED' || eventName === 'CHAT_SWITCHED') {
          scheduleSwipeStateRefreshBurst();
        }
      });
      if (typeof unsubscribe === 'function') cleanupFns.push(unsubscribe);
    } catch {
      // Frontend event names vary by Lumiverse build; unsupported hooks are optional.
    }
  }
  for (const eventName of ['SWIPE_CHANGED', 'MESSAGE_SWIPE_CHANGED', 'CHAT_SWIPE_CHANGED', 'SWIPE_SELECTED', 'MESSAGE_VARIANT_CHANGED']) {
    try {
      const unsubscribe = (on as (name: string, handler: (payload?: unknown) => void) => void | (() => void))(eventName, () => {
        scheduleSwipeStateRefreshBurst();
      });
      if (typeof unsubscribe === 'function') cleanupFns.push(unsubscribe);
    } catch {
      // Frontend event names vary by Lumiverse build; unsupported hooks are optional.
    }
  }
}

export function setup(ctx: FrontendContext): () => void {
  contextRef = ctx;
  registerRerenderCallback(() => rerender());
  registerOpenDrawerCallback(() => activateHudTarget());
  installStyle(ctx);
  registerDrawer(ctx);
  registerSettingsMount(ctx);
  registerInputActions(ctx);
  registerBackendListener(ctx);
  registerFrontendEvents(ctx);

  const ui = ctx.ui && typeof ctx.ui === 'object' ? ctx.ui as Record<string, unknown> : {};
  const uiEvents = ui.events && typeof ui.events === 'object' ? ui.events as Record<string, unknown> : {};
  
  if (typeof uiEvents.onDrawerChange === 'function') {
    try {
      const unsub = (uiEvents.onDrawerChange as (handler: (payload: { open: boolean }) => void) => () => void)((payload) => {
        setDrawerOpenState(payload.open);
        rerender();
      });
      cleanupFns.push(unsub);
    } catch {
      // Optional hook
    }
  }

  if (typeof uiEvents.onSettingsChange === 'function') {
    try {
      const unsub = (uiEvents.onSettingsChange as (handler: (payload: { open: boolean }) => void) => () => void)((payload) => {
        setSettingsOpenState(payload.open);
        rerender();
      });
      cleanupFns.push(unsub);
    } catch {
      // Optional hook
    }
  }

  documentRef()?.addEventListener('click', handleDrawerEvent);
  documentRef()?.addEventListener('change', handleDrawerEvent);
  documentRef()?.addEventListener('toggle', handleDrawerEvent, true);
  const swipeClickHandler = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (target && looksLikeSwipeControl(target)) scheduleSwipeStateRefreshBurst();
  };
  documentRef()?.addEventListener('click', swipeClickHandler, true);
  documentRef()?.addEventListener('pointerup', swipeClickHandler, true);
  documentRef()?.addEventListener('touchend', swipeClickHandler, true);
  cleanupFns.push(() => documentRef()?.removeEventListener('click', swipeClickHandler, true));
  cleanupFns.push(() => documentRef()?.removeEventListener('pointerup', swipeClickHandler, true));
  cleanupFns.push(() => documentRef()?.removeEventListener('touchend', swipeClickHandler, true));
  const messageActionRefreshHandler = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    rememberMessageActionTarget(target, state);
    if (target.closest('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message-actions], [data-lv-message-actions], .message-actions, .message-action-buttons, .lv-message-actions, [role="toolbar"], [role="menu"], .context-menu, .popover')) {
      scheduleMessageCardRetry();
    }
  };
  documentRef()?.addEventListener('pointerover', messageActionRefreshHandler, true);
  documentRef()?.addEventListener('focusin', messageActionRefreshHandler, true);
  documentRef()?.addEventListener('pointerdown', messageActionRefreshHandler, true);
  documentRef()?.addEventListener('contextmenu', messageActionRefreshHandler, true);
  documentRef()?.addEventListener('touchstart', messageActionRefreshHandler, true);
  cleanupFns.push(() => documentRef()?.removeEventListener('pointerover', messageActionRefreshHandler, true));
  cleanupFns.push(() => documentRef()?.removeEventListener('focusin', messageActionRefreshHandler, true));
  cleanupFns.push(() => documentRef()?.removeEventListener('pointerdown', messageActionRefreshHandler, true));
  cleanupFns.push(() => documentRef()?.removeEventListener('contextmenu', messageActionRefreshHandler, true));
  cleanupFns.push(() => documentRef()?.removeEventListener('touchstart', messageActionRefreshHandler, true));
  const doc = documentRef();
  if (doc && typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((records) => {
      if (Date.now() < ignoreMessageActionMutationsUntil) return;
      const messageActionChanged = records.some((record) => {
        const target = record.target instanceof HTMLElement ? record.target : null;
        return Boolean(target?.closest('[data-message-id], [data-lumiverse-message-id], [data-lv-message-id], [data-chat-message-id], [data-message-actions], [data-lv-message-actions], .message-actions, .message-action-buttons, .lv-message-actions, [role="toolbar"], [role="menu"], .context-menu, .popover'));
      });
      const swipeChanged = records.some((record) => {
        const target = record.target instanceof HTMLElement ? record.target : null;
        if (!target) return false;
        const text = target.textContent || '';
        const attrText = [
          target.className,
          target.getAttribute('aria-label'),
          target.getAttribute('title'),
          target.getAttribute('data-action'),
          target.getAttribute('data-lv-action'),
        ].filter(Boolean).join(' ');
        return /\b\d+\s*\/\s*\d+\b/.test(text) || /\b(swipe|variant|alternate)\b/i.test(attrText);
      });
      const surfaceChanged = records.some((record) => {
        const target = record.target instanceof HTMLElement ? record.target : null;
        return Boolean(target?.closest('.sotl-root, .lumiverse-drawer, .drawer, [data-drawer], .settings-modal, [role="dialog"], [role="menu"], .popover, .context-menu, [data-route*="branch" i], [data-screen*="branch" i]'));
      });
      if (messageActionChanged || surfaceChanged) {
        scheduleMessageCardRetry();
      }
      if (swipeChanged) scheduleSwipeStateRefreshBurst();
    });
    observer.observe(doc.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'aria-hidden', 'data-state', 'data-open'],
    });
    cleanupFns.push(() => observer.disconnect());
  }
  if (doc && typeof globalThis.setInterval === 'function') {
    lastSwipeControlSignature = readSwipeControlSignature(doc);
    swipeDomPollTimer = globalThis.setInterval(() => {
      const currentDoc = documentRef();
      if (!currentDoc) return;
      const nextSignature = readSwipeControlSignature(currentDoc);
      if (nextSignature && nextSignature !== lastSwipeControlSignature) {
        lastSwipeControlSignature = nextSignature;
        scheduleSwipeStateRefreshBurst();
      }
    }, 1000);
    cleanupFns.push(() => {
      if (swipeDomPollTimer !== undefined && typeof globalThis.clearInterval === 'function') {
        globalThis.clearInterval(swipeDomPollTimer);
      }
      swipeDomPollTimer = undefined;
    });
  }
  postToBackend(ctx, { type: 'ready' });
  startBackendTimer();
  rerender();
  return () => {
    documentRef()?.removeEventListener('click', handleDrawerEvent);
    documentRef()?.removeEventListener('change', handleDrawerEvent);
    documentRef()?.removeEventListener('toggle', handleDrawerEvent, true);
    while (cleanupFns.length > 0) cleanupFns.pop()?.();
    drawerHandle?.destroy?.();
    settingsHandle?.destroy?.();
    clearBackendTimer();
    if (messageCardRetryTimer !== undefined && typeof globalThis.clearTimeout === 'function') globalThis.clearTimeout(messageCardRetryTimer);
    if (settingsSavedTimer !== undefined && typeof globalThis.clearTimeout === 'function') globalThis.clearTimeout(settingsSavedTimer);
    if (typeof globalThis.clearTimeout === 'function') {
      for (const timer of swipeStateRefreshBurstTimers) globalThis.clearTimeout(timer);
    }
    swipeStateRefreshBurstTimers = [];
    fallbackRoot?.remove();
    documentRef()?.querySelector('[data-sotl-dynamic-float="true"]')?.remove();
    documentRef()?.querySelector('.sotl-chat-panel-container')?.remove();
    closeTrackerPreview();
    cleanupMessageTrackerActions();
    documentRef()?.querySelectorAll('[data-sotl-mounted="true"]').forEach((node) => node.remove());
    if (swipeStateRefreshTimer !== undefined && typeof globalThis.clearTimeout === 'function') globalThis.clearTimeout(swipeStateRefreshTimer);
    rootListenerCleanups.clear();
  };
}
