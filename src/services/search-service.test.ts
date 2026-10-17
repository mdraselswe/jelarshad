import { describe, expect, it } from "vitest";

import { createMockRepositories } from "@/infrastructure/mock/repositories";

import {
  cleanQueryInput,
  collapseSameFoods,
  createSearchService,
  filterPlaces,
  groupBranches,
  sortPlaces,
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
    areaNameBn: null,
    brand: null,
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

describe("groupBranches", () => {
  const hit = (slug: string, area: string, brand: string | null): PlaceHit => ({
    slug,
    nameBn: slug,
    type: "restaurant",
    district: { slug: "dhaka", nameBn: "ঢাকা" },
    areaNameBn: area,
    brand: brand ? { slug: brand, nameBn: brand } : null,
    price: { min: null, max: null },
  });

  it("collapses two or more branches of one chain into one row at the first one's position", () => {
    const items = groupBranches([
      hit("a", "মিরপুর", "khanas"),
      hit("solo", "ধানমন্ডি", null),
      hit("b", "উত্তরা", "khanas"),
    ]);
    expect(items.map((item) => item.kind)).toEqual(["brand", "place"]);
    const brand = items[0];
    expect(brand?.kind === "brand" && brand.group.areas).toEqual(["মিরপুর", "উত্তরা"]);
  });

  it("keeps a single branch as a normal place row", () => {
    const items = groupBranches([hit("a", "মিরপুর", "khanas"), hit("b", "উত্তরা", "kudos")]);
    expect(items.map((item) => item.kind)).toEqual(["place", "place"]);
  });
});

describe("sortPlaces", () => {
  const hit = (slug: string, min: number | null, max: number | null = min): PlaceHit => ({
    slug,
    nameBn: slug,
    type: "restaurant",
    district: { slug: "d", nameBn: "d" },
    areaNameBn: null,
    brand: null,
    price: { min, max },
  });
  const places = [hit("c", 300), hit("a", null), hit("b", 100), hit("d", null, 250)];
  const slugs = (list: PlaceHit[]) => list.map((place) => place.slug);

  it("keeps the search order for relevance", () => {
    expect(slugs(sortPlaces(places, "relevance"))).toEqual(["c", "a", "b", "d"]);
  });

  it("sorts by name", () => {
    expect(slugs(sortPlaces(places, "name"))).toEqual(["a", "b", "c", "d"]);
  });

  it("sorts by lowest known price and always puts unknown prices last", () => {
    expect(slugs(sortPlaces(places, "price_low"))).toEqual(["b", "d", "c", "a"]);
    expect(slugs(sortPlaces(places, "price_high"))).toEqual(["c", "d", "b", "a"]);
  });

  it("does not change the list it was given", () => {
    const before = slugs(places);
    sortPlaces(places, "price_low");
    expect(slugs(places)).toEqual(before);
  });
});

describe("didYouMean", () => {
  it("offers the near name for a typo, and nothing for an exact or unrelated query", async () => {
    const repos = createMockRepositories();
    const search = createSearchService({ repos });
    const near = await search.didYouMean("dooi");
    expect(near.map((suggestion) => suggestion.nameBn)).toContain("দই");
    expect(await search.didYouMean("doi")).toEqual([]);
    expect(await search.didYouMean("zzzzqqxx")).toEqual([]);
    expect(await search.didYouMean("d")).toEqual([]);
  });
});

describe("popular searches", () => {
  it("lists words people search often and that mostly found something", async () => {
    const repos = createMockRepositories();
    const search = createSearchService({ repos });
    const record = (query: string, results: number) =>
      repos.insights.record({ name: "search", props: { query, results } });
    for (let i = 0; i < 4; i += 1) await record("biryani", 5);
    for (let i = 0; i < 5; i += 1) await record("unicorn", 0);
    await record("rare", 2);
    expect(await search.popular()).toEqual(["biryani"]);
  });
});
