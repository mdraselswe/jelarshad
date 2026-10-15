import { expect, test } from "@playwright/test";

import { openReactionPicker } from "./utils/reaction";

import { addAsNewFood } from "./utils/add";

// 1x1 transparent PNG: enough for the browser to decode, shrink to WebP and upload.
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

test("a photo added with the experience shows on the place page and opens in a viewer", async ({
  page,
}) => {
  await page.goto("/auth/sign-in?next=/add");
  await page.getByRole("textbox", { name: "কী খাবার?" }).fill("ছবির ঝালমুড়ি");
  await addAsNewFood(page, "ছবির ঝালমুড়ি");
  await page.getByRole("button", { name: "পরের ধাপ" }).first().click();
  await page.getByLabel("জেলা", { exact: true }).selectOption({ label: "বগুড়া" });
  await page.getByLabel("দোকান বা জায়গার নাম").fill("ছবিওয়ালা দোকান");
  await page.getByRole("button", { name: "পরের ধাপ" }).last().click();
  await openReactionPicker(page);
  await page.getByRole("button", { name: "দারুণ" }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "dish.png",
    mimeType: "image/png",
    buffer: PIXEL,
  });
  await expect(page.getByRole("button", { name: "ছবিটি সরান" })).toBeVisible();
  await page.getByRole("button", { name: "জমা দিন" }).click();
  await expect(page.getByRole("heading", { name: "যোগ হয়েছে!" })).toBeVisible();

  await page.getByRole("link", { name: "জায়গাটা দেখুন" }).click();
  await page.getByRole("button", { name: "ছবি ১ দেখুন" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("a file that is not a picture is turned down with a message", async ({ page }) => {
  await page.goto("/auth/sign-in?next=/add");
  await page.getByRole("textbox", { name: "কী খাবার?" }).fill("ঝালমুড়ি ২");
  await addAsNewFood(page, "ঝালমুড়ি ২");
  await page.getByRole("button", { name: "পরের ধাপ" }).first().click();
  await page.getByLabel("জেলা", { exact: true }).selectOption({ label: "বগুড়া" });
  await page.getByLabel("দোকান বা জায়গার নাম").fill("আরেকটা দোকান");
  await page.getByRole("button", { name: "পরের ধাপ" }).last().click();
  await page.locator("input[type=file]").setInputFiles({
    name: "notes.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4"),
  });
  await expect(page.getByText("শুধু ছবি বেছে নিন।")).toBeVisible();
});
