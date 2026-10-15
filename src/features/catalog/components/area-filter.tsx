"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { toggleVariants } from "@/components/ui/toggle-variants";
import { useT } from "@/i18n/client";
import { formatNumber } from "@/lib/format/number";

export type AreaOption = {
  key: string;
  label: string;
  count: number;
  /** The district the area is in, so places of several districts can be told apart first. */
  group?: string;
};

const ROOT = "[data-filter-root]";
const SECTION = "[data-filter-section]";
const ROW = "[data-filter-key]";
const COLLAPSED_CHIPS = 8;
const PARAM = "area";
const GROUP_PARAM = "district";

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
const readGroup = () => new URL(window.location.href).searchParams.get(GROUP_PARAM);
const readServer = () => null;

/**
 * Area chips and a small search box above a long list of places. The rows are rendered by the
 * server (each carries its area key and text as data attributes); this only hides the ones that do
 * not match, so switching is instant and needs no request. The chosen area stays in the address
 * (`?area=`), so a shared link opens the same view.
 */
export function AreaFilter({
  areas,
  showSearch,
  className = "page-x pt-4",
}: {
  areas: AreaOption[];
  showSearch: boolean;
  className?: string;
}) {
  const t = useT();
  const fromUrl = useSyncExternalStore(subscribe, readArea, readServer);
  const groupFromUrl = useSyncExternalStore(subscribe, readGroup, readServer);
  const groups = Array.from(
    new Set(areas.flatMap((option) => (option.group ? [option.group] : []))),
  );
  // An address that names a district or area which is not in this list is ignored.
  const group = groupFromUrl !== null && groups.includes(groupFromUrl) ? groupFromUrl : null;
  const inGroup = group === null ? areas : areas.filter((option) => option.group === group);
  const area =
    fromUrl !== null && inGroup.some((option) => option.key === fromUrl) ? fromUrl : null;
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
      // A row may stand for several areas (a chain with branches in more than one), joined by "|".
      const matchesArea = area === null || (row.dataset.filterKey ?? "").split("|").includes(area);
      const matchesGroup =
        group === null || (row.dataset.filterGroup ?? "").split("|").includes(group);
      const matchesText =
        needle === "" || (row.dataset.filterText ?? "").toLowerCase().includes(needle);
      const show = matchesArea && matchesGroup && matchesText;
      row.hidden = !show;
      if (show) shown += 1;
    });
    root.querySelectorAll<HTMLElement>(SECTION).forEach((section) => {
      section.hidden = section.querySelector(`${ROW}:not([hidden])`) === null;
    });
    setVisible(shown);
  }, [area, group, query]);

  const update = (name: string, value: string | null) => {
    const url = new URL(window.location.href);
    if (value === null) url.searchParams.delete(name);
    else url.searchParams.set(name, value);
    window.history.replaceState(window.history.state, "", url);
  };
  const choose = (next: string | null) => {
    update(PARAM, next);
    listeners.forEach((listener) => listener());
  };
  const chooseGroup = (next: string | null) => {
    // A different district starts from all of its areas.
    update(PARAM, null);
    update(GROUP_PARAM, next);
    listeners.forEach((listener) => listener());
  };

  const total = inGroup.reduce((sum, option) => sum + option.count, 0);
  const shownAreas =
    expanded || inGroup.length <= COLLAPSED_CHIPS + 1 ? inGroup : inGroup.slice(0, COLLAPSED_CHIPS);
  // A chosen area that is folded away stays visible.
  const chosen = area !== null ? inGroup.find((option) => option.key === area) : undefined;
  const chips =
    chosen && !shownAreas.includes(chosen) ? [...shownAreas.slice(0, -1), chosen] : shownAreas;
  const hiddenCount = inGroup.length - chips.length;

  return (
    <div ref={rootRef} className={`flex flex-col gap-3 ${className}`}>
      {groups.length > 1 ? (
        <nav
          aria-label={t("listFilter.districtsLabel")}
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            data-state={group === null ? "on" : "off"}
            aria-pressed={group === null}
            onClick={() => chooseGroup(null)}
            className={toggleVariants({ variant: "chip" })}
          >
            {t("listFilter.allDistricts")}
          </button>
          {groups.map((name) => (
            <button
              key={name}
              type="button"
              data-state={group === name ? "on" : "off"}
              aria-pressed={group === name}
              onClick={() => chooseGroup(group === name ? null : name)}
              className={toggleVariants({ variant: "chip" })}
            >
              {name}
              <span className="text-caption opacity-70">
                {formatNumber(
                  areas
                    .filter((option) => option.group === name)
                    .reduce((sum, option) => sum + option.count, 0),
                )}
              </span>
            </button>
          ))}
        </nav>
      ) : null}
      {inGroup.length > 1 ? (
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
          ) : expanded && inGroup.length > COLLAPSED_CHIPS + 1 ? (
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
