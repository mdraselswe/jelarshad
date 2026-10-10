import Link from "next/link";

import { HeroBand } from "@/components/layout/hero-band";
import { Badge } from "@/components/ui/badge";
import { SkeletonText } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { formatNumber, formatPercent } from "@/lib/format/number";
import type { FoodHeader } from "@/services/catalog-service";

export function FoodHero({ food }: { food: FoodHeader }) {
  const t = getT();
  const summary =
    food.percent !== null && food.experienceCount > 0
      ? `${t("food.liked", { percent: formatPercent(food.percent) })} · ${t("food.experienceCount", { count: formatNumber(food.experienceCount) })}`
      : t("food.noExperiences");
  return (
    <HeroBand tone="food">
      <h1 className="text-title-1">{food.nameBn}</h1>
      {food.nameEn ? <p className="text-meta text-on-hero/85">{food.nameEn}</p> : null}
      {food.aboutBn ? <p className="mt-2 text-body">{food.aboutBn}</p> : null}
      <p className="mt-2 text-meta text-on-hero/85 lg:hidden">{summary}</p>
      {food.famousIn.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {food.famousIn.map((district) => (
            <li key={district.slug}>
              <Badge asChild variant="soft">
                <Link href={routes.districtFood(district.slug, food.slug)}>
                  {t("food.famousIn", { district: district.nameBn })}
                </Link>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </HeroBand>
  );
}

export function FoodHeroSkeleton() {
  return (
    <HeroBand tone="food">
      <div className="text-title-1">
        <SkeletonText className="w-1/2" />
      </div>
      <div className="mt-2 text-meta">
        <SkeletonText className="w-2/3" />
      </div>
    </HeroBand>
  );
}
