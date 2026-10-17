import { NextResponse, type NextRequest } from "next/server";

import { clientEnv } from "@/config/env";
import { routes } from "@/config/routes";
import { getServices } from "@/infrastructure/container";
import { safeNext } from "@/lib/auth/safe-next";

/**
 * Starts sign-in: sends the visitor to Google (or Facebook, when `?provider=facebook` and it is
 * switched on), which returns to /auth/callback.
 */
export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const callback = new URL(routes.authCallback(), request.url);
  callback.searchParams.set("next", next);
  try {
    const wanted = request.nextUrl.searchParams.get("provider");
    const provider =
      wanted === "facebook" && clientEnv.NEXT_PUBLIC_FACEBOOK_LOGIN ? "facebook" : "google";
    const target = await getServices().auth.signInUrl(provider, callback.toString());
    return NextResponse.redirect(new URL(target, request.url));
  } catch (error) {
    getServices().errors.report(error, { route: "auth/sign-in" });
    return NextResponse.redirect(new URL(routes.login({ next, error: true }), request.url));
  }
}
