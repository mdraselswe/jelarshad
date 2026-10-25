import { describe, expect, it, vi } from "vitest";

import { demoUser, fixtureIds } from "@/infrastructure/mock/fixtures";
import { createMockRepositories } from "@/infrastructure/mock/repositories";

import { createAdminService } from "./admin-service";
import { createRewardService } from "./reward-service";

const admin = { ...demoUser, id: fixtureIds.users.contract, role: "admin" as const };
const suggester = { ...demoUser, id: "00000000-0000-4000-8000-0000000000aa" };

function setup() {
  const repos = createMockRepositories();
  const cache = { invalidate: vi.fn(async () => {}) };
  const storage = { delete: vi.fn(async () => {}) };
  const rewards = createRewardService({ repos });
  const service = createAdminService({ repos, cache, rewards, storage });
  return { repos, cache, storage, rewards, service };
}

describe("edit suggestions", () => {
  it("applies an approved name change, pays +15 and refreshes the cache", async () => {
    const { repos, cache, rewards, service } = setup();
    const edit = await repos.editSuggestions.create({
      entity: "place",
      entityId: fixtureIds.places.sample,
      field: "name_bn",
      currentValue: null,
      proposedValue: "নতুন নাম",
      note: null,
      userId: suggester.id,
    });
    const result = await service.decideEdit(admin, edit.id, "approve");
    expect(result).toEqual({ ok: true, data: { applied: true } });
    expect((await repos.places.byId(fixtureIds.places.sample))?.nameBn).toBe("নতুন নাম");
    expect((await rewards.summary(suggester.id)).points).toBe(15);
    expect(cache.invalidate).toHaveBeenCalledWith(
      expect.arrayContaining([`place:${fixtureIds.places.sample}`, "search"]),
    );
    // a decided suggestion cannot be decided again
    expect(await service.decideEdit(admin, edit.id, "approve")).toMatchObject({ ok: false });
  });

  it("rejects without changing anything or paying", async () => {
    const { repos, rewards, service } = setup();
    const before = (await repos.places.byId(fixtureIds.places.sample))?.nameBn;
    const edit = await repos.editSuggestions.create({
      entity: "place",
      entityId: fixtureIds.places.sample,
      field: "name_bn",
      currentValue: null,
      proposedValue: "অন্য নাম",
      note: null,
      userId: suggester.id,
    });
    expect(await service.decideEdit(admin, edit.id, "reject")).toEqual({
      ok: true,
      data: { applied: false },
    });
    expect((await repos.places.byId(fixtureIds.places.sample))?.nameBn).toBe(before);
    expect((await rewards.summary(suggester.id)).points).toBe(0);
    expect((await service.edits()).items).toHaveLength(0);
  });

  it("applies an approved phone, website and hours suggestion, cleaned", async () => {
    const { repos, service } = setup();
    const suggest = (field: string, proposedValue: string) =>
      repos.editSuggestions.create({
        entity: "place",
        entityId: fixtureIds.places.sample,
        field,
        currentValue: null,
        proposedValue,
        note: null,
        userId: suggester.id,
      });
    for (const [field, value] of [
      ["phone", "০১৭১১-২২৩৩৪৪"],
      ["website", "facebook.com/dohi-ghor"],
      ["hours_text", "প্রতিদিন ১০টা–১০টা"],
    ] as const) {
      const edit = await suggest(field, value);
      expect(await service.decideEdit(admin, edit.id, "approve")).toEqual({
        ok: true,
        data: { applied: true },
      });
    }
    const place = await repos.places.byId(fixtureIds.places.sample);
    expect(place?.phone).toBe("01711-223344");
    expect(place?.website).toBe("https://facebook.com/dohi-ghor");
    expect(place?.hoursText).toBe("প্রতিদিন ১০টা–১০টা");
  });

  it("refuses a phone number or web address that is not one", async () => {
    const { repos, service } = setup();
    for (const [field, value] of [
      ["phone", "call me maybe"],
      ["website", "javascript:alert(1)"],
    ] as const) {
      const edit = await repos.editSuggestions.create({
        entity: "place",
        entityId: fixtureIds.places.sample,
        field,
        currentValue: null,
        proposedValue: value,
        note: null,
        userId: suggester.id,
      });
      expect(await service.decideEdit(admin, edit.id, "approve")).toMatchObject({ ok: false });
    }
  });

  it("refuses a place type that does not exist", async () => {
    const { repos, service } = setup();
    const edit = await repos.editSuggestions.create({
      entity: "place",
      entityId: fixtureIds.places.sample,
      field: "type",
      currentValue: null,
      proposedValue: "spaceship",
      note: null,
      userId: suggester.id,
    });
    expect(await service.decideEdit(admin, edit.id, "approve")).toMatchObject({ ok: false });
  });
});

