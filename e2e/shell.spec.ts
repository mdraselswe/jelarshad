import { expect, test } from "@playwright/test";

test.describe("app shell", () => {
  test("home shows the header logo and the bottom nav with home active", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "সোজাসাপ্টা" }).first()).toBeVisible();

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

  test("coming-soon page has no app chrome", async ({ page }) => {
    await page.goto("/coming-soon");
    await expect(page.getByRole("navigation", { name: "প্রধান মেনু" })).toHaveCount(0);
  });
});
