/**
 * message-action-smoke.mjs
 * DOM simulation tests for per-message Tracker History button.
 * Tests in-host toolbars, portal/global toolbars, untracked messages,
 * MutationObserver idempotency, and mobile-style floating toolbars.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import * as esbuild from 'esbuild';
import { parseHTML } from 'linkedom';

// ---- Helpers ----

async function importBundled(entryPoint) {
  const root = process.cwd();
  const result = await esbuild.build({
    absWorkingDir: root,
    entryPoints: [path.resolve(root, entryPoint)],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'es2020',
    write: false,
    define: {
      'globalThis.matchMedia': 'undefined',
    },
  });
  const code = result.outputFiles[0].text;
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  return import(url);
}

function setupDOM(html = '<html><head></head><body></body></html>') {
  const { document, HTMLElement, MutationObserver } = parseHTML(html);
  // Inject globals required by messageCards.ts
  globalThis.document = document;
  globalThis.HTMLElement = HTMLElement;
  globalThis.MutationObserver = MutationObserver;

  // Patch getBoundingClientRect: linkedom has no layout engine,
  // so we return non-zero rects for "visible" elements and zero for hidden ones.
  const origProto = Object.getPrototypeOf(document.createElement('div'));
  if (!origProto._patchedGetBCR) {
    origProto._patchedGetBCR = true;
    origProto.getBoundingClientRect = function () {
      const style = this.getAttribute('style') || '';
      const isHidden = /display\s*:\s*none/i.test(style);
      if (isHidden) return { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 };
      // Return a plausible non-zero rect
      return { x: 10, y: 10, width: 200, height: 40, top: 10, right: 210, bottom: 50, left: 10 };
    };
  }

  // Patch getComputedStyle for visibility checks
  if (typeof globalThis.getComputedStyle === 'undefined' || !globalThis._patchedGCS) {
    globalThis._patchedGCS = true;
    globalThis.getComputedStyle = function (el) {
      const style = el.getAttribute?.('style') || '';
      const displayMatch = style.match(/display\s*:\s*([^;]+)/i);
      const visibilityMatch = style.match(/visibility\s*:\s*([^;]+)/i);
      const opacityMatch = style.match(/opacity\s*:\s*([^;]+)/i);
      return {
        display: displayMatch ? displayMatch[1].trim() : 'block',
        visibility: visibilityMatch ? visibilityMatch[1].trim() : 'visible',
        opacity: opacityMatch ? opacityMatch[1].trim() : '1',
        getPropertyValue: (prop) => {
          const regex = new RegExp(prop.replace(/-/g, '[-]?') + '\\s*:\\s*([^;]+)', 'i');
          const match = style.match(regex);
          return match ? match[1].trim() : '';
        },
      };
    };
  }

  return document;
}

function makeState(overrides = {}) {
  return {
    backendReady: true,
    settings: {
      activePresetId: 'default',
      renderInMessages: true,
      showFloatingButton: false,
      hudDefaultView: 'compact',
      trackerHistoryLimit: 50,
    },
    permissions: { chats: true, chat_mutation: true, generation: true, interceptor: true, app_manipulation: true },
    presets: [],
    activePreset: { id: 'default', name: 'Default' },
    activeChat: { id: 'chat-1', name: 'Test Chat' },
    connections: [],
    latestTracker: null,
    messageTrackers: [],
    activeSwipeByMessageId: {},
    chatAssistantMessages: [],
    generation: { running: false },
    diagnostics: { backendReady: true },
    ...overrides,
  };
}

function makeTracker(messageId, swipeId = undefined) {
  return {
    version: '1.0.23',
    schemaVersion: '1',
    presetId: 'default',
    chatId: 'chat-1',
    messageId,
    swipeId,
    generatedAt: new Date().toISOString(),
    source: 'sidecar_generate',
    placement: 'top',
    data: { sceneTitle: 'Test Scene', location: 'Test Location', delta: 'Test delta' },
    compactSummary: 'Test summary',
    validation: { ok: true, issues: [] },
  };
}

/** Create a standard message host with an inline toolbar */
function createMessageHostWithToolbar(doc, messageId, options = {}) {
  const host = doc.createElement('div');
  host.setAttribute('data-message-id', messageId);
  host.style.display = 'block';

  const content = doc.createElement('div');
  content.className = 'message-content';
  content.textContent = 'Hello, this is a test message.';
  host.appendChild(content);

  const toolbar = doc.createElement('div');
  toolbar.setAttribute('data-message-actions', 'true');
  toolbar.setAttribute('role', 'toolbar');
  toolbar.style.display = 'flex';

  const copyBtn = doc.createElement('button');
  copyBtn.textContent = 'Copy';
  copyBtn.setAttribute('role', 'button');
  copyBtn.style.display = 'inline-block';
  toolbar.appendChild(copyBtn);

  const editBtn = doc.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.setAttribute('role', 'button');
  editBtn.style.display = 'inline-block';
  toolbar.appendChild(editBtn);

  const deleteBtn = doc.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.setAttribute('role', 'button');
  deleteBtn.style.display = 'inline-block';
  toolbar.appendChild(deleteBtn);

  if (options.hideToolbar) {
    toolbar.style.display = 'none';
  }

  host.appendChild(toolbar);
  doc.body.appendChild(host);
  return { host, toolbar, copyBtn };
}

