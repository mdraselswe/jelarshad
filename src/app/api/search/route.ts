import type { NextRequest } from "next/server";

import { appConfig } from "@/config/app.config";
import { searchCatalog } from "@/features/search/queries";
import type { SearchSuggestions } from "@/features/search/types";
import { clientAddress, createIpRateLimiter, tooManyRequests } from "@/lib/ip-rate-limit";

/** 120 requests a minute per visitor; more is not a person using the app. */
const limiter = createIpRateLimiter({ limit: 120, windowMs: 60_000 });

// Suggestions for the typing dropdown. Public and cacheable: the same query gives the same answer
// for a minute, which also absorbs bursts of identical keystrokes from many visitors.
export async function GET(request: NextRequest) {
  if (!limiter.allow(clientAddress(request.headers))) return tooManyRequests();
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const outcome = await searchCatalog(q);
  const each = appConfig.search.suggestionsPerGroup;
  const body: SearchSuggestions = {
    query: outcome.query.text,
    foods: outcome.foods.slice(0, each),
    places: outcome.places.slice(0, each),
    districts: outcome.districts.slice(0, each),
    areas: outcome.areas.slice(0, each),
  };
  return Response.json(body, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
