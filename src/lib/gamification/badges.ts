// Badges (docs/00-decisions.md P15): derived from counts we already keep, so there is nothing to
// migrate when a badge is added, and a revoked action simply stops counting.

export type BadgeMetric = "districts" | "bestStreak" | "experiences" | "places" | "discoveries";

export type BadgeDef = {
  id: string;
  metric: BadgeMetric;
  target: number;
};

export type BadgeMetrics = Record<BadgeMetric, number>;

export type BadgeStatus = BadgeDef & { value: number; earned: boolean };

export function badgeStatuses(defs: readonly BadgeDef[], metrics: BadgeMetrics): BadgeStatus[] {
  return defs.map((def) => {
    const value = metrics[def.metric];
    return { ...def, value: Math.min(value, def.target), earned: value >= def.target };
  });
}
