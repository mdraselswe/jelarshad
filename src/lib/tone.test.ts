import { describe, expect, it } from "vitest";

import { KIND_TONE_CLASS, toneClass } from "./tone";

describe("toneClass", () => {
  it("is stable for the same seed and always returns a tone", () => {
    expect(toneClass("doi")).toBe(toneClass("doi"));
    expect(toneClass("দই")).toMatch(/^bg-cat-[a-z]+-soft text-cat-[a-z]+-fg$/);
  });

  it("uses more than one color across seeds", () => {
    const seeds = ["doi", "kacchi", "rasmalai", "haleem", "cha", "pitha", "ilish"];
    expect(new Set(seeds.map(toneClass)).size).toBeGreaterThan(2);
  });

  it("has a fixed tone per kind", () => {
    expect(KIND_TONE_CLASS.food).not.toBe(KIND_TONE_CLASS.place);
  });
});
