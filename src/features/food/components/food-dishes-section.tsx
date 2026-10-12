import { SparklesIcon, TrophyIcon, UtensilsIcon } from "lucide-react";

import { Section } from "@/components/layout/section";
import { GroupedList } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { DishRow, DishRowSkeleton } from "@/features/dish/components/dish-row";
import { getT } from "@/i18n/server";
import { formatPriceRange } from "@/lib/format/number";
import type { DishRow as DishRowData, FoodDishes } from "@/services/catalog-service";

import { getFoodDishes } from "../queries";

const SKELETON_ROWS = 4;

function placeContext(place: { areaNameBn: string | null; districtNameBn: string }) {
  return [place.areaNameBn, place.districtNameBn].filter(Boolean).join(", ");
}

/** Ranked places first, then the ones with too few experiences to rank. */
export function DishGroups({
  items,
  priceRange,
  emptyText,
}: {
  items: DishRowData[];
  priceRange: FoodDishes["priceRange"];
  emptyText: string;
}) {
  const t = getT();
  if (items.length === 0) {
    return (
      <Section title={t("food.dishesAll")} icon={<UtensilsIcon />} tone="coral">
        <p className="text-meta text-muted-foreground">{emptyText}</p>
      </Section>
    );
  }
  const ranked = items.filter((dish) => dish.display.rankable);
  const unranked = items.filter((dish) => !dish.display.rankable);
  const range = formatPriceRange(priceRange.min, priceRange.max);
  const row = (dish: DishRowData, rank?: number) => (
    <DishRow
      key={dish.id}
      href={routes.place(dish.place.slug)}
      title={dish.place.nameBn}
      context={placeContext(dish.place)}
      price={dish.price}
      experienceCount={dish.experienceCount}
      display={dish.display}
      rank={rank}
    />
  );

  return (
    <>
      {ranked.length > 0 ? (
        <Section title={t("food.dishesRanked")} icon={<TrophyIcon />} tone="amber">
          {range ? (
            <p className="-mt-1.5 mb-3 text-meta text-muted-foreground">
              {t("food.typicalPrice", { range })}
            </p>
          ) : null}
          <GroupedList>{ranked.map((dish, index) => row(dish, index + 1))}</GroupedList>
        </Section>
      ) : null}
      {unranked.length > 0 ? (
        <Section
          title={ranked.length > 0 ? t("food.newGroup") : t("food.dishesAll")}
          icon={<SparklesIcon />}
          tone="violet"
        >
          <GroupedList>{unranked.map((dish) => row(dish))}</GroupedList>
        </Section>
      ) : null}
    </>
  );
}

export async function FoodDishesSection({ foodId }: { foodId: string }) {
  const t = getT();
  const { items, priceRange } = await getFoodDishes(foodId);
  return <DishGroups items={items} priceRange={priceRange} emptyText={t("food.noDishes")} />;
}

export function FoodDishesSectionSkeleton() {
  const t = getT();
  return (
    <Section title={t("food.dishesRanked")} icon={<TrophyIcon />} tone="amber">
      <GroupedList>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <DishRowSkeleton key={index} />
        ))}
      </GroupedList>
    </Section>
  );
}
