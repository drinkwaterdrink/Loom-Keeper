# Backend Hooks and Storage

## Storage

Use:

```ts
const settings = await spindle.userStorage.getJson('settings.json', {
  fallback: defaultSettings,
  userId,
})

await spindle.userStorage.setJson('settings.json', settings, {
  indent: 2,
  userId,
})
```

Only use `spindle.storage` for shared data.

## Messaging

```ts
spindle.onFrontendMessage(async (payload, userId) => {
  if (!userId) return
  spindle.sendToFrontend({ type: 'state', state }, userId)
})
```

Avoid untargeted `sendToFrontend` in operator-scoped extensions.

## Generation

```ts
const result = await spindle.generate.quiet({
  messages,
  connection_id: settings.connectionId || undefined,
  userId,
  reasoning: { source: 'off' },
})
```

Use cancellation for long requests.

## Events

Subscribe to relevant Lumiverse events and keep handlers cheap. Resolve user context from prior frontend messages when events do not provide it.

## Chat Mutation

Use only when editing stored messages is the feature. Prefer prompt hooks, presets, macros, metadata, or display rendering for non-destructive behavior.

