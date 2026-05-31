# Pack Authoring Workflow

## 1. Choose Pack Type

- Council team
- Genre/style pack
- Utility prompt pack
- Add-on tool pack
- Hybrid companion pack for a Spindle extension

## 2. Draft Blueprint

Use:

```text
Pack name:
Author:
Version:
Theme:
Lumias:
Loom items:
Loom tools:
Recommended Council setup:
Validation:
```

## 3. Build Lumias

Make each Lumia role-distinct. Use a common world/palette if desired, but avoid identical behavior.

## 4. Add Loom Content

Use Loom items for reusable style and utility text. Use Loom tools for sidecar analysis. If raw JSON schema is not verified, provide manual Content Workshop instructions.

## 5. Generate Raw JSON Only When Safe

Raw import JSON is safe for Lumia-only packs using the verified schema in `verified-pack-schema.md`. For Loom items/tools, require a real export sample or mark output as a normalized blueprint.

## 6. Validate

- Analyze JSON with `scripts/analyze-pack.mjs`.
- Import through Content Workshop.
- Export again.
- Compare item counts and key fields.
- Confirm Council can assign Lumias and tools.

