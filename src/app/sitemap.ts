import type { MetadataRoute } from "next";

import { clientEnv } from "@/config/env";
import { routes } from "@/config/routes";
import { getSitemapEntries } from "@/features/catalog/queries";
import { absoluteUrl } from "@/lib/url";

// One file while the site is small (the protocol allows 50,000 URLs; each kind is capped at
// appConfig.seo.sitemapPerType). Split it with generateSitemaps() before it gets near the limit.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Nothing is listed before launch (robots.txt also keeps crawlers out).
  if (!clientEnv.NEXT_PUBLIC_LAUNCHED) return [];
  const entries = await getSitemapEntries();
  const paths = [
    routes.home(),
    routes.about(),
    routes.policy(),
    routes.leaderboard(),
    routes.foods(),
    routes.brands(),
    routes.districts(),
    ...entries.districts.map((slug) => routes.district(slug)),
    ...entries.areas.map(({ districtSlug, areaSlug }) => routes.area(districtSlug, areaSlug)),
    ...entries.foods.map((slug) => routes.food(slug)),
    ...entries.places.map((slug) => routes.place(slug)),
    ...entries.brands.map((slug) => routes.brand(slug)),
    ...entries.districtFoods.map(({ district, food }) => routes.districtFood(district, food)),
  ];
  return paths.map((path) => ({ url: absoluteUrl(path) }));
}
