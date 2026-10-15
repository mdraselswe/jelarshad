import { cacheLife, cacheTag } from "next/cache";

import { getServices } from "@/infrastructure/container";

// Everything about one place is tagged `place:<id>` (claims, dishes, header).

export async function getPlaceHeader(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("places");
  const header = await getServices().catalog.placeHeader(slug);
  if (header) cacheTag(`place:${header.id}`);
  return header;
}

export async function getPlaceDishes(placeId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`place:${placeId}`);
  return getServices().catalog.placeDishes(placeId);
}

export async function getPlaceBranches(placeId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`place:${placeId}`, "places");
  return getServices().catalog.placeBranches(placeId);
}

export async function getPlacePhotos(placeId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`place:${placeId}`);
  return getServices().catalog.placePhotos(placeId);
}

export async function getPlaceClaims(placeId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`place:${placeId}`);
  const items = await getServices().catalog.placeClaims(placeId);
  // Staleness is judged at the time the cache was filled, not at request time.
  return { items, asOf: new Date() };
}

/** Where an old link to a merged duplicate should go (the surviving place's slug), if any. */
export async function getPlaceRedirect(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("places");
  return getServices().repos.places.redirectFor(slug);
}
