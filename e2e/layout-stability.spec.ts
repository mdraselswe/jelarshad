import { expect, test } from "@playwright/test";

import { measureClsDetailed, throttleNetwork } from "./utils/cls";

// Every page, phone and desktop: the skeleton that streams first must have the shape of the content
// that replaces it, so nothing jumps (docs/05-loading-skeletons.md §9).
const PUBLIC = [
  "/",
  "/search",
  "/search?q=doi",
  "/search?q=অজানাখাবার",
  "/food/doi",
  "/place/sample-place",
  "/district/bogura",
  "/district/bogura/doi",
  "/district/bogura/area/satmatha",
  "/about",
  "/policy",
  "/login",
];
// Long Bangla paragraphs re-wrap once when the web font replaces the fallback; that is font loading,
// not a skeleton mismatch, so the two legal pages get a looser limit.
const limitFor = (path: string) => (path === "/about" || path === "/policy" ? 0.05 : 0.01);
const SIGNED_IN = ["/me", "/me/profile", "/add"];
const ADMIN = ["/admin", "/admin/reports", "/admin/places", "/admin/maintenance"];

for (const [label, viewport] of [
  ["phone", { width: 360, height: 780 }],
  ["desktop", { width: 1280, height: 800 }],
] as const) {
  test.describe(`layout stability, ${label}`, () => {
    test.use({ viewport });

    for (const path of PUBLIC) {
      test(`CLS < ${limitFor(path)}: ${path}`, async ({ page }) => {
        await throttleNetwork(page);
        const { total, shifts } = await measureClsDetailed(page, path);
        expect(total, shifts.join(" ; ")).toBeLessThan(limitFor(path));
      });
    }

    for (const path of SIGNED_IN) {
      test(`CLS < 0.01 signed in: ${path}`, async ({ page }) => {
        await page.goto("/auth/callback?code=1&next=/");
        await throttleNetwork(page);
        const { total, shifts } = await measureClsDetailed(page, path);
        expect(total, shifts.join(" ; ")).toBeLessThan(0.01);
      });
    }

    for (const path of ADMIN) {
      test(`CLS < 0.01 as admin: ${path}`, async ({ page }) => {
        await page.goto("/auth/callback?code=admin&next=/");
        await throttleNetwork(page);
        const { total, shifts } = await measureClsDetailed(page, path);
        expect(total, shifts.join(" ; ")).toBeLessThan(0.01);
      });
    }
  });
}
