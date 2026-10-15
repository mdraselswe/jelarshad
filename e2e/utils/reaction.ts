import type { Page } from "@playwright/test";

/**
 * The reaction box shows what the signed-in person already said instead of the three buttons. The
 * e2e server keeps state between tests, so open the picker again when it is in that summary state.
 */
export async function openReactionPicker(page: Page) {
  const change = page.getByRole("button", { name: "মতামত বদলান বা আরও জানান" });
  if (await change.isVisible()) await change.click();
}
