import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { getFoodDishes } from "@/features/food/queries";
import { getPlaceDishes } from "@/features/place/queries";

import type { Reaction } from "@/core/domain";
import { getServices } from "@/infrastructure/container";

import { ReactionPicker, type DishOption } from "./reaction-picker";
import { REACTION_HEADING_CLASS } from "./reaction-styles";

const CARD_CLASS = "rounded-card-lg border border-border bg-card p-4.5";

function Card({ children }: { children: React.ReactNode }) {
  return <div className={CARD_CLASS}>{children}</div>;
}

/** What the signed-in visitor already said about these dishes ({} for a guest). */
async function myReactions(dishIds: string[]): Promise<Record<string, Reaction>> {
  const services = getServices();
  const session = await services.auth.getSession();
  if (!session || dishIds.length === 0) return {};
  const wanted = new Set(dishIds);
  const { items } = await services.repos.experiences.byUser(session.user.id, { limit: 200 });
  const mine: Record<string, Reaction> = {};
  for (const experience of items) {
    if (wanted.has(experience.dishId) && experience.status === "active") {
      mine[experience.dishId] ??= experience.reaction;
    }
  }
  return mine;
}

/** The picker for a food page: the dishes are the places that serve it. */
export async function FoodReactionCard({ foodId }: { foodId: string }) {
  const { items } = await getFoodDishes(foodId);
  const options: DishOption[] = items.map((dish) => ({
    dishId: dish.id,
    label: [dish.place.nameBn, dish.place.areaNameBn ?? dish.place.districtNameBn].join(", "),
  }));
  if (options.length === 0) return null;
  const mine = await myReactions(options.map((option) => option.dishId));
  return (
    <Card>
      <ReactionPicker options={options} mine={mine} />
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
  const mine = await myReactions(options.map((option) => option.dishId));
  return (
    <Card>
      <ReactionPicker options={options} mine={mine} />
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
