# 06 — Design System, Fonts, Motion & UI

Approved screens: `docs/design/` (markup reference for every MVP screen) and the live canvas
"ShojaShapta স্ক্রিন ডিজাইন" (Claude artifact). When code and this doc disagree with the approved
screens, the screens win; update this doc.

## 1. Feel
Clean, modern, calm. Light cool-grey ground, white cards, one strong action color (indigo), one
reward color (gold). Information first, small rounded thumbnails instead of big photos.
Mobile-first, one-handed: primary actions in the bottom half. Small, meaningful rewards make people
come back (passport, stamps, points).

## 1a. Breakpoints
Mobile first. `md` = 768px (tablet), `lg` = 1024px (desktop); nothing else. Phone: one column, floating bottom nav,
20px gutter. Tablet: 28px gutter, two-column grids, bottom nav stays. Desktop: top bar, 1200px content with a 32px
gutter, breadcrumb, sidebars. The gutter is the `page-x` utility; type sizes step up at `lg` (title 44px, heading 24px).
Approved layouts: `docs/design/desktop/`.

## 1b. Logo
Final logo "কথার সিল" — files and rules in `brand/README.md`. In the app the logo is **always** rendered
with the theme-aware React components `<LogoMark />` / `<LogoLockup />` (`brand/react/logo.tsx` →
`src/components/brand/logo.tsx`). Their colors come only from the `--logo-*` tokens below, so the logo
follows every theme automatically. Use `simple` below 32px. Static files (`mark.svg`, `*-dark.svg`) are for
places outside the app (OG images, social, print).

## 2. Color tokens — every color has one meaning

All UI colors are CSS custom properties. Components use **only** these tokens (via Tailwind utilities
like `bg-card`, `text-muted-foreground`, `bg-primary`) — never raw hex, never `dark:` color overrides.
A theme = one full set of values for every token below.

| Token | Light | Dark | Meaning / use |
|---|---|---|---|
| `--background` | `#F6F6F8` | `#0F0F14` | Page ground |
| `--card` | `#FFFFFF` | `#1A1A22` | Cards, sheets, inputs |
| `--foreground` | `#16161D` | `#F2F2F7` | Primary text |
| `--muted-foreground` | `#5E5E6E` | `#A1A1AE` | Secondary text |
| `--border` | `#E8E8EE` | `#2A2A35` | Card and input borders |
| `--divider` | `#F0F0F4` | `#22222B` | Row dividers inside cards |
| `--muted` | `#EDEDF2` | `#24242E` | Neutral chips, inactive segments |
| `--primary` | `#4F46E5` | `#4F46E5` | **"Tap here"** fills: primary buttons, active states, rank #1 |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary (6.3:1) |
| `--primary-text` | `#4338CA` | `#A5A0FF` | Links and primary-colored text on the ground |
| `--primary-soft` / `-soft-fg` | `#EEF0FF` / `#3730A3` | `#4F46E5`@18% / `#C7C4FF` | Selected chips, tags, info boxes |
| `--reward` | `#F59E0B` | `#FBBF24` | **"Your achievement"**: points, ring, stamps. Text on it is `--reward-foreground` |
| `--reward-foreground` | `#16161D` | `#16161D` | Text on reward fills |
| `--reward-soft` / `-soft-fg` | `#FFF7E6` / `#92400E` | `#F59E0B`@14% / `#FCD34D` | Reward chips and boxes |
| `--success` / soft / fg | `#12A150` / `#E9F8EF` / `#0E7A3D` | `#22C55E` / @14% / `#4ADE80` | 😋 loved, ❤️ %, "কমিউনিটি নিশ্চিত" |
| `--warning` / soft / fg | `#F5A524` / `#FFF6E0` / `#8A5A00` | `#F5A524` / @14% / `#FBBF24` | 😐 okay, "মতভেদ আছে" |
| `--danger` / soft / fg | `#E5484D` / `#FDECEC` / `#B4232A` | `#F05252` / @14% / `#FF8A8A` | 👎 disliked, "ভুল", errors |
| `--stale` / `-fg` | `#EDEDF2` / `#3F3F4C` | `#24242E` / `#C9C9D4` | ⏳ "শেষ নিশ্চিত X দিন আগে" |
| `--toast` / `-fg` | `#16161D` / `#FFFFFF` | `#2E2E3A` / `#FFFFFF` | Toasts |
| `--scrim` | `rgb(22 22 29 / .45)` | `rgb(0 0 0 / .6)` | Behind sheets/dialogs |
| `--skeleton` / `--skeleton-highlight` | `#ECECF1` / `rgb(255 255 255 / .75)` | `#24242E` / `rgb(255 255 255 / .06)` | Loading |
| `--shadow-float` | `0 8px 24px rgb(22 22 29 / .08)` | `0 8px 24px rgb(0 0 0 / .45)` | Floating nav, toast |
| `--logo-mark` | `#4F46E5` | `#8B85FF` | Logo symbol |
| `--logo-accent` | `#F59E0B` | `#FBBF24` | Logo gold line |
| `--logo-text` / `--logo-subtext` | `#16161D` / `#5E5E6E` | `#F2F2F7` / `#A1A1AE` | Logo wordmark / tagline |
| `--stamp-1..4` | `#4F46E5` `#0E7A3D` `#B45309` `#BE185D` | `#8B85FF` `#4ADE80` `#F59E0B` `#F472B6` | Passport stamp inks |

