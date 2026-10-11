import Link from "next/link";

import { GroupedList, ListRowSkeleton } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { tileClass } from "@/lib/tone";
import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";
import { filterPlaces } from "@/services/search-service";

import { searchCatalog } from "../queries";
import { parseSearchParams, type RawSearchParams } from "../search-params";
import { DistrictHitRow, FoodHitRow, PlaceHitRow } from "./search-hit-rows";
import { SearchFilters } from "./search-filters";
import { SearchTabs } from "./search-tabs";

const GROUP_HEADING_CLASS = "mb-2 px-1 font-display text-xl font-semibold";

/** Tabs + filters + grouped hits for the page's `?q=`. */
export async function SearchResults({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const t = getT();
  const params = parseSearchParams(await searchParams);
  const { q, tab, type, price } = params;

  if (q === "") {
    return (
      <div className="page-x pt-8 text-center">
        <p className="text-card-title">{t("search.prompt")}</p>
        <p className="mt-1 text-meta text-muted-foreground">{t("search.promptHint")}</p>
      </div>
    );
  }

  const outcome = await searchCatalog(q);
  const places = filterPlaces(outcome.places, { type, price });
  const filtered = type !== undefined || price !== undefined;
  const counts = {
    food: outcome.foods.length,
    place: places.length,
    district: outcome.districts.length,
    all: outcome.foods.length + places.length + outcome.districts.length,
  };

  const showFoods = tab === "all" || tab === "food";
  const showPlaces = tab === "all" || tab === "place";
  const showDistricts = tab === "all" || tab === "district";
  const showFilters = tab === "all" || tab === "place";

  return (
    <div className="flex flex-col gap-4 page-x pt-1 lg:pt-2">
      <p className="px-1 text-meta text-muted-foreground">{t("search.resultsFor", { q })}</p>
      <SearchTabs q={q} active={tab} counts={counts} carry={{ type, price }} />
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
        {showFilters && (
          <div className="lg:sticky lg:top-6 lg:col-span-3">
            <SearchFilters params={params} />
          </div>
        )}
        <div className={`flex flex-col gap-4 ${showFilters ? "lg:col-span-9" : "lg:col-span-12"}`}>
          {counts[tab] === 0 && (
            <EmptyState
              message={
                <>
                  <strong className="block font-semibold">
                    {filtered && outcome.total > 0
                      ? t("search.emptyFiltered")
                      : t("search.empty", { q })}
                  </strong>
                  {filtered && outcome.total > 0
                    ? t("search.emptyFilteredHint")
                    : t("search.emptyHint")}
                </>
              }
            />
          )}

          {showFoods && outcome.foods[0] && (
            <Link
              href={routes.food(outcome.foods[0].slug)}
              className={`flex lift press items-center gap-3.5 rounded-card-lg p-4 text-on-hero ${tileClass(outcome.foods[0].slug)}`}
            >
              <span
                aria-hidden
                className="flex size-[60px] shrink-0 items-center justify-center rounded-[20px] bg-white/20 font-display text-[30px] font-bold"
              >
                {outcome.foods[0].nameBn.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 block font-display text-2xl leading-tight font-bold">
                  {outcome.foods[0].nameBn}
                </span>
                <span className="line-clamp-1 block text-[14px] opacity-95">
                  {outcome.foods[0].aboutBn ?? t("search.foodBannerMeta")}
                </span>
              </span>
              <span className="flex h-10 shrink-0 items-center rounded-full bg-card px-4 text-sm font-bold text-foreground">
                {t("search.openFood")}
              </span>
            </Link>
          )}
          {showFoods && outcome.foods.length > 0 && (
            <section aria-label={t("search.groups.foods")}>
              <h2 className={GROUP_HEADING_CLASS}>{t("search.groups.foods")}</h2>
              <GroupedList cards>
                {outcome.foods.map((hit) => (
                  <FoodHitRow key={hit.slug} hit={hit} />
                ))}
              </GroupedList>
            </section>
          )}
          {showPlaces && places.length > 0 && (
            <section aria-label={t("search.groups.places")}>
              <h2 className={GROUP_HEADING_CLASS}>{t("search.groups.places")}</h2>
              <GroupedList cards>
                {places.map((hit) => (
                  <PlaceHitRow key={hit.slug} hit={hit} t={t} />
                ))}
              </GroupedList>
            </section>
          )}
          {showDistricts && outcome.districts.length > 0 && (
            <section aria-label={t("search.groups.districts")}>
              <h2 className={GROUP_HEADING_CLASS}>{t("search.groups.districts")}</h2>
              <GroupedList cards>
                {outcome.districts.map((hit) => (
                  <DistrictHitRow key={hit.slug} hit={hit} t={t} />
                ))}
              </GroupedList>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/** Tabs, one filter row and two short groups — close to a typical result, not a promise. */
export function SearchResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4 page-x pt-1" aria-hidden>
      <div className="px-1">
        <Skeleton className="h-[1.4em] w-1/2 text-meta" />
      </div>
      <Skeleton className="h-12 rounded-input" />
      <Skeleton className="h-10 rounded-full" />
      <Skeleton className="h-[92px] rounded-card-lg" />
      {[2, 3].map((rows) => (
        <section key={rows}>
          <div className={GROUP_HEADING_CLASS}>
            <SkeletonText className="w-16" />
          </div>
          <GroupedList cards>
            {Array.from({ length: rows }, (_, index) => (
              <ListRowSkeleton key={index} />
            ))}
          </GroupedList>
        </section>
      ))}
    </div>
  );
}
