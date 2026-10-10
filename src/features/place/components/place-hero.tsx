import { HeroBand } from "@/components/layout/hero-band";
import { SkeletonText } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";
import type { PlaceHeader } from "@/services/catalog-service";

export function PlaceHero({ place }: { place: PlaceHeader }) {
  const t = getT();
  const where = [t(`placeType.${place.type}`), place.areaNameBn, place.district.nameBn]
    .filter(Boolean)
    .join(" · ");
  return (
    <HeroBand tone="place">
      <h1 className="text-title-1">{place.nameBn}</h1>
      {place.nameEn ? <p className="text-meta text-on-hero/85">{place.nameEn}</p> : null}
      <p className="mt-1 text-meta text-on-hero/85">{where}</p>
    </HeroBand>
  );
}

export function PlaceHeroSkeleton() {
  return (
    <HeroBand tone="place">
      <div className="text-title-1">
        <SkeletonText className="w-2/3" />
      </div>
      <div className="mt-1 text-meta">
        <SkeletonText className="w-1/2" />
      </div>
    </HeroBand>
  );
}
