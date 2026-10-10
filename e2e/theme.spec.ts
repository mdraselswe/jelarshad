import { expect, test } from "@playwright/test";

const backgroundOf = (page: import("@playwright/test").Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe("theme", () => {
  test("follows the OS when nothing is saved", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBeUndefined();
    expect(await backgroundOf(page)).toBe("rgb(15, 15, 20)");
  });

  test("applies a saved theme before first paint (no flash)", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => {
      localStorage.setItem("ss-theme", "dark");
      // Record the theme at the first moment the body exists, before any React code runs.
      new MutationObserver((_, observer) => {
        if (document.body) {
          (window as unknown as { firstPaintTheme?: string | undefined }).firstPaintTheme =
            document.documentElement.dataset.theme;
          observer.disconnect();
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => (window as unknown as { firstPaintTheme?: string | undefined }).firstPaintTheme,
      ),
    ).toBe("dark");
    expect(await backgroundOf(page)).toBe("rgb(15, 15, 20)");

    await page.reload();
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  });

  test("ignores an unknown saved theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => localStorage.setItem("ss-theme", "removed-theme"));
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBeUndefined();
    expect(await backgroundOf(page)).toBe("rgb(244, 243, 255)");
  });

  test("switcher on /dev/themes changes and remembers the theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/dev/themes");
    await page.getByRole("radio", { name: "গাঢ়" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("ss-theme"))).toBe("dark");

    await page.getByRole("radio", { name: "সিস্টেম" }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
    expect(await page.evaluate(() => localStorage.getItem("ss-theme"))).toBeNull();
  });
});
