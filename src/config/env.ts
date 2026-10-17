import { z } from "zod";

import {
  ANALYTICS_PROVIDERS as analyticsProviders,
  AUTH_PROVIDERS as authProviders,
  DB_PROVIDERS as dbProviders,
  STORAGE_PROVIDERS as storageProviders,
} from "./providers";

/**
 * The only place that reads `process.env` (docs/02-tech-stack.md §7, docs/03-architecture.md §9).
 * Vendor keys are required only when that vendor is selected, so CI and local work run on mocks.
 * `next.config.ts` imports this file, so an invalid environment fails the build.
 */

const optionalString = z.string().trim().min(1).optional();

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_LAUNCHED: z.stringbool().default(false),
  /** Shows "Continue with Facebook"; turn on only once the Facebook provider is set up in Supabase. */
  NEXT_PUBLIC_FACEBOOK_LOGIN: z.stringbool().default(false),
  /** The public half of the web-push key pair; reminders are offered only when it is set. */
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: optionalString,
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["bn", "en"]).default("bn"),
  NEXT_PUBLIC_STORAGE_PROVIDER: z.enum(storageProviders).default("mock"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: optionalString,
  /** Shown on the privacy page as the place to ask for data removal. */
  NEXT_PUBLIC_CONTACT_EMAIL: z.email().optional(),
});

const serverSchema = z.object({
  AUTH_PROVIDER: z.enum(authProviders).default("mock"),
  DB_PROVIDER: z.enum(dbProviders).default("mock"),
  ANALYTICS_PROVIDER: z.enum(analyticsProviders).default("first-party"),
  PREVIEW_ACCESS_SECRET: optionalString,
  /** The private half of the web-push key pair, and who the push service may contact about it. */
  VAPID_PRIVATE_KEY: optionalString,
  VAPID_SUBJECT: z.string().trim().min(1).default("mailto:rrasel141@gmail.com"),
  /** Protects /api/cron/*: Vercel sends it as a bearer token. */
  CRON_SECRET: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  CLOUDINARY_UPLOAD_FOLDER: z.string().trim().min(1).default("jelarshad"),
  ADMIN_EMAILS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    )
    .pipe(z.array(z.email())),
  /** Set by Vercel / GitHub Actions; reported by /api/health. */
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
  VERCEL_GIT_COMMIT_SHA: optionalString,
  GITHUB_SHA: optionalString,
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema> & ClientEnv;

type Source = Record<string, string | undefined>;

function requireKeys(
  ctx: z.RefinementCtx,
  source: Record<string, unknown>,
  keys: readonly string[],
  reason: string,
  hidden: ReadonlySet<string> = new Set(),
) {
  for (const key of keys) {
    if (source[key] === undefined && !hidden.has(key)) {
      ctx.addIssue({ code: "custom", path: [key], message: `Required when ${reason}` });
    }
  }
}

/**
 * An empty variable means "not set". Hosts write empty values for things they don't know
 * (e.g. `vercel pull` sets VERCEL_GIT_COMMIT_SHA="" for CLI deploys), and `.env` files often leave keys blank.
 */
function withoutEmpty(source: Source): Source {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined && value.trim() !== ""),
  );
}

/** Preview deployments have no fixed URL; fall back to the branch URL Vercel exposes. */
function withSiteUrlFallback(source: Source): Source {
  if (source.NEXT_PUBLIC_SITE_URL) return source;
  const branchUrl = source.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? source.VERCEL_BRANCH_URL;
  const fallback = branchUrl ? `https://${branchUrl}` : "http://localhost:3000";
  return { ...source, NEXT_PUBLIC_SITE_URL: fallback };
}

export function parseClientEnv(source: Source): ClientEnv {
  return clientSchema
    .superRefine((env, ctx) => {
      if (env.NEXT_PUBLIC_STORAGE_PROVIDER === "cloudinary") {
        requireKeys(ctx, env, ["NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"], "storage is cloudinary");
      }
    })
    .parse(withSiteUrlFallback(withoutEmpty(source)));
}

