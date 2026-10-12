---
name: create-component
description: Create a UI component in Jelar Shad (feature component or shared primitive) with a pixel-matched skeleton, design tokens, i18n and accessibility. Use whenever adding a component that renders data.
---

# Create a component

0. Invoke the `frontend-design` skill; respect `docs/06-design-system.md` and the approved screens in `docs/design/`.
1. Search first: `src/components/ui`, `src/components/layout`, `src/features/*/components`. Extend an existing component instead of duplicating.
2. Decide location (`docs/07-coding-standards.md` §1): shared primitive → `components/ui`; feature → `features/<x>/components/<kebab-name>.tsx`.
3. Server Component by default. If it needs state/events, split: server wrapper + small `'use client'` leaf.
4. Structure the file:
   ```tsx
   function XShell({ ...slots }) { /* outer layout: grid, padding, aspect ratios */ }
   export function X({ data }: XProps) { return <XShell ...real content /> }
   export function XSkeleton() { return <XShell ...Skeleton / SkeletonText / SkeletonImage /> }
   ```
   - Text skeletons use the same typography class as real text (`<SkeletonText className="text-title" />`).
   - Images: fixed `aspect-ratio`; real images via `<AppImage>`.
   - Real text uses `line-clamp-*` so height never changes.
5. Styling: Tailwind with semantic tokens only (`bg-card`, `text-muted-foreground`), `cn()` for conditional classes. No raw hex colors.
6. Text: `t('feature.key')`; numbers/currency/dates via `lib/format`.
7. Accessibility: semantic elements, labels, focus ring, ≥ 44px tap targets, status not by color alone.
8. Register `X` + `XSkeleton` on `/dev/skeletons` with fixture data; check overlay alignment.
9. If logic is reusable, move it to `src/hooks` or `src/lib` with a unit test.
