import { describe, expect, it } from "vitest";

import { looseMatch } from "./area-filter-match";

describe("looseMatch", () => {
  const row = "পিজ্জাবার্গ খিলগাঁও ঢাকা pijjabarg kilga daka";

  it("finds a Bangla row from Banglish spelling variants", () => {
    expect(looseMatch("kilgan", row)).toBe(true);
    expect(looseMatch("kilga", row)).toBe(true);
  });

  it("matches a half-typed word", () => {
    expect(looseMatch("kil", row)).toBe(true);
  });

  it("does not match an unrelated word", () => {
    expect(looseMatch("basundara", row)).toBe(false);
  });
});
