# Prompt, UI, and State Migration

## Prompt Migration

Use this order of preference:

1. Preset block if users should see/edit the instruction as prompt architecture.
2. Macro if it is reusable text.
3. Context handler if prompt assembly context must be enriched before assembly.
4. Interceptor if final messages must be modified after assembly.
5. Chat mutation only if stored messages must change.

Avoid always-on large injections. Add toggles, budgets, and breakdown entries.

## UI Migration

Replace:

- floating ST panels -> drawer tab unless tiny.
- settings drawer -> Lumiverse settings mount plus main drawer.
- buttons beside ST textarea -> input bar action.
- right-click hacks -> `ctx.ui.showContextMenu`.
- full-screen overlays -> `ctx.ui.showModal` or app mount only when justified.

## State Migration

| ST source | Lumiverse target |
| --- | --- |
| global extension settings | `userStorage/settings.json` |
| per-chat state | chat metadata |
| per-character state | `character.extensions["extension_identifier"]` |
| bundled defaults | `storage_seed_files` |
| secrets | secure enclave |

Include schema version:

```json
{
  "schemaVersion": 1,
  "settings": {}
}
```

## Migration Diagnostics

The converted extension should show:

- detected old keys
- migrated item count
- skipped/unsupported items
- permission requirements
- rollback note

