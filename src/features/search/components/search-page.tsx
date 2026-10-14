import { Suspense } from "react";

import { BowlArt, CloudArt, CupArt } from "@/components/illustration/food-art";
import { HillEdge } from "@/components/illustration/world-art";
import { BackButton } from "@/components/layout/back-button";
import { WaveDivider } from "@/components/layout/wave-divider";
import { PageShell } from "@/components/layout/page-shell";
import { LoadingRegion } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

import { parseSearchParams, type RawSearchParams } from "../search-params";
import { SearchBox, SearchBoxSkeleton } from "./search-box";
import { SearchResults, SearchResultsSkeleton } from "./search-results";

function SearchTopBar({ children }: { children: React.ReactNode }) {
  const t = getT();
  return (
    // Phones: the violet band of the approved canvas (back, white field, wave). Desktop: plain row.
    <div className="relative flex items-start gap-3 overflow-hidden bg-grad-hero px-5 pt-5 pb-10 md:px-7 lg:mx-8 lg:mt-6 lg:block lg:rounded-[36px] lg:px-12 lg:pt-10 lg:pb-16">
      <div className="mt-0.5 on-hero-actions lg:hidden">
        <BackButton href={routes.home()} />
      </div>
      <div className="min-w-0 flex-1 lg:max-w-[640px]">
        <p className="mb-3 hidden font-display text-[34px] leading-[1.25] font-extrabold text-on-hero lg:block">
          {t("search.heroTitle")}
        </p>
        {children}
      </div>
      <CloudArt className="pointer-events-none absolute top-5 right-[30%] hidden w-28 opacity-30 lg:block" />
      <BowlArt className="pointer-events-none absolute top-6 right-14 hidden w-[130px] lg:block" />
      <CupArt className="pointer-events-none absolute top-14 right-[22%] hidden w-14 lg:block" />
      <WaveDivider className="absolute inset-x-0 -bottom-px text-background lg:hidden" />
      <HillEdge className="absolute inset-x-0 -bottom-px hidden text-background lg:block" />
    </div>
  );
}

async function SearchBoxFromUrl({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const { q } = parseSearchParams(await searchParams);
  return <SearchBox initialQuery={q} />;
}

/** The URL is the source of truth: `?q=&tab=&type=&price=`. */
export function SearchPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return (
    <PageShell
      header={
        <SearchTopBar>
          <Suspense fallback={<SearchBoxSkeleton />}>
            <SearchBoxFromUrl searchParams={searchParams} />
          </Suspense>
        </SearchTopBar>
      }
    >
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </PageShell>
  );
}

export function SearchPageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell
        header={
          <SearchTopBar>
            <SearchBoxSkeleton />
          </SearchTopBar>
        }
      >
        <SearchResultsSkeleton />
      </PageShell>
    </LoadingRegion>
  );
}
