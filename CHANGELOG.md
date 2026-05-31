# Changelog

## v1.0.24 - Mobile Message Spacing Hotfix

- Removed the in-flow centered tracker-history slot that created vertical gaps and mobile scroll rubberbanding between messages.
- Repositioned message tracker-history badges as absolute, center-aligned overlays inside response cards so they do not change message height.
- Disabled native toolbar tracker-history injection and clean up old toolbar buttons to avoid overlapping Lumiverse copy/edit/delete controls.
- Added a swipe UI smoke guard that fails if the message history slot takes vertical layout space again.
## v1.0.23 - Reliable Message Tracker History Badges

- Added lightweight assistant message summaries to frontend state so visible assistant responses can get tracker-history controls even before a tracker exists.
- Added stable message-attached `sotl-message-history-badge` controls in a centered response slot that avoids native copy/edit/delete icons, opens exact message/swipe Tracker History, and shows a missing-state Generate Tracker flow when needed.
- Kept native selected-toolbar and context-menu Tracker History actions as enhancements, with the message badge as the reliable fallback.
- Separated the global HUD launcher from per-message history controls with distinct classes, labels, placement, and styling.

## v1.0.22 - Loom Keeper Icon, Toolbar, and Scroll Optimization

- Replaced the bear paw icon concept with a sleek, 100% maskless, stroke-based diagonal needle and thread SVG design to ensure perfect rendering in WebKit-based mobile containers.
- Embedded the tracker history button natively inside the selected message toolbar, positioned precisely to the left of the native Copy button.
- Safeguarded `state.activeSwipeByMessageId` access across all state resolvers, syncers, drawer renderers, and message cards to prevent null-pointer runtime errors.
- Introduced robust try/catch shielding around individual component mounts inside `updateMessageCardStatus` and message card toolbar iteration loops.
- Resolved mobile scroll rubberbanding by introducing a core-only `lastPreviewRenderKey` cache, bypassing full `innerHTML` updates and performing direct DOM patches for generation updates.
- Added a vertical right-margin floating gutter fallback for the global HUD launcher to guarantee accessibility without overlapping composer or settings surfaces.

## v1.0.21 - Mobile UI Stabilization

- Removed State of the Loom input-bar action registrations and constrained message paw insertion to the selected message's visible native action toolbar only.
- Removed the broad generic toolbar heuristic that could attach paws to the composer, bottom action bar, or unrelated side controls.
- Reworked the global chat paw to reuse one mounted DOM node with hidden/visible state instead of destructive remove/recreate loops.
- Replaced the paw glyph with a heavier five-toe bear paw SVG and kept the generation pulse animation.
- Kept tracker preview overlays mounted while refreshing, preserved old tracker content during regeneration, and changed Generate/Regenerate controls into Stop Generation while generation is running.
- Routed the HUD drawer/settings icon to a safe in-chat preview on mobile to avoid the half-screen drawer split; desktop still opens the Track drawer.

## v1.0.20 - Mobile Tracker Access Polish

- Hid the global floating paw outside the normal chat screen, including drawers, settings, branch views, modals, context menus, and tracker preview overlays.
- Replaced the generic paw glyph with a bear-paw-style SVG shared by the launcher, drawer tab, message action, and context-menu tracker entry.
- Preserved the generation animation with sequential toe/claw motion and a reduced-motion status-dot fallback.
- Disabled the fixed anchored message-paw fallback that could create duplicate random side paws.
- Kept per-message tracker access in controlled native-feeling locations: first icon in the visible message action toolbar when stable, or top item in the long-press menu.
- Added a mobile-safe in-chat tracker viewer for exact messageId + swipeId tracker previews instead of opening the settings drawer from message paw actions.
- Improved automatic swipe tracker syncing with event hooks, mutation detection, and a low-cost swipe-control signature poll.
- Clarified that full tracker retention controls stored/viewable snapshots, while tracker context depth controls live RP prompt injection.
- Added a separate tracker-generation history depth setting for previous full tracker JSON plus bounded compact summaries.
- Expanded diagnostics for sidecar generation context, prompt injection, active swipe correctness, compact history counts, and world-info/lorebook availability.
