import { StoreIcon } from "lucide-react";

import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { HeroBar } from "@/components/layout/hero-bar";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { GroupedList, ListRow, ListRowSkeleton, ListTile } from "@/components/ui/grouped-list";
import { ScorePill } from "@/components/ui/score-pill";
import { LoadingRegion, Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { ShareButton } from "@/features/share/components/share-button";
import { getT } from "@/i18n/server";
import { formatNumber, formatPriceRange } from "@/lib/format/number";
import type { BrandPage as BrandPageData } from "@/services/catalog-service";

/**
 * A chain and its branches. Every branch is its own place with its own reactions, so the list shows
 * each branch's best dish separately; nothing is added up across branches.
 */
export function BrandPage({ data }: { data: BrandPageData }) {
  const t = getT();
  const { brand, branches } = data;
  const share = <ShareButton title={brand.nameBn} path={routes.brand(brand.slug)} />;
  return (
    <PageShell
      header={
        <SubPageBar
          hideMobile
          backHref={routes.home()}
          crumbs={[{ label: brand.nameBn }]}
          actions={share}
        />
      }
    >
      <HeroBand
        tone="district"
        bleed
        scene={
          <div className="hidden lg:block">
            <WorldStrip scene="hills" />
          </div>
        }
        className="pb-12 lg:pb-[150px]"
        bar={<HeroBar backHref={routes.home()} actions={share} />}
      >
        <h1 className="font-display text-[40px] leading-[1.15] font-bold lg:text-[52px]">
          {brand.nameBn}
        </h1>
        <div className="mt-3 inline-block rounded-[18px] bg-white/18 px-3.5 py-2.5">
          <div className="font-display text-[22px] leading-tight font-bold">
            {formatNumber(branches.length)}
          </div>
          <div className="text-[12.5px]">{t("brand.statBranches")}</div>
        </div>
      </HeroBand>
      <Section title={t("brand.all")} icon={<StoreIcon />} tone="violet">
        <GroupedList>
          {branches.map((branch) => (
            <ListRow
              key={branch.slug}
              href={routes.place(branch.slug)}
              leading={<ListTile seed={branch.slug}>{branch.nameBn.slice(0, 1)}</ListTile>}
              title={branch.areaNameBn ?? branch.districtNameBn}
              meta={
                [
                  branch.foods.slice(0, 3).join(", ") || null,
                  formatPriceRange(branch.price.min, branch.price.max),
                ]
                  .filter(Boolean)
                  .join(" · ") || " "
              }
              trailing={<ScorePill display={branch.best} />}
            />
          ))}
        </GroupedList>
        <p className="mt-3 text-meta text-muted-foreground">{t("brand.note")}</p>
      </Section>
    </PageShell>
  );
}

export function BrandPageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell header={<SubPageBar hideMobile backHref={routes.home()} />}>
        <HeroBand
          tone="district"
          bleed
          scene={
            <div className="hidden lg:block">
              <WorldStrip scene="hills" />
            </div>
          }
          className="pb-12 lg:pb-[150px]"
          bar={<HeroBar backHref={routes.home()} />}
        >
          <div className="font-display text-[40px] leading-[1.15] lg:text-[52px]">
            <SkeletonText className="w-1/2" />
          </div>
          <Skeleton className="mt-3 h-[58px] w-20 rounded-[18px]" />
        </HeroBand>
        <Section title={t("brand.all")} icon={<StoreIcon />} tone="violet">
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