Rules: never use primary for status; never use reward for actions; status always has icon + text, not
color alone. Every text/background pair must pass WCAG AA (4.5:1 text, 3:1 large text and graphics) in
**every** theme — checked automatically (§2b).

## 2b. Theming system (light, dark, system — custom themes later)

**Model.** The active theme is the `data-theme` attribute on `<html>`. No attribute = follow the OS
(`prefers-color-scheme`). Each theme is one CSS file that sets every token in §2.

```
src/styles/
  globals.css            @import tokens + @theme inline mapping (Tailwind utilities → var(--token))
  themes/light.css       :root, [data-theme="light"] { --background: #F6F6F8; … color-scheme: light; }
  themes/dark.css        [data-theme="dark"] { … color-scheme: dark; }
                         @media (prefers-color-scheme: dark) { :root:not([data-theme]) { …same dark values… } }
  themes/<custom>.css    [data-theme="<id>"] { … }   ← future custom themes (e.g. "eid", "boishakh", high-contrast)
src/config/themes.ts     registry: the only list of themes the app knows
```

```ts
// src/config/themes.ts
export const themes = {
  light: { label: 'হালকা', scheme: 'light', metaColor: '#F6F6F8' },
  dark:  { label: 'গাঢ়',   scheme: 'dark',  metaColor: '#0F0F14' },
  // future: eid: { label: 'ঈদ', scheme: 'light', metaColor: '#…', base: 'light' },
} as const satisfies Record<string, ThemeDef>;
export type ThemeId = keyof typeof themes;
export const THEME_PREFERENCES = ['system', ...Object.keys(themes)] as const;  // what the switcher shows
export const THEME_STORAGE_KEY = 'ss-theme';
```

**Tailwind 4 mapping** (`globals.css`): `@theme inline { --color-background: var(--background); --color-card: var(--card); --color-primary: var(--primary); … }` so `bg-card`, `text-primary-text`, `border-border` etc. always resolve to the active theme. Use `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));` only for rare non-color tweaks; colors never need `dark:`.

**No flash on load.** A tiny inline `<ThemeScript />` (≈300 bytes) in `<head>` runs before paint: reads
`localStorage[THEME_STORAGE_KEY]`; if it is a registered theme id, sets `data-theme`; if `system`/missing,
leaves it unset (CSS media query handles it). The root layout stays static/cacheable (no cookies read on
the server). `<html suppressHydrationWarning>`.

**Switching.** `useTheme()` hook (`src/hooks/use-theme.ts`) → `{ preference, resolved, setPreference }`;
writes localStorage, sets/removes `data-theme`, updates `<meta name="theme-color">`. UI: `/me` → সেটিংস →
"থিম": সিস্টেম / হালকা / গাঢ় (segmented control, list generated from `THEME_PREFERENCES`). Theme
change animates with a 200ms cross-fade via the View Transitions API where supported.

