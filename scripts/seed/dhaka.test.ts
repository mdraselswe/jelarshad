import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { buildDhakaSql, DHAKA_SETS, migrationPath } from "./build-dhaka-sql";
import { FOODS, PLACES } from "./data";

const unique = (values: string[]) => new Set(values).size === values.length;

const allPlaces = DHAKA_SETS.flatMap((set) => set.places);
const allFoods = [...FOODS, ...DHAKA_SETS.flatMap((set) => set.foods)];
const allAreas = DHAKA_SETS.flatMap((set) =>
  set.areas.map((area) => ({ ...area, key: `${set.districtSlug ?? "dhaka"}/${area.slug}` })),
);
const foodSlugs = new Set(allFoods.map((food) => food.slug));
const areaKeys = new Set(allAreas.map((area) => area.key));

describe("Dhaka seed data (all parts)", () => {
  it("has unique slugs, also against the first seed", () => {
    expect(unique(allPlaces.map((place) => place.slug))).toBe(true);
    expect(unique(allFoods.map((food) => food.slug))).toBe(true);
    expect(unique(allAreas.map((area) => area.key))).toBe(true);
    for (const place of allPlaces) expect(PLACES.map((p) => p.slug)).not.toContain(place.slug);
  });

  it("puts every place in a known area and ties every dish to a known food", () => {
    for (const set of DHAKA_SETS) {
      for (const place of set.places) {
        expect(place.district, place.slug).toBe(set.districtSlug ?? "dhaka");
        expect(areaKeys.has(`${place.district}/${place.area}`), place.slug).toBe(true);
      }
    }
    for (const place of allPlaces) {
      expect(place.famousFor.length, place.slug).toBeGreaterThan(0);
      for (const food of place.famousFor)
        expect(foodSlugs.has(food), `${place.slug}: ${food}`).toBe(true);
    }
    for (const set of DHAKA_SETS) {
      for (const entry of set.existingAreas) {
        expect(areaKeys.has(`${set.districtSlug ?? "dhaka"}/${entry.area}`)).toBe(true);
        expect(PLACES.some((place) => place.slug === entry.slug)).toBe(true);
      }
    }
  });

  it("gives every famous-for entry an https source and a known food", () => {
    for (const set of DHAKA_SETS) {
      for (const fame of [...set.fame, ...set.fameSources]) {
        expect(foodSlugs.has(fame.food), fame.food).toBe(true);
        expect(fame.sourceUrl, fame.food).toMatch(/^https:\/\//);
      }
    }
  });

  it("writes Bangla names in Bangla letters and plain URL slugs", () => {
    for (const place of allPlaces) {
      expect(place.slug).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(place.nameBn).toMatch(/[ঀ-৿]/);
    }
  });
});

describe("food de-duplication in generated migrations", () => {
  const fake = {
    ...DHAKA_SETS[0],
    number: "0061",
    migration: "0061_seed_fake.sql",
  } as (typeof DHAKA_SETS)[number];

  it("folds foods with the same name into one from migration 0061 on", () => {
    expect(buildDhakaSql(fake)).toContain("perform merge_foods(");
  });

  it("leaves the migrations that already ran untouched", () => {
    for (const set of DHAKA_SETS.filter((candidate) => Number(candidate.number) < 61))
      expect(buildDhakaSql(set)).not.toContain("merge_foods");
  });
});

describe.each(DHAKA_SETS.map((set) => [set.migration, set] as const))("migration %s", (_, set) => {
  it("invents nothing: no experiences or claims", () => {
    const sql = buildDhakaSql(set);
    expect(sql).toMatch(/is_seed/);
    expect(sql).not.toMatch(/insert into experiences|insert into claims/i);
  });

  it("has no empty value lists (they are invalid SQL)", () => {
    // "values" followed by a blank line means a list with no rows
    expect(buildDhakaSql(set)).not.toMatch(/values\n\n/);
  });

  it("matches the committed file (run pnpm db:seed after changing the data)", () => {
    expect(readFileSync(migrationPath(set), "utf8")).toBe(buildDhakaSql(set));
  });
});
