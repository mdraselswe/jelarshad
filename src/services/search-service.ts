import { appConfig } from "@/config/app.config";
import type { Place, PlaceType } from "@/core/domain";
import type { Repositories, SearchHit } from "@/core/ports";
import { toSearchKey, toSearchQuery } from "@/lib/text/normalize";

// Search business rules: input limits, grouping, filters. Pure (ports only).

type Deps = { repos: Pick<Repositories, "search" | "districts" | "places"> };

export type PriceTierId = (typeof appConfig.search.priceTiers)[number]["id"];

export type FoodHit = { slug: string; nameBn: string; aboutBn: string | null };
export type PlaceHit = {
  slug: string;
  nameBn: string;
  type: PlaceType;
  district: { slug: string; nameBn: string };
  /** The neighbourhood, so branches of one chain can be told apart. */
  areaNameBn: string | null;
  /** The chain this place is a branch of, when it is one. */
  brand: { slug: string; nameBn: string } | null;
  price: { min: number | null; max: number | null };
};

/** Several branches of one chain, shown as one row that opens the brand page. */
export type BrandGroup = {
  slug: string;
  nameBn: string;
  count: number;
  /** Neighbourhoods (or districts) of the matching branches, in result order. */
  areas: string[];
};

export type PlaceRowItem = { kind: "place"; hit: PlaceHit } | { kind: "brand"; group: BrandGroup };

/**
 * Two or more hits of the same chain collapse into one brand row at the position of the first;
 * a single branch stays a normal place row (its area is in the row, so it can be told apart).
 */
export function groupBranches(places: PlaceHit[]): PlaceRowItem[] {
  const count = new Map<string, number>();
  for (const place of places) {
    if (place.brand) count.set(place.brand.slug, (count.get(place.brand.slug) ?? 0) + 1);
  }
  const emitted = new Set<string>();
  const items: PlaceRowItem[] = [];
  for (const place of places) {
    const brand = place.brand;
    if (!brand || (count.get(brand.slug) ?? 0) < 2) {
      items.push({ kind: "place", hit: place });
      continue;
    }
    if (emitted.has(brand.slug)) continue;
    emitted.add(brand.slug);
    const areas = places
      .filter((candidate) => candidate.brand?.slug === brand.slug)
      .map((candidate) => candidate.areaNameBn ?? candidate.district.nameBn);
    items.push({
      kind: "brand",
      group: { slug: brand.slug, nameBn: brand.nameBn, count: areas.length, areas },
    });
  }
  return items;
}
export type DistrictHit = { slug: string; nameBn: string; divisionBn: string };
/** A neighbourhood ("ধানমন্ডি, ঢাকা"); its places are added to `places` of the same outcome. */
export type AreaHit = {
  slug: string;
  nameBn: string;
  district: { slug: string; nameBn: string };
};

export type SearchOutcome = {
  /** The cleaned query that was run ("" when the input was too short to search). */
  query: { text: string; key: string };
  foods: FoodHit[];
  places: PlaceHit[];
  districts: DistrictHit[];
  areas: AreaHit[];
  total: number;
};

export type SearchFilters = { type?: PlaceType | undefined; price?: PriceTierId | undefined };

const EMPTY: SearchOutcome = {
  query: { text: "", key: "" },
  foods: [],
  places: [],
  districts: [],
  areas: [],
  total: 0,
};

/**
 * One row per food name: if the same food exists twice ("চাপ" added by a contributor and by the
 * seed) people see it once, the one with a description first. The database merge (merge_foods)
 * is the real fix; this keeps a duplicate from ever showing up twice in the meantime.
 */
export function collapseSameFoods(foods: FoodHit[]): FoodHit[] {
  const byKey = new Map<string, FoodHit>();
  for (const food of foods) {
    const key = toSearchKey(food.nameBn);
    const kept = byKey.get(key);
    if (!kept || (kept.aboutBn === null && food.aboutBn !== null)) byKey.set(key, food);
  }
  // Keep the order the database returned the first of each name in.
  return foods.filter((food) => byKey.get(toSearchKey(food.nameBn)) === food);
}

/** Trim, collapse and cap what the user typed. */
export function cleanQueryInput(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, appConfig.search.maxQueryLength);
}

const toPlaceHit = (place: Place): PlaceHit => ({
  slug: place.slug,
  nameBn: place.nameBn,
  type: place.type,
  district: { slug: place.district.slug, nameBn: place.district.nameBn },
  areaNameBn: place.area?.nameBn ?? null,
  brand: place.brand ?? null,
  price: place.price,
});

export function createSearchService({ repos }: Deps) {
  return {
    async search(raw: string): Promise<SearchOutcome> {
      const input = cleanQueryInput(raw);
      if (input.length < appConfig.search.minQueryLength) return EMPTY;
      const query = toSearchQuery(input);
      if (query.key === "" && query.text === "") return EMPTY;

      const { items } = await repos.search.search(query, { limit: appConfig.search.resultLimit });
      const outcome: SearchOutcome = {
        query,
        foods: [],
        places: [],
        districts: [],
        areas: [],
        total: 0,
      };
      for (const hit of items as SearchHit[]) {
        if (hit.kind === "food") {
          outcome.foods.push({
            slug: hit.food.slug,
            nameBn: hit.food.nameBn,
            aboutBn: hit.food.aboutBn,
          });
        } else if (hit.kind === "place") {
          outcome.places.push(toPlaceHit(hit.place));
        } else {
          outcome.districts.push({
            slug: hit.district.slug,
            nameBn: hit.district.nameBn,
            divisionBn: hit.district.divisionBn,
          });
        }
      }
      outcome.foods = collapseSameFoods(outcome.foods);

      // A neighbourhood name finds the area and the places in it (typing "ধানমন্ডি").
      const areas = await repos.districts.areasMatching(input, appConfig.search.areaLimit);
      for (const area of areas) {
        outcome.areas.push({
          slug: area.slug,
          nameBn: area.nameBn,
          district: { slug: area.district.slug, nameBn: area.district.nameBn },
        });
      }
      const seen = new Set(outcome.places.map((place) => place.slug));
      for (const area of areas) {
        const { items: inArea } = await repos.places.inArea(area.id, {
          limit: appConfig.search.resultLimit,
        });
        for (const place of inArea) {
          if (seen.has(place.slug)) continue;
          seen.add(place.slug);
          outcome.places.push(toPlaceHit(place));
        }
      }
      outcome.total =
        outcome.foods.length +
        outcome.places.length +
        outcome.districts.length +
        outcome.areas.length;
      return outcome;
    },
  };
}

export type SearchService = ReturnType<typeof createSearchService>;

/** Keep places of one type and/or price tier. A place with no known price is hidden by a price filter. */
export function filterPlaces(places: PlaceHit[], filters: SearchFilters): PlaceHit[] {
  const tier = appConfig.search.priceTiers.find((candidate) => candidate.id === filters.price);
  return places.filter((place) => {
    if (filters.type && place.type !== filters.type) return false;
    if (!tier) return true;
    const known = place.price.min ?? place.price.max;
    if (known === null) return false;
    const low = place.price.min ?? known;
    const high = place.price.max ?? known;
    // Overlap: a place priced ৳120–৳180 belongs to both "budget" and "mid".
    return low <= (tier.max ?? Infinity) && high >= tier.min;
  });
}
