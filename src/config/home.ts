import type { MessageKey } from "@/i18n/t";

// The kinds of food on the home page (docs/design: eight tiles). A tile opens a search for its name,
// so it only ever shows what exists. Class names are literal so Tailwind sees them.
export const HOME_CATEGORIES: readonly {
  id: string;
  label: MessageKey;
  glyph: string;
  tone: string;
}[] = [
  {
    id: "biryani",
    label: "home.cat.biryani",
    glyph: "বি",
    tone: "bg-cat-coral-soft text-cat-coral-fg",
  },
  {
    id: "sweets",
    label: "home.cat.sweets",
    glyph: "মি",
    tone: "bg-cat-pink-soft text-cat-pink-fg",
  },
  { id: "doi", label: "home.cat.doi", glyph: "দ", tone: "bg-cat-violet-soft text-cat-violet-fg" },
  { id: "fish", label: "home.cat.fish", glyph: "মা", tone: "bg-cat-sky-soft text-cat-sky-fg" },
  {
    id: "breakfast",
    label: "home.cat.breakfast",
    glyph: "না",
    tone: "bg-cat-amber-soft text-cat-amber-fg",
  },
  { id: "tea", label: "home.cat.tea", glyph: "চা", tone: "bg-cat-teal-soft text-cat-teal-fg" },
  {
    id: "pitha",
    label: "home.cat.pitha",
    glyph: "পি",
    tone: "bg-cat-green-soft text-cat-green-fg",
  },
  { id: "more", label: "home.cat.more", glyph: "আ", tone: "bg-primary-soft text-primary-soft-fg" },
];

/** Search shortcuts under the desktop hero. */
export const QUICK_SEARCHES = ["কাচ্চি", "দই", "রসমালাই", "হালিম", "চা"] as const;

/** Rows in the home "famous for" list and tiles in the district row. */
export const HOME_FAMOUS_ROWS = 5;
export const HOME_DISTRICT_TILES = 12;
