import { describe, expect, it } from "vitest";

import { clientAddress, createIpRateLimiter } from "./ip-rate-limit";

describe("createIpRateLimiter", () => {
  it("allows up to the limit in a window, then refuses until the window ends", () => {
    const limiter = createIpRateLimiter({ limit: 3, windowMs: 1000 });
    expect([1, 2, 3].map(() => limiter.allow("a", 0))).toEqual([true, true, true]);
    expect(limiter.allow("a", 10)).toBe(false);
    expect(limiter.allow("b", 10)).toBe(true);
    expect(limiter.allow("a", 1001)).toBe(true);
  });
});

describe("clientAddress", () => {
  it("takes the first forwarded address, then the real-ip header", () => {
    expect(clientAddress(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(clientAddress(new Headers({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(clientAddress(new Headers())).toBe("unknown");
  });
});
