import { describe, expect, it } from "vitest";

import { isEnglishName, isLatinText, latinToBangla } from "./to-bangla";

describe("latinToBangla", () => {
  it.each([
    ["salad", "সালাদ"],
    ["chap", "চাপ"],
    ["kacchi", "কাচ্চি"],
    ["doi", "দই"],
    ["ilish", "ইলিশ"],
    ["tehari", "তেহারি"],
    ["halim", "হালিম"],
    ["biryani", "বিরিয়ানি"],
    ["khichuri", "খিচুরি"],
    ["nihari", "নিহারি"],
    ["payesh", "পায়েশ"],
    ["shorshe ilish", "শর্শে ইলিশ"],
    ["chui jhal", "চুই ঝাল"],
  ])("turns %s into %s", (latin, bangla) => {
    expect(latinToBangla(latin)).toBe(bangla);
  });

  it("uses capitals for the other sound, as Avro does", () => {
    expect(latinToBangla("Tok")).toBe("টক");
    expect(latinToBangla("Thik")).toBe("ঠিক");
  });

  it("leaves digits and Bangla letters alone", () => {
    expect(latinToBangla("দই 2")).toBe("দই 2");
  });
});

describe("isLatinText", () => {
  it("is true only for text without any Bangla letter", () => {
    expect(isLatinText("salad")).toBe(true);
    expect(isLatinText("morog polao")).toBe(true);
    expect(isLatinText("সালাদ")).toBe(false);
    expect(isLatinText("salad সালাদ")).toBe(false);
    expect(isLatinText("  ")).toBe(false);
  });
});

describe("isEnglishName", () => {
  it("accepts English names with signs and digits, not Bangla or mixed ones", () => {
    expect(isEnglishName("Grill & Thrill by Shahnaj Kitchen")).toBe(true);
    expect(isEnglishName("Cafe 21")).toBe(true);
    expect(isEnglishName("আইডিয়াল")).toBe(false);
    expect(isEnglishName("Ideal আইডিয়াল")).toBe(false);
    expect(isEnglishName("21 & 22")).toBe(false);
  });
});
