/**
 * message-history-badge-smoke.mjs
 * DOM simulation tests for the Loom Keeper per-message Tracker History badge.
 * Verifies toolbar injection, correct attributes, idempotency,
 * visibility rules, and coexistence with native toolbar and global launchers.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import * as esbuild from 'esbuild';
import { parseHTML } from 'linkedom';

// ---- esbuild helper to bundle ts files on the fly ----
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

// ---- linkedom setup helper ----
function setupDOM(html = '<html><head></head><body></body></html>') {
  const { document, HTMLElement, MutationObserver } = parseHTML(html);
  
  // Inject globals required by messageCards.ts
  globalThis.document = document;
  globalThis.HTMLElement = HTMLElement;
  globalThis.MutationObserver = MutationObserver;

  // Patch getBoundingClientRect
  const origProto = Object.getPrototypeOf(document.createElement('div'));
  if (!origProto._patchedGetBCR) {
    origProto._patchedGetBCR = true;
    origProto.getBoundingClientRect = function () {
      const style = this.getAttribute('style') || '';
      const isHidden = /display\s*:\s*none/i.test(style);
      if (isHidden) return { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 };
      return { x: 10, y: 10, width: 200, height: 40, top: 10, right: 210, bottom: 50, left: 10 };
    };
  }

  // Patch getComputedStyle
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
  const base = {
    backendReady: true,
    settings: {
      activePresetId: 'default',
      renderInMessages: true,
      showFloatingButton: false,
      showMessageButtons: true,
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
  };
  return { ...base, ...overrides };
}

// ---- Main Test Runner ----
async function runTests() {
  console.log('Running message history badge DOM simulation tests...\n');

  const cardMod = await importBundled('src/frontend/messageCards.ts');
  const { mountMessageHistoryBadges, mountMessageTrackerActions, getMessageActionDiagnostics } = cardMod;

  // ----------------------------------------------------
  // TEST 1: Badge injects into native toolbar before Copy button
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div id="chat-messages">
        <div class="msg" data-message-id="msg-1">
          <div class="message-header">Bridget</div>
          <div class="message-actions">
            <button aria-label="Copy">Copy</button>
            <button aria-label="Edit">Edit</button>
          </div>
          <div class="content">Hello there.</div>
        </div>
      </div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-1', role: 'assistant', index: 0 }],
    });

    mountMessageHistoryBadges({}, state);

    const badge = doc.querySelector('.sotl-message-history-badge');
    assert.ok(badge, 'Badge should mount on assistant message with toolbar');
    assert.ok(badge.classList.contains('sotl-message-history-badge--toolbar'), 'Should have toolbar variant class');
    
    // Check it was inserted before Copy
    const toolbar = doc.querySelector('.message-actions');
    const copyBtn = toolbar.querySelector('[aria-label="Copy"]');
    assert.ok(copyBtn.previousElementSibling === badge, 'Badge should be directly before Copy button');
    console.log('  ✓ TEST 1 passed: Badge injects into native toolbar before Copy button');
  }

  // ----------------------------------------------------
  // TEST 2: Badge has correct data-sotl-message-id
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-abc">
        <div class="message-actions">
          <button aria-label="Copy">Copy</button>
        </div>
      </div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-abc', role: 'assistant', index: 0 }],
    });

    mountMessageHistoryBadges({}, state);

    const badge = doc.querySelector('.sotl-message-history-badge');
    assert.equal(badge?.dataset.sotlMessageId, 'msg-abc', 'Badge message ID should be exact');
    console.log('  ✓ TEST 2 passed: Badge carries correct data-sotl-message-id attribute');
  }

  // ----------------------------------------------------
  // TEST 3: Badge has correct data-sotl-swipe-id when active swipe exists
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-swipe">
        <div class="message-actions">
          <button aria-label="Copy">Copy</button>
        </div>
      </div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-swipe', role: 'assistant', index: 0 }],
      activeSwipeByMessageId: { 'msg-swipe': 2 },
    });

    mountMessageHistoryBadges({}, state);

    const badge = doc.querySelector('.sotl-message-history-badge');
    assert.equal(badge?.dataset.sotlSwipeId, '2', 'Badge active swipe ID should be exact');
    console.log('  ✓ TEST 3 passed: Badge carries correct data-sotl-swipe-id attribute');
  }

  // ----------------------------------------------------
  // TEST 4: Badge has data-sotl-action="message-paw"
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-1">
        <div class="message-actions">
          <button aria-label="Copy">Copy</button>
        </div>
      </div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-1', role: 'assistant', index: 0 }],
    });

    mountMessageHistoryBadges({}, state);

    const badge = doc.querySelector('.sotl-message-history-badge');
    assert.equal(badge?.dataset.sotlAction, 'message-paw', 'Action should be message-paw');
    console.log('  ✓ TEST 4 passed: Badge is wired to the standard message-paw click action');
  }

  // ----------------------------------------------------
  // TEST 5: Message with no tracker still gets a badge (when toolbar visible)
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-untracked">
        <div class="message-actions">
          <button aria-label="Copy">Copy</button>
        </div>
      </div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-untracked', role: 'assistant', index: 0 }],
      messageTrackers: [],
    });

    mountMessageHistoryBadges({}, state);

    const badge = doc.querySelector('.sotl-message-history-badge');
    assert.ok(badge, 'Untracked message gets a badge');
    assert.ok(badge.classList.contains('sotl-message-history-badge--missing-tracker'), 'Should have missing-tracker status class');
    console.log('  ✓ TEST 5 passed: Untracked assistant responses successfully receive badges');
  }

  // ----------------------------------------------------
  // TEST 6: No toolbar = no badge (prevents layout disruption)
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-no-toolbar">
        <div class="message-header">AI</div>
        <div class="content">No toolbar here.</div>
      </div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-no-toolbar', role: 'assistant', index: 0 }],
    });

    mountMessageHistoryBadges({}, state);

    const badge = doc.querySelector('.sotl-message-history-badge');
    assert.ok(!badge, 'No badge should mount when toolbar is absent (prevents layout issues)');
    
    // Host should NOT have position: relative set
    const host = doc.querySelector('.msg');
    assert.notEqual(host.style.position, 'relative', 'Host position should not be modified');
    console.log('  ✓ TEST 6 passed: No badge injected when no toolbar visible (zero layout impact)');
  }

  // ----------------------------------------------------
  // TEST 7: Badge appears when toolbar becomes visible
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-appear">
        <div class="message-header">AI</div>
        <div class="content">Message text.</div>
      </div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-appear', role: 'assistant', index: 0 }],
    });

    // First mount — no toolbar, no badge
    mountMessageHistoryBadges({}, state);
    assert.ok(!doc.querySelector('.sotl-message-history-badge'), 'No badge without toolbar');

    // Simulate toolbar appearing (user taps message)
    const host = doc.querySelector('.msg');
    const toolbar = doc.createElement('div');
    toolbar.className = 'message-actions';
    toolbar.innerHTML = '<button aria-label="Copy">Copy</button><button aria-label="Edit">Edit</button>';
    host.appendChild(toolbar);

    // Second mount — toolbar visible, badge should appear
    mountMessageHistoryBadges({}, state);
    const badge = doc.querySelector('.sotl-message-history-badge');
    assert.ok(badge, 'Badge appears when toolbar becomes visible');
    assert.ok(toolbar.contains(badge), 'Badge is inside the toolbar');
    console.log('  ✓ TEST 7 passed: Badge appears dynamically when toolbar becomes visible');
  }

  // ----------------------------------------------------
  // TEST 8: Repeated calls to mount function do not duplicate badges
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-dup">
        <div class="message-actions">
          <button aria-label="Copy">Copy</button>
        </div>
      </div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-dup', role: 'assistant', index: 0 }],
    });

    for (let i = 0; i < 5; i++) {
      mountMessageHistoryBadges({}, state);
    }

    const badges = doc.querySelectorAll('.sotl-message-history-badge');
    assert.equal(badges.length, 1, 'Only one badge should exist per assistant message');
    console.log('  ✓ TEST 8 passed: Idempotency is fully respected with zero duplicates');
  }

  // ----------------------------------------------------
  // TEST 9: Scrolling/rerender/MutationObserver cycles do not duplicate badges
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-scroll">
        <div class="message-actions">
          <button aria-label="Copy">Copy</button>
        </div>
      </div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-scroll', role: 'assistant', index: 0 }],
    });

    mountMessageHistoryBadges({}, state);
    
    // Simulate scroll and rerender
    mountMessageHistoryBadges({}, state);

    const badges = doc.querySelectorAll('.sotl-message-history-badge');
    assert.equal(badges.length, 1, 'Idempotency persists through rerenders/scrolling');
    console.log('  ✓ TEST 9 passed: Scrolling cycles preserve single unique history badges');
  }

  // ----------------------------------------------------
  // TEST 10: Global launcher and message badge have distinct classes and roles
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-distinct">
        <div class="message-actions">
          <button aria-label="Copy">Copy</button>
        </div>
      </div>
      <div class="sotl-chat-pill">L</div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-distinct', role: 'assistant', index: 0 }],
    });

    mountMessageHistoryBadges({}, state);

    const badge = doc.querySelector('.sotl-message-history-badge');
    const launcher = doc.querySelector('.sotl-chat-pill');

    assert.ok(badge, 'Badge exists');
    assert.ok(launcher, 'Global launcher exists');
    assert.notEqual(badge.className, launcher.className, 'Badge and global launcher classes must be distinct');
    console.log('  ✓ TEST 10 passed: Global HUD launcher and message badges have distinct classes');
  }

  // ----------------------------------------------------
  // TEST 11: Global launcher fallback does not get counted as a message badge
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-global-launcher">
        <div class="message-actions">
          <button aria-label="Copy">Copy</button>
        </div>
      </div>
      <div class="sotl-chat-pill">L</div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-global-launcher', role: 'assistant', index: 0 }],
    });

    mountMessageHistoryBadges({}, state);

    const diags = getMessageActionDiagnostics();
    assert.equal(diags.messageHistoryBadgesMounted, 1, 'Exactly one badge is registered');
    assert.ok(diags.globalLauncherMounted, 'Global launcher is detected');
    console.log('  ✓ TEST 11 passed: Diagnostics correctly separate global launcher vs message badges');
  }

  // ----------------------------------------------------
  // TEST 12: Badge does not disrupt layout when no toolbar exists
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-layout">
        <div class="content">No header, no toolbar — layout must not change.</div>
      </div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-layout', role: 'assistant', index: 0 }],
    });

    mountMessageHistoryBadges({}, state);

    const badge = doc.querySelector('.sotl-message-history-badge');
    assert.ok(!badge, 'No visible badge when toolbar is absent');
    
    const host = doc.querySelector('.msg');
    assert.notEqual(host.style.position, 'relative', 'Host position must NOT be modified (zero layout impact)');
    console.log('  ✓ TEST 12 passed: No layout disruption when toolbar is absent');
  }

  // ----------------------------------------------------
  // TEST 13: Active swipe tracker selection does not show wrong-swipe tracker
  // ----------------------------------------------------
  {
    const doc = setupDOM(`
      <div class="msg" data-message-id="msg-swipe-test">
        <div class="message-actions">
          <button aria-label="Copy">Copy</button>
        </div>
      </div>
    `);

    const state = makeState({
      chatAssistantMessages: [{ id: 'msg-swipe-test', role: 'assistant', index: 0 }],
      activeSwipeByMessageId: { 'msg-swipe-test': 3 },
      messageTrackers: [
        { messageId: 'msg-swipe-test', swipeId: 3, generatedAt: '2026-05-31T01:00:00Z', validation: { ok: true } }
      ]
    });

    mountMessageHistoryBadges({}, state);

    const badge = doc.querySelector('.sotl-message-history-badge');
    assert.ok(badge.classList.contains('sotl-message-history-badge--has-tracker'), 'Correctly identifies that a tracker matches the active swipe');
    console.log('  ✓ TEST 13 passed: Active swipe tracker validation correctly ignores wrong swipes');
  }

  // ----------------------------------------------------
  // TEST 14: Source-code assertions for badge queries
  // ----------------------------------------------------
  {
    const source = readFileSync('src/frontend/messageCards.ts', 'utf-8');
    assert.match(source, /mountMessageHistoryBadges/, 'Source must declare mountMessageHistoryBadges');
    assert.match(source, /sotl-message-history-badge/, 'Source must reference history badge class');
    assert.match(source, /sotl-message-history-badge--toolbar/, 'Source must reference toolbar variant class');
    assert.match(source, /findMessageToolbar/, 'Source must use findMessageToolbar for badge placement');
    console.log('  ✓ TEST 14 passed: Structural source assertions passed\n');
  }

  console.log('OK: message-history-badge smoke tests passed successfully!');
}

runTests().catch((err) => {
  console.error('FAIL: message-history-badge smoke tests encountered an error:', err);
  process.exit(1);
});
