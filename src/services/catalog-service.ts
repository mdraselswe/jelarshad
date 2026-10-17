import { appConfig } from "@/config/app.config";
import type {
  ClaimStatus,
  ClaimType,
  Dish,
  MediaRef,
  PlaceType,
  PriceRange,
  Reaction,
} from "@/core/domain";
import type { Repositories } from "@/core/ports";
import { dishDisplay, type DishDisplay } from "@/lib/ranking/display";
import { formatPriceRange } from "@/lib/format/number";
import { lovedPercent } from "@/lib/ranking/percent";

// Read-side business logic for the catalog pages (docs/03-architecture.md §2). Pure: depends on
// ports only, so it runs the same on mock data, Supabase and in plain Vitest.

type Deps = {
  repos: Pick<Repositories, "districts" | "foods" | "places" | "dishes" | "experiences" | "claims">;
};

export type FoodRef = { slug: string; nameBn: string };
export type DistrictRef = { slug: string; nameBn: string };

export type HomeFamous = { district: DistrictRef; food: FoodRef; noteBn: string | null };
export type HomeDistrict = DistrictRef & { famous: FoodRef | null };
export type HomeDivision = { nameBn: string; districts: HomeDistrict[] };

export type HomeData = {
  /** Every curated "famous for" pair, in editor order. */
  famous: HomeFamous[];
  /** Districts that have a famous food, for the quick-pick row. */
  famousDistricts: HomeDistrict[];
  /** All districts grouped by division, in division order. */
  divisions: HomeDivision[];
};

/** A dish as listed on a food page: where to get it and how it is doing. */
export type DishRow = {
  id: string;
  place: {
    slug: string;
    nameBn: string;
    type: PlaceType;
    districtNameBn: string;
    areaNameBn: string | null;
  };
  price: PriceRange;
  experienceCount: number;
  display: DishDisplay;
};

export type FoodHeader = {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string | null;
  aboutBn: string | null;
  experienceCount: number;
  /** ❤️ % over all dishes of this food; null until there are experiences. */
  percent: number | null;
  /** Districts the editors list this food under. */
  famousIn: DistrictRef[];
};

export type FoodDishes = { items: DishRow[]; hasMore: boolean; priceRange: PriceRange };

export type ExperienceRow = {
  id: string;
  userName: string;
  /** The dish it is about, on a place page ("ফ্রাইড রাইস"); null on a food page. */
  subject?: string | null;
  reaction: Reaction;
  comment: string | null;
  pricePaid: number | null;
  photos: MediaRef[];
  createdAt: Date;
};

export type PlaceHeader = {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string | null;
  type: PlaceType;
  district: DistrictRef;
  areaNameBn: string | null;
  address: string | null;
  phone: string | null;
  /** A website or a Facebook page. */
  website: string | null;
  /** Opening hours as the person wrote them. */
  hoursText: string | null;
  /** Text a map search can use to find the place (no coordinates are stored yet). */
  mapQuery: string;
};

/** A dish on a place page ("প্রথমবার? এগুলো অর্ডার করুন"). */
export type PlaceDishRow = {
  id: string;
  food: FoodRef;
  displayName: string | null;
  price: PriceRange;
  experienceCount: number;
  display: DishDisplay;
};

export type PlaceClaimRow = {
  id: string;
  /** The dish a dish-level claim is about ("সরার দই"); null for the place itself. */
  subject: string | null;
  /** What the claim says, when it has something to show ("৳১৮০–৳২৫০"). */
  valueText: string | null;
  type: ClaimType;
  status: ClaimStatus;
  lastConfirmedAt: Date | null;
  expiresAt: Date | null;
  /** Who added the fact (they see a note instead of the verify buttons). */
  createdBy: string | null;
};

export type DistrictHeader = {
  id: number;
  slug: string;
  nameBn: string;
  divisionBn: string;
  /** Curated "famous for" foods, in editor order. */
  famous: { food: FoodRef; noteBn: string | null }[];
  /** Neighbourhoods (ধানমন্ডি…), by name; each has its own page. */
  areas: { slug: string; nameBn: string }[];
};

export type DistrictPlaceRow = {
  slug: string;
  nameBn: string;
  type: PlaceType;
  areaNameBn: string | null;
  areaSlug: string | null;
  price: PriceRange;
};

export type DistrictFoodPage = {
  district: DistrictRef;
  food: FoodRef & { id: string; aboutBn: string | null };
  /** Why the editors list this food here. */
  noteBn: string | null;
  dishes: FoodDishes;
};

