import { expect, type Page } from "@playwright/test";

/**
 * Clicks "নতুন খাবার হিসেবে যোগ করুন" for the typed name. When close names exist the form asks first
 * ("এগুলোর কোনোটাই কি আপনি বোঝাচ্ছেন?"), so this answers "না, … নতুন খাবার" if that question shows up.
 */
export async function addAsNewFood(page: Page, name: string) {
  await page.getByRole("button", { name: /নতুন খাবার হিসেবে যোগ করুন/ }).click();
  const none = page.getByRole("button", { name: `না, “${name}” নতুন খাবার` });
  // The question only appears once suggestions have loaded; give it a moment, then carry on.
  await none.waitFor({ state: "visible", timeout: 1500 }).catch(() => undefined);
  if (await none.isVisible()) {
    await none.click();
    await expect(none).toBeHidden();
  }
}
