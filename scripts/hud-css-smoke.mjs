import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const styles = readFileSync('src/frontend/styles.ts', 'utf8');

function blockFor(selector) {
  const match = styles.match(new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([\\s\\S]*?)\\}'));
  assert.ok(match, `missing block for ${selector}`);
  return match[1];
}

const expandedContainer = blockFor('.sotl-chat-panel-container.sotl-chat-panel-container--expanded');
assert.match(expandedContainer, /top: 48px;/);
assert.match(expandedContainer, /left: 16px;/);
assert.match(expandedContainer, /right: 16px;/);

const expandedPanel = blockFor('.sotl-chat-panel-container--expanded .sotl-chat-panel');
assert.match(expandedPanel, /width: 100%;/);
assert.match(expandedPanel, /max-height: calc\(100vh - 136px\);/);

const expandedScrollBody = blockFor('.sotl-chat-panel-container--expanded .sotl-chat-panel__scroll-body');
assert.match(expandedScrollBody, /max-height: calc\(100vh - 190px\);/);

const mobileStart = styles.indexOf('@media (max-width: 520px)');
assert.ok(mobileStart >= 0, 'mobile media query should exist');
const mobileStyles = styles.slice(mobileStart);
const mobileExpanded = mobileStyles.match(/\.sotl-chat-panel-container\.sotl-chat-panel-container--expanded\s*\{([\s\S]*?)\}/)?.[1] || '';
assert.match(mobileExpanded, /left: 6px;/);
assert.match(mobileExpanded, /right: 6px;/);
assert.match(mobileExpanded, /top: 40px;/);
assert.match(mobileExpanded, /bottom: 84px;/);
assert.match(mobileExpanded, /max-width: none;/);

const mobilePanel = mobileStyles.match(/\.sotl-chat-panel-container--expanded \.sotl-chat-panel\s*\{([\s\S]*?)\}/)?.[1] || '';
assert.match(mobilePanel, /height: 100%;/);
assert.match(mobilePanel, /max-height: none;/);

const expandedBlocks = [...styles.matchAll(/\.sotl-chat-panel-container[^{]*--expanded[^{]*\{([\s\S]*?)\}/g)].map((match) => match[1]);
assert.ok(expandedBlocks.length >= 2, 'expanded HUD CSS blocks should exist');
for (const block of expandedBlocks) {
  assert.doesNotMatch(block, /width:\s*320px/, 'expanded HUD should not keep fixed 320px width');
}

console.log('OK: HUD CSS smoke passed');
