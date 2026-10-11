import { expect, test } from "@playwright/test";

test.describe("food page", () => {
  test("ranks places with enough experiences and keeps new ones visible as নতুন", async ({
    page,
  }) => {
    await page.goto("/food/doi");
    await expect(page.getByRole("heading", { level: 1, name: "দই" })).toBeVisible();

    const ranked = page.getByRole("region", { name: "কমিউনিটির প্রিয় জায়গা" });
    const first = ranked.getByRole("link", { name: /নমুনা দই ঘর/ });
    await expect(first).toHaveAttribute("href", "/place/sample-place");
    await expect(first).toContainText("১");
    await expect(first.getByLabel(/পছন্দ করেছেন/)).toBeVisible();

    // Three experiences is too few for a score: shown as "নতুন", never as a percentage.
    const fewer = page.getByRole("region", { name: "এখনও পর্যাপ্ত অভিজ্ঞতা নেই" });
    const second = fewer.getByRole("link", { name: /নমুনা মিষ্টিমুখ/ });
    await expect(second).toContainText("নতুন");
    await expect(second).not.toContainText("%");
  });

  test("shows what people wrote", async ({ page }) => {
    await page.goto("/food/doi");
    const voices = page.getByRole("region", { name: "মানুষ যা বলছেন" });
    await expect(voices.getByText("টক-মিষ্টি ঠিকঠাক, হাঁড়ির দই।")).toBeVisible();
  });

  test("unknown food shows the not-found page", async ({ page }) => {
    await page.goto("/food/no-such-food");
    // The shell streams before the lookup finishes, so the status is already 200; Next marks the
    // page noindex instead.
    await expect(page.locator("meta[name=robots]").first()).toHaveAttribute("content", /noindex/);
    await expect(page.getByRole("heading", { name: "পাতাটি খুঁজে পাওয়া যায়নি" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "খুঁজুন" })).toBeVisible();
  });
});

test.describe("place page", () => {
  test("lists what to order and opens the map in a new tab", async ({ page }) => {
    await page.goto("/place/sample-place");
    await expect(page.getByRole("heading", { level: 1, name: "নমুনা দই ঘর" })).toBeVisible();

    const order = page.getByRole("region", { name: "প্রথমবার? এগুলো অর্ডার করুন" });
    await expect(order.getByRole("link", { name: /দই/ })).toHaveAttribute("href", "/food/doi");

    const map = page.getByRole("link", { name: /ম্যাপে দেখুন/ });
    await expect(map).toHaveAttribute("target", "_blank");
    await expect(map).toHaveAttribute("rel", /noopener/);
    await expect(map).toHaveAttribute("href", /^https:\/\/www\.google\.com\/maps\/search\//);
  });

  test("claims show status as text, not colour alone", async ({ page }) => {
    await page.goto("/place/sample-place");
    await expect(page.getByText("খাবার পাওয়া যায় · এখনও যাচাই হয়নি")).toBeVisible();
  });

  test("works at 360px without sideways scrolling", async ({ page }) => {
    for (const path of ["/food/doi", "/place/sample-place"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBe(0);
    }
  });

  test("unknown place shows the not-found page", async ({ page }) => {
    await page.goto("/place/no-such-place");
    await expect(page.getByRole("heading", { name: "পাতাটি খুঁজে পাওয়া যায়নি" })).toBeVisible();
    await expect(page.locator("meta[name=robots]").first()).toHaveAttribute("content", /noindex/);
  });
});

test.describe("district pages", () => {
  test("district page lists famous foods and places", async ({ page }) => {
    await page.goto("/district/bogura");
    await expect(page.getByRole("heading", { level: 1, name: "বগুড়া" })).toBeVisible();
    const famous = page.getByRole("region", { name: "বিখ্যাত খাবার" });
    await expect(famous.getByRole("link", { name: /দই/ })).toHaveAttribute(
      "href",
      "/district/bogura/doi",
    );
    const places = page.getByRole("region", { name: "এখানকার জায়গা" });
    await expect(places.getByRole("link", { name: /নমুনা দই ঘর/ })).toHaveAttribute(
      "href",
      "/place/sample-place",
    );
  });

  test("a district with no places says so", async ({ page }) => {
    await page.goto("/district/natore");
    await expect(page.getByText("এই জেলায় এখনও কোনো জায়গা যোগ হয়নি।")).toBeVisible();
  });

  test("district × food shows only that district's places", async ({ page }) => {
    await page.goto("/district/bogura/doi");
    await expect(page.getByRole("heading", { level: 1, name: "বগুড়া-এর দই" })).toBeVisible();
    await expect(page.getByRole("link", { name: /নমুনা দই ঘর/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "সারা দেশে দই দেখুন" })).toHaveAttribute(
      "href",
      "/food/doi",
    );
  });

  test("district × food with no dishes shows an empty state", async ({ page }) => {
    await page.goto("/district/dhaka/doi");
    await expect(page.getByText(/কোথায় ভালো পাওয়া যায়, এখনও কেউ জানায়নি/)).toBeVisible();
  });

  test("unknown district or pair shows the not-found page", async ({ page }) => {
    for (const path of ["/district/nowhere", "/district/bogura/nothing"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: "পাতাটি খুঁজে পাওয়া যায়নি" })).toBeVisible();
    }
  });

  test("works at 360px without sideways scrolling", async ({ page }) => {
    for (const path of ["/district/bogura", "/district/bogura/doi"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBe(0);
    }
  });
});

test.describe("neighbourhoods", () => {
  test("a neighbourhood is found by name and has its own page", async ({ page }) => {
    await page.goto("/search?q=%E0%A6%B8%E0%A6%BE%E0%A6%A4%E0%A6%AE%E0%A6%BE%E0%A6%A5%E0%A6%BE");
    const area = page.getByRole("link", { name: /সাতমাথা/ }).first();
    await expect(area).toHaveAttribute("href", "/district/bogura/area/satmatha");
    await area.click();
    await expect(page.getByRole("heading", { level: 1, name: "সাতমাথা" })).toBeVisible();
    await expect(page.getByRole("link", { name: /নমুনা দই ঘর/ })).toBeVisible();
  });

  test("the district page lists its neighbourhoods", async ({ page }) => {
    await page.goto("/district/bogura");
    await expect(page.getByRole("link", { name: "সাতমাথা", exact: true })).toHaveAttribute(
      "href",
      "/district/bogura/area/satmatha",
    );
  });

  test("an unknown neighbourhood shows the not-found page", async ({ page }) => {
    await page.goto("/district/bogura/area/nowhere");
    await expect(page.getByRole("heading", { name: "পাতাটি খুঁজে পাওয়া যায়নি" })).toBeVisible();
  });
});
