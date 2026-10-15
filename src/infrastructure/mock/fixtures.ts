import type {
  AppUser,
  Claim,
  District,
  Dish,
  Experience,
  Food,
  Place,
  RegionalFame,
} from "@/core/domain";
import { wilsonLowerBound } from "@/lib/ranking/wilson";

// Fixture data for DB_PROVIDER=mock (CI, e2e, Lighthouse, /dev pages, offline work). Includes the
// paths the pipeline checks: /food/doi, /place/sample-place, /district/bogura. Sample names are
// placeholders, not real businesses or reviews.

/** Stable UUIDs, so the same fixtures load into a real database (scripts/fixtures-sql.ts). */
export const fixtureIds = {
  foods: {
    doi: "10000000-0000-4000-8000-000000000001",
    kacchi: "10000000-0000-4000-8000-000000000002",
    mezbani: "10000000-0000-4000-8000-000000000003",
    kachagolla: "10000000-0000-4000-8000-000000000004",
  },
  places: {
    sample: "20000000-0000-4000-8000-000000000001",
    second: "20000000-0000-4000-8000-000000000002",
    kacchi: "20000000-0000-4000-8000-000000000003",
    mezbani: "20000000-0000-4000-8000-000000000004",
  },
  dishes: {
    sampleDoi: "30000000-0000-4000-8000-000000000001",
    secondDoi: "30000000-0000-4000-8000-000000000002",
    kacchi: "30000000-0000-4000-8000-000000000003",
    mezbani: "30000000-0000-4000-8000-000000000004",
  },
  users: {
    demo: "40000000-0000-4000-8000-000000000001",
    contract: "40000000-0000-4000-8000-000000000002",
  },
  experiences: {
    first: "50000000-0000-4000-8000-000000000001",
  },
  claims: {
    price: "60000000-0000-4000-8000-000000000001",
    availability: "60000000-0000-4000-8000-000000000002",
  },
} as const;

const district = (
  id: number,
  slug: string,
  nameBn: string,
  nameEn: string,
  divisionBn: string,
  divisionEn: string,
  placeCount: number,
): District => ({ id, slug, nameBn, nameEn, divisionBn, divisionEn, placeCount });

export const districts: District[] = [
  district(1, "dhaka", "ঢাকা", "Dhaka", "ঢাকা", "Dhaka", 1),
  district(2, "bogura", "বগুড়া", "Bogura", "রাজশাহী", "Rajshahi", 2),
  district(3, "chattogram", "চট্টগ্রাম", "Chattogram", "চট্টগ্রাম", "Chattogram", 1),
  district(4, "natore", "নাটোর", "Natore", "রাজশাহী", "Rajshahi", 0),
];

const food = (
  id: string,
  slug: string,
  nameBn: string,
  nameEn: string,
  aboutBn: string | null,
): Food => ({
  id,
  slug,
  nameBn,
  nameEn,
  aboutBn,
  cover: null,
  status: "active",
  experienceCount: 0,
  lovedCount: 0,
});

export const foods: Food[] = [
  food(fixtureIds.foods.doi, "doi", "দই", "Doi", "বগুড়ার মিষ্টি দই সারা দেশে পরিচিত।"),
  food(fixtureIds.foods.kacchi, "kacchi", "কাচ্চি বিরিয়ানি", "Kacchi Biryani", null),
  food(
    fixtureIds.foods.mezbani,
    "mezbani",
    "মেজবানি মাংস",
    "Mezbani Beef",
    "চট্টগ্রামের ঐতিহ্যবাহী ভোজের মাংস।",
  ),
  food(
    fixtureIds.foods.kachagolla,
    "kachagolla",
    "কাঁচাগোল্লা",
    "Kachagolla",
    "নাটোরের বিখ্যাত মিষ্টি।",
  ),
];

export const regionalFame: (Omit<RegionalFame, "food"> & { foodId: string })[] = [
  { districtId: 2, areaId: null, foodId: fixtureIds.foods.doi, noteBn: null, sourceUrl: null },
  { districtId: 3, areaId: null, foodId: fixtureIds.foods.mezbani, noteBn: null, sourceUrl: null },
  {
    districtId: 4,
    areaId: null,
    foodId: fixtureIds.foods.kachagolla,
    noteBn: null,
    sourceUrl: null,
  },
];

const placeIn = (d: District): Place["district"] => ({ id: d.id, slug: d.slug, nameBn: d.nameBn });
const [dhaka, bogura, chattogram] = districts as [District, District, District, District];

