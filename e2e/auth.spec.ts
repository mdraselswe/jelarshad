import { expect, test } from "@playwright/test";

// AUTH_PROVIDER=mock in CI: "Google" is replaced by a demo user, the rest of the flow is real.

test.describe("login", () => {
  test("a signed-out visitor to /me is asked to log in, then lands back on /me", async ({
    page,
  }) => {
    await page.goto("/me");
    await expect(page.getByRole("heading", { name: "লগইন করুন" })).toBeVisible();
    await page.getByRole("link", { name: "গুগল দিয়ে চালিয়ে যান" }).click();
    await expect(page).toHaveURL(/\/me$/);
    await expect(page.getByRole("heading", { level: 1, name: "নমুনা ব্যবহারকারী" })).toBeVisible();
  });

  test("signing out returns to the login prompt", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/me/profile");
    await expect(page).toHaveURL(/\/me\/profile$/);
    await page.getByRole("button", { name: "লগআউট" }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/me");
    await expect(page.getByRole("heading", { name: "লগইন করুন" })).toBeVisible();
  });

  test("the login page never redirects off-site", async ({ page }) => {
    await page.goto("/auth/sign-in?next=//evil.example/steal");
    await expect(page).toHaveURL(/localhost:\d+\/$/);
  });

  test("a failed sign-in explains itself", async ({ page }) => {
    await page.goto("/auth/callback?code=bad&next=/me");
    await expect(page.getByText("লগইন হয়নি। আবার চেষ্টা করুন।")).toBeVisible();
  });

  test("sign-out refuses GET", async ({ request }) => {
    const response = await request.get("/auth/sign-out", { maxRedirects: 0 });
    expect(response.status()).toBe(405);
  });
});
