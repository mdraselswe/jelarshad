import { appConfig } from "@/config/app.config";
import type { AppUser, LeaderboardEntry, PointKind, StampKind } from "@/core/domain";
import type { Repositories } from "@/core/ports";
import { badgeStatuses, type BadgeStatus } from "@/lib/gamification/badges";
import { levelFor, type LevelInfo } from "@/lib/gamification/levels";
import {
  missionProgress,
  periodStart,
  type MissionDef,
  type MissionProgress,
} from "@/lib/gamification/missions";
import { dayKey, streakOf, type Streak } from "@/lib/gamification/streak";
import {
  divisionProgress,
  nextStampSuggestion,
  type DivisionProgress,
  type NextStamp,
} from "@/lib/passport/stamps";

// Points, levels, streaks, missions and the food passport (docs/01-product-spec.md §3.11b,
// docs/00-decisions.md P15). Points are a score, never spent; the database refuses to pay the same
// action twice, and hidden content loses its points. Levels, streaks, missions and badges are
// computed from the same points history. Pure: ports only.

type Deps = { repos: Pick<Repositories, "rewards" | "districts" | "foods"> };

const DAY_MS = 86_400_000;
const { gamification } = appConfig;
const MISSIONS = gamification.missions as readonly MissionDef[];
const ZONE = {
  offsetMinutes: gamification.timeZoneOffsetMinutes,
  weekStartsOn: gamification.weekStartsOn,
};

export type NewStamp = { districtName: string; kind: StampKind };

/** A mission finished by this action (its bonus is already paid). */
export type MissionDone = { id: string; bonus: number };

/**
 * What one action earned, shown as a gold "+১০" toast and, for a first, a stamp. `levelUp` and
 * `missions` are only present when the action caused them.
 */
export type Reward = {
  points: number;
  newStamps: NewStamp[];
  levelUp?: { level: number };
  missions?: MissionDone[];
};

export const NO_REWARD: Reward = { points: 0, newStamps: [] };

/** Everything a reward was worth in XP, mission bonuses included. */
export function rewardXp(reward: Reward): number {
  return reward.points + (reward.missions?.reduce((sum, mission) => sum + mission.bonus, 0) ?? 0);
}

export function mergeRewards(...rewards: Reward[]): Reward {
  const missions = rewards.flatMap((reward) => reward.missions ?? []);
  const levels = rewards.flatMap((reward) => (reward.levelUp ? [reward.levelUp.level] : []));
  return {
    points: rewards.reduce((sum, reward) => sum + reward.points, 0),
    newStamps: rewards.flatMap((reward) => reward.newStamps),
    ...(missions.length > 0 ? { missions } : {}),
    ...(levels.length > 0 ? { levelUp: { level: Math.max(...levels) } } : {}),
  };
}

export type PassportSummary = {
  points: number;
  stamps: { districtId: number; kind: StampKind; createdAt: Date }[];
  unlockedCount: number;
  totalDistricts: number;
  divisions: DivisionProgress[];
  next: NextStamp | null;
};

/** Level, streak, missions and badges for one person (docs/00-decisions.md P15). */
export type GameProgress = {
  xp: number;
  level: LevelInfo;
  streak: Streak;
  missions: MissionProgress[];
  badges: BadgeStatus[];
  counts: { districts: number; experiences: number; places: number; discoveries: number };
};

export type Leaderboard = {
  entries: LeaderboardEntry[];
  /** Null for a visitor who is not signed in. */
  optedIn: boolean | null;
};

