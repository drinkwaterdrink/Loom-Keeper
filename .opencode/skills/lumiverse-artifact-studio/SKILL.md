---
name: lumiverse-artifact-studio
description: Generate complete Lumiverse creation bundles from a concept. Use when the user wants an all-in-one Lumiverse add-on, product, ecosystem, extension-plus-pack, Council system, preset/worldbook set, or creative artifact package with plans, specs, JSON drafts, extension scaffolding, validation, and handoff prompts.
---

# Lumiverse Artifact Studio

## Mission

Turn a rough Lumiverse idea into a complete production brief and artifact bundle: architecture, Spindle plan, pack/Lumia blueprint, Loom tool specs, preset/worldbook plan, JSON drafts, validation matrix, and next-build tasks.

## Workflow

1. Read `references/studio-workflow.md`.
2. Classify the concept using `references/artifact-bundle-spec.md`.
3. If creating a workspace, run:

```bash
node .opencode/skills/lumiverse-artifact-studio/scripts/create-artifact-workspace.mjs <target-dir> <project-name>
```

4. Fill the generated files from `assets/artifact-brief.template.md`.
5. Route specialized implementation:
   - Spindle code: `lumiverse-spindle-architect`
   - Packs/Lumias: `lumiverse-pack-lumia-forge`
   - JSON outputs: `lumiverse-json-factory`
   - Presets/world books: `lumiverse-preset-worldbook-forge`
   - Evaluation: `lumiverse-artifact-evaluator`
   - Audit: `lumiverse-quality-auditor`

## Bundle Output

For a serious project, create:

- `00-brief.md`
- `01-architecture.md`
- `02-spindle-extension.md`
- `03-pack-lumia-blueprint.md`
- `04-preset-worldbook-plan.md`
- `05-json-manifest.md`
- `06-validation.md`
- `07-ai-builder-prompt.md`
- optional `drafts/` with normalized JSON specs

## Rules

- Separate code from content.
- Produce normalized specs before raw JSON.
- Mark unverified schemas clearly.
- Create user-facing workflows, not just technical surfaces.
- Include validation and failure behavior in every bundle.
- Keep each artifact small enough to test independently.

