// Provider choices per port (docs/02-tech-stack.md §7). Shared by config/env.ts (zod, server) and
// config/public-env.ts (browser) so the lists never drift apart.
export const DB_PROVIDERS = ["supabase", "mock"] as const;
export const AUTH_PROVIDERS = ["supabase", "mock"] as const;
export const STORAGE_PROVIDERS = ["cloudinary", "imagekit", "supabase", "mock"] as const;
export const ANALYTICS_PROVIDERS = ["first-party", "noop", "vercel"] as const;

export type StorageProviderId = (typeof STORAGE_PROVIDERS)[number];
