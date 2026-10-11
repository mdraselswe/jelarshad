import { buildSearchFields } from "@/lib/text/normalize";
import type {
  AppUser,
  Claim,
  EditSuggestion,
  EntityType,
  Page,
  PageOpts,
  Place,
  PlaceType,
  Report,
} from "@/core/domain";
import type { AdminCounts, OrphanMedia } from "@/core/ports";
import type { CacheInvalidator, CacheTag, Repositories, StorageProvider } from "@/core/ports";
import { fail, ok, type Result } from "@/lib/result";
import { containsProfanity } from "@/lib/text/profanity";

import type { RewardService } from "./reward-service";

// Admin: the review queues and what an admin can do with them (docs/01-product-spec.md §3.13).
// Callers must already have checked the admin role (defineAction `role: "admin"`); this service
// only enforces the data rules (valid values, points taken back, caches refreshed). Pure: ports only.

type Deps = {
  repos: Pick<Repositories, "admin" | "places" | "foods" | "reports">;
  cache: CacheInvalidator;
  rewards: RewardService;
  storage: Pick<StorageProvider, "delete">;
};

const PLACE_TYPES: readonly PlaceType[] = [
  "restaurant",
  "shop",
  "street_food",
  "bakery",
  "home_kitchen",
  "other",
];

export type QueueTarget = { label: string; href: string | null };
export type QueueReport = Report & { target: QueueTarget };
export type QueueEdit = EditSuggestion & { target: QueueTarget };

export type HideableEntity = Extract<EntityType, "place" | "food" | "dish" | "experience">;

const tagFor = (entity: EntityType, id: string): CacheTag | null =>
  entity === "place" || entity === "food" || entity === "dish" ? `${entity}:${id}` : null;

