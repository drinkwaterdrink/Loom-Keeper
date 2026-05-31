# Slash Command Tool Recipe

## ST Pattern

Slash commands run scripts, insert text, call APIs, or trigger generation.

## Lumiverse Target

- Input bar action for common commands.
- Drawer command palette/workspace for complex tools.
- Modal for arguments.
- Backend message handler for execution.
- Spindle tool if LLM/Council should invoke it.

## Permissions

Depends on action:

- `generation` for LLM calls.
- `chat_mutation` for appending/editing messages.
- `cors_proxy` for external APIs.

