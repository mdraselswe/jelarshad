import type { NextRequest } from "next/server";
import { z } from "zod";

import { getServices } from "@/infrastructure/container";
import { clientAddress, createIpRateLimiter, tooManyRequests } from "@/lib/ip-rate-limit";

/** 120 requests a minute per visitor; more is not a person using the app. */
const limiter = createIpRateLimiter({ limit: 120, windowMs: 60_000 });

// Usage counts from the browser: no cookie, no IP, no user id. Only these names are accepted and
// everything is size-capped, so the endpoint cannot be used to fill the table with junk.
const NAMES = ["page_view", "search", "share"] as const;
const MAX_BYTES = 2_000;

const schema = z.object({
  name: z.enum(NAMES),
  path: z.string().startsWith("/").max(200),
  props: z
    .record(z.string().max(30), z.union([z.string().max(100), z.number(), z.boolean(), z.null()]))
    .refine((value) => Object.keys(value).length <= 6)
    .optional(),
  session: z.string().max(40).nullish(),
});

export async function POST(request: NextRequest) {
  if (!limiter.allow(clientAddress(request.headers))) return tooManyRequests();
  const text = await request.text();
  if (text.length > MAX_BYTES) return new Response(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return new Response(null, { status: 400 });
  const { name, path, props, session } = parsed.data;
  await getServices().repos.insights.record({
    name,
    path,
    props: props ?? {},
    session: session ?? null,
  });
  return new Response(null, { status: 204 });
}
