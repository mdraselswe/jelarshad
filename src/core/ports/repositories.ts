import type {
  AreaWithDistrict,
  Claim,
  ClaimVote,
  District,
  DishWithFood,
  DishWithPlace,
  EditSuggestion,
  EntityType,
  Experience,
  Food,
  MediaRef,
  Page,
  PageOpts,
  Place,
  PlaceBranches,
  PlaceType,
  Reaction,
  RegionalFame,
  ReviewStatus,
  LeaderboardEntry,
  PointEvent,
  PointKind,
  RewardEntity,
  Stamp,
  StampKind,
  Report,
  SavedItem,
} from "@/core/domain";

// Data access ports, one per aggregate (docs/03-architecture.md §4). Named by what the app needs,
// not by the database. Adapters: src/infrastructure/{supabase,mock}. Methods grow with each phase.

export interface DistrictRepository {
  list(): Promise<District[]>;
  bySlug(slug: string): Promise<District | null>;
  /** Curated "famous for" list, in editor order. */
  fame(districtId: number): Promise<RegionalFame[]>;
  /** The whole curated list (every district), in editor order — one query for the home page. */
  allFame(): Promise<RegionalFame[]>;
  /** One neighbourhood of a district (ধানমন্ডি in ঢাকা) by its slug. */
  areaBySlug(districtId: number, areaSlug: string): Promise<AreaWithDistrict | null>;
  /** Neighbourhoods whose name contains `text` (typing "ধানমন্ডি" finds the area), best first. */
  areasMatching(text: string, limit: number): Promise<AreaWithDistrict[]>;
  /** Every neighbourhood of one district, by name. */
  areasOf(districtId: number, limit: number): Promise<AreaWithDistrict[]>;
  /** Neighbourhoods that have active places (static generation, sitemap). */
  areaSlugs(limit: number): Promise<{ districtSlug: string; areaSlug: string }[]>;
}

export type NewFood = { nameBn: string; nameEn?: string | null };

export interface FoodRepository {
  bySlug(slug: string): Promise<Food | null>;
  /** The slug of the food this one was merged into, for redirecting old links; null if none. */
  redirectFor(slug: string): Promise<string | null>;
  /** Another way to find this food ("ছালাদ" after it was merged into "সালাদ"); a no-op if known. */
  addAlias(foodId: string, alias: string, searchKey: string): Promise<void>;
  byId(id: string): Promise<Food | null>;
  /** Slugs of the `limit` most experienced active foods (static generation, sitemap). */
  slugs(limit: number): Promise<string[]>;
  /** Dishes of this food ranked by Wilson score (decision P10). */
  topDishes(
    foodId: string,
    opts?: PageOpts & { districtId?: number },
  ): Promise<Page<DishWithPlace>>;
  create(input: NewFood & { slug: string }, createdBy: string): Promise<Food>;
  /** Admin-approved changes to a food's own fields. */
  update(id: string, patch: { nameBn?: string; aboutBn?: string | null }): Promise<void>;
}

export type NewPlace = {
  nameBn: string;
  nameEn?: string | null;
  type: PlaceType;
  districtId: number;
  areaId?: number | null;
  /** A neighbourhood typed by the contributor; the adapter finds or creates the area. */
  areaName?: string | null;
  address?: string | null;
  location?: { lat: number; lng: number } | null;
};

export interface PlaceRepository {
  bySlug(slug: string): Promise<Place | null>;
  byId(id: string): Promise<Place | null>;
  /** Slugs of up to `limit` active places (static generation, sitemap). */
  slugs(limit: number): Promise<string[]>;
  inDistrict(districtId: number, opts?: PageOpts): Promise<Page<Place>>;
  /** Active places in one neighbourhood. */
  inArea(areaId: number, opts?: PageOpts): Promise<Page<Place>>;
  /** A chain and all its active branches (brand page); null when no such brand. */
  byBrand(
    brandSlug: string,
  ): Promise<{ brand: { slug: string; nameBn: string }; items: Place[] } | null>;
  /**
   * The other branches of the chain this place belongs to. Every branch is a separate place with its
   * own dishes and reactions; null when the place is not part of a chain or has no other branch.
   */
  branches(placeId: string): Promise<PlaceBranches | null>;
  /** All dishes of a place, best first ("প্রথমবার? এগুলো অর্ডার করুন"). */
  dishes(placeId: string): Promise<DishWithFood[]>;
  /** The slug of the place this one was merged into, for redirecting old links; null if none. */
  redirectFor(slug: string): Promise<string | null>;
  /** Admin-approved changes to a place's own fields. */
  update(
    id: string,
    patch: { nameBn?: string; address?: string | null; type?: PlaceType },
  ): Promise<void>;
  /** Active places this person added, newest first (profile: আমার অবদান). */
  byCreator(userId: string, opts?: PageOpts): Promise<Page<Place>>;
  /** Possible duplicates before adding a place (same district, similar name). */
  similar(nameBn: string, districtId: number): Promise<Place[]>;
  create(input: NewPlace & { slug: string }, createdBy: string): Promise<Place>;
}

