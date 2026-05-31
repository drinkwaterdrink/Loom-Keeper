# Lumiverse Knowledge Index

Local canonical docs created for this workspace:

| File | Purpose |
| --- | --- |
| `downloaded_lumiverse_docs/lumiverse-user-guides-ai-context.md` | Full user guide scrape. Search when exact user-facing behavior, pack workflow, Council UI, image gen, data portability, or feature docs matter. |
| `downloaded_lumiverse_docs/lumiverse-developer-docs-ai-context.md` | Full developer docs scrape. Search when exact Spindle API, permissions, DTOs, frontend UI APIs, or backend API shapes matter. |
| `downloaded_lumiverse_docs/lumiverse-extension-and-content-framework.md` | Distilled master framework for extension/content creation. Read for broad architecture. |
| `downloaded_lumiverse_docs/lumiverse-ai-builder-prompt.md` | Ready-to-paste prompt for another AI builder. |
| `downloaded_lumiverse_docs/sillytavern-to-lumiverse-conversion-worksheet.md` | Conversion intake worksheet. |
| `downloaded_lumiverse_docs/lumiverse-pack-lumia-blueprint-template.md` | Pack/Lumia authoring template. |
| `downloaded_lumiverse_docs/lumiverse-extension-proposal-template.md` | Extension proposal template. |

Project-local Lumiverse skills:

| Skill | Purpose |
| --- | --- |
| `.agents/skills/lumiverse-artifact-studio` | Concept-to-bundle creation workbench. |
| `.agents/skills/lumiverse-pack-schema-collector` | Learn verified pack schemas from exports. |
| `.agents/skills/lumiverse-artifact-evaluator` | Score packs/prompts/presets/extensions. |
| `.agents/skills/lumiverse-json-factory` | Generate validated JSON artifacts. |
| `.agents/skills/lumiverse-extension-test-harness` | Mock Spindle backend runtime. |
| `.agents/skills/lumiverse-st-migration-cookbook` | Concrete ST migration recipes. |

Recommended searches:

```bash
rg -n "registerInterceptor|Context Handlers|registerTool|TOOL_INVOCATION|UI Placement" downloaded_lumiverse_docs/lumiverse-developer-docs-ai-context.md
rg -n "Managing Packs|Lumia|Loom Tool|Council Tools|Prompt Variables" downloaded_lumiverse_docs/lumiverse-user-guides-ai-context.md
rg -n "SillyTavern|conversion|pack schema|permission" downloaded_lumiverse_docs/lumiverse-extension-and-content-framework.md
```

Use official web docs only when the user asks for latest/current behavior or local docs look stale.
