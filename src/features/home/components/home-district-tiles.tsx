import Link from "next/link";
import type { ReactNode } from "react";

import { MapPinIcon } from "lucide-react";

import { RouteArt } from "@/components/illustration/food-art";
import { Band } from "@/components/layout/band";
import { Skeleton } from "@/components/ui/skeleton";
import { HOME_DISTRICT_TILES } from "@/config/home";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format/number";
import { tileClass } from "@/lib/tone";

import { getHomeData } from "../queries";

// Gradient tiles (docs/design): a snapping row on phones, a grid of four from 768px.
const ROW_CLASS =
  "rise-children -mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0 md:pb-0 md:[&>:nth-child(n+9)]:hidden";
const TILE_CLASS =
  "flex h-28 w-37 shrink-0 snap-start flex-col justify-end rounded-card-lg p-3.5 text-on-hero md:h-36 md:w-auto md:p-5";

function TilesShell({ children, count }: { children: ReactNode; count?: number }) {
  const t = getT();
  return (
    <Band
      tone="warm"
      title={t("home.districtsTitle")}
      icon={<MapPinIcon />}
      action={
        count === undefined ? undefined : (
          <span className="text-sm font-semibold text-primary-text">
            {t("home.districtCount", { count: formatNumber(count) })}
          </span>
        )
      }
    >
      <RouteArt tone="gold" className="-mb-1 h-10 w-full" />
      <div className={ROW_CLASS}>{children}</div>
    </Band>
  );
}

export async function HomeDistrictTiles() {
  const { famousDistricts, divisions } = await getHomeData();
  if (famousDistricts.length === 0) return null;
  const total = divisions.reduce((sum, division) => sum + division.districts.length, 0);
  return (
    <TilesShell count={total}>
      {famousDistricts.slice(0, HOME_DISTRICT_TILES).map((district) => (
        <Link
          key={district.slug}
          href={routes.district(district.slug)}
          className={cn(TILE_CLASS, tileClass(district.slug), "lift press")}
        >
          <span className="line-clamp-1 font-display text-[22px] leading-tight font-bold md:text-[28px]">
            {district.nameBn}
          </span>
          <span className="line-clamp-1 text-[13px] opacity-95 md:text-[15px]">
            {district.famous?.nameBn ?? " "}
          </span>
        </Link>
      ))}
    </TilesShell>
  );
}

export function HomeDistrictTilesSkeleton() {
  return (
    <TilesShell>
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className={cn(TILE_CLASS, "rounded-card-lg")} />
      ))}
    </TilesShell>
  );
}
