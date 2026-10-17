import { cacheLife, cacheTag } from "next/cache";
import { after } from "next/server";

import { getServices } from "@/infrastructure/container";

async function searchCached(input: string) {
  "use cache";
  cacheTag("search");
  cacheLife("minutes");
  return getServices().search.search(input);
}

/**
 * Runs a search. The lookup is cached per query for a few minutes; the "nothing found" note is
 * written after the response (never inside the cache, never blocking the visitor).
 */
export async function searchCatalog(input: string) {
  const outcome = await searchCached(input);
  if (outcome.total === 0 && outcome.query.key !== "") {
    after(() => getServices().repos.search.recordMiss(outcome.query));
  }
  return outcome;
}

/** Names close to a query that found nothing ("কাচ্চি" for "kacci"). */
export async function getDidYouMean(input: string) {
  "use cache";
  cacheTag("search");
  cacheLife("hours");
  return getServices().search.didYouMean(input);
}

/** What people search most lately, for the empty search page. */
export async function getPopularSearches() {
  "use cache";
  cacheTag("search");
  cacheLife("hours");
  return getServices().search.popular();
}
