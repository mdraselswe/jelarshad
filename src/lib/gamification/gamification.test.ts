import { describe, expect, it } from "vitest";

import { badgeStatuses } from "./badges";
import { levelFor } from "./levels";
import { missionProgress, periodStart } from "./missions";
import { dayKey, streakOf } from "./streak";

const THRESHOLDS = [0, 50, 150, 300] as const;

describe("levelFor", () => {
  it("starts at level 1 with nothing", () => {
    expect(levelFor(0, THRESHOLDS)).toMatchObject({ level: 1, floor: 0, ceiling: 50, toNext: 50 });
  });

  it("moves up exactly at the threshold", () => {
    expect(levelFor(49, THRESHOLDS).level).toBe(1);
    expect(levelFor(50, THRESHOLDS).level).toBe(2);
    expect(levelFor(299, THRESHOLDS).level).toBe(3);
  });

  it("reports progress inside the level", () => {
    const info = levelFor(240, THRESHOLDS);
    expect(info).toMatchObject({ level: 3, into: 90, toNext: 60 });
    expect(info.fraction).toBeCloseTo(0.6);
  });

  it("stays full at the top level", () => {
    expect(levelFor(5000, THRESHOLDS)).toMatchObject({
      level: 4,
      ceiling: null,
      toNext: 0,
      fraction: 1,
      isMax: true,
    });
  });
});

describe("streakOf", () => {
  const today = "2026-10-12";

  it("counts days in a row up to today", () => {
    expect(streakOf(["2026-10-10", "2026-10-11", "2026-10-12"], today)).toEqual({
      current: 3,
      best: 3,
      activeToday: true,
    });
  });

  it("keeps yesterday's run alive until the day ends", () => {
    expect(streakOf(["2026-10-10", "2026-10-11"], today)).toMatchObject({
      current: 2,
      activeToday: false,
    });
  });

  it("resets after a missed day but remembers the best run", () => {
    const result = streakOf(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-09"], today);
    expect(result.current).toBe(0);
    expect(result.best).toBe(3);
  });

  it("ignores duplicates and handles no days", () => {
    expect(streakOf(["2026-10-12", "2026-10-12"], today).current).toBe(1);
    expect(streakOf([], today)).toEqual({ current: 0, best: 0, activeToday: false });
  });
});

describe("dayKey", () => {
  it("uses the Bangladesh day, not the UTC day", () => {
    // 20:30 UTC on the 11th is 02:30 on the 12th in Dhaka
    expect(dayKey(new Date("2026-10-11T20:30:00Z"), 360)).toBe("2026-10-12");
    expect(dayKey(new Date("2026-10-11T17:59:00Z"), 360)).toBe("2026-10-11");
  });
});

describe("missions", () => {
  const zone = { offsetMinutes: 360, weekStartsOn: 6 };
  const now = new Date("2026-10-12T10:00:00Z"); // Monday 16:00 in Dhaka

  it("starts a week on Saturday in Dhaka time", () => {
    // Saturday 10 October 00:00 Dhaka = Friday 18:00 UTC
    expect(periodStart(now, "week", 360, 6).toISOString()).toBe("2026-10-09T18:00:00.000Z");
    expect(periodStart(now, "day", 360, 6).toISOString()).toBe("2026-10-11T18:00:00.000Z");
  });

  it("counts only this period and caps at the target", () => {
    const defs = [
      { id: "daily", period: "day", source: "experience", target: 2, bonus: 10 },
      { id: "weekly", period: "week", source: "experience", target: 3, bonus: 40 },
    ] as const;
    const progress = missionProgress(
      defs,
      {
        experience: [
          new Date("2026-10-12T08:00:00Z"), // today
          new Date("2026-10-12T09:00:00Z"), // today
          new Date("2026-10-10T08:00:00Z"), // this week
          new Date("2026-10-05T08:00:00Z"), // last week
        ],
        place: [],
        district: [],
      },
      now,
      zone,
    );
    expect(progress[0]).toMatchObject({ done: 2, complete: true, periodKey: "daily:2026-10-12" });
    expect(progress[1]).toMatchObject({ done: 3, complete: true, periodKey: "weekly:2026-10-10" });
  });
});

describe("badgeStatuses", () => {
  it("marks a badge earned at its target and keeps the value for the lock bar", () => {
    const statuses = badgeStatuses(
      [
        { id: "a", metric: "districts", target: 5 },
        { id: "b", metric: "bestStreak", target: 7 },
      ],
      { districts: 5, bestStreak: 3, experiences: 0, places: 0, discoveries: 0 },
    );
    expect(statuses[0]).toMatchObject({ earned: true, value: 5 });
    expect(statuses[1]).toMatchObject({ earned: false, value: 3 });
  });
});
