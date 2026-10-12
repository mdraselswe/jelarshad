// Missions (docs/00-decisions.md P15): a daily and a few weekly goals, counted from what the person
// already did. Nothing is stored except the bonus payout, which the points table makes once-only.

import { dayKey } from "./streak";

export type MissionSource = "experience" | "place" | "district";
export type MissionPeriod = "day" | "week";

export type MissionDef = {
  id: string;
  period: MissionPeriod;
  source: MissionSource;
  target: number;
  /** XP paid once when the target is reached inside the period. */
  bonus: number;
};

export type MissionProgress = MissionDef & {
  done: number;
  complete: boolean;
  /** Unique within a person for this mission and period: the payout's entity id. */
  periodKey: string;
};

export type ActivityTimes = Record<MissionSource, Date[]>;

/** Start (UTC instant) of the day or week that contains `now`, in a zone `offsetMinutes` ahead of UTC. */
export function periodStart(
  now: Date,
  period: MissionPeriod,
  offsetMinutes: number,
  weekStartsOn: number,
): Date {
  const local = new Date(now.getTime() + offsetMinutes * 60_000);
  const midnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  const back = period === "day" ? 0 : (local.getUTCDay() - weekStartsOn + 7) % 7;
  return new Date(midnight - back * 86_400_000 - offsetMinutes * 60_000);
}

export function missionProgress(
  defs: readonly MissionDef[],
  activity: ActivityTimes,
  now: Date,
  zone: { offsetMinutes: number; weekStartsOn: number },
): MissionProgress[] {
  return defs.map((def) => {
    const start = periodStart(now, def.period, zone.offsetMinutes, zone.weekStartsOn);
    const done = activity[def.source].filter((at) => at >= start && at <= now).length;
    return {
      ...def,
      done: Math.min(done, def.target),
      complete: done >= def.target,
      periodKey: `${def.id}:${dayKey(new Date(start.getTime() + 1), zone.offsetMinutes)}`,
    };
  });
}
