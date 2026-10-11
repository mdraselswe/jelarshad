import Link from "next/link";

import { HeroBand } from "@/components/layout/hero-band";
import { HeroBar } from "@/components/layout/hero-bar";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { GroupedList, ListRow, ListRowSkeleton, ListTile } from "@/components/ui/grouped-list";
import { RankBadge } from "@/components/ui/rank-badge";
import { ScorePill } from "@/components/ui/score-pill";
import { LoadingRegion, Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { ShareButton } from "@/features/share/components/share-button";
import { getT } from "@/i18n/server";
import { formatNumber, formatPriceRange } from "@/lib/format/number";
import type { AreaPage as AreaPageData, AreaPlaceRow } from "@/services/catalog-service";

const MAX_FOODS = 3;

function PlaceRow({ place, rank }: { place: AreaPlaceRow; rank?: number }) {
  const t = getT();
  const meta = [
    t(`placeType.${place.type}`),
    place.foods.slice(0, MAX_FOODS).join(", ") || null,
    formatPriceRange(place.price.min, place.price.max),
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <ListRow
      href={routes.place(place.slug)}
      leading={
        rank ? (
          <RankBadge rank={rank} />
        ) : (
          <ListTile seed={place.slug}>{place.nameBn.slice(0, 1)}</ListTile>
        )
      }
      title={place.nameBn}
      meta={meta || " "}
      trailing={<ScorePill display={place.best} />}
    />
  );
}

/**
 * One neighbourhood (ধানমন্ডি, ঢাকা). "Best" here is only what people have said: places with enough
 * experiences are ranked by how loved their dishes are; the rest are listed, not ranked (decision P9).
 */
export function AreaPage({ data }: { data: AreaPageData }) {
  const t = getT();
  const { district, area, places, hasMore } = data;
  const ranked = places.filter((place) => place.best.rankable);
  const others = places.filter((place) => !place.best.rankable);
  const share = (
    <ShareButton
      title={`${area.nameBn}, ${district.nameBn}`}
      path={routes.area(district.slug, area.slug)}
    />
  );
  return (
    <PageShell
      header={
        <SubPageBar
          hideMobile
          backHref={routes.district(district.slug)}
          crumbs={[
            { label: district.nameBn, href: routes.district(district.slug) },
            { label: area.nameBn },
          ]}
          actions={share}
        />
      }
    >
      <HeroBand
        tone="district"
        bleed
        className="pb-9 lg:pb-12"
        bar={<HeroBar backHref={routes.district(district.slug)} actions={share} />}
      >
        <p className="text-[14px] text-on-hero/90">
          <Link href={routes.district(district.slug)} className="underline underline-offset-4">
            {district.nameBn}
          </Link>
        </p>
        <h1 className="font-display text-[40px] leading-[1.15] font-bold lg:text-[52px]">
          {area.nameBn}
        </h1>
        <div className="mt-3 inline-block rounded-[18px] bg-white/18 px-3.5 py-2.5">
          <div className="font-display text-[22px] leading-tight font-bold">
            {formatNumber(places.length)}
          </div>
          <div className="text-[12.5px]">{t("area.statPlaces")}</div>
        </div>
      </HeroBand>

      {ranked.length > 0 ? (
        <Section title={t("area.ranked")}>
          <GroupedList>
            {ranked.map((place, index) => (
              <PlaceRow key={place.slug} place={place} rank={index + 1} />
            ))}
          </GroupedList>
        </Section>
      ) : null}
      {others.length > 0 ? (
        <Section title={ranked.length > 0 ? t("area.others") : t("area.all")}>
          {ranked.length === 0 ? (
            <p className="-mt-1.5 mb-3 text-meta text-muted-foreground">{t("area.noneRated")}</p>
          ) : null}
          <GroupedList>
            {others.map((place) => (
              <PlaceRow key={place.slug} place={place} />
            ))}
          </GroupedList>
        </Section>
      ) : null}
      {hasMore ? (
        <p className="page-x pt-4 text-meta text-muted-foreground">{t("area.more")}</p>
      ) : null}
    </PageShell>
  );
}

export function AreaPageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell header={<SubPageBar hideMobile backHref={routes.home()} />}>
        <HeroBand
          tone="district"
          bleed
          className="pb-9 lg:pb-12"
          bar={<HeroBar backHref={routes.home()} />}
        >
          <div className="text-[14px]">
            <SkeletonText className="w-1/3" />
          </div>
          <div className="font-display text-[40px] leading-[1.15] lg:text-[52px]">
            <SkeletonText className="w-1/2" />
          </div>
          <Skeleton className="mt-3 h-[58px] w-20 rounded-[18px]" />
        </HeroBand>
        <Section title={t("area.all")}>
          <GroupedList>
            {Array.from({ length: 4 }, (_, index) => (
              <ListRowSkeleton
                key={index}
                trailing={<Skeleton className="h-7 w-14 shrink-0 rounded-[10px]" />}
              />
            ))}
          </GroupedList>
        </Section>
      </PageShell>
    </LoadingRegion>
  );
}
