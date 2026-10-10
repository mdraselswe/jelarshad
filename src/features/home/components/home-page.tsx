import { Suspense } from "react";

import { LegalLinks } from "@/features/legal/components/legal-links";

import { HeroBand } from "@/components/layout/hero-band";
import { PageShell } from "@/components/layout/page-shell";
import { LoadingRegion } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";
import { HomePassport } from "@/features/passport/components/passport-section";
import { SearchEntry } from "@/features/search/components/search-entry";

import { AllDistrictsSection, AllDistrictsSectionSkeleton } from "./all-districts-section";
import { DistrictChipsSection, DistrictChipsSectionSkeleton } from "./district-chips-section";
import { FamousFoodsSection, FamousFoodsSectionSkeleton } from "./famous-foods-section";

// Static top of the page: renders for real in both the page and its skeleton (docs/05 §1.5).
function HomeHero() {
  const t = getT();
  return (
    <HeroBand tone="home">
      <h1 className="text-title-1">{t("home.title")}</h1>
      <SearchEntry className="mt-4 border-0 shadow-floating lg:mt-6 lg:h-16 lg:max-w-[760px] lg:text-lg" />
    </HeroBand>
  );
}

/** The home page: hero, then each data section streams in behind its own skeleton. */
export function HomePage() {
  return (
    <PageShell>
      <HomeHero />
      <Suspense fallback={<FamousFoodsSectionSkeleton />}>
        <FamousFoodsSection />
      </Suspense>
      <Suspense fallback={<DistrictChipsSectionSkeleton />}>
        <DistrictChipsSection />
      </Suspense>
      <Suspense fallback={<AllDistrictsSectionSkeleton />}>
        <AllDistrictsSection />
      </Suspense>
      <Suspense fallback={null}>
        <HomePassport />
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
      <PageShell>
        <HomeHero />
        <FamousFoodsSectionSkeleton />
        <DistrictChipsSectionSkeleton />
        <AllDistrictsSectionSkeleton />
      </PageShell>
    </LoadingRegion>
  );
}
