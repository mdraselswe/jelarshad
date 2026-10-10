import { Section } from "@/components/layout/section";
import { GroupedList, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { DishRow, DishRowSkeleton } from "@/features/dish/components/dish-row";
import { getT } from "@/i18n/server";

import { getPlaceDishes } from "../queries";

const SKELETON_ROWS = 3;

/** "প্রথমবার? এগুলো অর্ডার করুন": best-liked dishes first, new ones last. */
export async function PlaceDishesSection({ placeId }: { placeId: string }) {
  const t = getT();
  const dishes = await getPlaceDishes(placeId);
  return (
    <Section title={t("place.firstTime")}>
      {dishes.length === 0 ? (
        <p className="text-meta text-muted-foreground">{t("place.noDishes")}</p>
      ) : (
        <GroupedList>
          {dishes.map((dish) => (
            <DishRow
              key={dish.id}
              href={routes.food(dish.food.slug)}
              title={dish.displayName ?? dish.food.nameBn}
              price={dish.price}
              experienceCount={dish.experienceCount}
              display={dish.display}
              leading={
                <ListTile seed={dish.food.slug}>
                  {(dish.displayName ?? dish.food.nameBn).slice(0, 1)}
                </ListTile>
              }
            />
          ))}
        </GroupedList>
      )}
    </Section>
  );
}

export function PlaceDishesSectionSkeleton() {
  const t = getT();
  return (
    <Section title={t("place.firstTime")}>
      <GroupedList>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <DishRowSkeleton key={index} />
        ))}
      </GroupedList>
    </Section>
  );
}