export interface DishRepository {
  byId(id: string): Promise<DishWithPlace | null>;
  /** The dish for (place, food), created on first experience. */
  findOrCreate(placeId: string, foodId: string): Promise<DishWithPlace>;
}

export type ExperienceInput = {
  dishId: string;
  userId: string;
  reaction: Reaction;
  comment?: string | null;
  pricePaid?: number | null;
  visitedOn?: Date | null;
};

export interface ExperienceRepository {
  byId(id: string): Promise<Experience | null>;
  forDish(dishId: string, opts?: PageOpts): Promise<Page<Experience>>;
  forFood(foodId: string, opts?: PageOpts): Promise<Page<Experience>>;
  byUser(userId: string, opts?: PageOpts): Promise<Page<Experience>>;
  /** One experience per user per dish (decision P6): a second one updates the first. */
  upsert(input: ExperienceInput): Promise<Experience>;
}

export interface ClaimRepository {
  forEntity(entity: Claim["entity"], entityId: string): Promise<Claim[]>;
  byId(id: string): Promise<Claim | null>;
  /** Creates the claim if (entity, entityId, type) has none yet (created empty, `unverified`); else returns the existing one. */
  ensure(input: {
    entity: Claim["entity"];
    entityId: string;
    type: Claim["type"];
    value: Record<string, unknown>;
    createdBy: string;
  }): Promise<Claim>;
  /** Records (or replaces) the user's vote and returns the claim with fresh counts. */
  vote(vote: ClaimVote): Promise<Claim>;
  /** Persists a status/expiry computed by claimService. */
  saveStatus(
    claimId: string,
    update: Pick<Claim, "status" | "lastConfirmedAt" | "expiresAt">,
  ): Promise<void>;
}

export interface EditSuggestionRepository {
  create(input: Omit<EditSuggestion, "id" | "status" | "createdAt">): Promise<EditSuggestion>;
}

export interface ReportRepository {
  create(input: Omit<Report, "id" | "status" | "createdAt">): Promise<Report>;
  /** Reports about this content that no admin has handled yet. */
  openFor(entity: Report["entity"], entityId: string): Promise<Report[]>;
}

export interface SavedRepository {
  list(userId: string, opts?: PageOpts): Promise<Page<SavedItem>>;
  isSaved(userId: string, entity: SavedItem["entity"], entityId: string): Promise<boolean>;
  save(userId: string, entity: SavedItem["entity"], entityId: string): Promise<void>;
  remove(userId: string, entity: SavedItem["entity"], entityId: string): Promise<void>;
}

export interface MediaRepository {
  create(
    input: MediaRef & { ownerId: string; entity: EntityType; entityId: string; provider: string },
  ): Promise<MediaRef>;
  forEntity(entity: EntityType, entityId: string): Promise<MediaRef[]>;
}

export type SearchHit =
  | { kind: "food"; food: Food }
  | { kind: "place"; place: Place }
  | { kind: "district"; district: District };

export interface SearchRepository {
  /** `text` is the cleaned query, `key` its normalized search key (lib/text/normalize, Phase 1.3). */
  search(query: { text: string; key: string }, opts?: PageOpts): Promise<Page<SearchHit>>;
  /** Remember a query with no results so editors can add aliases or content. */
  recordMiss(query: { text: string; key: string }): Promise<void>;
}

export interface RateLimitRepository {
  countSince(userId: string, action: string, since: Date): Promise<number>;
  record(userId: string, action: string): Promise<void>;
}

