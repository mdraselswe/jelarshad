import { appConfig } from "@/config/app.config";
import type { AppUser, EntityType } from "@/core/domain";
import type { CacheInvalidator, Repositories } from "@/core/ports";
import { fail, ok, type Result } from "@/lib/result";
import { containsProfanity } from "@/lib/text/profanity";

import type { RewardService } from "./reward-service";

// Edit suggestions (✏️ সংশোধন) and reports (ভুল তথ্য, আপত্তিকর…): everything lands in the admin
// queue; enough independent reports hide the content until an admin looks (docs/09 §2). Pure: ports only.

type Deps = {
  repos: Pick<Repositories, "editSuggestions" | "reports" | "admin" | "places" | "foods">;
  cache: CacheInvalidator;
  rewards: RewardService;
};

export type EditTarget = Extract<EntityType, "place" | "food">;

/** Fields a person may suggest a change to, per kind of content. */
export const EDITABLE_FIELDS = {
  place: ["name_bn", "address", "type", "phone", "website", "hours_text", "other"],
  food: ["name_bn", "about_bn", "other"],
} as const satisfies Record<EditTarget, readonly string[]>;

export const REPORT_REASONS = [
  "wrong_info",
  "misleading",
  "wrong_place",
  "closed",
  "fake_photo",
  "offensive",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export type ReportTarget = Extract<EntityType, "place" | "food" | "dish" | "experience">;

const clean = (value: string | null | undefined, max: number) => {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  return [...text].slice(0, max).join("");
};

export function createModerationService({ repos, cache, rewards }: Deps) {
  async function currentValue(entity: EditTarget, entityId: string, field: string) {
    if (entity === "place") {
      const place = await repos.places.byId(entityId);
      if (!place) return { found: false as const };
      const values: Record<string, string | null> = {
        name_bn: place.nameBn,
        address: place.address,
        type: place.type,
        phone: place.phone,
        website: place.website,
        hours_text: place.hoursText,
      };
      return { found: true as const, value: values[field] ?? null };
    }
    const food = await repos.foods.byId(entityId);
    if (!food) return { found: false as const };
    const values: Record<string, string | null> = { name_bn: food.nameBn, about_bn: food.aboutBn };
    return { found: true as const, value: values[field] ?? null };
  }

  return {
    async suggestEdit(
      user: AppUser,
      input: {
        entity: EditTarget;
        entityId: string;
        field: string;
        proposedValue: string;
        note?: string | null | undefined;
      },
    ): Promise<Result<{ id: string }>> {
      const allowed: readonly string[] = EDITABLE_FIELDS[input.entity];
      if (!allowed.includes(input.field))
        return fail("validation", { fields: { field: "invalid" } });

      const proposedValue = clean(input.proposedValue, 300);
      const note = clean(input.note, appConfig.text.noteMax) || null;
      if (proposedValue === "")
        return fail("validation", { fields: { proposedValue: "required" } });
      if (containsProfanity(proposedValue)) {
        return fail("validation", { fields: { proposedValue: "profanity" } });
      }
      if (note && containsProfanity(note))
        return fail("validation", { fields: { note: "profanity" } });

      const current = await currentValue(input.entity, input.entityId, input.field);
      if (!current.found) return fail("not_found");
      const saved = await repos.editSuggestions.create({
        entity: input.entity,
        entityId: input.entityId,
        field: input.field,
        currentValue: current.value,
        proposedValue,
        note,
        userId: user.id,
      });
      return ok({ id: saved.id });
    },

    async report(
      user: AppUser,
      input: {
        entity: ReportTarget;
        entityId: string;
        reason: ReportReason;
        note?: string | null | undefined;
      },
    ): Promise<Result<{ hidden: boolean }>> {
      const open = await repos.reports.openFor(input.entity, input.entityId);
      if (open.some((report) => report.userId === user.id)) return fail("conflict");

      await repos.reports.create({
        entity: input.entity,
        entityId: input.entityId,
        reason: input.reason,
        note: clean(input.note, appConfig.text.noteMax) || null,
        userId: user.id,
      });

      // Independent reports hide the content until an admin reviews it.
      const distinct = new Set([...open.map((report) => report.userId), user.id]);
      const hidden = distinct.size >= appConfig.moderation.autoHideReports;
      if (hidden) {
        await repos.admin.hide(input.entity, input.entityId);
        if (input.entity === "place" || input.entity === "experience") {
          await rewards.revokeFor(input.entity, input.entityId);
        }
        const tag =
          input.entity === "place" || input.entity === "food"
            ? `${input.entity}:${input.entityId}`
            : null;
        await cache.invalidate([
          ...(tag ? [tag as `place:${string}` | `food:${string}`] : []),
          "search",
        ]);
      }
      return ok({ hidden });
    },
  };
}

export type ModerationService = ReturnType<typeof createModerationService>;
