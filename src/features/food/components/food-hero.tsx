import Link from "next/link";
import type { ReactNode } from "react";

import { PotArt } from "@/components/illustration/food-art";
import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { SkeletonText } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import type { FoodHeader } from "@/services/catalog-service";

import { FoodStatsCard } from "./food-stats-card";

const TILE_CLASS =
  "hidden size-[120px] shrink-0 items-center justify-center rounded-[36px] bg-white/20 font-display text-[64px] font-bold lg:flex";

/**
 * Food page top (approved canvas: Food, D-Food): an orange-to-pink band with a big floating pot, the
 * districts it is famous in as chips, the name and one line about it. On desktop the score card sits
 * inside the band; on phones the three-card strip floats below it.
 */
export function FoodHero({ food, bar }: { food: FoodHeader; bar?: ReactNode }) {
  const t = getT();
  return (
    <HeroBand
      tone="food"
      bleed
      bar={bar}
      scene={
        <div className="hidden lg:block">
          <WorldStrip scene="village" />
        </div>
      }
      className="pb-12 lg:pb-[150px]"
    >
      <PotArt className="pointer-events-none absolute -top-3 left-1/2 w-[188px] -translate-x-1/2 lg:hidden" />
      <div className="flex min-h-[318px] flex-col justify-end lg:block lg:flex lg:min-h-0 lg:flex-row lg:items-center lg:gap-10">
        <div className="min-w-0 lg:flex-1">
          {food.famousIn.length > 0 ? (
            <ul className="mb-2.5 flex flex-wrap gap-2 lg:hidden">
              {food.famousIn.slice(0, 2).map((district) => (
                <li key={district.slug}>
                  <Link
                    href={routes.districtFood(district.slug, food.slug)}
                    className="flex h-7 items-center rounded-[12px] bg-white/22 px-3 text-[12.5px] font-semibold"
                  >
                    {t("food.famousIn", { district: district.nameBn })}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex items-center gap-4 lg:gap-8">
            <span aria-hidden className={TILE_CLASS}>
              {food.nameBn.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-[40px] leading-[1.15] font-extrabold lg:text-[48px] lg:font-bold">
                {food.nameBn}
              </h1>
              {food.nameEn ? (
                <p className="hidden text-[15px] text-on-hero/90 lg:block">{food.nameEn}</p>
              ) : null}
            </div>
          </div>
          {food.aboutBn ? (
            <p className="mt-1.5 line-clamp-2 text-[14px] leading-normal text-on-hero/95 lg:mt-4 lg:max-w-xl lg:text-[17px] lg:leading-relaxed">
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
    <HeroBand
      tone="food"
      bleed
      bar={bar}
      scene={
        <div className="hidden lg:block">
          <WorldStrip scene="village" />
        </div>
      }
      className="pb-12 lg:pb-[150px]"
    >
      <div className="flex min-h-[318px] flex-col justify-end lg:min-h-0 lg:flex-row lg:items-center lg:gap-8">
        <span aria-hidden className={TILE_CLASS} />
        <div className="min-w-0 font-display text-[40px] leading-[1.15] lg:flex-1 lg:text-[48px]">
          <SkeletonText className="w-1/2" />
        </div>
      </div>
    </HeroBand>
  );
}
