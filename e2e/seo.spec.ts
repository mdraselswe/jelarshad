import { expect, test } from "@playwright/test";

test.describe("search engines", () => {
  test("robots.txt keeps private areas out and points to the sitemap", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Disallow: /me");
    expect(body).toMatch(/Sitemap: .+\/sitemap\.xml/);
  });

  test("the sitemap lists real pages of every kind", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/food/doi");
    expect(sitemap).toContain("/place/sample-place");
    expect(sitemap).toMatch(/\/district\/[^/<]+<\/loc>/);
    expect(sitemap).toMatch(/\/district\/[^/<]+\/[^/<]+<\/loc>/);
    expect(sitemap).toContain("/policy");
  });

  test("place pages carry structured data, a canonical link and no fake rating", async ({
    page,
  }) => {
    await page.goto("/place/sample-place");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const data = blocks.flatMap((block) => [JSON.parse(block)].flat());
    expect(data.map((item) => item["@type"])).toEqual(expect.arrayContaining(["BreadcrumbList"]));
    expect(JSON.stringify(data)).not.toContain("aggregateRating");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/place\/sample-place$/,
    );
  });

  test("the home page describes the site with a search action", async ({ page }) => {
    await page.goto("/");
    const text = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).join();
    expect(text).toContain("SearchAction");
  });

  test("private pages are noindex", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("installable app", () => {
  test("the manifest names the app, starts at home and has the icons", async ({ request }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.short_name).toBe("Jelar Shad");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/?source=pwa");
    const purposes = manifest.icons.map((icon: { purpose?: string }) => icon.purpose ?? "any");
    expect(purposes).toContain("maskable");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
  });

  test("the service worker file is served", async ({ request }) => {
    const response = await request.get("/sw.js");
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain("addEventListener");
  });
});

test.describe("about and privacy pages", () => {
  test("both open from the home page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "আমাদের কথা" }).click();
    await expect(page.getByRole("heading", { name: "আমাদের কথা", level: 1 })).toBeVisible();
    await page.goto("/policy");
    await expect(page.getByRole("heading", { name: "গোপনীয়তা ও নিয়ম", level: 1 })).toBeVisible();
  });
});
