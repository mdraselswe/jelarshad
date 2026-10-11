import type { appConfig } from "@/config/app.config";
import type {
  AppUser,
  MediaPurpose,
  MediaRef,
  MediaVariant,
  Session,
  UploadTicket,
} from "@/core/domain";

// Non-data ports (docs/03-architecture.md §4). Swap a vendor = one adapter + one env value.

/** Thrown by AuthProvider.requireUser(); defineAction turns it into Result `auth_required`. */
export class AuthRequiredError extends Error {
  constructor() {
    super("auth_required");
    this.name = "AuthRequiredError";
  }
}

export interface AuthProvider {
  getSession(): Promise<Session | null>;
  /** The signed-in user, or throws AuthRequiredError. */
  requireUser(): Promise<AppUser>;
  /** URL to send the visitor to for Google sign-in; `redirectTo` is our absolute /auth/callback URL. */
  signInWithGoogleUrl(redirectTo: string): Promise<string>;
  /** Finishes sign-in on /auth/callback (exchanges the one-time `code`); false = it failed. */
  completeSignIn(code: string | null): Promise<boolean>;
  signOut(): Promise<void>;
}

export interface StorageProvider {
  createUploadTicket(input: { userId: string; purpose: MediaPurpose }): Promise<UploadTicket>;
  confirmUpload(input: { key: string; userId: string }): Promise<MediaRef>;
  delete(key: string): Promise<void>;
  /** Pure and browser-safe: also used by the <AppImage> loader. */
  url(key: string, variant: MediaVariant): string;
}

/** Cache tags for read paths ('use cache' + cacheTag); writes invalidate the affected ones. */
export type CacheTag =
  | `food:${string}`
  | `place:${string}`
  | `district:${string}`
  | `dish:${string}`
  | `user:${string}`
  | "districts"
  | "foods"
  | "search";

export interface CacheInvalidator {
  invalidate(tags: CacheTag[]): Promise<void>;
}

export type AnalyticsEvent =
  | { name: "search"; query: string; results: number }
  | { name: "experience_added"; dishId: string }
  | { name: "place_added"; placeId: string }
  | { name: "claim_voted"; claimId: string }
  | { name: "share"; path: string };

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): void;
}

export interface ErrorReporter {
  report(error: unknown, context?: Record<string, unknown>): void;
}

/** Actions with a daily limit (appConfig.limits.perDay). */
export type RateLimitedAction = keyof typeof appConfig.limits.perDay;

export type RateLimitDecision = { allowed: true } | { allowed: false; retryAfter: number };

export interface RateLimiter {
  /** Checks the limit and, when allowed, counts this use. */
  consume(userId: string, action: RateLimitedAction): Promise<RateLimitDecision>;
}
