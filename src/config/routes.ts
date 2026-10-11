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
  }) =>
    withSearchParams("/search", {
      q: query?.q,
      tab: query?.tab,
      type: query?.type,
      price: query?.price,
    }),
  food: (slug: string) => `/food/${segment(slug)}`,
  place: (slug: string) => `/place/${segment(slug)}`,
  district: (slug: string) => `/district/${segment(slug)}`,
  districtFood: (districtSlug: string, foodSlug: string) =>
    `/district/${segment(districtSlug)}/${segment(foodSlug)}`,
  /** A neighbourhood inside a district: /district/dhaka/area/dhanmondi. */
  area: (districtSlug: string, areaSlug: string) =>
    `/district/${segment(districtSlug)}/area/${segment(areaSlug)}`,
  add: () => "/add",
  me: () => "/me",
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
