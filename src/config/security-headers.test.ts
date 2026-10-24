import { describe, expect, it } from "vitest";

import { securityHeaders } from "./security-headers";

const byKey = (production: boolean) =>
  Object.fromEntries(securityHeaders({ production }).map((header) => [header.key, header.value]));

describe("security headers", () => {
  it("refuses framing and sniffing, and limits the referrer and browser features", () => {
    const headers = byKey(true);
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("geolocation=(self)");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
  });

  it("sends a content security policy from a production build only", () => {
    const csp = byKey(true)["Content-Security-Policy"] ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("https://api.cloudinary.com");
    expect(csp).not.toContain("unsafe-eval");
    expect(byKey(false)["Content-Security-Policy"]).toBeUndefined();
  });
});
