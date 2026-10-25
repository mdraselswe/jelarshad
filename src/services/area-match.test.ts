import { describe, expect, it } from "vitest";

import { matchArea } from "./area-match";

const areas = [
  { id: 7, nameBn: "আফতাবনগর", nameEn: null },
  { id: 3, nameBn: "আফতাবনগর", nameEn: "Aftabnagar" },
  { id: 5, nameBn: "বাড্ডা", nameEn: "Badda" },
];

describe("matchArea", () => {
  it("matches whatever the spacing, prefers the oldest area and returns the rest", () => {
    expect(matchArea(areas, "আফতাব নগর, আড্ডার মোড়")).toEqual({
      area: areas[1],
      rest: "আড্ডার মোড়",
    });
  });

  it("matches the English name and any comma part", () => {
    expect(matchArea(areas, "রোড ৩, aftab nagar").area?.id).toBe(3);
    expect(matchArea(areas, "Badda").area?.id).toBe(5);
  });

  it("finds nothing for a new neighbourhood", () => {
    expect(matchArea(areas, "নতুন পাড়া")).toEqual({ area: null, rest: null });
  });
});
