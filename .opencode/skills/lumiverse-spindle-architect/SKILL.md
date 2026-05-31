---
name: lumiverse-spindle-architect
description: Build, scaffold, design, or upgrade Lumiverse Spindle extensions. Use for `spindle.json`, backend/frontend extension architecture, native UI placements, storage, generation, macros, context handlers, interceptors, code-backed Council tools, permissions, runtime scanner constraints, extension skeletons, and any request to create new Lumiverse extension code.
---

# Lumiverse Spindle Architect

## Mission

Create Lumiverse-native Spindle extensions that feel first-party: narrow permissions, native UI surfaces, safe storage, robust user scoping, prompt hooks that fail gracefully, and validation that catches scanner/runtime issues before install.

## Workflow

1. Read `references/architecture-playbook.md`.
2. Choose the extension shape: frontend-only, backend-only, full-stack, or hybrid with pack content.
3. Read only the reference files needed:
   - Permissions/capabilities: `references/permissions-matrix.md`
   - UI surfaces: `references/frontend-ui-surfaces.md`
   - Backend hooks/storage: `references/backend-hooks-and-storage.md`
   - Prompt hooks and Council tools: `references/prompt-hooks-and-council-tools.md`
   - Validation/scanner: `references/scanner-and-validation.md`
4. Create or update `spindle.json`, `src/shared.ts`, `src/backend.ts`, and/or `src/frontend.ts`.
5. Run build/typecheck when available.
6. Run `scripts/scan-spindle-dist.mjs` against the backend bundle if a `dist/backend.js` exists.

## Architecture Rules

- Use frontend-only when the feature is pure UI.
- Use backend-only when the feature is a macro, event listener, interceptor, context handler, tool, or storage/generation task without UI.
- Use full-stack when users need settings, state inspection, import flows, diagnostics, or controls.
- Use packs/Lumias/Loom tools for declarative Council/persona/prompt content; use Spindle tools for code-backed behavior.
- Render a useful frontend shell before backend state arrives.
- Store per-user settings in `spindle.userStorage`; use shared `spindle.storage` only for intentionally shared data.
- For operator-scoped extensions, pass `userId` to targeted replies and user-scoped APIs.
- Never use direct filesystem APIs, runtime code generation, raw subprocesses, raw sockets, or fragile host DOM patching.
- Return cleanup functions from frontend setup and unregister event listeners.

## Permission Discipline

Request only the permissions needed by real calls. Do not request `chat_mutation`, `generation`, `interceptor`, `context_handler`, `tools`, `ui_panels`, or `app_manipulation` by default.

Every permission in the manifest should have:

| Permission | Concrete API call | User-facing feature | Degrade behavior |
| --- | --- | --- | --- |

Handle live permission changes with `spindle.permissions.onChanged()` when a feature can be granted/revoked at runtime.

## Scaffolding

To create a new project skeleton, run:

```bash
node .opencode/skills/lumiverse-spindle-architect/scripts/create-spindle-extension.mjs <target-dir> <identifier> <display-name>
```

Then customize the generated manifest, backend, frontend, and shared protocol.

## Validation

Before delivery:

1. Verify manifest identifier is stable and valid.
2. Verify entry files exist.
3. Verify permissions are minimal.
4. Run typecheck/build when available.
5. Scan backend output with `scripts/scan-spindle-dist.mjs`.
6. Confirm frontend renders before backend state.
7. Confirm mobile layout is usable.
8. Confirm permission revocation degrades cleanly.
9. Confirm prompt hooks skip quiet generations unless intentional.
10. Confirm targeted `sendToFrontend(..., userId)` for user-specific replies.

