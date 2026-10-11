import type { AreaHit, DistrictHit, FoodHit, PlaceHit } from "@/services/search-service";

/** JSON returned by GET /api/search (typing dropdown). */
export type SearchSuggestions = {
  query: string;
  foods: FoodHit[];
  places: PlaceHit[];
  districts: DistrictHit[];
  areas: AreaHit[];
};
