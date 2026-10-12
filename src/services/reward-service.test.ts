import { describe, expect, it, vi } from "vitest";

import { demoUser, fixtureIds } from "@/infrastructure/mock/fixtures";
import { createMockRepositories } from "@/infrastructure/mock/repositories";
import { createRateLimiter } from "@/infrastructure/shared/rate-limiter";

import { createAddService } from "./add-service";
import { createClaimService } from "./claim-service";
import { createExperienceService } from "./experience-service";
import { createRewardService, mergeRewards, NO_REWARD } from "./reward-service";

const user = { ...demoUser, id: fixtureIds.users.contract };

function setup() {
  const repos = createMockRepositories();
  const cache = { invalidate: vi.fn(async () => {}) };
  const rewards = createRewardService({ repos });
  const experience = createExperienceService({ repos, cache, rewards });
  const claims = createClaimService({ repos, cache, rewards });
  const rateLimiter = createRateLimiter(repos.rateLimits, { food_create: 10, place_create: 10 });
  const add = createAddService({ repos, experience, claims, rewards, rateLimiter, cache });
  return { repos, rewards, experience, add };
}

describe("points for experiences", () => {
  it("pays +10 and a stamp for the first experience in a district, then only the stamp once", async () => {
    const { experience, rewards } = setup();
    const first = await experience.add(user, {
      placeId: fixtureIds.places.second,
      foodId: fixtureIds.foods.doi,
      reaction: "loved",
    });
    expect(first.ok && first.data.reward).toEqual({
      points: 10,
      newStamps: [{ districtName: "বগুড়া", kind: "visit" }],
      // the first district of the week also completes the weekly district mission
      missions: [{ id: "weekly_districts", bonus: 30 }],
    });
    // a second dish in the same district: points again, but the stamp is already in the book
    const second = await experience.add(user, {
      placeId: fixtureIds.places.sample,
      foodId: fixtureIds.foods.doi,
      reaction: "okay",
    });
    // the second experience of the day completes the daily mission
    expect(second.ok && second.data.reward).toEqual({
      points: 10,
      newStamps: [],
      missions: [{ id: "daily_experiences", bonus: 10 }],
      // 10 + 30 + 10 + 10 = 60 XP: level 2 starts at 50
      levelUp: { level: 2 },
    });
    expect((await rewards.summary(user.id)).unlockedCount).toBe(1);
  });

  it("never pays the same experience twice when someone changes their mind", async () => {
    const { experience, rewards } = setup();
    const input = { placeId: fixtureIds.places.second, foodId: fixtureIds.foods.doi };
    await experience.add(user, { ...input, reaction: "loved" });
    const edit = await experience.add(user, { ...input, reaction: "okay" });
    expect(edit.ok && edit.data.reward).toEqual(NO_REWARD);
    // 10 for the experience + 30 for the weekly district mission, and nothing for the edit
    expect((await rewards.summary(user.id)).points).toBe(40);
  });
});

