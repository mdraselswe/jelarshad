import { describe, expect, it } from "vitest";

import { createMockRepositories } from "@/infrastructure/mock/repositories";

import { createCatalogService } from "./catalog-service";

const service = () => createCatalogService({ repos: createMockRepositories() });

describe("catalogService.home", () => {
  it("lists the curated famous foods with their district", async () => {
    const { famous } = await service().home();
    expect(famous).toContainEqual({
      district: { slug: "bogura", nameBn: "বগুড়া" },
      food: { slug: "doi", nameBn: "দই" },
      noteBn: null,
    });
  });

  it("groups districts by division, in order, with each district's first famous food", async () => {
    const { divisions } = await service().home();
    expect(divisions.map((d) => d.nameBn)).toEqual(["ঢাকা", "রাজশাহী", "চট্টগ্রাম"]);
    const rajshahi = divisions.find((d) => d.nameBn === "রাজশাহী");
    expect(rajshahi?.districts.map((d) => d.slug)).toEqual(["bogura", "natore"]);
    expect(rajshahi?.districts[0]?.famous).toEqual({ slug: "doi", nameBn: "দই" });
  });

  it("quick-pick row holds only districts with a famous food", async () => {
    const { famousDistricts, divisions } = await service().home();
    const total = divisions.reduce((sum, division) => sum + division.districts.length, 0);
    expect(famousDistricts.length).toBeGreaterThan(0);
    expect(famousDistricts.length).toBeLessThan(total); // Dhaka has none in the fixtures
    expect(famousDistricts.every((district) => district.famous !== null)).toBe(true);
  });
});

describe("catalogService.staticSlugs", () => {
  it("lists foods, places and districts to prerender", async () => {
    const slugs = await service().staticSlugs();
    expect(slugs.foods).toContain("doi");
    expect(slugs.places).toContain("sample-place");
    expect(slugs.districts).toContain("bogura");
  });

  it("keeps the prerendered set small (deploy uploads are limited)", async () => {
    const slugs = await service().staticSlugs();
    expect(slugs.districts.length).toBeLessThanOrEqual(12);
    expect(slugs.districtFoods.length).toBeLessThanOrEqual(12);
    // districts with a curated famous food come before those without
    expect(slugs.districts.indexOf("dhaka")).toBeGreaterThan(slugs.districts.indexOf("bogura"));
  });
});

describe("catalogService food page", () => {
  it("returns null for an unknown food", async () => {
    expect(await service().foodHeader("no-such-food")).toBeNull();
  });

  it("builds the header with the overall percent and where the food is famous", async () => {
    const header = await service().foodHeader("doi");
    expect(header).toMatchObject({ slug: "doi", nameBn: "দই", experienceCount: 28 });
    expect(header?.percent).toBe(93); // 26 loved of 28
    expect(header?.famousIn).toEqual([{ slug: "bogura", nameBn: "বগুড়া" }]);
  });

  it("ranks dishes by Wilson score and keeps small samples unranked", async () => {
    const svc = service();
    const header = await svc.foodHeader("doi");
    const { items, hasMore, priceRange } = await svc.foodDishes(header?.id ?? "");
    expect(items.map((row) => row.place.slug)).toEqual(["sample-place", "second-sample-place"]);
    expect(items[0]?.display).toEqual({ percent: 92, rankable: true, favorite: true });
    // 3 of 3 loved is 100% but only 3 experiences: no percent, no rank (decision P10).
    expect(items[1]?.display).toEqual({ percent: null, rankable: false, favorite: false });
    expect(hasMore).toBe(false);
    expect(priceRange).toEqual({ min: 120, max: 180 });
  });

  it("shows only experiences that have a comment, with the author's name", async () => {
    const svc = service();
    const header = await svc.foodHeader("doi");
    const rows = await svc.foodExperiences(header?.id ?? "");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      reaction: "loved",
      comment: expect.stringContaining("হাঁড়ির"),
    });
  });
});

describe("catalogService place page", () => {
  it("returns null for an unknown place", async () => {
    expect(await service().placeHeader("no-such-place")).toBeNull();
  });

  it("builds the header and a map search text from what is known", async () => {
    const header = await service().placeHeader("sample-place");
    expect(header).toMatchObject({
      nameBn: "নমুনা দই ঘর",
      type: "shop",
      district: { slug: "bogura", nameBn: "বগুড়া" },
      areaNameBn: "সাতমাথা",
    });
    expect(header?.mapQuery).toBe("নমুনা দই ঘর সাতমাথা বগুড়া বাংলাদেশ");
  });

  it("lists the dishes to order, with the same display rules", async () => {
    const svc = service();
    const header = await svc.placeHeader("sample-place");
    const dishes = await svc.placeDishes(header?.id ?? "");
    expect(dishes).toHaveLength(1);
    expect(dishes[0]).toMatchObject({
      food: { slug: "doi", nameBn: "দই" },
      price: { min: 120, max: 180 },
      display: { percent: 92, rankable: true },
    });
  });

  it("returns the place's claims for the status badges", async () => {
    const svc = service();
    const header = await svc.placeHeader("sample-place");
    const claims = await svc.placeClaims(header?.id ?? "");
    // the place's own claim, then the claims of its dishes (with the dish named and the value shown)
    expect(claims.map((claim) => [claim.type, claim.status, claim.subject])).toEqual([
      ["availability", "unverified", null],
      ["price", "confirmed", "দই"],
    ]);
    expect(claims[1]?.valueText).toBe("৳১২০–৳১৮০");
    expect(claims.every((claim) => claim.id.length > 0)).toBe(true);
  });
});

