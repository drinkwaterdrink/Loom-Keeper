import type { LoomBackendMessage, LoomFrontendMessage, LoomFrontendState, LoomSettings } from '../shared/types.js';
import { renderDrawer } from './drawer.js';
import { ensureFloatingButton, mountMessageCards, ensureChatLoomPanel, registerRerenderCallback, setDrawerOpenState, setSettingsOpenState, registerOpenDrawerCallback } from './messageCards.js';
import { renderSettingsPanel } from './settingsPanel.js';
import { loomStyles } from './styles.js';
import type { LoomUiStatus } from './ui.js';

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
const cleanupFns: Array<() => void> = [];
const rootListenerCleanups = new Map<HTMLElement, () => void>();

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

function installStyle(ctx: FrontendContext): void {
  const dom = ctx.dom && typeof ctx.dom === 'object' ? ctx.dom as Record<string, unknown> : {};
  const addStyle = dom.addStyle ?? getUi(ctx).addStyle ?? ctx.addStyle;
  if (typeof addStyle === 'function') {
    const cleanup = (addStyle as (css: string, id?: string) => void | (() => void))(loomStyles, 'state-of-the-loom-styles');
    if (typeof cleanup === 'function') cleanupFns.push(cleanup);
    return;
  }
  const doc = documentRef();
  if (!doc || doc.getElementById('state-of-the-loom-styles')) return;
  const style = doc.createElement('style');
  style.id = 'state-of-the-loom-styles';
  style.textContent = loomStyles;
  doc.head.append(style);
  cleanupFns.push(() => style.remove());
}

function renderInto(root: HTMLElement | null, html: string): void {
  if (root) root.innerHTML = html;
}

