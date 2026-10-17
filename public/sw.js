// Service worker: installable, and kind to slow or dropped connections.
//
// - Files that never change in place (build assets, fonts, icons, brand art) are cached on first use
//   and served from the device afterwards.
// - Public pages are fetched from the network first, so what people see is always current. A copy is
//   kept, and used only when the network fails, so a page already visited still opens offline and
//   anything else shows the offline page.
// - Pages of a signed-in person (profile, add, admin, login), API calls and anything that is not a
//   plain GET are never touched or stored, so nothing personal stays on the device after sign-out.
//
// Bump VERSION to drop every cache on the next visit.

const VERSION = "v2";
const STATIC = `jelarshad-static-${VERSION}`;
const PAGES = `jelarshad-pages-${VERSION}`;
const OFFLINE_URL = "/offline";
const MAX_PAGES = 40;

const NEVER = [
  /^\/me(\/|$)/,
  /^\/admin(\/|$)/,
  /^\/add(\/|$)/,
  /^\/login(\/|$)/,
  /^\/auth\//,
  /^\/api\//,
];
const IMMUTABLE = [/^\/_next\/static\//, /^\/fonts\//, /^\/icons\//, /^\/brand\//];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const response = await fetch(OFFLINE_URL, { credentials: "same-origin" });
        // Before launch the site answers every address with its coming-soon page; keep only the
        // real offline page, which carries a marker.
        const html = response.ok && !response.redirected ? await response.clone().text() : "";
        if (html.includes("data-offline-page")) {
          const cache = await caches.open(PAGES);
          await cache.put(OFFLINE_URL, response);
        }
      } catch {
        // No network at install time: the page is cached on a later visit.
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC, PAGES]);
      for (const name of await caches.keys()) {
        if (name.startsWith("jelarshad-") && !keep.has(name)) await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function trim(cache) {
  const keys = await cache.keys();
  const extra = keys.filter((key) => new URL(key.url).pathname !== OFFLINE_URL);
  for (const key of extra.slice(0, Math.max(0, extra.length - MAX_PAGES))) await cache.delete(key);
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    const isHtml = (response.headers.get("content-type") || "").includes("text/html");
    if (response.ok && isHtml && !response.redirected) {
      await cache.put(request, response.clone());
      await trim(cache);
    }
    return response;
  } catch {
    const copy = await cache.match(request);
    if (copy) return copy;
    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER.some((pattern) => pattern.test(url.pathname))) return;

  if (IMMUTABLE.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
  }
});
