import { cacheLife, cacheTag } from "next/cache";

import { getServices } from "@/infrastructure/container";

// Tags: `district:<id>` for the district itself; the district×food page carries the broad
// `districts` and `foods` tags (docs/03-architecture.md §8).

export async function getDistrictHeader(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("districts");
  const header = await getServices().catalog.districtHeader(slug);
  if (header) cacheTag(`district:${header.id}`);
  return header;
}

export async function getDistrictPlaces(districtId: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(`district:${districtId}`);
  return getServices().catalog.districtPlaces(districtId);
}

export async function getAreaPage(districtSlug: string, areaSlug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("districts");
  const data = await getServices().catalog.areaPage(districtSlug, areaSlug);
  // A new experience at any of these places refreshes the ranking.
  for (const place of data?.places ?? []) cacheTag(`place:${place.id}`);
  return data;
}

export async function getAreaSlugs(limit: number) {
  "use cache";
  cacheLife("hours");
  cacheTag("districts");
  return getServices().repos.districts.areaSlugs(limit);
}

export async function getDistrictFood(districtSlug: string, foodSlug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("districts");
  const data = await getServices().catalog.districtFood(districtSlug, foodSlug);
  // New experiences refresh the page through the food's tag.
  if (data) cacheTag(`food:${data.food.id}`);
  return data;
}