function bindRootEvents(root: HTMLElement): void {
  if (rootListenerCleanups.has(root)) return;
  const click = (event: Event) => handleDrawerEvent(event);
  const change = (event: Event) => handleDrawerEvent(event);
  root.addEventListener('click', click);
  root.addEventListener('change', change);
  const cleanup = () => {
    root.removeEventListener('click', click);
    root.removeEventListener('change', change);
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
      id: 'state_of_the_loom',
      title: 'State of the Loom',
      shortName: 'Loom',
      headerTitle: 'Loom',
      description: 'Open the State of the Loom continuity tracker HUD',
      keywords: ['state', 'loom', 'tracker', 'continuity', 'roleplay'],
      iconSvg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h2v18H5V3Zm12 0h2v18h-2V3ZM9 5h6v2H9V5Zm0 4h6v2H9V9Zm0 4h6v2H9v-2Zm0 4h6v2H9v-2Z"/></svg>',
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
      console.warn?.(`State of the Loom drawer registration failed: ${text}`);
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
  const register = getUi(ctx).registerInputBarAction;
  if (typeof register !== 'function') return;
  try {
  const openAction = (register as (options: Record<string, unknown>) => PlacementHandle | void)({
    id: 'open_loom',
    label: 'Open Loom',
    iconSvg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 3h2v18H5V3Zm12 0h2v18h-2V3ZM9 5h6v2H9V5Zm0 4h6v2H9V9Zm0 4h6v2H9v-2Zm0 4h6v2H9v-2Z"/></svg>',
    enabled: true,
  });
  if (openAction?.onClick) cleanupFns.push(openAction.onClick(() => activateDrawer()));
  if (openAction?.destroy) cleanupFns.push(() => openAction.destroy?.());

  const generateAction = (register as (options: Record<string, unknown>) => PlacementHandle | void)({
    id: 'generate_loom_tracker',
    label: 'Generate Loom',
    iconSvg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l1.5 5.1L19 8l-4.4 3.3L16 17l-4-3-4 3 1.4-5.7L5 8l5.5-.9L12 2Zm-7 15h14v2H5v-2Z"/></svg>',
    enabled: true,
  });
  if (generateAction?.onClick) cleanupFns.push(generateAction.onClick(() => {
    if (contextRef) postToBackend(contextRef, { type: 'generate_tracker' });
  }));
  if (generateAction?.destroy) cleanupFns.push(() => generateAction.destroy?.());
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    console.warn?.(`State of the Loom input action registration failed: ${text}`);
  }
}

function activateDrawer(): void {
  if (drawerHandle?.activate) {
    drawerHandle.activate();
  }
  const doc = documentRef();
  if (doc) {
    setTimeout(() => {
      const currentLoom = doc.querySelector('.sotl-card') 
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

function paint(status: LoomUiStatus): void {
  renderInto(drawerRoot, renderDrawer(state, status));
  renderInto(settingsRoot, renderSettingsPanel(state, status));
  if (drawerHandle?.update) drawerHandle.update(renderDrawer(state, status));
  if (settingsHandle?.update) settingsHandle.update(renderSettingsPanel(state, status));
  if (fallbackRoot) fallbackRoot.innerHTML = renderDrawer(state, status);
}

function updateMessageCardStatus(): void {
  if (contextRef) {
    const result = mountMessageCards(contextRef, state);
    lastRenderStatus = result.status;
    ensureFloatingButton(contextRef, state);
    ensureChatLoomPanel(contextRef, state);
  }
}

function rerender(): void {
  const before = uiStatus();
  paint(before);
  updateMessageCardStatus();
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

function saveSettings(patch: Partial<LoomSettings>): void {
  if (!contextRef) return;
  postToBackend(contextRef, { type: 'save_settings', settings: patch });
}

function handleDrawerEvent(event: Event): void {
  const markedEvent = event as Event & { __sotlHandled?: boolean };
  if (markedEvent.__sotlHandled) return;
  const target = event.target as HTMLElement | null;
  if (!target || !contextRef) return;
  const actionButton = target.closest<HTMLElement>('[data-sotl-action]');
  if (actionButton) {
    markedEvent.__sotlHandled = true;
    const action = actionButton.dataset.sotlAction || '';
    if (action === 'open-drawer') activateDrawer();
    if (action === 'generate') postToBackend(contextRef, { type: 'generate_tracker' });
    if (action === 'refresh') requestBackendState({ type: 'refresh_state' });
    if (action === 'reset-storage') {
      const confirmFn = typeof globalThis.confirm === 'function' ? globalThis.confirm : null;
      if (confirmFn && !confirmFn('Reset State of the Loom settings, presets, and trackers for this user?')) return;
      postToBackend(contextRef, { type: 'reset_storage' });
      startBackendTimer();
    }
    if (action.startsWith('regenerate:')) postToBackend(contextRef, { type: 'generate_tracker', messageId: action.slice('regenerate:'.length) });
    if (action.startsWith('hide:') && state?.activeChat.id) postToBackend(contextRef, { type: 'hide_tracker', chatId: state.activeChat.id, messageId: action.slice('hide:'.length), hidden: true });
    if (action.startsWith('delete:') && state?.activeChat.id) postToBackend(contextRef, { type: 'delete_tracker', chatId: state.activeChat.id, messageId: action.slice('delete:'.length) });
    if (action === 'card-regenerate') postToBackend(contextRef, { type: 'generate_tracker', messageId: actionButton.dataset.sotlMessageId });
    if (action === 'card-edit') activateDrawer();
    if (action === 'card-hide' && state?.activeChat.id) postToBackend(contextRef, { type: 'hide_tracker', chatId: state.activeChat.id, messageId: actionButton.dataset.sotlMessageId, hidden: true });
    if (action === 'card-delete' && state?.activeChat.id) postToBackend(contextRef, { type: 'delete_tracker', chatId: state.activeChat.id, messageId: actionButton.dataset.sotlMessageId });
    if (action === 'save-json' && state?.latestTracker) {
      const doc = documentRef();
      const textarea = doc?.querySelector<HTMLTextAreaElement>('[data-sotl-field="latestJson"]');
      if (!textarea) return;
      try {
        const parsed: unknown = JSON.parse(textarea.value);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Tracker JSON must be an object.');
        postToBackend(contextRef, {
          type: 'edit_tracker',
          tracker: {
            ...state.latestTracker,
            data: parsed as Record<string, unknown>,
          },
        });
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        const alertFn = typeof globalThis.alert === 'function' ? globalThis.alert : null;
        alertFn?.(`State of the Loom JSON edit failed: ${text}`);
      }
    }
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
}

function handleBackendMessage(message: LoomBackendMessage): void {
  if (message.type === 'state') state = message.state;
  if (message.type === 'tracker_generated' || message.type === 'tracker_updated' || message.type === 'tracker_deleted' || message.type === 'tracker_error' || message.type === 'permissions_changed' || message.type === 'storage_reset') {
    state = message.state;
  }
  if (message.type === 'settings_saved' && state) state = { ...state, settings: message.settings };
  if (message.type === 'error') lastFrontendError = message.message;
  if (message.type === 'toast') lastToast = { level: message.level, message: message.message };
  if (state) {
    backendTimedOut = false;
    clearBackendTimer();
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
  registerOpenDrawerCallback(() => activateDrawer());
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
  postToBackend(ctx, { type: 'ready' });
  startBackendTimer();
  rerender();
  return () => {
    documentRef()?.removeEventListener('click', handleDrawerEvent);
    documentRef()?.removeEventListener('change', handleDrawerEvent);
    while (cleanupFns.length > 0) cleanupFns.pop()?.();
    drawerHandle?.destroy?.();
    settingsHandle?.destroy?.();
    clearBackendTimer();
    if (messageCardRetryTimer !== undefined && typeof globalThis.clearTimeout === 'function') globalThis.clearTimeout(messageCardRetryTimer);
    fallbackRoot?.remove();
    documentRef()?.querySelector('[data-sotl-dynamic-float="true"]')?.remove();
    documentRef()?.querySelector('.sotl-chat-panel-container')?.remove();
    documentRef()?.querySelectorAll('[data-sotl-mounted="true"]').forEach((node) => node.remove());
    rootListenerCleanups.clear();
  };
}
