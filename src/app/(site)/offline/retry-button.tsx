"use client";

import { useT } from "@/i18n/client";

/** Reloads the page the person was trying to open. */
export function RetryButton() {
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex h-12 press items-center rounded-full bg-primary px-6 text-[16px] font-semibold text-primary-foreground"
    >
      {t("offline.retry")}
    </button>
  );
}
