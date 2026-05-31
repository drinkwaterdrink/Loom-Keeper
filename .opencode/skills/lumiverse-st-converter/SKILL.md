---
name: lumiverse-st-converter
description: Convert SillyTavern extensions, presets, lorebooks, prompt modules, Quick Replies, slash commands, regex scripts, UI overlays, and stateful ST mechanics into Lumiverse-native Spindle extensions, packs, Lumias, Loom tools, presets, world books, or hybrid artifacts. Use whenever the user asks to port, migrate, translate, adapt, or rebuild SillyTavern content for Lumiverse.
---

# Lumiverse SillyTavern Converter

## Mission

Convert SillyTavern artifacts by preserving behavior and intent while replacing SillyTavern implementation habits with Lumiverse-native surfaces.

## Workflow

1. Inspect the ST source folder/files.
2. Run `scripts/scan-sillytavern-extension.mjs <path>` when a folder is available.
3. Read `references/conversion-map.md`.
4. Read `references/conversion-workflow.md`.
5. For UI/state/prompt-heavy work, read `references/prompt-ui-state-migration.md`.
6. Route the converted implementation:
   - Code: use `lumiverse-spindle-architect`.
   - Packs/Lumias/Loom tools: use `lumiverse-pack-lumia-forge`.
   - Presets/world books/characters/personas: use `lumiverse-preset-worldbook-forge`.
7. Build a migration table that maps each ST feature to a Lumiverse replacement.

## Conversion Rules

- Convert behavior, not DOM selectors.
- Replace `extension_settings` with `spindle.userStorage`.
- Replace global ST state with user-scoped and chat-scoped state.
- Replace ST prompt injection hooks with Lumiverse prompt blocks, macros, context handlers, interceptors, macro interceptors, or world info interceptors.
- Replace slash commands/Quick Replies with input bar actions, drawer actions, modals, or macros.
- Replace jQuery/DOM patching with native Lumiverse frontend placements.
- Replace ST lorebooks with Lumiverse World Books.
- Replace ST preset prompts with Lumiverse preset prompt blocks and categories.
- Use `chat_mutation` only for real stored message edits.
- Keep importers reversible and diagnostics visible.

## Required Output

For every conversion, produce:

1. Source inventory.
2. ST-to-Lumiverse mapping table.
3. Target artifact classification.
4. Permission list and why each is needed.
5. Data migration plan.
6. Prompt migration plan.
7. UI migration plan.
8. Build/import validation plan.
9. Risks where behavior cannot be ported 1:1.

## Red Flags

- Direct DOM selectors are being copied.
- `chat_mutation` is used for prompt context that should be an interceptor or preset block.
- Shared storage is used for personal settings.
- The converted extension broadcasts to all users.
- Prompt hooks affect quiet generations accidentally.
- World info activation behavior is guessed instead of mapped.
- Pack JSON fields are invented without a verified export.

