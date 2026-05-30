import type { LoomBackendMessage, LoomFrontendMessage, LoomFrontendState, LoomSettings } from '../shared/types.js';
import { renderDrawer } from './drawer.js';
import { ensureFloatingButton, mountMessageCards, ensureChatLoomPanel, registerRerenderCallback, setDrawerOpenState, setSettingsOpenState, registerOpenDrawerCallback } from './messageCards.js';
import { renderTrackerForState } from './rendering.js';
import { renderSettingsPanel } from './settingsPanel.js';
import { loomStyles } from './styles.js';
import type { LoomUiStatus } from './ui.js';
import { captureUiState, restoreUiState, setUiSectionOpen } from './uiState.js';
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
const cleanupFns: Array<() => void> = [];
const rootListenerCleanups = new Map<HTMLElement, () => void>();
const pawIconSvg = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M226.5 282.7c-5.5-12.8-18-20.7-31.9-20.7h-.2c-14 0-26.6 7.9-32.1 20.7l-35.3 82.5c-4 9.4-3.5 20.2 1.3 29.1 4.8 8.9 14.1 14.4 24.2 14.4h149c10.1 0 19.4-5.5 24.2-14.4 4.8-8.9 5.3-19.7 1.3-29.1l-35.3-82.5zM128 208c0-26.5-21.5-48-48-48S32 181.5 32 208s21.5 48 48 48 48-21.5 48-48zm256 0c0-26.5-21.5-48-48-48s-48 21.5-48 48 21.5 48 48 48 48-21.5 48-48zM192 96c0-26.5-21.5-48-48-48S96 69.5 96 96s21.5 48 48 48 48-21.5 48-48zm128 0c0-26.5-21.5-48-48-48s-48 21.5-48 48 21.5 48 48 48 48-21.5 48-48z"/></svg>';
let swipeStateRefreshTimer: number | undefined;

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

function looksLikeSwipeControl(target: HTMLElement): boolean {
  const control = target.closest<HTMLElement>('button, [role="button"], [data-action], [data-lv-action], [aria-label], [title]');
  if (!control) return false;
  const text = [
    control.getAttribute('aria-label'),
    control.getAttribute('title'),
    control.dataset.action,
    control.dataset.lvAction,
    control.dataset.swipeAction,
    control.textContent,
  ].filter(Boolean).join(' ');
  return /\b(swipe|variant|alternate|previous response|next response|prev response|regenerate)\b/i.test(text);
}

function datasetSwipeId(element: HTMLElement): number | undefined {
  const value = element.dataset.sotlSwipeId;
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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
      id: 'state_of_the_loom',
      title: 'Track',
      shortName: 'Track',
      headerTitle: 'Track',
      description: 'Open the State of the Loom tracker HUD',
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
    if (action === 'generate') postToBackend(contextRef, { type: 'generate_tracker' });
    if (action === 'cancel-generation') {
      postToBackend(contextRef, { type: 'cancel_generation' } as any);
      return;
    }
    if (action === 'refresh') requestBackendState({ type: 'refresh_state' });
    if (action === 'reset-storage') {
      const confirmFn = typeof globalThis.confirm === 'function' ? globalThis.confirm : null;
      if (confirmFn && !confirmFn('Reset State of the Loom settings, presets, and trackers for this user?')) return;
      postToBackend(contextRef, { type: 'reset_storage' });
      startBackendTimer();
    }
    const actionSwipeId = datasetSwipeId(actionButton);
    if (action.startsWith('regenerate:')) postToBackend(contextRef, { type: 'generate_tracker', messageId: action.slice('regenerate:'.length), swipeId: actionSwipeId });
    if (action.startsWith('hide:') && state?.activeChat.id) postToBackend(contextRef, { type: 'hide_tracker', chatId: state.activeChat.id, messageId: action.slice('hide:'.length), swipeId: actionSwipeId, hidden: true });
    if (action.startsWith('delete:') && state?.activeChat.id) postToBackend(contextRef, { type: 'delete_tracker', chatId: state.activeChat.id, messageId: action.slice('delete:'.length), swipeId: actionSwipeId });
    if (action === 'card-regenerate') postToBackend(contextRef, { type: 'generate_tracker', messageId: actionButton.dataset.sotlMessageId, swipeId: actionSwipeId });
    if (action === 'card-edit') activateDrawer();
    if (action === 'card-hide' && state?.activeChat.id) postToBackend(contextRef, { type: 'hide_tracker', chatId: state.activeChat.id, messageId: actionButton.dataset.sotlMessageId, swipeId: actionSwipeId, hidden: true });
    if (action === 'card-delete' && state?.activeChat.id) postToBackend(contextRef, { type: 'delete_tracker', chatId: state.activeChat.id, messageId: actionButton.dataset.sotlMessageId, swipeId: actionSwipeId });
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

    if (action === 'copy-json' && state?.latestTracker) {
      const jsonText = JSON.stringify(state.latestTracker.data, null, 2);
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
          scheduleSwipeStateRefresh(220);
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
        scheduleSwipeStateRefresh(80);
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
  documentRef()?.addEventListener('toggle', handleDrawerEvent, true);
  const swipeClickHandler = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (target && looksLikeSwipeControl(target)) scheduleSwipeStateRefresh(220);
  };
  documentRef()?.addEventListener('click', swipeClickHandler, true);
  cleanupFns.push(() => documentRef()?.removeEventListener('click', swipeClickHandler, true));
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
    fallbackRoot?.remove();
    documentRef()?.querySelector('[data-sotl-dynamic-float="true"]')?.remove();
    documentRef()?.querySelector('.sotl-chat-panel-container')?.remove();
    documentRef()?.querySelectorAll('[data-sotl-mounted="true"]').forEach((node) => node.remove());
    if (swipeStateRefreshTimer !== undefined && typeof globalThis.clearTimeout === 'function') globalThis.clearTimeout(swipeStateRefreshTimer);
    rootListenerCleanups.clear();
  };
}
