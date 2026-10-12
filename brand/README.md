# Jelar Shad (জেলার স্বাদ) brand assets

Final logo: **"কথার সিল"** (concept 6) — a round seal with a speech-bubble tail (people's honest talk +
passport stamp), a dashed inner ring (the stamp), a bowl (food) and a gold straight line (a plain, honest word on every dish).
Seen whole, it also reads as a smiling face.

All SVGs are pure vector: text is converted to outlines (no font needed) and the cut-outs are real
transparency, so every file works on any background.

| File | Use |
|---|---|
| `react/logo.tsx` | **In-app logo**: `<LogoMark />`, `<LogoLockup />` — theme-aware (uses `--logo-*` tokens). Copy to `src/components/brand/logo.tsx` |
| `logo/mark-themed.svg`, `logo/lockup-themed.svg` | Same idea as plain SVG with `var(--logo-*)` colors (for inline SVG use) |
| `logo/mark.svg` | Main symbol, indigo + gold, transparent background (light theme / external use) |
| `logo/mark-dark.svg`, `logo/lockup-dark.svg`, `logo/lockup-compact-dark.svg` | Dark-theme colors (`#8B85FF` + `#FBBF24`, light text) |
| `logo/mark-white.svg` | Symbol on dark/indigo backgrounds |
| `logo/mark-mono.svg` | One color (`currentColor`) — stamps, watermarks, print |
| `logo/mark-small.svg` | Simplified symbol for 16–32px (no dashed ring) |
| `logo/lockup.svg` | Symbol + "জেলার স্বাদ" + tagline, on light backgrounds |
| `logo/lockup-white.svg` | Same on dark backgrounds |
| `logo/lockup-compact.svg` | Symbol + name, no tagline (header) |
| `logo/lockup-en.svg` | Symbol + Bangla name + "Jelar Shad" |
| `logo/app-icon.svg` | Rounded-square app icon source (1024) |
| `logo/app-icon-maskable.svg` | Full-bleed icon with safe zone (Android maskable) |
| `logo/icon-192.png`, `logo/icon-512.png` | PWA manifest icons |
| `logo/icon-maskable-512.png` | PWA maskable icon |
| `logo/apple-touch-icon.png` | iOS home screen (180) |
| `logo/favicon.ico` | 16/32/48 favicon (from `mark-small`) |
| `logo/icon.svg` | Next.js `app/icon.svg` — adaptive: switches to dark colors when the OS is in dark mode |
| `logo/og-default.png` / `.svg` | Default 1200×630 share image |

## Where they go in the Next.js app (Phase 0.5 / 8.2)
- `src/app/favicon.ico` ← `favicon.ico`
- `src/app/icon.svg` ← `icon.svg`
- `src/app/apple-icon.png` ← `apple-touch-icon.png`
- `public/icons/` ← `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (referenced in `app/manifest.ts`)
- `public/brand/` ← `mark*.svg`, `lockup*.svg`
- `src/app/opengraph-image.png` ← `og-default.png` (fallback; dynamic OG routes override per page)
- `src/components/brand/logo.tsx` ← `react/logo.tsx` (the only way the app renders the logo)

## Theming
The logo has **no fixed colors inside the app**. Each theme file defines `--logo-mark`, `--logo-accent`,
`--logo-text`, `--logo-subtext` (values for light/dark in `docs/06-design-system.md` §2). A future custom
theme just sets these four tokens; `pnpm test:themes` checks the mark keeps ≥ 3:1 contrast with the page.
Fixed brand colors are used only outside the app (app icons, favicon fallback, OG images, print).

## Rules
- Clear space around the symbol ≥ ¼ of its height. Minimum size: 20px (use `mark-small` below 32px).
- Outside the app use only the brand palette (indigo `#4F46E5`, gold `#F59E0B`, white, ink `#16161D`) or the dark variants. Inside the app use the tokens. The accent line stays a warm gold/yellow in every theme.
- Don't stretch, rotate, outline, add shadows or put the full-color mark on busy photos.
