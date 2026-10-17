import { describe, expect, it, vi } from "vitest";

import { demoUser, fixtureIds } from "@/infrastructure/mock/fixtures";
import { createMockRepositories } from "@/infrastructure/mock/repositories";

import { cleanComment, createExperienceService } from "./experience-service";
import { createRewardService } from "./reward-service";

function setup() {
  const repos = createMockRepositories();
  const invalidate = vi.fn(async () => {});
  const rewards = createRewardService({ repos });
  return {
    repos,
    invalidate,
    service: createExperienceService({ repos, cache: { invalidate }, rewards }),
  };
}

const user = { ...demoUser, id: fixtureIds.users.contract };

describe("cleanComment", () => {
  it("trims, collapses whitespace and turns blanks into null", () => {
    expect(cleanComment("  টক   মিষ্টি \n ঠিকঠাক ")).toBe("টক মিষ্টি ঠিকঠাক");
    expect(cleanComment("   ")).toBeNull();
    expect(cleanComment(null)).toBeNull();
  });

  it("cuts to the configured length by characters, not bytes", () => {
    expect([...(cleanComment("দ".repeat(900)) ?? "")]).toHaveLength(500);
  });
});

describe("experienceService.add", () => {
  it("adds an experience, updates the dish counts and refreshes the cache tags", async () => {
    const { repos, service, invalidate } = setup();
    const [dish] = await repos.places.dishes(fixtureIds.places.second);
    if (!dish) throw new Error("fixture dish missing");
    const result = await service.add(user, {
      dishId: dish.id,
      reaction: "loved",
      comment: " দারুণ ",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.isNew).toBe(true);
    expect(result.data.experience.comment).toBe("দারুণ");
    const after = await repos.dishes.byId(dish.id);
    expect(after?.experienceCount).toBe(dish.experienceCount + 1);
    expect(invalidate).toHaveBeenCalledWith(
      expect.arrayContaining([`food:${dish.foodId}`, `place:${dish.placeId}`]),
    );
  });

  it("a second reaction by the same user edits instead of adding", async () => {
    const { repos, service } = setup();
    const [dish] = await repos.places.dishes(fixtureIds.places.second);
    if (!dish) throw new Error("fixture dish missing");
    await service.add(user, { dishId: dish.id, reaction: "loved" });
    const again = await service.add(user, { dishId: dish.id, reaction: "okay" });
    expect(again.ok && again.data.isNew).toBe(false);
    const after = await repos.dishes.byId(dish.id);
    expect(after?.experienceCount).toBe(dish.experienceCount + 1);
    expect(after?.okayCount).toBe(dish.okayCount + 1);
  });

  it("creates the dish when someone eats a food at a place that did not list it", async () => {
    const { repos, service } = setup();
    const result = await service.add(user, {
      placeId: fixtureIds.places.second,
      foodId: fixtureIds.foods.kacchi,
      reaction: "loved",
    });
    expect(result.ok).toBe(true);
    const dishes = await repos.places.dishes(fixtureIds.places.second);
    expect(dishes.some((dish) => dish.foodId === fixtureIds.foods.kacchi)).toBe(true);
  });

  it("answers not_found for an unknown dish, place or food", async () => {
    const { service } = setup();
    for (const input of [
      { dishId: "nope" },
      { placeId: "nope", foodId: fixtureIds.foods.doi },
      { placeId: fixtureIds.places.sample, foodId: "nope" },
    ]) {
      const result = await service.add(user, { ...input, reaction: "loved" });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("not_found");
    }
  });
});

describe("experienceService.withdraw", () => {
  async function addOne() {
    const context = setup();
    const [dish] = await context.repos.places.dishes(fixtureIds.places.second);
    if (!dish) throw new Error("fixture dish missing");
    const added = await context.service.add(user, { dishId: dish.id, reaction: "loved" });
    if (!added.ok) throw new Error("add failed");
    return { ...context, dish, experienceId: added.data.experience.id };
  }

  it("lets a person take back their own experience, refreshing the caches", async () => {
    const { repos, service, invalidate, dish, experienceId } = await addOne();
    invalidate.mockClear();
    expect(await service.withdraw(user, experienceId)).toEqual({
      ok: true,
      data: { removed: true },
    });
    expect(await repos.experiences.byId(experienceId)).toBeNull();
    expect(invalidate).toHaveBeenCalledWith(expect.arrayContaining([`dish:${dish.id}`]));
  });

  it("takes the experience's own points back (a weekly mission bonus is paid once and stays)", async () => {
    const { repos, service, experienceId } = await addOne();
    expect((await repos.rewards.kindCounts(user.id)).experience).toBe(1);
    await service.withdraw(user, experienceId);
    expect((await repos.rewards.kindCounts(user.id)).experience ?? 0).toBe(0);
  });

  it("refuses to remove someone else's experience", async () => {
    const { service, experienceId } = await addOne();
    const other = { ...demoUser, id: "00000000-0000-4000-8000-0000000000bb" };
    expect(await service.withdraw(other, experienceId)).toMatchObject({
      ok: false,
      error: { code: "forbidden" },
    });
  });

  it("says not found for an experience that does not exist", async () => {
    const { service } = setup();
    expect(await service.withdraw(user, "nope")).toMatchObject({
      ok: false,
      error: { code: "not_found" },
    });
  });
});
