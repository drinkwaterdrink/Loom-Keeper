#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [extensionDirArg, scenarioArg] = process.argv.slice(2);
if (!extensionDirArg) {
  console.error('Usage: node run-backend-harness.mjs <extension-dir> [scenario.json]');
  process.exit(2);
}

const extensionDir = path.resolve(extensionDirArg);
const manifestPath = path.join(extensionDir, 'spindle.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
const backendPath = path.join(extensionDir, manifest.entry_backend || 'dist/backend.js');
const scenario = scenarioArg && existsSync(scenarioArg)
  ? JSON.parse(readFileSync(scenarioArg, 'utf8'))
  : { permissions: [], userId: 'test-user', frontendMessages: [{ type: 'ready' }], events: [] };

const state = {
  logs: [],
  frontendMessages: [],
  registrations: { frontendHandlers: [], events: {}, tools: [], interceptors: [], contextHandlers: [] },
  storage: { shared: {}, users: {} },
  errors: [],
};

function storageBucket(userId) {
  state.storage.users[userId] ||= {};
  return state.storage.users[userId];
}

globalThis.spindle = {
  log: {
    info: (...args) => state.logs.push(['info', ...args]),
    warn: (...args) => state.logs.push(['warn', ...args]),
    error: (...args) => state.logs.push(['error', ...args]),
  },
  toast: {
    success: (message) => state.logs.push(['toast.success', message]),
    warning: (message) => state.logs.push(['toast.warning', message]),
    error: (message) => state.logs.push(['toast.error', message]),
    info: (message) => state.logs.push(['toast.info', message]),
  },
  permissions: {
    has: (permission) => (scenario.permissions || []).includes(permission),
    getGranted: async () => scenario.permissions || [],
    onChanged: (handler) => { state.registrations.events.PERMISSION_CHANGED ||= []; state.registrations.events.PERMISSION_CHANGED.push(handler); return () => {}; },
    onDenied: (handler) => { state.registrations.events.PERMISSION_DENIED ||= []; state.registrations.events.PERMISSION_DENIED.push(handler); return () => {}; },
  },
  onFrontendMessage: (handler) => { state.registrations.frontendHandlers.push(handler); return () => {}; },
  sendToFrontend: (payload, userId) => state.frontendMessages.push({ payload, userId }),
  on: (name, handler) => { state.registrations.events[name] ||= []; state.registrations.events[name].push(handler); return () => {}; },
  registerTool: (tool) => state.registrations.tools.push(tool),
  unregisterTool: (name) => state.registrations.tools = state.registrations.tools.filter((tool) => tool.name !== name),
  registerInterceptor: (handler, priority = 100) => state.registrations.interceptors.push({ handler, priority }),
  registerContextHandler: (handler, priority = 100) => state.registrations.contextHandlers.push({ handler, priority }),
  storage: {
    getJson: async (key, options = {}) => state.storage.shared[key] ?? options.fallback,
    setJson: async (key, value) => { state.storage.shared[key] = value; },
    read: async (key) => state.storage.shared[key],
    write: async (key, value) => { state.storage.shared[key] = value; },
  },
  userStorage: {
    getJson: async (key, options = {}) => storageBucket(options.userId || scenario.userId)[key] ?? options.fallback,
    setJson: async (key, value, options = {}) => { storageBucket(options.userId || scenario.userId)[key] = value; },
    read: async (key, userId = scenario.userId) => storageBucket(userId)[key],
    write: async (key, value, userId = scenario.userId) => { storageBucket(userId)[key] = value; },
  },
  generate: {
    quiet: async () => ({ content: '{"ok":true}', finish_reason: 'stop', usage: {} }),
    raw: async () => ({ content: '{"ok":true}', finish_reason: 'stop', usage: {} }),
  },
  chats: {
    getActive: async () => ({ id: 'chat-1', name: 'Harness Chat', metadata: {} }),
    get: async (id) => ({ id, name: 'Harness Chat', metadata: {} }),
  },
};

try {
  if (!existsSync(backendPath)) throw new Error(`Backend entry not found: ${backendPath}`);
  await import(pathToFileURL(backendPath).href);
  for (const payload of scenario.frontendMessages || []) {
    for (const handler of state.registrations.frontendHandlers) {
      await handler(payload, scenario.userId || 'test-user');
    }
  }
  for (const event of scenario.events || []) {
    for (const handler of state.registrations.events[event.name] || []) {
      await handler(event.payload, scenario.userId || 'test-user');
    }
  }
} catch (error) {
  state.errors.push(error instanceof Error ? error.message : String(error));
}

console.log(JSON.stringify({
  extensionDir,
  backendPath,
  logs: state.logs,
  frontendMessages: state.frontendMessages,
  registrations: {
    frontendHandlers: state.registrations.frontendHandlers.length,
    events: Object.fromEntries(Object.entries(state.registrations.events).map(([k, v]) => [k, v.length])),
    tools: state.registrations.tools.map((tool) => tool.name),
    interceptors: state.registrations.interceptors.length,
    contextHandlers: state.registrations.contextHandlers.length,
  },
  storage: state.storage,
  errors: state.errors,
}, null, 2));

process.exit(state.errors.length ? 1 : 0);

