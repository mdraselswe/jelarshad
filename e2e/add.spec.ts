import { expect, test } from "@playwright/test";

import { addAsNewFood } from "./utils/add";

test.describe("add flow", () => {
  test("a signed-out visitor is asked to log in first", async ({ page }) => {
    await page.goto("/add");
    await expect(page.getByRole("heading", { name: "লগইন করুন" })).toBeVisible();
  });

  test("adds a new food at a new place in three steps and opens the new page", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/add");
    await expect(page.getByRole("heading", { name: "যোগ করুন" })).toBeVisible();

    // 1 — food
    await page.getByRole("textbox", { name: "কী খাবার?" }).fill("মহাস্থান কটকটি");
    await addAsNewFood(page, "মহাস্থান কটকটি");
    await page.getByRole("button", { name: "পরের ধাপ" }).first().click();

    // 2 — place
    await page.getByLabel("জেলা").selectOption({ label: "বগুড়া" });
    await page.getByLabel("দোকান বা জায়গার নাম").fill("মহাস্থানগড়ের কটকটি ঘর");
    await page.getByLabel("এলাকা").fill("মহাস্থানগড়");
    await page.getByRole("button", { name: "পরের ধাপ" }).last().click();

    // 3 — how was it
    await page.getByRole("button", { name: "দারুণ" }).click();
    await page.getByLabel("কত দিয়ে কিনলেন?").fill("80");
    await page.getByRole("button", { name: "জমা দিন" }).click();

    await expect(page.getByRole("heading", { name: "যোগ হয়েছে!" })).toBeVisible();
    await page.getByRole("link", { name: "জায়গাটা দেখুন" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "মহাস্থানগড়ের কটকটি ঘর" }),
    ).toBeVisible();
    await expect(page.getByText("মহাস্থান কটকটি").first()).toBeVisible();
  });

  test("a place with a similar name is confirmed before a duplicate is made", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/add");
    await page.getByRole("textbox", { name: "কী খাবার?" }).fill("দই");
    await page.getByRole("button", { name: "দই", exact: true }).first().click();
    await page.getByRole("button", { name: "পরের ধাপ" }).first().click();
    await page.getByLabel("জেলা").selectOption({ label: "বগুড়া" });
    await page.getByLabel("দোকান বা জায়গার নাম").fill("নমুনা দই ঘর");
    await page.getByRole("button", { name: "পরের ধাপ" }).last().click();
    await expect(page.getByText("এগুলোর কোনোটা কি?")).toBeVisible();
    await page.getByRole("button", { name: "এটাই" }).first().click();
    await expect(page.getByRole("heading", { name: "কেমন লাগল?" })).toBeVisible();
  });
});

test.describe("add flow: a close name asks before creating a second food", () => {
  test("shows the existing food and lets the person say it is a new one", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/add");
    // "দই" exists; "দইয়ের ভর্তা" is close but not the same.
    const box = page.getByRole("textbox", { name: "কী খাবার?" });
    await box.fill("দই");
    // The suggestions arrive a moment after typing; the question is asked only once they are there.
    await expect(page.getByRole("button", { name: "দই", exact: true })).toBeVisible();
    await page.getByRole("button", { name: /নতুন খাবার হিসেবে যোগ করুন/ }).click();
    await expect(page.getByText("এগুলোর কোনোটাই কি আপনি বোঝাচ্ছেন?")).toBeVisible();
    await page.getByRole("button", { name: "না, “দই” নতুন খাবার" }).click();
    await expect(page.getByText("এগুলোর কোনোটাই কি আপনি বোঝাচ্ছেন?")).toBeHidden();
  });
});

test.describe("add flow: Latin letters", () => {
  test("offers the name in Bangla and puts it in the box", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/add");
    const box = page.getByRole("textbox", { name: "কী খাবার?" });
    await box.fill("salad");
    await page.getByRole("button", { name: /বাংলায় লিখুন/ }).click();
    await expect(box).toHaveValue("সালাদ");
  });
});