export function createAdminService({ repos, cache, rewards, storage }: Deps) {
  async function describe(entity: EntityType, entityId: string): Promise<QueueTarget> {
    if (entity === "place") {
      const place = await repos.places.byId(entityId);
      if (place) return { label: place.nameBn, href: `/place/${place.slug}` };
    }
    if (entity === "food") {
      const food = await repos.foods.byId(entityId);
      if (food) return { label: food.nameBn, href: `/food/${food.slug}` };
    }
    return { label: `${entity}: ${entityId.slice(0, 8)}`, href: null };
  }

  async function refresh(entity: EntityType, entityId: string, extra: CacheTag[] = []) {
    const tag = tagFor(entity, entityId);
    await cache.invalidate([...(tag ? [tag] : []), ...extra, "search"]);
  }

  return {
    counts(): Promise<AdminCounts> {
      return repos.admin.counts();
    },

    async reports(opts?: PageOpts): Promise<Page<QueueReport>> {
      const page = await repos.admin.openReports(opts);
      const items = await Promise.all(
        page.items.map(async (report) => ({
          ...report,
          target: await describe(report.entity, report.entityId),
        })),
      );
      return { ...page, items };
    },

    /** "dismiss": the report was wrong, the content comes back. "hide": it stays hidden, points go. */
    async resolveReport(
      reportId: string,
      decision: "dismiss" | "hide",
      report: Pick<Report, "entity" | "entityId">,
    ): Promise<Result<{ revoked: number }>> {
      const entity = report.entity as HideableEntity;
      let revoked = 0;
      if (decision === "hide") {
        await repos.admin.setReportStatus(reportId, "approved");
        await repos.admin.hide(entity, report.entityId);
        if (entity === "place" || entity === "experience") {
          revoked = await rewards.revokeFor(entity, report.entityId);
        }
      } else {
        await repos.admin.setReportStatus(reportId, "rejected");
        const stillOpen = await repos.reports.openFor(report.entity, report.entityId);
        // Content that enough reports had hidden returns once no open report is left.
        if (stillOpen.length === 0) await repos.admin.restore(report.entity, report.entityId);
      }
      await refresh(report.entity, report.entityId);
      return ok({ revoked });
    },

    async edits(opts?: PageOpts): Promise<Page<QueueEdit>> {
      const page = await repos.admin.openEditSuggestions(opts);
      const items = await Promise.all(
        page.items.map(async (edit) => ({
          ...edit,
          target: await describe(edit.entity, edit.entityId),
        })),
      );
      return { ...page, items };
    },

    /** Approving applies the value (when the field can be applied) and pays +15 to the suggester. */
    async decideEdit(
      admin: AppUser,
      editId: string,
      decision: "approve" | "reject",
    ): Promise<Result<{ applied: boolean }>> {
      const edit = await repos.admin.editSuggestion(editId);
      if (!edit || edit.status !== "open") return fail("not_found");

      if (decision === "reject") {
        await repos.admin.setEditStatus(editId, "rejected", admin.id);
        return ok({ applied: false });
      }

      const value = edit.proposedValue.trim();
      if (containsProfanity(value))
        return fail("validation", { fields: { proposedValue: "profanity" } });

      let applied = true;
      if (edit.entity === "place") {
        if (edit.field === "name_bn") await repos.places.update(edit.entityId, { nameBn: value });
        else if (edit.field === "address")
          await repos.places.update(edit.entityId, { address: value });
        else if (edit.field === "type") {
          if (!PLACE_TYPES.includes(value as PlaceType)) {
            return fail("validation", { fields: { proposedValue: "invalid" } });
          }
          await repos.places.update(edit.entityId, { type: value as PlaceType });
        } else applied = false;
      } else if (edit.entity === "food") {
        if (edit.field === "name_bn") await repos.foods.update(edit.entityId, { nameBn: value });
        else if (edit.field === "about_bn")
          await repos.foods.update(edit.entityId, { aboutBn: value });
        else applied = false;
      } else applied = false;

      await repos.admin.setEditStatus(editId, "approved", admin.id);
      await rewards.forAcceptedEdit(edit.userId, edit.id);
      if (applied) await refresh(edit.entity, edit.entityId);
      return ok({ applied });
    },

    newPlaces(sinceDays = 7, limit = 30): Promise<Place[]> {
      return repos.admin.recentPlaces(sinceDays, limit);
    },

    disputedClaims(limit = 30): Promise<Claim[]> {
      return repos.admin.disputedClaims(limit);
    },

    /** Merges a duplicate place into the right one; old links to the duplicate redirect. */
    async mergePlaces(fromId: string, intoId: string): Promise<Result<{ dishes: number }>> {
      if (fromId === intoId) return fail("validation", { fields: { into: "same" } });
      const [from, into] = await Promise.all([
        repos.places.byId(fromId),
        repos.places.byId(intoId),
      ]);
      if (!from || !into || into.status !== "active") return fail("not_found");
      const dishes = await repos.admin.mergePlaces(fromId, intoId);
      await rewards.revokeFor("place", fromId);
      await cache.invalidate([
        `place:${fromId}`,
        `place:${intoId}`,
        `district:${from.district.id}`,
        `district:${into.district.id}`,
        "search",
      ]);
      return ok({ dishes });
    },

    /** Active foods whose names are close ("সালাদ" / "ছালাদ"), for the admin to review. */
    duplicateFoods(minSimilarity = 0.55, limit = 30) {
      return repos.admin.similarFoodPairs(minSimilarity, limit);
    },

    /**
     * Merges a duplicate food into the right one. Its name stays findable as an alias of the
     * survivor, and old links to the duplicate redirect.
     */
    async mergeFoods(fromId: string, intoId: string): Promise<Result<{ dishes: number }>> {
      if (fromId === intoId) return fail("validation", { fields: { into: "same" } });
      const [from, into] = await Promise.all([repos.foods.byId(fromId), repos.foods.byId(intoId)]);
      if (!from || !into) return fail("not_found");
      const dishes = await repos.admin.mergeFoods(fromId, intoId);
      const names = [from.nameBn, from.nameEn].filter((name): name is string => Boolean(name));
      for (const name of names) {
        await repos.foods.addAlias(intoId, name, buildSearchFields(name).searchKey);
      }
      await cache.invalidate([`food:${fromId}`, `food:${intoId}`, "foods", "districts", "search"]);
      return ok({ dishes });
    },

    async hide(entity: HideableEntity, entityId: string): Promise<Result<null>> {
      await repos.admin.hide(entity, entityId);
      if (entity === "place" || entity === "experience") await rewards.revokeFor(entity, entityId);
      await refresh(entity, entityId);
      return ok(null);
    },

    async restore(entity: HideableEntity, entityId: string): Promise<Result<null>> {
      await repos.admin.restore(entity, entityId);
      await refresh(entity, entityId);
      return ok(null);
    },

    async setBanned(admin: AppUser, userId: string, banned: boolean): Promise<Result<null>> {
      if (userId === admin.id) return fail("validation", { fields: { userId: "self" } });
      await repos.admin.setBanned(userId, banned);
      return ok(null);
    },

    /** Edits the curated "famous for" list of a district. `note` null clears the note. */
    async setFame(input: {
      districtId: number;
      foodSlug: string;
      noteBn: string | null;
    }): Promise<Result<null>> {
      const food = await repos.foods.bySlug(input.foodSlug);
      if (!food) return fail("not_found");
      const note = input.noteBn?.replace(/\s+/g, " ").trim() || null;
      if (note && containsProfanity(note)) {
        return fail("validation", { fields: { noteBn: "profanity" } });
      }
      await repos.admin.setFame({ districtId: input.districtId, foodId: food.id, noteBn: note });
      await cache.invalidate([`district:${input.districtId}`, `food:${food.id}`, "districts"]);
      return ok(null);
    },

    async removeFame(districtId: number, foodId: string): Promise<Result<null>> {
      await repos.admin.removeFame(districtId, foodId);
      await cache.invalidate([`district:${districtId}`, `food:${foodId}`, "districts"]);
      return ok(null);
    },

    purgeRateEvents(olderThanDays = 7): Promise<number> {
      return repos.admin.purgeRateEvents(olderThanDays);
    },

    orphanMedia(limit = 50): Promise<OrphanMedia[]> {
      return repos.admin.orphanMedia(limit);
    },

    /** Removes uploaded photos whose experience is gone or hidden, from storage and the database. */
    async cleanOrphanMedia(limit = 50): Promise<{ removed: number }> {
      const orphans = await repos.admin.orphanMedia(limit);
      let removed = 0;
      for (const media of orphans) {
        await storage.delete(media.key);
        await repos.admin.deleteMedia(media.id);
        removed += 1;
      }
      return { removed };
    },
  };
}

export type AdminService = ReturnType<typeof createAdminService>;
