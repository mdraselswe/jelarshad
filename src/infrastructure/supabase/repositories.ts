import "server-only";

import { appConfig } from "@/config/app.config";
import type {
  AreaWithDistrict,
  District,
  EditSuggestion,
  Food,
  Page,
  PageOpts,
  Place,
  PointKind,
  Report,
  StampKind,
} from "@/core/domain";
import type { Repositories, SearchHit } from "@/core/ports";
import { buildSearchFields } from "@/lib/text/normalize";
import { slugify } from "@/lib/text/slug";

import type { Db, SupabaseClients } from "./client.server";
import type { Database } from "./database.types";
import {
  DISH_WITH_FOOD_SELECT,
  DISH_WITH_PLACE_SELECT,
  EXPERIENCE_SELECT,
  PLACE_SELECT,
  toClaim,
  toDishWithFood,
  toDishWithPlace,
  toDistrict,
  toExperience,
  toFood,
  toMediaRef,
  toPlace,
  type DishWithFoodRow,
  type DishWithPlaceRow,
  type ExperienceRow,
  type PlaceRow,
} from "./mappers";

// Supabase repositories (DB_PROVIDER=supabase). Phase 1.2 = public reads through the anon client,
// so RLS applies exactly as for visitors. Writes arrive with the phase that needs them.

// Writes use the service client: every write comes from a server action that has already
// authenticated the user and applied the daily limit, so the user id it passes is trusted.
function writer(clients: SupabaseClients): Db {
  if (!clients.service) throw new Error("Supabase writes need SUPABASE_SERVICE_ROLE_KEY");
  return clients.service;
}

/** Throws on a query error; `data` is then non-null for list queries. */
function check<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`Supabase ${what}: ${result.error.message}`);
  return result.data as T;
}

/** Like `check`, for queries that must return exactly one row. */
function checkOne<T>(
  result: { data: T | null; error: { message: string } | null },
  what: string,
): NonNullable<T> {
  const data = check(result, what);
  if (data === null || data === undefined) throw new Error(`Supabase ${what}: no row returned`);
  return data as NonNullable<T>;
}

function pageWindow(opts: PageOpts = {}) {
  const limit = Math.min(opts.limit ?? appConfig.pagination.default, appConfig.pagination.max);
  const offset = Number(opts.cursor ?? 0) || 0;
  // Ask for one extra row to know whether a next page exists.
  return { limit, offset, from: offset, to: offset + limit };
}

type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
type EditRow = Database["public"]["Tables"]["edit_suggestions"]["Row"];

function toReport(row: ReportRow): Report {
  return {
    id: row.id,
    entity: row.entity,
    entityId: row.entity_id,
    reason: row.reason,
    note: row.note,
    userId: row.user_id,
    status: row.status,
    createdAt: new Date(row.created_at),
  };
}

function toEditSuggestion(row: EditRow): EditSuggestion {
  return {
    id: row.id,
    entity: row.entity,
    entityId: row.entity_id,
    field: row.field,
    currentValue: row.current_value,
    proposedValue: row.proposed_value,
    note: row.note,
    userId: row.user_id,
    status: row.status,
    createdAt: new Date(row.created_at),
  };
}

function toPage<T>(rows: T[], window: ReturnType<typeof pageWindow>): Page<T> {
  return {
    items: rows.slice(0, window.limit),
    nextCursor: rows.length > window.limit ? String(window.offset + window.limit) : null,
  };
}

type AreaRow = {
  id: number;
  district_id: number;
  slug: string;
  name_bn: string;
  name_en: string | null;
  districts: { id: number; slug: string; name_bn: string } | null;
};

function toAreaWithDistrict(row: AreaRow): AreaWithDistrict {
  if (!row.districts) throw new Error(`area ${row.id} has no district`);
  return {
    id: row.id,
    districtId: row.district_id,
    slug: row.slug,
    nameBn: row.name_bn,
    nameEn: row.name_en,
    district: { id: row.districts.id, slug: row.districts.slug, nameBn: row.districts.name_bn },
  };
}

