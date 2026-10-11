import { cacheLife, cacheTag } from "next/cache";

import { getServices } from "@/infrastructure/container";

// Tags (docs/03-architecture.md §8): everything about one food is tagged `food:<id>`, so an
// experience written for any of its dishes refreshes the header, the list and the comments.

export async function getFoodHeader(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("foods");
  const header = await getServices().catalog.foodHeader(slug);
  if (header) cacheTag(`food:${header.id}`);
  return header;
}

/** Where an old link to a merged duplicate should go (the surviving food's slug), if any. */
export async function getFoodRedirect(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("foods");
  return getServices().repos.foods.redirectFor(slug);
}

export async function getFoodDishes(foodId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`food:${foodId}`);
  return getServices().catalog.foodDishes(foodId);
}

export async function getFoodExperiences(foodId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`food:${foodId}`);
  const items = await getServices().catalog.foodExperiences(foodId);
  // Ages are shown relative to when the cache was filled (a request-time clock cannot be prerendered).
  return { items, asOf: new Date() };
}
