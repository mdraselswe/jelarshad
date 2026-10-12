---
name: create-page
description: Create a new route/page in Jelar Shad with its loading skeleton, Suspense sections, metadata and cache tags. Use whenever adding or rebuilding a page under src/app.
---

# Create a page

1. Confirm the page is in MVP scope (`docs/01-product-spec.md` §3.1). If not, stop and ask.
2. Read `docs/05-loading-skeletons.md` and `docs/08-seo-performance-pwa.md`. Invoke the `frontend-design`
   skill and match the approved screen design in `docs/design/` if one exists for this page.
3. Create the route folder under `src/app/(site)/…` (or `(admin)`), with:
   - `page.tsx` — Server Component. Fetch only header data directly; wrap every other data section in
     `<Suspense fallback={<XSectionSkeleton />}>`. Call `notFound()` for missing slugs.
   - `loading.tsx` — returns `<XPageSkeleton />` and nothing else.
   - `generateMetadata` using `buildMetadata()` from `@/lib/seo/metadata` (Bangla title/description, canonical).
   - JSON-LD via `@/lib/seo/jsonld` when the page is public.
   - `opengraph-image.tsx` for shareable public pages.
4. Put data reads in `src/features/<x>/queries.ts` with `'use cache'` + `cacheTag(...)` using tags from `docs/03-architecture.md` §8. Queries call services from `getServices()`, never vendors.
5. Build section components in `src/features/<x>/components/`, each exporting `Component` + `ComponentSkeleton` sharing a layout shell (see the create-component skill).
6. Compose `XPageSkeleton` from section skeletons (no new skeleton markup at page level).
7. Add every component + skeleton pair to `/dev/skeletons`.
8. Add route builder to `src/config/routes.ts`; link with it, never with string literals.
9. Strings → `src/i18n/messages/bn.json`.
10. Verify: 360px width, dark mode, Slow 4G (skeleton → content, no jump), `pnpm typecheck && pnpm lint && pnpm test`.