/** A place in a neighbourhood, with what it serves and how its best dish is doing. */
export type AreaPlaceRow = {
  id: string;
  slug: string;
  nameBn: string;
  type: PlaceType;
  price: PriceRange;
  /** What the place serves, best liked first (food names). */
  foods: string[];
  /** The best dish's numbers; `rankable` false until enough people have shared experiences. */
  best: DishDisplay;
  experienceCount: number;
};

/** One branch on a brand page: where it is and how its best dish is doing. */
export type BranchRow = AreaPlaceRow & { areaNameBn: string | null; districtNameBn: string };

export type BrandPage = {
  brand: { slug: string; nameBn: string };
  branches: BranchRow[];
};

export type AreaPage = {
  district: DistrictRef;
  area: { slug: string; nameBn: string };
  /** Ranked places first (most loved on top), then the ones without enough experiences. */
  places: AreaPlaceRow[];
  hasMore: boolean;
};

/** The part of a claim worth showing next to its label; only prices carry one today. */
export function claimValueText(type: ClaimType, value: Record<string, unknown>): string | null {
  if (type !== "price") return null;
  const min = typeof value.min === "number" ? value.min : null;
  const max = typeof value.max === "number" ? value.max : null;
  return formatPriceRange(min, max);
}

function priceRangeOf(dishes: Pick<Dish, "price">[]): PriceRange {
  const lows = dishes.flatMap((dish) => (dish.price.min === null ? [] : [dish.price.min]));
  const highs = dishes.flatMap((dish) => (dish.price.max === null ? [] : [dish.price.max]));
  return {
    min: lows.length ? Math.min(...lows) : null,
    max: highs.length ? Math.max(...highs) : null,
  };
}

