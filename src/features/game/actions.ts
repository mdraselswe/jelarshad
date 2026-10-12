"use server";

import { z } from "zod";

import { defineAction } from "@/infrastructure/container";
import { ok } from "@/lib/result";

/** Show or hide the signed-in person's name on the weekly board (off by default). */
export const setLeaderboardOptIn = defineAction(
  z.object({ optIn: z.boolean() }),
  async (input, { services, user }) => {
    await services.rewards.setLeaderboardOptIn(user.id, input.optIn);
    return ok({ optIn: input.optIn });
  },
  { auth: true },
);
