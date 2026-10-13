import Link from "next/link";
import type { ReactNode } from "react";

import { MapPinIcon } from "lucide-react";

import {
  BowlArt,
  PileArt,
  PinArt,
  PlateArt,
  PotArt,
  RouteArt,
} from "@/components/illustration/food-art";
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
  "relative flex h-44 w-[150px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[26px] p-3.5 text-on-hero md:h-40 md:w-auto md:p-5";

// One small floating dish per card, picked from the slug so a district keeps its picture.
const DISH_ART = [BowlArt, PlateArt, PotArt, PileArt] as const;
function dishFor(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return DISH_ART[hash % DISH_ART.length] ?? BowlArt;
}

/** The dotted route with three hopping pins above the cards. */
function JourneyArt() {
  return (
    <div aria-hidden className="relative -mb-1 h-[60px]">
      <RouteArt tone="gold" className="absolute inset-0 h-full w-full" />
      <PinArt tone="a" className="absolute top-0 left-[1%] w-[22px]" />
      <PinArt tone="b" delay={700} className="absolute top-0 left-[36%] w-[22px]" />
      <PinArt tone="c" delay={1400} className="absolute -top-2 left-[70%] w-[22px]" />
    </div>
  );
}

function TilesShell({ children, count }: { children: ReactNode; count?: number }) {
  const t = getT();
  return (
    <Band
      tone="warm"
      flush
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
      <JourneyArt />
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
      {famousDistricts.slice(0, HOME_DISTRICT_TILES).map((district) => {
        const Dish = dishFor(district.slug);
        return (
          <Link
            key={district.slug}
            href={routes.district(district.slug)}
            className={cn(TILE_CLASS, tileClass(district.slug), "lift press")}
          >
            <Dish className="pointer-events-none absolute top-2.5 right-2 w-16" />
            <span className="line-clamp-1 font-display text-[22px] leading-tight font-extrabold md:text-[28px]">
              {district.nameBn}
            </span>
            <span className="line-clamp-1 text-[13px] opacity-95 md:text-[15px]">
              {district.famous?.nameBn ?? " "}
            </span>
          </Link>
        );
      })}
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
