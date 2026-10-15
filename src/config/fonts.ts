/**
 * Fonts (docs/06-design-system.md §3, decision D12): Anek Bangla 500–700 for headings, numbers and
 * badges; Noto Sans Bengali 400–600 for body text, labels and inputs. Faces are declared in
 * src/styles/fonts.css and mapped to `font-display` / `font-sans` in src/styles/globals.css.
 *
 * Why not next/font/google: with several weights it serves one variable file per font (Anek 156 KB,
 * Noto 108 KB) and can only preload whole families, which put ~260 KB on the critical path and
 * pushed mobile LCP past the 2.5 s budget. Static per-weight files are 44–57 KB each, and only the
 * two that nearly every first paint draws are preloaded.
 *
 * Only five files exist (src/styles/fonts.css): each extra weight is another download on the first
 * paint. Measured on the home page: nine files ≈ 3.8 s LCP, five files ≈ 3.5 s.
 */
export const FONT_PRELOADS = [
  "/fonts/noto-sans-bengali-400-bengali.woff2",
  "/fonts/anek-bangla-700-bengali.woff2",
  // 10 KB: Latin letters and digits in body text (a name, a number) re-wrapped lines when it arrived late.
  "/fonts/noto-sans-bengali-400-latin.woff2",
] as const;
