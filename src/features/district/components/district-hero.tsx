import type { ReactNode } from "react";

import { PinArt, RouteArt, SparkleArt } from "@/components/illustration/food-art";
import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { SkeletonText } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";
import type { DistrictHeader } from "@/services/catalog-service";

/** The district's outline with a dotted route and three pins that hop (approved canvas: District). */
function RegionArt({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <div className="relative h-[150px] w-[220px]">
        <svg viewBox="0 0 220 150" className="absolute inset-0 size-full animate-fx-float">
          <path
            d="M30 70C20 30 70 8 110 18s70-4 84 36-24 62-52 76-70 18-92-6S40 100 30 70z"
            className="fill-white/20 stroke-white/50"
            strokeWidth="2"
            strokeDasharray="4 6"
          />
        </svg>
        <RouteArt tone="gold" className="absolute inset-x-6 top-10 h-16 w-[170px]" />
        <PinArt tone="a" className="absolute top-12 left-[92px] w-6" />
        <PinArt tone="b" delay={900} className="absolute top-[66px] left-12 w-[18px]" />
        <PinArt tone="c" delay={1600} className="absolute top-9 left-[140px] w-[18px]" />
      </div>
    </div>
  );
}

/**
 * District page top (approved canvas: District): a deep blue band with the region and its pins on the
 * right, the division, the name and the foods it is famous for as one line.
 */
export function DistrictHero({
  district,
  bar,
}: {
  district: Pick<DistrictHeader, "nameBn" | "divisionBn" | "famous">;
  bar?: ReactNode;
}) {
  const t = getT();
  const famousLine = district.famous
    .slice(0, 3)
    .map((entry) => entry.food.nameBn)
    .join(" · ");
  return (
    <HeroBand
      tone="district"
      bleed
      bar={bar}
      scene={<WorldStrip scene="village" />}
      className="pb-[132px] lg:pb-[150px]"
    >
      <SparkleArt className="pointer-events-none absolute top-3 right-12 size-3" />
      <SparkleArt
        tone="b"
        delay={1400}
        className="pointer-events-none absolute top-24 left-2 size-2.5"
      />
      <RegionArt className="pointer-events-none absolute -top-8 -right-2 lg:top-0 lg:right-10 lg:scale-125" />
      <div className="relative flex min-h-[250px] flex-col justify-end lg:min-h-0">
        <p className="text-[13px] font-semibold text-on-hero/90">
          {t("search.districtMeta", { division: district.divisionBn })}
        </p>
        <h1 className="font-display text-[48px] leading-[1.1] font-extrabold lg:text-[52px] lg:font-bold">
          {district.nameBn}
        </h1>
        {famousLine ? (
          <p className="mt-1 line-clamp-1 text-[14px] text-on-hero/92">{famousLine}</p>
        ) : null}
      </div>
    </HeroBand>
  );
}

export function DistrictHeroSkeleton({ bar }: { bar?: ReactNode }) {
  return (
    <HeroBand
      tone="district"
      bleed
      bar={bar}
      scene={<WorldStrip scene="village" />}
      className="pb-[132px] lg:pb-12"
    >
      <div className="flex min-h-[250px] flex-col justify-end lg:min-h-0">
        <div className="text-[14px]">
          <SkeletonText className="w-1/3" />
        </div>
        <div className="font-display text-[48px] leading-[1.1] lg:text-[52px]">
          <SkeletonText className="w-1/2" />
        </div>
      </div>
    </HeroBand>
  );
}