/** Create a portal/global toolbar outside any message host */
function createPortalToolbar(doc, options = {}) {
  const toolbar = doc.createElement('div');
  toolbar.setAttribute('data-message-actions', 'true');
  toolbar.setAttribute('role', 'toolbar');
  toolbar.style.display = 'flex';
  if (options.messageId) {
    toolbar.setAttribute('data-for-message', options.messageId);
  }

  const copyBtn = doc.createElement('button');
  copyBtn.textContent = 'Copy';
  copyBtn.setAttribute('role', 'button');
  copyBtn.style.display = 'inline-block';
  toolbar.appendChild(copyBtn);

  const editBtn = doc.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.setAttribute('role', 'button');
  editBtn.style.display = 'inline-block';
  toolbar.appendChild(editBtn);

  const deleteBtn = doc.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.setAttribute('role', 'button');
  deleteBtn.style.display = 'inline-block';
  toolbar.appendChild(deleteBtn);

  // Append directly to body (not inside a message host)
  doc.body.appendChild(toolbar);
  return { toolbar, copyBtn };
}

/** Create a mobile-style floating toolbar */
function createFloatingToolbar(doc, options = {}) {
  const overlay = doc.createElement('div');
  overlay.className = 'message-action-buttons';
  overlay.style.display = 'flex';
  overlay.style.position = 'fixed';
  overlay.style.bottom = '0';

  const copyBtn = doc.createElement('button');
  copyBtn.textContent = 'Copy';
  copyBtn.setAttribute('role', 'button');
  copyBtn.style.display = 'inline-block';
  overlay.appendChild(copyBtn);

  const forkBtn = doc.createElement('button');
  forkBtn.textContent = 'Fork chat here';
  forkBtn.setAttribute('role', 'button');
  forkBtn.style.display = 'inline-block';
  overlay.appendChild(forkBtn);

  if (options.messageId) {
    overlay.setAttribute('data-for-message', options.messageId);
  }

  doc.body.appendChild(overlay);
  return { toolbar: overlay, copyBtn };
}

// ---- Load the module under test ----

const messageCards = await importBundled('src/frontend/messageCards.ts');
const ctx = {};

// ---- Tests ----

console.log('Running message action DOM simulation tests...\n');

// TEST 1: In-host toolbar — button injected before Copy
{
  console.log('TEST 1: In-host toolbar injection');
  const doc = setupDOM();
  const { host, toolbar, copyBtn } = createMessageHostWithToolbar(doc, 'msg-001');
  const state = makeState({
    messageTrackers: [makeTracker('msg-001')],
    chatAssistantMessages: [{ id: 'msg-001', role: 'assistant', index: 0 }],
  });

  const result = messageCards.mountMessageTrackerActions(ctx, state);

  const pawBtn = toolbar.querySelector('.sotl-message-paw-btn');
  assert.ok(pawBtn, 'Paw button should be injected into toolbar');
  assert.equal(pawBtn.dataset.sotlMessageId, 'msg-001', 'Button should have correct message ID');
  assert.equal(pawBtn.dataset.sotlAction, 'message-paw', 'Button should have message-paw action');
  assert.equal(pawBtn.dataset.sotlMessagePaw, 'true', 'Button should have cleanup marker');

  // Check it's inserted before Copy
  const allButtons = Array.from(toolbar.querySelectorAll('button'));
  const pawIndex = allButtons.indexOf(pawBtn);
  const copyIndex = allButtons.indexOf(copyBtn);
  assert.ok(pawIndex < copyIndex, `Paw button (index ${pawIndex}) should be before Copy (index ${copyIndex})`);

  assert.ok(result.status.includes('Injected'), 'Status should report injection');
  console.log('  ✓ Paw button injected before Copy with correct attributes\n');
}

