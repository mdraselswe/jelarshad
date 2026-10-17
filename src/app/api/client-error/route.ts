import type { NextRequest } from "next/server";
import { z } from "zod";

import { getServices } from "@/infrastructure/container";

// Errors thrown in the browser, sent by the error boundaries. Size-capped like /api/track.
const MAX_BYTES = 8_000;

const schema = z.object({
  message: z.string().max(500),
  stack: z.string().max(4000).nullish(),
  digest: z.string().max(80).nullish(),
  path: z.string().startsWith("/").max(200).nullish(),
});

export async function POST(request: NextRequest) {
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
  const { message, stack, digest, path } = parsed.data;
  await getServices().repos.insights.recordError({
    source: "client",
    message,
    stack: stack ?? null,
    digest: digest ?? null,
    path: path ?? null,
  });
  return new Response(null, { status: 204 });
}
