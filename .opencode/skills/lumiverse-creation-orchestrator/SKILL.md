---
name: lumiverse-creation-orchestrator
description: Coordinate the full Lumiverse creation workflow. Use when the user asks for an ultimate Lumiverse bot, broad Lumiverse architecture, Spindle extensions, SillyTavern-to-Lumiverse conversion, packs, Lumias, Loom tools, Council add-ons, presets, world books, characters, personas, or when the request spans multiple Lumiverse artifact types and needs routing to specialist skills and reference files.
---

# Lumiverse Creation Orchestrator

## Mission

Act as the routing brain for Lumiverse work. Classify the request, load only the needed specialist references, and coordinate the correct build path across Spindle code, declarative packs, Lumias, Loom items, Loom tools, presets, world books, and migration workflows.

## First Move

1. Identify the artifact type: Spindle extension, SillyTavern conversion, pack/Lumia/Loom content, preset/world book/character/persona data, debugging/audit, or hybrid.
2. Read `references/routing-map.md`.
3. Read `references/knowledge-index.md` if exact docs or local artifacts are needed.
4. Delegate mentally to the right project-local specialist skill:
   - `lumiverse-spindle-architect` for Spindle extensions.
   - `lumiverse-st-converter` for SillyTavern conversions.
   - `lumiverse-pack-lumia-forge` for packs, Lumias, Loom items, and Council tools.
   - `lumiverse-preset-worldbook-forge` for presets, prompt blocks, world books, characters, personas, and importable data.
   - `lumiverse-quality-auditor` for review, validation, scanner checks, and regression risks.
   - `lumiverse-artifact-studio` for complete concept-to-bundle project generation.
   - `lumiverse-pack-schema-collector` for learning schemas from real Content Workshop exports.
   - `lumiverse-artifact-evaluator` for scoring usefulness and readiness.
   - `lumiverse-json-factory` for normalized-to-JSON artifact generation.
   - `lumiverse-extension-test-harness` for mock Spindle backend testing.
   - `lumiverse-st-migration-cookbook` for common ST migration recipes.

## Classification

Use this decision table:

| User intent | Route |
| --- | --- |
| Build an extension, Spindle project, backend/frontend module, `spindle.json`, UI panel, macro, interceptor, context handler, generation tool, or code-backed Council tool | `lumiverse-spindle-architect` |
| Convert SillyTavern extension, script, preset module, lorebook, Quick Reply, slash command, or DOM-patched UI | `lumiverse-st-converter` plus relevant builder skill |
| Create or refine a pack, Lumia persona, Loom item, Loom tool, Council team, advisor layer, or content workshop asset | `lumiverse-pack-lumia-forge` |
| Create or convert presets, prompt blocks, prompt variables, world books, characters, personas, regex scripts, or data imports | `lumiverse-preset-worldbook-forge` |
| Review, lint, validate, debug, or check safety/import/build/runtime risks | `lumiverse-quality-auditor` |
| User wants a complete product or ecosystem | Start here, then combine all relevant specialist workflows |
| User gives a broad concept and wants files/plans/specs generated | `lumiverse-artifact-studio` |
| User provides multiple pack exports or asks to learn pack schema | `lumiverse-pack-schema-collector` |
| User asks if a pack/prompt/preset/tool is good or worth keeping | `lumiverse-artifact-evaluator` |
| User asks for import-ready or structured JSON artifacts | `lumiverse-json-factory` |
| User wants to test a Spindle extension without installing it | `lumiverse-extension-test-harness` |
| User asks for common ST migration patterns or examples | `lumiverse-st-migration-cookbook` |

## Operating Principles

- Keep exact documentation in references; keep active instructions compact and procedural.
- Prefer Lumiverse-native surfaces over SillyTavern habits.
- Separate code artifacts from content artifacts.
- Treat pack JSON schema as verified only when derived from a real Lumiverse export.
- Build with progressive disclosure: read the distilled reference first, then search full docs only when exact API details matter.
- When converting, preserve user intent rather than copying implementation details blindly.
- Use the smallest permission set that can perform the real API calls.
- Make every artifact testable: import/export, build, scanner, runtime, mobile UI, or prompt-behavior validation as appropriate.

## Output Contract

For any broad creation task, produce or implement:

1. Behavior contract.
2. Artifact classification.
3. Lumiverse-native architecture.
4. Permissions or pack schema notes.
5. Data model and migration plan.
6. Files/templates/scripts created or changed.
7. Validation checklist.
8. Known unknowns, especially unverified pack JSON fields or current-doc ambiguities.

## Reference Files

- `references/routing-map.md`: task routing and artifact decision tree.
- `references/knowledge-index.md`: where to find full local docs and generated framework files.
- `references/creation-brief.md`: reusable intake template for complex Lumiverse projects.
