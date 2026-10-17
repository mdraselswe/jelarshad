import { appConfig } from "@/config/app.config";
import { PLACE_SORTS } from "@/services/search-service";
import { getT } from "@/i18n/server";

import { PLACE_TYPES, type ParsedSearchParams } from "../search-params";
import { FilterChip } from "./tab-state";

// Filter chips are links: the filter lives in the URL, so results are shareable and need no JS.
const ROW_CLASS =
  "-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0";

export function SearchFilters({ params }: { params: ParsedSearchParams }) {
  const t = getT();
  const { q, type, price, sort } = params;

  return (
    <div
      className="flex flex-col gap-2 lg:gap-3 lg:rounded-[28px] lg:border lg:border-border lg:bg-card lg:p-5 lg:shadow-card"
      role="group"
      aria-label={t("search.filters.label")}
    >
      <p className="hidden font-display text-[18px] font-bold lg:block">
        {t("search.filters.label")}
      </p>
      <div className={ROW_CLASS}>
        <FilterChip q={q} type={undefined} price={price} sort={sort} active={type === undefined}>
          {t("search.filters.any")}
        </FilterChip>
        {PLACE_TYPES.filter((candidate) => candidate !== "other").map((candidate) => (
          <FilterChip
            key={candidate}
            q={q}
            type={candidate}
            price={price}
            sort={sort}
            active={type === candidate}
          >
            {t(`placeType.${candidate}`)}
          </FilterChip>
        ))}
      </div>
      <div className={ROW_CLASS}>
        <FilterChip q={q} type={type} price={undefined} sort={sort} active={price === undefined}>
          {t("search.filters.price")}: {t("search.filters.any")}
        </FilterChip>
        {appConfig.search.priceTiers.map((tier) => (
          <FilterChip
            key={tier.id}
            q={q}
            type={type}
            price={tier.id}
            sort={sort}
            active={price === tier.id}
          >
            {t(`search.price.${tier.id}`)}
          </FilterChip>
        ))}
      </div>
      <div className={ROW_CLASS}>
        {PLACE_SORTS.map((candidate) => (
          <FilterChip
            key={candidate}
            q={q}
            type={type}
            price={price}
            sort={candidate}
            active={sort === candidate}
          >
            {candidate === "relevance"
              ? `${t("search.sort.label")}: ${t("search.sort.relevance")}`
              : t(`search.sort.${candidate}`)}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}
