import { describe, expect, it } from "vitest";

import { cleanHours, cleanPhone, cleanWebsite, phoneHref } from "./place-contact";

describe("cleanPhone", () => {
  it("keeps a normal number and turns Bangla digits into Latin ones", () => {
    expect(cleanPhone("01711-223344")).toBe("01711-223344");
    expect(cleanPhone("+880 1711 223344")).toBe("+880 1711 223344");
    expect(cleanPhone("০১৭১১২২৩৩৪৪")).toBe("01711223344");
  });

  it("refuses text, short numbers and empty input", () => {
    expect(cleanPhone("call me")).toBeNull();
    expect(cleanPhone("123")).toBeNull();
    expect(cleanPhone("  ")).toBeNull();
    expect(cleanPhone(null)).toBeNull();
  });

  it("makes a tel: link from the digits", () => {
    expect(phoneHref("+880 1711-223344")).toBe("tel:+8801711223344");
  });
});

describe("cleanWebsite", () => {
  it("accepts a full address or one without the scheme", () => {
    expect(cleanWebsite("https://example.com/menu")).toBe("https://example.com/menu");
    expect(cleanWebsite("facebook.com/akbaria")).toBe("https://facebook.com/akbaria");
  });

  it("refuses other schemes, spaces and words", () => {
    expect(cleanWebsite("javascript:alert(1)")).toBeNull();
    expect(cleanWebsite("ftp://example.com")).toBeNull();
    expect(cleanWebsite("not a site")).toBeNull();
    expect(cleanWebsite("localhost")).toBeNull();
  });
});

describe("cleanHours", () => {
  it("collapses spaces, trims and caps the length", () => {
    expect(cleanHours("  শনি–বৃহস্পতি   ১০:০০–২২:০০ ")).toBe("শনি–বৃহস্পতি ১০:০০–২২:০০");
    expect([...(cleanHours("a".repeat(300)) ?? "")]).toHaveLength(120);
    expect(cleanHours("   ")).toBeNull();
  });
});
