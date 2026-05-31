# Lumiverse Audit Checklist

## Spindle Extension

- Manifest exists and identifier is valid.
- Entry files exist.
- Permissions are minimal and justified.
- Capabilities are not used as permission shortcuts.
- Backend bundle avoids blocked APIs.
- User-specific messages target `userId`.
- Per-user settings use `userStorage`.
- Frontend renders before backend state.
- Frontend cleanup is returned.
- UI uses native placements.
- Prompt hooks skip quiet generations unless intentional.
- Interceptor timeout is reasonable.
- Council tools have good descriptions and schemas.

## Pack/Lumia/Loom

- Pack fields match verified schema.
- Lumias have distinct advisory domains.
- Lumia behavior is bounded.
- Tool assignments are focused.
- Loom macros are supported.
- Loom tool fields are not invented without export proof.
- Import/export roundtrip is planned.

## Presets/World Books

- Prompt blocks have clear positions.
- Categories are used for variants.
- World book keys are not too broad.
- Entry token cost is controlled.
- Recursion/sticky/cooldown settings are intentional.
- Character/world book links are explicit.

## Conversion

- ST implementation details are not copied blindly.
- DOM patches were replaced.
- State was migrated to correct scope.
- Prompt behavior was mapped to correct Lumiverse hook.
- Unsupported behavior is documented.