export const places: Place[] = [
  {
    id: fixtureIds.places.sample,
    slug: "sample-place",
    nameBn: "নমুনা দই ঘর",
    nameEn: "Sample Doi Ghor",
    type: "shop",
    district: placeIn(bogura),
    area: { id: 1, slug: "satmatha", nameBn: "সাতমাথা" },
    address: null,
    location: null,
    openingHours: { sat: [["09:00", "22:00"]], sun: [["09:00", "22:00"]] },
    price: { min: 120, max: 180 },
    status: "active",
    mergedIntoId: null,
  },
  {
    id: fixtureIds.places.second,
    slug: "second-sample-place",
    nameBn: "নমুনা মিষ্টিমুখ",
    nameEn: null,
    type: "shop",
    district: placeIn(bogura),
    area: null,
    address: null,
    location: null,
    openingHours: null,
    price: { min: 100, max: 150 },
    status: "active",
    mergedIntoId: null,
  },
  {
    id: fixtureIds.places.kacchi,
    slug: "sample-kacchi-house",
    nameBn: "নমুনা কাচ্চি ঘর",
    nameEn: null,
    type: "restaurant",
    district: placeIn(dhaka),
    area: null,
    address: null,
    location: null,
    openingHours: null,
    price: { min: 250, max: 380 },
    status: "active",
    mergedIntoId: null,
    brand: { slug: "sample-chain", nameBn: "নমুনা চেইন" },
  },
  {
    id: fixtureIds.places.mezbani,
    slug: "sample-mezbani",
    nameBn: "নমুনা মেজবান",
    nameEn: null,
    type: "restaurant",
    district: placeIn(chattogram),
    area: null,
    address: null,
    location: null,
    openingHours: null,
    price: { min: 300, max: 450 },
    status: "active",
    mergedIntoId: null,
    brand: { slug: "sample-chain", nameBn: "নমুনা চেইন" },
  },
];

const dish = (
  id: string,
  placeId: string,
  foodId: string,
  loved: number,
  okay: number,
  disliked: number,
): Dish => ({
  id,
  placeId,
  foodId,
  displayName: null,
  price: { min: null, max: null },
  priceConfirmedAt: null,
  lovedCount: loved,
  okayCount: okay,
  dislikedCount: disliked,
  experienceCount: loved + okay + disliked,
  wilsonScore: wilsonLowerBound(loved, loved + okay + disliked),
  lastExperienceAt: new Date("2026-10-01T10:00:00Z"),
  status: "active",
});

export const dishes: Dish[] = [
  {
    ...dish(fixtureIds.dishes.sampleDoi, fixtureIds.places.sample, fixtureIds.foods.doi, 23, 2, 0),
    price: { min: 120, max: 180 },
  },
  dish(fixtureIds.dishes.secondDoi, fixtureIds.places.second, fixtureIds.foods.doi, 3, 0, 0),
  dish(fixtureIds.dishes.kacchi, fixtureIds.places.kacchi, fixtureIds.foods.kacchi, 40, 8, 4),
  dish(fixtureIds.dishes.mezbani, fixtureIds.places.mezbani, fixtureIds.foods.mezbani, 12, 3, 1),
];

export const demoUser: AppUser = {
  id: fixtureIds.users.demo,
  displayName: "নমুনা ব্যবহারকারী",
  avatarUrl: null,
  role: "user",
  homeDistrictId: 2,
  isBanned: false,
  pointsTotal: 30,
};

export const experiences: Experience[] = [
  {
    id: fixtureIds.experiences.first,
    dishId: fixtureIds.dishes.sampleDoi,
    user: { id: demoUser.id, displayName: demoUser.displayName, avatarUrl: null },
    reaction: "loved",
    comment: "টক-মিষ্টি ঠিকঠাক, হাঁড়ির দই।",
    pricePaid: 150,
    visitedOn: new Date("2026-09-28"),
    photos: [],
    status: "active",
    createdAt: new Date("2026-09-28T12:00:00Z"),
  },
];

export const claims: Claim[] = [
  {
    id: fixtureIds.claims.price,
    entity: "dish",
    entityId: fixtureIds.dishes.sampleDoi,
    type: "price",
    value: { min: 120, max: 180 },
    status: "confirmed",
    counts: { correct: 5, partial: 1, wrong: 0 },
    lastConfirmedAt: new Date("2026-09-20T00:00:00Z"),
    expiresAt: new Date("2026-10-20T00:00:00Z"),
    createdBy: null,
  },
  {
    id: fixtureIds.claims.availability,
    entity: "place",
    entityId: fixtureIds.places.sample,
    type: "availability",
    value: { available: true },
    status: "unverified",
    counts: { correct: 1, partial: 0, wrong: 0 },
    lastConfirmedAt: null,
    expiresAt: null,
    createdBy: null,
  },
];
