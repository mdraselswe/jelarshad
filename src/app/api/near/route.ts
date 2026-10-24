import type { NextRequest } from "next/server";

import { getServices } from "@/infrastructure/container";
import { clientAddress, createIpRateLimiter, tooManyRequests } from "@/lib/ip-rate-limit";

/** 30 requests a minute per visitor; more is not a person using the app. */
const limiter = createIpRateLimiter({ limit: 30, windowMs: 60_000 });

// Places near a point, by neighbourhood. The point is used to answer and then forgotten: nothing is
// stored or logged about where a person is.
export async function GET(request: NextRequest) {
  if (!limiter.allow(clientAddress(request.headers))) return tooManyRequests();
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return Response.json({ error: "validation" }, { status: 400 });
  }
  const result = await getServices().catalog.nearby({ lat, lng });
  return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