export interface RewardRepository {
  /** Awards points once per (person, kind, entity id); returns the points actually added (0 for a repeat). */
  award(input: {
    userId: string;
    kind: PointKind;
    entity: RewardEntity;
    entityId: string;
    points: number;
    /** The district the action happened in, for the district board. */
    districtId?: number | null;
  }): Promise<number>;
  /** Takes back everything awarded for this entity (hidden or removed content); returns the points removed. */
  revoke(entity: RewardEntity, entityId: string): Promise<number>;
  /** True when this person did not have the stamp yet. */
  unlockStamp(input: {
    userId: string;
    districtId: number;
    kind: StampKind;
    foodId?: string | null;
  }): Promise<boolean>;
  stamps(userId: string): Promise<Stamp[]>;
  total(userId: string): Promise<number>;
  /** Earning actions that still count (not revoked) since a date, newest first. */
  events(userId: string, since: Date, limit: number): Promise<PointEvent[]>;
  /** How many actions of each kind still count, over the person's whole history. */
  kindCounts(userId: string): Promise<Partial<Record<PointKind, number>>>;
  /** People who opted in, most XP since a date first. */
  weeklyTop(since: Date, limit: number): Promise<LeaderboardEntry[]>;
  /** The same, counting only actions in one district. */
  districtTop(districtId: number, since: Date, limit: number): Promise<LeaderboardEntry[]>;
  leaderboardOptIn(userId: string): Promise<boolean>;
  setLeaderboardOptIn(userId: string, optIn: boolean): Promise<void>;
}

export type AdminCounts = {
  users: number;
  places: number;
  foods: number;
  dishes: number;
  experiences: number;
  media: number;
  openReports: number;
  openEdits: number;
  disputedClaims: number;
};

export type OrphanMedia = { id: string; key: string };

export type SimilarFoodPair = {
  a: { id: string; slug: string; nameBn: string; experienceCount: number };
  b: { id: string; slug: string; nameBn: string; experienceCount: number };
  /** 0–1, trigram similarity of the phonetic keys. */
  similarity: number;
};

export interface AdminRepository {
  counts(): Promise<AdminCounts>;
  /** Active places added in the last `sinceDays` days, newest first. */
  recentPlaces(sinceDays: number, limit: number): Promise<Place[]>;
  /** Claims the community marked wrong or is split on ("disputed" or "mixed"). */
  disputedClaims(limit: number): Promise<Claim[]>;
  /** Moves everything from the duplicate into the survivor; returns how many dishes were handled. */
  mergePlaces(fromId: string, intoId: string): Promise<number>;
  /** Same for a duplicate food: its dishes, experiences, fame rows and saves move to the survivor. */
  mergeFoods(fromId: string, intoId: string): Promise<number>;
  /** Pairs of active foods with close names, most alike first. */
  similarFoodPairs(minSimilarity: number, limit: number): Promise<SimilarFoodPair[]>;
  restore(entity: Report["entity"], entityId: string): Promise<void>;
  setBanned(userId: string, banned: boolean): Promise<void>;
  setReportStatus(id: string, status: Exclude<ReviewStatus, "open">): Promise<void>;
  editSuggestion(id: string): Promise<EditSuggestion | null>;
  setEditStatus(
    id: string,
    status: Exclude<ReviewStatus, "open">,
    reviewerId: string,
  ): Promise<void>;
  /** Adds or changes a district's "famous for" entry (editor order is kept for existing ones). */
  setFame(input: { districtId: number; foodId: string; noteBn: string | null }): Promise<void>;
  removeFame(districtId: number, foodId: string): Promise<void>;
  /** Deletes rate-limit counters older than this many days; returns how many. */
  purgeRateEvents(olderThanDays: number): Promise<number>;
  /** Uploaded photos whose experience no longer exists or is hidden. */
  orphanMedia(limit: number): Promise<OrphanMedia[]>;
  deleteMedia(id: string): Promise<void>;
  /** Hides content (status `hidden`) until an admin restores or removes it. */
  hide(entity: Report["entity"], entityId: string): Promise<void>;
  openReports(opts?: PageOpts): Promise<Page<Report>>;
  openEditSuggestions(opts?: PageOpts): Promise<Page<EditSuggestion>>;
}

export type Repositories = {
  districts: DistrictRepository;
  foods: FoodRepository;
  places: PlaceRepository;
  dishes: DishRepository;
  experiences: ExperienceRepository;
  claims: ClaimRepository;
  editSuggestions: EditSuggestionRepository;
  reports: ReportRepository;
  saved: SavedRepository;
  media: MediaRepository;
  search: SearchRepository;
  rateLimits: RateLimitRepository;
  rewards: RewardRepository;
  admin: AdminRepository;
};
