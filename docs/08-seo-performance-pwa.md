# 08 — SEO, Performance & PWA

## 1. SEO strategy
People search Google in Bangla and Banglish: "বগুড়ার দই কোথায় ভালো", "best kacchi in old dhaka".
Every such question should land on one of our pages.

### URL design (lowercase latin slugs, stable forever)
| Page | URL | Title pattern |
|---|---|---|
| District | `/district/bogura` | বগুড়ার বিখ্যাত খাবার ও কোথায় পাবেন | জেলার স্বাদ |
| Food | `/food/doi` | দই কোথায় ভালো পাওয়া যায়? কমিউনিটির প্রিয় জায়গা | জেলার স্বাদ |
| District × Food | `/district/bogura/doi` | বগুড়ার দই — কমিউনিটির প্রিয় {n}টি জায়গা | জেলার স্বাদ |
| Place | `/place/akbaria-hotel-bogura` | {নাম}, {এলাকা} — কী অর্ডার করবেন | জেলার স্বাদ |
Slug changes create a permanent redirect (keep `slug_history` table in V1.5; avoid renames in MVP).

### Metadata (via `lib/seo/metadata.ts`)
- Unique `title` (≤ 60 chars) and `description` (≤ 155 chars) per page, generated from data, in Bangla.
- `alternates.canonical` on every page; search pages with query params are `noindex, follow`.
- `openGraph` + `twitter` cards with per-page OG image.
- `<html lang="bn">`; when English launches, add `hreflang` alternates.

### Structured data (JSON-LD, `lib/seo/jsonld.ts`)
- Place → `Restaurant` / `FoodEstablishment` / `Bakery` with `address`, `geo`, `servesCuisine`,
  `priceRange`, `aggregateRating` (only when experiences ≥ threshold; map 😋 % to a 1–5 scale honestly
  or omit rating if unsure — never fake stars).
- Food / District pages → `ItemList` of places.
- All pages → `BreadcrumbList`. Home → `WebSite` with `SearchAction` (sitelinks search box).

### Indexing control
- `app/sitemap.ts` with `generateSitemaps()` split by type (districts, foods, places, district-food pairs).
  Include only pages with real content; `lastModified` from latest experience.
- `app/robots.ts`: allow all, disallow `/me`, `/add`, `/admin`, `/api`, `/dev`, `/search?*`.
- Thin pages (district without places, food without dishes) → `robots: { index: false }` until they meet `appConfig.seo` thresholds.

### OG images
`opengraph-image.tsx` per dynamic route using `next/og` (`ImageResponse`), 1200×630: food/place name in
Bangla, ❤️ %, district, জেলার স্বাদ logo. Load the Bangla font file explicitly for the OG renderer
(read the `.ttf` from `public/fonts/` or fetch once and cache). Cached by tag; regenerate on data change.

### Content
- Each food has a 2–3 line "কেন বিখ্যাত" (original writing, not copied).
- Community comments render as server HTML (indexable).
- Internal links: food ↔ places ↔ districts ↔ district-food pairs (breadcrumb + "আরও দেখুন").

## 2. Performance budgets (fail CI if exceeded)
| Metric (mobile, Slow 4G profile) | Budget |
|---|---|
| LCP | ≤ 4.0 s in CI (aim < 2.5 s) — decision T15 |
| INP | < 200 ms |
| CLS | < 0.1 (aim 0) |
| First-load JS per route | < 100 KB gzip (home, food, place, district) |
| Lighthouse Performance | ≥ 85 in CI (aim ≥ 95) — decision T15 |
| Lighthouse SEO / Accessibility / Best Practices | ≥ 95 |
| Thumbnail weight | ≤ 30 KB; large ≤ 150 KB |

Why LCP/Performance are looser (T15, Oct 2026): on Lighthouse's simulated Slow 4G the Next.js app shell
alone scores LCP ≈ 2.45 s with **no** web fonts; the designed Bangla fonts (Anek + Noto, 44–57 KB per weight)
add ~1 s. We keep the design and treat 2.5 s / 95 as targets; Phase 8.5 tries to tighten the CI budget again.

### How we hit them
- Server Components + streaming; client components only at leaves.
- Cached data reads (`'use cache'` + tags); pre-render 64 districts and popular foods at build.
- Self-hosted static font files (decision D12), `display: swap`, `unicode-range` per subset, only 2 preloads.
- Images: pre-compressed WebP, correct `sizes`, lazy except LCP, dominant-color placeholder.
- No map/animation/chart libraries in MVP. Icons tree-shaken.
- Prefetch: Next `<Link>` default prefetch for visible links; disable for long lists (`prefetch={false}`).
- Database: indexes from `04-database.md`, paginate, select only needed columns, denormalized counters.
- Search suggestions endpoint: tiny JSON, `Cache-Control: public, s-maxage=300` for identical queries.
- Bundle check with `pnpm analyze` before each release.

## 3. PWA (MVP = installable, no offline)
- `app/manifest.ts`: `name: "Jelar Shad — জেলার স্বাদ"`, `short_name: "Jelar Shad"`, `lang: "bn"`,
  `start_url: "/?source=pwa"`, `display: "standalone"`, theme/background colors from tokens,
  icons 192, 512, maskable 512, apple-touch-icon 180, `shortcuts` (খুঁজুন, যোগ করুন).
- Service worker `public/sw.js` registered in production only: caches build assets, fonts and icons on first use; public pages network-first with a copy kept for offline; never caches signed-in pages (`/me`, `/add`, `/admin`, `/login`), API calls or non-GET requests; `/offline` is the fallback page
  (keeps install criteria satisfied across browsers, avoids cache bugs). Offline caching (Serwist) is V1.5.
- Custom install card: shown after 2nd visit or first save; `beforeinstallprompt` on Android,
  short "Share → Add to Home Screen" hint on iOS Safari.
- `theme-color` meta: two entries with `media` for light/dark from `src/config/themes.ts`; `useTheme()` updates it when the user picks a theme; `viewport-fit=cover`, safe-area insets on bottom nav.

## 4. Analytics (privacy-friendly, free)
Events through `AnalyticsProvider` (noop by default): `search`, `search_no_result`, `view_food`,
`view_place`, `experience_add`, `claim_vote`, `share`, `install`. No personal data in events.
`search_no_result` queries (normalized) are stored to a small table to guide alias and content work.
