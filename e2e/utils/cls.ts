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
    // Landmark geometry over time, to see which block changed size when the content replaced the skeleton.
    const geom: string[] = [];
    let last = "";
    setInterval(() => {
      const box = (selector: string) => {
        const el = document.querySelector(selector);
        if (!el) return "-";
        const rect = el.getBoundingClientRect();
        return `${Math.round(rect.top + window.scrollY)}+${Math.round(rect.height)}`;
      };
      const line = [
        "nav:" + box("main nav"),
        "group:" + box("main [role=group]"),
        "a92:" + box("main a.lift"),
        "sec:" + box("main section"),
        "h2:" + box("main h2"),
      ].join(" ");
      if (line !== last) {
        geom.push(`${Math.round(performance.now())}ms ${line}`);
        last = line;
      }
    }, 40);
    (store as unknown as { __geom: string[] }).__geom = geom;
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
            const target = node as Node | null;
            const el = target instanceof Element ? target : (target?.parentElement ?? null);
            const text = (target?.textContent ?? "").trim().slice(0, 14);
            const name = el
              ? `${el.nodeName.toLowerCase()}[${String(el.className).slice(0, 48)}]"${text}"`
              : "?";
            const prev = source.previousRect;
            const next = source.currentRect;
            return `${name} y${Math.round(prev.y)}->${Math.round(next.y)} h${Math.round(prev.height)}->${Math.round(next.height)}`;
          })
          .join(" | ");
        store.__shifts.push(`${entry.value.toFixed(4)} ${moved}`);
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(path, { waitUntil: "load" });
  await page.waitForTimeout(settleMs);
  return page.evaluate(() => {
    const store = window as unknown as { __cls: number; __shifts: string[]; __geom: string[] };
    return { total: store.__cls, shifts: [...store.__shifts, ...store.__geom] };
  });
}
