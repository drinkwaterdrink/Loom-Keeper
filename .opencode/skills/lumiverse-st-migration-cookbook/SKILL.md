---
name: lumiverse-st-migration-cookbook
description: Use a library of concrete SillyTavern-to-Lumiverse migration recipes for common extension and prompt patterns. Use for tracker extensions, regex cleaners, lorebook packs, prompt module presets, Quick Reply workflows, slash commands, Greek chorus/assistant layers, ST world info, and other recurring ST conversion cases.
---

# Lumiverse ST Migration Cookbook

## Mission

Provide concrete migration recipes so common SillyTavern patterns can be rebuilt quickly as Lumiverse-native artifacts.

## Workflow

1. Identify the closest recipe in `references/recipe-index.md`.
2. Read that recipe file.
3. Combine with `lumiverse-st-converter` for project-specific inventory.
4. Use the correct builder skill for implementation.

## Recipes

- `references/tracker-extension.md`
- `references/regex-cleaner.md`
- `references/quick-reply-workflow.md`
- `references/prompt-module-preset.md`
- `references/lorebook-pack.md`
- `references/greek-chorus-assistant.md`
- `references/slash-command-tool.md`

## Rules

- Recipes are starting architectures, not blind templates.
- Keep Lumiverse-native surfaces.
- Preserve user-facing behavior.
- Validate prompt hooks and storage scopes.
- Prefer pack/preset/worldbook conversion when code is unnecessary.

