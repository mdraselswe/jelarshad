# 10 — Implementation Roadmap (MVP)

Work phase by phase. One task = one branch = one PR (`docs/11-delivery-workflow.md` §5). Every task is tested
and committed; merging to `main` auto-deploys to https://jelarshad.shojashapta.com. Each phase ends with its **Done when**
list checked, a `phase-N` git tag and a GitHub Release.
Tell your AI tool: *"Read AGENTS.md. Do Phase N, task N.x only. Use the ship-task skill."*

**Every phase ends with the same Ship step:** all checks green on `main` → production deploy succeeded →
smoke-tested on jelarshad.shojashapta.com → `git tag phase-N && git push --tags` → Release notes → tick the phase here.

---

## Phase 0 — Setup & foundations — ✅ done (tag `phase-0`, 2026-10-07)
**0.1 Accounts (no card anywhere):** GitHub repo (owner creates it; private is fine), Supabase **two** projects (`jelarshad-dev`, `jelarshad-prod`), Cloudinary, Vercel (Hobby), Google Cloud OAuth client. Domain `shojashapta.com` bought at a registrar (the only paid item).

**0.2 Scaffold** (Windows PowerShell):
```powershell
cd E:\Code\Personal\shojashapta        # this docs folder already here
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"
# keep existing docs files when prompted
pnpm dlx shadcn@latest init
pnpm add zod @tanstack/react-query @supabase/supabase-js @supabase/ssr cloudinary date-fns lucide-react sonner clsx tailwind-merge server-only
pnpm add -D vitest @vitejs/plugin-react @playwright/test prettier prettier-plugin-tailwindcss husky lint-staged supabase tsx @next/bundle-analyzer @axe-core/playwright
git init -b main; git add -A; git commit -m "chore: scaffold"
git remote add origin https://github.com/<you>/jelarshad.git; git push -u origin main
```
Install Docker Desktop if you want a local Supabase (`pnpm db:start`); otherwise use a second free Supabase project as "dev".

**0.3 Tooling:** strict tsconfig, ESLint boundary rules (`03-architecture.md` §6), Prettier, Husky, scripts (`02-tech-stack.md` §6), Vitest + Playwright config, CI/CD: copy `docs/ci/*.yml` → `.github/workflows/`, `docs/ci/vercel.json` and `docs/ci/lighthouserc.json` → repo root; `vercel link`; add GitHub secrets (`11-delivery-workflow.md` §3); Vercel env vars per environment; branch protection on `main` (PR + CI required); connect `shojashapta.com` (§4) with `NEXT_PUBLIC_LAUNCHED=false` ("শিগগিরই আসছে" page, noindex).

**0.4 Config layer:** `config/env.ts` (zod), `config/app.config.ts`, `config/site.ts`, `config/routes.ts`, `config/fonts.ts`, `.env.example`.

**0.5 Design foundation:** follow `docs/06-design-system.md` exactly — theme system per §2b (`src/styles/themes/light.css`, `dark.css`, `src/config/themes.ts`, `<ThemeScript />`, `useTheme()`, `scripts/check-themes.ts`, `/dev/themes`), `globals.css` `@theme inline` token mapping, type scale utilities, motion tokens + keyframes, Anek Bangla + Noto Sans Bengali via `config/fonts.ts`, shadcn primitives themed. Compare against `docs/design/` screens. Copy logo/icons from `brand/logo/` as listed in `brand/README.md`; copy `brand/react/logo.tsx` to `src/components/brand/logo.tsx`.

**0.6 Shared building blocks:** everything in `07-coding-standards.md` §4 (lib, hooks, layout) with unit tests for `lib`.

**0.7 Skeleton system:** primitives + `LoadingRegion` + shimmer CSS + `/dev/skeletons` page.

**0.8 Architecture skeleton:** `core/domain` types, all `core/ports`, empty adapters, `infrastructure/container.ts`, `infrastructure/client.ts`, `defineAction`, `Result`, i18n (`bn.json`, `getT`, `useT`), **mock adapters + fixtures** (`DB_PROVIDER=mock`), `/api/health`.

