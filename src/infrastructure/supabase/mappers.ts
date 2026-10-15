import type {
  Claim,
  District,
  Dish,
  DishWithFood,
  DishWithPlace,
  Experience,
  Food,
  MediaRef,
  OpeningHours,
  Place,
} from "@/core/domain";

import type { Database } from "./database.types";

// Row → domain mappers (docs/07 §3): DB row types never leave src/infrastructure.

type Tables = Database["public"]["Tables"];
type Row<T extends keyof Tables> = Tables[T]["Row"];

const date = (value: string | null): Date | null => (value ? new Date(value) : null);

export function toDistrict(row: Row<"districts">): District {
  return {
    id: row.id,
    slug: row.slug,
    nameBn: row.name_bn,
    nameEn: row.name_en,
    divisionBn: row.division_bn,
    divisionEn: row.division_en,
    placeCount: row.place_count,
  };
}

export function toFood(row: Row<"foods">): Food {
  return {
    id: row.id,
    slug: row.slug,
    nameBn: row.name_bn,
    nameEn: row.name_en,
    aboutBn: row.about_bn,
    cover: null, // cover media join arrives with images (Phase 5)
    status: row.status,
    experienceCount: row.experience_count,
    lovedCount: row.loved_count,
  };
}

/** Place row with its district and area embedded (see PLACE_SELECT). */
export type PlaceRow = Row<"places"> & {
  districts: Pick<Row<"districts">, "id" | "slug" | "name_bn"> | null;
  areas: Pick<Row<"areas">, "id" | "slug" | "name_bn"> | null;
  /** The chain this place is a branch of; absent in rows selected without it. */
  brands?: Pick<Row<"brands">, "slug" | "name_bn"> | null;
};

export const PLACE_SELECT =
  "*, districts(id, slug, name_bn), areas(id, slug, name_bn), brands(slug, name_bn)";

export function toPlace(row: PlaceRow): Place {
  if (!row.districts) throw new Error(`place ${row.id} has no district`);
  return {
    id: row.id,
    slug: row.slug,
    nameBn: row.name_bn,
    nameEn: row.name_en,
    type: row.type,
    district: { id: row.districts.id, slug: row.districts.slug, nameBn: row.districts.name_bn },
    area: row.areas ? { id: row.areas.id, slug: row.areas.slug, nameBn: row.areas.name_bn } : null,
    address: row.address,
    location: null, // geography → lat/lng mapping arrives with "nearby" (V1.5)
    openingHours: (row.opening_hours as OpeningHours | null) ?? null,
    price: { min: row.price_min, max: row.price_max },
    status: row.status,
    mergedIntoId: row.merged_into,
    brand: row.brands ? { slug: row.brands.slug, nameBn: row.brands.name_bn } : null,
  };
}

export function toDish(row: Row<"dishes">): Dish {
  return {
    id: row.id,
    placeId: row.place_id,
    foodId: row.food_id,
    displayName: row.display_name,
    price: { min: row.price_min, max: row.price_max },
    priceConfirmedAt: date(row.price_confirmed_at),
    lovedCount: row.loved_count,
    okayCount: row.okay_count,
    dislikedCount: row.disliked_count,
    experienceCount: row.experience_count ?? row.loved_count + row.okay_count + row.disliked_count,
    wilsonScore: row.wilson_score,
    lastExperienceAt: date(row.last_experience_at),
    status: row.status,
  };
}

export type DishWithPlaceRow = Row<"dishes"> & { places: PlaceRow | null };
export const DISH_WITH_PLACE_SELECT = `*, places!inner(${PLACE_SELECT})`;

export function toDishWithPlace(row: DishWithPlaceRow): DishWithPlace {
  if (!row.places) throw new Error(`dish ${row.id} has no place`);
  const place = toPlace(row.places);
  return {
    ...toDish(row),
    place: {
      id: place.id,
      slug: place.slug,
      nameBn: place.nameBn,
      type: place.type,
      district: place.district,
      area: place.area,
    },
  };
}

export type DishWithFoodRow = Row<"dishes"> & {
  foods: Pick<Row<"foods">, "id" | "slug" | "name_bn"> | null;
};
export const DISH_WITH_FOOD_SELECT = "*, foods(id, slug, name_bn)";

export function toDishWithFood(row: DishWithFoodRow): DishWithFood {
  if (!row.foods) throw new Error(`dish ${row.id} has no food`);
  return {
    ...toDish(row),
    food: { id: row.foods.id, slug: row.foods.slug, nameBn: row.foods.name_bn },
  };
}

export type ExperienceRow = Row<"experiences"> & {
  public_profiles: {
    id: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};
export const EXPERIENCE_SELECT = "*, public_profiles(id, display_name, avatar_url)";

export function toExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    dishId: row.dish_id,
    user: {
      id: row.user_id,
      displayName: row.public_profiles?.display_name ?? "",
      avatarUrl: row.public_profiles?.avatar_url ?? null,
    },
    reaction: row.reaction,
    comment: row.comment,
    pricePaid: row.price_paid,
    visitedOn: date(row.visited_on),
    photos: [], // experience photos arrive with uploads (Phase 5.3)
    status: row.status,
    createdAt: new Date(row.created_at),
  };
}

export function toClaim(row: Row<"claims">): Claim {
  if (row.entity !== "place" && row.entity !== "dish") {
    throw new Error(`claim ${row.id} has unexpected entity ${row.entity}`);
  }
  return {
    id: row.id,
    entity: row.entity,
    entityId: row.entity_id,
    type: row.type,
    value: (row.value as Record<string, unknown> | null) ?? {},
    status: row.status,
    counts: { correct: row.correct_count, partial: row.partial_count, wrong: row.wrong_count },
    lastConfirmedAt: date(row.last_confirmed_at),
    expiresAt: date(row.expires_at),
  };
}

export function toMediaRef(row: Row<"media">): MediaRef {
  return {
    id: row.id,
    key: row.provider_key,
    width: row.width,
    height: row.height,
    dominantColor: row.dominant_color,
  };
}
