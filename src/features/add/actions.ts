"use server";

import { z } from "zod";

import { appConfig } from "@/config/app.config";
import { defineAction } from "@/infrastructure/container";
import { PLACE_TYPES } from "@/features/search/search-params";

const name = z.string().trim().min(1).max(appConfig.text.nameMax);
const reaction = z.enum(["loved", "okay", "disliked"]);

const suggestSchema = z.object({
  kind: z.enum(["food", "place"]),
  q: z.string().max(appConfig.search.maxQueryLength),
  districtId: z.number().int().positive().optional(),
});

/** Typing help for the add form: public data, so no login or limit (search itself has none). */
export const suggestForAdd = defineAction(suggestSchema, async (input, { services }) => ({
  ok: true as const,
  data: await services.add.suggest(input),
}));

const similarSchema = z.object({ nameBn: name, districtId: z.number().int().positive() });

/** "এটাই কি?": places in the district that look like the typed name. */
export const findSimilarPlaces = defineAction(
  similarSchema,
  async (input, { services }) => ({
    ok: true as const,
    data: await services.add.similarPlaces(input.nameBn, input.districtId),
  }),
  { auth: true },
);

const submitSchema = z.object({
  food: z.union([
    z.object({ id: z.string().min(1).max(64) }),
    z.object({ nameBn: name, nameEn: name.optional() }),
  ]),
  place: z.union([
    z.object({ id: z.string().min(1).max(64) }),
    z.object({
      nameBn: name,
      otherName: z.string().trim().max(appConfig.text.nameMax).nullish(),
      searchNames: z.array(z.string().trim().max(appConfig.text.nameMax)).max(5).optional(),
      districtId: z.number().int().positive(),
      type: z.enum(PLACE_TYPES),
      areaName: z.string().trim().max(appConfig.text.nameMax).nullish(),
      location: z
        .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
        .nullish(),
      phone: z.string().trim().max(30).nullish(),
      website: z.string().trim().max(200).nullish(),
      hoursText: z.string().trim().max(120).nullish(),
    }),
  ]),
  reaction,
  comment: z.string().max(appConfig.text.commentMax).nullish(),
  pricePaid: z.number().int().min(0).max(100_000).nullish(),
  confirmNewPlace: z.boolean().optional(),
});

/** The whole add flow in one call: food, place, reaction. Counts against the daily experience limit. */
export const submitAdd = defineAction(
  submitSchema,
  async (input, { services, user }) => {
    const result = await services.add.submit(user, input);
    if (result.ok) {
      services.analytics.track({ name: "experience_added", dishId: result.data.placeSlug });
      if (result.data.createdPlace) {
        services.analytics.track({ name: "place_added", placeId: result.data.placeSlug });
      }
    }
    return result;
  },
  { auth: true, rateLimit: "experience" },
);
