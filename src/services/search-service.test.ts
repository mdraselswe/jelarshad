import { describe, expect, it } from "vitest";

import { createMockRepositories } from "@/infrastructure/mock/repositories";

import {
  cleanQueryInput,
  collapseSameFoods,
  createSearchService,
  filterPlaces,
  type PlaceHit,
} from "./search-service";

const service = () => createSearchService({ repos: createMockRepositories() });

describe("cleanQueryInput", () => {
  it("trims, collapses spaces and caps the length", () => {
    expect(cleanQueryInput("  kacchi   biryani ")).toBe("kacchi biryani");
    expect(cleanQueryInput("a".repeat(200))).toHaveLength(60);
  });
});

describe("collapseSameFoods", () => {
  it("shows one food per name, keeping the one that has a description", () => {
    const foods = [
      { slug: "chap", nameBn: "চাপ", aboutBn: null },
      { slug: "chaap", nameBn: "চাপ", aboutBn: "হালকা ভাজা মাংসের টুকরো।" },
      { slug: "malai-chop", nameBn: "মালাই চপ", aboutBn: null },
    ];
    expect(collapseSameFoods(foods).map((food) => food.slug)).toEqual(["chaap", "malai-chop"]);
  });
});

describe("searchService.search", () => {
  it("returns nothing for input that is too short", async () => {
    expect((await service().search("")).total).toBe(0);
    expect((await service().search(" d ")).total).toBe(0);
  });

  it.each(["দই", "doi", "Doi", "  doi  "])("finds the food doi for %j", async (input) => {
    const { foods } = await service().search(input);
    expect(foods.map((f) => f.slug)).toContain("doi");
  });

  it("groups foods, places and districts", async () => {
    const outcome = await service().search("বগুড়া");
    expect(outcome.districts.map((d) => d.slug)).toContain("bogura");
    expect(outcome.total).toBe(
      outcome.foods.length + outcome.places.length + outcome.districts.length,
    );
  });

  it("finds a neighbourhood by name, and the places in it", async () => {
    const outcome = await service().search("সাতমাথা");
    expect(outcome.areas).toEqual([
      { slug: "satmatha", nameBn: "সাতমাথা", district: { slug: "bogura", nameBn: "বগুড়া" } },
    ]);
    expect(outcome.places.map((place) => place.slug)).toContain("sample-place");
    expect(outcome.total).toBe(
      outcome.foods.length +
        outcome.places.length +
        outcome.districts.length +
        outcome.areas.length,
    );
  });

  it("finds a place by name and keeps its district", async () => {
    const { places } = await service().search("নমুনা দই ঘর");
    expect(places[0]).toMatchObject({ slug: "sample-place", district: { slug: "bogura" } });
  });

  it("reports the cleaned query used, so callers can record misses", async () => {
    const outcome = await service().search("zzzzqq");
    expect(outcome.total).toBe(0);
    expect(outcome.query.text).toBe("zzzzqq");
    expect(outcome.query.key).not.toBe("");
  });
});

describe("filterPlaces", () => {
  const place = (
    slug: string,
    type: PlaceHit["type"],
    min: number | null,
    max: number | null,
  ): PlaceHit => ({
    slug,
    nameBn: slug,
    type,
    district: { slug: "d", nameBn: "d" },
    price: { min, max },
  });
  const places = [
    place("cheap", "street_food", 60, 90),
    place("overlap", "restaurant", 120, 180),
    place("pricey", "restaurant", 400, 650),
    place("unknown", "shop", null, null),
  ];
  const slugs = (hits: PlaceHit[]) => hits.map((h) => h.slug);

  it("returns everything without filters", () => {
    expect(slugs(filterPlaces(places, {}))).toEqual(["cheap", "overlap", "pricey", "unknown"]);
  });

  it("filters by type", () => {
    expect(slugs(filterPlaces(places, { type: "restaurant" }))).toEqual(["overlap", "pricey"]);
  });

  it("filters by price tier; ranges that straddle a boundary match both tiers", () => {
    expect(slugs(filterPlaces(places, { price: "budget" }))).toEqual(["cheap", "overlap"]);
    expect(slugs(filterPlaces(places, { price: "mid" }))).toEqual(["overlap"]);
    expect(slugs(filterPlaces(places, { price: "high" }))).toEqual(["pricey"]);
  });

  it("hides places with an unknown price when a price filter is on", () => {
    expect(slugs(filterPlaces(places, { price: "budget" }))).not.toContain("unknown");
  });

  it("combines type and price", () => {
    expect(slugs(filterPlaces(places, { type: "restaurant", price: "budget" }))).toEqual([
      "overlap",
    ]);
  });
});
