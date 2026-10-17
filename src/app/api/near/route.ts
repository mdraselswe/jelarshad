import type { NextRequest } from "next/server";

import { getServices } from "@/infrastructure/container";

// Places near a point, by neighbourhood. The point is used to answer and then forgotten: nothing is
// stored or logged about where a person is.
export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return Response.json({ error: "validation" }, { status: 400 });
  }
  const result = await getServices().catalog.nearby({ lat, lng });
  return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
