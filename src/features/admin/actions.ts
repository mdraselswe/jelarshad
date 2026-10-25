"use server";

import { z } from "zod";

import { defineAction } from "@/infrastructure/container";
import { fail, ok, type Result } from "@/lib/result";

const id = z.string().min(1).max(64);
const entity = z.enum(["place", "food", "dish", "experience"]);

/** One admin action at a time; the kind says which (all of them need the admin role). */
const schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("report"),
    id,
    decision: z.enum(["dismiss", "hide"]),
    entity,
    entityId: id,
  }),
  z.object({ kind: z.literal("edit"), id, decision: z.enum(["approve", "reject"]) }),
  z.object({ kind: z.literal("merge"), fromId: id, intoSlug: z.string().min(1).max(120) }),
  z.object({ kind: z.literal("merge-food"), fromId: id, intoId: id }),
  z.object({ kind: z.enum(["hide", "restore"]), entity, entityId: id }),
  z.object({ kind: z.literal("ban"), userId: id, banned: z.boolean() }),
  z.object({
    kind: z.literal("fame-set"),
    districtId: z.number().int().positive(),
    foodSlug: z.string().min(1).max(120),
    noteBn: z.string().max(200).nullable(),
  }),
  z.object({ kind: z.literal("fame-remove"), districtId: z.number().int().positive(), foodId: id }),
  z.object({ kind: z.literal("purge-rate-events") }),
  z.object({ kind: z.literal("clean-media") }),
  z.object({ kind: z.literal("purge-insights") }),
  z.object({
    kind: z.literal("place-update"),
    placeId: id,
    nameBn: z.string().max(120).optional(),
    nameEn: z.string().max(120).optional(),
    searchNames: z.array(z.string().max(80)).max(5).optional(),
    type: z.string().max(20).optional(),
    address: z.string().max(200).optional(),
    phone: z.string().max(30).optional(),
    website: z.string().max(200).optional(),
    hoursText: z.string().max(120).optional(),
    areaName: z.string().max(80).optional(),
    brand: z
      .union([
        z.object({ slug: z.string().min(1).max(80) }),
        z.object({ nameBn: z.string().max(80) }),
      ])
      .nullable()
      .optional(),
  }),
  z.object({
    kind: z.literal("area-rename"),
    areaId: z.number().int().positive(),
    nameBn: z.string().max(80),
  }),
]);

export const adminAct = defineAction(
  schema,
  async (input, { services, user }): Promise<Result<unknown>> => {
    const { admin } = services;
    switch (input.kind) {
      case "report":
        return admin.resolveReport(input.id, input.decision, input);
      case "edit":
        return admin.decideEdit(user, input.id, input.decision);
      case "merge": {
        const into = await services.repos.places.bySlug(input.intoSlug.trim());
        if (!into) return fail("not_found");
        return admin.mergePlaces(input.fromId, into.id);
      }
      case "merge-food":
        return admin.mergeFoods(input.fromId, input.intoId);
      case "hide":
        return admin.hide(input.entity, input.entityId);
      case "restore":
        return admin.restore(input.entity, input.entityId);
      case "ban":
        return admin.setBanned(user, input.userId, input.banned);
      case "fame-set":
        return admin.setFame(input);
      case "fame-remove":
        return admin.removeFame(input.districtId, input.foodId);
      case "purge-rate-events":
        return ok({ removed: await admin.purgeRateEvents(7) });
      case "clean-media":
        return ok(await admin.cleanOrphanMedia());
      case "place-update": {
        const { kind: _kind, ...update } = input;
        return admin.updatePlace(update);
      }
      case "area-rename":
        return admin.renameArea(input.areaId, input.nameBn);
      case "purge-insights":
        return ok({ removed: await services.repos.insights.purge(90) });
    }
  },
  { auth: true, role: "admin" },
);

export type MergeCandidate = {
  slug: string;
  nameBn: string;
  districtNameBn: string;
  areaNameBn: string | null;
};

/** Places matching a typed name, for picking the place a duplicate should be merged into. */
export const adminFindPlaces = defineAction(
  z.object({ q: z.string().max(80) }),
  async (input, { services }): Promise<Result<MergeCandidate[]>> => {
    const outcome = await services.search.search(input.q);
    return ok(
      outcome.places.slice(0, 8).map((hit) => ({
        slug: hit.slug,
        nameBn: hit.nameBn,
        districtNameBn: hit.district.nameBn,
        areaNameBn: hit.areaNameBn,
      })),
    );
  },
  { auth: true, role: "admin" },
);
