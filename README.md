# State of the Loom

State of the Loom is a Lumiverse-native Spindle extension for roleplay state continuity tracking. Version 1.0.3 implements the stable foundation: extension settings UI, drawer UI, input-bar actions, settings persistence with corrupt-storage recovery, a Slim Scene Loom preset, passive tracker parsing, manual/sidecar tracker generation, latest-state storage, and best-effort message-card rendering.

## How to turn it on

1. Install or update from `https://github.com/drinkwaterdrink/State-Of-The-Loom`.
2. Enable the extension in Lumiverse.
3. Grant `chats`, `chat_mutation`, `generation`, and `app_manipulation` if you want full behavior. Passive tracker extraction and the UI still work without generation.
4. Open it from one of three places:
   - Extensions panel -> State of the Loom -> Settings.
   - Viewport drawer sidebar -> Loom.
   - Chat input Extras popover -> Open Loom or Generate Loom.
5. After an assistant message, click Generate tracker. If the button is disabled, the UI explains the exact reason.

If the panel says the backend is not responding, click **Reset Loom Storage**, then **Refresh** after the extension reloads. This resets only State of the Loom's extension-owned settings, presets, and tracker cache for your user.

## Milestone 1 scope

Implemented:

- Full-stack Spindle backend and frontend entries.
- Per-user settings and tracker state through `spindle.userStorage`.
- Active chat lookup and latest assistant message lookup when permissions allow.
- Connection profile listing and sidecar connection selection.
- Slim Scene Loom built-in preset.
- Passive fenced block parsing for `tracker` and `loom`.
- Manual Generate Tracker action with exact disabled reasons.
- Reset Loom Storage recovery action in the drawer and settings panel.
- Storage recovery warnings in Diagnostics when `settings.json`, `presets.json`, or `tracker-states.json` had to be reset.
- Compact tracker card renderer and drawer preview.
- Settings panel inside the Extensions UI.
- Input-bar actions for opening the HUD and generating a tracker.
- Best-effort message-card compatibility layer with diagnostics when no stable message host is found.

Not implemented yet:

- Prompt interceptor injection.
- Simulation clocks, scene node tree, entity inbox, companion sovereignty, Council tools.
- Full preset editor and LLM repair workflow.

## Permissions

The manifest requests only Milestone 1 permissions that are used:

- `chats`: active chat lookup.
- `chat_mutation`: read messages for the latest assistant response and optionally strip raw tracker blocks.
- `generation`: list connection profiles and run sidecar tracker generation.
- `app_manipulation`: mount the compact settings panel in Lumiverse's Extensions settings surface.

If a permission is missing, the backend keeps the drawer available and returns exact disabled reasons for gated actions.

The drawer tab and input-bar actions are the primary access surfaces. The desktop floating launcher is off by default and hidden on mobile to avoid covering chat controls.

## Rendering note

Lumiverse exposes drawer tabs, settings mounts, input-bar actions, and message tag interceptors as native surfaces. It does not currently expose a documented generic "insert arbitrary extension card at top of an existing message" API. Milestone 1 therefore uses a small compatibility layer that looks for host message elements by stable message identifiers and inserts a scoped tracker card when possible. If no compatible host element is found, the drawer preview remains the source of truth and Diagnostics reports the mount limitation.

## Development

```bash
npm install
npm run check
npm run build
npm run smoke:storage
npm run smoke:manual-generate
```

If Bun is available, the same scripts can be run through `bun run check` and `bun run build`.

## Scanner checklist

Before installing, inspect `dist/backend.js` and emitted backend modules for:

```text
fs
node:fs
Bun.file
Bun.write
process.env
child_process
raw sockets
sqlite
eval
Function(
new Function
```