describe("points for new places", () => {
  it("pays +20 for a new place and +20 with an আবিষ্কারক stamp for the first place of a famous food", async () => {
    const { add, rewards } = setup();
    // Natore is famous for কাঁচাগোল্লা and has no place that serves it yet
    const result = await add.submit(user, {
      food: { id: fixtureIds.foods.kachagolla },
      place: { nameBn: "নাটোরের প্রথম মিষ্টির দোকান", districtId: 4, type: "shop" },
      reaction: "loved",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.reward.points).toBe(10 + 20 + 20);
    expect(result.data.reward.newStamps.map((stamp) => stamp.kind).sort()).toEqual([
      "discoverer",
      "visit",
    ]);
    // 50 for the actions + 30 (weekly district) + 25 (weekly place) mission bonuses
    expect((await rewards.summary(user.id)).points).toBe(105);
  });

  it("does not pay the discoverer bonus when the district already serves the food", async () => {
    const { add } = setup();
    const result = await add.submit(user, {
      food: { id: fixtureIds.foods.doi },
      place: { nameBn: "আরেকটি নতুন দইয়ের দোকান", districtId: 2, type: "shop" },
      reaction: "loved",
    });
    expect(result.ok && result.data.reward.points).toBe(10 + 20);
  });
});

describe("points for checking facts", () => {
  it("pays +5 once per claim, however often the vote is changed", async () => {
    const { repos } = setup();
    const rewards = createRewardService({ repos });
    const claim = await repos.claims.ensure({
      entity: "place",
      entityId: fixtureIds.places.second,
      type: "price",
      value: {},
      createdBy: user.id,
    });
    expect((await rewards.forVote(user, claim.id)).points).toBe(5);
    expect((await rewards.forVote(user, claim.id)).points).toBe(0);
  });
});

describe("revoking points", () => {
  it("takes back what hidden content earned", async () => {
    const { experience, rewards } = setup();
    const added = await experience.add(user, {
      placeId: fixtureIds.places.second,
      foodId: fixtureIds.foods.doi,
      reaction: "loved",
    });
    if (!added.ok) throw new Error("setup failed");
    expect(await rewards.revokeFor("experience", added.data.experience.id)).toBe(10);
    // the mission bonus stays: it was earned by a district stamp, which is kept
    expect((await rewards.summary(user.id)).points).toBe(30);
    expect(await rewards.revokeFor("experience", added.data.experience.id)).toBe(0);
  });
});

describe("passport summary", () => {
  it("shows progress per division and the next stamp to go for", async () => {
    const { experience, rewards } = setup();
    await experience.add(user, {
      placeId: fixtureIds.places.second,
      foodId: fixtureIds.foods.doi,
      reaction: "loved",
    });
    const summary = await rewards.summary(user.id);
    expect(summary).toMatchObject({ unlockedCount: 1, totalDistricts: 64 });
    expect(summary.divisions.find((division) => division.name === "রাজশাহী")).toMatchObject({
      unlocked: 1,
    });
    // Bogura is unlocked, so the suggestion is the next district with a famous food
    expect(summary.next?.district.slug).toBe("chattogram");
  });

  it("merges several rewards", () => {
    expect(
      mergeRewards(
        { points: 10, newStamps: [{ districtName: "ক", kind: "visit" }] },
        { points: 20, newStamps: [] },
      ),
    ).toEqual({ points: 30, newStamps: [{ districtName: "ক", kind: "visit" }] });
  });
});

describe("levels, streak and missions", () => {
  it("starts at level 1 with nothing done", async () => {
    const { rewards } = setup();
    const progress = await rewards.progress(user.id);
    expect(progress.xp).toBe(0);
    expect(progress.level.level).toBe(1);
    expect(progress.streak).toMatchObject({ current: 0, activeToday: false });
    expect(progress.missions.every((mission) => !mission.complete)).toBe(true);
    expect(progress.badges.every((badge) => !badge.earned)).toBe(true);
  });

  it("counts today as a streak day and earns the first stamp badge", async () => {
    const { experience, rewards } = setup();
    await experience.add(user, {
      placeId: fixtureIds.places.second,
      foodId: fixtureIds.foods.doi,
      reaction: "loved",
    });
    const progress = await rewards.progress(user.id);
    expect(progress.streak).toMatchObject({ current: 1, best: 1, activeToday: true });
    expect(progress.badges.find((badge) => badge.id === "first_stamp")?.earned).toBe(true);
    expect(progress.counts).toMatchObject({ districts: 1, experiences: 1 });
  });

  it("pays a mission bonus once and reports a level-up when XP crosses a threshold", async () => {
    const { experience, rewards } = setup();
    // 10 + 30 (weekly district) = 40 XP: still level 1 (level 2 starts at 50)
    const first = await experience.add(user, {
      placeId: fixtureIds.places.second,
      foodId: fixtureIds.foods.doi,
      reaction: "loved",
    });
    expect(first.ok && first.data.reward.levelUp).toBeUndefined();
    // +10 and the daily mission +10 = 60 XP: level 2
    const second = await experience.add(user, {
      placeId: fixtureIds.places.sample,
      foodId: fixtureIds.foods.doi,
      reaction: "okay",
    });
    expect(second.ok && second.data.reward.levelUp).toEqual({ level: 2 });
    expect((await rewards.progress(user.id)).level.level).toBe(2);
  });

  it("lists only people who opted in to the weekly board", async () => {
    const { experience, rewards } = setup();
    await experience.add(user, {
      placeId: fixtureIds.places.second,
      foodId: fixtureIds.foods.doi,
      reaction: "loved",
    });
    expect((await rewards.leaderboard(user.id)).entries).toEqual([]);
    await rewards.setLeaderboardOptIn(user.id, true);
    const board = await rewards.leaderboard(user.id);
    expect(board.optedIn).toBe(true);
    expect(board.entries).toHaveLength(1);
    expect(board.entries[0]?.xp).toBe(40);
    await rewards.setLeaderboardOptIn(user.id, false);
    expect((await rewards.leaderboard(user.id)).entries).toEqual([]);
  });
});
