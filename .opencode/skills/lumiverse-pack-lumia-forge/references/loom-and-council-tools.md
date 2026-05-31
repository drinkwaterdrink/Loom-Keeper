# Loom Items and Council Tools

## Loom Items

Documented categories:

| Category | Macro |
| --- | --- |
| Narrative Style | `{{loomStyle}}` |
| Loom Utility | `{{loomUtils}}` |
| Retrofit | `{{loomRetrofits}}` |

Loom item rules:

- Keep one item to one purpose.
- State when it applies.
- Avoid overriding chat history or user instructions.
- Mention supported macros explicitly.
- Keep token cost proportional to value.

## Loom Tools

Use Loom tools for declarative sidecar Council analysis. A good tool has:

- Tool name: stable technical identifier.
- Display name: user-readable.
- Description: what it does.
- Prompt: focused instruction to sidecar LLM.
- Structured fields: named outputs the model should fill.
- Result variable: stable macro variable.
- Store in deliberation: true only when useful to main generation.

## Spindle Tools vs Loom Tools

| Need | Use |
| --- | --- |
| Pure prompt analysis | Loom tool |
| Reads extension storage | Spindle tool |
| Calls external API | Spindle tool |
| Deterministic search/parse/calculate | Spindle tool |
| Ships with a persona pack | Loom tool or hybrid |

## Tool Prompt Shape

```text
You are the assigned Council member performing [tool name].
Read the context. Return concise structured findings.
Do not write final prose.
Do not contradict the latest user message.
Fields:
- risk:
- evidence:
- recommendation:
```
