import { describe, expect, it } from "vitest";

import type { Repositories } from "@/core/ports";
import { toSearchQuery } from "@/lib/text/normalize";

/**
 * Behaviour every Repositories adapter must have (add-provider skill, step 7). Each adapter's
 * `*.contract.test.ts` calls this with a factory returning fresh repositories loaded with the
 * standard fixtures (src/infrastructure/mock/fixtures.ts — the seed for real adapters too).
 */
/** Fixture ids the contract refers to (src/infrastructure/mock/fixtures.ts → fixtureIds). */
export type ContractIds = {
  foods: { doi: string };
  places: { sample: string; second: string };
  users: { contract: string };
};

export type WriteArea = "experiences" | "claims" | "saved" | "places";

export function repositoryContract(
  adapter: string,
  make: () => Promise<Repositories> | Repositories,
  {
    ids,
    writes = true,
  }: {
    ids: ContractIds;
    /** false while an adapter is read-only; or just the write areas it already implements. */
    writes?: boolean | WriteArea[];
  },
) {
  const writeIt = (area: WriteArea) =>
    writes === true || (Array.isArray(writes) && writes.includes(area)) ? it : it.skip;
  describe(`${adapter} repositories (contract)`, () => {
    it("finds the pipeline's smoke-test entities by slug", async () => {
      const repos = await make();
      expect(await repos.foods.bySlug("doi")).toMatchObject({ slug: "doi", nameBn: "দই" });
      expect(await repos.places.bySlug("sample-place")).toMatchObject({ slug: "sample-place" });
      expect(await repos.districts.bySlug("bogura")).toMatchObject({ slug: "bogura" });
      expect(await repos.foods.bySlug("no-such-food")).toBeNull();
    });

    it("ranks a food's dishes by Wilson score, not raw %", async () => {
      const repos = await make();
      const doi = await repos.foods.bySlug("doi");
      if (!doi) throw new Error("fixture food missing");
      const { items } = await repos.foods.topDishes(doi.id);
      expect(items.length).toBeGreaterThan(1);
      const scores = items.map((d) => d.wilsonScore);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
      // 25 experiences at 92% beat 3/3 at 100% (decision P10).
      expect(items[0]?.experienceCount).toBeGreaterThan(items[1]?.experienceCount ?? 0);
      expect(items[0]?.place.district.slug).toBe("bogura");
    });

    it("paginates with a cursor", async () => {
      const repos = await make();
      const doi = await repos.foods.bySlug("doi");
      if (!doi) throw new Error("fixture food missing");
      const first = await repos.foods.topDishes(doi.id, { limit: 1 });
      expect(first.items).toHaveLength(1);
      expect(first.nextCursor).not.toBeNull();
      const second = await repos.foods.topDishes(doi.id, { limit: 1, cursor: first.nextCursor });
      expect(second.items[0]?.id).not.toBe(first.items[0]?.id);
    });

    it("lists the curated famous foods of a district", async () => {
      const repos = await make();
      const bogura = await repos.districts.bySlug("bogura");
      if (!bogura) throw new Error("fixture district missing");
      const fame = await repos.districts.fame(bogura.id);
      expect(fame.map((f) => f.food.slug)).toContain("doi");
    });

    it("finds a neighbourhood by slug and by name, and lists its places", async () => {
      const repos = await make();
      const bogura = await repos.districts.bySlug("bogura");
      if (!bogura) throw new Error("fixture district missing");
      const area = await repos.districts.areaBySlug(bogura.id, "satmatha");
      expect(area).toMatchObject({ slug: "satmatha", nameBn: "সাতমাথা" });
      expect(area?.district.slug).toBe("bogura");
      expect(await repos.districts.areaBySlug(bogura.id, "nowhere")).toBeNull();

      const matching = await repos.districts.areasMatching("সাতমাথা", 5);
      expect(matching.map((candidate) => candidate.slug)).toContain("satmatha");
      expect(await repos.districts.areasMatching("zzzz-none", 5)).toEqual([]);

      const ofDistrict = await repos.districts.areasOf(bogura.id, 10);
      expect(ofDistrict.map((candidate) => candidate.slug)).toContain("satmatha");
      expect(await repos.districts.areaSlugs(10)).toContainEqual({
        districtSlug: "bogura",
        areaSlug: "satmatha",
      });

      if (!area) throw new Error("area missing");
      const places = await repos.places.inArea(area.id, { limit: 10 });
      expect(places.items.map((place) => place.slug)).toContain("sample-place");
      expect(places.items.every((place) => place.area?.slug === "satmatha")).toBe(true);
    });

    it("lists slugs for static generation, capped by the limit", async () => {
      const repos = await make();
      expect(await repos.foods.slugs(100)).toContain("doi");
      expect(await repos.places.slugs(100)).toContain("sample-place");
      expect(await repos.foods.slugs(1)).toHaveLength(1);
    });

    it("lists every district's famous foods in one call", async () => {
      const repos = await make();
      const all = await repos.districts.allFame();
      expect(all.length).toBeGreaterThan(1);
      const bogura = await repos.districts.bySlug("bogura");
      expect(all.some((f) => f.districtId === bogura?.id && f.food.slug === "doi")).toBe(true);
    });

    writeIt("experiences")(
      "keeps one experience per user per dish and updates dish counts",
      async () => {
        const repos = await make();
        const dish = (await repos.places.dishes(ids.places.second))[0];
        if (!dish) throw new Error("fixture dish missing");
        // Real databases recompute a dish's counts from its experience rows, mock fixtures carry
        // counts without rows; so compare the second write with the first, not with the fixture.
        await repos.experiences.upsert({
          dishId: dish.id,
          userId: ids.users.contract,
          reaction: "loved",
        });
        const afterFirst = await repos.dishes.byId(dish.id);
        await repos.experiences.upsert({
          dishId: dish.id,
          userId: ids.users.contract,
          reaction: "okay",
        });
        const after = await repos.dishes.byId(dish.id);
        expect(afterFirst?.experienceCount).toBeGreaterThanOrEqual(1);
        expect(after?.experienceCount).toBe(afterFirst?.experienceCount); // an edit, not a second vote
        expect(after?.okayCount).toBe((afterFirst?.okayCount ?? 0) + 1);
        expect(after?.lovedCount).toBe((afterFirst?.lovedCount ?? 0) - 1);
        const mine = await repos.experiences.byUser(ids.users.contract);
        expect(mine.items).toHaveLength(1);
        expect(mine.items[0]?.reaction).toBe("okay");
      },
    );

    writeIt("claims")(
      "replaces a user's earlier claim vote instead of adding another",
      async () => {
        const repos = await make();
        const [claim] = await repos.claims.forEntity("place", ids.places.sample);
        if (!claim) throw new Error("fixture claim missing");
        const total = (c: typeof claim) => c.counts.correct + c.counts.partial + c.counts.wrong;
        const vote = {
          claimId: claim.id,
          userId: ids.users.contract,
          reason: null,
          note: null,
          evidence: null,
        };
        const first = await repos.claims.vote({ ...vote, verdict: "correct" });
        const second = await repos.claims.vote({ ...vote, verdict: "wrong", reason: "closed" });
        // Real databases recount from the vote rows, mock fixtures carry counts without rows, so
        // the changed vote is compared with the first one, not with the fixture.
        expect(total(first)).toBeGreaterThanOrEqual(1);
        expect(total(second)).toBe(total(first));
        expect(second.counts.wrong).toBe(first.counts.wrong + 1);
        expect(second.counts.correct).toBe(first.counts.correct - 1);
      },
    );

    writeIt("claims")("creates a claim once per place, type and entity", async () => {
      const repos = await make();
      const input = {
        entity: "place" as const,
        entityId: ids.places.second,
        type: "opening_hours" as const,
        value: { note: "contract" },
        createdBy: ids.users.contract,
      };
      const first = await repos.claims.ensure(input);
      const again = await repos.claims.ensure(input);
      expect(again.id).toBe(first.id);
      expect(first.status).toBe("unverified");
    });

    writeIt("saved")("saves and unsaves without duplicates", async () => {
      const repos = await make();
      await repos.saved.save(ids.users.contract, "food", ids.foods.doi);
      await repos.saved.save(ids.users.contract, "food", ids.foods.doi);
      expect((await repos.saved.list(ids.users.contract)).items).toHaveLength(1);
      await repos.saved.remove(ids.users.contract, "food", ids.foods.doi);
      expect(await repos.saved.isSaved(ids.users.contract, "food", ids.foods.doi)).toBe(false);
    });

    writeIt("places")(
      "creates a place in a new area and reuses that area for the next one",
      async () => {
        const repos = await make();
        const stamp = Date.now().toString(36);
        const base = {
          type: "restaurant" as const,
          districtId: 2,
          areaName: `নতুন এলাকা ${stamp}`,
          location: { lat: 24.85, lng: 89.37 },
        };
        const first = await repos.places.create(
          { ...base, nameBn: "প্রথম দোকান", slug: `contract-a-${stamp}` },
          ids.users.contract,
        );
        const second = await repos.places.create(
          { ...base, nameBn: "দ্বিতীয় দোকান", slug: `contract-b-${stamp}` },
          ids.users.contract,
        );
        expect(first.area?.nameBn).toBe(base.areaName);
        expect(second.area?.id).toBe(first.area?.id);
      },
    );

    it("finds foods by Bangla and Banglish spellings", async () => {
      const repos = await make();
      for (const query of ["দই", "doi", "kacchi", "kachchi", "কাচ্চি"]) {
        const { items } = await repos.search.search(toSearchQuery(query));
        const slugs = items.flatMap((hit) => (hit.kind === "food" ? [hit.food.slug] : []));
        expect(slugs.length, query).toBeGreaterThan(0);
      }
      const doi = await repos.search.search(toSearchQuery("দই"));
      expect(doi.items.some((hit) => hit.kind === "food" && hit.food.slug === "doi")).toBe(true);
    });

    it("finds places and districts too", async () => {
      const repos = await make();
      const district = await repos.search.search(toSearchQuery("bogura"));
      expect(
        district.items.some((hit) => hit.kind === "district" && hit.district.slug === "bogura"),
      ).toBe(true);
      const place = await repos.search.search(toSearchQuery("নমুনা দই ঘর"));
      expect(
        place.items.some((hit) => hit.kind === "place" && hit.place.slug === "sample-place"),
      ).toBe(true);
    });
  });
}