**Done when:** `pnpm typecheck && pnpm lint && pnpm test && pnpm build` pass; app shell with header (`<LogoLockup />`), bottom nav and Bangla font renders in system/light/dark with no flash on reload; `pnpm test:themes` passes; importing `@supabase/supabase-js` from a component fails lint; a PR shows green CI + a preview URL; merging deploys to https://jelarshad.shojashapta.com (coming-soon page) and the smoke test passes; tag `phase-0`.

---

## Phase 1 — Database & seed — ✅ done (tag `phase-1`, 2026-10-07)
1.1 Migrations `0001_init.sql` (enums, tables), `0002_indexes.sql`, `0003_functions.sql` (wilson, refresh_dish_stats, search_all, check_rate_limit, is_admin), `0004_rls.sql`.
1.2 Generate types; implement Supabase repositories (read methods first) with row→domain mappers.
1.3 `lib/text/normalize.ts` + 50+ test cases (Bangla, Banglish, typos).
1.4 Seed: 64 districts with aliases; curated RegionalFame CSV (review it yourself); 10–15 districts of places + dishes (start with ~150 places).
1.5 `scripts/seed.ts` using services so search keys match the app.

**Done when:** `search_all` returns kacchi for `kacchi/kachchi/kacci/কাচ্চি/কাচি`; RLS tested (anon can read active, cannot write); seed runs idempotently.

---

## Phase 2 — Read experience (no login) — ✅ done (tag `phase-2`, 2026-10-08)
2.1 Home page + skeleton.  2.2 Search: `/api/search`, `SearchBox` with suggestions, `/search` results + filters (price, place type) + skeletons.
2.3 Food page + all sections + skeletons.  2.4 Place page + "প্রথমবার? এগুলো অর্ডার করুন" + external map link + skeletons.
2.5 District page + district×food page + empty states + skeletons.  2.6 `not-found`, `error`, `global-error`.
2.7 Caching with tags; `generateStaticParams` for districts and top foods.

2.8 Tablet and desktop layouts for the read pages (approved designs in `docs/design/desktop/`): top bar, breadcrumb, two-column food/place/search, responsive grids.

**Done when:** all read pages work on 360px, every theme, Slow 4G shows skeleton → content with no layout shift; Lighthouse CI budgets (`08-seo-performance-pwa.md` §2) pass on food/place/district.

---

## Phase 3 — Auth & contributions — ✅ done (tag `phase-3`, 2026-10-08)
3.1 Google login via `AuthProvider`, `/auth/callback`, `profiles` upsert, `proxy.ts`, `LoginGate`, admin bootstrap.
3.2 `ReactionPicker` + `addExperience` action (optimistic), `refresh_dish_stats`, cache invalidation.
3.3 Add flow `/add` (3 steps) with food/place search-select, duplicate check, area dropdown, location from "আমার লোকেশন".
3.4 Save "খেতে চাই".  3.5 Rate limits wired for all writes.

**Done when:** a new user can log in with Google, add a place + dish + experience in ≤ 3 screens, see the page update; limits return friendly Bangla toasts.

---

## Phase 4 — Trust — ✅ done (tag `phase-4`, 2026-10-08)
4.1 Claims auto-created (availability from add flow, price from experiences).
4.2 `VerifyPrompt` (✅/⚠️/❌ → reason → note → optional evidence), `claimService` status rules, staleness.
4.3 Inline "এখনও ঠিক আছে?" for stale claims and after experiences.
4.4 ✏️ Edit suggestion form.  4.5 Report flow + profanity auto-hide.  4.6 Status badges everywhere.

**Done when:** claim status transitions match unit tests; stale info shows ⏳ with days; reports and edits land in DB.

---