**Things that must follow the theme:** all components (tokens only), the logo (`--logo-*`), stamps
(`--stamp-*`), skeletons (`--skeleton*`), charts/bars (status tokens), focus rings, scrollbars
(`color-scheme`), `theme-color` meta (both media variants in `layout.tsx` metadata), the SVG favicon
(`icon.svg` has its own `prefers-color-scheme` rule). Fixed (not themed): PWA install icons, OG images.
User photos never get filters.

**Adding a custom theme later (no component changes):**
1. Copy `themes/light.css` (or dark) to `themes/<id>.css`, change values under `[data-theme="<id>"]`.
2. Add `<id>` to `src/config/themes.ts` (label, scheme, metaColor).
3. Run `pnpm test:themes` — fails if any token is missing or any pair in the contrast matrix is < AA.
4. Check `/dev/themes` (every component + logo + stamps in every theme side by side).

**Automated checks.** `scripts/check-themes.ts` (Vitest): parses every theme file, asserts all tokens
from `themes/light.css` exist, and computes contrast for the pairs: foreground/background,
foreground/card, muted-foreground/card, primary-foreground/primary, primary-text/background,
reward-foreground/reward, *-soft-fg/*-soft, logo-mark/background (≥ 3:1).

## 2c. Colorful layer ("রংধনু", approved Oct 2026)

The calm base (indigo action, gold reward) stays. On top of it:

- **Ground** is a faint lavender (`--background #F4F3FF`), borders and dividers are tinted to match.
- **Gradients** (tokens `--gradient-*`, utilities `bg-grad-*`): `hero` (home), `food`, `place`, `district`
  for the `<HeroBand>` banner with white text; `action` for the primary button, rank #1 and the "যোগ" pill;
  `reward` (gold, text `--on-reward`) for the passport card.
- **Category tones** (`--cat-<coral|pink|violet|sky|amber|teal|green>-soft/-fg`): soft tiles for food letters,
  district chips and list tiles. `toneClass(seed)` picks one from a slug so an item keeps its color;
  `KIND_TONE_CLASS` fixes food = coral, place = violet, district = teal.
- **Cards**: radius 24 (`rounded-card-lg`) with `--shadow-soft`; bottom nav is a full pill.
- Rules unchanged: primary is never a status color, status is icon + text, every pair passes AA
  (`pnpm test:themes` also checks the category pairs).

Approved screens: the "ShojaShapta নতুন ডিজাইন" canvas (mobile and desktop).

## 3. Fonts — perfect Bangla + English

Self-hosted **static per-weight files** (decision D12), not `next/font/google`:
- `public/fonts/<font>-<weight>-<bengali|latin>.woff2` (SIL OFL 1.1, licenses alongside).
- `src/styles/fonts.css` — one `@font-face` per weight × subset with `unicode-range`, `font-display: swap`,
  families `"SS Anek Bangla"` / `"SS Noto Sans Bengali"`.
- `src/styles/globals.css` — `--font-sans` (Noto stack) and `--font-display` (Anek stack) in `@theme`.
- `src/config/fonts.ts` — `FONT_PRELOADS`: only Noto 400 + Anek 700 (Bengali) are preloaded by the root layout.

Why: with several weights `next/font/google` serves one variable file per family (Anek 156 KB, Noto 108 KB)
and preloads whole families — ~260 KB on the critical path, mobile LCP over the 2.5 s budget. Static files
are 44–57 KB each and a page downloads only the weights it uses. Changing a font file? Give it a new name
(`/fonts/*` is cached immutably).

- Anek Bangla: modern geometric Bangla, great for headings and large Bangla digits (৯২%, ৭/৬৪).
- Noto Sans Bengali: most complete conjunct (যুক্তাক্ষর) coverage, very readable at 14–16px.
- **Five font files only** (decision D12, amended): Anek Bangla 700 (Bengali) and Noto Sans Bengali 400 + 600
  (Bengali + Latin). Every extra weight is one more download on the first paint; the home page used to fetch
  nine files (~420 KB) and missed the LCP budget. The browser maps the rest to the nearest weight:
  Anek 500/600 → 700, Noto 500 → 400. So `text-heading` (600) renders in Anek 700, and `text-caption`/`text-nav`
  (500) in Noto 400. Latin characters inside headings (like “?”) come from Noto, the second family in the stack.
  Adding a weight needs a measured reason. No runtime Google request.
- No letter-spacing on Bangla. Never weight < 400. Body line-height 1.7, headings 1.15–1.3.
- Bangla digits in UI via `formatNumber()` (`Intl.NumberFormat('bn-BD')`); currency `৳২৫০–৳৩৮০`.

## 4. Type scale
| Utility | Font | Size / line-height / weight | Use |
|---|---|---|---|
| `text-display` | display | 36 / 1.15 / 700 | Food/district name |
| `text-title-1` | display | 28–30 / 1.25 / 700 | Page titles ("আজ কী খাবেন?", step titles) |
| `text-stat` | display | 40 / 1 / 700 | Big numbers (৯২%) |
| `text-heading` | display | 21 / 1.3 / 600 | Section headings |
| `text-card-title` | body | 16–17 / 1.45 / 600 | Row and card titles |
| `text-body` | body | 16 / 1.7 / 400 | Paragraphs, comments, inputs (16px prevents iOS zoom) |
| `text-meta` | body | 14 / 1.55 / 400 | Area, price, time ago |
| `text-caption` | body | 13 / 1.5 / 500–600 | Chips, pills, counts |
| `text-nav` | body | 12 / 1.4 / 500 | Bottom nav labels (minimum size anywhere) |

## 5. Shape, spacing, elevation
- 4px grid. Page gutter 20px (16px for dense screens like search). Section gap 22–26px.
- Radius scale: chips/pills `full`; inputs 14–16; rows' thumbnails 14; cards 20–24; bottom sheet 28 (top).
- Borders over shadows. Shadow only on floating elements: bottom nav `0 8px 24px rgb(22 22 29 / .08)`,
  toast `0 12px 32px rgb(22 22 29 / .25)`, selected segment `0 1px 3px rgb(22 22 29 / .12)`.
- Tap targets ≥ 44×44. Icon buttons are 44px circles with border.

## 6. Layout patterns
- **Grouped list card**: one white card (radius 20) with rows separated by `--divider` (iOS-style), instead of many separate cards.
- **Rank badge**: 32px rounded square; #1 primary/white, others muted.
- **Score pill**: `৯২%` on success-soft. "নতুন"/few experiences → muted pill.
- **Segmented control**: muted track, white selected segment with small shadow (search tabs, verify ✅/⚠️/❌).
- **Floating bottom nav**: 16px from edges, 66px tall, white pill (no backdrop blur: it is costly to paint), 4 items; center item "যোগ" is a primary pill.
- **Bottom sheet** for verify, login and filters: scrim `rgb(22 22 29 / .45)`, handle bar, radius 28.
- **Empty state** = invitation: dashed primary-soft box + one primary button + reward hint (`+২০`).

## 7. Motion (standard, subtle, meaningful)
| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.2,.8,.2,1)` | Most entrances |
| `--ease-stamp` | `cubic-bezier(.3,.7,.3,1)` | Stamp thump |
| `--dur-fast` | 150–180ms | Press, toggle, chip select |
| `--dur-base` | 250–350ms | Sheet up, toast in, step slide |
| `--dur-slow` | 700–1000ms | Progress bars, rings filling |

Added Oct 2026 (owner asked for motion across the whole app):
- **Page enter** (`app/(site)/template.tsx`): the page slides up 14px (380ms) on every navigation; transform only.
- **Section and hero enter** (`animate-rise`): start at 1% opacity and 12px lower, 420ms. Never fully invisible, so
  paint metrics (LCP) are not delayed. Sections that stream in behind a skeleton appear the same way.
- **List stagger** (`rise-children`): rows of grouped lists, the famous-food row and the district chips rise in
  order, 40ms apart (first eight).
- **Lift** (`lift`): cards rise 3px under a mouse; touch screens skip it.
- **Ring draw / bars**: the passport ring and division bars animate on first paint; the active bottom-nav icon pops.
- **Smooth details** (`smooth-details`): "সব জেলা" opens by height, not by snapping.
- **No jumps**: skeletons match the real box (docs/05); font stand-ins (`SS Fallback Sans/Display` in fonts.css) copy the web
  fonts' width and vertical metrics so a late font does not re-wrap text.

Catalogue (the original list):
1. **Press**: buttons `scale(.94)` on `:active`.
2. **Reaction pop**: selected icon scales 1 → 1.18 → 1 (350ms) + color fill.
3. **Toast in**: translateY(24px) → 0 + fade, auto-hide 3s. Reward toast shows `+১০` gold pill.
4. **Bottom sheet**: translateY(100%) → 0, scrim fade 250ms.
5. **Progress**: bars `scaleX(0→1)`, rings `stroke-dashoffset` animate on first view (IntersectionObserver).
6. **Stamp thump**: `scale 1.5 → .95 → 1` + fade (450ms) when a stamp is earned / first seen; slight random rotation −9°…+10°.
7. **Step slide**: add-flow steps slide in from right 24px (300ms).
8. **Page transitions**: View Transitions API (`next` experimental `viewTransition` or `<ViewTransition>` when stable) — cross-fade 200ms; shared element for food thumbnail → food header. Progressive enhancement only.
9. **Skeleton shimmer**: 1.4s linear loop.
All motion is CSS-first (transitions/keyframes). No animation library in MVP. Every animation is
disabled under `prefers-reduced-motion: reduce`.

## 8. Gamification UI
| Component | Look | Data |
|---|---|---|
| `PassportRing` | Gold ring progress, center `৭/৬৪` | districts with ≥1 experience |
| `PassportCard` (home) | Ring + title + last 3 mini stamps overlapping (rotated) + "পরের স্ট্যাম্প" row with primary pill | same + next suggested district (nearest RegionalFame not yet unlocked) |
| `Stamp` | SVG rubber stamp: outer ring 3px + thin ring, inner circle, curved top text "সোজাসাপ্টা পাসপোর্ট", curved bottom text = food, center = district (display font), date; ink color per district, rotation, rough-edge SVG filter (feTurbulence + feDisplacementMap), opacity .92 | first experience per district |
| `LockedStamp` | Dashed grey circle + lock + district + food | RegionalFame districts not unlocked |
| `PointsPill` | Gold pill `+১০` | points events |
| `DivisionProgressTile` | Name, `৩/১৩`, gold bar | per division |
| `NextAchievement` | Primary-soft icon tile + title + bar + count | V1.5 (achievements) |
| `StreakChip`, `WeeklyChallengeCard` | Gold flame chip / reward-soft card with bar | V1.5 |

## 9. Core components (each data component ships with a Skeleton)
shadcn primitives themed with the tokens above: Button, Input, Badge, Tabs (segmented), Sheet, Dialog,
DropdownMenu, ToggleGroup (chips), Avatar, Separator, Sonner.
App components: `SearchBox`, `ResultSection`, `ReactionPicker`, `LikeMeter` (3-segment bar),
`ScorePill`, `RankBadge`, `FavoriteBadge`, `ClaimStatusBadge`, `VerifySheet`, `PriceRange`,
`PlaceTypeBadge`, `AppImage`, `PhotoStrip`, `GroupedList`, `EmptyState`, `ShareButton`, `LoginSheet`,
`BottomNav`, `PageShell`, `Section`, `StepProgress`, `DuplicateCheck`, plus §8 gamification components.

## 10. Accessibility
`lang="bn"`; contrast AA everywhere (checked values above); focus ring 2px primary + 2px offset;
labels for every input; `aria-pressed` on toggles; `role="status"` + `aria-live="polite"` for toasts;
skeleton regions `aria-busy`; sheets trap focus and close on Esc; stamps have `aria-label`
("বগুড়া — দই স্ট্যাম্প").

## 11. Copy guidelines (Bangla)
Short, friendly, "আপনি". Action names stay identical through a flow ("জমা দিন" → toast "জমা হয়েছে").
Never "সেরা" → "কমিউনিটির প্রিয়". Never "Verified" → "কমিউনিটি নিশ্চিত". Famous ≠ best:
"যেসব খাবারের জন্য বিখ্যাত — সম্পাদকদের যাচাই করা তালিকা, রেটিং নয়". Empty states invite action
and show the reward ("প্রথম জানান +২০").
