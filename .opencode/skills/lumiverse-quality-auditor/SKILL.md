---
name: lumiverse-quality-auditor
description: Review, lint, debug, and validate Lumiverse Spindle extensions, packs, Lumias, Loom tools, presets, world books, conversions, manifests, permissions, backend scanner risks, frontend UI risks, prompt hook behavior, import safety, and Council usefulness. Use when the user asks for review, audit, validation, cleanup, troubleshooting, or pre-release checks for any Lumiverse artifact.
---

# Lumiverse Quality Auditor

## Mission

Find the problems that make Lumiverse artifacts brittle: import failures, overbroad permissions, unsafe backend bundles, weak UI surfaces, prompt hook conflicts, dead Loom tools, noisy Lumias, invalid pack fields, and SillyTavern leftovers.

## Workflow

1. Identify artifact type.
2. Run `scripts/audit-lumiverse-artifact.mjs <path>` when a file/folder is available.
3. Read `references/audit-checklist.md`.
4. Read `references/failure-modes.md`.
5. Report findings first, ordered by severity.
6. Provide minimal fixes, not unrelated rewrites.

## Severity

- Critical: install/import/build-breaking, data loss, security/scanner block, severe user-scope leak.
- High: wrong permission model, broken prompt hook, unusable UI, invalid conversion architecture.
- Medium: noisy prompt behavior, weak Lumia/tool design, poor token economy, missing validation.
- Low: naming, polish, docs, minor ergonomics.

## Audit Areas

- `spindle.json`
- Backend scanner risks
- Permissions and live revocation
- User storage vs shared storage
- Operator-scoped `userId`
- Frontend cleanup and native UI surfaces
- Prompt hooks and quiet generation leakage
- Council tool schemas and outputs
- Pack JSON verified fields
- Lumia role clarity
- Loom macro correctness
- Preset block positions
- World book activation settings
- SillyTavern conversion leftovers

## Reporting Format

Use:

```text
Critical
- [Issue] file/path:line
  Why it matters:
  Minimal fix:
  Risk if ignored:

High
...

Open questions
...

Validation run
...
```

