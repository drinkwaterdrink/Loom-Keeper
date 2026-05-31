# Regex Cleaner Recipe

## ST Pattern

Regex scripts strip tags, transform output, or hide metadata.

## Lumiverse Target

- Prefer message content processor for systematic content transforms.
- Use regex scripts only when Lumiverse-native regex feature is the user's target.
- Use frontend rendering for display-only decoration.

## Rules

- Do not strip story-critical facts.
- Preserve raw content unless the user wants destructive cleanup.
- Make cleanup reversible during testing.

