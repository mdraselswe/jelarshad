import { cacheLife, cacheTag } from "next/cache";

import { getServices } from "@/infrastructure/container";

export async function getBrandPage(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("places");
  const data = await getServices().catalog.brandPage(slug);
  // A new experience at any branch refreshes the ranking.
  for (const branch of data?.branches ?? []) cacheTag(`place:${branch.id}`);
  return data;
}
