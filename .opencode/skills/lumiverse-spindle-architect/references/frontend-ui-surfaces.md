# Frontend UI Surfaces

## Surface Selection

| Surface | Use for |
| --- | --- |
| Drawer tab | Main workspace, dashboards, editors, import flows |
| Settings mount | Compact settings and diagnostics |
| Input bar action | Quick chat action, run, open, toggle |
| Context menu | Message/card-local options |
| Modal | Focused editing, previews, import confirmation |
| Dock panel | Persistent side workflow only when drawer is insufficient |
| Float widget | Tiny status/launcher only |

## Rules

- Use native placements before DOM patching.
- Keep common controls visible and advanced controls collapsed.
- Use Lumiverse CSS variables.
- Avoid cards inside cards.
- Add `title` and `aria-label` to icon-only buttons.
- Use delegated listeners on the root.
- Return cleanup functions.
- Do not cover the chat input on mobile.

## Drawer Skeleton

```ts
const tab = ctx.ui.registerDrawerTab({
  id: 'main',
  title: 'My Extension',
  shortName: 'Mine',
  headerTitle: 'My Extension',
  description: 'Open My Extension',
  keywords: ['tool', 'assistant'],
  iconSvg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l4 8 8 2-8 2-4 8-4-8-8-2 8-2 4-8z"/></svg>',
})

render(tab.root)
const onClick = (event: Event) => {
  const action = (event.target as HTMLElement).closest<HTMLElement>('[data-action]')?.dataset.action
  if (!action) return
}
tab.root.addEventListener('click', onClick)

return () => {
  tab.root.removeEventListener('click', onClick)
  tab.destroy()
}
```

