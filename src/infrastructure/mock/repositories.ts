import "server-only";

import { appConfig } from "@/config/app.config";
import type {
  AreaWithDistrict,
  Claim,
  District,
  Dish,
  DishWithFood,
  DishWithPlace,
  EditSuggestion,
  Food,
  MediaRef,
  Page,
  PageOpts,
  Place,
  PointKind,
  Report,
  SavedItem,
  Stamp,
} from "@/core/domain";
import type { Repositories, SearchHit } from "@/core/ports";
import { wilsonLowerBound } from "@/lib/ranking/wilson";
import { buildSearchFields } from "@/lib/text/normalize";

import * as fixtures from "./fixtures";

// In-memory repositories over fixtures (DB_PROVIDER=mock). Writes live for the server process only.

function paginate<T>(items: T[], opts: PageOpts = {}): Page<T> {
  const limit = Math.min(opts.limit ?? appConfig.pagination.default, appConfig.pagination.max);
  const start = Number(opts.cursor ?? 0) || 0;
  const pageItems = items.slice(start, start + limit);
  const next = start + limit;
  return { items: pageItems, nextCursor: next < items.length ? String(next) : null };
}

const byWilson = (a: Dish, b: Dish) => b.wilsonScore - a.wilsonScore;
const clone = <T>(value: T): T => structuredClone(value);
let sequence = 0;
const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(sequence++).toString(36)}`;

export function createMockRepositories(): Repositories {
  const db = {
    districts: clone(fixtures.districts),
    foods: clone(fixtures.foods),
    fame: clone(fixtures.regionalFame),
    places: clone(fixtures.places),
    dishes: clone(fixtures.dishes),
    experiences: clone(fixtures.experiences),
    claims: clone(fixtures.claims),
    votes: new Map<string, Map<string, "correct" | "partial" | "wrong">>(),
    edits: [] as EditSuggestion[],
    reports: [] as Report[],
    saved: [] as (SavedItem & { userId: string })[],
    placeCreators: new Map<string, string>(),
    foodAliases: new Map<string, string[]>(),
    foodMergedInto: new Map<string, string>(),
    banned: new Set<string>(),
    points: [] as {
      userId: string;
      kind: string;
      entity: string;
      entityId: string;
      points: number;
      revoked: boolean;
      createdAt: Date;
      districtId: number | null;
    }[],
    leaderboardOptIn: new Set<string>(),
    stamps: [] as (Stamp & { userId: string })[],
    media: [] as (MediaRef & { entity: string; entityId: string })[],
    rateEvents: [] as { userId: string; action: string; at: Date }[],
  };

  // Opted-in people with the most XP since a date, optionally only for one district.
  const topOf = (since: Date, limit: number, districtId: number | null) => {
    const totals = new Map<string, number>();
    for (const e of db.points) {
      if (e.revoked || e.createdAt < since || !db.leaderboardOptIn.has(e.userId)) continue;
      if (districtId !== null && e.districtId !== districtId) continue;
      totals.set(e.userId, (totals.get(e.userId) ?? 0) + e.points);
    }
    return [...totals.entries()]
      .map(([userId, xp]) => ({
        userId,
        displayName: userId === fixtures.demoUser.id ? fixtures.demoUser.displayName : userId,
        avatarUrl: userId === fixtures.demoUser.id ? fixtures.demoUser.avatarUrl : null,
        xp,
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit);
  };

  const foodWithStats = (food: Food): Food => {
    const ofFood = db.dishes.filter((d) => d.foodId === food.id && d.status === "active");
    return {
      ...food,
      experienceCount: ofFood.reduce((sum, d) => sum + d.experienceCount, 0),
      lovedCount: ofFood.reduce((sum, d) => sum + d.lovedCount, 0),
    };
  };
  const fameWhere = (predicate: (fame: (typeof db.fame)[number]) => boolean) =>
    db.fame.filter(predicate).flatMap(({ foodId, ...rest }) => {
      const food = db.foods.find((f) => f.id === foodId);
      return food ? [{ ...rest, food: foodWithStats(food) }] : [];
    });
  const placeOf = (dish: Dish): DishWithPlace["place"] => {
    const place = db.places.find((p) => p.id === dish.placeId);
    if (!place) throw new Error(`mock: dish ${dish.id} has no place`);
    return {
      id: place.id,
      slug: place.slug,
      nameBn: place.nameBn,
      type: place.type,
      district: place.district,
      area: place.area,
    };
  };
  const foodOf = (dish: Dish): DishWithFood["food"] => {
    const food = db.foods.find((f) => f.id === dish.foodId);
    if (!food) throw new Error(`mock: dish ${dish.id} has no food`);
    return { id: food.id, slug: food.slug, nameBn: food.nameBn };
  };
  const withPlace = (dish: Dish): DishWithPlace => ({ ...dish, place: placeOf(dish) });
  const active = <T extends { status: string }>(items: T[]) =>
    items.filter((i) => i.status === "active");
  const district = (id: number): District | undefined => db.districts.find((d) => d.id === id);

  const recount = (dish: Dish) => {
    const mine = active(db.experiences).filter((e) => e.dishId === dish.id);
    dish.lovedCount =
      mine.filter((e) => e.reaction === "loved").length + (fixtureBase.get(dish.id)?.loved ?? 0);
    dish.okayCount =
      mine.filter((e) => e.reaction === "okay").length + (fixtureBase.get(dish.id)?.okay ?? 0);
    dish.dislikedCount =
      mine.filter((e) => e.reaction === "disliked").length +
      (fixtureBase.get(dish.id)?.disliked ?? 0);
    dish.experienceCount = dish.lovedCount + dish.okayCount + dish.dislikedCount;
    dish.wilsonScore = wilsonLowerBound(dish.lovedCount, dish.experienceCount);
    dish.lastExperienceAt = new Date();
  };
  // Fixture dish counts stand for experiences we don't list individually; keep them as a base.
  const fixtureBase = new Map(
    db.dishes.map((d) => {
      const listed = db.experiences.filter((e) => e.dishId === d.id);
      const count = (r: string) => listed.filter((e) => e.reaction === r).length;
      return [
        d.id,
        {
          loved: d.lovedCount - count("loved"),
          okay: d.okayCount - count("okay"),
          disliked: d.dislikedCount - count("disliked"),
        },
      ];
    }),
  );

  /** Areas that active places point at, one entry each. */
  const mockAreas = () => {
    const seen = new Map<string, AreaWithDistrict>();
    for (const place of active(db.places)) {
      if (!place.area) continue;
      const key = `${place.district.id}/${place.area.id}`;
      if (seen.has(key)) continue;
      seen.set(key, {
        id: place.area.id,
        districtId: place.district.id,
        slug: place.area.slug,
        nameBn: place.area.nameBn,
        nameEn: null,
        district: { ...place.district },
      });
    }
    return clone([...seen.values()]);
  };

  return {
    districts: {
      list: async () => clone(db.districts),
      bySlug: async (slug) => clone(db.districts.find((d) => d.slug === slug) ?? null),
      fame: async (districtId) => fameWhere((f) => f.districtId === districtId),
      allFame: async () => fameWhere(() => true),
      // The mock keeps areas on its places, so areas are derived from them.
      areaBySlug: async (districtId, areaSlug) =>
        mockAreas().find((a) => a.districtId === districtId && a.slug === areaSlug) ?? null,
      areasMatching: async (text, limit) => {
        const needle = text.trim();
        return mockAreas()
          .filter((a) => a.nameBn.includes(needle) || a.slug === needle.toLowerCase())
          .slice(0, limit);
      },
      areasOf: async (districtId, limit) =>
        mockAreas()
          .filter((a) => a.districtId === districtId)
          .sort((a, b) => a.nameBn.localeCompare(b.nameBn, "bn"))
          .slice(0, limit),
      areaSlugs: async (limit) =>
        mockAreas()
          .slice(0, limit)
          .map((a) => ({ districtSlug: a.district.slug, areaSlug: a.slug })),
    },

    foods: {
      redirectFor: async (slug) => {
        const merged = db.foods.find((f) => f.slug === slug && f.status === "merged");
        const targetId = merged && db.foodMergedInto.get(merged.id);
        return db.foods.find((f) => f.id === targetId)?.slug ?? null;
      },
      addAlias: async (foodId, alias) => {
        const list = db.foodAliases.get(foodId) ?? [];
        if (!list.includes(alias)) db.foodAliases.set(foodId, [...list, alias]);
      },
      slugs: async (limit) =>
        db.foods
          .filter((f) => f.status === "active")
          .map(foodWithStats)
          .sort((a, b) => b.experienceCount - a.experienceCount || a.slug.localeCompare(b.slug))
          .slice(0, limit)
          .map((f) => f.slug),
      bySlug: async (slug) => {
        const food = db.foods.find((f) => f.slug === slug && f.status === "active");
        return food ? foodWithStats(food) : null;
      },
      byId: async (id) => {
        const food = db.foods.find((f) => f.id === id && f.status === "active");
        return food ? foodWithStats(food) : null;
      },
      update: async (id, patch) => {
        const food = db.foods.find((f) => f.id === id);
        if (!food) return;
        if (patch.nameBn !== undefined) food.nameBn = patch.nameBn;
        if (patch.aboutBn !== undefined) food.aboutBn = patch.aboutBn;
      },
      topDishes: async (foodId, opts = {}) =>
        paginate(
          active(db.dishes)
            .filter((d) => d.foodId === foodId)
            .map(withPlace)
            .filter((d) => opts.districtId === undefined || d.place.district.id === opts.districtId)
            .sort(byWilson),
          opts,
        ),
      create: async (input, createdBy) => {
        void createdBy;
        const food: Food = {
          id: newId("f"),
          slug: input.slug,
          nameBn: input.nameBn,
          nameEn: input.nameEn ?? null,
          aboutBn: null,
          cover: null,
          status: "active",
          experienceCount: 0,
          lovedCount: 0,
        };
        db.foods.push(food);
        return clone(food);
      },
    },

    places: {
      slugs: async (limit) =>
        active(db.places)
          .map((p) => p.slug)
          .sort()
          .slice(0, limit),
      bySlug: async (slug) => clone(active(db.places).find((p) => p.slug === slug) ?? null),
      byId: async (id) => clone(active(db.places).find((p) => p.id === id) ?? null),
      inDistrict: async (districtId, opts) =>
        paginate(clone(active(db.places).filter((p) => p.district.id === districtId)), opts),
      inArea: async (areaId, opts) =>
        paginate(clone(active(db.places).filter((p) => p.area?.id === areaId)), opts),
      brandSlugs: async (limit) =>
        Array.from(new Set(active(db.places).flatMap((p) => (p.brand ? [p.brand.slug] : []))))
          .sort()
          .slice(0, limit),
      byBrand: async (brandSlug) => {
        const items = active(db.places).filter((p) => p.brand?.slug === brandSlug);
        const brand = items[0]?.brand;
        return brand ? clone({ brand, items }) : null;
      },
      branches: async (placeId) => {
        const own = db.places.find((p) => p.id === placeId);
        if (!own?.brand) return null;
        const brand = own.brand;
        const items = active(db.places)
          .filter((p) => p.brand?.slug === brand.slug && p.id !== placeId)
          .map((p) => ({
            id: p.id,
            slug: p.slug,
            nameBn: p.nameBn,
            district: p.district,
            area: p.area,
          }));
        return items.length === 0 ? null : clone({ brand, items });
      },
      dishes: async (placeId) =>
        active(db.dishes)
          .filter((d) => d.placeId === placeId)
          .sort(byWilson)
          .map((d) => ({ ...clone(d), food: foodOf(d) })),
      similar: async (nameBn, districtId) => {
        const needle = nameBn.trim();
        const key = buildSearchFields(needle).searchKey;
        return clone(
          active(db.places).filter(
            (p) =>
              p.district.id === districtId &&
              (p.nameBn.includes(needle) ||
                needle.includes(p.nameBn) ||
                (key !== "" && buildSearchFields(p.nameBn, p.nameEn).searchKey.includes(key))),
          ),
        );
      },
      redirectFor: async (slug) => {
        const merged = db.places.find((p) => p.slug === slug && p.status === "merged");
        const target = merged && db.places.find((p) => p.id === merged.mergedIntoId);
        return target?.slug ?? null;
      },
      update: async (id, patch) => {
        const place = db.places.find((p) => p.id === id);
        if (!place) return;
        if (patch.nameBn !== undefined) place.nameBn = patch.nameBn;
        if (patch.address !== undefined) place.address = patch.address;
        if (patch.type !== undefined) place.type = patch.type;
      },
      byCreator: async (userId, opts) =>
        paginate(
          clone(
            active(db.places)
              .filter((place) => db.placeCreators.get(place.id) === userId)
              .reverse(),
          ),
          opts,
        ),
      create: async (input, createdBy) => {
        const home = district(input.districtId);
        if (!home) throw new Error(`mock: unknown district ${input.districtId}`);
        // The same area name in the same district is one area (as in the database).
        const areaNamed = (districtId: number, nameBn: string) => {
          const known = db.places.find(
            (p) => p.district.id === districtId && p.area?.nameBn === nameBn,
          )?.area;
          return known ?? { id: 1000 + db.places.length, slug: nameBn, nameBn };
        };
        const place: Place = {
          id: newId("p"),
          slug: input.slug,
          nameBn: input.nameBn,
          nameEn: input.nameEn ?? null,
          type: input.type,
          district: { id: home.id, slug: home.slug, nameBn: home.nameBn },
          area: input.areaName ? areaNamed(home.id, input.areaName) : null,
          address: input.address ?? null,
          location: input.location ?? null,
          openingHours: null,
          price: { min: null, max: null },
          status: "active",
          mergedIntoId: null,
        };
        db.places.push(place);
        db.placeCreators.set(place.id, createdBy);
        return clone(place);
      },
    },

    dishes: {
      byId: async (id) => {
        const dish = db.dishes.find((d) => d.id === id);
        return dish ? clone(withPlace(dish)) : null;
      },
      findOrCreate: async (placeId, foodId) => {
        let dish = db.dishes.find((d) => d.placeId === placeId && d.foodId === foodId);
        if (!dish) {
          dish = {
            id: newId("d"),
            placeId,
            foodId,
            displayName: null,
            price: { min: null, max: null },
            priceConfirmedAt: null,
            lovedCount: 0,
            okayCount: 0,
            dislikedCount: 0,
            experienceCount: 0,
            wilsonScore: 0,
            lastExperienceAt: null,
            status: "active",
          };
          db.dishes.push(dish);
          fixtureBase.set(dish.id, { loved: 0, okay: 0, disliked: 0 });
        }
        return clone(withPlace(dish));
      },
    },

    experiences: {
      byId: async (id) => clone(db.experiences.find((e) => e.id === id) ?? null),
      forDish: async (dishId, opts) =>
        paginate(clone(active(db.experiences).filter((e) => e.dishId === dishId)), opts),
      forFood: async (foodId, opts) => {
        const dishIds = new Set(db.dishes.filter((d) => d.foodId === foodId).map((d) => d.id));
        return paginate(clone(active(db.experiences).filter((e) => dishIds.has(e.dishId))), opts);
      },
      byUser: async (userId, opts) =>
        paginate(clone(active(db.experiences).filter((e) => e.user.id === userId)), opts),
      upsert: async (input) => {
        const dish = db.dishes.find((d) => d.id === input.dishId);
        if (!dish) throw new Error(`mock: unknown dish ${input.dishId}`);
        let experience = db.experiences.find(
          (e) => e.dishId === input.dishId && e.user.id === input.userId,
        );
        if (experience) {
          experience.reaction = input.reaction;
          experience.comment = input.comment ?? null;
          experience.pricePaid = input.pricePaid ?? null;
          experience.visitedOn = input.visitedOn ?? null;
        } else {
          experience = {
            id: newId("e"),
            dishId: input.dishId,
            user: { id: input.userId, displayName: fixtures.demoUser.displayName, avatarUrl: null },
            reaction: input.reaction,
            comment: input.comment ?? null,
            pricePaid: input.pricePaid ?? null,
            visitedOn: input.visitedOn ?? null,
            photos: [],
            status: "active",
            createdAt: new Date(),
          };
          db.experiences.unshift(experience);
        }
        recount(dish);
        return clone(experience);
      },
    },

    claims: {
      forEntity: async (entity, entityId) =>
        clone(db.claims.filter((c) => c.entity === entity && c.entityId === entityId)),
      byId: async (id) => clone(db.claims.find((c) => c.id === id) ?? null),
      ensure: async (input) => {
        let claim = db.claims.find(
          (c) =>
            c.entity === input.entity && c.entityId === input.entityId && c.type === input.type,
        );
        if (!claim) {
          claim = {
            id: newId("c"),
            entity: input.entity,
            entityId: input.entityId,
            type: input.type,
            value: input.value,
            status: "unverified",
            counts: { correct: 0, partial: 0, wrong: 0 },
            lastConfirmedAt: null,
            expiresAt: null,
            createdBy: input.createdBy ?? null,
          };
          db.claims.push(claim);
        }
        return clone(claim);
      },
      vote: async (vote) => {
        const claim = db.claims.find((c) => c.id === vote.claimId);
        if (!claim) throw new Error(`mock: unknown claim ${vote.claimId}`);
        const votes = db.votes.get(claim.id) ?? new Map<string, "correct" | "partial" | "wrong">();
        const previous = votes.get(vote.userId);
        if (previous) claim.counts[previous] -= 1;
        votes.set(vote.userId, vote.verdict);
        db.votes.set(claim.id, votes);
        claim.counts[vote.verdict] += 1;
        return clone(claim);
      },
      saveStatus: async (claimId, update) => {
        const claim = db.claims.find((c) => c.id === claimId);
        if (claim) Object.assign(claim, update satisfies Partial<Claim>);
      },
    },

    editSuggestions: {
      create: async (input) => {
        const edit: EditSuggestion = {
          ...input,
          id: newId("s"),
          status: "open",
          createdAt: new Date(),
        };
        db.edits.push(edit);
        return clone(edit);
      },
    },

    reports: {
      openFor: async (entity, entityId) =>
        clone(
          db.reports.filter(
            (r) => r.entity === entity && r.entityId === entityId && r.status === "open",
          ),
        ),
      create: async (input) => {
        const report: Report = { ...input, id: newId("r"), status: "open", createdAt: new Date() };
        db.reports.push(report);
        return clone(report);
      },
    },

    saved: {
      list: async (userId, opts) =>
        paginate(
          db.saved
            .filter((s) => s.userId === userId)
            .map(({ entity, entityId, kind, createdAt }) => ({
              entity,
              entityId,
              kind,
              createdAt,
            })),
          opts,
        ),
      isSaved: async (userId, entity, entityId) =>
        db.saved.some((s) => s.userId === userId && s.entity === entity && s.entityId === entityId),
      save: async (userId, entity, entityId) => {
        if (
          !db.saved.some(
            (s) => s.userId === userId && s.entity === entity && s.entityId === entityId,
          )
        ) {
          db.saved.push({ userId, entity, entityId, kind: "want_to_try", createdAt: new Date() });
        }
      },
      remove: async (userId, entity, entityId) => {
        db.saved = db.saved.filter(
          (s) => !(s.userId === userId && s.entity === entity && s.entityId === entityId),
        );
      },
    },

    media: {
      create: async ({ entity, entityId, id, key, width, height, dominantColor }) => {
        const media = { id, key, width, height, dominantColor, entity, entityId };
        db.media.push(media);
        const ref = { id, key, width, height, dominantColor };
        if (entity === "experience") {
          db.experiences.find((e) => e.id === entityId)?.photos.push(ref);
        }
        return ref;
      },
      forEntity: async (entity, entityId) =>
        db.media
          .filter((m) => m.entity === entity && m.entityId === entityId)
          .map(({ id, key, width, height, dominantColor }) => ({
            id,
            key,
            width,
            height,
            dominantColor,
          })),
    },

    search: {
      // Same inputs as SQL search_all (normalized text + phonetic key), matched by substring
      // instead of trigram similarity.
      search: async ({ text, key }, opts) => {
        const q = text.trim().toLowerCase();
        const matches = (...names: (string | null)[]) => {
          const fields = buildSearchFields(...names);
          return fields.searchText.includes(q) || (key !== "" && fields.searchKey.includes(key));
        };
        const hits: SearchHit[] = q
          ? [
              ...db.foods
                .filter(
                  (f) =>
                    f.status === "active" &&
                    matches(f.nameBn, f.nameEn, f.slug, ...(db.foodAliases.get(f.id) ?? [])),
                )
                .map((f) => ({ kind: "food" as const, food: foodWithStats(f) })),
              ...active(db.places)
                .filter((p) => matches(p.nameBn, p.nameEn, p.slug))
                .map((p) => ({ kind: "place" as const, place: clone(p) })),
              ...db.districts
                .filter((d) => matches(d.nameBn, d.nameEn, d.slug))
                .map((d) => ({ kind: "district" as const, district: clone(d) })),
            ]
          : [];
        return paginate(hits, opts);
      },
      recordMiss: async () => {},
    },

    rewards: {
      award: async ({ userId, kind, entity, entityId, points, districtId = null }) => {
        if (
          db.points.some((e) => e.userId === userId && e.kind === kind && e.entityId === entityId)
        ) {
          return 0;
        }
        db.points.push({
          userId,
          kind,
          entity,
          entityId,
          points,
          revoked: false,
          createdAt: new Date(),
          districtId,
        });
        return points;
      },
      revoke: async (entity, entityId) => {
        let taken = 0;
        for (const event of db.points) {
          if (event.entity === entity && event.entityId === entityId && !event.revoked) {
            event.revoked = true;
            taken += event.points;
          }
        }
        return taken;
      },
      unlockStamp: async ({ userId, districtId, kind, foodId = null }) => {
        if (
          db.stamps.some(
            (s) => s.userId === userId && s.districtId === districtId && s.kind === kind,
          )
        ) {
          return false;
        }
        db.stamps.push({ userId, districtId, kind, foodId, createdAt: new Date() });
        return true;
      },
      stamps: async (userId) =>
        clone(
          db.stamps
            .filter((s) => s.userId === userId)
            .map((s) => ({
              districtId: s.districtId,
              kind: s.kind,
              foodId: s.foodId,
              createdAt: s.createdAt,
            })),
        ),
      total: async (userId) =>
        (userId === fixtures.demoUser.id ? fixtures.demoUser.pointsTotal : 0) +
        db.points
          .filter((e) => e.userId === userId && !e.revoked)
          .reduce((sum, e) => sum + e.points, 0),
      events: async (userId, since, limit) =>
        db.points
          .filter((e) => e.userId === userId && !e.revoked && e.createdAt >= since)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, limit)
          .map((e) => ({
            kind: e.kind as PointKind,
            entityId: e.entityId,
            points: e.points,
            createdAt: new Date(e.createdAt),
          })),
      kindCounts: async (userId) => {
        const counts: Partial<Record<PointKind, number>> = {};
        for (const e of db.points) {
          if (e.userId !== userId || e.revoked) continue;
          const kind = e.kind as PointKind;
          counts[kind] = (counts[kind] ?? 0) + 1;
        }
        return counts;
      },
      weeklyTop: async (since, limit) => topOf(since, limit, null),
      districtTop: async (districtId, since, limit) => topOf(since, limit, districtId),
      leaderboardOptIn: async (userId) => db.leaderboardOptIn.has(userId),
      setLeaderboardOptIn: async (userId, optIn) => {
        if (optIn) db.leaderboardOptIn.add(userId);
        else db.leaderboardOptIn.delete(userId);
      },
    },

    rateLimits: {
      countSince: async (userId, action, since) =>
        db.rateEvents.filter((e) => e.userId === userId && e.action === action && e.at >= since)
          .length,
      record: async (userId, action) => {
        db.rateEvents.push({ userId, action, at: new Date() });
      },
    },

    admin: {
      counts: async () => ({
        users: new Set([...db.experiences.map((e) => e.user.id), ...db.placeCreators.values()])
          .size,
        places: active(db.places).length,
        foods: active(db.foods).length,
        dishes: active(db.dishes).length,
        experiences: active(db.experiences).length,
        media: db.media.length,
        openReports: db.reports.filter((r) => r.status === "open").length,
        openEdits: db.edits.filter((e) => e.status === "open").length,
        disputedClaims: db.claims.filter((c) => c.status === "disputed" || c.status === "mixed")
          .length,
      }),
      recentPlaces: async (sinceDays, limit) => {
        void sinceDays;
        return clone([...active(db.places)].reverse().slice(0, limit));
      },
      disputedClaims: async (limit) =>
        clone(
          db.claims.filter((c) => c.status === "disputed" || c.status === "mixed").slice(0, limit),
        ),
      mergePlaces: async (fromId, intoId) => {
        const from = db.places.find((p) => p.id === fromId);
        const into = db.places.find((p) => p.id === intoId);
        if (!from || !into || fromId === intoId || into.status !== "active") {
          throw new Error("mock: cannot merge");
        }
        let handled = 0;
        for (const dish of db.dishes.filter((d) => d.placeId === fromId)) {
          const target = db.dishes.find((d) => d.placeId === intoId && d.foodId === dish.foodId);
          if (!target) dish.placeId = intoId;
          else {
            db.experiences = db.experiences.filter(
              (e) =>
                e.dishId !== dish.id ||
                !db.experiences.some((k) => k.dishId === target.id && k.user.id === e.user.id),
            );
            for (const experience of db.experiences) {
              if (experience.dishId === dish.id) experience.dishId = target.id;
            }
            db.dishes = db.dishes.filter((d) => d.id !== dish.id);
            recount(target);
          }
          handled += 1;
        }
        from.status = "merged";
        from.mergedIntoId = intoId;
        return handled;
      },
      mergeFoods: async (fromId, intoId) => {
        const from = db.foods.find((f) => f.id === fromId);
        const into = db.foods.find((f) => f.id === intoId);
        if (!from || !into || fromId === intoId || into.status !== "active") {
          throw new Error("mock: cannot merge");
        }
        let handled = 0;
        for (const dish of db.dishes.filter((d) => d.foodId === fromId)) {
          const target = db.dishes.find((d) => d.placeId === dish.placeId && d.foodId === intoId);
          if (!target) dish.foodId = intoId;
          else {
            for (const experience of db.experiences) {
              if (experience.dishId === dish.id) experience.dishId = target.id;
            }
            db.dishes = db.dishes.filter((d) => d.id !== dish.id);
            recount(target);
          }
          handled += 1;
        }
        from.status = "merged";
        db.foodMergedInto.set(fromId, intoId);
        return handled;
      },
      similarFoodPairs: async (_min, limit) => {
        const foods = db.foods.filter((f) => f.status === "active");
        const pairs = [];
        for (const [index, a] of foods.entries()) {
          for (const b of foods.slice(index + 1)) {
            const keyA = buildSearchFields(a.nameBn).searchKey;
            const keyB = buildSearchFields(b.nameBn).searchKey;
            if (keyA !== "" && keyA === keyB) {
              pairs.push({
                a: { id: a.id, slug: a.slug, nameBn: a.nameBn, experienceCount: 0 },
                b: { id: b.id, slug: b.slug, nameBn: b.nameBn, experienceCount: 0 },
                similarity: 1,
              });
            }
          }
        }
        return pairs.slice(0, limit);
      },
      restore: async (entity, entityId) => {
        const rows: { id: string; status: string }[] =
          entity === "place"
            ? db.places
            : entity === "food"
              ? db.foods
              : entity === "dish"
                ? db.dishes
                : entity === "experience"
                  ? db.experiences
                  : [];
        const row = rows.find((candidate) => candidate.id === entityId);
        if (row) row.status = "active";
      },
      setBanned: async (userId, banned) => {
        if (banned) db.banned.add(userId);
        else db.banned.delete(userId);
      },
      setReportStatus: async (id, status) => {
        const report = db.reports.find((r) => r.id === id);
        if (report) report.status = status;
      },
      editSuggestion: async (id) => clone(db.edits.find((e) => e.id === id) ?? null),
      setEditStatus: async (id, status) => {
        const edit = db.edits.find((e) => e.id === id);
        if (edit) edit.status = status;
      },
      setFame: async ({ districtId, foodId, noteBn }) => {
        const existing = db.fame.find((f) => f.districtId === districtId && f.foodId === foodId);
        if (existing) existing.noteBn = noteBn;
        else db.fame.push({ districtId, areaId: null, foodId, noteBn, sourceUrl: null });
      },
      removeFame: async (districtId, foodId) => {
        db.fame = db.fame.filter((f) => !(f.districtId === districtId && f.foodId === foodId));
      },
      purgeRateEvents: async (olderThanDays) => {
        const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
        const before = db.rateEvents.length;
        db.rateEvents = db.rateEvents.filter((event) => event.at.getTime() >= cutoff);
        return before - db.rateEvents.length;
      },
      orphanMedia: async (limit) =>
        db.media
          .filter(
            (m) =>
              m.entity === "experience" &&
              !db.experiences.some((e) => e.id === m.entityId && e.status === "active"),
          )
          .slice(0, limit)
          .map((m) => ({ id: m.id, key: m.key })),
      deleteMedia: async (id) => {
        db.media = db.media.filter((m) => m.id !== id);
      },
      hide: async (entity, entityId) => {
        const rows: { id: string; status: string }[] =
          entity === "place"
            ? db.places
            : entity === "food"
              ? db.foods
              : entity === "dish"
                ? db.dishes
                : entity === "experience"
                  ? db.experiences
                  : [];
        const row = rows.find((candidate) => candidate.id === entityId);
        if (row) row.status = "hidden";
      },
      openReports: async (opts) =>
        paginate(clone(db.reports.filter((r) => r.status === "open")), opts),
      openEditSuggestions: async (opts) =>
        paginate(clone(db.edits.filter((e) => e.status === "open")), opts),
    },
  };
}
