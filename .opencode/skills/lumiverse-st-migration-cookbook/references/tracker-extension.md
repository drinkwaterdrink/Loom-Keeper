# Tracker Extension Recipe

## ST Pattern

Prompt asks model to output tracker JSON/HTML. Extension parses last message and renders state.

## Lumiverse Target

- Full-stack Spindle extension.
- Drawer tab for tracker UI.
- `userStorage` for schemas/settings.
- Chat metadata for latest tracker state.
- Interceptor or preset block for tracker instructions.
- Message content processor for extraction/cleanup if needed.

## Permissions

- `chats` for active chat metadata.
- `chat_mutation` only if editing stored message content.
- `interceptor` if dynamic injection is needed.

