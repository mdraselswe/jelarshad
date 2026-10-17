import "server-only";

import { serverEnv } from "@/config/env";
import type {
  AnalyticsProvider,
  AuthProvider,
  CacheInvalidator,
  ErrorReporter,
  RateLimiter,
  Repositories,
  StorageProvider,
} from "@/core/ports";
import { createCatalogService, type CatalogService } from "@/services/catalog-service";
import { createAddService, type AddService } from "@/services/add-service";
import { createClaimService, type ClaimService } from "@/services/claim-service";
import { createExperienceService, type ExperienceService } from "@/services/experience-service";
import { createMeService, type MeService } from "@/services/me-service";
import { createMediaService, type MediaService } from "@/services/media-service";
import { createAdminService, type AdminService } from "@/services/admin-service";
import { createModerationService, type ModerationService } from "@/services/moderation-service";
import { createPushService, type PushService } from "@/services/push-service";
import { createRewardService, type RewardService } from "@/services/reward-service";
import { createSavedService, type SavedService } from "@/services/saved-service";
import { createSearchService, type SearchService } from "@/services/search-service";
import { createDefineAction } from "@/lib/action";

import { createWebPushSender } from "./push/web-push";
import { createFirstPartyAnalytics } from "./analytics/first-party";
import { noopAnalytics } from "./analytics/noop";
import { createCloudinaryStorage } from "./cloudinary/storage";
import { createFirstPartyErrorReporter } from "./errors/first-party";
import { createMockAuth } from "./mock/auth";
import { createMockRepositories } from "./mock/repositories";
import { createMockStorage } from "./mock/storage";
import { nextCacheInvalidator } from "./next/cache-invalidator";
import { createRateLimiter } from "./shared/rate-limiter";
import { createSupabaseAuth, createSupabaseRepositories } from "./supabase";

/** Renews an expiring Supabase session; called from proxy.ts (Server Components cannot write cookies). */
export { refreshSupabaseSession as refreshAuthSession } from "./supabase/proxy-session";

// Wires every port to an adapter chosen by env (docs/03-architecture.md §5). The only module the
// app imports from infrastructure on the server. Services join here as they are built (Phase 1+).

function assertNever(value: never): never {
  throw new Error(`Unhandled provider: ${String(value)}`);
}

export type Services = {
  repos: Repositories;
  catalog: CatalogService;
  search: SearchService;
  experience: ExperienceService;
  add: AddService;
  saved: SavedService;
  claims: ClaimService;
  moderation: ModerationService;
  admin: AdminService;
  media: MediaService;
  me: MeService;
  rewards: RewardService;
  auth: AuthProvider;
  storage: StorageProvider;
  cache: CacheInvalidator;
  analytics: AnalyticsProvider;
  errors: ErrorReporter;
  rateLimiter: RateLimiter;
  push: PushService;
};

let services: Services | undefined;

/** Adapters are created once per server process (the mock store must survive between requests). */
export function getServices(): Services {
  if (services) return services;
  const env = serverEnv();

  const repos =
    env.DB_PROVIDER === "mock"
      ? createMockRepositories()
      : env.DB_PROVIDER === "supabase"
        ? createSupabaseRepositories()
        : assertNever(env.DB_PROVIDER);

  const auth =
    env.AUTH_PROVIDER === "mock"
      ? createMockAuth()
      : env.AUTH_PROVIDER === "supabase"
        ? createSupabaseAuth()
        : assertNever(env.AUTH_PROVIDER);

  const storageProvider = env.NEXT_PUBLIC_STORAGE_PROVIDER;
  const storage =
    storageProvider === "mock"
      ? createMockStorage()
      : storageProvider === "cloudinary" ||
          storageProvider === "imagekit" ||
          storageProvider === "supabase"
        ? createCloudinaryStorage() // only Cloudinary is planned (decision T5); others fail loudly
        : assertNever(storageProvider);

  const analytics =
    env.ANALYTICS_PROVIDER === "first-party"
      ? createFirstPartyAnalytics(repos.insights)
      : env.ANALYTICS_PROVIDER === "noop" || env.ANALYTICS_PROVIDER === "vercel"
        ? noopAnalytics // a Vercel analytics adapter arrives only if it is enabled
        : assertNever(env.ANALYTICS_PROVIDER);

  const rateLimiter = createRateLimiter(repos.rateLimits);
  const rewards = createRewardService({ repos });
  const pushSender =
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY
      ? createWebPushSender({
          publicKey: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          privateKey: env.VAPID_PRIVATE_KEY,
          subject: env.VAPID_SUBJECT,
        })
      : null;
  const experience = createExperienceService({ repos, cache: nextCacheInvalidator, rewards });
  const claims = createClaimService({ repos, cache: nextCacheInvalidator, rewards });

  services = {
    repos,
    catalog: createCatalogService({ repos }),
    search: createSearchService({ repos }),
    experience,
    saved: createSavedService({ repos }),
    claims,
    me: createMeService({ repos }),
    media: createMediaService({
      repos,
      storage,
      cache: nextCacheInvalidator,
      provider: storageProvider,
    }),
    rewards,
    moderation: createModerationService({ repos, cache: nextCacheInvalidator, rewards }),
    admin: createAdminService({ repos, cache: nextCacheInvalidator, rewards, storage }),
    add: createAddService({
      repos,
      experience,
      claims,
      rewards,
      rateLimiter,
      cache: nextCacheInvalidator,
    }),
    auth,
    storage,
    cache: nextCacheInvalidator,
    analytics,
    errors: createFirstPartyErrorReporter(repos.insights),
    rateLimiter,
    push: createPushService({ repos, rewards, sender: pushSender }),
  };
  return services;
}

/** Server action wrapper wired to this container: validation → auth → rate limit → Result. */
export const defineAction = createDefineAction({
  auth: () => getServices().auth,
  rateLimiter: () => getServices().rateLimiter,
  errors: () => getServices().errors,
  services: getServices,
});
