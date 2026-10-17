import { describe, expect, it, vi } from "vitest";

import { demoUser, fixtureIds } from "@/infrastructure/mock/fixtures";
import { createMockRepositories } from "@/infrastructure/mock/repositories";

import { createModerationService } from "./moderation-service";
import { createRewardService } from "./reward-service";

const person = (n: number) => ({ ...demoUser, id: `person-${n}` });

function setup() {
  const repos = createMockRepositories();
  const cache = { invalidate: vi.fn(async () => {}) };
  const rewards = createRewardService({ repos });
  return { repos, cache, service: createModerationService({ repos, cache, rewards }) };
}

describe("moderationService.suggestEdit by the person who added the place", () => {
  async function addedBy(creator: { id: string }) {
    const context = setup();
    const place = await context.repos.places.create(
      {
        nameBn: "আমার দোকান",
        type: "restaurant",
        districtId: 2,
        slug: "amar-dokan",
      },
      creator.id,
    );
    return { ...context, placeId: place.id };
  }

  it("applies a correction to contact details and address at once", async () => {
    const owner = person(1);
    const { repos, service, placeId } = await addedBy(owner);
    const result = await service.suggestEdit(owner, {
      entity: "place",
      entityId: placeId,
      field: "phone",
      proposedValue: "০১৭১১-২২৩৩৪৪",
    });
    expect(result).toMatchObject({ ok: true, data: { applied: true } });
    expect((await repos.places.byId(placeId))?.phone).toBe("01711-223344");
    expect((await repos.admin.openEditSuggestions()).items).toHaveLength(0);
  });

  it("still sends a name change, or anyone else's change, to the admin queue", async () => {
    const owner = person(1);
    const { repos, service, placeId } = await addedBy(owner);
    const rename = await service.suggestEdit(owner, {
      entity: "place",
      entityId: placeId,
      field: "name_bn",
      proposedValue: "নতুন নাম",
    });
    expect(rename).toMatchObject({ ok: true, data: { applied: false } });
    const stranger = await service.suggestEdit(person(2), {
      entity: "place",
      entityId: placeId,
      field: "phone",
      proposedValue: "01711223344",
    });
    expect(stranger).toMatchObject({ ok: true, data: { applied: false } });
    expect((await repos.admin.openEditSuggestions()).items).toHaveLength(2);
    expect((await repos.places.byId(placeId))?.phone).toBeNull();
  });

  it("refuses a phone number that is not one, even from the creator", async () => {
    const owner = person(1);
    const { service, placeId } = await addedBy(owner);
    const result = await service.suggestEdit(owner, {
      entity: "place",
      entityId: placeId,
      field: "phone",
      proposedValue: "call me",
    });
    expect(result).toMatchObject({ ok: false });
  });
});

describe("moderationService.suggestEdit", () => {
  it("queues a suggestion with the value it would replace", async () => {
    const { repos, service } = setup();
    const result = await service.suggestEdit(person(1), {
      entity: "place",
      entityId: fixtureIds.places.sample,
      field: "name_bn",
      proposedValue: "  নতুন   নাম ",
      note: "সাইনবোর্ডে এটাই লেখা",
    });
    expect(result.ok).toBe(true);
    const queue = await repos.admin.openEditSuggestions();
    expect(queue.items[0]).toMatchObject({
      field: "name_bn",
      currentValue: "নমুনা দই ঘর",
      proposedValue: "নতুন নাম",
    });
  });

  it("rejects unknown fields, empty values, offensive text and unknown content", async () => {
    const { service } = setup();
    const base = { entity: "food" as const, entityId: fixtureIds.foods.doi, field: "name_bn" };
    const codes = async (input: Parameters<typeof service.suggestEdit>[1]) => {
      const result = await service.suggestEdit(person(1), input);
      return result.ok ? "ok" : result.error.code;
    };
    expect(await codes({ ...base, field: "price", proposedValue: "x" })).toBe("validation");
    expect(await codes({ ...base, proposedValue: "   " })).toBe("validation");
    expect(await codes({ ...base, proposedValue: "you bastard" })).toBe("validation");
    expect(await codes({ ...base, entityId: "nope", proposedValue: "দই" })).toBe("not_found");
  });
});

describe("moderationService.report", () => {
  const target = { entity: "place" as const, entityId: fixtureIds.places.sample };

  it("records a report and leaves the place visible below the threshold", async () => {
    const { repos, service } = setup();
    expect(await service.report(person(1), { ...target, reason: "closed" })).toEqual({
      ok: true,
      data: { hidden: false },
    });
    expect((await repos.places.byId(fixtureIds.places.sample))?.status).toBe("active");
  });

  it("does not let one person report the same thing twice", async () => {
    const { service } = setup();
    await service.report(person(1), { ...target, reason: "closed" });
    const again = await service.report(person(1), { ...target, reason: "offensive" });
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error.code).toBe("conflict");
  });

  it("hides content once enough different people reported it, and refreshes caches", async () => {
    const { repos, service, cache } = setup();
    await service.report(person(1), { ...target, reason: "wrong_info" });
    await service.report(person(2), { ...target, reason: "wrong_info" });
    const third = await service.report(person(3), { ...target, reason: "misleading" });
    expect(third).toEqual({ ok: true, data: { hidden: true } });
    expect(await repos.places.byId(fixtureIds.places.sample)).toBeNull();
    expect(cache.invalidate).toHaveBeenCalledWith(
      expect.arrayContaining([`place:${fixtureIds.places.sample}`, "search"]),
    );
  });
});
