#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const [targetDirArg, identifierArg, ...nameParts] = process.argv.slice(2);
if (!targetDirArg || !identifierArg || !nameParts.length) {
  console.error('Usage: node create-spindle-extension.mjs <target-dir> <identifier> <display-name>');
  process.exit(2);
}

const identifier = identifierArg.trim();
if (!/^[a-z][a-z0-9_]*$/.test(identifier)) {
  console.error('Identifier must match /^[a-z][a-z0-9_]*$/');
  process.exit(2);
}

const displayName = nameParts.join(' ').trim();
const root = path.resolve(targetDirArg);
if (existsSync(root)) {
  console.error(`Target already exists: ${root}`);
  process.exit(2);
}

function write(rel, content) {
  const file = path.join(root, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content.trimStart(), 'utf8');
}

mkdirSync(root, { recursive: true });

write('spindle.json', JSON.stringify({
  version: '1.0.0',
  name: displayName,
  identifier,
  author: 'Author',
  github: 'https://github.com/author/repo',
  homepage: 'https://github.com/author/repo',
  description: `${displayName} for Lumiverse.`,
  permissions: [],
  entry_backend: 'dist/backend.js',
  entry_frontend: 'dist/frontend.js',
  minimum_lumiverse_version: '0.1.0',
}, null, 2));

write('package.json', JSON.stringify({
  name: identifier.replaceAll('_', '-'),
  version: '1.0.0',
  type: 'module',
  scripts: {
    check: 'tsc --noEmit',
    build: 'bun build src/backend.ts --outfile dist/backend.js --target bun && bun build src/frontend.ts --outfile dist/frontend.js --target browser',
  },
  devDependencies: {
    'lumiverse-spindle-types': 'latest',
    typescript: 'latest',
  },
}, null, 2));

write('tsconfig.json', JSON.stringify({
  compilerOptions: {
    target: 'ESNext',
    module: 'ESNext',
    moduleResolution: 'bundler',
    strict: true,
    outDir: './dist',
    declaration: false,
    skipLibCheck: true,
  },
  include: ['src'],
}, null, 2));

write('src/shared.ts', `
export interface Settings {
  enabled: boolean
}

export interface FrontendState {
  settings: Settings
  granted: string[]
}

export type FrontendMessage =
  | { type: 'ready'; chatId?: string | null }
  | { type: 'refresh_state'; chatId?: string | null }
  | { type: 'save_settings'; settings: Settings; chatId?: string | null }

export type BackendMessage =
  | { type: 'state'; state: FrontendState }
  | { type: 'error'; message: string }
  | { type: 'diagnostic'; message: string }
`);

write('src/backend.ts', `
import type { FrontendMessage, FrontendState, Settings } from './shared'

declare const spindle: import('lumiverse-spindle-types').SpindleAPI

const defaultSettings: Settings = { enabled: true }

async function loadSettings(userId: string): Promise<Settings> {
  return spindle.userStorage.getJson('settings.json', { fallback: defaultSettings, userId })
}

async function saveSettings(userId: string, settings: Settings) {
  await spindle.userStorage.setJson('settings.json', settings, { indent: 2, userId })
}

async function buildState(userId: string): Promise<FrontendState> {
  return {
    settings: await loadSettings(userId),
    granted: await spindle.permissions.getGranted(),
  }
}

spindle.onFrontendMessage(async (payload: FrontendMessage, userId?: string) => {
  if (!userId) return
  try {
    if (payload.type === 'save_settings') await saveSettings(userId, payload.settings)
    if (payload.type === 'ready' || payload.type === 'refresh_state' || payload.type === 'save_settings') {
      spindle.sendToFrontend({ type: 'state', state: await buildState(userId) }, userId)
    }
  } catch (error) {
    spindle.sendToFrontend({ type: 'error', message: error instanceof Error ? error.message : String(error) }, userId)
  }
})

spindle.log.info('${displayName} backend loaded')
`);

write('src/frontend.ts', `
import type { SpindleFrontendContext } from 'lumiverse-spindle-types'
import type { BackendMessage, FrontendState } from './shared'

let state: FrontendState | null = null

function render(root: HTMLElement) {
  root.innerHTML = \`
    <section class="${identifier}">
      <header class="${identifier}__header">
        <h2>${displayName}</h2>
        <button type="button" data-action="refresh" title="Refresh" aria-label="Refresh">Refresh</button>
      </header>
      <p class="${identifier}__status">\${state ? 'Ready' : 'Loading'}</p>
      <label>
        <input type="checkbox" data-field="enabled" \${state?.settings.enabled ? 'checked' : ''}>
        Enabled
      </label>
    </section>
  \`
}

export function setup(ctx: SpindleFrontendContext) {
  const tab = ctx.ui.registerDrawerTab({
    id: 'main',
    title: '${displayName}',
    shortName: '${displayName.slice(0, 8)}',
    headerTitle: '${displayName}',
    description: 'Open ${displayName}',
    keywords: ['${identifier}', 'extension'],
    iconSvg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l4 8 8 2-8 2-4 8-4-8-8-2 8-2 4-8z"/></svg>',
  })

  const removeStyle = ctx.dom.addStyle(\`
    .${identifier} { display: grid; gap: 12px; color: var(--lumiverse-text); }
    .${identifier}__header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .${identifier}__status { color: var(--lumiverse-text-muted); font-size: 12px; }
  \`)

  render(tab.root)
  const onClick = (event: Event) => {
    const action = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action
    if (action === 'refresh') ctx.sendToBackend({ type: 'refresh_state' })
  }
  tab.root.addEventListener('click', onClick)

  const unsub = ctx.onBackendMessage((payload: BackendMessage) => {
    if (payload.type === 'state') {
      state = payload.state
      render(tab.root)
    } else if (payload.type === 'error') {
      console.warn(payload.message)
    }
  })

  ctx.sendToBackend({ type: 'ready' })

  return () => {
    unsub()
    tab.root.removeEventListener('click', onClick)
    removeStyle()
    tab.destroy()
  }
}
`);

console.log(`Created Lumiverse Spindle extension skeleton at ${root}`);

