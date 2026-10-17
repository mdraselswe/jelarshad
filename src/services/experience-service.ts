import { appConfig } from "@/config/app.config";
import type { AppUser, DishWithPlace, Experience, Reaction } from "@/core/domain";
import type { CacheInvalidator, Repositories } from "@/core/ports";
import { fail, ok, type Result } from "@/lib/result";
import { containsProfanity } from "@/lib/text/profanity";

import type { Reward, RewardService } from "./reward-service";

// "আমি খেয়েছি": one experience per user per dish (decision P6). Pure: ports only.

type Deps = {
  repos: Pick<Repositories, "dishes" | "experiences" | "foods" | "places">;
  cache: CacheInvalidator;
  rewards: RewardService;
};

/** Which dish: an existing one, or a (place, food) pair whose dish is created on first use. */
export type DishRef = { dishId: string } | { placeId: string; foodId: string };

export type AddExperienceInput = DishRef & {
  reaction: Reaction;
  comment?: string | null | undefined;
  pricePaid?: number | null | undefined;
};

/** Trims and collapses whitespace; empty becomes null; never longer than the configured maximum. */
export function cleanComment(value: string | null | undefined): string | null {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (text === "") return null;
  return [...text].slice(0, appConfig.text.commentMax).join("");
}

export type AddedExperience = {
  experience: Experience;
  dish: DishWithPlace;
  /** True when this user had no experience of the dish before (adds, not edits). */
  isNew: boolean;
  reward: Reward;
};

export function createExperienceService({ repos, cache, rewards }: Deps) {
  return {
    async add(user: AppUser, input: AddExperienceInput): Promise<Result<AddedExperience>> {
      const comment = cleanComment(input.comment);
      if (comment && containsProfanity(comment)) {
        return fail("validation", { fields: { comment: "profanity" } });
      }

      let dish: DishWithPlace | null;
      if ("dishId" in input) {
        dish = await repos.dishes.byId(input.dishId);
      } else {
        const [place, food] = await Promise.all([
          repos.places.byId(input.placeId),
          repos.foods.byId(input.foodId),
        ]);
        dish = place && food ? await repos.dishes.findOrCreate(place.id, food.id) : null;
      }
      if (!dish || dish.status !== "active") return fail("not_found");

      const before = await repos.experiences.forDish(dish.id, { limit: 200 });
      const isNew = !before.items.some((experience) => experience.user.id === user.id);

      const experience = await repos.experiences.upsert({
        dishId: dish.id,
        userId: user.id,
        reaction: input.reaction,
        comment,
        pricePaid: input.pricePaid ?? null,
      });

      await cache.invalidate([`food:${dish.foodId}`, `place:${dish.placeId}`, `dish:${dish.id}`]);
      const reward = await rewards.forExperience(user, {
        experienceId: experience.id,
        isNew,
        district: { id: dish.place.district.id, nameBn: dish.place.district.nameBn },
      });
      return ok({ experience, dish, isNew, reward });
    },

    /** A person takes back their own experience: it goes, its numbers refresh, its points are revoked. */
    async withdraw(user: AppUser, experienceId: string): Promise<Result<{ removed: true }>> {
      const experience = await repos.experiences.byId(experienceId);
      if (!experience) return fail("not_found");
      if (experience.user.id !== user.id) return fail("forbidden");
      const removed = await repos.experiences.remove(experienceId);
      if (!removed) return fail("not_found");
      await rewards.revokeFor("experience", experienceId);
      const dish = await repos.dishes.byId(removed.dishId);
      if (dish) {
        await cache.invalidate([`food:${dish.foodId}`, `place:${dish.placeId}`, `dish:${dish.id}`]);
      }
      return ok({ removed: true });
    },
  };
}

export type ExperienceService = ReturnType<typeof createExperienceService>;
