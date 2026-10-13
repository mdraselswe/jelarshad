import Link from "next/link";

import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format/number";

import type { SearchTab } from "../search-params";

type Counts = { all: number; food: number; place: number; district: number };

const TAB_IDS: SearchTab[] = ["all", "food", "place", "district"];

/** Tabs are links (shareable URLs, work without JavaScript); the active one is `aria-current`. */
export function SearchTabs({
  q,
  active,
  counts,
  carry,
}: {
  q: string;
  active: SearchTab;
  counts: Counts;
  /** Filters kept when switching tabs. */
  carry: { type?: string | undefined; price?: string | undefined };
}) {
  const t = getT();
  return (
    <nav
      aria-label={t("search.label")}
      className="flex [scrollbar-width:none] items-center gap-2 overflow-x-auto lg:h-12 lg:gap-1 lg:overflow-visible lg:rounded-input lg:bg-muted lg:p-1"
    >
      {TAB_IDS.map((id) => (
        <Link
          key={id}
          href={routes.search({ q, ...(id === "all" ? {} : { tab: id }), ...carry })}
          aria-current={id === active ? "page" : undefined}
          className={cn(
            "flex h-10 shrink-0 items-center justify-center gap-1 rounded-[14px] bg-card px-3.5 text-[13.5px] font-semibold whitespace-nowrap text-muted-foreground shadow-card transition-colors lg:h-full lg:flex-1 lg:rounded-xl lg:bg-transparent lg:px-2 lg:text-[15px] lg:font-medium lg:shadow-none",
            id === active &&
              "bg-primary text-primary-foreground lg:bg-card lg:font-semibold lg:text-primary-text lg:shadow-segment",
          )}
        >
          {t(`search.tabs.${id}`)}
          <span className="text-caption opacity-70">{formatNumber(counts[id])}</span>
        </Link>
      ))}
    </nav>
  );
}
