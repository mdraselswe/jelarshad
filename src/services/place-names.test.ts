import { describe, expect, it } from "vitest";

import { cleanSearchNames, placeNames } from "./place-names";

describe("placeNames", () => {
  it("keeps a Bangla name and takes the English one as its English name", () => {
    expect(placeNames(" আইডিয়াল ", "Ideal")).toEqual({
      nameBn: "আইডিয়াল",
      nameEn: "Ideal",
      extra: [],
    });
  });

  it("shows the Bangla name of a place typed in English", () => {
    expect(placeNames("Ideal", "আইডিয়াল")).toEqual({
      nameBn: "আইডিয়াল",
      nameEn: "Ideal",
      extra: [],
    });
  });

  it("keeps an English-only name as both, and a second name in the same script as an extra", () => {
    expect(placeNames("Ideal")).toEqual({ nameBn: "Ideal", nameEn: "Ideal", extra: [] });
    expect(placeNames("আইডিয়াল", "আইডিয়াল রেস্টুরেন্ট")).toEqual({
      nameBn: "আইডিয়াল",
      nameEn: null,
      extra: ["আইডিয়াল রেস্টুরেন্ট"],
    });
  });
});

describe("cleanSearchNames", () => {
  it("drops empty names, repeats, names the place already has, and keeps five", () => {
    const names = cleanSearchNames(
      ["  ", "Ideal", "ideal", "আইডিয়াল", "a1", "b2", "c3", "d4", "e5"],
      ["আইডিয়াল"],
    );
    expect(names?.map((name) => name.alias)).toEqual(["Ideal", "a1", "b2", "c3", "d4"]);
  });

  it("refuses an offensive name", () => {
    expect(cleanSearchNames(["fuck"])).toBeNull();
  });
});