export function createSupabaseRepositoriesFrom(clients: SupabaseClients): Repositories {
  const db: Db = clients.public;

  const placeBy = async (column: "slug" | "id", value: string): Promise<Place | null> => {
    const row = check(
      await db
        .from("places")
        .select(PLACE_SELECT)
        .eq(column, value)
        .eq("status", "active")
        .maybeSingle(),
      `place by ${column}`,
    );
    return row ? toPlace(row as unknown as PlaceRow) : null;
  };

  const foodBy = async (column: "slug" | "id", value: string): Promise<Food | null> => {
    const row = check(
      await db.from("foods").select("*").eq(column, value).eq("status", "active").maybeSingle(),
      `food by ${column}`,
    );
    return row ? toFood(row) : null;
  };

  /** Curated "famous for" rows with their (active) foods; one district or all of them. */
  const fameQuery = async (districtId: number | null) => {
    let query = db
      .from("regional_fame")
      .select("district_id, area_id, note_bn, source_url, foods!inner(*)")
      .eq("foods.status", "active");
    if (districtId !== null) query = query.eq("district_id", districtId);
    const rows = check(await query.order("sort_order"), "regional fame");
    return rows.map((row) => ({
      districtId: row.district_id,
      areaId: row.area_id,
      noteBn: row.note_bn,
      sourceUrl: row.source_url,
      food: toFood(row.foods),
    }));
  };

  const experiencesWhere = async (
    filter: { column: "dish_id" | "user_id"; values: string[] },
    opts?: PageOpts,
  ) => {
    const window = pageWindow(opts);
    if (filter.values.length === 0) return { items: [], nextCursor: null };
    const rows = check(
      await db
        .from("experiences")
        .select(EXPERIENCE_SELECT)
        .in(filter.column, filter.values)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(window.from, window.to),
      "experiences",
    );
    const experiences = (rows as unknown as ExperienceRow[]).map(toExperience);
    // Photos live in the generic media table (no foreign key to embed), so they are loaded together.
    if (experiences.length > 0) {
      const media = check(
        await db
          .from("media")
          .select("*")
          .eq("entity", "experience")
          .in(
            "entity_id",
            experiences.map((experience) => experience.id),
          )
          .eq("status", "active")
          .order("created_at"),
        "experience photos",
      );
      for (const experience of experiences) {
        experience.photos = media.filter((row) => row.entity_id === experience.id).map(toMediaRef);
      }
    }
    return toPage(experiences, window);
  };

  return {
    districts: {
      async list() {
        const rows = check(await db.from("districts").select("*").order("id"), "districts");
        return rows.map(toDistrict);
      },
      async bySlug(slug) {
        const row = check(
          await db.from("districts").select("*").eq("slug", slug).maybeSingle(),
          "district",
        );
        return row ? toDistrict(row) : null;
      },
      fame: (districtId) => fameQuery(districtId),
      allFame: () => fameQuery(null),
      async areaBySlug(districtId, areaSlug) {
        const row = check(
          await db
            .from("areas")
            .select("id, district_id, slug, name_bn, name_en, districts(id, slug, name_bn)")
            .eq("district_id", districtId)
            .eq("slug", areaSlug)
            .maybeSingle(),
          "area",
        );
        return row ? toAreaWithDistrict(row as unknown as AreaRow) : null;
      },
      async areasMatching(text, limit) {
        // Strip characters that mean something inside a PostgREST filter string.
        const needle = text.trim().replace(/[%_,()*]/g, "");
        if (needle === "") return [];
        const rows = check(
          await db
            .from("areas")
            .select("id, district_id, slug, name_bn, name_en, districts(id, slug, name_bn)")
            .or(`name_bn.ilike.%${needle}%,name_en.ilike.%${needle}%`)
            .order("name_bn")
            .limit(limit),
          "areas matching",
        );
        return (rows as unknown as AreaRow[]).map(toAreaWithDistrict);
      },
      async areasOf(districtId, limit) {
        const rows = check(
          await db
            .from("areas")
            .select("id, district_id, slug, name_bn, name_en, districts(id, slug, name_bn)")
            .eq("district_id", districtId)
            .order("name_bn")
            .limit(limit),
          "areas of district",
        );
        return (rows as unknown as AreaRow[]).map(toAreaWithDistrict);
      },
      async areaSlugs(limit) {
        const rows = check(
          await db.from("areas").select("slug, districts(slug)").order("id").limit(limit),
          "area slugs",
        );
        return (rows as unknown as { slug: string; districts: { slug: string } | null }[]).flatMap(
          (row) =>
            row.districts ? [{ districtSlug: row.districts.slug, areaSlug: row.slug }] : [],
        );
      },
    },

    foods: {
      async addAlias(foodId, alias, searchKey) {
        const { error } = await writer(clients)
          .from("aliases")
          .upsert(
            { entity: "food", entity_id: foodId, alias, search_key: searchKey },
            { onConflict: "entity,entity_id,search_key", ignoreDuplicates: true },
          );
        if (error) throw new Error(`Supabase add alias: ${error.message}`);
      },
      async redirectFor(slug) {
        const merged = check<{ merged_into: string | null } | null>(
          await db
            .from("foods")
            .select("merged_into")
            .eq("slug", slug)
            .eq("status", "merged")
            .maybeSingle(),
          "merged food",
        );
        if (!merged?.merged_into) return null;
        const target = check<{ slug: string } | null>(
          await db.from("foods").select("slug").eq("id", merged.merged_into).maybeSingle(),
          "food merge target",
        );
        return target?.slug ?? null;
      },
      async listActive(limit) {
        const rows = check(
          await db
            .from("foods")
            .select("*, dishes(count)")
            .eq("status", "active")
            .order("experience_count", { ascending: false })
            .order("slug")
            .limit(limit),
          "food list",
        );
        return (
          rows as unknown as (Database["public"]["Tables"]["foods"]["Row"] & {
            dishes: { count: number }[];
          })[]
        ).map((row) => ({ food: toFood(row), placeCount: row.dishes[0]?.count ?? 0 }));
      },
      async slugs(limit) {
        const rows = check(
          await db
            .from("foods")
            .select("slug")
            .eq("status", "active")
            .order("experience_count", { ascending: false })
            .order("slug")
            .limit(limit),
          "food slugs",
        );
        return rows.map((row) => row.slug);
      },
      bySlug: (slug) => foodBy("slug", slug),
      byId: (id) => foodBy("id", id),
      async topDishes(foodId, opts = {}) {
        const window = pageWindow(opts);
        let query = db
          .from("dishes")
          .select(DISH_WITH_PLACE_SELECT)
          .eq("food_id", foodId)
          .eq("status", "active")
          .eq("places.status", "active");
        if (opts.districtId !== undefined) query = query.eq("places.district_id", opts.districtId);
        const rows = check(
          await query.order("wilson_score", { ascending: false }).range(window.from, window.to),
          "top dishes",
        );
        return toPage((rows as unknown as DishWithPlaceRow[]).map(toDishWithPlace), window);
      },
      async update(id, patch) {
        const search = patch.nameBn ? buildSearchFields(patch.nameBn) : null;
        const { error } = await writer(clients)
          .from("foods")
          .update({
            ...(patch.nameBn !== undefined ? { name_bn: patch.nameBn } : {}),
            ...(patch.aboutBn !== undefined ? { about_bn: patch.aboutBn } : {}),
            ...(search ? { search_text: search.searchText, search_key: search.searchKey } : {}),
          })
          .eq("id", id);
        if (error) throw new Error(`Supabase update food: ${error.message}`);
      },
      async create(input, createdBy) {
        const search = buildSearchFields(input.nameBn, input.nameEn, input.slug);
        const row = checkOne(
          await writer(clients)
            .from("foods")
            .insert({
              slug: input.slug,
              name_bn: input.nameBn,
              name_en: input.nameEn ?? null,
              search_text: search.searchText,
              search_key: search.searchKey,
              created_by: createdBy,
            })
            .select("*")
            .single(),
          "create food",
        );
        return toFood(row);
      },
    },

    places: {
      async slugs(limit) {
        const rows = check(
          await db.from("places").select("slug").eq("status", "active").order("slug").limit(limit),
          "place slugs",
        );
        return rows.map((row) => row.slug);
      },
      bySlug: (slug) => placeBy("slug", slug),
      byId: (id) => placeBy("id", id),
      async inDistrict(districtId, opts) {
        const window = pageWindow(opts);
        const rows = check(
          await db
            .from("places")
            .select(PLACE_SELECT)
            .eq("district_id", districtId)
            .eq("status", "active")
            .order("name_bn")
            .range(window.from, window.to),
          "places in district",
        );
        return toPage((rows as unknown as PlaceRow[]).map(toPlace), window);
      },
      async inArea(areaId, opts) {
        const window = pageWindow(opts);
        const rows = check(
          await db
            .from("places")
            .select(PLACE_SELECT)
            .eq("area_id", areaId)
            .eq("status", "active")
            .order("name_bn")
            .range(window.from, window.to),
          "places in area",
        );
        return toPage((rows as unknown as PlaceRow[]).map(toPlace), window);
      },
      async brandList(limit) {
        const rows = check(
          await db
            .from("brands")
            .select("slug, name_bn, places(count)")
            .order("name_bn")
            .limit(limit),
          "brand list",
        );
        return (rows as unknown as { slug: string; name_bn: string; places: { count: number }[] }[])
          .map((row) => ({
            slug: row.slug,
            nameBn: row.name_bn,
            branchCount: row.places[0]?.count ?? 0,
          }))
          .filter((row) => row.branchCount > 0);
      },
      async brandSlugs(limit) {
        const rows = check(
          await db.from("brands").select("slug").order("slug").limit(limit),
          "brand slugs",
        );
        return rows.map((row) => row.slug);
      },
      async byBrand(brandSlug) {
        const brand = check<{ id: string; slug: string; name_bn: string } | null>(
          await db.from("brands").select("id, slug, name_bn").eq("slug", brandSlug).maybeSingle(),
          "brand by slug",
        );
        if (!brand) return null;
        const rows = check(
          await db
            .from("places")
            .select(PLACE_SELECT)
            .eq("brand_id", brand.id)
            .eq("status", "active")
            .order("name_bn")
            .limit(100),
          "brand branches",
        );
        return {
          brand: { slug: brand.slug, nameBn: brand.name_bn },
          items: (rows as unknown as PlaceRow[]).map(toPlace),
        };
      },
      async branches(placeId) {
        const own = check<{ brand_id: string | null } | null>(
          await db.from("places").select("brand_id").eq("id", placeId).maybeSingle(),
          "place brand",
        );
        if (!own?.brand_id) return null;
        const brand = check<{ slug: string; name_bn: string } | null>(
          await db.from("brands").select("slug, name_bn").eq("id", own.brand_id).maybeSingle(),
          "brand",
        );
        if (!brand) return null;
        const rows = check(
          await db
            .from("places")
            .select(PLACE_SELECT)
            .eq("brand_id", own.brand_id)
            .eq("status", "active")
            .neq("id", placeId)
            .order("name_bn")
            .limit(60),
          "place branches",
        );
        const items = (rows as unknown as PlaceRow[]).map(toPlace).map((place) => ({
          id: place.id,
          slug: place.slug,
          nameBn: place.nameBn,
          district: place.district,
          area: place.area,
        }));
        if (items.length === 0) return null;
        return { brand: { slug: brand.slug, nameBn: brand.name_bn }, items };
      },
      async dishes(placeId) {
        const rows = check(
          await db
            .from("dishes")
            .select(DISH_WITH_FOOD_SELECT)
            .eq("place_id", placeId)
            .eq("status", "active")
            .order("wilson_score", { ascending: false }),
          "place dishes",
        );
        return (rows as unknown as DishWithFoodRow[]).map(toDishWithFood);
      },
      async similar(nameBn, districtId) {
        const needle = nameBn.trim().replace(/[%_,()*]/g, "");
        if (!needle) return [];
        // The phonetic key makes the same name in another script or spelling collide
        // ("Mostakim", "মোস্তাকিম", "Mustakim"), as it does in search.
        const key = buildSearchFields(needle).searchKey.replace(/[%_,()*]/g, "");
        const match = key
          ? `name_bn.ilike.%${needle}%,search_key.ilike.%${key}%`
          : `name_bn.ilike.%${needle}%`;
        const rows = check(
          await db
            .from("places")
            .select(PLACE_SELECT)
            .eq("district_id", districtId)
            .eq("status", "active")
            .or(match)
            .limit(10),
          "similar places",
        );
        return (rows as unknown as PlaceRow[]).map(toPlace);
      },
      async redirectFor(slug) {
        const merged = check<{ merged_into: string | null } | null>(
          await db
            .from("places")
            .select("merged_into")
            .eq("slug", slug)
            .eq("status", "merged")
            .maybeSingle(),
          "merged place",
        );
        if (!merged?.merged_into) return null;
        const target = check<{ slug: string } | null>(
          await db.from("places").select("slug").eq("id", merged.merged_into).maybeSingle(),
          "merge target",
        );
        return target?.slug ?? null;
      },
      async update(id, patch) {
        const { error } = await writer(clients)
          .from("places")
          .update({
            ...(patch.nameBn !== undefined ? { name_bn: patch.nameBn } : {}),
            ...(patch.address !== undefined ? { address: patch.address } : {}),
            ...(patch.type !== undefined ? { type: patch.type } : {}),
            ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
            ...(patch.website !== undefined ? { website: patch.website } : {}),
            ...(patch.hoursText !== undefined ? { hours_text: patch.hoursText } : {}),
          })
          .eq("id", id);
        if (error) throw new Error(`Supabase update place: ${error.message}`);
      },
      async byCreator(userId, opts) {
        const window = pageWindow(opts);
        const rows = check(
          await db
            .from("places")
            .select(PLACE_SELECT)
            .eq("created_by", userId)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .range(window.from, window.to),
          "places by creator",
        );
        return toPage((rows as unknown as PlaceRow[]).map(toPlace), window);
      },
      async create(input, createdBy) {
        const service = writer(clients);
        let areaId: number | null = input.areaId ?? null;
        if (areaId === null && input.areaName) {
          const areaSlug = slugify(input.areaName) || "area";
          const found = check<{ id: number } | null>(
            await service
              .from("areas")
              .select("id")
              .eq("district_id", input.districtId)
              .eq("slug", areaSlug)
              .maybeSingle(),
            "area",
          );
          if (found) areaId = found.id;
          else {
            const created = checkOne<{ id: number }>(
              await service
                .from("areas")
                .insert({ district_id: input.districtId, slug: areaSlug, name_bn: input.areaName })
                .select("id")
                .single(),
              "create area",
            );
            areaId = created.id;
          }
        }
        const search = buildSearchFields(input.nameBn, input.nameEn, input.slug);
        const row = checkOne(
          await service
            .from("places")
            .insert({
              slug: input.slug,
              name_bn: input.nameBn,
              name_en: input.nameEn ?? null,
              type: input.type,
              district_id: input.districtId,
              area_id: areaId,
              address: input.address ?? null,
              phone: input.phone ?? null,
              website: input.website ?? null,
              hours_text: input.hoursText ?? null,
              ...(input.location
                ? {
                    location:
                      `SRID=4326;POINT(${input.location.lng} ${input.location.lat})` as never,
                  }
                : {}),
              search_text: search.searchText,
              search_key: search.searchKey,
              created_by: createdBy,
            })
            .select(PLACE_SELECT)
            .single(),
          "create place",
        );
        return toPlace(row as unknown as PlaceRow);
      },
    },

    dishes: {
      async byId(id) {
        const row = check(
          await db
            .from("dishes")
            .select(DISH_WITH_PLACE_SELECT)
            .eq("id", id)
            .eq("status", "active")
            .maybeSingle(),
          "dish",
        );
        return row ? toDishWithPlace(row as unknown as DishWithPlaceRow) : null;
      },
      async findOrCreate(placeId, foodId) {
        const service = writer(clients);
        const find = async () =>
          check(
            await service
              .from("dishes")
              .select(DISH_WITH_PLACE_SELECT)
              .eq("place_id", placeId)
              .eq("food_id", foodId)
              .maybeSingle(),
            "dish by place and food",
          );
        let row = await find();
        if (!row) {
          const { error } = await service
            .from("dishes")
            .insert({ place_id: placeId, food_id: foodId });
          // unique (place_id, food_id): a request that raced us created it first, which is fine
          if (error && error.code !== "23505")
            throw new Error(`Supabase create dish: ${error.message}`);
          row = await find();
        }
        if (!row) throw new Error("Supabase dish missing after create");
        return toDishWithPlace(row as unknown as DishWithPlaceRow);
      },
    },

    experiences: {
      async byId(id) {
        const row = check(
          await db
            .from("experiences")
            .select(EXPERIENCE_SELECT)
            .eq("id", id)
            .eq("status", "active")
            .maybeSingle(),
          "experience",
        );
        return row ? toExperience(row as unknown as ExperienceRow) : null;
      },
      forDish: (dishId, opts) => experiencesWhere({ column: "dish_id", values: [dishId] }, opts),
      async forFood(foodId, opts) {
        const dishes = check(
          await db.from("dishes").select("id").eq("food_id", foodId).eq("status", "active"),
          "food dishes",
        );
        return experiencesWhere({ column: "dish_id", values: dishes.map((d) => d.id) }, opts);
      },
      byUser: (userId, opts) => experiencesWhere({ column: "user_id", values: [userId] }, opts),
      async upsert(input) {
        const service = writer(clients);
        const row = check(
          await service
            .from("experiences")
            .upsert(
              {
                dish_id: input.dishId,
                user_id: input.userId,
                reaction: input.reaction,
                comment: input.comment ?? null,
                price_paid: input.pricePaid ?? null,
                visited_on: input.visitedOn ? input.visitedOn.toISOString().slice(0, 10) : null,
              },
              { onConflict: "user_id,dish_id" },
            )
            .select(EXPERIENCE_SELECT)
            .single(),
          "experience upsert",
        );
        const stats = await service.rpc("refresh_dish_stats", { p_dish: input.dishId });
        if (stats.error) throw new Error(`Supabase refresh_dish_stats: ${stats.error.message}`);
        return toExperience(row as unknown as ExperienceRow);
      },
      async remove(id) {
        const service = writer(clients);
        const found = check<{ dish_id: string } | null>(
          await service.from("experiences").select("dish_id").eq("id", id).maybeSingle(),
          "experience to remove",
        );
        if (!found) return null;
        const { error } = await service.from("experiences").delete().eq("id", id);
        if (error) throw new Error(`Supabase delete experience: ${error.message}`);
        const stats = await service.rpc("refresh_dish_stats", { p_dish: found.dish_id });
        if (stats.error) throw new Error(`Supabase refresh_dish_stats: ${stats.error.message}`);
        return { dishId: found.dish_id };
      },
    },

    claims: {
      async forEntity(entity, entityId) {
        const rows = check(
          await db
            .from("claims")
            .select("*")
            .eq("entity", entity)
            .eq("entity_id", entityId)
            .order("type"),
          "claims",
        );
        return rows.map(toClaim);
      },
      async byId(id) {
        const row = check(await db.from("claims").select("*").eq("id", id).maybeSingle(), "claim");
        return row ? toClaim(row) : null;
      },
      async ensure(input) {
        const service = writer(clients);
        const find = async () =>
          check(
            await service
              .from("claims")
              .select("*")
              .eq("entity", input.entity)
              .eq("entity_id", input.entityId)
              .eq("type", input.type)
              .maybeSingle(),
            "claim",
          );
        let row = await find();
        if (!row) {
          const { error } = await service.from("claims").insert({
            entity: input.entity,
            entity_id: input.entityId,
            type: input.type,
            value: input.value as never,
            created_by: input.createdBy,
          });
          // unique (entity, entity_id, type): a racing request created it first
          if (error && error.code !== "23505")
            throw new Error(`Supabase create claim: ${error.message}`);
          row = await find();
        }
        if (!row) throw new Error("Supabase claim missing after create");
        return toClaim(row);
      },
      async vote(vote) {
        const service = writer(clients);
        const { error } = await service.from("claim_votes").upsert(
          {
            claim_id: vote.claimId,
            user_id: vote.userId,
            verdict: vote.verdict,
            reason: vote.reason,
            note: vote.note,
            evidence_type: vote.evidence?.type ?? null,
            evidence_url: vote.evidence?.type === "link" ? vote.evidence.url : null,
            evidence_media_id: vote.evidence?.type === "photo" ? vote.evidence.mediaId : null,
          },
          { onConflict: "claim_id,user_id" },
        );
        if (error) throw new Error(`Supabase claim vote: ${error.message}`);
        // Counts are always recomputed from the votes, so a changed vote never double-counts.
        const votes = check(
          await service.from("claim_votes").select("verdict").eq("claim_id", vote.claimId),
          "claim votes",
        );
        const count = (verdict: string) => votes.filter((row) => row.verdict === verdict).length;
        const row = checkOne(
          await service
            .from("claims")
            .update({
              correct_count: count("correct"),
              partial_count: count("partial"),
              wrong_count: count("wrong"),
            })
            .eq("id", vote.claimId)
            .select("*")
            .single(),
          "claim counts",
        );
        return toClaim(row);
      },
      async saveStatus(claimId, update) {
        const { error } = await writer(clients)
          .from("claims")
          .update({
            status: update.status,
            last_confirmed_at: update.lastConfirmedAt?.toISOString() ?? null,
            expires_at: update.expiresAt?.toISOString() ?? null,
          })
          .eq("id", claimId);
        if (error) throw new Error(`Supabase claim status: ${error.message}`);
      },
    },

    editSuggestions: {
      async create(input) {
        const row = checkOne<Database["public"]["Tables"]["edit_suggestions"]["Row"]>(
          await writer(clients)
            .from("edit_suggestions")
            .insert({
              entity: input.entity,
              entity_id: input.entityId,
              field: input.field,
              current_value: input.currentValue,
              proposed_value: input.proposedValue,
              note: input.note,
              user_id: input.userId,
            })
            .select("*")
            .single(),
          "create edit suggestion",
        );
        return {
          id: row.id,
          entity: row.entity,
          entityId: row.entity_id,
          field: row.field,
          currentValue: row.current_value,
          proposedValue: row.proposed_value,
          note: row.note,
          userId: row.user_id,
          status: row.status,
          createdAt: new Date(row.created_at),
        };
      },
    },
    reports: {
      async create(input) {
        const row = checkOne<Database["public"]["Tables"]["reports"]["Row"]>(
          await writer(clients)
            .from("reports")
            .insert({
              entity: input.entity,
              entity_id: input.entityId,
              reason: input.reason,
              note: input.note,
              user_id: input.userId,
            })
            .select("*")
            .single(),
          "create report",
        );
        return {
          id: row.id,
          entity: row.entity,
          entityId: row.entity_id,
          reason: row.reason,
          note: row.note,
          userId: row.user_id,
          status: row.status,
          createdAt: new Date(row.created_at),
        };
      },
      async openFor(entity, entityId) {
        const rows = check(
          await writer(clients)
            .from("reports")
            .select("*")
            .eq("entity", entity)
            .eq("entity_id", entityId)
            .eq("status", "open"),
          "open reports",
        );
        return rows.map((row) => ({
          id: row.id,
          entity: row.entity,
          entityId: row.entity_id,
          reason: row.reason,
          note: row.note,
          userId: row.user_id,
          status: row.status,
          createdAt: new Date(row.created_at),
        }));
      },
    },

    saved: {
      async list(userId, opts) {
        const window = pageWindow(opts);
        const rows = check(
          await writer(clients)
            .from("saved_items")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .range(window.from, window.to),
          "saved items",
        );
        return toPage(
          rows.map((row) => ({
            entity: row.entity as "food" | "dish" | "place",
            entityId: row.entity_id,
            kind: "want_to_try" as const,
            createdAt: new Date(row.created_at),
          })),
          window,
        );
      },
      async isSaved(userId, entity, entityId) {
        const result = await writer(clients)
          .from("saved_items")
          .select("entity_id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("entity", entity)
          .eq("entity_id", entityId);
        if (result.error) throw new Error(`Supabase saved check: ${result.error.message}`);
        return (result.count ?? 0) > 0;
      },
      async save(userId, entity, entityId) {
        const { error } = await writer(clients)
          .from("saved_items")
          .upsert(
            { user_id: userId, entity, entity_id: entityId, kind: "want_to_try" },
            { onConflict: "user_id,entity,entity_id,kind", ignoreDuplicates: true },
          );
        if (error) throw new Error(`Supabase save: ${error.message}`);
      },
      async remove(userId, entity, entityId) {
        const { error } = await writer(clients)
          .from("saved_items")
          .delete()
          .eq("user_id", userId)
          .eq("entity", entity)
          .eq("entity_id", entityId);
        if (error) throw new Error(`Supabase unsave: ${error.message}`);
      },
    },

    media: {
      async create(input) {
        const row = checkOne(
          await writer(clients)
            .from("media")
            .insert({
              owner_id: input.ownerId,
              entity: input.entity,
              entity_id: input.entityId,
              provider: input.provider,
              provider_key: input.key,
              width: input.width,
              height: input.height,
              dominant_color: input.dominantColor,
            })
            .select("*")
            .single(),
          "create media",
        );
        return toMediaRef(row);
      },
      async forEntity(entity, entityId) {
        const rows = check(
          await db
            .from("media")
            .select("*")
            .eq("entity", entity)
            .eq("entity_id", entityId)
            .eq("status", "active")
            .order("created_at"),
          "media",
        );
        return rows.map(toMediaRef);
      },
    },

    search: {
      async search(query, opts = {}) {
        const limit = Math.min(
          opts.limit ?? appConfig.search.suggestionLimit,
          appConfig.pagination.max,
        );
        const hits = check(
          await db.rpc("search_all", { q_text: query.text, q_key: query.key, lim: limit * 2 }),
          "search_all",
        );
        // search_all may return the same entity twice (name + alias); keep the best-scoring one.
        const seen = new Set<string>();
        const best = hits.filter((hit) => {
          const key = `${hit.kind}:${hit.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const ids = (kind: string) => best.filter((h) => h.kind === kind).map((h) => h.id);
        const [foods, places, districts] = await Promise.all([
          ids("food").length
            ? db.from("foods").select("*").in("id", ids("food"))
            : Promise.resolve({ data: [], error: null }),
          ids("place").length
            ? db.from("places").select(PLACE_SELECT).in("id", ids("place"))
            : Promise.resolve({ data: [], error: null }),
          ids("district").length
            ? db.from("districts").select("*").in("id", ids("district").map(Number))
            : Promise.resolve({ data: [], error: null }),
        ]);
        const foodById = new Map(
          check(foods, "search foods").map((r) => [r.id, toFood(r)] as const),
        );
        const placeById = new Map(
          (check(places, "search places") as unknown as PlaceRow[]).map(
            (r) => [r.id, toPlace(r)] as const,
          ),
        );
        const districtById = new Map(
          check(districts, "search districts").map((r) => [String(r.id), toDistrict(r)] as const),
        );
        const items = best.flatMap((hit): SearchHit[] => {
          const food: Food | undefined = hit.kind === "food" ? foodById.get(hit.id) : undefined;
          const place: Place | undefined = hit.kind === "place" ? placeById.get(hit.id) : undefined;
          const district: District | undefined =
            hit.kind === "district" ? districtById.get(hit.id) : undefined;
          if (food) return [{ kind: "food", food }];
          if (place) return [{ kind: "place", place }];
          if (district) return [{ kind: "district", district }];
          return [];
        });
        return { items: items.slice(0, limit), nextCursor: null };
      },
      async recordMiss(query) {
        // Server-only table: needs the service client. Without it (no service key configured)
        // misses are simply not recorded — searching must never fail because of bookkeeping.
        if (!clients.service || !query.key) return;
        const { error } = await clients.service.rpc("record_search_miss", {
          p_key: query.key,
          p_text: query.text,
        });
        if (error) console.error("[jelarshad] record_search_miss failed:", error.message);
      },
    },

    rewards: {
      async award({ userId, kind, entity, entityId, points, districtId }) {
        const { data, error } = await writer(clients).rpc("award_points", {
          p_user: userId,
          p_kind: kind,
          p_entity: entity,
          p_entity_id: entityId,
          p_points: points,
          ...(districtId != null ? { p_district: districtId } : {}),
        });
        if (error) throw new Error(`Supabase award_points: ${error.message}`);
        return data ?? 0;
      },
      async revoke(entity, entityId) {
        const { data, error } = await writer(clients).rpc("revoke_points", {
          p_entity: entity,
          p_entity_id: entityId,
        });
        if (error) throw new Error(`Supabase revoke_points: ${error.message}`);
        return data ?? 0;
      },
      async unlockStamp({ userId, districtId, kind, foodId }) {
        const { data, error } = await writer(clients).rpc("unlock_stamp", {
          p_user: userId,
          p_district: districtId,
          p_kind: kind,
          p_food: foodId ?? (null as unknown as string),
        });
        if (error) throw new Error(`Supabase unlock_stamp: ${error.message}`);
        return data === true;
      },
      async stamps(userId) {
        const rows = check(
          await writer(clients)
            .from("district_stamps")
            .select("*")
            .eq("user_id", userId)
            .order("created_at"),
          "stamps",
        );
        return rows.map((row) => ({
          districtId: row.district_id,
          kind: row.kind as StampKind,
          foodId: row.food_id,
          createdAt: new Date(row.created_at),
        }));
      },
      async total(userId) {
        const row = check<{ points_total: number } | null>(
          await writer(clients)
            .from("profiles")
            .select("points_total")
            .eq("id", userId)
            .maybeSingle(),
          "points total",
        );
        return row?.points_total ?? 0;
      },
      async events(userId, since, limit) {
        const rows = check(
          await writer(clients)
            .from("point_events")
            .select("kind, entity_id, points, created_at")
            .eq("user_id", userId)
            .is("revoked_at", null)
            .gte("created_at", since.toISOString())
            .order("created_at", { ascending: false })
            .limit(limit),
          "point events",
        );
        return rows.map((row) => ({
          kind: row.kind as PointKind,
          entityId: row.entity_id,
          points: row.points,
          createdAt: new Date(row.created_at),
        }));
      },
      async kindCounts(userId) {
        const rows = check(
          await writer(clients)
            .from("point_events")
            .select("kind")
            .eq("user_id", userId)
            .is("revoked_at", null)
            .limit(5000),
          "point event kinds",
        );
        const counts: Partial<Record<PointKind, number>> = {};
        for (const row of rows) {
          const kind = row.kind as PointKind;
          counts[kind] = (counts[kind] ?? 0) + 1;
        }
        return counts;
      },
      async weeklyTop(since, limit) {
        const { data, error } = await writer(clients).rpc("weekly_leaderboard", {
          p_since: since.toISOString(),
          p_limit: limit,
        });
        if (error) throw new Error(`Supabase weekly_leaderboard: ${error.message}`);
        return (data ?? []).map((row) => ({
          userId: row.user_id,
          displayName: row.display_name,
          avatarUrl: row.avatar_url,
          xp: row.xp,
        }));
      },
      async districtTop(districtId, since, limit) {
        const { data, error } = await writer(clients).rpc("district_leaderboard", {
          p_district: districtId,
          p_since: since.toISOString(),
          p_limit: limit,
        });
        if (error) throw new Error(`Supabase district_leaderboard: ${error.message}`);
        return (data ?? []).map((row) => ({
          userId: row.user_id,
          displayName: row.display_name,
          avatarUrl: row.avatar_url,
          xp: row.xp,
        }));
      },
      async leaderboardOptIn(userId) {
        const row = check<{ leaderboard_opt_in: boolean } | null>(
          await writer(clients)
            .from("profiles")
            .select("leaderboard_opt_in")
            .eq("id", userId)
            .maybeSingle(),
          "leaderboard opt-in",
        );
        return row?.leaderboard_opt_in ?? false;
      },
      async setLeaderboardOptIn(userId, optIn) {
        const { error } = await writer(clients)
          .from("profiles")
          .update({ leaderboard_opt_in: optIn })
          .eq("id", userId);
        if (error) throw new Error(`Supabase leaderboard opt-in: ${error.message}`);
      },
    },

    rateLimits: {
      async countSince(userId, action, since) {
        const result = await writer(clients)
          .from("rate_limit_events")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("action", action)
          .gte("created_at", since.toISOString());
        if (result.error) throw new Error(`Supabase rate limit count: ${result.error.message}`);
        return result.count ?? 0;
      },
      async record(userId, action) {
        const { error } = await writer(clients)
          .from("rate_limit_events")
          .insert({ user_id: userId, action });
        if (error) throw new Error(`Supabase rate limit record: ${error.message}`);
      },
    },

    admin: {
      async hide(entity, entityId) {
        const table = (
          { place: "places", food: "foods", dish: "dishes", experience: "experiences" } as const
        )[entity as "place" | "food" | "dish" | "experience"];
        if (!table) throw new Error(`Supabase hide: cannot hide a ${entity}`);
        const { error } = await writer(clients)
          .from(table)
          .update({ status: "hidden" })
          .eq("id", entityId);
        if (error) throw new Error(`Supabase hide ${entity}: ${error.message}`);
      },
      async openReports(opts?: PageOpts) {
        const window = pageWindow(opts);
        const rows = check(
          await writer(clients)
            .from("reports")
            .select("*")
            .eq("status", "open")
            .order("created_at", { ascending: false })
            .range(window.from, window.to),
          "open reports",
        );
        return toPage(rows.map(toReport), window);
      },
      async openEditSuggestions(opts?: PageOpts) {
        const window = pageWindow(opts);
        const rows = check(
          await writer(clients)
            .from("edit_suggestions")
            .select("*")
            .eq("status", "open")
            .order("created_at", { ascending: false })
            .range(window.from, window.to),
          "open edit suggestions",
        );
        return toPage(rows.map(toEditSuggestion), window);
      },
      async counts() {
        const service = writer(clients);
        const count = async (table: string, filter?: (q: never) => never) => {
          void filter;
          const result = await service
            .from(table as "places")
            .select("*", { count: "exact", head: true });
          if (result.error) throw new Error(`Supabase count ${table}: ${result.error.message}`);
          return result.count ?? 0;
        };
        const countWhere = async (
          table: "reports" | "edit_suggestions" | "claims",
          column: string,
          values: string[],
        ) => {
          const result = await service
            .from(table)
            .select("*", { count: "exact", head: true })
            .in(column as "status", values as never);
          if (result.error) throw new Error(`Supabase count ${table}: ${result.error.message}`);
          return result.count ?? 0;
        };
        const [users, places, foods, dishes, experiences, media, openReports, openEdits, disputed] =
          await Promise.all([
            count("profiles"),
            count("places"),
            count("foods"),
            count("dishes"),
            count("experiences"),
            count("media"),
            countWhere("reports", "status", ["open"]),
            countWhere("edit_suggestions", "status", ["open"]),
            countWhere("claims", "status", ["disputed", "mixed"]),
          ]);
        return {
          users,
          places,
          foods,
          dishes,
          experiences,
          media,
          openReports,
          openEdits,
          disputedClaims: disputed,
        };
      },
      async recentPlaces(sinceDays, limit) {
        const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();
        const rows = check(
          await writer(clients)
            .from("places")
            .select(PLACE_SELECT)
            .eq("status", "active")
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .limit(limit),
          "recent places",
        );
        return (rows as unknown as PlaceRow[]).map(toPlace);
      },
      async disputedClaims(limit) {
        const rows = check(
          await writer(clients)
            .from("claims")
            .select("*")
            .in("status", ["disputed", "mixed"])
            .order("created_at", { ascending: false })
            .limit(limit),
          "disputed claims",
        );
        return rows.map(toClaim);
      },
      async mergePlaces(fromId, intoId) {
        const { data, error } = await writer(clients).rpc("merge_places", {
          p_from: fromId,
          p_into: intoId,
        });
        if (error) throw new Error(`Supabase merge_places: ${error.message}`);
        return Number(data ?? 0);
      },
      async mergeFoods(fromId, intoId) {
        const { data, error } = await writer(clients).rpc("merge_foods", {
          p_from: fromId,
          p_into: intoId,
        });
        if (error) throw new Error(`Supabase merge_foods: ${error.message}`);
        return Number(data ?? 0);
      },
      async similarFoodPairs(minSimilarity, limit) {
        const { data, error } = await writer(clients).rpc("similar_food_pairs", {
          p_min: minSimilarity,
          p_limit: limit,
        });
        if (error) throw new Error(`Supabase similar_food_pairs: ${error.message}`);
        return (data ?? []).map((row) => ({
          a: {
            id: row.a_id,
            slug: row.a_slug,
            nameBn: row.a_name,
            experienceCount: row.a_experiences,
          },
          b: {
            id: row.b_id,
            slug: row.b_slug,
            nameBn: row.b_name,
            experienceCount: row.b_experiences,
          },
          similarity: row.similarity,
        }));
      },
      async restore(entity, entityId) {
        const table = (
          { place: "places", food: "foods", dish: "dishes", experience: "experiences" } as const
        )[entity as "place" | "food" | "dish" | "experience"];
        if (!table) throw new Error(`Supabase restore: cannot restore a ${entity}`);
        const { error } = await writer(clients)
          .from(table)
          .update({ status: "active" })
          .eq("id", entityId);
        if (error) throw new Error(`Supabase restore ${entity}: ${error.message}`);
      },
      async setBanned(userId, banned) {
        const { error } = await writer(clients)
          .from("profiles")
          .update({ is_banned: banned })
          .eq("id", userId);
        if (error) throw new Error(`Supabase ban: ${error.message}`);
      },
      async setReportStatus(id, status) {
        const { error } = await writer(clients).from("reports").update({ status }).eq("id", id);
        if (error) throw new Error(`Supabase report status: ${error.message}`);
      },
      async editSuggestion(id) {
        const row = check(
          await writer(clients).from("edit_suggestions").select("*").eq("id", id).maybeSingle(),
          "edit suggestion",
        );
        return row ? toEditSuggestion(row) : null;
      },
      async setEditStatus(id, status, reviewerId) {
        const { error } = await writer(clients)
          .from("edit_suggestions")
          .update({ status, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw new Error(`Supabase edit status: ${error.message}`);
      },
      async setFame({ districtId, foodId, noteBn }) {
        const { error } = await writer(clients)
          .from("regional_fame")
          .upsert(
            { district_id: districtId, food_id: foodId, note_bn: noteBn },
            { onConflict: "district_id,food_id" },
          );
        if (error) throw new Error(`Supabase set fame: ${error.message}`);
      },
      async removeFame(districtId, foodId) {
        const { error } = await writer(clients)
          .from("regional_fame")
          .delete()
          .eq("district_id", districtId)
          .eq("food_id", foodId);
        if (error) throw new Error(`Supabase remove fame: ${error.message}`);
      },
      async purgeRateEvents(olderThanDays) {
        const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await writer(clients)
          .from("rate_limit_events")
          .delete()
          .lt("created_at", cutoff)
          .select("id");
        if (error) throw new Error(`Supabase purge rate events: ${error.message}`);
        return data?.length ?? 0;
      },
      async orphanMedia(limit) {
        const service = writer(clients);
        const media = check(
          await service
            .from("media")
            .select("id, provider_key, entity_id")
            .eq("entity", "experience")
            .limit(500),
          "media",
        );
        if (media.length === 0) return [];
        const alive = check(
          await service
            .from("experiences")
            .select("id")
            .in(
              "id",
              media.map((row) => row.entity_id),
            )
            .eq("status", "active"),
          "experiences of media",
        );
        const living = new Set(alive.map((row) => row.id));
        return media
          .filter((row) => !living.has(row.entity_id))
          .slice(0, limit)
          .map((row) => ({ id: row.id, key: row.provider_key }));
      },
      async deleteMedia(id) {
        const { error } = await writer(clients).from("media").delete().eq("id", id);
        if (error) throw new Error(`Supabase delete media: ${error.message}`);
      },
    },

    insights: {
      // Bookkeeping must never break a page: writes swallow their own failures.
      async record(event) {
        if (!clients.service) return;
        const { error } = await clients.service.from("insight_events").insert({
          name: event.name.slice(0, 40),
          path: event.path?.slice(0, 200) ?? null,
          props: event.props ?? {},
          session: event.session?.slice(0, 40) ?? null,
        });
        if (error) console.error("[jelarshad] insight record failed:", error.message);
      },
      async recordError(error) {
        if (!clients.service) return;
        const { error: failed } = await clients.service.from("error_logs").insert({
          source: error.source,
          message: error.message.slice(0, 500),
          stack: error.stack?.slice(0, 4000) ?? null,
          path: error.path?.slice(0, 200) ?? null,
          digest: error.digest?.slice(0, 80) ?? null,
          context: (error.context ?? {}) as never,
        });
        if (failed) console.error("[jelarshad] error log failed:", failed.message);
      },
      async summary(since) {
        const { data, error } = await writer(clients).rpc("insights_summary", {
          p_since: since.toISOString(),
        });
        if (error) throw new Error(`Supabase insights_summary: ${error.message}`);
        return (data ?? []).map((row) => ({
          name: row.name,
          events: Number(row.events),
          sessions: Number(row.sessions),
        }));
      },
      async topSearches(since, limit) {
        const { data, error } = await writer(clients).rpc("insights_top_searches", {
          p_since: since.toISOString(),
          p_limit: limit,
        });
        if (error) throw new Error(`Supabase insights_top_searches: ${error.message}`);
        return (data ?? []).map((row) => ({
          query: row.query,
          searches: Number(row.searches),
          empty: Number(row.empty),
        }));
      },
      async recentErrors(limit) {
        const rows = check(
          await writer(clients)
            .from("error_logs")
            .select("at, source, message, path, digest")
            .order("at", { ascending: false })
            .limit(limit),
          "recent errors",
        );
        return rows.map((row) => ({
          at: new Date(row.at),
          source: row.source as "server" | "client",
          message: row.message,
          path: row.path,
          digest: row.digest,
        }));
      },
      async purge(days) {
        const { data, error } = await writer(clients).rpc("purge_insights", { p_days: days });
        if (error) throw new Error(`Supabase purge_insights: ${error.message}`);
        return Number(data ?? 0);
      },
    },
  };
}
