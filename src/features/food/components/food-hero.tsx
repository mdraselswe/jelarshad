import type { ReactNode } from "react";

import { BowlArt } from "@/components/illustration/food-art";
import { HeroBand } from "@/components/layout/hero-band";
import { SkeletonText } from "@/components/ui/skeleton";
import type { FoodHeader } from "@/services/catalog-service";

import { FoodStatsCard } from "./food-stats-card";

const TILE_CLASS =
  "flex size-[84px] shrink-0 items-center justify-center rounded-[28px] bg-white/20 font-display text-[44px] font-bold lg:size-[120px] lg:rounded-[36px] lg:text-[64px]";

/**
 * Food page top (docs/design: M-Food, D-Food): gradient band with the letter tile, name and a
 * translucent "about" box; on desktop the score card sits inside the band, on phones it floats below.
 */
export function FoodHero({ food, bar }: { food: FoodHeader; bar?: ReactNode }) {
  return (
    <HeroBand tone="food" bleed bar={bar} art={<BowlArt />} className="pb-12 lg:pb-12">
      <div className="lg:flex lg:items-center lg:gap-10">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-4 lg:gap-8">
            <span aria-hidden className={TILE_CLASS}>
              {food.nameBn.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-[36px] leading-[1.15] font-bold lg:text-[48px]">
                {food.nameBn}
              </h1>
              {food.nameEn ? <p className="text-[15px] text-on-hero/90">{food.nameEn}</p> : null}
            </div>
          </div>
          {food.aboutBn ? (
            <p className="mt-4 rounded-[22px] bg-white/16 p-3.5 text-[14.5px] leading-relaxed lg:max-w-xl lg:bg-transparent lg:p-0 lg:text-[17px]">
              {food.aboutBn}
            </p>
          ) : null}
        </div>
        <div className="hidden w-[300px] shrink-0 lg:block">
          <FoodStatsCard food={food} />
        </div>
      </div>
    </HeroBand>
  );
}

export function FoodHeroSkeleton({ bar }: { bar?: ReactNode }) {
  return (
    <HeroBand tone="food" bleed bar={bar} art={<BowlArt />} className="pb-12 lg:pb-12">
      <div className="flex items-center gap-4 lg:gap-8">
        <span aria-hidden className={TILE_CLASS} />
        <div className="min-w-0 flex-1 font-display text-[36px] leading-[1.15] lg:text-[48px]">
          <SkeletonText className="w-1/2" />
        </div>
      </div>
    </HeroBand>
  );
}
