import { Suspense } from "react";

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
  return (
    // Phones: the violet band of the approved canvas (back, white field, wave). Desktop: plain row.
    <div className="relative flex items-start gap-3 bg-grad-hero px-5 pt-5 pb-10 md:px-7 lg:static lg:z-auto lg:bg-none lg:px-8 lg:py-6">
      <div className="mt-0.5 on-hero-actions lg:hidden">
        <BackButton href={routes.home()} />
      </div>
      <div className="min-w-0 flex-1 lg:max-w-[760px]">{children}</div>
      <WaveDivider className="absolute inset-x-0 -bottom-px text-background lg:hidden" />
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
