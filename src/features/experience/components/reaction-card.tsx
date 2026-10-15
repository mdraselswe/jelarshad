import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { getFoodDishes } from "@/features/food/queries";
import { getPlaceDishes } from "@/features/place/queries";

import { ReactionPicker, type DishOption } from "./reaction-picker";
import { REACTION_HEADING_CLASS } from "./reaction-styles";

const CARD_CLASS = "rounded-card-lg border border-border bg-card p-4.5";

function Card({ children }: { children: React.ReactNode }) {
  return <div className={CARD_CLASS}>{children}</div>;
}

/** The picker for a food page: the dishes are the places that serve it. */
export async function FoodReactionCard({ foodId }: { foodId: string }) {
  const { items } = await getFoodDishes(foodId);
  const options: DishOption[] = items.map((dish) => ({
    dishId: dish.id,
    label: [dish.place.nameBn, dish.place.areaNameBn ?? dish.place.districtNameBn].join(", "),
  }));
  if (options.length === 0) return null;
  return (
    <Card>
      <ReactionPicker options={options} />
    </Card>
  );
}

/** The picker for a place page: the dishes are what the place serves. */
export async function PlaceReactionCard({ placeId }: { placeId: string }) {
  const dishes = await getPlaceDishes(placeId);
  const options: DishOption[] = dishes.map((dish) => ({
    dishId: dish.id,
    label: dish.displayName ?? dish.food.nameBn,
  }));
  if (options.length === 0) return null;
  return (
    <Card>
      <ReactionPicker options={options} />
    </Card>
  );
}

/** Same box as the picker: heading line, then the row of three 84px buttons. */
export function ReactionCardSkeleton() {
  return (
    <Card>
      <div className={REACTION_HEADING_CLASS}>
        <SkeletonText className="w-3/4" />
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2" aria-hidden>
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-21 rounded-[18px]" />
        ))}
      </div>
    </Card>
  );
}
