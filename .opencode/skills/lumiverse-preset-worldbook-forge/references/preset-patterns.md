# Preset Patterns

Lumiverse presets store:

- `parameters`: sampler/custom provider settings.
- `prompt_order`: ordered prompt blocks.
- `prompts`: prompt behavior and advanced settings.
- `metadata`: description, prompt variables, model profiles, source info.

## Prompt Block Fields

Common fields:

- `id`
- `name`
- `content`
- `role`
- `enabled`
- `position`
- `depth`
- `marker`
- `categoryMode`
- `variables`

## Positions

| Position | Use |
| --- | --- |
| `pre_history` | foundation and system guidance |
| `post_history` | latest-turn instructions, output format |
| `in_history` | depth injections |

## Categories

Use category marker blocks for selectable groups. Use `radio` for mutually exclusive modes and `checkbox` for stackable modules.

## Conversion Rules

- ST system prompt -> `pre_history` system block.
- ST post-history/jailbreak -> post-history block only if still needed.
- ST depth prompt -> `in_history` with matching depth.
- ST modules -> prompt blocks under categories.
- ST variables -> Lumiverse prompt variables or macros.

