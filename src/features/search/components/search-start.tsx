import {
  CompassIcon,
  LocateFixedIcon,
  MapIcon,
  SearchIcon,
  StoreIcon,
  UtensilsIcon,
} from "lucide-react";
import Link from "next/link";

import { Panel } from "@/components/layout/panel";
import { GroupedList, ListRow } from "@/components/ui/grouped-list";
import { IconChip } from "@/components/ui/icon-chip";
import { QUICK_SEARCHES } from "@/config/home";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

import { getPopularSearches } from "../queries";
import { RecentSearches } from "./recent-searches";

/**
 * `/search` before anything is typed: what to type (popular or suggested terms, then this person's
 * own recent searches) beside ways to browse without typing. Two columns on desktop, stacked on
 * phones; everything is left-aligned so the chips and rows line up with the search box above.
 */
export async function SearchStart() {
  const t = getT();
  // What people search most lately; until enough people have searched, the fixed ideas.
  const popular = await getPopularSearches();
  const ideas = popular.length >= 4 ? popular : [...QUICK_SEARCHES];
  const browse = [
    {
      href: routes.near(),
      icon: <LocateFixedIcon />,
      tone: "violet",
      title: t("near.title"),
      meta: t("near.lead"),
    },
    {
      href: routes.foods(),
      icon: <UtensilsIcon />,
      tone: "coral",
      title: t("index.foodsTitle"),
      meta: t("index.footerFoods"),
    },
    {
      href: routes.districts(),
      icon: <MapIcon />,
      tone: "teal",
      title: t("index.districtsTitle"),
      meta: t("index.footerDistricts"),
    },
    {
      href: routes.brands(),
      icon: <StoreIcon />,
      tone: "amber",
      title: t("index.brandsTitle"),
      meta: t("index.footerBrands"),
    },
  ] as const;

  return (
    <div
      data-search-results
      className="flex flex-col gap-4 page-x pt-5 lg:grid lg:grid-cols-12 lg:items-start lg:gap-6 lg:pt-8"
    >
      <Panel bare className="lg:col-span-7" icon={<SearchIcon />} title={t("search.prompt")}>
        <p className="text-meta text-muted-foreground">{t("search.promptHint")}</p>
        <section className="mt-5" aria-label={t("search.popular")}>
          <p className="text-caption font-semibold text-muted-foreground">
            {t(popular.length >= 4 ? "search.popular" : "search.tryTitle")}
          </p>
          {/* One scrolling row, not a wrapping block, so a late font cannot change its height. */}
          <ul className="mt-2 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1">
            {ideas.map((term) => (
              <li key={term}>
                <Link
                  href={routes.search({ q: term })}
                  className="flex h-10 shrink-0 press items-center rounded-full bg-primary-soft px-4 text-[14.5px] font-semibold whitespace-nowrap text-primary-soft-fg"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <RecentSearches />
      </Panel>
      <Panel
        bare
        className="lg:col-span-5"
        icon={<CompassIcon />}
        tone="teal"
        title={t("search.browseTitle")}
      >
        <GroupedList>
          {browse.map((item) => (
            <ListRow
              key={item.href}
              href={item.href}
              leading={
                <IconChip tone={item.tone} size="md">
                  {item.icon}
                </IconChip>
              }
              title={item.title}
              meta={item.meta}
            />
          ))}
        </GroupedList>
      </Panel>
    </div>
  );
}
