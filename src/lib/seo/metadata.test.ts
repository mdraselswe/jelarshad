import { describe, expect, it } from "vitest";

import { buildMetadata } from "./metadata";

describe("buildMetadata", () => {
  it("builds the canonical URL, Open Graph and Twitter card from the path", () => {
    const meta = buildMetadata({ title: "দই", description: "বগুড়ার দই", path: "/food/doi" });
    expect(meta.title).toBe("দই");
    expect(meta.alternates.canonical).toBe("http://localhost:3000/food/doi");
    expect(meta.openGraph).toMatchObject({
      title: "দই · জেলার স্বাদ",
      url: "http://localhost:3000/food/doi",
      locale: "bn_BD",
    });
    expect(meta.twitter.card).toBe("summary_large_image");
  });

  it("omits the title for the home page and falls back to the tagline", () => {
    const meta = buildMetadata({ description: "x", path: "/" });
    expect("title" in meta).toBe(false);
    expect(meta.openGraph.title).toBe("জেলার স্বাদ — জেলায় জেলায় আসল স্বাদের খোঁজ");
  });

  it("adds an absolute image only when given, and noindex only when asked", () => {
    expect(buildMetadata({ description: "x", path: "/" }).openGraph.images).toBeUndefined();
    const meta = buildMetadata({
      description: "x",
      path: "/",
      image: "/og/doi.png",
      noindex: true,
    });
    expect(meta.openGraph.images).toEqual([{ url: "http://localhost:3000/og/doi.png" }]);
    expect(meta.robots).toEqual({ index: false, follow: false });
  });
});
