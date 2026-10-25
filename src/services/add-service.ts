import { appConfig } from "@/config/app.config";
import type { AppUser, Place, PlaceType, Reaction } from "@/core/domain";
import type { CacheInvalidator, RateLimiter, Repositories } from "@/core/ports";
import { fail, ok, type Result } from "@/lib/result";
import { cleanHours, cleanPhone, cleanWebsite } from "@/lib/place-contact";
import { slugify } from "@/lib/text/slug";
import { isLatinText } from "@/lib/text/to-bangla";
import { toSearchKey, toSearchQuery } from "@/lib/text/normalize";

import type { ClaimService } from "./claim-service";
import { matchArea } from "./area-match";
import { cleanSearchNames, placeNames } from "./place-names";
import type { ExperienceService } from "./experience-service";
import { mergeRewards, NO_REWARD, type Reward, type RewardService } from "./reward-service";

// The add flow (docs/01-product-spec.md §3.7): "what did you eat, where, how was it" in one
// submission, creating the food and/or place when they are new. Pure: ports only.

type Deps = {
  repos: Pick<Repositories, "foods" | "places" | "search" | "districts">;
  experience: ExperienceService;
  claims: ClaimService;
  rewards: RewardService;
  rateLimiter: RateLimiter;
  cache: CacheInvalidator;
};

export type NewPlaceInput = {
  nameBn: string;
  /** The same name in the other script ("Ideal" for "আইডিয়াল", or the Bangla of an English name). */
  otherName?: string | null | undefined;
  /** Extra names people search the place by (a nickname, an old name). */
  searchNames?: string[] | undefined;
  districtId: number;
  type: PlaceType;
  areaName?: string | null | undefined;
  location?: { lat: number; lng: number } | null | undefined;
  phone?: string | null | undefined;
  website?: string | null | undefined;
  hoursText?: string | null | undefined;
};

export type AddInput = {
  /** An existing food, or a new one (with the Latin spelling it was typed in, if any). */
  food: { id: string } | { nameBn: string; nameEn?: string | undefined };
  place: { id: string } | NewPlaceInput;
  reaction: Reaction;
  comment?: string | null | undefined;
  pricePaid?: number | null | undefined;
  /** The person saw similar places and still wants a new one. */
  confirmNewPlace?: boolean | undefined;
};

export type AddResult = {
  experienceId: string;
  reward: Reward;
  foodSlug: string;
  placeSlug: string;
  createdFood: boolean;
  createdPlace: boolean;
};

export type Suggestion = { id: string; nameBn: string; meta: string | null };

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

