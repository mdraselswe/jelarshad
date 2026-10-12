// Daily streak (docs/00-decisions.md P15): days are Bangladesh days, so a streak does not break at 6 a.m.

const DAY_MS = 86_400_000;

/** "2026-10-12" for the calendar day this moment falls on in a zone `offsetMinutes` ahead of UTC. */
export function dayKey(date: Date, offsetMinutes: number): string {
  return new Date(date.getTime() + offsetMinutes * 60_000).toISOString().slice(0, 10);
}

function dayNumber(key: string): number {
  return Math.floor(Date.parse(`${key}T00:00:00Z`) / DAY_MS);
}

export type Streak = {
  /** Days in a row, counted to today, or to yesterday when today has no activity yet. */
  current: number;
  /** The longest run in the days given. */
  best: number;
  activeToday: boolean;
};

/**
 * `days` are the distinct day keys with at least one earning action. A run that ended yesterday still
 * counts as current: the day is not over, and nobody is punished for opening the app in the morning.
 */
export function streakOf(days: Iterable<string>, today: string): Streak {
  const numbers = [...new Set(days)].map(dayNumber).sort((a, b) => a - b);
  const todayNumber = dayNumber(today);
  const set = new Set(numbers);

  let best = 0;
  let run = 0;
  let previous: number | null = null;
  for (const n of numbers) {
    run = previous !== null && n === previous + 1 ? run + 1 : 1;
    if (run > best) best = run;
    previous = n;
  }

  const activeToday = set.has(todayNumber);
  let cursor = activeToday ? todayNumber : todayNumber - 1;
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor -= 1;
  }
  return { current, best, activeToday };
}
