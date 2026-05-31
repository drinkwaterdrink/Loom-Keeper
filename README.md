# Loom Keeper (v1.0.21)

Loom Keeper is a Lumiverse-native Loom Keeper continuity tracker for roleplay state continuity tracking. It provides a visual Loom HUD, custom tracker template dashboards, and per-user settings persistence with robust storage recovery.

Version 1.0.20 tightens the native mobile tracker access layer: the global paw is hidden outside the real chat screen, the glyph is now a bear-paw-style icon, duplicate fixed side paws are disabled, per-message paws open a mobile-safe in-chat tracker viewer, swipe changes refresh automatically, and tracker retention/context/generation-history settings are labeled as separate controls. Version 1.0.19 polished native toolbar detection, long-press menu fallback, active-swipe refresh bursts, and direct Message Tracker List opening.

Release notes are tracked in [CHANGELOG.md](./CHANGELOG.md).

---

## Key Features

1. **Native-Style Paw Launcher**: A right-side paw button that first tries Lumiverse-style side-rail placement, then falls back to a flush-right compatibility overlay. During active tracker generation, the paw pads animate subtly and respect reduced-motion settings.
2. **Floating HUD Panel**: An overlay panel showing the current chat's continuity status.
   - **View Toggle**: Switch between **Compact Summary** (generic custom-schema summary) and **Full Tracker** (HTML rendering based on the tracker preset) directly in the HUD header. Changes save immediately without a full page refresh.
3. **Custom Template Editor**: An interactive dashboard in the viewport drawer under **Custom Template Editor**:
   - **Selector**: Inspect built-in templates or customize your own. Built-in system templates remain protected and read-only.
   - **Duplication & Creation**: Click **New Template** or **Duplicate to Edit** to spin up custom presets with unique IDs.
   - **Details (Metadata)**: Customize the name, description, generation mode, default placement, and token targets.
   - **JSON Schema & Sample Data**: Validate prompt outputs using custom JSON schemas and sample datasets.
   - **Trusted Layout Rendering**: Custom templates preserve layout HTML, inline CSS, tables, SVG, classes, and SimTracker-style helper syntax by default while executable hazards (`<script>`, event handlers, `javascript:` URLs) are stripped.
   - **Preview & Validation**: Render the custom template against sample data in real-time, inspect missing template fields, and see whether fallback or unrendered-data preservation was needed.
4. **Approximate Token Indicators**: Select dropdown choices are labeled with approximate token weights so you can manage your context size:
   - Micro Loom $\rightarrow$ `[~150t - Tiny]`
   - Slim Scene Loom $\rightarrow$ `[~350t - Slim]`
   - Balanced Story Loom $\rightarrow$ `[~400t - Balanced]`
   - Cast Continuity Loom $\rightarrow$ `[~400t - Detailed]`
   - Full Continuity Ledger $\rightarrow$ `[~450t - Full]`
   - Grand Continuity Atlas $\rightarrow$ `[~2500t - Grand]`
5. **Swipe-Aware Trackers**: Stores trackers by `messageId + swipeId`, shows the selected swipe in Current Loom and message cards, keeps all swipe alternatives while you are choosing, and auto-cleans non-chosen alternatives once a later assistant response exists.
6. **Per-Message Paw Access**: When Lumiverse exposes a visible native message action toolbar, Loom Keeper adds a small matching bear paw as the first tracker action beside the normal message controls. Clicking it opens a mobile-safe in-chat tracker viewer for that exact message and selected swipe; if that swipe has no tracker, the viewer shows a missing/pruned state instead of guessing.
7. **Stale Tracker Detection**: Flags the Current Loom status with a yellow badge `Stale: New messages sent` if new user or assistant messages are added to the chat history after the latest tracker was saved, and marks active-swipe changes as stale.
8. **Quick Copy JSON**: Copy the entire Current Loom state to your clipboard with a single click.
9. **Context Injection Lite**: Optionally injects a compact continuity brief into live roleplay prompts.
   - Uses the latest detailed tracker as the main source of truth.
   - Adds recent tracker history as compact summaries only.
   - Keeps full tracker retention separate from live RP context depth and tracker-generation history depth.
   - Provides configurable budgets of ~300, 500, 700, 1000, 1500, or 2000 tokens.
   - Shows an estimated token counter and preview in the drawer diagnostics.
   - Keeps the full tracker stored/rendered without flooding the model context.

---

## Installation & Setup

1. Clone or download from: `https://github.com/drinkwaterdrink/Loom-Keeper`.
2. Enable the extension in Lumiverse's Extension settings.
3. Grant permissions in the installation manifest. Loom Keeper keeps all basic UI features available if you restrict or deny generation.
4. Open the interface from three locations:
   - **Extensions Panel** $\rightarrow$ **Loom Keeper** $\rightarrow$ **Settings** (consolidated status panel).
   - **Drawer sidebar** $\rightarrow$ **Track** (main dashboard with template editors and history).
   - **Chat Input Bar Extras Menu** $\rightarrow$ **Generate Loom** or **Open Loom**.

---

## Storage & Recovery

Loom Keeper persists all user assets securely under `spindle.userStorage`:
- `settings.json`: Personal settings (active templates, launcher toggles).
- `presets.json`: Custom-built HTML templates and prompts.
- `tracker-states.json`: Stored continuity trackers for your chats.

