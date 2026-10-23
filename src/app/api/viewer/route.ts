import { getServices } from "@/infrastructure/container";
import { clientAddress, createIpRateLimiter, tooManyRequests } from "@/lib/ip-rate-limit";

/** 60 requests a minute per visitor; more is not a person using the app. */
const limiter = createIpRateLimiter({ limit: 60, windowMs: 60_000 });

// Who is signed in ({ userId: null } for a guest) and whether they show their name on the boards.
// Private: it depends on who is asking. Client components ask after the page has loaded, so the
// pages themselves stay cacheable.
export async function GET(request: Request) {
  if (!limiter.allow(clientAddress(request.headers))) return tooManyRequests();
  const services = getServices();
  const session = await services.auth.getSession();
  const userId = session?.user.id ?? null;
  const leaderboardOptIn = userId ? await services.repos.rewards.leaderboardOptIn(userId) : null;
  return Response.json(
    { userId, leaderboardOptIn },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
