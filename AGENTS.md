# AGENTS.md — Rules for anyone writing code in Jelar Shad (জেলার স্বাদ)

These rules are non-negotiable. If a request conflicts with them, stop and ask.

## 0. Before you start any task
0. Read `docs/00-decisions.md` once per session — decisions there are final; never re-propose rejected options (e.g. R2, phone OTP, mandatory photos).
1. Read `docs/01-product-spec.md` (is this in MVP scope? If not, don't build it).
2. Read the doc for the area you touch (architecture, database, skeletons, design system).
3. Use the matching skill in `.claude/skills/` if one exists.

## 1. Scope
- Build only what `docs/01-product-spec.md` lists under **MVP**. V1.5/V2/V3 features are not built,
  but architecture must not block them.
- No paid services. No credit card on any account. No SMS, push, AI APIs, payments.

## 2. Architecture (see `docs/03-architecture.md`)
- Layers: `app/` (routes) → `features/*` (UI + actions) → `services/` (business logic)
  → `core/ports` (interfaces) ← `infrastructure/*` (vendor adapters).
- **Vendor SDKs (`@supabase/*`, `cloudinary`, analytics SDKs) may only be imported inside
  `src/infrastructure/**`.** ESLint enforces this. Everything else uses ports via `getServices()`.
- Business rules (ranking, claim status, limits) live in `src/services/` and `src/config/`, never in components.
- All tunable numbers (limits, thresholds, TTLs, page sizes) live in `src/config/app.config.ts`.

## 3. Loading UX (see `docs/05-loading-skeletons.md`)
- Every route segment has `loading.tsx` rendering a page skeleton.
- Every component that renders fetched data exports a sibling `*Skeleton` with **identical layout and dimensions**.
- Async page sections are wrapped in `<Suspense fallback={<XSkeleton />}>`.
- Never show a spinner for content. Spinners are only allowed inside buttons during submit.
- Target CLS = 0 when real data replaces a skeleton.

## 4. Code quality (see `docs/07-coding-standards.md`)
- TypeScript strict. No `any`. No non-null `!` unless commented why.
- DRY: before writing a helper, search `src/lib`, `src/hooks`, `src/components/ui`. Reuse or extend.
- Pure helpers → `src/lib/`. Shared React logic → `src/hooks/`. Feature-only → `src/features/<x>/hooks|utils`.
- Validate every input crossing a boundary with Zod (`schemas.ts`).
- Server actions return `Result<T>` (`{ ok: true, data } | { ok: false, error }`) — never throw to the client.
- Server Components by default. Add `"use client"` only for interactivity, as low in the tree as possible.

## 5. UI
- **Before any UI work (new page, component, restyle), invoke the `frontend-design` skill** and follow it,
  within the constraints of `docs/06-design-system.md` (tokens, fonts, approved screen designs in
  `docs/design/`). The design system wins on conflicts; the skill decides everything the doc leaves open.
- Bangla-first. No hard-coded user-facing strings: use `t('key')` from `src/i18n`.
- Use design tokens and shadcn/ui primitives in `src/components/ui`. **No raw hex/rgb colors and no `dark:` color
  classes in components** — only token utilities (`bg-card`, `text-primary-text`…). Every component must work in
  every theme registered in `src/config/themes.ts` (see `docs/06-design-system.md` §2b).
- The logo is only rendered via `<LogoMark />` / `<LogoLockup />` (theme-aware). Never `<img src="…logo…">` inside the app.
- Mobile-first. Every screen must work at 360px width, one-handed. Tablet (768px) and desktop (1024px) layouts follow `docs/design/desktop/`.
- Images only through `<AppImage>` (custom loader, never the Vercel optimizer).
- Wording: never "সেরা" for rankings — use "কমিউনিটির প্রিয়". Never "Verified" — use "কমিউনিটি নিশ্চিত".

## 6. Data & security (see `docs/04-database.md`, `docs/09-security-and-limits.md`)
- Schema changes only via SQL migration files in `supabase/migrations/`. Never edit the DB by hand.
- RLS on every table. Public read only for published rows. Writes require auth and pass rate limits.
- Browsing, search and share never require login. Login (Google) only when the user acts.

## 6b. Git & delivery (see `docs/11-delivery-workflow.md`)
- One roadmap task per branch `phase-<N>/<task>-<slug>`; Conventional Commits; PR into `main`; squash-merge.
- Never push to `main` directly. Never skip or weaken a failing check to get green — fix the cause.
- Migrations must be backward compatible (expand → deploy → contract). `main` auto-deploys to production.
- After the last task of a phase: tag `phase-N`, write the release notes, tick the phase in `10-roadmap.md`.
- Add new decisions to `docs/00-decisions.md`.

## 7. Definition of done for any task
- [ ] Types pass (`pnpm typecheck`), lint passes (`pnpm lint`), tests pass (`pnpm test`).
- [ ] Skeleton exists and matches layout (checked on `/dev/skeletons`).
- [ ] Strings in message files, works in every registered theme (check `/dev/themes`), works at 360px.
- [ ] `pnpm test:themes` passes when theme files changed.
- [ ] No vendor import outside `infrastructure/`.
- [ ] New config values documented in `app.config.ts` comments.
- [ ] Committed on the task branch, PR open, CI green, preview checked.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
