import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

import { describe, expect, it } from "vitest";

// public/sw.js decides what is kept on a person's device, so its routing rules are tested here: the
// worker is run in a sandbox with a stand-in for the browser's worker globals.

type Listener = (event: unknown) => void;

function loadWorker() {
  const listeners: Record<string, Listener> = {};
  const sandbox = {
    self: {
      location: { origin: "https://example.test" },
      addEventListener: (type: string, listener: Listener) => {
        listeners[type] = listener;
      },
      skipWaiting: () => Promise.resolve(),
      clients: { claim: () => Promise.resolve() },
    },
    caches: {
      open: async () => ({
        match: async () => undefined,
        put: async () => {},
        keys: async () => [],
        delete: async () => true,
      }),
      match: async () => undefined,
      keys: async () => [],
      delete: async () => true,
    },
    fetch: async () => new Response("ok"),
    Response,
    URL,
  };
  vm.runInNewContext(readFileSync(join(process.cwd(), "public/sw.js"), "utf8"), sandbox);
  return listeners;
}

/** Fires a fetch event; returns whether the worker took the request over. */
function handles(path: string, options: { method?: string; mode?: string; origin?: string } = {}) {
  const listener = loadWorker().fetch;
  let took = false;
  listener?.({
    request: {
      method: options.method ?? "GET",
      mode: options.mode ?? "same-origin",
      url: `${options.origin ?? "https://example.test"}${path}`,
    },
    respondWith: () => {
      took = true;
    },
  });
  return took;
}

describe("service worker routing", () => {
  it("takes over build assets, fonts and icons, and page navigations", () => {
    expect(handles("/_next/static/chunks/app.js")).toBe(true);
    expect(handles("/fonts/anek.woff2")).toBe(true);
    expect(handles("/icons/icon-192.png")).toBe(true);
    expect(handles("/place/akbaria-hotel", { mode: "navigate" })).toBe(true);
    expect(handles("/", { mode: "navigate" })).toBe(true);
  });

  it("never touches pages of a signed-in person, the API, or sign-in", () => {
    for (const path of ["/me", "/me/profile", "/admin", "/admin/manage/x", "/add", "/login"]) {
      expect(handles(path, { mode: "navigate" })).toBe(false);
    }
    expect(handles("/auth/callback", { mode: "navigate" })).toBe(false);
    expect(handles("/api/search")).toBe(false);
    expect(handles("/api/viewer")).toBe(false);
  });

  it("ignores everything that is not a plain same-origin GET", () => {
    expect(handles("/_next/static/a.js", { method: "POST" })).toBe(false);
    expect(handles("/_next/static/a.js", { origin: "https://other.test" })).toBe(false);
    // A background fetch of data (not a page navigation, not an immutable file) goes straight through.
    expect(handles("/food/doi")).toBe(false);
  });
});
