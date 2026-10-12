"use client";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { PlusIcon, SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { NotFoundArt } from "@/components/illustration/food-art";
import { GroupedList, ListRowSkeleton } from "@/components/ui/grouped-list";
import { Skeleton } from "@/components/ui/skeleton";
import { appConfig } from "@/config/app.config";
import { routes } from "@/config/routes";
import { useDebounce } from "@/hooks/use-debounce";
import { useDelayedFlag } from "@/hooks/use-delayed-flag";
import { useT } from "@/i18n/client";
import { formatNumber } from "@/lib/format/number";

import type { SearchSuggestions } from "../types";
import { AreaHitRow, DistrictHitRow, FoodHitRow, PlaceHitRow } from "./search-hit-rows";

const INPUT_WRAP_CLASS =
  "flex h-14 items-center gap-2.5 rounded-full border-2 border-primary bg-background px-4";

async function fetchSuggestions(q: string, signal: AbortSignal): Promise<SearchSuggestions> {
  const response = await fetch(routes.api.search({ q }), { signal });
  if (!response.ok) throw new Error(`search failed: ${response.status}`);
  return response.json() as Promise<SearchSuggestions>;
}

function SuggestionListSkeleton() {
  return (
    <GroupedList aria-hidden>
      {Array.from({ length: appConfig.search.suggestionsPerGroup }, (_, index) => (
        <ListRowSkeleton key={index} />
      ))}
    </GroupedList>
  );
}

function Suggestions({ q }: { q: string }) {
  const t = useT();
  const { data, isFetching, isError } = useQuery({
    queryKey: ["search-suggestions", q],
    queryFn: ({ signal }) => fetchSuggestions(q, signal),
    staleTime: 60_000,
    retry: false,
  });
  // Skeleton only if the answer is slow, so quick answers don't flicker (docs/05 §7).
  const showSkeleton = useDelayedFlag(isFetching && !data);

  if (showSkeleton) return <SuggestionListSkeleton />;
  if (isError || !data) return null;

  const groups = [
    {
      key: "foods",
      title: t("search.groups.foods"),
      rows: data.foods.map((hit) => <FoodHitRow key={hit.slug} hit={hit} />),
    },
    {
      key: "areas",
      title: t("search.groups.areas"),
      rows: data.areas.map((hit) => (
        <AreaHitRow key={`${hit.district.slug}/${hit.slug}`} hit={hit} t={t} />
      )),
    },
    {
      key: "places",
      title: t("search.groups.places"),
      rows: data.places.map((hit) => <PlaceHitRow key={hit.slug} hit={hit} t={t} />),
    },
    {
      key: "districts",
      title: t("search.groups.districts"),
      rows: data.districts.map((hit) => <DistrictHitRow key={hit.slug} hit={hit} t={t} />),
    },
  ].filter((group) => group.rows.length > 0);

  if (groups.length === 0) {
    return (
      <section
        role="status"
        className="animate-rise rounded-[28px] border border-border bg-card px-5 py-6 text-center shadow-card"
      >
        <NotFoundArt className="mx-auto w-44" />
        <h2 className="mt-1 font-display text-[20px] leading-tight font-bold">
          {t("search.empty", { q: data.query || q })}
        </h2>
        <p className="mt-1.5 text-meta text-muted-foreground">{t("search.emptyHint")}</p>
        <Link
          href={routes.add()}
          className="mt-4 inline-flex h-12 press items-center gap-2 rounded-full bg-grad-reward px-5 text-[15px] font-bold text-on-reward shadow-card"
        >
          <PlusIcon className="size-5" aria-hidden strokeWidth={2.6} />
          {t("search.addCta")}
          <span className="rounded-full bg-on-reward px-2 font-display text-[13px] text-reward-soft">
            +{formatNumber(appConfig.points.experience)}
          </span>
        </Link>
      </section>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <section key={group.key} aria-label={group.title}>
          <h2 className="mb-1.5 px-1 text-caption text-muted-foreground">{group.title}</h2>
          <GroupedList>{group.rows}</GroupedList>
        </section>
      ))}
    </div>
  );
}

function SearchBoxInner({ initialQuery }: { initialQuery: string }) {
  const t = useT();
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [typing, setTyping] = useState(false);
  const debounced = useDebounce(value.trim());
  const canSuggest = typing && debounced.length >= appConfig.search.minQueryLength;

  // While suggestions are open they replace the results of the previous search below them, so
  // two result lists are never on screen together (globals.css hides [data-search-results]).
  useEffect(() => {
    if (!canSuggest) return;
    document.body.dataset.searchSuggesting = "1";
    return () => {
      delete document.body.dataset.searchSuggesting;
    };
  }, [canSuggest]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const q = value.trim();
    setTyping(false);
    router.push(routes.search(q ? { q } : undefined));
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      {/* Plain GET form, so search also works before JavaScript loads. */}
      <form role="search" action={routes.search()} method="get" onSubmit={submit}>
        <label className={INPUT_WRAP_CLASS}>
          <SearchIcon className="size-[22px] shrink-0 text-muted-foreground" aria-hidden />
          <input
            name="q"
            type="search"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setTyping(true);
            }}
            onKeyDown={(event) => event.key === "Escape" && setTyping(false)}
            autoFocus={initialQuery === ""}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
            maxLength={appConfig.search.maxQueryLength}
            aria-label={t("search.label")}
            placeholder={t("home.searchPlaceholder")}
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {value !== "" && (
            <button
              type="button"
              aria-label={t("search.clear")}
              onClick={() => {
                setValue("");
                setTyping(false);
              }}
              className="-mr-2 flex size-9 shrink-0 press items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <XIcon className="size-4" aria-hidden />
            </button>
          )}
        </label>
      </form>
      {canSuggest && <Suggestions q={debounced} />}
    </div>
  );
}

/** Search field with a live suggestions list under it (debounced, grouped, cached by the API). */
export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <SearchBoxInner key={initialQuery} initialQuery={initialQuery} />
    </QueryClientProvider>
  );
}

/** Same footprint as the input while the page decides the starting query. */
export function SearchBoxSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <Skeleton className="h-14 rounded-input" />
    </div>
  );
}
