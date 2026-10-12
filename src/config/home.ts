import type { MessageKey } from "@/i18n/t";

// The kinds of food on the home page (docs/design: eight tiles). A tile opens a search for its name,
// so it only ever shows what exists. `tile` is a gradient fill (docs/06-design-system.md §2d); class
// names are literal so Tailwind sees them. The icon for each id is chosen in home-categories.tsx.
export const HOME_CATEGORIES: readonly {
  id: string;
  label: MessageKey;
  tile: string;
}[] = [
  { id: "biryani", label: "home.cat.biryani", tile: "bg-tile-2" },
  { id: "sweets", label: "home.cat.sweets", tile: "bg-tile-1" },
  { id: "doi", label: "home.cat.doi", tile: "bg-tile-5" },
  { id: "fish", label: "home.cat.fish", tile: "bg-tile-3" },
  { id: "breakfast", label: "home.cat.breakfast", tile: "bg-tile-4" },
  { id: "tea", label: "home.cat.tea", tile: "bg-tile-6" },
  { id: "pitha", label: "home.cat.pitha", tile: "bg-tile-2" },
  { id: "more", label: "home.cat.more", tile: "bg-tile-1" },
];

/** Search shortcuts under the desktop hero. */
export const QUICK_SEARCHES = ["কাচ্চি", "দই", "রসমালাই", "হালিম", "চা"] as const;

/** Rows in the home "famous for" list and tiles in the district row. */
export const HOME_FAMOUS_ROWS = 5;
export const HOME_DISTRICT_TILES = 12;
