import { MapPinIcon, StoreIcon, UtensilsIcon } from "lucide-react";
import Link from "next/link";

import { GroupedList, ListRowSkeleton } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { tileClass } from "@/lib/tone";
import { MagnifierArt } from "@/components/illustration/food-art";
import { EmptyState } from "@/components/layout/empty-state";
import { SearchEmpty } from "./search-empty";
import { Panel } from "@/components/layout/panel";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";
import { EventTracker } from "@/components/analytics/event-tracker";
import { buildAreaOptions } from "@/features/catalog/area-options";
import { AreaFilter } from "@/features/catalog/components/area-filter";
import { filterPlaces, groupBranches, sortPlaces } from "@/services/search-service";

/** More place hits than this and a small search box joins the area chips. */
const SEARCH_FROM = 10;

import { searchCatalog } from "../queries";
import { parseSearchParams, type RawSearchParams } from "../search-params";
import { AreaHitRow, DistrictHitRow, FoodHitRow, PlaceRowItemView } from "./search-hit-rows";
import { SearchFilters } from "./search-filters";
import { SearchTabs } from "./search-tabs";
import { ResultsColumn, TabGroup, TabState } from "./tab-state";

/** Tabs + filters + grouped hits for the page's `?q=`. */
export async function SearchResults({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const t = getT();
  const params = parseSearchParams(await searchParams);
  const { q, tab, type, price, sort } = params;

  if (q === "") {
    return (
      <div data-search-results className="page-x pt-6 text-center">
        <MagnifierArt className="mx-auto w-40" />
        <p className="text-card-title">{t("search.prompt")}</p>
        <p className="mt-1 text-meta text-muted-foreground">{t("search.promptHint")}</p>
      </div>
    );
  }

  const outcome = await searchCatalog(q);
  const tracker = (
    <EventTracker name="search" props={{ query: q.slice(0, 80), results: outcome.total }} />
  );
  const placeHits = sortPlaces(filterPlaces(outcome.places, { type, price }), sort);
  const places = groupBranches(placeHits);
  const areaChips = buildAreaOptions(
    placeHits.map((hit) => ({
      area: hit.areaNameBn ?? hit.district.nameBn,
      group: hit.district.nameBn,
    })),
  );
  const filtered = type !== undefined || price !== undefined;
  const counts = {
    food: outcome.foods.length,
    place: places.length,
    district: outcome.districts.length + outcome.areas.length,
    all: outcome.foods.length + places.length + outcome.districts.length + outcome.areas.length,
  };

  const emptyState =
    filtered && outcome.total > 0 ? (
      <EmptyState
        art={<MagnifierArt />}
        message={
          <>
            <strong className="block font-semibold">{t("search.emptyFiltered")}</strong>
            {t("search.emptyFilteredHint")}
          </>
        }
      />
    ) : (
      <SearchEmpty q={q} />
    );

  return (
    <>
      {tracker}
      <TabState key={`${q}|${type ?? ""}|${price ?? ""}|${sort}|${tab}`} initial={tab}>
        <div data-search-results className="flex flex-col gap-4 page-x pt-1 lg:pt-6">
          <p className="px-1 text-meta text-muted-foreground lg:text-[17px] lg:font-semibold lg:text-foreground">
            {t("search.resultsFor", { q })}
          </p>
          <SearchTabs
            q={q}
            counts={counts}
            carry={{ type, price, sort: sort === "relevance" ? undefined : sort }}
          />
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
            <TabGroup tabs={["all", "place"]}>
              <div className="lg:sticky lg:top-24 lg:col-span-3">
                <SearchFilters params={params} />
              </div>
            </TabGroup>
            <ResultsColumn>
              {(["all", "food", "place", "district"] as const).map((id) =>
                counts[id] === 0 ? (
                  <TabGroup key={id} tabs={[id]}>
                    {emptyState}
                  </TabGroup>
                ) : null,
              )}

              {outcome.foods[0] && (
                <TabGroup tabs={["all", "food"]}>
                  <Link
                    href={routes.food(outcome.foods[0].slug)}
                    className={`relative flex h-[92px] lift press items-center gap-3.5 overflow-hidden rounded-card-lg p-4 text-on-hero lg:h-[132px] lg:rounded-[28px] lg:px-7 ${tileClass(outcome.foods[0].slug)}`}
                  >
                    <span
                      aria-hidden
                      className="flex size-[60px] shrink-0 items-center justify-center rounded-[20px] bg-white/20 font-display text-[30px] font-bold"
                    >
                      {outcome.foods[0].nameBn.slice(0, 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 font-display text-2xl leading-[1.4] font-bold">
                        {outcome.foods[0].nameBn}
                      </span>
                      <span className="line-clamp-1 text-[14px] leading-normal opacity-95">
                        {outcome.foods[0].aboutBn ?? t("search.foodBannerMeta")}
                      </span>
                    </span>
                    <span className="relative flex h-10 shrink-0 items-center rounded-full bg-card px-4 text-sm font-bold text-foreground">
                      {t("search.openFood")}
                    </span>
                  </Link>
                </TabGroup>
              )}
              {outcome.foods.length > 0 && (
                <TabGroup tabs={["all", "food"]}>
                  <Panel
                    bare
                    title={t("search.groups.foods")}
                    icon={<UtensilsIcon />}
                    tone="coral"
                    cardClassName="p-3 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
                  >
                    <GroupedList split className="rounded-none border-0 bg-transparent">
                      {outcome.foods.map((hit) => (
                        <FoodHitRow key={hit.slug} hit={hit} />
                      ))}
                    </GroupedList>
                  </Panel>
                </TabGroup>
              )}
              {places.length > 0 && (
                <TabGroup tabs={["all", "place"]}>
                  <Panel
                    bare
                    title={t("search.groups.places")}
                    icon={<StoreIcon />}
                    tone="violet"
                    cardClassName="p-3 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
                  >
                    <div data-filter-root>
                      <AreaFilter
                        areas={areaChips}
                        showSearch={placeHits.length > SEARCH_FROM}
                        className="pb-3 lg:pb-4"
                      />
                      <GroupedList split className="rounded-none border-0 bg-transparent">
                        {places.map((item) => (
                          <PlaceRowItemView
                            key={item.kind === "brand" ? `brand:${item.group.slug}` : item.hit.slug}
                            item={item}
                            t={t}
                          />
                        ))}
                      </GroupedList>
                    </div>
                  </Panel>
                </TabGroup>
              )}
              {outcome.areas.length > 0 && (
                <TabGroup tabs={["all", "district"]}>
                  <Panel
                    bare
                    title={t("search.groups.areas")}
                    icon={<MapPinIcon />}
                    tone="teal"
                    cardClassName="p-3 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
                  >
                    <GroupedList split className="rounded-none border-0 bg-transparent">
                      {outcome.areas.map((hit) => (
                        <AreaHitRow key={`${hit.district.slug}/${hit.slug}`} hit={hit} t={t} />
                      ))}
                    </GroupedList>
                  </Panel>
                </TabGroup>
              )}
              {outcome.districts.length > 0 && (
                <TabGroup tabs={["all", "district"]}>
                  <Panel
                    bare
                    title={t("search.groups.districts")}
                    icon={<MapPinIcon />}
                    tone="sky"
                    cardClassName="p-3 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
                  >
                    <GroupedList split className="rounded-none border-0 bg-transparent">
                      {outcome.districts.map((hit) => (
                        <DistrictHitRow key={hit.slug} hit={hit} t={t} />
                      ))}
                    </GroupedList>
                  </Panel>
                </TabGroup>
              )}
            </ResultsColumn>
          </div>
        </div>
      </TabState>
    </>
  );
}

/** Tabs, one filter row and two short groups — close to a typical result, not a promise. */
export function SearchResultsSkeleton() {
  return (
    <div data-search-results className="flex flex-col gap-4 page-x pt-1" aria-hidden>
      <div className="px-1">
        <Skeleton className="h-[1.4em] w-1/2 text-meta" />
      </div>
      <Skeleton className="h-12 rounded-input" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-[42px] rounded-full" />
        <Skeleton className="h-[42px] rounded-full" />
      </div>
      <Skeleton className="h-[92px] rounded-card-lg" />
      {[3].map((rows) => (
        <Panel
          key={rows}
          bare
          title={<SkeletonText className="w-16" />}
          icon={<UtensilsIcon />}
          cardClassName="p-3 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
        >
          <GroupedList split className="rounded-none border-0 bg-transparent">
            {Array.from({ length: rows }, (_, index) => (
              <ListRowSkeleton key={index} />
            ))}
          </GroupedList>
        </Panel>
      ))}
    </div>
  );
}
