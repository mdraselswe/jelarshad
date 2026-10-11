import { Suspense } from "react";

import { LegalLinks } from "@/features/legal/components/legal-links";

import { PageShell } from "@/components/layout/page-shell";
import { LoadingRegion } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";
import {
  HomePassport,
  HomePassportSkeleton,
} from "@/features/passport/components/passport-section";

import { AllDistrictsSection, AllDistrictsSectionSkeleton } from "./all-districts-section";
import { HomeCategories } from "./home-categories";
import { HomeDistrictTiles, HomeDistrictTilesSkeleton } from "./home-district-tiles";
import { HomeFamousList, HomeFamousListSkeleton } from "./home-famous-list";
import { HomeHero } from "./home-hero";
import { HomeHow } from "./home-how";

// Phones: hero, floating kinds card, passport, list, tiles. Desktop (docs/design/desktop/Main): the
// passport moves into the hero and the list shares a row with the "how it works" panel.
// The hero carries the brand row on phones, so this page has no separate header.

/** The home page: static top, then each data section streams in behind its own skeleton. */
export function HomePage() {
  return (
    <PageShell header={null}>
      <HomeHero />
      <HomeCategories />
      <div className="page-x pt-5 lg:hidden">
        <Suspense fallback={<HomePassportSkeleton />}>
          <HomePassport />
        </Suspense>
      </div>
      <div className="lg:grid lg:grid-cols-[1.7fr_1fr] lg:items-start lg:gap-0">
        <Suspense fallback={<HomeFamousListSkeleton />}>
          <HomeFamousList />
        </Suspense>
        <HomeHow />
      </div>
      <Suspense fallback={<HomeDistrictTilesSkeleton />}>
        <HomeDistrictTiles />
      </Suspense>
      <Suspense fallback={<AllDistrictsSectionSkeleton />}>
        <AllDistrictsSection />
      </Suspense>
      <LegalLinks />
    </PageShell>
  );
}

/** Composed only from the section skeletons, so it can never drift from the page. */
export function HomePageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell header={null}>
        <HomeHero />
        <HomeCategories />
        <div className="page-x pt-5 lg:hidden">
          <HomePassportSkeleton />
        </div>
        <div className="lg:grid lg:grid-cols-[1.7fr_1fr] lg:items-start lg:gap-0">
          <HomeFamousListSkeleton />
          <HomeHow />
        </div>
        <HomeDistrictTilesSkeleton />
        <AllDistrictsSectionSkeleton />
      </PageShell>
    </LoadingRegion>
  );
}
