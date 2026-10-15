import { getServices } from "@/infrastructure/container";

// Who is signed in ({ userId: null } for a guest). Private: it depends on who is asking. Client
// components ask after the page has loaded, so the pages themselves stay cacheable.
export async function GET() {
  const session = await getServices().auth.getSession();
  return Response.json(
    { userId: session?.user.id ?? null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