// TEST 2: Portal/global toolbar outside message host
{
  console.log('TEST 2: Portal/global toolbar');
  const doc = setupDOM();

  // Create a message host WITHOUT a visible toolbar
  const host = doc.createElement('div');
  host.setAttribute('data-message-id', 'msg-002');
  host.style.display = 'block';
  doc.body.appendChild(host);

  // Create a portal toolbar with explicit message-id
  const { toolbar } = createPortalToolbar(doc, { messageId: 'msg-002' });

  const state = makeState({
    messageTrackers: [makeTracker('msg-002')],
    chatAssistantMessages: [{ id: 'msg-002', role: 'assistant', index: 0 }],
  });

  const result = messageCards.mountMessageTrackerActions(ctx, state);

  const pawBtn = toolbar.querySelector('.sotl-message-paw-btn');
  assert.ok(pawBtn, 'Paw button should be injected into portal toolbar');
  assert.equal(pawBtn.dataset.sotlMessageId, 'msg-002', 'Portal button should have correct message ID');
  assert.equal(pawBtn.dataset.sotlAction, 'message-paw', 'Portal button should have message-paw action');
  assert.equal(pawBtn.dataset.sotlMountSource, 'portal', 'Button should be marked as portal-mounted');
  console.log('  ✓ Paw button injected into portal toolbar with correct attributes\n');
}

// TEST 3: In-host toolbar with hidden toolbar — no button
{
  console.log('TEST 3: Hidden toolbar — no button');
  const doc = setupDOM();
  const { host, toolbar } = createMessageHostWithToolbar(doc, 'msg-003', { hideToolbar: true });
  const state = makeState({
    chatAssistantMessages: [{ id: 'msg-003', role: 'assistant', index: 0 }],
  });

  messageCards.mountMessageTrackerActions(ctx, state);

  const pawBtn = toolbar.querySelector('.sotl-message-paw-btn');
  assert.equal(pawBtn, null, 'No paw button should be injected into hidden toolbar');
  console.log('  ✓ No button injected into hidden toolbar\n');
}

// TEST 4: Untracked message (no existing tracker)
{
  console.log('TEST 4: Untracked message — button still injected');
  const doc = setupDOM();
  const { host, toolbar } = createMessageHostWithToolbar(doc, 'msg-004');
  const state = makeState({
    messageTrackers: [], // No trackers at all
    chatAssistantMessages: [{ id: 'msg-004', role: 'assistant', index: 0 }],
  });

  messageCards.mountMessageTrackerActions(ctx, state);

  const pawBtn = toolbar.querySelector('.sotl-message-paw-btn');
  assert.ok(pawBtn, 'Paw button should be injected even without a tracker');
  assert.equal(pawBtn.dataset.sotlMessageId, 'msg-004', 'Button should have correct message ID');
  assert.equal(pawBtn.title, 'Generate Continuity State', 'Untracked message button should say "Generate Continuity State"');
  assert.ok(!pawBtn.classList.contains('sotl-message-paw-btn--has-tracker'), 'Button should not have has-tracker class');
  console.log('  ✓ Paw button injected with "Generate" title for untracked message\n');
}

// TEST 5: Message with tracker — correct title
{
  console.log('TEST 5: Tracked message — correct title');
  const doc = setupDOM();
  const { host, toolbar } = createMessageHostWithToolbar(doc, 'msg-005');
  const state = makeState({
    messageTrackers: [makeTracker('msg-005')],
    chatAssistantMessages: [{ id: 'msg-005', role: 'assistant', index: 0 }],
  });

  messageCards.mountMessageTrackerActions(ctx, state);

  const pawBtn = toolbar.querySelector('.sotl-message-paw-btn');
  assert.ok(pawBtn, 'Paw button should exist');
  assert.equal(pawBtn.title, 'View Continuity History', 'Tracked message button should say "View Continuity History"');
  assert.ok(pawBtn.classList.contains('sotl-message-paw-btn--has-tracker'), 'Button should have has-tracker class');
  console.log('  ✓ Paw button has "View" title for tracked message\n');
}

