# Extension Harness Workflow

## Use For

- backend startup smoke tests
- frontend message handler tests
- storage write/read tests
- permission-dependent branch checks
- registration capture for tools, interceptors, context handlers

## Scenario File

```json
{
  "permissions": ["generation", "tools"],
  "userId": "test-user",
  "frontendMessages": [
    { "type": "ready" },
    { "type": "refresh_state" }
  ],
  "events": [
    { "name": "CHAT_SWITCHED", "payload": { "chatId": "chat-1" } }
  ]
}
```

## Run

```bash
node .agents/skills/lumiverse-extension-test-harness/scripts/run-backend-harness.mjs <extension-dir> scenario.json
```

## Interpret Output

- `logs`: backend log calls.
- `frontendMessages`: payloads sent by backend.
- `registrations`: hooks/tools/interceptors captured.
- `storage`: storage/userStorage writes.
- `errors`: thrown errors during import or scenario.

## Limits

The harness does not simulate real Lumiverse prompt assembly, provider calls, DOM, or database APIs. It is a fast smoke test.

