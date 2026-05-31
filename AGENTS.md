# Loom Keeper - Opencode Agent Instructions

## Version Bumping
Every update must bump the version number by 0.0.1 across all three files:
1. `package.json` - `"version"` field
2. `spindle.json` - `"version"` field
3. `src/shared/defaults.ts` - `LOOM_VERSION` constant and all preset `version` fields

## Build & Test
- Run `npm run check` (TypeScript typecheck) before committing
- Run `npm run build` to produce `dist/backend.js` and `dist/frontend.js`
- Run all smoke tests in `scripts/*-smoke.mjs` before committing
- Stage `dist/` files in commits since they are the shipped artifacts

## Architecture
- Extension identifier: `loom_keeper`
- Backend runs in isolated Bun runtime using global `spindle` API
- Frontend exports `setup(ctx: SpindleFrontendContext)`
- CSS class prefix: `sotl-`
- Icon: loomNeedleSvg (maskless, stroke-based diagonal needle and thread)
- Per-message badges (`sotl-message-history-badge`) are the reliable Tracker History access method
- Native toolbar injection (`sotl-message-paw-btn`) is bonus/enhancement only
- Global HUD launcher (`sotl-chat-pill`) is a separate surface from message badges

## Git
- Commit and push after every substantive update
- Follow conventional commit style: `feat:`, `fix:`, `docs:`, etc.
