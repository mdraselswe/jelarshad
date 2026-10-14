# 00 — Decision Log

Every product/tech decision made during planning (Oct 2026), with the reason and what was rejected.
**Do not reverse a decision here without the owner's explicit approval.** New decisions: append a row.

## Product
| # | Decision | Why | Rejected / deferred |
|---|---|---|---|
| P1 | Name **জেলার স্বাদ (Jelar Shad)**, tagline "জেলায় জেলায় আসল স্বাদের খোঁজ" (renamed from ShojaShapta / সোজাসাপ্টা on 2026-10-12: the old name did not say what the app is for) | The name says the purpose: the taste of each district. The logo symbol stays | সোজাসাপ্টা, খাঁটি, স্বাদের ঠিকানা, Food Trail BD |
| P2 | Scope = "বাংলাদেশে কোথায় কী খাবেন?", not only famous foods | Famous-only data runs out; local favorites (e.g. মিরপুরের চিকেন চাপ) keep data growing | Famous-food-only directory |
| P3 | Core loop: search → eat → react → verify/correct → better data | The verification loop is the USP vs Google Maps / Foodpanda reviews | — |
| P4 | Simplicity first: one search box, max 3 taps per action, buttons over typing | Owner requirement: never complicated | Separate search modes, 8 rating categories |
| P5 | Data model: Food / Place / **Dish** (ratings live here, backend only) / **RegionalFame** (curated "famous for") | "Rating কাচ্চি" is meaningless; "Place X-এর কাচ্চি" is. Famous ≠ best | Rating foods or whole places |
| P6 | Reactions 😋/😐/👎 only after "আমি খেয়েছি"; one per user per dish | Prevents voting without eating | Plain like/dislike |
| P7 | Verification: ✅ ঠিক / ⚠️ আংশিক / ❌ ভুল + reason chips + optional evidence; ✏️ edit suggestions | Owner's original idea, structured | Free-text-only "false" comments |
| P8 | Claims per type with freshness TTLs (price 30d, hours 30d, availability 60d, status/location 180d) | One "6 months" rule was arbitrary | Single global staleness |
| P9 | Wording: "কমিউনিটির প্রিয়" not "সেরা"; "কমিউনিটি নিশ্চিত" not "Verified" | Honest and defensible | — |
| P10 | Ranking: display ❤️ % ; sort by Wilson lower bound (😐 = not positive); low-count items stay visible with "এখনও পর্যাপ্ত অভিজ্ঞতা নেই" | 3/3 must not beat 950/1000; small new places still discoverable | Plain % sort; hiding < 5; recency weighting (MVP) |
| P11 | Photos optional (encouraged), never mandatory | Lower contribution barrier | Mandatory photo |
| P12 | Launch data: all 64 districts with curated RegionalFame; 10–15 districts with places | Empty districts kill first impressions; full 64 deep data is too much | 64 × 3–5 places at launch |
| P13 | Gamification MVP-light: passport, stamps (incl. "আবিষ্কারক"), points. V1.5: levels, streak, weekly challenge, achievements | Owner wants people to come back; MVP-light reuses existing data | All gamification in V2; all of it in MVP |
| P14 | Viewing/search/share never need login; Google login only when acting | Friction kills growth | Login wall |
| P15 | Gamification V1.5 pulled into the product on 2026-10-12 (owner approved the "জেলার স্বাদ" design): **levels** (XP = points total, 8 named levels), **daily streak** (Bangladesh days; a missed day resets the run but the best run is kept, no penalty), **daily and weekly missions** (counted from earlier actions, bonus XP paid once per period), **badges** derived from counts, and an **opt-in weekly board**. All computed from `point_events`, so one migration only (0062: opt-in flag, index, board function). Still no spending of points, no extra tracking | Owner wants the app to feel alive and bring people back; reuses the data we already keep | A separate XP/streak table (drift risk), public profiles, always-on leaderboard |

