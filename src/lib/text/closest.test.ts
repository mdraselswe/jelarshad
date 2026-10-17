import { describe, expect, it } from "vitest";

import { closest, editDistance } from "./closest";

describe("editDistance", () => {
  it("counts insertions, deletions and swaps", () => {
    expect(editDistance("kacci", "kacci")).toBe(0);
    expect(editDistance("kacci", "kaci")).toBe(1);
    expect(editDistance("doi", "dhoi")).toBe(1);
    expect(editDistance("pizza", "pitza")).toBe(1);
    expect(editDistance("", "abc")).toBe(3);
  });
});

describe("closest", () => {
  const candidates = [
    { key: "kaci", item: "কাচ্চি" },
    { key: "pija", item: "পিজ্জা" },
    { key: "doi", item: "দই" },
    { key: "bokari", item: "বাকরখানি" },
  ];

  it("returns the near names, nearest first, never an exact match", () => {
    expect(closest("kacci", candidates, 3)).toEqual(["কাচ্চি"]);
    expect(closest("pijja", candidates, 3)).toEqual(["পিজ্জা"]);
    expect(closest("kaci", candidates, 3)).toEqual([]);
  });

  it("ignores words that are too short or too far", () => {
    expect(closest("do", candidates, 3)).toEqual([]);
    expect(closest("burger", candidates, 3)).toEqual([]);
  });

  it("matches a word inside a longer name", () => {
    expect(closest("doy", [{ key: "doi ghor", item: "দই ঘর" }], 3)).toEqual(["দই ঘর"]);
  });

  it("respects the limit", () => {
    const many = ["aaaa", "aaab", "aaac", "aaad"].map((key) => ({ key, item: key }));
    expect(closest("aaax", many, 2)).toHaveLength(2);
  });
});
