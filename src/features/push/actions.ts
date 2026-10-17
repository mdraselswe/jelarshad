"use server";

import { z } from "zod";

import { defineAction } from "@/infrastructure/container";

const subscription = z.object({
  endpoint: z.string().url().max(1000),
  p256dh: z.string().min(1).max(200),
  auth: z.string().min(1).max(100),
});

/** Allows streak reminders on this device. */
export const subscribePush = defineAction(
  subscription,
  async (input, { services, user }) => services.push.subscribe(user.id, input),
  { auth: true },
);

/** Turns reminders off on this device. */
export const unsubscribePush = defineAction(
  z.object({ endpoint: z.string().url().max(1000) }),
  async (input, { services }) => services.push.unsubscribe(input.endpoint),
  { auth: true },
);