// TEST 6: Repeated mounts — no duplicate buttons (idempotency)
{
  console.log('TEST 6: Idempotency — no duplicates after repeated mounts');
  const doc = setupDOM();
  const { host, toolbar } = createMessageHostWithToolbar(doc, 'msg-006');
  const state = makeState({
    messageTrackers: [makeTracker('msg-006')],
    chatAssistantMessages: [{ id: 'msg-006', role: 'assistant', index: 0 }],
  });

  // Mount 5 times
  for (let i = 0; i < 5; i++) {
    messageCards.mountMessageTrackerActions(ctx, state);
  }

  const pawButtons = toolbar.querySelectorAll('.sotl-message-paw-btn');
  assert.equal(pawButtons.length, 1, `Should have exactly 1 paw button after 5 mounts, got ${pawButtons.length}`);
  console.log('  ✓ No duplicate buttons after 5 repeated mounts\n');
}

// TEST 7: Multiple message hosts — only visible toolbar gets button
{
  console.log('TEST 7: Multiple hosts — button only on visible toolbar');
  const doc = setupDOM();
  const { toolbar: toolbar1 } = createMessageHostWithToolbar(doc, 'msg-007a');
  const { toolbar: toolbar2 } = createMessageHostWithToolbar(doc, 'msg-007b', { hideToolbar: true });
  const { toolbar: toolbar3 } = createMessageHostWithToolbar(doc, 'msg-007c');

  const state = makeState({
    messageTrackers: [makeTracker('msg-007a'), makeTracker('msg-007c')],
    chatAssistantMessages: [
      { id: 'msg-007a', role: 'assistant', index: 0 },
      { id: 'msg-007b', role: 'assistant', index: 1 },
      { id: 'msg-007c', role: 'assistant', index: 2 },
    ],
  });

  messageCards.mountMessageTrackerActions(ctx, state);

  assert.ok(toolbar1.querySelector('.sotl-message-paw-btn'), 'Visible toolbar 1 should get button');
  assert.equal(toolbar2.querySelector('.sotl-message-paw-btn'), null, 'Hidden toolbar 2 should not get button');
  assert.ok(toolbar3.querySelector('.sotl-message-paw-btn'), 'Visible toolbar 3 should get button');
  console.log('  ✓ Buttons only on visible toolbars\n');
}

// TEST 8: Mobile-style floating toolbar (outside message host)
{
  console.log('TEST 8: Mobile-style floating toolbar');
  const doc = setupDOM();

  // Message host exists but no internal toolbar
  const host = doc.createElement('div');
  host.setAttribute('data-message-id', 'msg-008');
  host.style.display = 'block';
  doc.body.appendChild(host);

  // Floating toolbar directly on body with message ID
  const { toolbar } = createFloatingToolbar(doc, { messageId: 'msg-008' });

  const state = makeState({
    chatAssistantMessages: [{ id: 'msg-008', role: 'assistant', index: 0 }],
  });

  messageCards.mountMessageTrackerActions(ctx, state);

  const pawBtn = toolbar.querySelector('.sotl-message-paw-btn');
  assert.ok(pawBtn, 'Paw button should be injected into mobile floating toolbar');
  assert.equal(pawBtn.dataset.sotlMessageId, 'msg-008', 'Floating toolbar button should have correct message ID');
  console.log('  ✓ Paw button injected into mobile floating toolbar\n');
}

// TEST 9: Swipe-aware button attributes
{
  console.log('TEST 9: Swipe-aware button attributes');
  const doc = setupDOM();
  const { toolbar } = createMessageHostWithToolbar(doc, 'msg-009');
  const state = makeState({
    messageTrackers: [makeTracker('msg-009', 2)],
    activeSwipeByMessageId: { 'msg-009': 2 },
    chatAssistantMessages: [{ id: 'msg-009', role: 'assistant', swipeId: 2, index: 0 }],
  });

  messageCards.mountMessageTrackerActions(ctx, state);

  const pawBtn = toolbar.querySelector('.sotl-message-paw-btn');
  assert.ok(pawBtn, 'Button should exist');
  assert.equal(pawBtn.dataset.sotlSwipeId, '2', 'Button should carry active swipe ID');
  console.log('  ✓ Swipe ID correctly set on button\n');
}

