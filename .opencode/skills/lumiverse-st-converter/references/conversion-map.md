# SillyTavern to Lumiverse Conversion Map

| SillyTavern concept | Lumiverse replacement |
| --- | --- |
| `extension_settings` | `spindle.userStorage` |
| global JS state | user-scoped storage plus chat metadata |
| `eventSource` hooks | `spindle.on(...)` events or frontend events |
| jQuery DOM patching | `ctx.ui` placements and `ctx.dom` helpers |
| extension settings panel | drawer tab + settings mount |
| slash command | input bar action, modal, macro, or drawer action |
| Quick Reply | input bar action or reusable preset/prompt block |
| prompt injection | preset block, macro, context handler, interceptor |
| lorebook/world info | Lumiverse World Books |
| ST preset prompt stack | Lumiverse preset prompt blocks/categories |
| regex script | Lumiverse regex script or message content processor |
| chat metadata | `spindle.chats.update(...metadata...)` |
| character extension data | namespaced `character.extensions` |
| HTML in messages | message tags, HTML islands, sanitized frontend rendering |
| external fetch | backend + `cors_proxy` when browser CORS/server proxy is needed |
| background LLM call | `spindle.generate.quiet` with `generation` |
| custom AI advisor | Lumia or Council tool |
| deterministic tool | Spindle registered tool |

## Conversion Choice

- Use a pack when the source is mostly persona/prompt/style/advisor content.
- Use a preset/world book when the source is prompt architecture or lore.
- Use a Spindle extension when the source needs UI, storage, APIs, code, or automation.
- Use hybrid when content and code both matter.