/**
 * `vercel pull` writes "[SENSITIVE]" instead of the value of variables marked Sensitive; the real
 * values reach the running site, never the build. Only while building, those variables count as
 * "hidden": left out of the parse and not reported as missing. Anywhere else the placeholder stays
 * an invalid value, so it can never be mistaken for a real one.
 */
const SENSITIVE_PLACEHOLDER = "[SENSITIVE]";

function withoutHidden(
  source: Source,
  allowPlaceholders: boolean,
): { source: Source; hidden: Set<string> } {
  const hidden = new Set<string>();
  if (!allowPlaceholders && source.NEXT_PHASE !== "phase-production-build") {
    return { source, hidden };
  }
  const kept: Source = {};
  for (const [key, value] of Object.entries(source)) {
    if (value?.replace(/^"|"$/g, "") === SENSITIVE_PLACEHOLDER) hidden.add(key);
    else kept[key] = value;
  }
  return { source: kept, hidden };
}

export function parseServerEnv(
  rawSource: Source,
  options: { allowPlaceholders?: boolean } = {},
): ServerEnv {
  const { source: visible, hidden } = withoutHidden(rawSource, options.allowPlaceholders ?? false);
  const source = withoutEmpty(visible);
  const client = parseClientEnv(source);
  const server = serverSchema
    .superRefine((env, ctx) => {
      if (env.DB_PROVIDER === "supabase" || env.AUTH_PROVIDER === "supabase") {
        requireKeys(
          ctx,
          { ...client, ...env },
          [
            "NEXT_PUBLIC_SUPABASE_URL",
            "NEXT_PUBLIC_SUPABASE_ANON_KEY",
            "SUPABASE_SERVICE_ROLE_KEY",
          ],
          "DB_PROVIDER or AUTH_PROVIDER is supabase",
          hidden,
        );
      }
      if (client.NEXT_PUBLIC_STORAGE_PROVIDER === "cloudinary") {
        requireKeys(
          ctx,
          env,
          ["CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
          "storage is cloudinary",
          hidden,
        );
      }
      // A launched production site must never serve fixture data.
      if (env.VERCEL_ENV === "production" && client.NEXT_PUBLIC_LAUNCHED) {
        const mocks = [
          env.DB_PROVIDER === "mock" && "DB_PROVIDER",
          env.AUTH_PROVIDER === "mock" && !hidden.has("AUTH_PROVIDER") && "AUTH_PROVIDER",
          client.NEXT_PUBLIC_STORAGE_PROVIDER === "mock" && "NEXT_PUBLIC_STORAGE_PROVIDER",
        ].filter((key): key is string => Boolean(key));
        for (const key of mocks) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "Cannot be mock in launched production",
          });
        }
      }
    })
    .parse(source);
  return { ...client, ...server };
}

/**
 * Browser-safe values. Each NEXT_PUBLIC_* is read by its literal name so Next.js can inline it
 * into client bundles.
 */
export const clientEnv: ClientEnv = parseClientEnv({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_VERCEL_BRANCH_URL: process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL,
  NEXT_PUBLIC_LAUNCHED: process.env.NEXT_PUBLIC_LAUNCHED,
  NEXT_PUBLIC_FACEBOOK_LOGIN: process.env.NEXT_PUBLIC_FACEBOOK_LOGIN,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || undefined,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  NEXT_PUBLIC_STORAGE_PROVIDER: process.env.NEXT_PUBLIC_STORAGE_PROVIDER,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || undefined,
});

let cachedServerEnv: ServerEnv | undefined;

/** Server-only values (secrets included). Throws if called from browser code. */
export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() was called in the browser; use clientEnv instead.");
  }
  cachedServerEnv ??= parseServerEnv(process.env);
  return cachedServerEnv;
}

/**
 * For next.config.ts, which runs before Next sets NEXT_PHASE: the same checks, but Vercel's
 * [SENSITIVE] placeholders are allowed (the running site validates the real values with serverEnv()).
 */
export function validateBuildEnv(): void {
  parseServerEnv(process.env, { allowPlaceholders: true });
}

/** True on the server (and in Node scripts/tests). */
export const isServer = typeof window === "undefined";
/** `next dev` (not `next start`, not tests in CI builds). */
export const isDev = process.env.NODE_ENV === "development";
