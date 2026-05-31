# Verified Pack Schema Notes

These notes are derived from the user's supplied Lumiverse pack exports:

- `Lost Lumias.json`
- `Disco_Elysium_Skills_NoAvatar.json`

Both samples are Lumia-only packs. They verify the top-level pack shape and Lumia item fields. They do not verify raw Loom item or Loom tool JSON fields.

## Top-Level Fields

| Field | Type | Observed |
| --- | --- | --- |
| `packName` | string | yes |
| `packAuthor` | string | yes |
| `coverUrl` | string | yes, can be empty |
| `version` | number | yes, observed `1` |
| `packExtras` | array | yes, observed empty |
| `lumiaItems` | array | yes |
| `loomItems` | array | yes, observed empty |

## Lumia Fields

| Field | Type | Required by observed packs | Notes |
| --- | --- | --- | --- |
| `lumiaName` | string | yes | Display name |
| `lumiaDefinition` | string | yes | Core description |
| `lumiaPersonality` | string | yes | Voice/personality |
| `lumiaBehavior` | string | yes | How the Lumia advises/acts |
| `avatarUrl` | string | yes | Can be empty |
| `genderIdentity` | number | yes | Observed values: 0 feminine, 1 masculine, 2 neutral |
| `authorName` | string | yes | Item author |
| `version` | number | yes | Observed `1` |

## Raw JSON Caution

Loom item and Loom tool fields should be considered unverified until a real Lumiverse export containing those objects is provided. For those, produce a blueprint and ask for export validation, or create them manually through Content Workshop.

## Safe Lumia-Only Pack Skeleton

```json
{
  "packName": "Example Pack",
  "packAuthor": "Author",
  "coverUrl": "",
  "version": 1,
  "packExtras": [],
  "lumiaItems": [],
  "loomItems": []
}
```

