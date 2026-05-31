---
name: lumiverse-pack-schema-collector
description: Learn and document Lumiverse pack import/export schemas from real Content Workshop JSON exports. Use when the user provides pack JSON files, wants verified pack/Lumia/Loom/Loom-tool schemas, asks to collect schema evidence, compare exports, infer fields, or update generation rules for import-ready pack JSON.
---

# Lumiverse Pack Schema Collector

## Mission

Build a verified schema knowledge base from real Lumiverse pack exports so pack generation is based on evidence instead of guessed fields.

## Workflow

1. Gather exported pack JSON files.
2. Run:

```bash
node .opencode/skills/lumiverse-pack-schema-collector/scripts/collect-pack-schema.mjs <pack-folder-or-json> <out.md>
```

3. Read `references/schema-observation-protocol.md`.
4. Compare the report with `references/known-pack-schema.md`.
5. If new Loom item/tool fields appear, update the relevant pack-generation references and mark confidence level.

## Evidence Levels

| Level | Meaning |
| --- | --- |
| Verified | Seen in multiple real exports or official docs |
| Observed | Seen in one real export |
| Inferred | Likely from UI/docs but not exported yet |
| Unknown | Do not generate raw JSON without user validation |

## Rules

- Never promote an inferred field to verified without an export.
- Preserve field names exactly.
- Track type variants.
- Track missing fields and empty arrays.
- Capture examples structurally, not by copying huge content bodies.
- Separate Lumia schema from Loom item, Loom tool, and pack extras schema.

