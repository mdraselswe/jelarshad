import type { ReactNode } from "react";

import { PlateArt } from "@/components/illustration/food-art";
import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { SkeletonText } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";
import type { PlaceHeader } from "@/services/catalog-service";

/** Place page top (docs/design: M-Place): pink-to-violet band, type pill, name and area. */
export function PlaceHero({
  place,
  bar,
  aside,
}: {
  place: PlaceHeader;
  bar?: ReactNode;
  aside?: ReactNode;
}) {
  const t = getT();
  const where = [place.areaNameBn, place.district.nameBn].filter(Boolean).join(", ");
  return (
    <HeroBand
      tone="place"
      bleed
      bar={bar}
      art={<PlateArt className="hidden lg:block" />}
      scene={
        <div className="hidden lg:block">
          <WorldStrip scene="village" />
        </div>
      }
      className="pb-12 lg:pb-[150px]"
    >
      <PlateArt className="pointer-events-none absolute -top-2 left-1/2 w-[168px] -translate-x-1/2 lg:hidden" />
      <div className="flex min-h-[280px] flex-col justify-end lg:flex-row lg:items-center lg:gap-8">
        <div className="min-w-0 lg:flex-1">
          <span className="flex h-[30px] w-fit items-center rounded-full bg-white/22 px-3 text-[13px] font-semibold">
            {t(`placeType.${place.type}`)}
          </span>
          <h1 className="mt-3 font-display text-[34px] leading-[1.15] font-extrabold lg:text-[44px] lg:font-bold">
            {place.nameBn}
          </h1>
          {place.nameEn ? <p className="text-[15px] text-on-hero/90">{place.nameEn}</p> : null}
          {where ? (
            <p className="mt-1.5 text-[15px] text-on-hero/90 lg:text-[17px]">{where}</p>
          ) : null}
        </div>
        {aside ? <div className="mt-4 hidden shrink-0 lg:mt-0 lg:block">{aside}</div> : null}
      </div>
    </HeroBand>
  );
}

export function PlaceHeroSkeleton({ bar }: { bar?: ReactNode }) {
  return (
    <HeroBand
      tone="place"
      bleed
      bar={bar}
      art={<PlateArt className="hidden lg:block" />}
      scene={
        <div className="hidden lg:block">
          <WorldStrip scene="village" />
        </div>
      }
      className="pb-12 lg:pb-[150px]"
    >
      <div className="flex min-h-[280px] flex-col justify-end lg:min-h-0">
        <span className="flex h-[30px] w-24 items-center rounded-full bg-white/22" />
        <div className="mt-3 font-display text-[34px] leading-[1.15] lg:text-[44px]">
          <SkeletonText className="w-2/3" />
        </div>
        <div className="mt-1.5 text-[15px]">
          <SkeletonText className="w-1/2" />
        </div>
      </div>
    </HeroBand>
  );
}
