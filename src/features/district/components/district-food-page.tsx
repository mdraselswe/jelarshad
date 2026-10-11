import Link from "next/link";

import { HeroBand } from "@/components/layout/hero-band";
import { HeroBar } from "@/components/layout/hero-bar";
import { PageShell } from "@/components/layout/page-shell";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { LoadingRegion, SkeletonText } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import {
  DishGroups,
  FoodDishesSectionSkeleton,
} from "@/features/food/components/food-dishes-section";
import { ShareButton } from "@/features/share/components/share-button";
import { getT } from "@/i18n/server";
import type { DistrictFoodPage as DistrictFoodData } from "@/services/catalog-service";

/** "বগুড়ার দই": where this food is best inside one district. */
export function DistrictFoodPage({ data }: { data: DistrictFoodData }) {
  const t = getT();
  const { district, food, noteBn, dishes } = data;
  const about = noteBn ?? food.aboutBn;
  return (
    <PageShell
      header={
        <SubPageBar
          hideMobile
          backHref={routes.district(district.slug)}
          crumbs={[
            { label: district.nameBn, href: routes.district(district.slug) },
            { label: food.nameBn },
          ]}
          actions={
            <ShareButton
              title={t("district.titleFood", { district: district.nameBn, food: food.nameBn })}
              path={routes.districtFood(district.slug, food.slug)}
            />
          }
        />
      }
    >
      <HeroBand
        tone="food"
        bleed
        className="pb-9 lg:pb-12"
        bar={
          <HeroBar
            backHref={routes.district(district.slug)}
            actions={
              <ShareButton
                title={t("district.titleFood", { district: district.nameBn, food: food.nameBn })}
                path={routes.districtFood(district.slug, food.slug)}
              />
            }
          />
        }
      >
        <h1 className="text-title-1">
          {t("district.titleFood", { district: district.nameBn, food: food.nameBn })}
        </h1>
        {about ? <p className="mt-2 text-body">{about}</p> : null}
        <Link
          href={routes.food(food.slug)}
          className="mt-2 inline-block text-meta font-semibold underline underline-offset-4"
        >
          {t("district.allCountry", { food: food.nameBn })}
        </Link>
      </HeroBand>
      <div className="lg:max-w-[880px]">
        <DishGroups
          items={dishes.items}
          priceRange={dishes.priceRange}
          emptyText={t("district.noDishes", { district: district.nameBn, food: food.nameBn })}
        />
      </div>
    </PageShell>
  );
}

export function DistrictFoodPageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell header={<SubPageBar hideMobile backHref={routes.home()} />}>
        <HeroBand
          tone="food"
          bleed
          className="pb-9 lg:pb-12"
          bar={<HeroBar backHref={routes.home()} />}
        >
          <div className="text-title-1">
            <SkeletonText className="w-2/3" />
          </div>
        </HeroBand>
        <FoodDishesSectionSkeleton />
      </PageShell>
    </LoadingRegion>
  );
}
