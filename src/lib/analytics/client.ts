"use client";

// Browser side of the first-party usage counts. A random id per tab (sessionStorage, never a cookie)
// lets us count distinct visits without knowing who anyone is. Sent with sendBeacon, so it never
// delays a page and survives the page closing.

type Value = string | number | boolean | null;

function sessionId(): string | null {
  try {
    let id = window.sessionStorage.getItem("jelarshad-session");
    if (!id) {
      id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
      window.sessionStorage.setItem("jelarshad-session", id);
    }
    return id;
  } catch {
    return null;
  }
}

function send(url: string, payload: unknown) {
  try {
    const body = new Blob([JSON.stringify(payload)], { type: "application/json" });
    if (navigator.sendBeacon?.(url, body)) return;
    void fetch(url, { method: "POST", body, keepalive: true });
  } catch {
    // Counting never breaks the page.
  }
}

/** Counts one event: "page_view", "search", "share" (the server accepts only these names). */
export function track(name: string, props?: Record<string, Value>) {
  send("/api/track", { name, path: window.location.pathname, props, session: sessionId() });
}

/** Sends a browser error to our own log (shown to admins). */
export function reportClientError(error: Error & { digest?: string }) {
  send("/api/client-error", {
    message: error.message,
    stack: error.stack,
    digest: error.digest,
    path: window.location.pathname,
  });
}
