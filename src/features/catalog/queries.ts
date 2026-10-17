import { cacheLife, cacheTag } from "next/cache";

import { getServices } from "@/infrastructure/container";

/** Slugs prerendered at build time (generateStaticParams). The rest render on first visit. */
export async function getStaticSlugs() {
  "use cache";
  cacheTag("districts");
  cacheLife("hours");
  return getServices().catalog.staticSlugs();
}

/** District id + name for the add form's picker. */
export async function getDistrictOptions() {
  "use cache";
  cacheTag("districts");
  cacheLife("hours");
  return getServices().catalog.districtOptions();
}

/** Everything the sitemap lists; refreshed hourly and whenever district or search data changes. */
export async function getSitemapEntries() {
  "use cache";
  cacheTag("districts", "search");
  cacheLife("hours");
  return getServices().catalog.sitemapEntries();
}

export async function getFoodIndex() {
  "use cache";
  cacheTag("districts", "search");
  cacheLife("hours");
  return getServices().catalog.foodIndex();
}

export async function getBrandIndex() {
  "use cache";
  cacheTag("places");
  cacheLife("hours");
  return getServices().catalog.brandIndex();
}

export async function getDistrictIndex() {
  "use cache";
  cacheTag("districts");
  cacheLife("hours");
  return getServices().catalog.districtIndex();
}
