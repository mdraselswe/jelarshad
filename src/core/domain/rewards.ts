// Food passport and points (docs/01-product-spec.md §3.11b): a score and a stamp book, never spent.

export type PointKind =
  "experience" | "place_create" | "discoverer" | "claim_vote" | "edit_accepted" | "mission";

/** What the points were for; revoking an entity takes back everything awarded for it. */
export type RewardEntity = "experience" | "place" | "claim" | "edit_suggestion" | "mission";

/** One earning action (kept for the streak and the missions). */
export type PointEvent = {
  kind: PointKind;
  entityId: string;
  points: number;
  createdAt: Date;
};

/** One person on the weekly board (only people who opted in). */
export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  /** The Google picture saved at sign-in, when there is one. */
  avatarUrl: string | null;
  xp: number;
};

/** The contributors page: the same people ranked over three periods. */
export type LeaderboardPage = {
  week: LeaderboardEntry[];
  month: LeaderboardEntry[];
  all: LeaderboardEntry[];
  optedIn: boolean | null;
};

export type StampKind = "visit" | "discoverer";

export type Stamp = {
  districtId: number;
  kind: StampKind;
  /** The food that earned it ("আবিষ্কারক" stamps), if any. */
  foodId: string | null;
  createdAt: Date;
};
