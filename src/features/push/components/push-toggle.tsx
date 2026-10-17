"use client";

import { useEffect, useState, useTransition } from "react";

import { useT } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";

import { subscribePush, unsubscribePush } from "../actions";

/** The browser wants the application server key as bytes, not base64. */
function keyBytes(base64: string): Uint8Array<ArrayBuffer> {
  const padded =
    base64.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

const supported = () =>
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

/**
 * "ধারার রিমাইন্ডার": turns the evening streak reminder on or off for this device. Shown only when
 * reminders are set up on the server (a public key is configured) and the browser can show them.
 * Asking for permission happens on the tap, never on page load. The key comes from the server page
 * (the client bundle does not load the environment reader).
 */
export function PushToggle({ publicKey }: { publicKey: string | undefined }) {
  const t = useT();
  const [state, setState] = useState<"unknown" | "unsupported" | "off" | "on" | "blocked">(
    "unknown",
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!publicKey) return;
    async function detect() {
      if (!supported()) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("blocked");
        return;
      }
      const registration = await navigator.serviceWorker.getRegistration();
      const existing = await registration?.pushManager.getSubscription();
      setState(existing ? "on" : "off");
    }
    void detect();
  }, [publicKey]);

  if (!publicKey || state === "unknown") return null;

  function turnOn() {
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setState(permission === "denied" ? "blocked" : "off");
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyBytes(publicKey ?? ""),
        });
        const json = subscription.toJSON();
        const result = await subscribePush({
          endpoint: subscription.endpoint,
          p256dh: json.keys?.p256dh ?? "",
          auth: json.keys?.auth ?? "",
        });
        if (!result.ok) throw new Error(result.error.code);
        setState("on");
        toast.success(t("push.on"));
      } catch {
        setState("off");
        toast.error(t("errors.unknown"));
      }
    });
  }

  function turnOff() {
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          await unsubscribePush({ endpoint: subscription.endpoint });
          await subscription.unsubscribe();
        }
        setState("off");
        toast.success(t("push.off"));
      } catch {
        toast.error(t("errors.unknown"));
      }
    });
  }

  if (state === "unsupported") {
    return <p className="text-meta text-muted-foreground">{t("push.unsupported")}</p>;
  }
  if (state === "blocked") {
    return <p className="text-meta text-muted-foreground">{t("push.blocked")}</p>;
  }
  const on = state === "on";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={pending}
      onClick={on ? turnOff : turnOn}
      className="flex w-full press items-center gap-3 rounded-[20px] bg-card p-3 text-left disabled:opacity-60"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-card-title">{t("push.toggle")}</span>
        <span className="block text-meta text-muted-foreground">{t("push.hint")}</span>
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          on ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-6 rounded-full bg-card shadow-card transition-all",
            on ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}