If you encounter a "Backend not responding" warning or corrupt files, click **Reset Loom Storage** in the drawer or settings panel to rebuild your user files safely from defaults. Resetting custom templates or presets will **never** delete your connection profiles, chat history, or active settings.

---

## Permissions

The extension manifest requests the following capabilities:
- `chats`: Inspect chat details and titles.
- `chat_mutation`: Read chat messages to parse passive fenced code blocks and assistant responses.
- `generation`: Query connection profiles and request sidecar generation from your selected models.
- `interceptor`: Add the compact continuity brief to normal roleplay prompt messages when Context Injection Lite is enabled.
- `app_manipulation`: Insert the settings screen, viewport drawer, and chat overlay hooks.

---

## Development & Builds

Build and verify the extension locally using standard Node scripts:

```bash
# Install dependencies
npm install

# Check TypeScript compiler errors
npm run check

# Bundle backend & frontend entries into dist/
npm run build

# Run user storage recovery smoke test
npm run smoke:storage

# Run sidecar LLM parser / manual generator smoke test
npm run smoke:manual-generate

# Run custom preset activation/generation smoke test
npm run smoke:custom-preset

# Run renderer and preset-resolution smoke test
npm run smoke:renderer

# Run SimTracker/native import compatibility smoke test
npm run smoke:import-compat

# Run default Grand Continuity Atlas smoke test
npm run smoke:default-preset

# Run HUD mobile layout CSS smoke test
npm run smoke:hud-css

# Run prompt injection brief smoke test
npm run smoke:injection

# Run drawer/settings UI state smoke tests
npm run smoke:ui-state
npm run smoke:ui-settings

# Run swipe-aware storage/UI smoke tests
npm run smoke:swipe-storage
npm run smoke:swipe-ui
```

---

## Diagnostics & Troubleshooting

Loom Keeper (v1.0.21) includes self-healing and debugging tools to prevent blank custom presets, stale preset rendering, wrong-swipe tracker display, stuck generation states, settings-section collapse, confusing message-card action initials, mobile drawer overflow, duplicate paw actions, clipped drawer/menu transitions, and overlarge prompt injection.

### 1. What to do when a Custom Preset renders blank
* **Root Cause**: If a custom preset uses template variables that are missing from the generated JSON, those individual fields render empty. This is now a warning instead of a fatal blank-card condition.
* **Troubleshooting Step**: Use **Custom template rendering** to switch between Trusted layout, Strict sanitized, and Safe generic renderer modes. Safe generic bypasses custom HTML and displays every valid primitive, array, and object value.
* **Automatic Fallback**: If a custom template fails compilation, has invalid tag structures, or renders entirely empty text content, the engine automatically catches the error and falls back to displaying a safe generic card detailing the render issue. Valid but partially missing templates append an "Unrendered tracker data" section instead of hiding the JSON.
* **Preset-Accurate Rendering**: Stored trackers render through their own `presetId`; switching the active preset no longer forces old trackers through the wrong template.

### 2. Collapsible Tracker Pipeline Report
Expose exactly where a generation or render breaks using the **Tracker Pipeline Report** inside the Diagnostics drawer section:
* **Active Preset Details**: Displays current preset ID, source type (built-in vs custom), and time.
* **JSON Parse / Validation State**: Exposes whether the LLM output was valid JSON, the parse failure category, and whether it conformed to your custom preset's schema.
* **Raw / Timeout / Render Flags**: Inspect raw response availability, elapsed generation time, configured timeout, render warnings, template cleanup, fallback usage, unrendered-data preservation, and missing latest-template fields.

### 3. Context Injection Lite
When enabled, the extension compresses the current tracker into a system-level continuity brief for the next roleplay generation. The recommended setup is:
* **Tracker history limit**: keep the default last 5 trackers per chat.
* **Injection mode**: latest tracker + recent summaries.
* **Injection token budget**: start at ~700 tokens.
* **Appearance anchors**: enabled for character-heavy roleplay.
* **Rules and next-turn guidance**: enabled when continuity drift matters.

The full tracker JSON is not injected every turn. Older trackers are summarized, and lower-priority sections are omitted when the token budget would be exceeded.

---

## Roadmap (zTracker & WTracker Inspirations)

We are adopting several concrete reliability and feature ideas from reference tools like **WTracker** and **zTracker**:

### WTracker-Inspired Reliability (Adopted)
* **Pair Persistence**: Preset schemas, prompts, templates, and sample data are saved as a combined database record to prevent partial states.
* **Read-Only Built-Ins**: All system presets are locked from user overwrite or deletion, serving as clean starting points.

### zTracker-Inspired UX (Adopted / Roadmap)
* **Live Status Progress Indicator**: Sidecar generation progress is broadcast to the frontend in real time, displaying elapsed seconds during the spinner state.
* **Backend Error Boundary**: Generation exceptions and parsing timeouts are safely caught to prevent locked spinner states.
* **Sequential Generation** (Roadmap): Support multi-step tracking passes for massive roleplay logs.
* **Per-Section Regeneration** (Roadmap): Allow regenerating a single subsection or field (e.g., character pockets or location description) rather than rebuilding the entire tracker.
* **Message-Local Status Badges** (Roadmap): Display real-time progress indicators directly on the specific message being tracked.
* **Compact Snapshot Injection** (Adopted): Direct prompt insertion of compact continuity strings into native system commands through Context Injection Lite.
