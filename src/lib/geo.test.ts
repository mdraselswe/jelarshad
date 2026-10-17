import { describe, expect, it } from "vitest";

import { distanceKm } from "./geo";

describe("distanceKm", () => {
  it("is zero for the same point and symmetric", () => {
    const a = { lat: 23.7461, lng: 90.3742 };
    const b = { lat: 23.8103, lng: 90.4125 };
    expect(distanceKm(a, a)).toBe(0);
    expect(distanceKm(a, b)).toBeCloseTo(distanceKm(b, a), 9);
  });

  it("matches known distances closely (Dhaka to Chattogram is about 215 km)", () => {
    const dhaka = { lat: 23.8103, lng: 90.4125 };
    const chattogram = { lat: 22.3569, lng: 91.7832 };
    expect(distanceKm(dhaka, chattogram)).toBeGreaterThan(200);
    expect(distanceKm(dhaka, chattogram)).toBeLessThan(230);
  });
});
