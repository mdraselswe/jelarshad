// A new stamp or level deserves more than a toast (docs/00-decisions.md P15). Client code announces
// the moment here; the overlay (features/reward/reward-moment) is loaded after hydration, so a moment
// announced before it is ready waits and is shown as soon as it subscribes.

export type Moment = {
  /** Points of the action, without mission bonuses. */
  points: number;
  /** Bonus XP from missions finished by the action. */
  bonus: number;
  /** A level reached by the action. */
  level: number | null;
  /** The district of a new stamp, if any. */
  stamp: { districtName: string; kind: "visit" | "discoverer" } | null;
  /** What was done, in words ("অভিজ্ঞতা জমা হয়েছে"). */
  plain: string;
};

type Listener = (moment: Moment) => void;

let listener: Listener | null = null;
let waiting: Moment | null = null;

export function announceMoment(moment: Moment): void {
  if (listener) listener(moment);
  else waiting = moment;
}

/** Returns an unsubscribe function. A moment that was waiting is delivered right away. */
export function subscribeMoment(next: Listener): () => void {
  listener = next;
  if (waiting) {
    const moment = waiting;
    waiting = null;
    next(moment);
  }
  return () => {
    if (listener === next) listener = null;
  };
}
