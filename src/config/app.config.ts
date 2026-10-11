/**
 * Every tunable number in the app lives here (AGENTS.md §2, docs/03-architecture.md §9).
 * Change values here, never inline them. Each value says what it controls.
 */
export const appConfig = {
  pagination: {
    /** Neighbourhood chips on a district page. */
    areaChips: 40,
    /** Items per page for lists; also the row count of list skeletons. */
    default: 20,
    /** Upper bound a client may request via `?limit=`. */
    max: 50,
  },

  search: {
    /** Shorter queries return no results (avoids matching everything). */
    minQueryLength: 2,
    /** Delay after the last keystroke before suggestions are fetched. */
    debounceMs: 200,
    /** Suggestions shown under the search box. */
    suggestionLimit: 8,
    /** Neighbourhoods a query may match (and whose places join the results). */
    areaLimit: 2,
    /** pg_trgm similarity below this is not a match (0–1). */
    similarityThreshold: 0.25,
    /** Longer queries are cut off (keeps cache keys and the search_misses table small). */
    maxQueryLength: 60,
    /** Hits fetched per search; the results page and suggestions both slice from these. */
    resultLimit: 20,
    /** Hits per group shown in the typing dropdown. */
    suggestionsPerGroup: 3,
    /** Price filter buckets in taka, matched against a place's price range. `max: null` = no upper limit. */
    priceTiers: [
      { id: "budget", min: 0, max: 150 },
      { id: "mid", min: 151, max: 300 },
      { id: "high", min: 301, max: null },
    ],
  },

  ranking: {
    /** Below this many experiences a dish shows "এখনও পর্যাপ্ত অভিজ্ঞতা নেই" instead of a rank. */
    minExperiencesToRank: 5,
    /** Experiences needed before a dish can be labelled "কমিউনিটির প্রিয়". */
    favoriteMinExperiences: 10,
    /** …and at least this % of them must be 😋 for the "কমিউনিটির প্রিয়" label. */
    favoriteMinPercent: 80,
    /** z-score for the Wilson lower bound (1.96 = 95% confidence). */
    wilsonZ: 1.96,
  },

  claims: {
    /** Days until a confirmed claim shows ⏳ and asks "এখনও ঠিক আছে?" (decision P8). */
    ttlDays: { price: 30, opening_hours: 30, availability: 60, place_status: 180, location: 180 },
    /** Votes needed before a claim's status can change from "unverified". */
    minVotes: 3,
    /** Share of ✅ votes needed for "কমিউনিটি নিশ্চিত". */
    confirmRatio: 0.7,
    /** Share of ❌ votes that marks a claim as disputed. */
    disputeRatio: 0.6,
  },

  moderation: {
    /** Independent open reports that hide a place, food, dish or comment until an admin reviews it. */
    autoHideReports: 3,
  },

  limits: {
    /** Max actions of each kind per user per day (docs/09-security-and-limits.md §2). */
    perDay: {
      experience: 30,
      place_create: 10,
      food_create: 10,
      claim_vote: 50,
      edit_suggestion: 20,
      report: 20,
      upload: 10,
      save: 200,
    },
  },

  media: {
    /** Photos allowed on one experience (decision T5). */
    maxPhotosPerExperience: 2,
    /** Largest original a user may pick before browser compression (bytes). */
    maxUploadBytes: 8_000_000,
    /** WebP variants made in the browser; originals are never stored. Quality is 0–1. */
    variants: {
      thumb: { width: 400, quality: 0.72 },
      large: { width: 1080, quality: 0.78 },
    },
  },

  text: {
    /** Max characters in an experience comment. */
    commentMax: 500,
    /** Max characters in a verification or edit note. */
    noteMax: 300,
    /** Max characters in a food, place or dish name. */
    nameMax: 80,
  },

  points: {
    /** Points per action (docs/01-product-spec.md §3.11b). */
    experience: 10,
    place_create: 20,
    /** Bonus for the first place added for a famous food in a district ("আবিষ্কারক"). */
    discoverer: 20,
    claim_vote: 5,
    edit_accepted: 15,
  },

  passport: {
    /** Districts in Bangladesh — the passport's full ring. */
    totalDistricts: 64,
    /** Recent stamps shown on the home page. */
    homeMiniStamps: 3,
  },

  seo: {
    /** District pages with fewer places are noindex (thin content). */
    minPlacesToIndexDistrict: 1,
    // Every prerendered page is several files that Vercel uploads on each deploy (the free plan
    // allows 5000 uploads a day), so only a small head start is built; the rest renders on the
    // first visit and is cached.
    /** Most pages of one kind listed in one sitemap file (the protocol allows 50,000). */
    sitemapPerType: 5000,
    /** Food pages prerendered at build (most experienced first). */
    staticFoodCount: 10,
    /** Place pages prerendered at build. */
    staticPlaceCount: 10,
    /** District pages prerendered at build (districts with a curated famous food come first). */
    staticDistrictCount: 12,
    /** District × food pages prerendered at build (the first curated pairs). */
    staticDistrictFoodCount: 12,
  },

  ui: {
    /** Show a loading skeleton only if loading takes longer than this (avoids flicker; docs/05 §6). */
    skeletonDelayMs: 150,
    /** Widths below this are "mobile" for useIsMobile() — matches Tailwind `md`. */
    mobileBreakpointPx: 768,
  },

  launch: {
    /** How long a founding contributor's `/?preview=<secret>` access lasts before they need the link again. */
    previewCookieMaxAgeDays: 30,
  },
} as const;

export type AppConfig = typeof appConfig;
