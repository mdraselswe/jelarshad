import { appConfig } from "@/config/app.config";
import type { PlaceType } from "@/core/domain";
import { PLACE_SORTS, type PlaceSort, type PriceTierId } from "@/services/search-service";

// Reading the search page's URL: unknown values fall back to "no filter" instead of erroring.

export const SEARCH_TABS = ["all", "food", "place", "district"] as const;
export type SearchTab = (typeof SEARCH_TABS)[number];

export const PLACE_TYPES: readonly PlaceType[] = [
  "restaurant",
  "shop",
  "street_food",
  "bakery",
  "home_kitchen",
  "other",
];

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type ParsedSearchParams = {
  q: string;
  tab: SearchTab;
  type: PlaceType | undefined;
  price: PriceTierId | undefined;
  sort: PlaceSort;
};

export function parseSearchParams(raw: RawSearchParams): ParsedSearchParams {
  const q = (first(raw.q) ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, appConfig.search.maxQueryLength);
  const tab = SEARCH_TABS.find((candidate) => candidate === first(raw.tab)) ?? "all";
  const type = PLACE_TYPES.find((candidate) => candidate === first(raw.type));
  const price = appConfig.search.priceTiers.find((tier) => tier.id === first(raw.price))?.id;
  const sort = PLACE_SORTS.find((candidate) => candidate === first(raw.sort)) ?? "relevance";
  return { q, tab, type, price, sort };
}
