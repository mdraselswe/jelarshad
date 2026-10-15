import { expect, test } from "@playwright/test";

import { openReactionPicker } from "./utils/reaction";

test.describe("corrections and reports", () => {
  test("a signed-out visitor is sent to login first", async ({ page }) => {
    await page.goto("/food/doi");
    await page.getByRole("button", { name: "রিপোর্ট করুন" }).click();
    await page.getByRole("button", { name: "পাঠান" }).click();
    await expect(page).toHaveURL(/\/login\?next=%2Ffood%2Fdoi/);
  });

  test("suggests a correction and thanks the person", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/place/sample-place");
    await page.getByRole("button", { name: "সংশোধনের পরামর্শ" }).click();
    await page.getByPlaceholder("আপনার প্রস্তাব").fill("নমুনা দই ঘর (সাতমাথা)");
    await page.getByRole("button", { name: "পাঠান" }).click();
    await expect(page.getByText("ধন্যবাদ, আমরা দেখব।")).toBeVisible();
  });

  test("reports once, and a second report is turned down politely", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/place/second-sample-place");
    for (const expected of ["রিপোর্ট পাঠানো হয়েছে।", "আপনি আগেই রিপোর্ট করেছেন।"]) {
      await page.getByRole("button", { name: "রিপোর্ট করুন" }).click();
      await page.getByRole("button", { name: "পাঠান" }).click();
      await expect(page.getByText(expected)).toBeVisible();
    }
  });

  test("an offensive comment is refused with a clear message", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/add");
    await page.getByRole("textbox", { name: "কী খাবার?" }).fill("দই");
    await page.getByRole("button", { name: "দই", exact: true }).first().click();
    await page.getByRole("button", { name: "পরের ধাপ" }).first().click();
    await page.getByLabel("জেলা", { exact: true }).selectOption({ label: "বগুড়া" });
    await page.getByLabel("দোকান বা জায়গার নাম").fill("নমুনা মিষ্টিমুখ");
    await page.getByRole("button", { name: "পরের ধাপ" }).last().click();
    await page.getByRole("button", { name: "এটাই" }).first().click();
    await openReactionPicker(page);
    await page.getByRole("button", { name: "দারুণ" }).click();
    await page.getByLabel("এক লাইনে বলুন").fill("what the fuck");
    await page.getByRole("button", { name: "জমা দিন" }).click();
    await expect(page.getByText("কিছু তথ্য ঠিক নেই। দেখে আবার জমা দিন।")).toBeVisible();
  });
});
