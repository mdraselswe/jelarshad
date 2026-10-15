import { SparklesIcon, TrophyIcon, UtensilsIcon } from "lucide-react";

import { Section } from "@/components/layout/section";
import { GroupedList } from "@/components/ui/grouped-list";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { DishRow, DishRowSkeleton } from "@/features/dish/components/dish-row";
import { AreaFilter, type AreaOption } from "@/features/catalog/components/area-filter";
import { getT } from "@/i18n/server";
import { formatPriceRange } from "@/lib/format/number";
import type { DishRow as DishRowData, FoodDishes } from "@/services/catalog-service";

import { getFoodDishes } from "../queries";

const SKELETON_ROWS = 4;
/** More rows than this and a small search box joins the area chips. */
const SEARCH_FROM = 10;

const areaKeyOf = (place: { areaNameBn: string | null; districtNameBn: string }) =>
  place.areaNameBn ?? place.districtNameBn;

/** Area chips, most places first. */
function areaOptions(items: DishRowData[]): AreaOption[] {
  const counts = new Map<string, number>();
  for (const dish of items) {
    const key = areaKeyOf(dish.place);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts, ([key, count]) => ({ key, label: key, count })).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, "bn"),
  );
}

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
      filter={{
        key: areaKeyOf(dish.place),
        text: `${dish.place.nameBn} ${placeContext(dish.place)}`,
      }}
    />
  );

  return (
    <div data-filter-root>
      <AreaFilter areas={areaOptions(items)} showSearch={items.length > SEARCH_FROM} />
      {ranked.length > 0 ? (
        <div data-filter-section>
          <Section title={t("food.dishesRanked")} icon={<TrophyIcon />} tone="amber">
            {range ? (
              <p className="-mt-1.5 mb-3 text-meta text-muted-foreground">
                {t("food.typicalPrice", { range })}
              </p>
            ) : null}
            <GroupedList>{ranked.map((dish, index) => row(dish, index + 1))}</GroupedList>
          </Section>
        </div>
      ) : null}
      {unranked.length > 0 ? (
        <div data-filter-section>
          <Section
            title={ranked.length > 0 ? t("food.newGroup") : t("food.dishesAll")}
            icon={<SparklesIcon />}
            tone="violet"
          >
            <GroupedList>{unranked.map((dish) => row(dish))}</GroupedList>
          </Section>
        </div>
      ) : null}
    </div>
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
    <>
      <div className="flex gap-2 overflow-hidden page-x pt-4">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-10 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <Section title={t("food.dishesRanked")} icon={<TrophyIcon />} tone="amber">
        <GroupedList>
          {Array.from({ length: SKELETON_ROWS }, (_, index) => (
            <DishRowSkeleton key={index} />
          ))}
        </GroupedList>
      </Section>
    </>
  );
}
