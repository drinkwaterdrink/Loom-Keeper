# Conversion Workflow

## 1. Inventory

Capture:

- Files and entry points.
- UI panels and selectors.
- Settings and default state.
- Event hooks.
- Slash commands and Quick Replies.
- Prompt injection points.
- Lorebook/preset/character dependencies.
- Regex/message processing.
- Network/API calls.
- Storage or filesystem assumptions.

## 2. Behavior Contract

Write what the extension accomplishes in user terms. Do not copy the ST implementation as the contract.

## 3. Target Architecture

Classify every behavior:

| Behavior | Target |
| --- | --- |
| UI | Spindle frontend |
| State | userStorage/chat metadata/character extensions |
| Prompt guidance | preset/macro/context handler/interceptor |
| Lore | world book |
| Advisor persona | Lumia |
| Prompt tool | Loom tool |
| Deterministic tool | Spindle tool |

## 4. Implement Migration

- Create new Lumiverse files.
- Add import path for old settings if needed.
- Store migrated data with a version field.
- Preserve original data until conversion is verified.
- Show diagnostics in a drawer or settings mount.

## 5. Validate

- Old behavior is represented.
- Permissions are minimal.
- UI is native and mobile-safe.
- Prompt hooks trigger only when intended.
- Data remains user-scoped.
- Import/export or build passes.