export function createCatalogService({ repos }: Deps) {
  return {
    /** Every public page worth listing in the sitemap (real content only: no empty pairs). */
    async sitemapEntries() {
      const [foods, places, brands, districts, fame, areas] = await Promise.all([
        repos.foods.slugs(appConfig.seo.sitemapPerType),
        repos.places.slugs(appConfig.seo.sitemapPerType),
        repos.places.brandSlugs(appConfig.seo.sitemapPerType),
        repos.districts.list(),
        repos.districts.allFame(),
        repos.districts.areaSlugs(appConfig.seo.sitemapPerType),
      ]);
      const slugById = new Map(districts.map((district) => [district.id, district.slug]));
      const pairs = new Set<string>();
      for (const entry of fame) {
        const district = slugById.get(entry.districtId);
        if (district) pairs.add(`${district}/${entry.food.slug}`);
      }
      return {
        districts: districts.map((district) => district.slug),
        areas,
        foods,
        places,
        brands,
        districtFoods: [...pairs].map((pair) => {
          const [district = "", food = ""] = pair.split("/");
          return { district, food };
        }),
      };
    },

    /** Slugs worth prerendering at build time. */
    async staticSlugs() {
      const [foods, places, brands, districts, fame] = await Promise.all([
        repos.foods.slugs(appConfig.seo.staticFoodCount),
        repos.places.slugs(appConfig.seo.staticPlaceCount),
        repos.places.brandSlugs(appConfig.seo.staticPlaceCount),
        repos.districts.list(),
        repos.districts.allFame(),
      ]);
      const slugById = new Map(districts.map((district) => [district.id, district.slug]));
      const withFame = new Set(fame.map((entry) => entry.districtId));
      // Districts with a curated famous food first: they are the ones people land on.
      const ordered = [
        ...districts.filter((district) => withFame.has(district.id)),
        ...districts.filter((district) => !withFame.has(district.id)),
      ];
      return {
        foods,
        places,
        brands,
        districts: ordered
          .slice(0, appConfig.seo.staticDistrictCount)
          .map((district) => district.slug),
        /** The curated "famous for" pairs: the district×food pages worth prerendering. */
        districtFoods: fame
          .flatMap((entry) => {
            const district = slugById.get(entry.districtId);
            return district ? [{ district, food: entry.food.slug }] : [];
          })
          .slice(0, appConfig.seo.staticDistrictFoodCount),
      };
    },

    async foodHeader(slug: string): Promise<FoodHeader | null> {
      const food = await repos.foods.bySlug(slug);
      if (!food) return null;
      const [fame, districts] = await Promise.all([
        repos.districts.allFame(),
        repos.districts.list(),
      ]);
      const byId = new Map(districts.map((district) => [district.id, district]));
      const famousIn = fame
        .filter((entry) => entry.food.id === food.id)
        .flatMap((entry) => {
          const district = byId.get(entry.districtId);
          return district ? [{ slug: district.slug, nameBn: district.nameBn }] : [];
        });
      return {
        id: food.id,
        slug: food.slug,
        nameBn: food.nameBn,
        nameEn: food.nameEn,
        aboutBn: food.aboutBn,
        experienceCount: food.experienceCount,
        percent: lovedPercent(food.lovedCount, food.experienceCount),
        famousIn,
      };
    },

    async foodDishes(foodId: string, districtId?: number): Promise<FoodDishes> {
      const page = await repos.foods.topDishes(foodId, {
        limit: appConfig.pagination.default,
        ...(districtId === undefined ? {} : { districtId }),
      });
      return {
        items: page.items.map((dish) => ({
          id: dish.id,
          place: {
            slug: dish.place.slug,
            nameBn: dish.place.nameBn,
            type: dish.place.type,
            districtNameBn: dish.place.district.nameBn,
            areaNameBn: dish.place.area?.nameBn ?? null,
          },
          price: dish.price,
          experienceCount: dish.experienceCount,
          display: dishDisplay(dish),
        })),
        hasMore: page.nextCursor !== null,
        priceRange: priceRangeOf(page.items),
      };
    },

    /** What people wrote about the dishes of one place, newest first. */
    async placeExperiences(placeId: string): Promise<ExperienceRow[]> {
      const dishes = await repos.places.dishes(placeId);
      const pages = await Promise.all(
        dishes.map(async (dish) => ({
          subject: dish.displayName ?? dish.food.nameBn,
          page: await repos.experiences.forDish(dish.id, { limit: 5 }),
        })),
      );
      return pages
        .flatMap(({ subject, page }) => page.items.map((experience) => ({ experience, subject })))
        .filter(({ experience }) => experience.comment || experience.photos.length > 0)
        .sort((a, b) => b.experience.createdAt.getTime() - a.experience.createdAt.getTime())
        .slice(0, 8)
        .map(({ experience, subject }) => ({
          id: experience.id,
          userName: experience.user.displayName,
          subject,
          reaction: experience.reaction,
          comment: experience.comment,
          pricePaid: experience.pricePaid,
          photos: experience.photos,
          createdAt: experience.createdAt,
        }));
    },

    async foodExperiences(foodId: string): Promise<ExperienceRow[]> {
      const page = await repos.experiences.forFood(foodId, { limit: 5 });
      return page.items
        .filter((experience) => experience.comment || experience.photos.length > 0)
        .map((experience) => ({
          id: experience.id,
          userName: experience.user.displayName,
          reaction: experience.reaction,
          comment: experience.comment,
          pricePaid: experience.pricePaid,
          photos: experience.photos,
          createdAt: experience.createdAt,
        }));
    },

    async placeHeader(slug: string): Promise<PlaceHeader | null> {
      const place = await repos.places.bySlug(slug);
      if (!place) return null;
      const areaNameBn = place.area?.nameBn ?? null;
      return {
        id: place.id,
        slug: place.slug,
        nameBn: place.nameBn,
        nameEn: place.nameEn,
        type: place.type,
        district: { slug: place.district.slug, nameBn: place.district.nameBn },
        areaNameBn,
        address: place.address,
        phone: place.phone,
        website: place.website,
        hoursText: place.hoursText,
        mapQuery: [place.nameBn, areaNameBn, place.district.nameBn, "বাংলাদেশ"]
          .filter(Boolean)
          .join(" "),
      };
    },

    /** Other branches of the same chain, each with its own page and reactions. */
    async placeBranches(placeId: string) {
      const branches = await repos.places.branches(placeId);
      if (!branches) return null;
      return {
        brandNameBn: branches.brand.nameBn,
        items: branches.items.map((branch) => ({
          slug: branch.slug,
          nameBn: branch.nameBn,
          areaNameBn: branch.area?.nameBn ?? branch.district.nameBn,
          districtNameBn: branch.district.nameBn,
        })),
      };
    },

    async placeDishes(placeId: string): Promise<PlaceDishRow[]> {
      const dishes = await repos.places.dishes(placeId);
      return dishes.map((dish) => ({
        id: dish.id,
        food: { slug: dish.food.slug, nameBn: dish.food.nameBn },
        displayName: dish.displayName,
        price: dish.price,
        experienceCount: dish.experienceCount,
        display: dishDisplay(dish),
      }));
    },

    /** Photos people attached to experiences of this place, newest first. */
    async placePhotos(placeId: string, limit = 8): Promise<MediaRef[]> {
      const dishes = await repos.places.dishes(placeId);
      const pages = await Promise.all(
        dishes.map((dish) => repos.experiences.forDish(dish.id, { limit: 10 })),
      );
      return pages
        .flatMap((page) => page.items)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .flatMap((experience) => experience.photos)
        .slice(0, limit);
    },

    async placeClaims(placeId: string): Promise<PlaceClaimRow[]> {
      const [placeClaims, dishes] = await Promise.all([
        repos.claims.forEntity("place", placeId),
        repos.places.dishes(placeId),
      ]);
      const dishClaims = await Promise.all(
        dishes.map(async (dish) => ({
          subject: dish.displayName ?? dish.food.nameBn,
          claims: await repos.claims.forEntity("dish", dish.id),
        })),
      );
      const all = [
        ...placeClaims.map((claim) => ({ claim, subject: null as string | null })),
        ...dishClaims.flatMap(({ subject, claims }) => claims.map((claim) => ({ claim, subject }))),
      ];
      return all.map(({ claim, subject }) => ({
        id: claim.id,
        subject,
        valueText: claimValueText(claim.type, claim.value),
        type: claim.type,
        status: claim.status,
        lastConfirmedAt: claim.lastConfirmedAt,
        expiresAt: claim.expiresAt,
        createdBy: claim.createdBy,
      }));
    },

    /** Every district, for pickers (id + name). */
    async districtOptions(): Promise<{ id: number; nameBn: string }[]> {
      const districts = await repos.districts.list();
      return districts.map((district) => ({ id: district.id, nameBn: district.nameBn }));
    },

    async districtHeader(slug: string): Promise<DistrictHeader | null> {
      const district = await repos.districts.bySlug(slug);
      if (!district) return null;
      const [fame, areas] = await Promise.all([
        repos.districts.fame(district.id),
        repos.districts.areasOf(district.id, appConfig.pagination.areaChips),
      ]);
      return {
        id: district.id,
        slug: district.slug,
        nameBn: district.nameBn,
        divisionBn: district.divisionBn,
        areas: areas.map((area) => ({ slug: area.slug, nameBn: area.nameBn })),
        famous: fame.map((entry) => ({
          food: { slug: entry.food.slug, nameBn: entry.food.nameBn },
          noteBn: entry.noteBn,
        })),
      };
    },

    async districtPlaces(
      districtId: number,
    ): Promise<{ items: DistrictPlaceRow[]; hasMore: boolean }> {
      const page = await repos.places.inDistrict(districtId, {
        limit: appConfig.pagination.default,
      });
      return {
        items: page.items.map((place) => ({
          slug: place.slug,
          nameBn: place.nameBn,
          type: place.type,
          areaNameBn: place.area?.nameBn ?? null,
          areaSlug: place.area?.slug ?? null,
          price: place.price,
        })),
        hasMore: page.nextCursor !== null,
      };
    },

    /**
     * One neighbourhood: its places, with the best-liked ones first. "Best" is only ever what people
     * have said (decision P9); a place nobody has rated yet is listed after, not ranked.
     */
    /** A chain with every branch; each branch ranks on its own reactions, never on the chain's. */
    async brandPage(brandSlug: string): Promise<BrandPage | null> {
      const found = await repos.places.byBrand(brandSlug);
      if (!found) return null;
      const rows = await Promise.all(
        found.items.map(async (place): Promise<{ row: BranchRow; score: number }> => {
          const dishes = await repos.places.dishes(place.id);
          const shown = dishes.map((dish) => ({ dish, display: dishDisplay(dish) }));
          const bestRanked = shown.find((entry) => entry.display.rankable);
          const first = bestRanked ?? shown[0];
          return {
            row: {
              id: place.id,
              slug: place.slug,
              nameBn: place.nameBn,
              type: place.type,
              price: place.price,
              foods: dishes.map((dish) => dish.displayName ?? dish.food.nameBn),
              best: first?.display ?? { percent: null, rankable: false, favorite: false },
              experienceCount: dishes.reduce((sum, dish) => sum + dish.experienceCount, 0),
              areaNameBn: place.area?.nameBn ?? null,
              districtNameBn: place.district.nameBn,
            },
            score: bestRanked?.dish.wilsonScore ?? -1,
          };
        }),
      );
      const branches = rows
        .sort((a, b) => b.score - a.score || a.row.nameBn.localeCompare(b.row.nameBn, "bn"))
        .map((entry) => entry.row);
      return { brand: found.brand, branches };
    },

    async areaPage(districtSlug: string, areaSlug: string): Promise<AreaPage | null> {
      const district = await repos.districts.bySlug(districtSlug);
      if (!district) return null;
      const area = await repos.districts.areaBySlug(district.id, areaSlug);
      if (!area) return null;
      const page = await repos.places.inArea(area.id, { limit: appConfig.pagination.default });
      const rows = await Promise.all(
        page.items.map(async (place): Promise<{ row: AreaPlaceRow; score: number }> => {
          const dishes = await repos.places.dishes(place.id);
          const shown = dishes.map((dish) => ({ dish, display: dishDisplay(dish) }));
          const bestRanked = shown.find((entry) => entry.display.rankable);
          const first = bestRanked ?? shown[0];
          return {
            row: {
              id: place.id,
              slug: place.slug,
              nameBn: place.nameBn,
              type: place.type,
              price: place.price,
              foods: dishes.map((dish) => dish.displayName ?? dish.food.nameBn),
              best: first?.display ?? { percent: null, rankable: false, favorite: false },
              experienceCount: dishes.reduce((sum, dish) => sum + dish.experienceCount, 0),
            },
            score: bestRanked?.dish.wilsonScore ?? -1,
          };
        }),
      );
      const places = rows
        .sort((a, b) => b.score - a.score || a.row.nameBn.localeCompare(b.row.nameBn, "bn"))
        .map((entry) => entry.row);
      return {
        district: { slug: district.slug, nameBn: district.nameBn },
        area: { slug: area.slug, nameBn: area.nameBn },
        places,
        hasMore: page.nextCursor !== null,
      };
    },

    /** "বগুড়ার দই": the dishes of one food inside one district, or null if either is unknown. */
    async districtFood(districtSlug: string, foodSlug: string): Promise<DistrictFoodPage | null> {
      const [district, food] = await Promise.all([
        repos.districts.bySlug(districtSlug),
        repos.foods.bySlug(foodSlug),
      ]);
      if (!district || !food) return null;
      const [fame, dishes] = await Promise.all([
        repos.districts.fame(district.id),
        this.foodDishes(food.id, district.id),
      ]);
      return {
        district: { slug: district.slug, nameBn: district.nameBn },
        food: { id: food.id, slug: food.slug, nameBn: food.nameBn, aboutBn: food.aboutBn },
        noteBn: fame.find((entry) => entry.food.id === food.id)?.noteBn ?? null,
        dishes,
      };
    },

    async home(): Promise<HomeData> {
      const [districts, fame] = await Promise.all([
        repos.districts.list(),
        repos.districts.allFame(),
      ]);
      const byId = new Map(districts.map((district) => [district.id, district]));

      const famous: HomeFamous[] = fame.flatMap((entry) => {
        const district = byId.get(entry.districtId);
        if (!district) return [];
        return [
          {
            district: { slug: district.slug, nameBn: district.nameBn },
            food: { slug: entry.food.slug, nameBn: entry.food.nameBn },
            noteBn: entry.noteBn,
          },
        ];
      });

      const firstFamousOf = new Map<string, FoodRef>();
      for (const entry of famous) {
        if (!firstFamousOf.has(entry.district.slug))
          firstFamousOf.set(entry.district.slug, entry.food);
      }

      const divisions: HomeDivision[] = [];
      for (const district of districts) {
        let division = divisions.find((candidate) => candidate.nameBn === district.divisionBn);
        if (!division) {
          division = { nameBn: district.divisionBn, districts: [] };
          divisions.push(division);
        }
        division.districts.push({
          slug: district.slug,
          nameBn: district.nameBn,
          famous: firstFamousOf.get(district.slug) ?? null,
        });
      }

      const famousDistricts = divisions.flatMap((division) =>
        division.districts.filter((district) => district.famous !== null),
      );
      return { famous, famousDistricts, divisions };
    },
  };
}

export type CatalogService = ReturnType<typeof createCatalogService>;
