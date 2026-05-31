# Schema Observation Protocol

## Capture

For each export:

- file path
- pack name
- pack author
- version
- top-level keys
- item counts
- field paths
- value types
- array/object nesting
- missing fields

## Promote Confidence

- Verified: multiple exports or official docs.
- Observed: one export.
- Inferred: UI docs imply it, but no export yet.
- Unknown: do not generate raw JSON.

## Report Sections

```text
# Lumiverse Pack Schema Report

Generated:
Files scanned:

Top-level schema:
Lumia schema:
Loom item schema:
Pack extras schema:
Unknowns:
Recommendations:
```