describe("updatePlace", () => {
  const placeId = fixtureIds.places.sample;

  it("edits a place directly, cleaning contact details", async () => {
    const { repos, service } = setup();
    const result = await service.updatePlace({
      placeId,
      nameBn: "  নতুন  নাম ",
      address: "সাতমাথা মোড়",
      phone: "০১৭১১২২৩৩৪৪",
      website: "facebook.com/amar-dokan",
      hoursText: "প্রতিদিন ১০টা–১০টা",
      type: "bakery",
    });
    expect(result).toEqual({ ok: true, data: { updated: true } });
    expect(await repos.places.byId(placeId)).toMatchObject({
      nameBn: "নতুন নাম",
      address: "সাতমাথা মোড়",
      phone: "01711223344",
      website: "https://facebook.com/amar-dokan",
      hoursText: "প্রতিদিন ১০টা–১০টা",
      type: "bakery",
    });
  });

  it("clears contact details when they are emptied, and keeps untouched fields", async () => {
    const { repos, service } = setup();
    await service.updatePlace({ placeId, phone: "01711223344" });
    await service.updatePlace({ placeId, phone: "" });
    const place = await repos.places.byId(placeId);
    expect(place?.phone).toBeNull();
    expect(place?.nameBn).toBe("নমুনা দই ঘর");
  });

  it("sets the English name people search with, and clears it when emptied", async () => {
    const { repos, service } = setup();
    await service.updatePlace({ placeId, nameEn: "  Ideal  Sweets " });
    expect((await repos.places.byId(placeId))?.nameEn).toBe("Ideal Sweets");
    await service.updatePlace({ placeId, nameEn: "" });
    expect((await repos.places.byId(placeId))?.nameEn).toBeNull();
  });

  it("refuses an empty name, a bad phone number and an unknown kind", async () => {
    const { service } = setup();
    expect(await service.updatePlace({ placeId, nameBn: "  " })).toMatchObject({ ok: false });
    expect(await service.updatePlace({ placeId, phone: "call me" })).toMatchObject({ ok: false });
    expect(await service.updatePlace({ placeId, type: "spaceship" })).toMatchObject({ ok: false });
  });

  it("puts a place in the existing neighbourhood whatever the spacing, not a new one", async () => {
    const { repos, service } = setup();
    await service.updatePlace({ placeId: fixtureIds.places.second, areaName: "সাত মাথা" });
    const moved = await repos.places.byId(fixtureIds.places.second);
    expect(moved?.area).toMatchObject({ id: 1, nameBn: "সাতমাথা" });
  });

  it("moves a place to a neighbourhood and into a new chain, then out of it", async () => {
    const { repos, service } = setup();
    await service.updatePlace({ placeId, areaName: "নতুন পাড়া", brand: { nameBn: "আমার চেইন" } });
    const joined = await repos.places.byId(placeId);
    expect(joined?.area?.nameBn).toBe("নতুন পাড়া");
    expect(joined?.brand?.nameBn).toBe("আমার চেইন");
    await service.updatePlace({ placeId, areaName: "", brand: null });
    const left = await repos.places.byId(placeId);
    expect(left?.area).toBeNull();
    expect(left?.brand).toBeNull();
  });

  it("renames a neighbourhood for every place in it", async () => {
    const { repos, service } = setup();
    const area = (await repos.places.byId(placeId))?.area;
    if (!area) throw new Error("fixture area missing");
    expect(await service.renameArea(area.id, " সাতমাথা মোড় ")).toEqual({
      ok: true,
      data: { renamed: true },
    });
    expect((await repos.places.byId(placeId))?.area?.nameBn).toBe("সাতমাথা মোড়");
    expect(await service.renameArea(area.id, " ")).toMatchObject({ ok: false });
  });
});

describe("reports", () => {
  it("hides content and takes its points back, or dismisses and restores it", async () => {
    const { repos, service } = setup();
    const report = await repos.reports.create({
      entity: "place",
      entityId: fixtureIds.places.sample,
      reason: "wrong_info",
      note: null,
      userId: suggester.id,
    });
    expect((await service.reports()).items[0]?.target.label).toBeTruthy();
    await service.resolveReport(report.id, "hide", report);
    expect(await repos.places.byId(fixtureIds.places.sample)).toBeNull();

    const second = await repos.reports.create({
      entity: "place",
      entityId: fixtureIds.places.sample,
      reason: "other",
      note: null,
      userId: admin.id,
    });
    await service.resolveReport(second.id, "dismiss", second);
    expect(await repos.places.byId(fixtureIds.places.sample)).not.toBeNull();
  });
});

