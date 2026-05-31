# Permissions Matrix

## Free APIs

Usually no manifest permission:

- Events
- Storage
- User storage
- Secure enclave
- Macros
- Drawer tabs
- Input bar actions
- Variables
- Logging
- Toast notifications
- Frontend/backend messaging
- Council read API in current docs

## Gated APIs

| Permission | Use only when |
| --- | --- |
| `generation` | Calling `spindle.generate.*` or inspecting connection profiles |
| `interceptor` | Registering pre-generation interceptors |
| `generation_parameters` | Returning generation parameter overrides from interceptors |
| `context_handler` | Registering context handlers |
| `tools` | Registering LLM or Council-eligible tools |
| `cors_proxy` | Calling external HTTP APIs through Lumiverse |
| `characters` | CRUD character cards |
| `chats` | CRUD chat sessions or active chat |
| `chat_mutation` | Reading/editing/appending/deleting messages |
| `presets` | CRUD presets and prompt blocks |
| `world_books` | CRUD world books and entries |
| `databanks` | CRUD databanks |
| `memories` | Memory Cortex or long-term memory APIs |
| `personas` | CRUD personas and persona switching |
| `ui_panels` | Float widgets and dock panels |
| `app_manipulation` | App-level portals and theme overrides |
| `image_gen` | Image generation APIs |
| `web_search` | Configured web search provider |
| `oauth` | OAuth callback handlers |
| `push_notification` | OS push notifications |
| `event_tracking` | Extension telemetry |

## Capabilities Are Not Permissions

`requested_capabilities` suppress scanner heuristics for legitimate patterns. Do not add them unless a scanner block is confirmed and the docs allow the specific opt-out.

Known capability categories from docs:

- `dynamic_code_execution`
- `base64_decode`

Prefer removing the matched code over requesting a capability.

