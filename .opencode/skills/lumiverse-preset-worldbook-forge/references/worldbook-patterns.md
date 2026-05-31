# World Book Patterns

## Entry Fields

Common fields:

- `key`
- `keysecondary`
- `content`
- `comment`
- `position`
- `depth`
- `role`
- `order_value`
- `selective`
- `constant`
- `disabled`
- `probability`
- `scan_depth`
- `case_sensitive`
- `match_whole_words`
- `use_regex`
- `prevent_recursion`
- `priority`
- `sticky`
- `cooldown`
- `delay`
- `extensions`

## Design Rules

- Keep entries atomic.
- Put one concept per entry.
- Use strong primary keys.
- Use secondary keys for selective disambiguation.
- Avoid broad always-on entries.
- Use groups for alternatives.
- Use sticky/cooldown for continuity without spam.
- Use regex only when plain keys cannot work.

## Positions

Common documented positions include before, after, and depth injection. Use exact values from docs or existing exports when building import JSON.

## Validation

- Trigger keys are not too broad.
- Entry content is concise.
- Activation can be explained.
- Recursion settings are intentional.
- Token cost is acceptable.

