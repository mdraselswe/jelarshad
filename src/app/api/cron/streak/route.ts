import type { NextRequest } from "next/server";

import { serverEnv } from "@/config/env";
import { getT } from "@/i18n/server";
import { getServices } from "@/infrastructure/container";
import { formatNumber } from "@/lib/format/number";

// The daily streak reminder. Vercel Cron calls it with the CRON_SECRET as a bearer token; anything
// else is refused, so nobody else can trigger a round of notifications.
export async function GET(request: NextRequest) {
  const secret = serverEnv().CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response(null, { status: 401 });
  }
  const t = getT();
  const run = await getServices().push.remindStreaks((streak) => ({
    title: t("push.title"),
    body: t("push.body", { count: formatNumber(streak) }),
    url: "/",
  }));
  return Response.json(run, { headers: { "Cache-Control": "no-store" } });
}
