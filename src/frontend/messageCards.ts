import { renderTrackerHtml } from '../shared/renderer.js';
import type { LoomFrontendState, LoomTrackerState } from '../shared/types.js';
import { iconButton } from './ui.js';

type FrontendContext = Record<string, unknown>;

export interface MessageCardMountStatus {
  status: string;
  messageId?: string | undefined;
}

function documentRef(): Document | null {
  return typeof document === 'undefined' ? null : document;
}

function escapeSelector(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value);
  return value.replace(/["\\]/g, '\\$&');
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

function cardForTracker(tracker: LoomTrackerState, state: LoomFrontendState): HTMLElement | null {
  const doc = documentRef();
  if (!doc || tracker.hidden || tracker.placement === 'hidden' || tracker.placement === 'drawer' || tracker.placement === 'disabled') return null;
  const wrapper = doc.createElement('div');
  wrapper.className = 'sotl-message-card';
  wrapper.dataset.sotlMounted = 'true';
  wrapper.dataset.sotlMessageId = tracker.messageId || 'latest';
  const controls = state.settings.showMessageButtons
    ? `<div class="sotl-message-controls">${iconButton('Regenerate', 'card-regenerate', tracker.messageId || '')}${iconButton('Edit', 'card-edit', tracker.messageId || '')}${iconButton('Hide', 'card-hide', tracker.messageId || '')}${iconButton('Delete', 'card-delete', tracker.messageId || '')}</div>`
    : '';
  wrapper.innerHTML = controls + renderTrackerHtml(tracker, state.activePreset);
  return wrapper;
}

export function mountMessageCards(_ctx: FrontendContext, state: LoomFrontendState | null): MessageCardMountStatus {
  const doc = documentRef();
  if (!doc) return { status: 'Message-card renderer unavailable: no document.' };
  if (!state) return { status: 'Message-card renderer waiting for backend state.' };
  doc.querySelectorAll('[data-sotl-mounted="true"]').forEach((node) => node.remove());
  const trackers = state.messageTrackers.length > 0 ? state.messageTrackers : state.latestTracker ? [state.latestTracker] : [];
  if (trackers.length === 0) return { status: 'No tracker available for message-card mounting.' };
  let mounted = 0;
  let lastMissing: string | undefined;
  for (const tracker of trackers) {
    const host = findMessageHost(doc, tracker);
    const card = cardForTracker(tracker, state);
    if (!host || !card) {
      if (tracker.messageId) lastMissing = tracker.messageId;
      continue;
    }
    if (tracker.placement === 'bottom') host.append(card);
    else host.prepend(card);
    mounted += 1;
  }
  if (mounted > 0) return { status: `Mounted ${mounted} Loom tracker card${mounted === 1 ? '' : 's'}.` };
  if (lastMissing) return { status: `Message-card mount skipped: no stable message host found for messageId ${lastMissing}.`, messageId: lastMissing };
  return { status: 'Message-card mount skipped: tracker placement is hidden, drawer-only, or disabled.' };
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
