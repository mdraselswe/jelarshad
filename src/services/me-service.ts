import type { Experience, Reaction } from "@/core/domain";
import type { Repositories } from "@/core/ports";

// What the profile page shows (docs/01-product-spec.md §3.11). Pure: ports only.

type Deps = { repos: Pick<Repositories, "experiences" | "dishes" | "foods" | "places" | "saved"> };

export type AteRow = {
  experienceId: string;
  reaction: Reaction;
  comment: string | null;
  createdAt: Date;
  /** Photos already attached (a person may attach a few per experience). */
  photoCount: number;
  food: { slug: string; nameBn: string };
  place: { slug: string; nameBn: string; districtNameBn: string };
};

export type SavedRow = {
  kind: "food" | "place";
  slug: string;
  nameBn: string;
  meta: string | null;
};

export type Contributions = {
  experienceCount: number;
  places: { slug: string; nameBn: string; districtNameBn: string }[];
};

const LIMIT = 30;

export function createMeService({ repos }: Deps) {
  async function ateRows(experiences: Experience[]): Promise<AteRow[]> {
    const rows = await Promise.all(
      experiences.map(async (experience): Promise<AteRow | null> => {
        const dish = await repos.dishes.byId(experience.dishId);
        if (!dish) return null;
        const food = await repos.foods.byId(dish.foodId);
        if (!food) return null;
        return {
          experienceId: experience.id,
          reaction: experience.reaction,
          comment: experience.comment,
          createdAt: experience.createdAt,
          photoCount: experience.photos.length,
          food: { slug: food.slug, nameBn: food.nameBn },
          place: {
            slug: dish.place.slug,
            nameBn: dish.place.nameBn,
            districtNameBn: dish.place.district.nameBn,
          },
        };
      }),
    );
    return rows.filter((row): row is AteRow => row !== null);
  }

  return {
    /** খেয়েছি: everything this person reacted to, newest first. */
    async ate(userId: string): Promise<AteRow[]> {
      const page = await repos.experiences.byUser(userId, { limit: LIMIT });
      return ateRows(page.items);
    },

    /** আমার অবদান: places they added and how much they have shared. */
    async contributions(userId: string): Promise<Contributions> {
      const [experiences, places] = await Promise.all([
        repos.experiences.byUser(userId, { limit: 200 }),
        repos.places.byCreator(userId, { limit: LIMIT }),
      ]);
      return {
        experienceCount: experiences.items.length,
        places: places.items.map((place) => ({
          slug: place.slug,
          nameBn: place.nameBn,
          districtNameBn: place.district.nameBn,
        })),
      };
    },

    /** খেতে চাই: bookmarked foods and places that still exist. */
    async saved(userId: string): Promise<SavedRow[]> {
      const page = await repos.saved.list(userId, { limit: LIMIT });
      const rows = await Promise.all(
        page.items.map(async (item): Promise<SavedRow | null> => {
          if (item.entity === "food") {
            const food = await repos.foods.byId(item.entityId);
            return food ? { kind: "food", slug: food.slug, nameBn: food.nameBn, meta: null } : null;
          }
          if (item.entity === "place") {
            const place = await repos.places.byId(item.entityId);
            return place
              ? {
                  kind: "place",
                  slug: place.slug,
                  nameBn: place.nameBn,
                  meta: place.district.nameBn,
                }
              : null;
          }
          return null;
        }),
      );
      return rows.filter((row): row is SavedRow => row !== null);
    },
  };
}

export type MeService = ReturnType<typeof createMeService>;
