import type { ContentStatus, PriceRange } from "./common";
import type { MediaRef } from "./media";

// Districts, foods, places and dishes (docs/01-product-spec.md §3, decision P5).

export type District = {
  id: number;
  slug: string;
  nameBn: string;
  nameEn: string;
  divisionBn: string;
  divisionEn: string;
  placeCount: number;
};

export type Area = {
  id: number;
  districtId: number;
  slug: string;
  nameBn: string;
  nameEn: string | null;
};

/** A neighbourhood with the district it belongs to (search, area page). */
export type AreaWithDistrict = Area & { district: Pick<District, "id" | "slug" | "nameBn"> };

export type Food = {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string | null;
  /** "কেন বিখ্যাত" — editor-written. */
  aboutBn: string | null;
  cover: MediaRef | null;
  status: ContentStatus;
  experienceCount: number;
  lovedCount: number;
};

/** Curated "famous for" (decision P5): editorial, not a rating. */
export type RegionalFame = {
  districtId: number;
  areaId: number | null;
  food: Food;
  noteBn: string | null;
  sourceUrl: string | null;
};

export type PlaceType = "restaurant" | "shop" | "street_food" | "bakery" | "home_kitchen" | "other";

/** { sat: [["10:00","22:00"]], … } — days missing = closed / unknown. */
export type OpeningHours = Partial<
  Record<"sat" | "sun" | "mon" | "tue" | "wed" | "thu" | "fri", [string, string][]>
>;

export type Place = {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string | null;
  type: PlaceType;
  district: Pick<District, "id" | "slug" | "nameBn">;
  area: Pick<Area, "id" | "slug" | "nameBn"> | null;
  address: string | null;
  location: { lat: number; lng: number } | null;
  openingHours: OpeningHours | null;
  /** Phone, web address (website or Facebook page) and opening hours as text; all optional. */
  phone: string | null;
  website: string | null;
  hoursText: string | null;
  price: PriceRange;
  status: ContentStatus;
  /** Set when an admin merged this duplicate into another place; pages redirect there. */
  mergedIntoId: string | null;
  /** The chain this place is a branch of; only set by adapters that load it (mock). */
  brand?: { slug: string; nameBn: string } | null;
};

/** The other branches of the chain a place belongs to ("সুলতানস ডাইন"); each is its own place. */
export type PlaceBranches = {
  brand: { slug: string; nameBn: string };
  items: Pick<Place, "id" | "slug" | "nameBn" | "district" | "area">[];
};

/** A food at a place — ratings live here (decision P5). */
export type Dish = {
  id: string;
  placeId: string;
  foodId: string;
  displayName: string | null;
  price: PriceRange;
  priceConfirmedAt: Date | null;
  lovedCount: number;
  okayCount: number;
  dislikedCount: number;
  experienceCount: number;
  /** Sort key (lib/ranking/wilson). */
  wilsonScore: number;
  lastExperienceAt: Date | null;
  status: ContentStatus;
};

export type DishWithPlace = Dish & {
  place: Pick<Place, "id" | "slug" | "nameBn" | "type" | "district" | "area">;
};
export type DishWithFood = Dish & { food: Pick<Food, "id" | "slug" | "nameBn"> };