// TEST 10: Diagnostics are populated
{
  console.log('TEST 10: Diagnostics populated after mount');
  const doc = setupDOM();
  createMessageHostWithToolbar(doc, 'msg-010');
  const state = makeState({
    chatAssistantMessages: [{ id: 'msg-010', role: 'assistant', index: 0 }],
  });

  messageCards.mountMessageTrackerActions(ctx, state);

  const diag = messageCards.getMessageActionDiagnostics();
  assert.ok(diag, 'Diagnostics should be available');
  assert.ok(typeof diag.messageHostsFound === 'number', 'Diagnostics should have messageHostsFound');
  assert.ok(typeof diag.inHostToolbarsFound === 'number', 'Diagnostics should have inHostToolbarsFound');
  assert.ok(typeof diag.globalPortalToolbarsFound === 'number', 'Diagnostics should have globalPortalToolbarsFound');
  assert.ok(typeof diag.buttonsInjected === 'number', 'Diagnostics should have buttonsInjected');
  assert.ok(typeof diag.lastMountReason === 'string', 'Diagnostics should have lastMountReason');
  assert.ok(diag.messageHostsFound >= 1, 'Should have found at least 1 host');
  assert.ok(diag.inHostToolbarsFound >= 1, 'Should have found at least 1 in-host toolbar');
  assert.ok(diag.buttonsInjected >= 1, 'Should have injected at least 1 button');
  console.log(`  ✓ Diagnostics: hosts=${diag.messageHostsFound}, inHost=${diag.inHostToolbarsFound}, portal=${diag.globalPortalToolbarsFound}, btns=${diag.buttonsInjected}, reason=${diag.lastMountReason}\n`);
}

// ---- Source code structural assertions ----

console.log('Running source code structural assertions...\n');

const messageCardsSource = readFileSync('src/frontend/messageCards.ts', 'utf8');
const typesSource = readFileSync('src/shared/types.ts', 'utf8');
const frontendSource = readFileSync('src/frontend/frontend.ts', 'utf8');

// Type assertions
assert.match(typesSource, /LoomChatMessageSummary/, 'types.ts should define LoomChatMessageSummary');
assert.match(typesSource, /chatAssistantMessages/, 'LoomFrontendState should include chatAssistantMessages');

// messageCards structural assertions
assert.match(messageCardsSource, /findVisibleGlobalToolbars/, 'messageCards should have findVisibleGlobalToolbars (global toolbar scanner)');
assert.match(messageCardsSource, /lastSelectedMessageTarget/, 'messageCards should track lastSelectedMessageTarget');
assert.match(messageCardsSource, /dataset\.sotlMessagePaw = 'true'/, 'messageCards should set cleanup marker data attribute');
assert.match(messageCardsSource, /chatAssistantMessages/, 'messageCards should reference chatAssistantMessages for untracked messages');
assert.match(messageCardsSource, /getMessageActionDiagnostics/, 'messageCards should export getMessageActionDiagnostics');
assert.match(messageCardsSource, /findMessageToolbar/, 'messageCards should have findMessageToolbar (in-host path)');
assert.match(messageCardsSource, /injectPawButtonIntoToolbar/, 'messageCards should have shared injection helper');
assert.match(messageCardsSource, /PATH A.*In-Host.*Toolbar/i, 'messageCards should label Path A');
assert.match(messageCardsSource, /PATH B.*Global.*Portal/i, 'messageCards should label Path B');
assert.match(messageCardsSource, /Tracker History/, 'context menu should say "Tracker History"');
assert.match(messageCardsSource, /Open Tracker/, 'context menu code should reference "Open Tracker"');
assert.match(messageCardsSource, /mountMessageTrackerActions/, 'message paw actions should have a dedicated mount path');
assert.match(messageCardsSource, /activeSwipeByMessageId\[messageId\]/, 'message paw action should use active swipe metadata');
assert.match(messageCardsSource, /findVisibleMessageToolbars/, 'message paw should reference findVisibleMessageToolbars (legacy marker)');
assert.match(messageCardsSource, /syncFixedLauncherToStockIcon/, 'floating paw should copy fixed fallback position from stock side icon');
assert.match(messageCardsSource, /shouldShowGlobalPaw/, 'global paw should be guarded by centralized chat-screen visibility logic');

// frontend.ts assertions
assert.match(frontendSource, /getMessageActionDiagnostics/, 'frontend.ts should import and use getMessageActionDiagnostics');
assert.match(frontendSource, /message-paw/, 'frontend should route message paw actions');
assert.match(frontendSource, /MutationObserver/, 'frontend should use MutationObserver for toolbar detection');

console.log('  ✓ All source code structural assertions passed\n');
console.log('OK: message-action smoke passed');
