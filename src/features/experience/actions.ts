"use server";

import { z } from "zod";

import { appConfig } from "@/config/app.config";
import { defineAction } from "@/infrastructure/container";

const id = z.string().min(1).max(64);

const schema = z
  .object({
    dishId: id.optional(),
    placeId: id.optional(),
    foodId: id.optional(),
    reaction: z.enum(["loved", "okay", "disliked"]),
    comment: z.string().max(appConfig.text.commentMax).nullish(),
    pricePaid: z.number().int().min(0).max(100_000).nullish(),
  })
  .refine((value) => value.dishId !== undefined || (value.placeId && value.foodId), {
    message: "dish_required",
  });

/**
 * "আমি খেয়েছি": saves (or changes) the signed-in user's reaction to a dish. Signed-out visitors get
 * `auth_required`, which the picker turns into a trip to the login page and back.
 */
export const addExperience = defineAction(
  schema,
  async (input, { services, user }) => {
    const ref =
      input.dishId !== undefined
        ? { dishId: input.dishId }
        : { placeId: input.placeId ?? "", foodId: input.foodId ?? "" };
    const result = await services.experience.add(user, {
      ...ref,
      reaction: input.reaction,
      comment: input.comment,
      pricePaid: input.pricePaid,
    });
    if (!result.ok) return result;
    services.analytics.track({
      name: "experience_added",
      dishId: input.dishId ?? input.placeId ?? "",
    });
    return { ok: true as const, data: { isNew: result.data.isNew, reward: result.data.reward } };
  },
  { auth: true, rateLimit: "experience" },
);
