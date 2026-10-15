import type { ContentStatus, EntityType } from "./common";
import type { MediaRef } from "./media";
import type { AppUser } from "./user";

// What people contribute: experiences, claims and votes, edits, reports, saves.

/** 😋 / 😐 / 👎 — only after "আমি খেয়েছি" (decision P6). */
export type Reaction = "loved" | "okay" | "disliked";

export type Experience = {
  id: string;
  dishId: string;
  user: Pick<AppUser, "id" | "displayName" | "avatarUrl">;
  reaction: Reaction;
  comment: string | null;
  pricePaid: number | null;
  visitedOn: Date | null;
  photos: MediaRef[];
  status: ContentStatus;
  createdAt: Date;
};

export type ClaimType = "availability" | "price" | "place_status" | "location" | "opening_hours";
export type ClaimStatus = "unverified" | "confirmed" | "mixed" | "disputed";
export type Verdict = "correct" | "partial" | "wrong";
export type WrongReason = "not_available" | "wrong_price" | "wrong_location" | "closed" | "other";

/** A checkable fact about a place or dish (decision P7/P8). */
export type Claim = {
  id: string;
  entity: Extract<EntityType, "place" | "dish">;
  entityId: string;
  type: ClaimType;
  value: Record<string, unknown>;
  status: ClaimStatus;
  counts: { correct: number; partial: number; wrong: number };
  lastConfirmedAt: Date | null;
  expiresAt: Date | null;
  /** Who added the fact; they cannot vote on it, others verify it. */
  createdBy: string | null;
};

export type ClaimVote = {
  claimId: string;
  userId: string;
  verdict: Verdict;
  reason: WrongReason | null;
  note: string | null;
  evidence: { type: "photo"; mediaId: string } | { type: "link"; url: string } | null;
};

export type ReviewStatus = "open" | "approved" | "rejected";

export type EditSuggestion = {
  id: string;
  entity: EntityType;
  entityId: string;
  field: string;
  currentValue: string | null;
  proposedValue: string;
  note: string | null;
  userId: string;
  status: ReviewStatus;
  createdAt: Date;
};

export type Report = {
  id: string;
  entity: EntityType;
  entityId: string;
  reason: string;
  note: string | null;
  userId: string;
  status: ReviewStatus;
  createdAt: Date;
};

export type SavedItem = {
  entity: Extract<EntityType, "food" | "dish" | "place">;
  entityId: string;
  kind: "want_to_try";
  createdAt: Date;
};
