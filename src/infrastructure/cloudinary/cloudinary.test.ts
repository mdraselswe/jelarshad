import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { signParams } from "./sign";
import { cloudinaryUrl } from "./url";

describe("signParams", () => {
  it("signs sorted key=value pairs followed by the secret", () => {
    const expected = createHash("sha1")
      .update("public_id=a/b&timestamp=1700000000SECRET")
      .digest("hex");
    expect(signParams({ timestamp: 1700000000, public_id: "a/b" }, "SECRET")).toBe(expected);
  });

  it("leaves out the file, the key and empty values", () => {
    const plain = signParams({ public_id: "x", timestamp: 1 }, "s");
    const noisy = signParams(
      { public_id: "x", timestamp: 1, file: "bytes", api_key: "k", signature: "old", empty: "" },
      "s",
    );
    expect(noisy).toBe(plain);
  });

  it("changes when the secret or any value changes", () => {
    const base = signParams({ public_id: "x", timestamp: 1 }, "s");
    expect(signParams({ public_id: "x", timestamp: 1 }, "t")).not.toBe(base);
    expect(signParams({ public_id: "y", timestamp: 1 }, "s")).not.toBe(base);
  });
});

describe("cloudinaryUrl", () => {
  it("serves WebP at the right size for each variant", () => {
    expect(cloudinaryUrl("demo", "jelarshad/experience/u-1", "thumb")).toBe(
      "https://res.cloudinary.com/demo/image/upload/c_limit,w_400,f_webp,q_auto/jelarshad/experience/u-1",
    );
    expect(cloudinaryUrl("demo", "k", "large")).toContain("w_1080");
  });
});
