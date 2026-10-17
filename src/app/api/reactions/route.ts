import type { NextRequest } from "next/server";

import { getServices } from "@/infrastructure/container";

const MAX_DISHES = 200;

// What the signed-in visitor already said about some dishes ({} for a guest). Private: it depends on
// who is asking. The reaction boxes call it after the page has loaded, so the page itself stays
// cacheable and static.
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("dishes") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, MAX_DISHES);
  const services = getServices();
  const session = await services.auth.getSession();
  const mine: Record<string, string> = {};
  const experiences: Record<string, { id: string; photos: number }> = {};
  if (session && ids.length > 0) {
    const wanted = new Set(ids);
    const { items } = await services.repos.experiences.byUser(session.user.id, { limit: 200 });
    for (const experience of items) {
      if (wanted.has(experience.dishId) && experience.status === "active") {
        mine[experience.dishId] ??= experience.reaction;
        experiences[experience.dishId] ??= {
          id: experience.id,
          photos: experience.photos.length,
        };
      }
    }
  }
  return Response.json(
    { mine, experiences },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
