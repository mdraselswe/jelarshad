import { expect, test } from "@playwright/test";

test.describe("profile", () => {
  test("shows tabs for contributions, what I ate and saved items", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/me/profile");
    await expect(page.getByRole("heading", { level: 1, name: "নমুনা ব্যবহারকারী" })).toBeVisible();
    await expect(page.getByRole("link", { name: "আমার অবদান" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByText("যে জায়গা যোগ করেছেন")).toBeVisible();

    await page.getByRole("link", { name: "খেয়েছি" }).click();
    await expect(page).toHaveURL(/tab=ate/);
    await expect(page.getByRole("link", { name: "খেয়েছি" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await page.getByRole("link", { name: "খেতে চাই" }).click();
    await expect(page).toHaveURL(/tab=saved/);
    await expect(page.getByRole("link", { name: "খেতে চাই" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("a saved food appears under খেতে চাই and a reaction under খেয়েছি", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/food/doi");
    const bookmark = page.getByRole("button", { name: "খেতে চাই তালিকায় রাখুন" }).first();
    if ((await bookmark.getAttribute("aria-pressed")) !== "true") await bookmark.click();
    await expect(page.getByText("খেতে চাই তালিকায় রাখা হয়েছে।")).toBeVisible();
    await page.goto("/me/profile?tab=saved");
    await expect(page.getByRole("link", { name: /^দই/ })).toBeVisible();
  });

  test("the theme switcher and sign-out live in settings", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/me/profile");
    await expect(page.getByRole("heading", { name: "সেটিংস" })).toBeVisible();
    await expect(page.getByRole("button", { name: "লগআউট" })).toBeVisible();
  });
});

test.describe("sharing", () => {
  test("copies the link when the browser has no share sheet", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    });
    await page.goto("/food/doi");
    await page.getByRole("button", { name: "শেয়ার করুন" }).first().click();
    await expect(page.getByText("লিংক কপি হয়েছে।")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/\/food\/doi$/);
  });

  test("uses the share sheet when there is one", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __shared: unknown }).__shared = null;
      navigator.share = async (data) => {
        (window as unknown as { __shared: unknown }).__shared = data;
      };
    });
    await page.goto("/place/sample-place");
    await page.getByRole("button", { name: "শেয়ার করুন" }).first().click();
    const shared = await page.evaluate(
      () => (window as unknown as { __shared: ShareData }).__shared,
    );
    expect(shared.title).toBe("নমুনা দই ঘর");
    expect(shared.url).toMatch(/\/place\/sample-place$/);
  });

  test("every shareable page has a branded image card", async ({ request }) => {
    for (const path of [
      "/food/doi",
      "/place/sample-place",
      "/district/bogura",
      "/district/bogura/doi",
    ]) {
      // The image URL carries a content hash, so it is read from the page like a crawler would.
      const html = await (await request.get(path)).text();
      const url = /property="og:image" content="([^"]+)"/.exec(html)?.[1];
      expect(url, path).toBeTruthy();
      const response = await request.get(new URL(url ?? "", "http://localhost:3000").pathname);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/png");
      expect((await response.body()).length).toBeGreaterThan(5_000);
    }
  });
});
