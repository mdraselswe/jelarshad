import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { SparkleArt, TrophyArt } from "@/components/illustration/food-art";
import { HillEdge, HouseArt, PersonArt, TreeArt } from "@/components/illustration/world-art";
import { Band } from "@/components/layout/band";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

/** The night band that invites people to collect district stamps (static, so it never reflows). */
export function GamePromo() {
  const t = getT();
  return (
    <Band tone="night" className="relative overflow-hidden">
      <SparkleArt className="absolute top-6 left-10 size-3" />
      <SparkleArt tone="b" delay={1200} className="absolute top-14 right-12 size-2.5" />
      <SparkleArt delay={1900} className="absolute right-8 bottom-10 size-3.5" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16">
        <HillEdge className="absolute inset-x-0 bottom-0 text-black/25" />
        <TreeArt className="absolute bottom-1 left-[6%] w-8" />
        <HouseArt className="absolute bottom-1 left-[26%] w-14" />
        <TreeArt tone="b" className="absolute bottom-1 left-[52%] w-6" />
        <PersonArt shirt="b" className="absolute bottom-1 left-[70%] h-10 w-5" />
      </div>
      <div className="relative flex items-center gap-4 pb-16 lg:gap-8 lg:pb-0">
        <TrophyArt className="h-[94px] w-[84px] shrink-0 lg:h-[130px] lg:w-[116px]" />
        <div className="min-w-0">
          <h2 className="font-display text-[22px] leading-tight font-bold lg:text-[32px]">
            {t("game.promoTitle")}
          </h2>
          <p className="mt-1.5 text-[14px] text-on-hero/90 lg:text-base">{t("game.promoBody")}</p>
          <Link
            href={routes.me()}
            className="mt-4 inline-flex h-12 press items-center gap-2 rounded-[16px] bg-reward px-[18px] text-[14.5px] font-bold text-on-reward"
          >
            {t("game.promoCta")}
            <ChevronRightIcon className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </Band>
  );
}
