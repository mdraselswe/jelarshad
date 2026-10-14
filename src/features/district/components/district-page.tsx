import { Suspense } from "react";

import { HeroBar } from "@/components/layout/hero-bar";
import { PageShell } from "@/components/layout/page-shell";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { LoadingRegion, Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Panel } from "@/components/layout/panel";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import type { DistrictHeader } from "@/services/catalog-service";

import { DistrictBoard, DistrictBoardSkeleton } from "@/features/game/components/district-board";
import { ShareButton } from "@/features/share/components/share-button";
import { DistrictAreasSection } from "./district-areas-section";
import { DistrictStampCard, DistrictStampCardSkeleton } from "./district-stamp-card";
import { DistrictFamousSection } from "./district-famous-section";
import { DistrictHero, DistrictHeroSkeleton } from "./district-hero";
import { DistrictPlacesSection, DistrictPlacesSectionSkeleton } from "./district-places-section";

export function DistrictPage({ district }: { district: DistrictHeader }) {
  return (
    <PageShell
      header={
        <SubPageBar
          hideMobile
          backHref={routes.home()}
          crumbs={[{ label: district.nameBn }]}
          actions={<ShareButton title={district.nameBn} path={routes.district(district.slug)} />}
        />
      }
    >
      <DistrictHero
        district={district}
        bar={
          <HeroBar
            backHref={routes.home()}
            actions={<ShareButton title={district.nameBn} path={routes.district(district.slug)} />}
          />
        }
      />
      <Suspense fallback={<DistrictStampCardSkeleton />}>
        <DistrictStampCard districtId={district.id} nameBn={district.nameBn} slug={district.slug} />
      </Suspense>
      <DistrictFamousSection district={district} />
      <DistrictAreasSection district={district} />
      <Suspense fallback={<DistrictPlacesSectionSkeleton />}>
        <DistrictPlacesSection districtId={district.id} />
      </Suspense>
      <Suspense fallback={<DistrictBoardSkeleton />}>
        <DistrictBoard districtId={district.id} />
      </Suspense>
    </PageShell>
  );
}

export function DistrictPageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell header={<SubPageBar hideMobile backHref={routes.home()} />}>
        <DistrictHeroSkeleton bar={<HeroBar backHref={routes.home()} />} />
        <DistrictStampCardSkeleton />
        <Panel title={<SkeletonText className="w-32" />} icon={<span />}>
          <div className="mb-3 text-meta">
            <SkeletonText className="w-2/3" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {[0, 1].map((index) => (
              <Skeleton key={index} className="h-[172px] w-[150px] shrink-0 rounded-[26px]" />
            ))}
          </div>
        </Panel>
        <DistrictPlacesSectionSkeleton />
        <DistrictBoardSkeleton />
      </PageShell>
    </LoadingRegion>
  );
}
