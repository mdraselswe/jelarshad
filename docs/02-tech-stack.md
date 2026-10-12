# 02 — Tech Stack

Versions below were current stable in October 2026. Always install `@latest` and pin the
resolved version in `package.json`. Re-check major versions before starting.

## 1. Hard constraint
> The MVP must be deployable and operable using only free-tier services, **with no credit card
> attached to any account**. If a quota is exceeded the service pauses or degrades — it never bills.
> Every usage-based service must have application-level limits and monitoring.

## 2. Runtime & framework
| Concern | Choice | Version line | Why |
|---|---|---|---|
| Runtime | Node.js LTS | 24.x | Next.js 16 requires Node 20+; use LTS |
| Package manager | pnpm | latest | Fast, strict, disk-efficient |
| Framework | Next.js (App Router, Turbopack) | 16.x | RSC, streaming, Suspense, metadata API, caching |
| UI library | React | 19.x | Server Components, `useActionState`, `useOptimistic` |
| Language | TypeScript | 5.x, `strict: true` | Safety, AI-friendly |
| Styling | Tailwind CSS | 4.x | CSS-first config, tokens via `@theme` |
| UI primitives | shadcn/ui (Radix based, copied into repo) | latest | We own the code → swappable, accessible |
| Icons | lucide-react | latest | Tree-shakeable |
| Toasts | sonner | latest | Tiny, accessible |
| Theming | own `ThemeScript` + `useTheme` (CSS variables, `data-theme`) | — | No dependency; custom themes = one CSS file + registry entry |
| Validation | zod | 4.x | Shared client/server schemas |
| Client data (only where needed) | @tanstack/react-query | 5.x | Search suggestions, infinite lists, optimistic updates |
| Dates | date-fns + `bn` locale | latest | "৫ দিন আগে" formatting |
| Class merging | clsx + tailwind-merge (`cn()`) | latest | Standard with shadcn |

Not used in MVP (by decision): state managers (Redux/Zustand), animation libraries,
map libraries, form libraries (React 19 actions + zod are enough), CSS-in-JS.

## 3. Backend services (all free, no card)
| Concern | Service | Free limits to respect | Swappable via port |
|---|---|---|---|
| Database | Supabase PostgreSQL | 500 MB DB, 5 GB egress/month, pauses after 7 days idle | `*Repository` ports |
| Auth | Supabase Auth — Google OAuth only | 50,000 MAU | `AuthProvider` |
| Images | Cloudinary Free | 25 credits/month (1 credit ≈ 1 GB storage or 1 GB bandwidth or 1,000 transformations); no overage billing | `StorageProvider` |
| Image alt option | ImageKit Free | verify limits at sign-up | `StorageProvider` |
| Hosting | Vercel Hobby | non-commercial only; 5K image transformations (we don't use them) | portable Next.js build |
| Analytics | Vercel Web Analytics (free tier) or none | free event quota | `AnalyticsProvider` (noop default) |
| Error tracking | console + Vercel logs (MVP) | — | `ErrorReporter` |
| Source control / CI | GitHub + GitHub Actions | free minutes | — |

Postgres extensions: `pg_trgm` (fuzzy search), `unaccent`, `postgis` (stored now, used in V1.5).

## 4. Quality tooling
| Tool | Purpose |
|---|---|
| ESLint (flat config) + `eslint-config-next` | Lint, `no-restricted-imports` boundary rules |
| Prettier + `prettier-plugin-tailwindcss` | Formatting + class sorting |
| Vitest | Unit tests for `lib/`, `services/` |
| Playwright | E2E smoke + CLS checks for skeleton swaps |
| Lighthouse CI (GitHub Action) | Perf / SEO / a11y budgets on PRs |
| Husky + lint-staged | Pre-commit lint/format |
| `@next/bundle-analyzer` | JS budget checks |
| Supabase CLI | Local DB, migrations, type generation |

## 5. Fonts (self-hosted at build via `next/font/google`)
| Role | Font | Why |
|---|---|---|
| Headings, numbers, badges | Anek Bangla (500–700) | Modern geometric Bangla, beautiful Bangla digits |
| Body, labels, inputs | Noto Sans Bengali (400–600) | Most complete conjunct coverage, highly readable |
Defined only in `src/config/fonts.ts`. Details in `docs/06-design-system.md`.

## 6. Scripts (package.json)
```
dev            next dev --turbopack
build          next build
start          next start
lint           eslint .
typecheck      tsc --noEmit
test           vitest run
test:e2e       playwright test
test:themes    vitest run scripts/check-themes.ts
format         prettier --write .
db:start       supabase start
db:migrate     supabase migration up
db:types       supabase gen types typescript --local > src/infrastructure/supabase/database.types.ts
db:seed        tsx scripts/seed.ts
analyze        ANALYZE=true next build
```

## 7. Environment variables (`.env.example`)
```
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # prod: https://jelarshad.shojashapta.com
NEXT_PUBLIC_LAUNCHED=false                  # false = "শিগগিরই আসছে" page + noindex in production
PREVIEW_ACCESS_SECRET=                      # /?preview=<secret> lets founding contributors in before launch
NEXT_PUBLIC_DEFAULT_LOCALE=bn

# Provider selection (swap vendors here)
AUTH_PROVIDER=supabase
DB_PROVIDER=supabase                      # supabase | mock (CI, e2e, offline dev)
NEXT_PUBLIC_STORAGE_PROVIDER=cloudinary   # cloudinary | imagekit | supabase (public: image URL builder runs in browser)
ANALYTICS_PROVIDER=noop            # noop | vercel

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # server only, never exposed

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=             # server only
CLOUDINARY_UPLOAD_FOLDER=shojashapta

# Admin bootstrap
ADMIN_EMAILS=rrasel141@gmail.com
```
All env access goes through `src/config/env.ts` (zod-validated, fails build if missing).

## 8. When to leave free tiers (V3)
- Revenue/ads start → Vercel Pro or move to Cloudflare/other host.
- DB > 400 MB or regular pauses hurt → Supabase Pro.
- Image credits > 80% for 2 months → paid image plan or R2 (with spend controls).
Because vendors sit behind ports, each move is one adapter + one env change.
