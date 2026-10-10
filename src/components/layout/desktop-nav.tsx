import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { LogoLockup } from "@/components/brand/logo";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getT } from "@/i18n/server";

import { DesktopNavLinks, DesktopSearchLink } from "./desktop-nav-client";

/**
 * Top bar from 1024px up (docs/design/desktop): logo, search, main links and the primary "যোগ"
 * button. It replaces the floating bottom nav and the mobile header, which are hidden at this size.
 * A server component: only the path-aware links are client code.
 */
export function DesktopNav() {
  const t = getT();
  return (
    <header className="hidden border-b border-border bg-card lg:block">
      <div className="mx-auto flex h-18 max-w-[1200px] items-center gap-6 px-8">
        <Link
          href={routes.home()}
          aria-label={siteConfig.name}
          className="-m-1 press rounded-xl p-1"
        >
          <LogoLockup className="h-9" />
        </Link>
        <DesktopSearchLink />
        <DesktopNavLinks />
        <Link
          href={routes.add()}
          className="ml-auto flex h-11 press items-center gap-1.5 rounded-full bg-primary bg-grad-action px-5 font-semibold text-primary-foreground shadow-card"
        >
          <PlusIcon className="size-4" strokeWidth={2.6} aria-hidden />
          {t("nav.add")}
        </Link>
      </div>
    </header>
  );
}
