// A small per-visitor limit for the public API routes that need no sign-in (usage counts, error
// reports, near me, search suggestions). It counts requests per address in a short window, in the
// memory of the running server: cheap and best-effort (each server instance counts on its own), which
// is enough to stop one script from filling the tables or running up the bill. Addresses are kept
// only in memory for the length of the window and never written anywhere.

type Bucket = { count: number; resetAt: number };

const MAX_KEYS = 10_000;

export function createIpRateLimiter(options: { limit: number; windowMs: number }) {
  const buckets = new Map<string, Bucket>();
  return {
    /** True when this request may go ahead. */
    allow(key: string, now: number = Date.now()): boolean {
      const bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        if (buckets.size >= MAX_KEYS) {
          // Drop expired buckets; if none expired, drop the oldest.
          for (const [stale, value] of buckets) if (value.resetAt <= now) buckets.delete(stale);
          if (buckets.size >= MAX_KEYS) {
            const oldest = buckets.keys().next().value;
            if (oldest !== undefined) buckets.delete(oldest);
          }
        }
        buckets.set(key, { count: 1, resetAt: now + options.windowMs });
        return true;
      }
      bucket.count += 1;
      return bucket.count <= options.limit;
    },
  };
}

/** The visitor's address as the hosting platform reports it; "unknown" when it does not. */
export function clientAddress(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}

/** A 429 answer with the standard retry hint. */
export function tooManyRequests(retryAfterSeconds = 60): Response {
  return new Response(null, { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } });
}
