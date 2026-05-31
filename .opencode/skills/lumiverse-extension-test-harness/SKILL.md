---
name: lumiverse-extension-test-harness
description: Test Lumiverse Spindle extension backend logic outside Lumiverse with a mock Spindle API, simulated frontend messages, storage stubs, permission grants, event invocations, and runtime logs. Use for extension smoke tests, backend handler tests, tool/interceptor tests, permission behavior, and pre-install validation.
---

# Lumiverse Extension Test Harness

## Mission

Give extension builders a local mock runtime so backend logic can be smoke-tested before installing into Lumiverse.

## Workflow

1. Build the extension if needed.
2. Read `references/harness-workflow.md`.
3. Run:

```bash
node .opencode/skills/lumiverse-extension-test-harness/scripts/run-backend-harness.mjs <extension-dir> [scenario.json]
```

4. Inspect emitted logs, frontend messages, registered hooks, and storage writes.

## What The Harness Covers

- `spindle.onFrontendMessage`
- `spindle.sendToFrontend`
- `spindle.storage`
- `spindle.userStorage`
- `spindle.permissions`
- `spindle.log`
- `spindle.toast`
- event registration through `spindle.on`
- tool/interceptor/context-handler registration capture

## Limits

This is a smoke harness, not a real Lumiverse server. It does not guarantee provider calls, real prompt assembly, real frontend DOM, or exact permission enforcement. Use it to catch basic backend shape problems, then test in Lumiverse.