describe("merging places", () => {
  it("moves the dishes, hides the duplicate and redirects its old link", async () => {
    const { repos, service } = setup();
    const from = await repos.places.byId(fixtureIds.places.second);
    const into = await repos.places.byId(fixtureIds.places.sample);
    if (!from || !into) throw new Error("fixtures missing");
    const result = await service.mergePlaces(from.id, into.id);
    expect(result.ok).toBe(true);
    expect(await repos.places.redirectFor(from.slug)).toBe(into.slug);
    expect(await repos.places.dishes(from.id)).toHaveLength(0);
    // The duplicate's name keeps finding the place it became part of.
    expect(await repos.places.aliases(into.id)).toContain(from.nameBn);
  });

  it("will not merge a place into itself or into a hidden place", async () => {
    const { service } = setup();
    expect(
      await service.mergePlaces(fixtureIds.places.sample, fixtureIds.places.sample),
    ).toMatchObject({ ok: false });
  });
});

describe("people and maintenance", () => {
  it("cannot ban yourself", async () => {
    const { service } = setup();
    expect(await service.setBanned(admin, admin.id, true)).toMatchObject({ ok: false });
    expect(await service.setBanned(admin, suggester.id, true)).toMatchObject({ ok: true });
  });

  it("edits a district's famous-for list by food slug", async () => {
    const { repos, service } = setup();
    const food = await repos.foods.byId(fixtureIds.foods.doi);
    if (!food) throw new Error("fixtures missing");
    expect(await service.setFame({ districtId: 2, foodSlug: food.slug, noteBn: "খাঁটি" })).toEqual({
      ok: true,
      data: null,
    });
    expect((await repos.districts.fame(2)).some((fame) => fame.food.id === food.id)).toBe(true);
    await service.removeFame(2, food.id);
    expect((await repos.districts.fame(2)).some((fame) => fame.food.id === food.id)).toBe(false);
    expect(await service.setFame({ districtId: 2, foodSlug: "nope", noteBn: null })).toMatchObject({
      ok: false,
    });
  });

  it("counts what the app holds", async () => {
    const { service } = setup();
    const counts = await service.counts();
    expect(counts.places).toBeGreaterThan(0);
    expect(counts.openReports).toBe(0);
  });

  it("removes rate-limit counters older than a week", async () => {
    const { service } = setup();
    expect(await service.purgeRateEvents(7)).toBe(0);
  });
});

describe("merging foods", () => {
  async function twoFoods() {
    const { repos, service } = setup();
    const keep = await repos.foods.create({ nameBn: "সালাদ", slug: "salad-bn" }, admin.id);
    const dup = await repos.foods.create({ nameBn: "ছালাদ", slug: "chalad" }, admin.id);
    return { repos, service, keep, dup };
  }

  it("lists foods whose names are alike", async () => {
    const { repos, service } = setup();
    await repos.foods.create({ nameBn: "সালাদ", slug: "salad-a" }, admin.id);
    await repos.foods.create({ nameBn: "salad", slug: "salad-b" }, admin.id);
    const pairs = await service.duplicateFoods();
    expect(pairs.map((pair) => [pair.a.slug, pair.b.slug])).toContainEqual(["salad-a", "salad-b"]);
  });

  it("merges, redirects the old link and keeps the merged name searchable", async () => {
    const { repos, service, keep, dup } = await twoFoods();
    const result = await service.mergeFoods(dup.id, keep.id);
    expect(result.ok).toBe(true);
    expect(await repos.foods.redirectFor(dup.slug)).toBe(keep.slug);
    expect(await repos.foods.bySlug(dup.slug)).toBeNull();
    const hit = await repos.search.search({ text: "ছালাদ", key: "calad" }, { limit: 10 });
    const slugs = hit.items.flatMap((item) => (item.kind === "food" ? [item.food.slug] : []));
    expect(slugs).toContain(keep.slug);
    expect(slugs).not.toContain(dup.slug);
  });

  it("will not merge a food into itself", async () => {
    const { service, keep } = await twoFoods();
    expect(await service.mergeFoods(keep.id, keep.id)).toMatchObject({ ok: false });
  });
});
