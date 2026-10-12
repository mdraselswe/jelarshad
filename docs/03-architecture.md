# 03 — Architecture

## 1. Goals
1. **Swap any package or vendor by changing one adapter + one env value.**
2. Business logic is framework- and vendor-free (testable with plain Vitest).
3. Fast by default: Server Components, cached reads, streamed sections with skeletons.
4. DRY: one place for each concern.

## 2. Layers (ports & adapters)

```
┌──────────────────────────────────────────────────────────────┐
│ app/            Routes, layouts, loading.tsx, metadata         │  ← thin
├──────────────────────────────────────────────────────────────┤
│ features/<x>/   UI components + skeletons, hooks, actions,     │
│                 queries, schemas for one domain                │
├──────────────────────────────────────────────────────────────┤
│ services/       Business logic (ranking, claims, search,       │
│                 contributions, limits) — pure TS               │
├──────────────────────────────────────────────────────────────┤
│ core/           Domain types + PORTS (interfaces)              │
├──────────────────────────────────────────────────────────────┤
│ infrastructure/ ADAPTERS: supabase, cloudinary, analytics…     │  ← only place for vendor SDKs
└──────────────────────────────────────────────────────────────┘
config/  env, app.config (limits/thresholds), fonts, providers
lib/     pure helpers      hooks/  shared React hooks      i18n/  messages
```

Dependency rule: arrows point **down only**, and `services` depends on `core/ports`, never on `infrastructure`.
`infrastructure` implements `core/ports`. The container wires them.

## 3. Folder structure
```
jelarshad/
├─ AGENTS.md  CLAUDE.md  README.md
├─ docs/                         # this documentation
├─ .claude/skills/               # AI coding recipes
├─ public/                       # icons, manifest images, static seed images
├─ scripts/                      # seed.ts, check-limits.ts
├─ supabase/
│  ├─ migrations/                # 0001_init.sql, 0002_search.sql, …
│  └─ seed/                      # districts.sql, regional_fame.csv
├─ e2e/                          # Playwright
└─ src/
   ├─ app/
   │  ├─ (site)/
   │  │  ├─ layout.tsx           # header, bottom nav
   │  │  ├─ page.tsx  loading.tsx
   │  │  ├─ search/page.tsx  loading.tsx
   │  │  ├─ food/[slug]/page.tsx  loading.tsx  opengraph-image.tsx
   │  │  ├─ place/[slug]/…
   │  │  ├─ district/[slug]/…  district/[slug]/[foodSlug]/…
   │  │  ├─ add/page.tsx  loading.tsx
   │  │  └─ me/page.tsx  loading.tsx
   │  ├─ (admin)/admin/…
   │  ├─ auth/callback/route.ts
   │  ├─ api/search/route.ts     # GET suggestions (cacheable)
   │  ├─ dev/skeletons/page.tsx  # dev-only parity page
   │  ├─ sitemap.ts  robots.ts  manifest.ts  not-found.tsx  error.tsx  global-error.tsx
   │  └─ layout.tsx              # <html lang="bn">, fonts, providers
   ├─ features/
   │  ├─ food/        { components/, hooks/, queries.ts, actions.ts, schemas.ts, types.ts }
   │  ├─ place/       …
   │  ├─ district/    …
   │  ├─ dish/        …  (ranking UI pieces, no page)
   │  ├─ experience/  …
   │  ├─ claim/       …
   │  ├─ search/      …
   │  ├─ media/       …  (uploader, compression hook)
   │  ├─ auth/        …  (LoginGate, useRequireAuth)
   │  ├─ share/       …
   │  ├─ profile/     …
   │  └─ admin/       …
   ├─ components/
   │  ├─ ui/          # shadcn primitives + Skeleton primitives + AppImage
   │  └─ layout/      # Header, BottomNav, PageShell, Section, EmptyState
   ├─ services/       # foodService.ts, rankingService.ts, claimService.ts, searchService.ts, …
   ├─ core/
   │  ├─ domain/      # types: Food, Place, Dish, Experience, Claim, Result, Page<T>
   │  └─ ports/       # FoodRepository, PlaceRepository, …, AuthProvider, StorageProvider,
   │                  # AnalyticsProvider, RateLimiter, CacheInvalidator, ErrorReporter
   ├─ infrastructure/
   │  ├─ supabase/    # client.server.ts, client.browser.ts, repositories/*, auth.ts, database.types.ts
   │  ├─ cloudinary/  # storage.ts, loader.ts
   │  ├─ analytics/   # noop.ts, vercel.ts
   │  ├─ next/        # cacheInvalidator.ts (revalidateTag wrappers)
   │  └─ container.ts # getServices(): wires adapters by env
   ├─ config/         # env.ts, app.config.ts, fonts.ts, site.ts, routes.ts
   ├─ lib/            # cn, format/, text/, slug, result, wilson, url, image/, seo/
   ├─ hooks/          # useDebounce, useMediaQuery, useShare, useOnline, useInfiniteScroll …
   ├─ i18n/           # messages/bn.json, messages/en.json, t.ts, server.ts, client.tsx
   ├─ styles/         # globals.css (tokens, @theme)
   └─ proxy.ts        # Next 16 request proxy: refresh auth session, protect /me /add /admin
```

