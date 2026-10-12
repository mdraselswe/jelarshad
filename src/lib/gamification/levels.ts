// Levels (docs/00-decisions.md P15): XP is the points total, so a level is a pure function of it.

export type LevelInfo = {
  /** 1-based. */
  level: number;
  xp: number;
  /** XP where this level starts. */
  floor: number;
  /** XP where the next level starts; null at the top level. */
  ceiling: number | null;
  /** XP earned inside this level. */
  into: number;
  /** XP still needed for the next level; 0 at the top level. */
  toNext: number;
  /** 0–1 progress inside this level (1 at the top level). */
  fraction: number;
  isMax: boolean;
};

/** `thresholds[i]` is the XP at which level `i + 1` starts; the first is 0. */
export function levelFor(xp: number, thresholds: readonly number[]): LevelInfo {
  const safe = Math.max(0, Math.floor(xp));
  let index = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (safe >= (thresholds[i] ?? Infinity)) index = i;
  }
  const floor = thresholds[index] ?? 0;
  const ceiling = thresholds[index + 1] ?? null;
  const into = safe - floor;
  const span = ceiling === null ? 0 : ceiling - floor;
  return {
    level: index + 1,
    xp: safe,
    floor,
    ceiling,
    into,
    toNext: ceiling === null ? 0 : ceiling - safe,
    fraction: ceiling === null || span <= 0 ? 1 : Math.min(1, into / span),
    isMax: ceiling === null,
  };
}
