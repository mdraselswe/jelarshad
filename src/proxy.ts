import { NextResponse, type NextRequest } from "next/server";

import { appConfig } from "@/config/app.config";
import { clientEnv, serverEnv } from "@/config/env";
import { routes } from "@/config/routes";
import { refreshAuthSession } from "@/infrastructure/container";
import { decideLaunchGate, PREVIEW_COOKIE, PREVIEW_PARAM } from "@/lib/launch-gate";
import { legacyHostRedirect } from "@/lib/legacy-host";

export async function proxy(request: NextRequest) {
  // The old address keeps working: it moves to the new one, same path (permanent redirect).
  const moved = legacyHostRedirect({
    requestHost: request.headers.get("host") ?? request.nextUrl.host,
    siteUrl: clientEnv.NEXT_PUBLIC_SITE_URL,
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  });
  if (moved) return NextResponse.redirect(moved, 308);

  const launched = clientEnv.NEXT_PUBLIC_LAUNCHED;
  const decision = await decideLaunchGate({
    launched,
    secret: serverEnv().PREVIEW_ACCESS_SECRET,
    previewParam: request.nextUrl.searchParams.get(PREVIEW_PARAM),
    cookie: request.cookies.get(PREVIEW_COOKIE)?.value,
  });

  let response: NextResponse;
  if (decision.kind === "grant") {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete(PREVIEW_PARAM);
    response = NextResponse.redirect(cleanUrl);
    response.cookies.set(PREVIEW_COOKIE, decision.token, {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: appConfig.launch.previewCookieMaxAgeDays * 24 * 60 * 60,
    });
  } else if (decision.kind === "gate") {
    response = NextResponse.rewrite(new URL(routes.comingSoon(), request.url));
  } else {
    response = NextResponse.next();
  }

  // Supabase sessions expire; renewing them here lets Server Components stay read-only.
  const env = serverEnv();
  if (
    env.AUTH_PROVIDER === "supabase" &&
    env.NEXT_PUBLIC_SUPABASE_URL &&
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    await refreshAuthSession(request, response, {
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }

  // Nothing is indexed before launch, including what preview users see.
  if (!launched) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  // Every page; not API routes, Next internals or files with an extension (icons, images, robots.txt…).
  matcher: ["/((?!api/|_next/|.*\\..*).*)"],
};
