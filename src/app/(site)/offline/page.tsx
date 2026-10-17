import { WifiOffIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo/metadata";

import { RetryButton } from "./retry-button";

export const metadata: Metadata = buildMetadata({
  title: getT()("offline.title"),
  description: getT()("offline.body"),
  path: "/offline",
  noindex: true,
});

/** Shown by the service worker when a page cannot be loaded and has not been visited before. */
export default function Offline() {
  const t = getT();
  return (
    <PageShell>
      <section data-offline-page className="page-x pt-16 text-center lg:pt-24">
        <WifiOffIcon className="mx-auto size-16 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 font-display text-[26px] leading-tight font-bold">
          {t("offline.title")}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-body text-muted-foreground">{t("offline.body")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <RetryButton />
          <Link
            href={routes.home()}
            className="inline-flex h-12 press items-center rounded-full border border-border px-6 text-[16px] font-semibold"
          >
            {t("offline.home")}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
