# Character and Persona Imports

## Character Mapping

| Source concept | Lumiverse character field |
| --- | --- |
| Name | `name` |
| Description | `description` |
| Personality | `personality` |
| Scenario | `scenario` |
| First message | `first_mes` |
| Example dialogue | `mes_example` |
| Creator notes | `creator_notes` |
| System prompt | `system_prompt` |
| Post-history instructions | `post_history_instructions` |
| Tags | `tags` |
| Alternate greetings | `alternate_greetings` |
| Attached lorebook | `world_book_ids` |
| Extension-owned metadata | namespaced `extensions` key |

## Persona Add-ons

Use persona add-ons for user-side context that should travel with active persona choices. Avoid baking user identity into character cards.

## Import Rules

- Preserve source text.
- Normalize line endings.
- Namespace extension data.
- Attach world books by ID after importing them.
- Keep original source metadata in a namespaced extension field when useful.

