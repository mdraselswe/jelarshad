"use client";

import { HouseIcon, PlusIcon, SearchIcon, UserRoundIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/config/routes";
import { useT } from "@/i18n/client";
import type { MessageKey } from "@/i18n/t";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: MessageKey; icon: LucideIcon; primary?: boolean };

const ITEMS: readonly NavItem[] = [
  { href: routes.home(), label: "nav.home", icon: HouseIcon },
  { href: routes.search(), label: "nav.search", icon: SearchIcon },
  { href: routes.add(), label: "nav.add", icon: PlusIcon, primary: true },
  { href: routes.me(), label: "nav.me", icon: UserRoundIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Floating bottom navigation (docs/06-design-system.md §6): 16px from the edges, 66px tall,
 * card pill (no backdrop blur); the center "যোগ" is the primary pill. Thumb-reachable on 360px.
 */
export function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav
      aria-label={t("nav.label")}
      className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto grid h-[66px] max-w-md grid-cols-4 items-center rounded-full border border-border bg-card px-2 shadow-floating lg:hidden"
    >
      {ITEMS.map(({ href, label, icon: Icon, primary }) => {
        const active = isActive(pathname, href);
        return primary ? (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="flex h-11 press items-center gap-1.5 justify-self-center rounded-full bg-primary bg-grad-action px-4 text-sm font-semibold text-primary-foreground"
          >
            <Icon className="size-[18px]" strokeWidth={2.6} aria-hidden />
            {t(label)}
          </Link>
        ) : (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-full press flex-col items-center justify-center gap-px text-nav",
              active ? "font-semibold text-primary-text" : "text-muted-foreground",
            )}
          >
            <Icon
              className={cn("size-[22px]", active && "animate-pop")}
              strokeWidth={active ? 2.4 : 2}
              aria-hidden
            />
            {t(label)}
          </Link>
        );
      })}
    </nav>
  );
}
