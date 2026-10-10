import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";

import { SkeletonText } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";

import { getHomeData } from "../queries";

// A native <details>: all 64 districts stay in the HTML (crawlable, no JavaScript) but take one
// row of space until opened. The skeleton is that closed row.
const ROW_CLASS = "flex min-h-14 items-center justify-between gap-3 px-4 text-card-title";
const CARD_CLASS = "mx-5 mt-6 rounded-card border border-border bg-card md:mx-7 lg:mx-8 lg:mt-10";

export async function AllDistrictsSection() {
  const t = getT();
  const { divisions } = await getHomeData();
  const total = divisions.reduce((sum, division) => sum + division.districts.length, 0);
  return (
    <details className={`${CARD_CLASS} group smooth-details`}>
      <summary
        className={`${ROW_CLASS} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
      >
        {t("home.allDistricts", { count: formatNumber(total) })}
        <ChevronDownIcon
          className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="flex flex-col gap-4 border-t border-divider p-4 lg:grid lg:grid-cols-4 lg:items-start lg:gap-6 lg:p-6">
        {divisions.map((division) => (
          <div key={division.nameBn}>
            <h3 className="mb-2 text-caption text-muted-foreground">
              {t("home.divisionOf", { name: division.nameBn })}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {division.districts.map((district) => (
                <li key={district.slug}>
                  <Link
                    href={routes.district(district.slug)}
                    className="inline-flex h-10 press items-center rounded-full border border-border bg-background px-3.5 text-sm"
                  >
                    {district.nameBn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}

export function AllDistrictsSectionSkeleton() {
  return (
    <div className={CARD_CLASS}>
      <div className={ROW_CLASS}>
        <SkeletonText className="w-1/2" />
      </div>
    </div>
  );
}
