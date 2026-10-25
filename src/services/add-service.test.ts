import { describe, expect, it, vi } from "vitest";

import { demoUser, fixtureIds } from "@/infrastructure/mock/fixtures";
import { createMockRepositories } from "@/infrastructure/mock/repositories";
import { createRateLimiter } from "@/infrastructure/shared/rate-limiter";

import { createAddService } from "./add-service";
import { createClaimService } from "./claim-service";
import { createExperienceService } from "./experience-service";
import { createRewardService } from "./reward-service";

const user = { ...demoUser, id: fixtureIds.users.contract };

function setup(limits: Record<string, number> = { food_create: 10, place_create: 10 }) {
  const repos = createMockRepositories();
  const cache = { invalidate: vi.fn(async () => {}) };
  const rewards = createRewardService({ repos });
  const experience = createExperienceService({ repos, cache, rewards });
  const rateLimiter = createRateLimiter(repos.rateLimits, limits);
  const claims = createClaimService({ repos, cache, rewards });
  return {
    repos,
    cache,
    service: createAddService({ repos, experience, claims, rewards, rateLimiter, cache }),
  };
}

const bogura = 2;

describe("addService.submit", () => {
  it("reuses an existing food and place and records the reaction", async () => {
    const { repos, service } = setup();
    const result = await service.submit(user, {
      food: { id: fixtureIds.foods.doi },
      place: { id: fixtureIds.places.second },
      reaction: "loved",
    });
    expect(result).toMatchObject({ ok: true, data: { createdFood: false, createdPlace: false } });
    const dishes = await repos.places.dishes(fixtureIds.places.second);
    expect(dishes.find((dish) => dish.foodId === fixtureIds.foods.doi)?.experienceCount).toBe(4);
  });

  it("shows the Bangla name of a place typed in English and keeps its search names", async () => {
    const { repos, service } = setup();
    const result = await service.submit(user, {
      food: { id: fixtureIds.foods.doi },
      place: {
        nameBn: "Ideal",
        otherName: "আইডিয়াল",
        searchNames: ["আইডিয়াল রেস্তোরাঁ", "ideal"],
        districtId: bogura,
        type: "restaurant",
      },
      reaction: "loved",
      confirmNewPlace: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const place = await repos.places.bySlug(result.data.placeSlug);
    expect(place).toMatchObject({ nameBn: "আইডিয়াল", nameEn: "Ideal" });
    expect(await repos.places.aliases(place?.id ?? "")).toEqual(["আইডিয়াল রেস্তোরাঁ"]);
  });

  it("creates a new food and place with clean slugs, and refreshes search and district tags", async () => {
    const { repos, service, cache } = setup();
    const result = await service.submit(user, {
      food: { nameBn: "  কটকটি " },
      place: {
        nameBn: "মহাস্থান কটকটি",
        districtId: bogura,
        type: "street_food",
        areaName: "মহাস্থানগড়",
      },
      reaction: "loved",
      pricePaid: 80,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toMatchObject({ createdFood: true, createdPlace: true });
    expect(result.data.foodSlug).toMatch(/^[a-z0-9-]+$/);
    expect(await repos.foods.bySlug(result.data.foodSlug)).toMatchObject({ nameBn: "কটকটি" });
    const place = await repos.places.bySlug(result.data.placeSlug);
    expect(place?.area?.nameBn).toBe("মহাস্থানগড়");
    expect(cache.invalidate).toHaveBeenCalledWith(
      expect.arrayContaining(["search", `district:${bogura}`]),
    );
  });

  it("does not create a second food when the name matches an existing one", async () => {
    const { service } = setup();
    const result = await service.submit(user, {
      food: { nameBn: "দই" },
      place: { id: fixtureIds.places.second },
      reaction: "okay",
    });
    expect(result).toMatchObject({ ok: true, data: { createdFood: false, foodSlug: "doi" } });
  });

  it("asks before creating a place that looks like an existing one", async () => {
    const { service } = setup();
    const draft = {
      food: { id: fixtureIds.foods.doi },
      place: { nameBn: "নমুনা দই ঘর", districtId: bogura, type: "shop" as const },
      reaction: "loved" as const,
    };
    const first = await service.submit(user, draft);
    expect(first.ok).toBe(false);
    if (!first.ok) expect(first.error.code).toBe("conflict");
    const confirmed = await service.submit(user, { ...draft, confirmNewPlace: true });
    expect(confirmed).toMatchObject({ ok: true, data: { createdPlace: true } });
  });

  it("limits how many places one person can create a day", async () => {
    const { service } = setup({ food_create: 10, place_create: 1 });
    const make = (name: string) =>
      service.submit(user, {
        food: { id: fixtureIds.foods.doi },
        place: { nameBn: name, districtId: bogura, type: "shop" },
        reaction: "loved",
      });
    expect((await make("প্রথম নতুন দোকান")).ok).toBe(true);
    const second = await make("দ্বিতীয় নতুন দোকান");
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error.code).toBe("rate_limited");
  });

  it("rejects an unknown food or place", async () => {
    const { service } = setup();
    const bad = await service.submit(user, {
      food: { id: "nope" },
      place: { id: fixtureIds.places.sample },
      reaction: "loved",
    });
    expect(bad.ok).toBe(false);
  });
});

describe("addService.suggest", () => {
  it("suggests foods and, within a district, places", async () => {
    const { service } = setup();
    expect((await service.suggest({ kind: "food", q: "doi" })).map((s) => s.nameBn)).toContain(
      "দই",
    );
    const places = await service.suggest({ kind: "place", q: "দই", districtId: bogura });
    expect(places.length).toBeGreaterThan(0);
    expect(await service.suggest({ kind: "place", q: "দই", districtId: 1 })).toEqual([]);
    expect(await service.suggest({ kind: "food", q: " " })).toEqual([]);
  });
});

describe("addService claims", () => {
  it("starts empty claims for a new place and its dish, priced from what was paid", async () => {
    const { repos, service } = setup();
    const result = await service.submit(user, {
      food: { id: fixtureIds.foods.doi },
      place: { nameBn: "একদম নতুন দোকান", districtId: bogura, type: "shop" },
      reaction: "loved",
      pricePaid: 120,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const place = await repos.places.bySlug(result.data.placeSlug);
    const placeClaims = await repos.claims.forEntity("place", place?.id ?? "");
    expect(placeClaims.map((claim) => claim.type).sort()).toEqual(["location", "place_status"]);
    const [dish] = await repos.places.dishes(place?.id ?? "");
    const dishClaims = await repos.claims.forEntity("dish", dish?.id ?? "");
    expect(dishClaims.map((claim) => claim.type).sort()).toEqual(["availability", "price"]);
    expect([...placeClaims, ...dishClaims].every((claim) => claim.status === "unverified")).toBe(
      true,
    );
    expect(dishClaims.find((claim) => claim.type === "price")?.value).toEqual({
      min: 120,
      max: 120,
    });
  });
});

describe("addService.submit with a Latin spelling", () => {
  const place = { nameBn: "নমুনা দোকান", districtId: bogura, type: "shop" as const };

  it("keeps the Latin spelling as the English name when the Bangla form was chosen", async () => {
    const { repos, service } = setup();
    const result = await service.submit(user, {
      food: { nameBn: "সালাদ", nameEn: "salad" },
      place,
      reaction: "loved",
    });
    if (!result.ok) throw new Error("expected ok");
    expect(await repos.foods.bySlug(result.data.foodSlug)).toMatchObject({
      nameBn: "সালাদ",
      nameEn: "salad",
    });
  });

  it("stores a name typed only in Latin letters as the English name too", async () => {
    const { repos, service } = setup();
    const result = await service.submit(user, {
      food: { nameBn: "fried salad" },
      place,
      reaction: "okay",
    });
    if (!result.ok) throw new Error("expected ok");
    expect(await repos.foods.bySlug(result.data.foodSlug)).toMatchObject({
      nameEn: "fried salad",
    });
  });
});
