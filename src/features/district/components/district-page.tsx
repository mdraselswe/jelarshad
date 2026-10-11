import { Suspense } from "react";

import { HeroBar } from "@/components/layout/hero-bar";
import { PageShell } from "@/components/layout/page-shell";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { LoadingRegion } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import type { DistrictHeader } from "@/services/catalog-service";

import { ShareButton } from "@/features/share/components/share-button";
import { DistrictAreasSection } from "./district-areas-section";
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
      <DistrictFamousSection district={district} />
      <DistrictAreasSection district={district} />
      <Suspense fallback={<DistrictPlacesSectionSkeleton />}>
        <DistrictPlacesSection districtId={district.id} />
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
        <DistrictPlacesSectionSkeleton />
      </PageShell>
    </LoadingRegion>
  );
}
