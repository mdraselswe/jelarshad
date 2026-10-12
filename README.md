# জেলার স্বাদ (Jelar Shad) — https://jelarshad.shojashapta.com

> জেলায় জেলায় আসল স্বাদের খোঁজ — বাংলাদেশে কোথায় কী খাবেন?

A community-powered, community-validated food discovery web app (PWA) for Bangladesh.
People add where a food is good, others confirm or correct it, and everyone can find
what to eat in any district, area or place.

---

## How to use this documentation pack

Put this whole folder at `E:\Code\Personal\shojashapta\` **before** you scaffold the app,
then scaffold Next.js into the same folder (see `docs/10-roadmap.md`, Phase 0).
AI coding tools (Claude Code, Cursor, Copilot, Codex) read `AGENTS.md` / `CLAUDE.md`
automatically and follow the rules in `docs/`.

| File | What it is | Read when |
|---|---|---|
| `AGENTS.md` | Non-negotiable rules for any AI or human writing code | Always — first |
| `CLAUDE.md` | Pointer for Claude Code to `AGENTS.md` | Auto-loaded |
| `docs/00-decisions.md` | Every decision + why + what was rejected | First, once per session |
| `docs/01-product-spec.md` | MVP scope, screens, user flows, copy | Before building any feature |
| `docs/02-tech-stack.md` | Every technology choice + why + free-tier limits | Before installing anything |
| `docs/03-architecture.md` | Folder structure, layers, swappable providers | Before writing code |
| `docs/04-database.md` | Full schema, indexes, RLS, SQL functions | Before migrations |
| `docs/05-loading-skeletons.md` | The skeleton-first loading system | Before building any page/component |
| `docs/06-design-system.md` | Tokens, fonts (Bangla + English), components | Before any UI |
| `docs/07-coding-standards.md` | DRY, hooks, utils, naming, errors, testing | Always |
| `docs/08-seo-performance-pwa.md` | SEO, Core Web Vitals budgets, PWA | Before pages ship |
| `docs/09-security-and-limits.md` | RLS, rate limits, uploads, free-tier protection | Before any write path |
| `docs/10-roadmap.md` | Phase-by-phase tasks with done criteria | To plan each work session |
| `docs/11-delivery-workflow.md` | Git flow, CI/CD, auto-deploy, domain jelarshad.shojashapta.com, rollback | Before the first commit |
| `docs/ci/` | GitHub Actions / Vercel / Lighthouse templates (installed in Phase 0.3) | Phase 0.3 |
| `brand/` | Final logo, app icons, favicon, share image + usage rules | Before header, manifest, OG |
| `docs/design/` | Approved screen designs (markup reference) | Before building any screen |
| `.claude/skills/*` | Step-by-step recipes for repeated tasks | When doing that task |

## Locked decisions (do not re-debate during MVP)

1. **Free-tier only, no card on any service.** If a limit is hit, a service pauses — a bill never arrives.
2. Next.js (App Router) + TypeScript (strict) + Tailwind CSS v4 + shadcn/ui.
3. Supabase Free: PostgreSQL + Google Auth only. No SMS, no email flows, no push, no AI.
4. Images: Cloudinary Free (no card), compressed in the browser to WebP, two sizes, originals never stored.
5. Every vendor sits behind an interface (port) — swapping a vendor touches one folder.
6. Every page and every data component has a matching skeleton with identical layout.
7. Bangla-first UI, all strings in message files (English-ready).
8. Hosting: Vercel Hobby during non-commercial MVP; code stays portable (no Vercel-only APIs).

## Glossary

| Term | Meaning |
|---|---|
| Food | Generic dish concept — কাচ্চি, দই, চমচম |
| Place | Anywhere food is sold — restaurant, shop, street cart, bakery, home kitchen |
| Dish | A specific Food at a specific Place — "Place X-এর কাচ্চি". Ratings live here. Backend only, no own page |
| RegionalFame | "This district is famously associated with this food" — admin-curated, never a rating |
| Experience | "আমি খেয়েছি" + 😋/😐/👎 (+ optional comment, photo, price) |
| Claim | A checkable fact: availability, price, place status, location |
| Claim vote | ✅ ঠিক / ⚠️ আংশিক / ❌ ভুল on a claim |
| Edit suggestion | "current → correct" proposal reviewed by admin |