## 4. Ports (interfaces) — the swap points
```ts
// core/ports/storage.ts
export interface StorageProvider {
  createUploadTicket(input: { userId: string; purpose: MediaPurpose }): Promise<UploadTicket>; // signed, short-lived
  confirmUpload(input: { key: string; userId: string }): Promise<StoredMedia>;
  delete(key: string): Promise<void>;
  url(key: string, variant: 'thumb' | 'large'): string;      // pure, also used by image loader
}

// core/ports/auth.ts
export interface AuthProvider {
  getSession(): Promise<Session | null>;
  requireUser(): Promise<AppUser>;                          // throws AuthRequired
  signInWithGoogleUrl(redirectTo: string): Promise<string>;
  signOut(): Promise<void>;
}

// core/ports/repositories.ts (one per aggregate)
export interface FoodRepository {
  bySlug(slug: string): Promise<Food | null>;
  topDishes(foodId: string, opts: PageOpts): Promise<Page<DishWithPlace>>;
  create(input: NewFood, by: string): Promise<Food>;
  …
}
// PlaceRepository, DistrictRepository, DishRepository, ExperienceRepository,
// ClaimRepository, EditSuggestionRepository, ReportRepository, SavedRepository,
// MediaRepository, SearchRepository, RateLimitRepository, AdminRepository

// core/ports/cache.ts
export interface CacheInvalidator { invalidate(tags: CacheTag[]): Promise<void>; }

// core/ports/analytics.ts
export interface AnalyticsProvider { track(event: AnalyticsEvent): void; }
```

## 5. The container
```ts
// infrastructure/container.ts  (server-only)
import 'server-only';
import { env } from '@/config/env';
export const getServices = cache(() => {
  const repos = env.DB_PROVIDER === 'supabase' ? supabaseRepositories() : assertNever(env.DB_PROVIDER);
  const storage = { cloudinary: cloudinaryStorage, imagekit: imagekitStorage }[env.NEXT_PUBLIC_STORAGE_PROVIDER]();
  const auth = supabaseAuth();
  const cache = nextCacheInvalidator();
  return {
    food: createFoodService({ repos, cache }),
    place: createPlaceService({ repos, cache }),
    experience: createExperienceService({ repos, cache, limits: appConfig.limits }),
    claim: createClaimService({ repos, cache, rules: appConfig.claims }),
    search: createSearchService({ repos }),
    media: createMediaService({ repos, storage, limits: appConfig.media }),
    auth,
  };
});
```
Services are factory functions receiving their dependencies (easy to test with fakes).

**Mock adapters** (`src/infrastructure/mock/`): in-memory repositories + storage backed by fixtures in
`src/infrastructure/mock/fixtures/` (a few districts, foods, places incl. `/food/doi`, `/place/sample-place`,
`/district/bogura`). Selected with `DB_PROVIDER=mock` / `NEXT_PUBLIC_STORAGE_PROVIDER=mock`. Used by CI builds,
Playwright e2e, Lighthouse, `/dev/*` pages and offline local work — CI never touches real Supabase/Cloudinary.

`/api/health` returns `{ ok: true, version: <git sha> }` (used by the deploy smoke test).

A second, **browser-safe** entry `infrastructure/client.ts` exports only pure, secret-free helpers
chosen by `NEXT_PUBLIC_*` env: `imageLoader` (URL builder for `<AppImage>`), `getBrowserAuth()`
(start Google sign-in), `analytics`. Never put secrets or server SDK calls there.

## 6. Enforcing boundaries (ESLint)
```js
// eslint.config.mjs (excerpt)
{
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/infrastructure/**'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [
      { group: ['@supabase/*', 'cloudinary', 'imagekit*', '@vercel/analytics*'],
        message: 'Vendor SDKs only in src/infrastructure. Use a port via getServices().' },
      { group: ['@/infrastructure/*', '!@/infrastructure/container', '!@/infrastructure/client'],
        message: 'Import the container (server) or infrastructure/client (browser-safe), not adapters.' },
    ]}],
  },
},
{ files: ['src/services/**', 'src/core/**', 'src/lib/**'],
  rules: { 'no-restricted-imports': ['error', { patterns: ['react', 'next/*', '@/features/*', '@/app/*'] }] } },
```

