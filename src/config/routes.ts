import { withSearchParams } from "@/lib/search-params";

/**
 * Typed route builders — link with these, never with string literals (docs/03-architecture.md §9).
 */

const segment = (value: string) => encodeURIComponent(value);

export const routes = {
  home: () => "/",
  search: (query?: {
    q?: string | undefined;
    tab?: string | undefined;
    type?: string | undefined;
    price?: string | undefined;
    sort?: string | undefined;
  }) =>
    withSearchParams("/search", {
      q: query?.q,
      tab: query?.tab,
      type: query?.type,
      price: query?.price,
      sort: query?.sort,
    }),
  /** "Near me": neighbourhoods and places around the browser's position. */
  near: () => "/near",
  /** The index pages: every food, every chain, every district. */
  foods: () => "/food",
  brands: () => "/brand",
  districts: () => "/district",
  food: (slug: string) => `/food/${segment(slug)}`,
  place: (slug: string) => `/place/${segment(slug)}`,
  /** A chain and all its branches: /brand/khanas. */
  brand: (slug: string) => `/brand/${segment(slug)}`,
  district: (slug: string) => `/district/${segment(slug)}`,
  districtFood: (districtSlug: string, foodSlug: string) =>
    `/district/${segment(districtSlug)}/${segment(foodSlug)}`,
  /** A neighbourhood inside a district: /district/dhaka/area/dhanmondi. */
  area: (districtSlug: string, areaSlug: string) =>
    `/district/${segment(districtSlug)}/area/${segment(areaSlug)}`,
  add: () => "/add",
  /** A person who chose to be on the contributors list. */
  person: (id: string) => `/people/${segment(id)}`,
  /** Top contributors by period. */
  leaderboard: () => "/leaderboard",
  /** The passport: level, stamps, badges, missions. */
  me: () => "/me",
  /** "Me": contributions, what I ate, saved, settings. */
  profile: () => "/me/profile",
  /** Login page; `next` is where to land afterwards (a site path). */
  login: (opts?: { next?: string | undefined; error?: boolean }) =>
    withSearchParams("/login", { next: opts?.next, error: opts?.error ? "1" : undefined }),
  signIn: (next?: string) => withSearchParams("/auth/sign-in", { next }),
  signOut: () => "/auth/sign-out",
  admin: () => "/admin",
  policy: () => "/policy",
  about: () => "/about",
  comingSoon: () => "/coming-soon",
  authCallback: () => "/auth/callback",
  dev: {
    skeletons: () => "/dev/skeletons",
    themes: () => "/dev/themes",
  },
  api: {
    health: () => "/api/health",
    search: (query: { q: string }) => withSearchParams("/api/search", { q: query.q }),
  },
} as const;
