"use client";

import { HouseIcon, PlusIcon, SearchIcon, TrophyIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/config/routes";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  // The passport is /me, the profile is /me/profile: the passport tab must not light up on it.
  if (href === routes.me()) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const TAB =
  "flex h-full min-w-14 press flex-col items-center justify-center gap-0.5 text-[11.5px] leading-tight";

/**
 * Floating bottom navigation (docs/design/ Main, Passport): a white 68px bar 16px from the edges, four
 * tabs and the gold "add" button raised above the bar in the middle. Thumb-reachable on 360px.
 */
export function BottomNav() {
  const pathname = usePathname();
  const t = useT();
  const tabs = [
    { href: routes.home(), label: t("nav.home"), Icon: HouseIcon },
    { href: routes.search(), label: t("nav.search"), Icon: SearchIcon },
    null,
    { href: routes.me(), label: t("nav.passport"), Icon: TrophyIcon },
    { href: routes.profile(), label: t("nav.me"), Icon: UserRoundIcon },
  ] as const;
  return (
    <nav
      data-bottom-nav
      aria-label={t("nav.label")}
      className="fixed inset-x-4 bottom-[max(1.125rem,env(safe-area-inset-bottom))] z-40 mx-auto flex h-[68px] max-w-md items-center justify-around rounded-[26px] bg-card px-1.5 shadow-floating lg:hidden"
    >
      {tabs.map((tab) => {
        if (tab === null) {
          const active = isActive(pathname, routes.add());
          return (
            <Link
              key="add"
              href={routes.add()}
              aria-label={t("nav.add")}
              aria-current={active ? "page" : undefined}
              className="-mt-[26px] flex size-14 press animate-fx-pulse items-center justify-center rounded-[20px] bg-grad-reward text-on-reward"
            >
              <PlusIcon className="size-7" strokeWidth={2.6} aria-hidden />
            </Link>
          );
        }
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              TAB,
              active ? "font-semibold text-primary-text" : "text-muted-foreground",
            )}
          >
            <tab.Icon
              className={cn("size-6", active && "animate-pop")}
              strokeWidth={2}
              aria-hidden
            />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