describe("catalogService.areaPage", () => {
  it("returns null for an unknown district or area", async () => {
    expect(await service().areaPage("nowhere", "satmatha")).toBeNull();
    expect(await service().areaPage("bogura", "nowhere")).toBeNull();
  });

  it("lists the places of a neighbourhood with what they serve", async () => {
    const page = await service().areaPage("bogura", "satmatha");
    expect(page?.area).toEqual({ slug: "satmatha", nameBn: "সাতমাথা" });
    expect(page?.district.slug).toBe("bogura");
    const place = page?.places.find((row) => row.slug === "sample-place");
    expect(place?.foods).toContain("দই");
  });

  it("puts places with enough experiences first, never ranks the rest", async () => {
    const page = await service().areaPage("bogura", "satmatha");
    const flags = page?.places.map((row) => row.best.rankable) ?? [];
    expect(flags).toEqual([...flags].sort((a, b) => Number(b) - Number(a)));
  });
});

describe("catalogService district pages", () => {
  it("returns null for an unknown district", async () => {
    expect(await service().districtHeader("nowhere")).toBeNull();
    expect(await service().districtFood("nowhere", "doi")).toBeNull();
    expect(await service().districtFood("bogura", "nothing")).toBeNull();
  });

  it("builds the header with the curated famous foods", async () => {
    const header = await service().districtHeader("bogura");
    expect(header?.divisionBn).toBe("রাজশাহী");
    expect(header?.famous.map((entry) => entry.food.slug)).toEqual(["doi"]);
    expect(header?.areas.map((area) => area.slug)).toEqual(["satmatha"]);
  });

  it("lists the district's places", async () => {
    const header = await service().districtHeader("bogura");
    const { items } = await service().districtPlaces(header?.id ?? 0);
    expect(items.map((place) => place.slug).sort()).toEqual([
      "sample-place",
      "second-sample-place",
    ]);
  });

  it("shows only dishes of that food inside that district", async () => {
    const page = await service().districtFood("bogura", "doi");
    expect(page?.dishes.items.map((dish) => dish.place.slug)).toEqual([
      "sample-place",
      "second-sample-place",
    ]);
    const elsewhere = await service().districtFood("dhaka", "doi");
    expect(elsewhere?.dishes.items).toEqual([]);
  });
});

describe("catalogService place voices", () => {
  it("lists what people wrote about the place's dishes, with the dish named", async () => {
    const repos = createMockRepositories();
    const place = await repos.places.bySlug("sample-place");
    const voices = await createCatalogService({ repos }).placeExperiences(place?.id ?? "");
    for (const voice of voices) {
      expect(voice.subject).toBeTruthy();
      expect(voice.comment !== null || voice.photos.length > 0).toBe(true);
    }
  });

  it("puts the contact details in the header", async () => {
    const repos = createMockRepositories();
    const place = await repos.places.bySlug("sample-place");
    await repos.places.update(place?.id ?? "", { phone: "01711-223344" });
    const header = await createCatalogService({ repos }).placeHeader("sample-place");
    expect(header).toMatchObject({ phone: "01711-223344", website: null, hoursText: null });
  });
});

describe("catalogService brands", () => {
  it("lists every branch of a chain on the brand page, each ranked on its own", async () => {
    const page = await service().brandPage("sample-chain");
    expect(page?.brand.nameBn).toBe("নমুনা চেইন");
    expect(page?.branches.map((branch) => branch.slug).sort()).toEqual([
      "sample-kacchi-house",
      "sample-mezbani",
    ]);
  });

  it("returns null for an unknown brand", async () => {
    expect(await service().brandPage("nope")).toBeNull();
  });

  it("lists the other branches of a place's chain, never the place itself", async () => {
    const repos = createMockRepositories();
    const place = await repos.places.bySlug("sample-kacchi-house");
    const branches = await createCatalogService({ repos }).placeBranches(place?.id ?? "");
    expect(branches?.items.map((branch) => branch.slug)).toEqual(["sample-mezbani"]);
  });

  it("has no branch section for a place without a chain", async () => {
    const repos = createMockRepositories();
    const place = await repos.places.bySlug("sample-place");
    expect(await createCatalogService({ repos }).placeBranches(place?.id ?? "")).toBeNull();
  });
});
