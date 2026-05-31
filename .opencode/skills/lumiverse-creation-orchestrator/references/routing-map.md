# Lumiverse Routing Map

Use this file to route broad Lumiverse requests.

## Primary Routes

| Request signal | Primary skill | Secondary skills |
| --- | --- | --- |
| "extension", "Spindle", `spindle.json`, backend/frontend, macro, interceptor, context handler, API, drawer UI | `lumiverse-spindle-architect` | `lumiverse-quality-auditor` |
| "convert SillyTavern", ST extension, Quick Reply, slash command, lorebook, ST preset, ST script | `lumiverse-st-converter` | Relevant builder skill |
| "pack", "Lumia", "Loom", "Council", "advisor", "tool pack", "Content Workshop" | `lumiverse-pack-lumia-forge` | `lumiverse-quality-auditor` |
| "preset", "prompt block", "prompt variable", "execution order", "world book", "character import", "persona" | `lumiverse-preset-worldbook-forge` | `lumiverse-quality-auditor` |
| "review", "lint", "debug", "validate", "why is this broken", "install failed" | `lumiverse-quality-auditor` | Original builder skill |
| "complete bundle", "artifact studio", "turn this idea into everything", "project kit" | `lumiverse-artifact-studio` | All relevant specialist skills |
| "schema", "exported pack", "infer fields", "learn pack JSON" | `lumiverse-pack-schema-collector` | `lumiverse-pack-lumia-forge`, `lumiverse-json-factory` |
| "score", "evaluate", "is this good", "token cost", "Council value" | `lumiverse-artifact-evaluator` | `lumiverse-quality-auditor` |
| "JSON factory", "import-ready JSON", "normalized spec" | `lumiverse-json-factory` | `lumiverse-pack-schema-collector` |
| "test harness", "mock Spindle", "test backend" | `lumiverse-extension-test-harness` | `lumiverse-spindle-architect` |
| "cookbook", "common ST pattern", "recipe" | `lumiverse-st-migration-cookbook` | `lumiverse-st-converter` |

## Hybrid Patterns

Use multiple skills when:

- A pack needs code-backed Council tools: `pack-lumia-forge` + `spindle-architect`.
- A SillyTavern extension contains prompts and UI: `st-converter` + `spindle-architect` + `preset-worldbook-forge`.
- A full "Lumiverse add-on" includes Lumias, presets, world books, and extension UI: all builders, with this orchestrator maintaining the product plan.
- A pack JSON is requested: `pack-lumia-forge` first, then `quality-auditor` for schema/import checks.
- A concept needs an end-to-end production kit: `artifact-studio` first, then builders/factory/evaluator.
- Raw pack generation depends on unverified fields: `pack-schema-collector` before `json-factory`.

## Artifact Boundaries

- Code belongs in Spindle extensions.
- Shareable Council personas and prompt utilities belong in packs.
- Persistent prompt architecture belongs in presets.
- Triggered lore belongs in world books.
- Character/persona identity belongs in character/persona records.
- Validation belongs in `lumiverse-quality-auditor`.

## Do Not

- Treat Lumiverse as SillyTavern with different folders.
- Put full docs into active context by default.
- Invent pack fields without a real export or docs.
- Request broad extension permissions as a convenience.
- Use chat mutation for ordinary prompt guidance.
