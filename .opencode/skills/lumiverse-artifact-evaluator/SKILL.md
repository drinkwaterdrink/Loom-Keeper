---
name: lumiverse-artifact-evaluator
description: Score and improve Lumiverse packs, Lumias, Loom tools, presets, prompt blocks, world books, Spindle extension plans, SillyTavern conversions, and full artifact bundles. Use when the user asks whether an artifact is good, useful, too noisy, too large, poorly triggered, weak for Council, token-wasteful, or ready to ship.
---

# Lumiverse Artifact Evaluator

## Mission

Judge whether a Lumiverse artifact will actually improve outputs. Score usefulness, execution reliability, token cost, Council value, conversion fidelity, import safety, and failure modes.

## Workflow

1. Identify artifact type.
2. Read `references/evaluation-rubric.md`.
3. For packs, run:

```bash
node .opencode/skills/lumiverse-artifact-evaluator/scripts/score-lumiverse-pack.mjs <pack.json>
```

4. For text specs, run:

```bash
node .opencode/skills/lumiverse-artifact-evaluator/scripts/score-text-artifact.mjs <file.md>
```

5. Report scores and concrete fixes.

## Score Dimensions

- Purpose clarity
- Lumiverse-native fit
- Council usefulness
- Prompt reliability
- Token economy
- Distinctiveness
- Import/build safety
- Mobile/user ergonomics
- Failure behavior

## Output Format

```text
Overall: /100

Scores:
- Purpose:
- Reliability:
- Token economy:
- Lumiverse-native fit:

Critical fixes:

High-value improvements:

Keep:
```

