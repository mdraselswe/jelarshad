import { Suspense } from "react";

import { BackButton } from "@/components/layout/back-button";
import { PageShell } from "@/components/layout/page-shell";
import { LoadingRegion } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

import { parseSearchParams, type RawSearchParams } from "../search-params";
import { SearchBox, SearchBoxSkeleton } from "./search-box";
import { SearchResults, SearchResultsSkeleton } from "./search-results";

function SearchTopBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-b-[24px] border-b border-border bg-card px-4 py-3 md:px-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-8 lg:py-6">
      <BackButton href={routes.home()} className="mt-1.5 lg:hidden" />
      <div className="min-w-0 flex-1 lg:max-w-[760px]">{children}</div>
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
