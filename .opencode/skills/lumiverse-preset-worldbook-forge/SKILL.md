---
name: lumiverse-preset-worldbook-forge
description: Create, convert, validate, or refine Lumiverse presets, prompt blocks, prompt variables, preset profiles, execution order, world books, world info entries, characters, personas, regex scripts, imports, and data-portability artifacts. Use for prompt architecture and library/data artifacts that are not primarily Spindle extension code or pack/Lumia content.
---

# Lumiverse Preset Worldbook Forge

## Mission

Build Lumiverse-native prompt and knowledge artifacts: structured presets, prompt block systems, prompt variables, world books, character/persona mappings, and import plans that survive real prompt assembly.

## Workflow

1. Identify artifact type: preset, prompt block stack, prompt variables, world book, character, persona, regex script, or import bundle.
2. Read the relevant reference:
   - Presets/prompt blocks: `references/preset-patterns.md`
   - World books: `references/worldbook-patterns.md`
   - Characters/personas/imports: `references/character-persona-imports.md`
   - Prompt variables and macros: `references/prompt-variable-strategy.md`
3. If normalizing world book entries from loose notes, run `scripts/normalize-worldbook-entries.mjs`.
4. Design for Lumiverse execution order, not SillyTavern prompt habits.
5. Include validation: import safety, trigger behavior, token cost, and prompt position.

## Rules

- Use preset prompt blocks for persistent prompt architecture.
- Use categories for user-switchable prompt modules.
- Use prompt variables when users need editable values inside blocks.
- Use World Books for keyword/vector-triggered lore.
- Use character `world_book_ids` to attach books directly to characters.
- Use namespaced `extensions` data for extension-owned character metadata.
- Keep lore entries atomic and triggerable.
- Avoid always-on lore unless it is foundational and small.
- Do not hide story-critical data inside display-only markup.

## Required Output

For each artifact:

1. Purpose and scope.
2. Field mapping or import shape.
3. Prompt position and role.
4. Activation/trigger logic.
5. Token budget and failure mode.
6. Validation checklist.

