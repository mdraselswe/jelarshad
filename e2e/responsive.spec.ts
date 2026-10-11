import { expect, test } from "@playwright/test";

// Runs in the `tablet-chromium` (834px) and `desktop-chromium` (1280px) projects; the phone
// project covers 360px in every other spec. Layout rules: docs/design/desktop.

const PAGES = [
  "/",
  "/food/doi",
  "/place/sample-place",
  "/district/bogura",
  "/district/bogura/doi",
  "/search?q=doi",
];

async function overflow(page: import("@playwright/test").Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

test.describe("every read page fits the viewport", () => {
  for (const path of PAGES) {
    test(`no sideways scroll: ${path}`, async ({ page }) => {
      await page.goto(path);
      expect(await overflow(page)).toBe(0);
    });
  }
});

test.describe("desktop (1024px and up)", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "desktop only");

  test("a top bar replaces the bottom nav", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator('nav[aria-label="প্রধান মেনু"]');
    await expect(nav).toHaveCount(2); // top bar + the (hidden) bottom nav
    await expect(nav.first()).toBeVisible();
    await expect(nav.first().getByRole("link", { name: "হোম" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(nav.last()).toBeHidden();
    await expect(page.getByRole("link", { name: "যোগ" }).first()).toBeVisible();
  });

  test("detail pages show a breadcrumb instead of the back button", async ({ page }) => {
    await page.goto("/food/doi");
    const crumbs = page.getByRole("navigation", { name: "পথ" });
    await expect(crumbs).toBeVisible();
    await expect(crumbs.getByRole("link", { name: "হোম" })).toHaveAttribute("href", "/");
    await expect(crumbs.getByText("দই")).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("link", { name: "পেছনে যান" })).toBeHidden();
  });

  test("food page puts the lists and the score side by side", async ({ page }) => {
    await page.goto("/food/doi");
    const list = page.getByRole("region", { name: "কমিউনিটির প্রিয় জায়গা" });
    const score = page.getByText("পছন্দ করেছেন", { exact: true }).locator("visible=true");
    await expect(score).toBeVisible();
    const [listBox, scoreBox] = await Promise.all([list.boundingBox(), score.boundingBox()]);
    expect(scoreBox?.x ?? 0).toBeGreaterThan((listBox?.x ?? 0) + (listBox?.width ?? 0) - 1);
  });

  test("place page shows dishes and the info card in two columns", async ({ page }) => {
    await page.goto("/place/sample-place");
    const dishes = page.getByRole("region", { name: "প্রথমবার? এগুলো অর্ডার করুন" });
    const info = page.getByRole("region", { name: "তথ্য" });
    const [a, b] = await Promise.all([dishes.boundingBox(), info.boundingBox()]);
    expect(b?.x ?? 0).toBeGreaterThan((a?.x ?? 0) + (a?.width ?? 0) - 1);
  });

  test("search keeps the filters beside the results", async ({ page }) => {
    await page.goto("/search?q=doi");
    const filters = page.getByRole("group", { name: "ফিল্টার" });
    const results = page.getByRole("region", { name: "জায়গা" });
    const [f, r] = await Promise.all([filters.boundingBox(), results.boundingBox()]);
    expect(r?.x ?? 0).toBeGreaterThan((f?.x ?? 0) + (f?.width ?? 0) - 1);
    // the global search field would duplicate the page's own box
    await expect(page.getByRole("link", { name: "খাবার, জেলা বা দোকানের নাম" })).toHaveCount(0);
  });
});

test.describe("tablet (768 to 1023px)", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024, "tablet only");

  test("keeps the floating bottom nav and a two-column famous grid", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "প্রধান মেনু" }).last()).toBeVisible();
    const cards = page.getByRole("link", { name: /দই.*বগুড়া/ });
    const next = page.getByRole("link", { name: /.+/ }).filter({ hasText: "মেজবান" }).first();
    const [a, b] = await Promise.all([cards.boundingBox(), next.boundingBox()]);
    expect(a && b && Math.abs(a.width - b.width) < 2).toBe(true);
  });
});
