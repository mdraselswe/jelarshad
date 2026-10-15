import { expect, test } from "@playwright/test";

import { openReactionPicker } from "./utils/reaction";

test.describe("reaction picker", () => {
  test("a signed-out tap asks for login and returns to the page", async ({ page }) => {
    await page.goto("/place/second-sample-place");
    await openReactionPicker(page);
    await page.getByRole("button", { name: "দারুণ" }).first().click();
    await expect(page).toHaveURL(/\/login\?next=%2Fplace%2Fsecond-sample-place/);
    await page.getByRole("link", { name: "গুগল দিয়ে চালিয়ে যান" }).click();
    await expect(page).toHaveURL(/\/place\/second-sample-place$/);
  });

  test("a signed-in tap saves, shows a toast and updates the place page", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/place/second-sample-place");
    const before = await page
      .getByText(/[০-৯]+ জন/)
      .first()
      .textContent();
    await openReactionPicker(page);
    await page.getByRole("button", { name: "দারুণ" }).first().click();
    await expect(page.getByText("অভিজ্ঞতা যোগ হয়েছে। ধন্যবাদ!")).toBeVisible();
    // A level-up or mission reward opens a full-screen dialog over the page; close it if it did.
    const carryOn = page.getByRole("button", { name: "চালিয়ে যান" });
    if (await carryOn.isVisible()) await carryOn.click();
    // The box now shows what the person said instead of asking again.
    await expect(page.getByText("আপনি জানিয়েছেন")).toBeVisible();
    await expect(page.getByRole("button", { name: "মতামত বদলান বা আরও জানান" })).toBeVisible();
    await expect
      .poll(async () =>
        page
          .getByText(/[০-৯]+ জন/)
          .first()
          .textContent(),
      )
      .not.toBe(before);
  });

  test("on a food page the person chooses where they ate, then submits", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/food/doi");
    await openReactionPicker(page);
    await page.getByRole("button", { name: "মোটামুটি" }).first().click();
    await expect(page.getByLabel("কোথায় খেয়েছেন?").first()).toBeVisible();
    await page.getByRole("button", { name: "জমা দিন" }).first().click();
    await expect(
      page.getByText(/অভিজ্ঞতা যোগ হয়েছে। ধন্যবাদ!|আপনার মতামত বদলানো হয়েছে।/),
    ).toBeVisible();
  });
});
