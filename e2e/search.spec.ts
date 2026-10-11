import { expect, test } from "@playwright/test";

test.describe("search page", () => {
  test("home search entry opens the focused search box", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /খাবার, জেলা বা দোকানের নাম/ }).click();
    await expect(page).toHaveURL("/search");
    await expect(page.getByRole("searchbox", { name: "খুঁজুন" })).toBeFocused();
    await expect(page.getByText("খাবার, জেলা বা দোকানের নাম লিখুন")).toBeVisible();
  });

  test("results group foods, places and districts for a Banglish query", async ({ page }) => {
    await page.goto("/search?q=doi");
    await expect(page.getByText("“doi”-র ফলাফল")).toBeVisible();
    const foods = page.getByRole("region", { name: "খাবার" });
    await expect(foods.getByRole("link", { name: /দই/ })).toHaveAttribute("href", "/food/doi");
  });

  test.describe("spelling variants meet the same food", () => {
    for (const query of ["kacchi", "kachchi", "কাচ্চি", "কাচি"]) {
      test(query, async ({ page }) => {
        await page.goto(`/search?q=${encodeURIComponent(query)}`);
        await expect(
          page
            .getByRole("region", { name: "খাবার" })
            .getByRole("link", { name: /কাচ্চি বিরিয়ানি/ }),
        ).toHaveAttribute("href", "/food/kacchi");
      });
    }
  });

  test("tabs narrow the results and keep the query", async ({ page }) => {
    await page.goto("/search?q=বগুড়া");
    await page.getByRole("link", { name: /^জেলা/ }).click();
    await expect(page).toHaveURL(/tab=district/);
    await expect(page.getByRole("link", { name: /বগুড়া/ }).first()).toHaveAttribute(
      "href",
      "/district/bogura",
    );
    await expect(page.getByRole("region", { name: "জায়গা" })).toHaveCount(0);
  });

  test("place filters live in the URL", async ({ page }) => {
    await page.goto("/search?q=নমুনা&tab=place");
    await expect(page.getByRole("link", { name: /নমুনা দই ঘর/ })).toBeVisible();
    await page.getByRole("link", { name: "রেস্টুরেন্ট", exact: true }).click();
    await expect(page).toHaveURL(/type=restaurant/);
    await expect(page.getByRole("link", { name: "রেস্টুরেন্ট", exact: true })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(page.getByRole("link", { name: /নমুনা দই ঘর/ })).toHaveCount(0);
  });

  test("an empty result explains itself", async ({ page }) => {
    await page.goto("/search?q=zzzzqq");
    await expect(page.getByText("“zzzzqq” নামে কিছু পাওয়া যায়নি।")).toBeVisible();
    await expect(page.getByText("বানান বদলে দেখুন")).toBeVisible();
  });

  test("typing shows grouped suggestions, then Enter opens the results", async ({ page }) => {
    await page.goto("/search");
    const box = page.getByRole("searchbox", { name: "খুঁজুন" });
    await box.fill("kachchi");
    const suggestion = page.getByRole("link", { name: /কাচ্চি বিরিয়ানি/ });
    await expect(suggestion).toBeVisible();
    await expect(suggestion).toHaveAttribute("href", "/food/kacchi");
    await box.press("Enter");
    await expect(page).toHaveURL(/q=kachchi/);
    await expect(page.getByText("“kachchi”-র ফলাফল")).toBeVisible();
  });

  test("the clear button empties the box", async ({ page }) => {
    await page.goto("/search?q=doi");
    await page.getByRole("button", { name: "মুছে ফেলুন" }).click();
    await expect(page.getByRole("searchbox", { name: "খুঁজুন" })).toHaveValue("");
  });

  test("works at 360px without sideways scrolling", async ({ page }) => {
    await page.goto("/search?q=বগুড়া");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});

test.describe("GET /api/search", () => {
  test("returns grouped, capped suggestions and is publicly cacheable", async ({ request }) => {
    const response = await request.get("/api/search?q=doi");
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("s-maxage=60");
    const body = await response.json();
    expect(body.foods.map((f: { slug: string }) => f.slug)).toContain("doi");
    for (const group of [body.foods, body.places, body.districts]) {
      expect(group.length).toBeLessThanOrEqual(3);
    }
  });

  test("short or missing queries return empty groups, not errors", async ({ request }) => {
    for (const url of ["/api/search", "/api/search?q=", "/api/search?q=d"]) {
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
      expect(await response.json()).toMatchObject({ foods: [], places: [], districts: [] });
    }
  });

  test("caps very long queries", async ({ request }) => {
    const response = await request.get(`/api/search?q=${"a".repeat(500)}`);
    expect(response.status()).toBe(200);
    expect((await response.json()).query.length).toBeLessThanOrEqual(60);
  });
});

test.describe("search while typing", () => {
  test("suggestions replace the results of the previous search instead of stacking on them", async ({
    page,
  }) => {
    await page.goto("/search?q=doi");
    const results = page.locator("[data-search-results]");
    await expect(results).toBeVisible();
    const box = page.getByRole("searchbox", { name: "খুঁজুন" });
    await box.fill("বগুড়া");
    await expect(page.getByRole("region", { name: "জেলা" }).first()).toBeVisible();
    await expect(results).toBeHidden();
  });
});