## 7. Data flow
**Reads (pages):** `page.tsx` (Server Component) → `features/x/queries.ts` (`'use cache'` + `cacheTag`) → service → repository.
**Client reads (search suggestions, infinite lists):** `useQuery` → `/api/search` route → service.
**Writes:** client form → Server Action in `features/x/actions.ts`:
```
1. parse with zod schema            → Result.error('validation')
2. auth.requireUser()               → Result.error('auth_required')  (UI opens LoginGate)
3. rateLimiter.check(user, action)  → Result.error('rate_limited')
4. service.doThing()                → domain errors as Result
5. cache.invalidate(tags)           → affected food/place/district pages refresh
6. return Result.ok(data)
```
Shared wrapper `defineAction(schema, handler, { auth, rateLimit })` in `lib/action.ts` keeps steps 1–3 and 6 DRY.

## 8. Rendering & caching strategy (Next.js 16)
| Route | Mode | Cache tags invalidated by |
|---|---|---|
| `/` | Static shell + cached sections | `home`, any new experience (throttled) |
| `/food/[slug]` | Cached + streamed sections | `food:<id>`, `dish:<id>` |
| `/place/[slug]` | Cached + streamed | `place:<id>`, `dish:<id>`, `claim:place:<id>` |
| `/district/[slug]` | Cached | `district:<id>`, `fame:<id>` |
| `/search` | Dynamic, results cached per query short TTL | — |
| `/me`, `/add`, `/admin` | Dynamic, user-specific | — |

Use Cache Components (`cacheComponents: true`, `'use cache'`, `cacheTag`, `cacheLife`) — verify the
exact API in the Next 16 docs when implementing. Static params: pre-render the 64 district pages and
top N food pages at build; the rest render on first request and stay cached.

Portability: avoid Vercel-only APIs (Edge Config, KV, Vercel Blob). Everything above works with `next start`.

## 9. Configuration
- `config/env.ts` — zod-validated env, split `serverEnv` / `clientEnv`.
- `config/app.config.ts` — every tunable number:
```ts
export const appConfig = {
  pagination: { default: 20, max: 50 },
  search: { minQueryLength: 2, debounceMs: 200, suggestionLimit: 8, similarityThreshold: 0.25 },
  ranking: { minExperiencesToRank: 5, favoriteMinExperiences: 10, wilsonZ: 1.96 },
  claims: { ttlDays: { price: 30, opening_hours: 30, availability: 60, place_status: 180, location: 180 },
            minVotes: 3, confirmRatio: 0.7, disputeRatio: 0.6 },
  limits: { perDay: { experience: 30, place_create: 10, food_create: 10, claim_vote: 50, edit_suggestion: 20, report: 20, upload: 10, save: 200 } },
  media: { maxPhotosPerExperience: 2, maxUploadBytes: 8_000_000,
           variants: { thumb: { width: 400, quality: 0.72 }, large: { width: 1080, quality: 0.78 } } },
  text: { commentMax: 500, noteMax: 300, nameMax: 80 },
  points: { experience: 10, place_create: 20, discoverer: 20, claim_vote: 5, edit_accepted: 15 },
  passport: { totalDistricts: 64, homeMiniStamps: 3 },
  seo: { minPlacesToIndexDistrict: 1 },
} as const;
```
- `config/fonts.ts`, `config/site.ts` (name, URL, social), `config/routes.ts` (typed route builders — no string URLs in components).

## 10. Error handling
- `Result<T, E>` for expected failures (validation, auth, limits, not found).
- `app/error.tsx` / `global-error.tsx` for unexpected crashes, with friendly Bangla message + retry.
- `notFound()` for missing slugs; `not-found.tsx` offers search.
- All unexpected errors go through `ErrorReporter` port (console adapter in MVP).

## 11. Auth flow
- Google OAuth through `AuthProvider`. `/auth/callback` exchanges code, upserts `profiles`.
- `proxy.ts` refreshes session cookies and redirects unauthenticated users away from `/me`, `/add`, `/admin`.
- In-page actions use `<LoginGate>`: if `Result.error('auth_required')`, open a bottom sheet "চালিয়ে যেতে গুগল দিয়ে লগইন করুন" and resume the action after login (store intent in URL `?next=`).
- Admin = `profiles.role = 'admin'` (bootstrapped from `ADMIN_EMAILS`).

## 12. Images
Upload: pick file → `useImageCompression` (canvas → WebP, 2 variants, dominant color) →
action `createUploadTicket` (auth + limit) → direct upload to provider → action `confirmUpload` → `media` row.
Display: `<AppImage>` wraps `next/image` with a **custom loader from `StorageProvider.url()`**,
explicit width/height or aspect ratio, `placeholder` = dominant color, lazy by default, `priority` only for LCP.
Vercel image optimization is never used.