export function createRewardService({ repos }: Deps) {
  const lookbackStart = (now: Date) =>
    new Date(now.getTime() - gamification.activityLookbackDays * DAY_MS);

  async function progress(userId: string, now: Date = new Date()): Promise<GameProgress> {
    const [xp, stamps, events, counts] = await Promise.all([
      repos.rewards.total(userId),
      repos.rewards.stamps(userId),
      repos.rewards.events(userId, lookbackStart(now), gamification.activityEventLimit),
      repos.rewards.kindCounts(userId),
    ]);
    const visits = stamps.filter((stamp) => stamp.kind === "visit");
    const timesOf = (kind: PointKind) =>
      events.filter((event) => event.kind === kind).map((event) => event.createdAt);

    const days = events
      .filter((event) => event.kind !== "mission")
      .map((event) => dayKey(event.createdAt, ZONE.offsetMinutes));
    const streak = streakOf(days, dayKey(now, ZONE.offsetMinutes));

    const missions = missionProgress(
      MISSIONS,
      {
        experience: timesOf("experience"),
        place: timesOf("place_create"),
        district: visits.map((stamp) => stamp.createdAt),
      },
      now,
      ZONE,
    );
    const metrics = {
      districts: visits.length,
      bestStreak: streak.best,
      experiences: counts.experience ?? 0,
      places: counts.place_create ?? 0,
      discoveries: counts.discoverer ?? 0,
    };
    return {
      xp,
      level: levelFor(xp, gamification.levelThresholds),
      streak,
      missions,
      badges: badgeStatuses(gamification.badges, metrics),
      counts: {
        districts: metrics.districts,
        experiences: metrics.experiences,
        places: metrics.places,
        discoveries: metrics.discoveries,
      },
    };
  }

  /**
   * After an earning action: pay the bonus of every mission that is now complete (once per period,
   * the points table refuses repeats) and say whether the person reached a new level.
   */
  async function settle(user: AppUser, base: Reward): Promise<Reward> {
    const state = await progress(user.id);
    const missions: MissionDone[] = [];
    for (const mission of state.missions) {
      if (!mission.complete) continue;
      const paid = await repos.rewards.award({
        userId: user.id,
        kind: "mission",
        entity: "mission",
        entityId: mission.periodKey,
        points: mission.bonus,
      });
      if (paid > 0) missions.push({ id: mission.id, bonus: paid });
    }
    const gained = rewardXp({ ...base, missions });
    const after = state.xp + missions.reduce((sum, mission) => sum + mission.bonus, 0);
    const before = after - gained;
    const levelAfter = levelFor(after, gamification.levelThresholds).level;
    const levelBefore = levelFor(before, gamification.levelThresholds).level;
    return {
      ...base,
      ...(missions.length > 0 ? { missions } : {}),
      ...(levelAfter > levelBefore ? { levelUp: { level: levelAfter } } : {}),
    };
  }

  return {
    /** +10 for a new experience, and a stamp the first time someone eats in a district. */
    async forExperience(
      user: AppUser,
      input: { experienceId: string; isNew: boolean; district: { id: number; nameBn: string } },
    ): Promise<Reward> {
      if (!input.isNew) return NO_REWARD;
      const points = await repos.rewards.award({
        userId: user.id,
        kind: "experience",
        entity: "experience",
        entityId: input.experienceId,
        points: appConfig.points.experience,
        districtId: input.district.id,
      });
      const isNewStamp = await repos.rewards.unlockStamp({
        userId: user.id,
        districtId: input.district.id,
        kind: "visit",
      });
      return settle(user, {
        points,
        newStamps: isNewStamp ? [{ districtName: input.district.nameBn, kind: "visit" }] : [],
      });
    },

    /** +20 for a new place, +20 and an "আবিষ্কারক" stamp when it is the first for a famous food. */
    async forNewPlace(
      user: AppUser,
      input: {
        placeId: string;
        foodId: string;
        district: { id: number; nameBn: string };
        /** No place in this district served the food before (checked before it was created). */
        firstForFood: boolean;
      },
    ): Promise<Reward> {
      let points = await repos.rewards.award({
        userId: user.id,
        kind: "place_create",
        entity: "place",
        entityId: input.placeId,
        points: appConfig.points.place_create,
        districtId: input.district.id,
      });
      const newStamps: NewStamp[] = [];
      if (input.firstForFood) {
        const famous = (await repos.districts.fame(input.district.id)).some(
          (entry) => entry.food.id === input.foodId,
        );
        if (famous) {
          points += await repos.rewards.award({
            userId: user.id,
            kind: "discoverer",
            entity: "place",
            entityId: input.placeId,
            points: appConfig.points.discoverer,
            districtId: input.district.id,
          });
          const isNewStamp = await repos.rewards.unlockStamp({
            userId: user.id,
            districtId: input.district.id,
            kind: "discoverer",
            foodId: input.foodId,
          });
          if (isNewStamp)
            newStamps.push({ districtName: input.district.nameBn, kind: "discoverer" });
        }
      }
      return settle(user, { points, newStamps });
    },

    /** +5 for checking a fact; once per claim, however often the vote is changed. */
    async forVote(user: AppUser, claimId: string): Promise<Reward> {
      const points = await repos.rewards.award({
        userId: user.id,
        kind: "claim_vote",
        entity: "claim",
        entityId: claimId,
        points: appConfig.points.claim_vote,
      });
      return settle(user, { points, newStamps: [] });
    },

    /** +15 to the person whose suggested edit an admin accepted. */
    async forAcceptedEdit(userId: string, editId: string): Promise<number> {
      return repos.rewards.award({
        userId,
        kind: "edit_accepted",
        entity: "edit_suggestion",
        entityId: editId,
        points: appConfig.points.edit_accepted,
      });
    },

    /** Content that was hidden or removed no longer counts. */
    revokeFor(entity: "experience" | "place" | "claim" | "edit_suggestion", id: string) {
      return repos.rewards.revoke(entity, id);
    },

    /** Level, streak, missions and badges. */
    progress,

    /** The weekly board (only people who opted in) and whether this visitor is on it. */
    async leaderboard(userId: string | null, now: Date = new Date()): Promise<Leaderboard> {
      const since = periodStart(now, "week", ZONE.offsetMinutes, ZONE.weekStartsOn);
      const [entries, optedIn] = await Promise.all([
        repos.rewards.weeklyTop(since, gamification.leaderboardSize),
        userId ? repos.rewards.leaderboardOptIn(userId) : Promise.resolve(null),
      ]);
      return { entries, optedIn };
    },

    /** The weekly board of one district (only people who opted in). */
    async districtLeaderboard(
      districtId: number,
      userId: string | null,
      now: Date = new Date(),
    ): Promise<Leaderboard> {
      const since = periodStart(now, "week", ZONE.offsetMinutes, ZONE.weekStartsOn);
      const [entries, optedIn] = await Promise.all([
        repos.rewards.districtTop(districtId, since, gamification.districtBoardSize),
        userId ? repos.rewards.leaderboardOptIn(userId) : Promise.resolve(null),
      ]);
      return { entries, optedIn };
    },

    setLeaderboardOptIn(userId: string, optIn: boolean) {
      return repos.rewards.setLeaderboardOptIn(userId, optIn);
    },

    /** The passport: points, stamps, progress per division and the next stamp to go for. */
    async summary(userId: string): Promise<PassportSummary> {
      const [points, stamps, districts, fame] = await Promise.all([
        repos.rewards.total(userId),
        repos.rewards.stamps(userId),
        repos.districts.list(),
        repos.districts.allFame(),
      ]);
      const unlocked = new Set(
        stamps.filter((stamp) => stamp.kind === "visit").map((s) => s.districtId),
      );
      return {
        points,
        stamps: stamps.map(({ districtId, kind, createdAt }) => ({ districtId, kind, createdAt })),
        unlockedCount: unlocked.size,
        totalDistricts: appConfig.passport.totalDistricts,
        divisions: divisionProgress(districts, unlocked),
        next: nextStampSuggestion(
          fame.map((entry) => ({
            districtId: entry.districtId,
            food: { slug: entry.food.slug, nameBn: entry.food.nameBn },
          })),
          districts,
          unlocked,
        ),
      };
    },
  };
}

export type RewardService = ReturnType<typeof createRewardService>;
