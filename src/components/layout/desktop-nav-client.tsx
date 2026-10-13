"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/config/routes";
import { useT } from "@/i18n/client";
import type { MessageKey } from "@/i18n/t";
import { cn } from "@/lib/cn";

// The only parts of the desktop top bar that need the current path. Everything else (logo, the
// "যোগ" button) is rendered on the server, so the heavy logo SVG never ships as JavaScript.

const LINKS: readonly { href: string; label: MessageKey }[] = [
  { href: routes.home(), label: "nav.home" },
  { href: routes.search(), label: "nav.search" },
  { href: routes.me(), label: "nav.passport" },
  { href: routes.profile(), label: "nav.me" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === routes.me()) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DesktopNavLinks() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav aria-label={t("nav.label")} className="flex items-center gap-1">
      {LINKS.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-11 press items-center rounded-xl px-4 transition-colors duration-(--duration-fast)",
              active
                ? "bg-primary-soft font-semibold text-primary-soft-fg"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t(label)}
          </Link>
        );
      })}
    </nav>
  );
}

/** Search field look-alike that opens /search; hidden on /search, which has its own box. */
export function DesktopSearchLink() {
  const pathname = usePathname();
  const t = useT();
  if (isActive(pathname, routes.search())) return null;
  return (
    <Link
      href={routes.search()}
      className="flex h-[46px] max-w-[440px] flex-1 press items-center gap-2.5 rounded-[14px] border border-border bg-background px-4 text-[15px] text-muted-foreground"
    >
      <SearchIcon className="size-5 shrink-0" aria-hidden />
      <span className="line-clamp-1">{t("home.searchPlaceholder")}</span>
    </Link>
  );
}
