import { Suspense } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { LoadingRegion } from "@/components/ui/skeleton";
import { GamePromo } from "@/features/game/components/game-promo";
import { HomeMissions, HomeMissionsSkeleton } from "@/features/game/components/home-missions";
import { HomeLevelStrip, LevelStripSkeleton } from "@/features/game/components/level-strip";
import { getT } from "@/i18n/server";

import { AllDistrictsSection, AllDistrictsSectionSkeleton } from "./all-districts-section";
import { HomeCategories } from "./home-categories";
import { HomeDistrictTiles, HomeDistrictTilesSkeleton } from "./home-district-tiles";
import { HomeFamousList, HomeFamousListSkeleton } from "./home-famous-list";
import { HomeHero } from "./home-hero";
import { HomeHow } from "./home-how";

// Sections, top to bottom, each on its own ground (docs/06-design-system.md §2d): the gradient hero,
// the level strip, a white panel of food kinds, a teal band (missions), a warm band (districts), a
// white panel (what people love, with "how it works" beside it on desktop), a night band (the
// passport) and the full district list. The hero carries the brand row on phones, so this page has
// no separate header.

/** The home page: static top, then each data section streams in behind its own skeleton. */
export function HomePage() {
  return (
    <PageShell header={null}>
      <HomeHero />
      <Suspense fallback={<LevelStripSkeleton />}>
        <HomeLevelStrip />
      </Suspense>
      <HomeCategories />
      <Suspense fallback={<HomeMissionsSkeleton />}>
        <HomeMissions />
      </Suspense>
      <Suspense fallback={<HomeDistrictTilesSkeleton />}>
        <HomeDistrictTiles />
      </Suspense>
      <div className="lg:grid lg:grid-cols-[1.7fr_1fr] lg:items-start lg:gap-0">
        <Suspense fallback={<HomeFamousListSkeleton />}>
          <HomeFamousList />
        </Suspense>
        <HomeHow />
      </div>
      <GamePromo />
      <Suspense fallback={<AllDistrictsSectionSkeleton />}>
        <AllDistrictsSection />
      </Suspense>
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
        <LevelStripSkeleton />
        <HomeCategories />
        <HomeMissionsSkeleton />
        <HomeDistrictTilesSkeleton />
        <div className="lg:grid lg:grid-cols-[1.7fr_1fr] lg:items-start lg:gap-0">
          <HomeFamousListSkeleton />
          <HomeHow />
        </div>
        <GamePromo />
        <AllDistrictsSectionSkeleton />
      </PageShell>
    </LoadingRegion>
  );
}
