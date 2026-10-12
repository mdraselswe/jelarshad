import { expect, test } from "@playwright/test";

test.describe("app shell", () => {
  test("home shows the header logo and the bottom nav with home active", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "জেলার স্বাদ" }).first()).toBeVisible();

    const nav = page.getByRole("navigation", { name: "প্রধান মেনু" });
    await expect(nav.getByRole("link")).toHaveText(["হোম", "খুঁজুন", "যোগ", "আমি"]);
    await expect(nav.getByRole("link", { name: "হোম" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "খুঁজুন" })).not.toHaveAttribute("aria-current");
  });

  test("bottom nav stays in the viewport, thumb-reachable, at 360px", async ({ page }) => {
    await page.goto("/");
    const box = await page.getByRole("navigation", { name: "প্রধান মেনু" }).boundingBox();
    const viewport = page.viewportSize();
    expect(box && viewport).toBeTruthy();
    if (!box || !viewport) return;
    expect(box.x).toBeGreaterThanOrEqual(16);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 16);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    expect(box.height).toBeCloseTo(66, 0);
  });

  test("every page ends with the legal links and the builder's LinkedIn", async ({ page }) => {
    await page.goto("/about");
    const credit = page.getByRole("link", { name: /LinkedIn.*mdraselswe/ });
    await expect(credit).toHaveAttribute("href", "https://linkedin.com/in/mdraselswe");
    await expect(credit).toHaveAttribute("rel", /noopener/);
    await expect(page.getByRole("link", { name: "গোপনীয়তা ও নিয়ম" })).toBeVisible();
  });

  test("the pinned action is fixed to the screen, not to the page", async ({ page }) => {
    await page.goto("/food/doi");
    const cta = page.locator("[data-page-cta]");
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    const viewport = page.viewportSize();
    expect(box && viewport).toBeTruthy();
    if (!box || !viewport) return;
    // at the top of a long page it already sits at the bottom of the screen
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    expect(box.y).toBeGreaterThan(viewport.height / 2);
  });

  test("coming-soon page has no app chrome", async ({ page }) => {
    await page.goto("/coming-soon");
    await expect(page.getByRole("navigation", { name: "প্রধান মেনু" })).toHaveCount(0);
  });
});
