# Prompt Hooks and Council Tools

## Hook Selection

| Need | Use |
| --- | --- |
| Reusable text expansion | Macro |
| Modify macro resolution | Macro interceptor |
| Pre-assembly enrichment | Context handler |
| Post-assembly message modification | Interceptor |
| World info activation transform/inspection | World info interceptor |
| Message content transform | Message content processor |
| Code-backed Council analysis | `spindle.registerTool` with `council_eligible: true` |

## Interceptor Rules

- Skip quiet generations unless intentionally affecting internal calls.
- Keep injected context short.
- Add Prompt Breakdown entries for inspectability.
- Timeouts must degrade to no-op.
- Do not fetch slow external resources in ordinary generation unless user enabled it.

## Council Tool Pattern

```ts
spindle.registerTool({
  name: 'search_extension_memory',
  display_name: 'Search Extension Memory',
  description: 'Searches extension memory and returns concise Council guidance.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      limit: { type: 'number', default: 5 },
    },
    required: ['query'],
  },
  council_eligible: true,
})

spindle.on('TOOL_INVOCATION', async (payload) => {
  if (payload.toolName !== 'search_extension_memory') return 'Unknown tool'
  const member = payload.councilMember
  const context = payload.contextMessages ?? []
  return `${member?.name ?? 'Extension'} reports:\n- ...`
})
```

Use `payload.councilMember` to tailor voice. Do not trust user IDs in args.

