"use client";

import { useEffect } from "react";

import { ThemeScript } from "@/components/theme/theme-script";
import { useT } from "@/i18n/client";
import { reportClientError } from "@/lib/analytics/client";
import "@/styles/globals.css";

/** Last resort: the root layout itself failed, so this renders its own <html>. A full reload home, since the router may be what failed. */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useT();
  useEffect(() => {
    reportClientError(error);
  }, [error]);
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh">
        <main className="mx-auto max-w-lg px-5 pt-16" role="alert">
          <h1 className="text-title-1">{t("errorPage.title")}</h1>
          <p className="mt-2 text-body text-muted-foreground">{t("errorPage.body")}</p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex h-11 press items-center rounded-full bg-primary px-5 font-semibold text-primary-foreground"
            >
              {t("common.retry")}
            </button>
            <button
              type="button"
              onClick={() => window.location.assign(window.location.origin)}
              className="inline-flex h-11 press items-center rounded-full border border-border px-5 font-semibold"
            >
              {t("notFound.home")}
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