## Technology & cost
| # | Decision | Why | Rejected / deferred |
|---|---|---|---|
| T1 | **MVP uses only free tiers and no credit card on any account** | Owner requirement; a quota hit must pause a service, never bill | Any paid service |
| T2 | Next.js 16 (App Router) + TS strict + Tailwind 4 + shadcn/ui, PWA (installable, no offline in MVP) | Fast, SEO, owner knows Next/TS | Offline mode/Serwist in MVP (→ V1.5) |
| T3 | Supabase Free: Postgres (+pg_trgm, unaccent, PostGIS) + Google Auth only | Free, SQL, RLS, auth included | Firebase |
| T4 | **No phone OTP / SMS**, no Facebook login in MVP | SMS costs money; FB auth upkeep. Phone OTP → V2, Facebook → reconsider V1.5 | Twilio/BD SMS gateway |
| T5 | Images: **Cloudinary Free (no card)**, browser-compressed WebP, 2 sizes (400/1080), originals never stored, max 2 per experience, daily limits | No overage billing without a card | **Cloudflare R2** (needs card; budget alerts don't cap spend), Supabase Storage (5 GB egress) as primary, Vercel image optimizer |
| T6 | Hosting: Vercel Hobby while non-commercial; no Vercel-only APIs | Hobby forbids commercial use → move before ads/revenue | Building on Vercel KV/Blob/Edge Config |
| T7 | Every vendor behind a port; SDKs only in `src/infrastructure/` (ESLint-enforced) | Owner wants to swap packages/services anytime | Direct `supabase.from()` in components |
| T8 | All limits/thresholds in `src/config/app.config.ts` | Tunable without code changes | Hard-coded numbers |
| T9 | No AI APIs, push, email flows, payments, cron in MVP | Cost + scope | — |
| T10 | Supabase 7-day idle pause: restore manually during dev; no keep-alive cron for now | Avoid extra moving parts | GitHub Actions ping (add only if it becomes a problem) |

## Design & UX
| # | Decision | Why | Rejected |
|---|---|---|---|
| D1 | Skeleton-first loading on every page, identical layout, CLS = 0 | Owner requirement | Spinners |
| D2 | Colors: grey ground, white cards, **indigo `#4F46E5` = actions**, **gold `#F59E0B` = rewards**, green/amber/red = status only | Owner approved; each color has one meaning | Green+turmeric "signboard" (A), photo-heavy white (B), black buttons + orange |
| D3 | Fonts: Anek Bangla (headings/numbers) + Noto Sans Bengali (body) | Modern + most readable Bangla | Inter, Hind Siliguri |
| D4 | Small rounded thumbnails, grouped list cards, floating bottom nav, bottom sheets | Clean, modern, info-first | Large hero photos |
| D5 | Motion: CSS-only, subtle, meaningful (press, pop, toast, sheet, progress, stamp thump), reduced-motion respected | Modern feel without heavy libraries | Animation libraries, fade-up everywhere |
| D6 | Passport stamps look like real round rubber stamps | Owner request | Square badges |
| D7 | Approved screens live in `docs/design/` and win over prose when they differ | Single visual source of truth | — |
| D8 | UI work always uses the `frontend-design` skill within this design system | Owner request | — |
| D9 | Logo = **"কথার সিল"** (concept 6): seal + speech-bubble tail + dashed ring + bowl + gold straight line; assets in `brand/` | Combines honest talk, passport stamp and food; works at 20px | Concepts 1–5 and 7–11 (pin, plain stamp, bowl face, monogram, line bubble, rice bowl, scallop) |
| D10 | Theming from day one: system/light/dark via `data-theme` + CSS token files + `src/config/themes.ts` registry; custom themes later = one CSS file + one registry entry; contrast auto-checked | Owner requirement; future custom themes without touching components | `dark:` class overrides, `next-themes` dependency, cookie-based SSR theme (would make pages dynamic) |
| D11 | Logo is theme-aware: in-app always `<LogoMark />`/`<LogoLockup />` using `--logo-*` tokens; dark variant `#8B85FF` + `#FBBF24`; SVG favicon follows OS scheme | Logo must look right in every theme | Static `<img>` logos in the app |
| D12 | Fonts self-hosted as static per-weight woff2 files (`public/fonts`, `@font-face` + `unicode-range`); **five files**: Anek 700 (Bengali), Noto 400 + 600 (Bengali + Latin); only Noto 400 + Anek 700 (Bengali) preloaded; other weights map to the nearest one | `next/font/google` serves ~260 KB of variable files for these weights and preloads whole families; mobile LCP failed the 2.5 s budget in CI | `next/font/google` variable fonts; preloading every weight |
| T11 | Address **jelarshad.shojashapta.com** for now (a subdomain of the owner's existing domain; a main domain may come later). `shojashapta.com` and `www` redirect (308) to `NEXT_PUBLIC_SITE_URL` once it points elsewhere (`src/lib/legacy-host.ts`) | Owner's choice; the app must be movable to its own domain without code changes | shojashapta.com apex |
| T12 | CI/CD: GitHub Actions runs tests → migrations → `vercel deploy --prebuilt --prod`; Vercel git auto-deploy off; PR previews on dev DB; two Supabase projects (dev/prod) | Tests and migrations always run before code goes live; host-portable | Vercel automatic git deploys (no test/migration gate) |
| T13 | Trunk-based git: one task per branch/PR, squash-merge, `phase-N` tags + releases | Small reviewable steps, easy rollback per phase | Long-lived develop branch |
| T14 | Production live from Phase 0 behind `NEXT_PUBLIC_LAUNCHED=false` (coming-soon, noindex); public launch in Phase 9 | Real deploy pipeline exercised from day one without exposing unfinished app | Deploying only at the end |
| T15 | CI performance budget: Lighthouse Performance ≥ 85 and LCP ≤ 4.0 s (simulated Slow 4G; was 3.5 s, raised by the owner on 2026-10-11 for the colorful design refresh); targets stay 95 / 2.5 s, revisit in Phase 8.5 | Measured: Next.js app shell is LCP ≈ 2.45 s with no web fonts; the designed Bangla fonts add ~1 s. Owner chose to keep the design | Dropping web fonts for system fonts (D3); keeping 95 / 2.5 s and blocking Phase 0 |
| T16 | Launch content (64 districts, famous-for foods, a few well-known places) ships as migration 0007 generated from `scripts/seed/data.ts`; rows are flagged `is_seed` and removed with `select purge_seed_data();`. No invented ratings, prices or reviews | Owner supplies no data yet and wants the site to open with content that is easy to replace by real contributions. Invented reviews or prices would mislead real users | Importing a hand-written place list now; a seed that never runs in production; unflagged seed rows |
| T17 | Responsive layouts: phone (<768px) unchanged; tablet (`md`, 768px) keeps the bottom nav with two-column grids; desktop (`lg`, 1024px) uses a top bar, breadcrumb and sidebars in a 1200px container. Designs approved by the owner on 2026-10-08 in `docs/design/desktop/` | The owner wanted a real desktop and tablet experience, not a stretched phone column; two breakpoints keep CSS small and every page testable | Phone layout at every width; separate desktop app; more than two breakpoints |
| T18 | Infrastructure renamed on 2026-10-13 to match the app: GitHub repo `mdraselswe/jelarshad`, Vercel project `jelarshad`, Supabase projects `jelarshad-dev` / `jelarshad-prod` (display names only: project refs, URLs and keys are unchanged). The local folder, `package.json` name, `supabase/config.toml` project_id and the Cloudinary upload folder keep the old name on purpose (changing them would orphan local volumes and stored images) | Names should say what the app is; nothing may break | Renaming the Cloudinary folder or the local database id |
| T19 | Launch data = the project's own seed data only. The owner confirmed (2026-10-13) that no customer has contributed yet and the few test entries may be lost, so a one-off script (`scripts/ops/reset-user-content.sql`, run by the owner in the PROD SQL editor) removes every user contribution and keeps seed rows, districts, areas and accounts. Every leftover use of the old name was renamed, including the Cloudinary upload folder (`jelarshad`) and the local database id | A clean start before launch; nothing real is lost | Keeping test rows, merging them into the seed |
| T20 | Directory-listed places may be seeded (owner's explicit yes, 2026-10-15): a **name, an area and a kind of food** taken from a listing site's own address/area field (bdplaces.com), only when the listing states where the place is. Never ratings, review counts, prices, hours or addresses. Newspapers stay the preferred source; delivery apps are not used. Flagged `is_seed`, corrected by people through the verify flow | Newspapers name almost no shops in Savar, Rampura, Badda, Banasree and Gazipur, and the owner wants those areas to open with something | Waiting for newspaper articles; storing ratings or review text |
