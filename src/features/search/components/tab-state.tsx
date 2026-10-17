"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { routes } from "@/config/routes";
import { cn } from "@/lib/cn";
import { toggleVariants } from "@/components/ui/toggle-variants";

import type { SearchTab } from "../search-params";

// The results of every tab arrive in one response, so switching tabs needs no server round trip:
// the active tab is client state, and the address bar is updated in place (replaceState) so the URL
// stays shareable and a reload opens the same tab.

type TabContext = { tab: SearchTab; setTab: (next: SearchTab) => void };
const Context = createContext<TabContext>({ tab: "all", setTab: () => {} });

export function useSearchTab() {
  return useContext(Context);
}

export function TabState({ initial, children }: { initial: SearchTab; children: ReactNode }) {
  const [tab, setTabState] = useState<SearchTab>(initial);
  const setTab = useCallback((next: SearchTab) => {
    setTabState(next);
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(window.history.state, "", url);
  }, []);
  const value = useMemo(() => ({ tab, setTab }), [tab, setTab]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** Renders its children only while one of `tabs` is the active tab. */
export function TabGroup({ tabs, children }: { tabs: readonly SearchTab[]; children: ReactNode }) {
  const { tab } = useSearchTab();
  return tabs.includes(tab) ? <>{children}</> : null;
}

/** The results column: full width when the filter column is hidden. */
export function ResultsColumn({ children }: { children: ReactNode }) {
  const { tab } = useSearchTab();
  const withFilters = tab === "all" || tab === "place";
  return (
    <div className={cn("flex flex-col gap-4", withFilters ? "lg:col-span-9" : "lg:col-span-12")}>
      {children}
    </div>
  );
}

export type TabPill = { id: SearchTab; label: string; count: string };

/** Tabs as links (they work without JavaScript); with JavaScript a click switches instantly. */
export function TabPills({
  q,
  pills,
  carry,
  label,
}: {
  q: string;
  pills: TabPill[];
  carry: { type?: string | undefined; price?: string | undefined; sort?: string | undefined };
  label: string;
}) {
  const { tab, setTab } = useSearchTab();
  return (
    <nav
      aria-label={label}
      className="-mx-1 -my-2 flex [scrollbar-width:none] items-center gap-2 overflow-x-auto px-1 py-2"
    >
      {pills.map((pill) => (
        <Link
          key={pill.id}
          href={routes.search({ q, ...(pill.id === "all" ? {} : { tab: pill.id }), ...carry })}
          prefetch={false}
          scroll={false}
          aria-current={pill.id === tab ? "page" : undefined}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
            event.preventDefault();
            setTab(pill.id);
          }}
          className={cn(
            "flex h-10 shrink-0 items-center justify-center gap-1 rounded-[14px] bg-card px-3.5 text-[13.5px] font-semibold whitespace-nowrap text-muted-foreground shadow-card transition-colors lg:h-11 lg:rounded-[16px] lg:px-5 lg:text-[15px]",
            pill.id === tab && "bg-primary text-primary-foreground",
          )}
        >
          {pill.label}
          <span className="text-caption opacity-70">{pill.count}</span>
        </Link>
      ))}
    </nav>
  );
}

/** A filter chip: a link that keeps whichever tab is open right now. */
export function FilterChip({
  q,
  type,
  price,
  sort,
  active,
  children,
}: {
  q: string;
  type: string | undefined;
  price: string | undefined;
  /** The order to keep ('relevance' or nothing leaves it out of the address). */
  sort?: string | undefined;
  active: boolean;
  children: ReactNode;
}) {
  const { tab } = useSearchTab();
  return (
    <Link
      href={routes.search({
        q,
        ...(tab === "all" ? {} : { tab }),
        type,
        price,
        sort: sort === "relevance" ? undefined : sort,
      })}
      scroll={false}
      aria-current={active ? "true" : undefined}
      data-state={active ? "on" : "off"}
      className={toggleVariants({ variant: "chip" })}
    >
      {children}
    </Link>
  );
}
