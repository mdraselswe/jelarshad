import { appConfig } from "@/config/app.config";
import type { AppUser, Claim, ClaimStatus, Verdict, WrongReason } from "@/core/domain";
import type { CacheInvalidator, Repositories } from "@/core/ports";
import { claimExpiresAt, computeClaimStatus } from "@/lib/claims/status";
import { fail, ok, type Result } from "@/lib/result";

import type { Reward, RewardService } from "./reward-service";

// "তথ্য ঠিক আছে?": community votes on a fact about a place or dish (decisions P7/P8).
// The status rules live in lib/claims/status.ts; this service applies them. Pure: ports only.

type Deps = {
  repos: Pick<Repositories, "claims" | "dishes">;
  cache: CacheInvalidator;
  rewards: RewardService;
  now?: () => Date;
};

export type VoteInput = {
  claimId: string;
  verdict: Verdict;
  reason?: WrongReason | null | undefined;
  note?: string | null | undefined;
  /** An http(s) link as evidence; photos arrive with Phase 5. */
  evidenceUrl?: string | null | undefined;
};

export type VoteOutcome = { status: ClaimStatus; confirmedNow: boolean; reward: Reward };

const cleanNote = (value: string | null | undefined) => {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  return text === "" ? null : [...text].slice(0, appConfig.text.noteMax).join("");
};

/** Only plain http(s) links are kept as evidence. */
export function cleanEvidenceUrl(value: string | null | undefined): string | null {
  const text = (value ?? "").trim();
  if (text === "" || text.length > 500) return null;
  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function createClaimService({ repos, cache, rewards, now = () => new Date() }: Deps) {
  /** The cache tags that show this claim: its place, or for a dish its place and food. */
  async function tagsFor(claim: Claim): Promise<(`place:${string}` | `food:${string}`)[]> {
    if (claim.entity === "place") return [`place:${claim.entityId}`];
    const dish = await repos.dishes.byId(claim.entityId);
    return dish ? [`place:${dish.placeId}`, `food:${dish.foodId}`] : [];
  }

  return {
    async vote(user: AppUser, input: VoteInput): Promise<Result<VoteOutcome>> {
      const before = await repos.claims.byId(input.claimId);
      if (!before) return fail("not_found");
      // Whoever added a fact cannot confirm it themselves; verifying is for other people.
      if (before.createdBy === user.id) return fail("forbidden");

      const wrongish = input.verdict !== "correct";
      const evidenceUrl = cleanEvidenceUrl(input.evidenceUrl);
      const after = await repos.claims.vote({
        claimId: before.id,
        userId: user.id,
        verdict: input.verdict,
        reason: wrongish ? (input.reason ?? "other") : null,
        note: cleanNote(input.note),
        evidence: wrongish && evidenceUrl ? { type: "link", url: evidenceUrl } : null,
      });

      const status = computeClaimStatus(after.counts, appConfig.claims, before.status);
      // A check mark on a confirmed claim restarts its freshness clock; this clears the hourglass.
      const confirmedNow = input.verdict === "correct" && status === "confirmed";
      const current = now();
      await repos.claims.saveStatus(before.id, {
        status,
        lastConfirmedAt: confirmedNow ? current : after.lastConfirmedAt,
        expiresAt: confirmedNow ? claimExpiresAt(before.type, current) : after.expiresAt,
      });

      await cache.invalidate(await tagsFor(before));
      return ok({ status, confirmedNow, reward: await rewards.forVote(user, before.id) });
    },

    /** Starts the claims a new place or dish should carry; existing ones are left untouched. */
    async seed(
      userId: string,
      target: { entity: Claim["entity"]; entityId: string },
      claims: { type: Claim["type"]; value: Record<string, unknown> }[],
    ): Promise<void> {
      for (const claim of claims) {
        await repos.claims.ensure({ ...target, ...claim, createdBy: userId });
      }
    },
  };
}

export type ClaimService = ReturnType<typeof createClaimService>;
