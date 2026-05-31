# Scanner and Validation

## Backend Scanner Red Flags

Scan bundled backend output for:

```text
fs
node:fs
readFileSync
Bun.file
Bun.write
Bun.spawn
child_process
worker_threads
cluster
net
tls
dgram
http
https
node:sqlite
bun:sqlite
process.env
process.exit
eval(
Function(
new Function
```

## Validation Checklist

- `spindle.json` exists.
- Identifier matches Lumiverse pattern: lowercase, starts with a letter, letters/numbers/underscores.
- Entry backend/frontend files exist if declared.
- Permissions are justified.
- Build/typecheck pass.
- Backend scanner passes or findings are documented.
- Frontend shell renders without backend state.
- Permission revocation is handled.
- Operator-scoped replies are targeted to `userId`.
- UI works on mobile.
- Prompt hooks skip quiet generations unless intended.