## Phase 5 — Media — ✅ done (tag `phase-5`, 2026-10-08)
5.1 `lib/image/compress` + `useImageCompression`.  5.2 Cloudinary `StorageProvider` (tickets, confirm, delete, url).
5.3 Upload in experience + add flow (max 2).  5.4 `AppImage` with custom loader + dominant color.  5.5 Photo strip + viewer (dynamic import).

**Done when:** a 6 MB phone photo uploads as ≤ 150 KB + ≤ 30 KB WebP; no Vercel image optimization usage; switching `NEXT_PUBLIC_STORAGE_PROVIDER` only needs a new adapter.

---

## Phase 6 — Profile & share — ✅ done (tag `phase-6`, 2026-10-08)
6.1 `/me` with tabs (অবদান · খেয়েছি · খেতে চাই) + skeletons.  6.2 `ShareButton` + `useShare`.
6.3 OG images for food, place, district, district×food (Bangla font).

**Done when:** sharing a food page to Messenger/WhatsApp shows the branded card with Bangla text.

---

## Phase 6b — Passport & points (MVP-light gamification) — ✅ done (tag `phase-6b`, 2026-10-08)
6b.1 Migration: `point_events`, `district_stamps`, `profiles.points_total`, `award_points()`.
6b.2 `passportService` + `pointsService`; hook into experience/place/claim/edit services; revoke on hide.
6b.3 Components: `PassportRing`, `PassportCard`, `Stamp` (SVG, rough filter), `LockedStamp`, `PointsPill`, `DivisionProgressTile` + skeletons.
6b.4 Reward toasts (`+১০`) and stamp-unlock animation after actions; "পরের স্ট্যাম্প" suggestion query.
6b.5 Passport section on `/me`; public share card OG image for the passport.

**Done when:** a first experience in a new district shows the stamp thump + toast, home ring updates, points never double-award (unit tested).

---

## Phase 7 — Admin — ✅ done (tag `phase-7`, 2026-10-08)
7.1 `/admin` guarded by role.  7.2 Queues: reports, disputed claims, edit suggestions, new places, duplicates, flagged media.
7.3 Actions: approve/reject, merge places (move dishes/experiences, set `merged_into`, redirect), hide, ban, edit RegionalFame.
7.4 Maintenance: clean old rate-limit rows, orphan uploads; usage panel (counts of rows, media).

---

## Phase 8 — SEO, PWA, polish — ✅ done (tag `phase-8`, 2026-10-08)
8.1 Metadata helpers on all pages, JSON-LD, canonical, `sitemap.ts` (split), `robots.ts`, noindex thin pages.
8.2 `manifest.ts`, icons, minimal SW, install card.  8.3 `/policy`, `/about`.
8.4 Accessibility pass (axe), keyboard, focus, contrast.  8.5 Performance pass: bundle analyze, budgets in CI (Lighthouse CI).
8.6 E2E: browse flow, add flow, verify flow, CLS checks.

**Done when:** all budgets in `08-seo-performance-pwa.md` pass in CI; installable on Android Chrome.

---

## Phase 9 — Launch (owner actions: see the checklist given with the Phase 8 hand-off)
9.1 Final production checks: prod Supabase auth URLs, Google OAuth origins for jelarshad.shojashapta.com, Cloudinary prod folder, quotas (`11-delivery-workflow.md` §4).
9.1b Set `NEXT_PUBLIC_LAUNCHED=true` in Vercel Production → redeploy → site public and indexable; submit `https://jelarshad.shojashapta.com/sitemap.xml` in Google Search Console; tag `v1.0.0`.
9.2 Final content review (RegionalFame sources, 150+ places).  9.3 Soft launch to 20–30 founding contributors, fix feedback for 1–2 weeks.
9.4 Public launch: Facebook food groups with share cards; university district-vs-district campaign.
9.5 Weekly: check quotas, `search_misses` → add aliases/content, admin queues.

---

## After MVP
Follow `01-product-spec.md` §4 (V1.5 → V2 → V3). Re-read the free-tier exit criteria in `02-tech-stack.md` §8 before monetizing.
