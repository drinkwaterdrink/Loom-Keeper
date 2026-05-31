# Known Pack Schema

Current verified data comes from Lumia-only sample exports.

## Top Level

- `packName`: string
- `packAuthor`: string
- `coverUrl`: string
- `version`: number
- `packExtras`: array
- `lumiaItems`: array
- `loomItems`: array

## Lumia

- `lumiaName`: string
- `lumiaDefinition`: string
- `lumiaPersonality`: string
- `lumiaBehavior`: string
- `avatarUrl`: string
- `genderIdentity`: number
- `authorName`: string
- `version`: number

## Still Needed

Export packs containing:

- one Narrative Style Loom item
- one Loom Utility item
- one Retrofit item
- one Loom Tool with structured fields
- one pack extra if the UI supports it

