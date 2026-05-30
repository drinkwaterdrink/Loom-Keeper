# Changelog

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
