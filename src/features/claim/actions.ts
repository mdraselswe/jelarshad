"use server";

import { z } from "zod";

import { appConfig } from "@/config/app.config";
import { defineAction } from "@/infrastructure/container";

const schema = z.object({
  claimId: z.string().min(1).max(64),
  verdict: z.enum(["correct", "partial", "wrong"]),
  reason: z.enum(["not_available", "wrong_price", "wrong_location", "closed", "other"]).nullish(),
  note: z.string().max(appConfig.text.noteMax).nullish(),
  evidenceUrl: z.string().max(500).nullish(),
});

/** One vote per person per claim; voting again changes it. Signed-in only, daily limit applies. */
export const voteClaim = defineAction(
  schema,
  async (input, { services, user }) => {
    const result = await services.claims.vote(user, input);
    if (result.ok) services.analytics.track({ name: "claim_voted", claimId: input.claimId });
    return result;
  },
  { auth: true, rateLimit: "claim_vote" },
);
