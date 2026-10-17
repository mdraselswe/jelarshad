import { getServices } from "@/infrastructure/container";

// Who is signed in ({ userId: null } for a guest) and whether they show their name on the boards.
// Private: it depends on who is asking. Client components ask after the page has loaded, so the
// pages themselves stay cacheable.
export async function GET() {
  const services = getServices();
  const session = await services.auth.getSession();
  const userId = session?.user.id ?? null;
  const leaderboardOptIn = userId ? await services.repos.rewards.leaderboardOptIn(userId) : null;
  return Response.json(
    { userId, leaderboardOptIn },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
