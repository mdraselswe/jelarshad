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
      className="flex h-12 items-center gap-1 rounded-input bg-muted p-1"
    >
      {TAB_IDS.map((id) => (
        <Link
          key={id}
          href={routes.search({ q, ...(id === "all" ? {} : { tab: id }), ...carry })}
          aria-current={id === active ? "page" : undefined}
          className={cn(
            "flex h-full flex-1 items-center justify-center gap-1 rounded-xl px-2 text-[15px] font-medium whitespace-nowrap text-muted-foreground transition-colors",
            id === active && "bg-card font-semibold text-primary-text shadow-segment",
          )}
        >
          {t(`search.tabs.${id}`)}
          <span className="text-caption opacity-70">{formatNumber(counts[id])}</span>
        </Link>
      ))}
    </nav>
  );
}
