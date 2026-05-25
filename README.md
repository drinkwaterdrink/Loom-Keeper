# State of the Loom (v1.0.9)

State of the Loom is a Lumiverse-native State of the Loom continuity tracker for roleplay state continuity tracking. It provides a visual Loom HUD, custom tracker template dashboards, and per-user settings persistence with robust storage recovery.

Version 1.0.9 is a deep debug and zTracker/WTracker-style reliability pass: resolves custom preset rendering blackouts, fixes HUD compact view preset-independence through dynamic field mapping, implements a secure backend error boundary try/catch with automatic stuck spinner recovery, introduces a toggleable safe generic renderer for custom presets, and builds a comprehensive step-by-step Loom Pipeline Report diagnostic panel inside the drawer.

---

## Key Features

1. **Native-Style Paw Launcher**: A rounded-square button (`border-radius: 8px; width: 36px; height: 36px;`) positioned just below the star/spark icon on the right side. CSS variable `--sotl-launcher-top: 21%` controls placement.
2. **Floating HUD Panel**: An overlay panel showing the current chat's continuity status.
   - **View Toggle**: Switch between **Compact Summary** (scene title, location, time, delta, cast chips) and **Full Tracker** (HTML rendering based on the active template) directly in the HUD header. Changes save immediately without a full page refresh.
3. **Custom Template Editor**: An interactive dashboard in the viewport drawer under **Custom Template Editor**:
   - **Selector**: Inspect built-in templates or customize your own. Built-in system templates remain protected and read-only.
   - **Duplication & Creation**: Click **New Template** or **Duplicate to Edit** to spin up custom presets with unique IDs.
   - **Details (Metadata)**: Customize the name, description, generation mode, default placement, and token targets.
   - **JSON Schema & Sample Data**: Validate prompt outputs using custom JSON schemas and sample datasets.
   - **Strict DOM Sanitizer Allowlist**: All custom templates undergo browser-native `DOMParser` allowlist sanitization. Safe tags: `div`, `section`, `article`, `header`, `footer`, `span`, `p`, `b`, `strong`, `i`, `em`, `small`, `ul`, `ol`, `li`, `dl`, `dt`, `dd`, `details`, `summary`, `h1`-`h6`, `hr`, `br`. Safe attributes: `class`, `title`, `aria-label`, `role`, `data-*`. Executable elements (`<script>`, `<iframe>`, `<object>`, `<embed>`), inline styles (`style=`), event handlers (`on*`), and unsafe link URIs (`javascript:`, `data:`) are stripped.
   - **Preview & Validation**: Render the custom template against sample data in real-time. Unsafe HTML triggers immediate warning alerts inside the editor.
4. **Approximate Token Indicators**: Select dropdown choices are labeled with approximate token weights so you can manage your context size:
   - Micro Loom $\rightarrow$ `[~150t - Tiny]`
   - Slim Scene Loom $\rightarrow$ `[~350t - Slim]`
   - Balanced Story Loom $\rightarrow$ `[~400t - Balanced]`
   - Cast Continuity Loom $\rightarrow$ `[~400t - Detailed]`
   - Full Continuity Ledger $\rightarrow$ `[~450t - Full]`
5. **Stale Tracker Detection**: Flags the Current Loom status with a yellow badge `⚠️ Stale: New messages sent` if new user or assistant messages are added to the chat history after the latest tracker was saved.
6. **Quick Copy JSON**: Copy the entire Current Loom state to your clipboard with a single click.

---

## Installation & Setup

1. Clone or download from: `https://github.com/drinkwaterdrink/State-Of-The-Loom`.
2. Enable the extension in Lumiverse's Extension settings.
3. Grant permissions in the installation manifest. State of the Loom keeps all basic UI features available if you restrict or deny generation.
4. Open the interface from three locations:
   - **Extensions Panel** $\rightarrow$ **State of the Loom** $\rightarrow$ **Settings** (consolidated status panel).
   - **Drawer sidebar** $\rightarrow$ **Loom** (main dashboard with template editors and history).
   - **Chat Input Bar Extras Menu** $\rightarrow$ **Generate Loom** or **Open Loom**.

---

## Storage & Recovery

State of the Loom persists all user assets securely under `spindle.userStorage`:
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
```

---

## Diagnostics & Troubleshooting

State of the Loom (v1.0.9) introduces robust self-healing and debugging tools to prevent blank screens or stuck loading states.

### 1. What to do when a Custom Preset renders blank
* **Root Cause**: If a custom preset uses template property variables (like `{{time}}` or `{{location}}`) that are missing or misspelled in your custom JSON schema/data, the template compiler renders empty markup (e.g., `<h3></h3>`). The safe DOM sanitizer allows these structural tags, creating a completely blank visual block in the HUD instead of throwing an error.
* **Troubleshooting Step**: Toggle the **Use safe generic renderer for custom presets** setting in the controls section. This bypasses custom templates and renders all generated primitive fields and cast arrays dynamically inside a pre-formatted clean card, ensuring no data is ever hidden.
* **Automatic Fallback**: If a custom template fails compilation, has invalid tag structures, or renders entirely empty text content, the engine automatically catches the error and falls back to displaying a safe generic card detailing the render issue.

### 2. Collapsible Tracker Pipeline Report
Expose exactly where a generation or render breaks using the **Tracker Pipeline Report** inside the Diagnostics drawer section:
* **Active Preset Details**: Displays current preset ID, source type (built-in vs custom), and time.
* **JSON Parse / Validation State**: Exposes whether the LLM output was valid JSON and whether it conformed to your custom preset's schema.
* **Sanitizer and Fallback Flags**: Inspect if the HTML compiler failed, if the DOM sanitizer stripped unsafe layout styles, or if a safe fallback card was forced.

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
* **Compact Snapshot Injection** (Roadmap): Direct prompt insertion of compact continuity strings into native system commands.
