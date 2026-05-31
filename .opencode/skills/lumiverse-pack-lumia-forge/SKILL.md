---
name: lumiverse-pack-lumia-forge
description: Design, generate, validate, and refine Lumiverse packs, Lumias, Loom items, Loom tools, Council advisor teams, Council tool assignments, and pack import/export specs. Use when the user asks for Lumia personas, Content Workshop packs, Council add-ons, Loom macros, custom Council tools, pack JSON, advisor systems, or creative Lumiverse content bundles.
---

# Lumiverse Pack Lumia Forge

## Mission

Create powerful Lumiverse content packs: distinctive Lumias, useful Loom items, focused Loom tools, and Council team designs that improve generation without hijacking the story.

## Workflow

1. Read `references/pack-authoring-workflow.md`.
2. If raw pack JSON is involved, run `scripts/analyze-pack.mjs <pack.json>` and read `references/verified-pack-schema.md`.
3. For Lumia/persona design, read `references/lumia-design-patterns.md`.
4. For Loom items and Council tools, read `references/loom-and-council-tools.md`.
5. Produce both:
   - A human-readable blueprint.
   - Import-ready JSON only when fields are verified by sample exports or user-provided export schema.
6. Validate with the pack checklist and, if possible, Content Workshop export/import roundtrip.

## Verified Pack Core

Observed Lumiverse pack exports from the user's examples use:

```json
{
  "packName": "Pack Name",
  "packAuthor": "Author",
  "coverUrl": "",
  "version": 1,
  "packExtras": [],
  "lumiaItems": [],
  "loomItems": []
}
```

Observed Lumia fields:

```json
{
  "lumiaName": "Name",
  "lumiaDefinition": "Definition text",
  "lumiaPersonality": "Personality text",
  "lumiaBehavior": "Behavior text",
  "avatarUrl": "",
  "genderIdentity": 2,
  "authorName": "Author",
  "version": 1
}
```

Treat Loom item/tool raw JSON fields as unverified unless a real export with those objects is available.

## Lumia Quality Bar

Each Lumia must have:

- A clear advisory domain.
- A distinct voice.
- A bounded behavior statement.
- Council role recommendation.
- Tool assignment recommendation.
- Participation chance recommendation.
- Explicit limits: advise, do not write final prose; do not override user intent; do not treat prior deliberations as binding.

## Pack Types

| Pack type | Contents |
| --- | --- |
| Council team | 3-8 Lumias with complementary roles |
| Genre director pack | Style Lumias plus Loom style items |
| Utility pack | Loom utility items and Loom tools |
| Conversion pack | ST prompt modules converted into Lumias/Loom items |
| Hybrid companion pack | Pack content designed to pair with a Spindle extension |

## Scripts

- `scripts/analyze-pack.mjs <pack.json>`: summarize schema, counts, field coverage, and warnings.
- `scripts/build-lumia-pack.mjs <normalized-pack.json> <out.json>`: convert the normalized authoring spec in `assets/normalized-pack.template.json` into observed Lumia pack JSON.

## Validation

- Pack metadata is complete.
- Lumias are role-distinct.
- Tool prompts are focused and structured.
- Result variables are stable.
- Loom macros are supported by Lumiverse docs.
- Raw JSON uses verified fields only.
- Import/export roundtrip is required before calling a raw pack final.

