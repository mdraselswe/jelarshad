import { HeroBand } from "@/components/layout/hero-band";
import { SkeletonText } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";
import type { DistrictHeader } from "@/services/catalog-service";

export function DistrictHero({
  district,
}: {
  district: Pick<DistrictHeader, "nameBn" | "divisionBn">;
}) {
  const t = getT();
  return (
    <HeroBand tone="district">
      <h1 className="text-title-1">{district.nameBn}</h1>
      <p className="mt-1 text-meta text-on-hero/85">
        {t("search.districtMeta", { division: district.divisionBn })}
      </p>
    </HeroBand>
  );
}

export function DistrictHeroSkeleton() {
  return (
    <HeroBand tone="district">
      <div className="text-title-1">
        <SkeletonText className="w-1/2" />
      </div>
      <div className="mt-1 text-meta">
        <SkeletonText className="w-1/3" />
      </div>
    </HeroBand>
  );
}
