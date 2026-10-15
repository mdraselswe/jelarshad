"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { toggleVariants } from "@/components/ui/toggle-variants";
import { useT } from "@/i18n/client";
import { formatNumber } from "@/lib/format/number";

export type AreaOption = { key: string; label: string; count: number };

const ROOT = "[data-filter-root]";
const SECTION = "[data-filter-section]";
const ROW = "[data-filter-key]";
const COLLAPSED_CHIPS = 8;
const PARAM = "area";

// The chosen area lives in the address (`?area=`); this is the small store behind it so the page
// renders the same on the server and on first paint, then picks the chosen area up.
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
};
const readArea = () => new URL(window.location.href).searchParams.get(PARAM);
const readServerArea = () => null;

/**
 * Area chips and a small search box above a long list of places. The rows are rendered by the
 * server (each carries its area key and text as data attributes); this only hides the ones that do
 * not match, so switching is instant and needs no request. The chosen area stays in the address
 * (`?area=`), so a shared link opens the same view.
 */
export function AreaFilter({ areas, showSearch }: { areas: AreaOption[]; showSearch: boolean }) {
  const t = useT();
  const fromUrl = useSyncExternalStore(subscribe, readArea, readServerArea);
  // An address that names an area which is not in this list is ignored.
  const area = fromUrl !== null && areas.some((option) => option.key === fromUrl) ? fromUrl : null;
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current?.closest(ROOT);
    if (!root) return;
    const needle = query.trim().toLowerCase();
    let shown = 0;
    root.querySelectorAll<HTMLElement>(ROW).forEach((row) => {
      const matchesArea = area === null || row.dataset.filterKey === area;
      const matchesText =
        needle === "" || (row.dataset.filterText ?? "").toLowerCase().includes(needle);
      const show = matchesArea && matchesText;
      row.hidden = !show;
      if (show) shown += 1;
    });
    root.querySelectorAll<HTMLElement>(SECTION).forEach((section) => {
      section.hidden = section.querySelector(`${ROW}:not([hidden])`) === null;
    });
    setVisible(shown);
  }, [area, query]);

  const choose = (next: string | null) => {
    const url = new URL(window.location.href);
    if (next === null) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, next);
    window.history.replaceState(window.history.state, "", url);
    listeners.forEach((listener) => listener());
  };

  const total = areas.reduce((sum, option) => sum + option.count, 0);
  const shownAreas =
    expanded || areas.length <= COLLAPSED_CHIPS + 1 ? areas : areas.slice(0, COLLAPSED_CHIPS);
  // A chosen area that is folded away stays visible.
  const chosen = area !== null ? areas.find((option) => option.key === area) : undefined;
  const chips =
    chosen && !shownAreas.includes(chosen) ? [...shownAreas.slice(0, -1), chosen] : shownAreas;
  const hiddenCount = areas.length - chips.length;

  return (
    <div ref={rootRef} className="flex flex-col gap-3 page-x pt-4">
      {areas.length > 1 ? (
        <nav aria-label={t("listFilter.areasLabel")} className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-state={area === null ? "on" : "off"}
            aria-pressed={area === null}
            onClick={() => choose(null)}
            className={toggleVariants({ variant: "chip" })}
          >
            {t("listFilter.all")}
            <span className="text-caption opacity-70">{formatNumber(total)}</span>
          </button>
          {chips.map((option) => (
            <button
              key={option.key}
              type="button"
              data-state={area === option.key ? "on" : "off"}
              aria-pressed={area === option.key}
              onClick={() => choose(area === option.key ? null : option.key)}
              className={toggleVariants({ variant: "chip" })}
            >
              {option.label}
              <span className="text-caption opacity-70">{formatNumber(option.count)}</span>
            </button>
          ))}
          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className={toggleVariants({ variant: "chip" })}
            >
              {t("listFilter.more", { count: formatNumber(hiddenCount) })}
            </button>
          ) : expanded && areas.length > COLLAPSED_CHIPS + 1 ? (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className={toggleVariants({ variant: "chip" })}
            >
              {t("listFilter.less")}
            </button>
          ) : null}
        </nav>
      ) : null}
      {showSearch ? (
        <label className="relative block">
          <span className="sr-only">{t("listFilter.searchLabel")}</span>
          <SearchIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("listFilter.searchPlaceholder")}
            className="h-11 w-full rounded-full border border-border bg-card pr-4 pl-10 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      ) : null}
      {visible === 0 ? (
        <p role="status" className="text-meta text-muted-foreground">
          {t("listFilter.none")}
        </p>
      ) : null}
    </div>
  );
}
