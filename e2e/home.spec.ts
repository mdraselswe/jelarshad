import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("shows the headline, search entry and the curated famous foods", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "আজ কী খাবেন?" })).toBeVisible();
    await expect(page.getByRole("link", { name: /খাবার, জেলা বা দোকানের নাম/ })).toHaveAttribute(
      "href",
      "/search",
    );

    const famous = page.getByRole("link", { name: /দই.*বগুড়া/ });
    await expect(famous).toHaveAttribute("href", "/district/bogura/doi");
    await expect(page.getByRole("heading", { name: "যেসব খাবারের জন্য বিখ্যাত" })).toBeVisible();
    await expect(page.getByText("সম্পাদকদের যাচাই করা তালিকা, রেটিং নয়")).toBeVisible();
  });

  test("district quick-picks link to the district page", async ({ page }) => {
    await page.goto("/");
    const chips = page.getByRole("region").filter({ hasText: "জেলায় জেলায় স্বাদ" });
    await expect(chips.getByRole("link", { name: /বগুড়া/ }).first()).toHaveAttribute(
      "href",
      "/district/bogura",
    );
  });

  test("all districts stay in the HTML, collapsed until opened", async ({ page }) => {
    await page.goto("/");
    const summary = page.getByText(/সব [০-৯]+টি জেলা দেখুন/);
    await expect(summary).toBeVisible();
    const link = page.getByRole("link", { name: "নাটোর", exact: true });
    await expect(link).toBeHidden();
    await summary.click();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/district/natore");
  });

  test("works at 360px without sideways scrolling, with the bottom nav visible", async ({
    page,
  }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
    await expect(page.getByRole("navigation", { name: "প্রধান মেনু" })).toBeVisible();
  });
});
