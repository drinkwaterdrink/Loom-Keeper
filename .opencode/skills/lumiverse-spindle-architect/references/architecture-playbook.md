# Spindle Architecture Playbook

## Project Shape

```text
extension/
  spindle.json
  package.json
  tsconfig.json
  src/
    shared.ts
    backend.ts
    frontend.ts
  dist/
    backend.js
    frontend.js
```

## Choose Shape

| Shape | Use when |
| --- | --- |
| Frontend-only | UI helper, visual overlay, local browser behavior, no LLM/storage backend |
| Backend-only | macros, events, interceptors, context handlers, tools, storage/generation without UI |
| Full-stack | UI + backend state, imports, settings, generation, diagnostics |
| Hybrid pack + extension | Pack supplies Lumias/Loom content; extension supplies code-backed tools or UI |

## Shared Protocol

Always define shared message types:

```ts
export type FrontendMessage =
  | { type: 'ready'; chatId?: string | null }
  | { type: 'refresh_state'; chatId?: string | null }
  | { type: 'save_settings'; settings: Settings; chatId?: string | null }

export type BackendMessage =
  | { type: 'state'; state: FrontendState }
  | { type: 'error'; message: string }
  | { type: 'diagnostic'; message: string }
```

## Backend Startup Pattern

- Declare `spindle` global type.
- Register message handlers.
- Register permissions listeners.
- Register prompt hooks/tools only if permissions are granted.
- Log successful load.

## Frontend Startup Pattern

- Render static shell immediately.
- Register native placements.
- Register delegated event listeners once.
- Subscribe to backend messages.
- Send `{ type: 'ready' }`.
- Return cleanup.

## Operator Scope

For globally installed/operator-scoped extensions:

- Remember `userId` from `spindle.onFrontendMessage`.
- Map `chatId -> userId` when possible.
- Pass `userId` to `sendToFrontend`, `userStorage`, `generate`, `connections`, `chats`, and other user-scoped APIs where docs require it.
- Never broadcast request/response UI updates unless the feature is intentionally global.

## Data Placement

| Data | Location |
| --- | --- |
| User settings | `spindle.userStorage` |
| Per-user caches | `spindle.userStorage` |
| Shared extension defaults | `spindle.storage` |
| Chat-specific durable state | chat metadata through `spindle.chats.update` |
| Character-specific extension data | namespaced `character.extensions` |
| Secrets | secure enclave |