async function freeSlug(base: string, exists: (slug: string) => Promise<boolean>) {
  const root = base || "item";
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export function createAddService({ repos, experience, claims, rewards, rateLimiter, cache }: Deps) {
  /**
   * The neighbourhood a person typed: an existing one when the name matches (see matchArea), with
   * the rest of the text as the address; otherwise a new neighbourhood of that name.
   */
  async function resolveArea(
    districtId: number,
    typed: string | null | undefined,
  ): Promise<{ areaId: number | null; areaName: string | null; address: string | null }> {
    const text = clean(typed ?? "").slice(0, appConfig.text.nameMax);
    if (text === "") return { areaId: null, areaName: null, address: null };
    const { area, rest } = matchArea(await repos.districts.areasOf(districtId, 1000), text);
    if (area) return { areaId: area.id, areaName: null, address: rest };
    return { areaId: null, areaName: text, address: null };
  }

  return {
    /** Foods or places matching what the person is typing, with ids for the form. */
    async suggest(input: {
      kind: "food" | "place";
      q: string;
      districtId?: number | undefined;
    }): Promise<Suggestion[]> {
      const query = toSearchQuery(clean(input.q).slice(0, appConfig.search.maxQueryLength));
      if (query.key === "") return [];
      const page = await repos.search.search(query, { limit: 20 });
      const out: Suggestion[] = [];
      for (const hit of page.items) {
        if (input.kind === "food" && hit.kind === "food") {
          out.push({ id: hit.food.id, nameBn: hit.food.nameBn, meta: null });
        }
        if (input.kind === "place" && hit.kind === "place") {
          if (input.districtId !== undefined && hit.place.district.id !== input.districtId)
            continue;
          out.push({
            id: hit.place.id,
            nameBn: hit.place.nameBn,
            meta: [hit.place.area?.nameBn, hit.place.district.nameBn].filter(Boolean).join(", "),
          });
        }
      }
      return out.slice(0, appConfig.search.suggestionsPerGroup * 2);
    },

    /** Existing places in the district that look like the typed one (duplicate check). */
    async similarPlaces(nameBn: string, districtId: number): Promise<Suggestion[]> {
      const places = await repos.places.similar(clean(nameBn), districtId);
      return places.map((place) => ({
        id: place.id,
        nameBn: place.nameBn,
        meta: [place.area?.nameBn, place.district.nameBn].filter(Boolean).join(", "),
      }));
    },

    async submit(user: AppUser, input: AddInput): Promise<Result<AddResult>> {
      // Food: an existing one, a near-identical existing name, or a new one.
      let foodId: string;
      let foodSlug: string;
      let createdFood = false;
      if ("id" in input.food) {
        const food = await repos.foods.byId(input.food.id);
        if (!food) return fail("not_found");
        foodId = food.id;
        foodSlug = food.slug;
      } else {
        const nameBn = clean(input.food.nameBn).slice(0, appConfig.text.nameMax);
        if (nameBn === "") return fail("validation", { fields: { food: "required" } });
        const found = await repos.search.search(toSearchQuery(nameBn), { limit: 10 });
        const same = found.items.find(
          (hit) => hit.kind === "food" && toSearchKey(hit.food.nameBn) === toSearchKey(nameBn),
        );
        if (same && same.kind === "food") {
          foodId = same.food.id;
          foodSlug = same.food.slug;
        } else {
          const limit = await rateLimiter.consume(user.id, "food_create");
          if (!limit.allowed) return fail("rate_limited", { retryAfter: limit.retryAfter });
          const slug = await freeSlug(
            slugify(nameBn),
            async (s) => (await repos.foods.bySlug(s)) !== null,
          );
          // Typed in Latin letters: keep that spelling as the English name (it is searchable too).
          const typedEn = clean(input.food.nameEn ?? "").slice(0, appConfig.text.nameMax);
          const nameEn = typedEn !== "" ? typedEn : isLatinText(nameBn) ? nameBn : null;
          const food = await repos.foods.create({ nameBn, nameEn, slug }, user.id);
          foodId = food.id;
          foodSlug = food.slug;
          createdFood = true;
        }
      }

      // Place: an existing one, or a new one after the duplicate check.
      let place: Pick<Place, "id" | "slug" | "district">;
      let createdPlace = false;
      // Checked before the place exists: is this the first place in the district to serve the food?
      let firstForFood = false;
      if ("id" in input.place) {
        const existing = await repos.places.byId(input.place.id);
        if (!existing) return fail("not_found");
        place = existing;
      } else {
        const draft = input.place;
        const names = placeNames(draft.nameBn, draft.otherName);
        const nameBn = names.nameBn;
        if (nameBn === "") return fail("validation", { fields: { place: "required" } });
        const searchNames = cleanSearchNames(
          [...names.extra, ...(draft.searchNames ?? [])],
          [names.nameBn, names.nameEn],
        );
        if (searchNames === null) return fail("validation", { fields: { place: "profanity" } });
        if (!input.confirmNewPlace) {
          const similar = await repos.places.similar(nameBn, draft.districtId);
          if (similar.length > 0) return fail("conflict");
        }
        firstForFood =
          (await repos.foods.topDishes(foodId, { districtId: draft.districtId, limit: 1 })).items
            .length === 0;
        const limit = await rateLimiter.consume(user.id, "place_create");
        if (!limit.allowed) return fail("rate_limited", { retryAfter: limit.retryAfter });
        const slug = await freeSlug(
          slugify(nameBn),
          async (s) => (await repos.places.bySlug(s)) !== null,
        );
        const area = await resolveArea(draft.districtId, draft.areaName);
        place = await repos.places.create(
          {
            nameBn,
            nameEn: names.nameEn,
            type: draft.type,
            districtId: draft.districtId,
            areaId: area.areaId,
            areaName: area.areaName,
            address: area.address,
            location: draft.location ?? null,
            phone: cleanPhone(draft.phone),
            website: cleanWebsite(draft.website),
            hoursText: cleanHours(draft.hoursText),
            slug,
          },
          user.id,
        );
        for (const name of searchNames) await repos.places.addAlias(place.id, name.alias, name.key);
        createdPlace = true;
      }

      const saved = await experience.add(user, {
        placeId: place.id,
        foodId,
        reaction: input.reaction,
        comment: input.comment,
        pricePaid: input.pricePaid,
      });
      if (!saved.ok) return saved;

      // Claims the community can now confirm or dispute (decision P7): created empty, never
      // pre-confirmed. The price claim starts from what this person paid.
      if (createdPlace) {
        await claims.seed(user.id, { entity: "place", entityId: place.id }, [
          { type: "place_status", value: { open: true } },
          { type: "location", value: { districtId: place.district.id } },
        ]);
      }
      await claims.seed(user.id, { entity: "dish", entityId: saved.data.dish.id }, [
        { type: "availability", value: { available: true } },
        ...(input.pricePaid
          ? [{ type: "price" as const, value: { min: input.pricePaid, max: input.pricePaid } }]
          : []),
      ]);

      await cache.invalidate([
        "search",
        `district:${place.district.id}`,
        `food:${foodId}`,
        `place:${place.id}`,
      ]);
      const placeReward: Reward = createdPlace
        ? await rewards.forNewPlace(user, {
            placeId: place.id,
            foodId,
            district: { id: place.district.id, nameBn: place.district.nameBn },
            firstForFood,
          })
        : NO_REWARD;
      return ok({
        reward: mergeRewards(saved.data.reward, placeReward),
        experienceId: saved.data.experience.id,
        foodSlug,
        placeSlug: place.slug,
        createdFood,
        createdPlace,
      });
    },
  };
}

export type AddService = ReturnType<typeof createAddService>;
