import type { ReactNode } from "react";

import { PinArt } from "@/components/illustration/food-art";
import { HeroBand } from "@/components/layout/hero-band";
import { SkeletonText } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";
import type { DistrictHeader } from "@/services/catalog-service";

/** District page top (docs/design: M-District): teal-to-indigo band, division, name, a stat chip. */
export function DistrictHero({
  district,
  bar,
}: {
  district: Pick<DistrictHeader, "nameBn" | "divisionBn" | "famous">;
  bar?: ReactNode;
}) {
  const t = getT();
  return (
    <HeroBand tone="district" bleed bar={bar} art={<PinArt />} className="pb-12 lg:pb-12">
      <p className="text-[14px] text-on-hero/90">
        {t("search.districtMeta", { division: district.divisionBn })}
      </p>
      <h1 className="font-display text-[40px] leading-[1.15] font-bold lg:text-[52px]">
        {district.nameBn}
      </h1>
      {district.famous.length > 0 ? (
        <div className="mt-3 inline-block rounded-[18px] bg-white/18 px-3.5 py-2.5">
          <div className="font-display text-[22px] leading-tight font-bold">
            {formatNumber(district.famous.length)}
          </div>
          <div className="text-[12.5px]">{t("district.statFamous")}</div>
        </div>
      ) : null}
    </HeroBand>
  );
}

export function DistrictHeroSkeleton({ bar }: { bar?: ReactNode }) {
  return (
    <HeroBand tone="district" bleed bar={bar} art={<PinArt />} className="pb-12 lg:pb-12">
      <div className="text-[14px]">
        <SkeletonText className="w-1/3" />
      </div>
      <div className="font-display text-[40px] leading-[1.15] lg:text-[52px]">
        <SkeletonText className="w-1/2" />
      </div>
    </HeroBand>
  );
}
