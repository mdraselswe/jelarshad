import type { Page } from "@playwright/test";

/** Chrome DevTools "Slow 4G"-like profile, so skeletons are actually on screen while data streams. */
export async function throttleNetwork(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
}

/**
 * Cumulative layout shift of a full page load (docs/05 §9: skeleton → content must not move).
 * Registers a buffered PerformanceObserver before navigation and sums shifts not caused by input.
 */
export async function measureCls(page: Page, path: string, settleMs = 1500): Promise<number> {
  const result = await measureClsDetailed(page, path, settleMs);
  return result.total;
}

/** Same, plus a line per shift saying which elements moved (shown when a test fails). */
export async function measureClsDetailed(
  page: Page,
  path: string,
  settleMs = 1500,
): Promise<{ total: number; shifts: string[] }> {
  await page.addInitScript(() => {
    const store = window as unknown as { __cls: number; __shifts: string[] };
    store.__cls = 0;
    store.__shifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as {
        value: number;
        hadRecentInput: boolean;
        sources?: { node: Element | null; previousRect: DOMRect; currentRect: DOMRect }[];
      }[]) {
        if (entry.hadRecentInput) continue;
        store.__cls += entry.value;
        const moved = (entry.sources ?? [])
          .map((source) => {
            const node = source.node;
            const name = node
              ? `${node.nodeName.toLowerCase()}.${String(node.className).slice(0, 40)}`
              : "?";
            return `${name} ${Math.round(source.previousRect.y)}->${Math.round(source.currentRect.y)}`;
          })
          .join(" | ");
        store.__shifts.push(`${entry.value.toFixed(4)} ${moved}`);
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(path, { waitUntil: "load" });
  await page.waitForTimeout(settleMs);
  return page.evaluate(() => {
    const store = window as unknown as { __cls: number; __shifts: string[] };
    return { total: store.__cls, shifts: store.__shifts };
  });
}
