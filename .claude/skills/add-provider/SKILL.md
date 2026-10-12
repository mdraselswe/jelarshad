---
name: add-provider
description: Add or swap a vendor/package (database, auth, image storage, analytics, error reporting) behind a port in Jelar Shad without touching business logic. Use when integrating or replacing any third-party service or SDK.
---

# Add or swap a provider

1. Find the port in `src/core/ports/` (StorageProvider, AuthProvider, *Repository, AnalyticsProvider, ErrorReporter, CacheInvalidator). If none fits, design a minimal interface there first — methods named by what the app needs, not by the vendor's API.
2. Confirm the vendor's free tier needs **no credit card** and degrades (pauses) instead of billing. If not, stop and ask.
3. Create `src/infrastructure/<vendor>/` implementing the port. Mark server files `import 'server-only'`. Map vendor types to domain types inside the adapter.
4. Add env vars to `src/config/env.ts` (zod) and `.env.example`. Add the option to the provider selector env (e.g. `NEXT_PUBLIC_STORAGE_PROVIDER`).
5. Wire it in `src/infrastructure/container.ts` (server) and, only if browser-safe and secret-free, `src/infrastructure/client.ts`.
6. Add the SDK package name to the ESLint restricted-imports list so it cannot leak outside `infrastructure/`.
7. Write a contract test in `src/infrastructure/<vendor>/<port>.contract.test.ts` that runs the same assertions as the existing adapter's test (shared helper in `src/core/ports/__tests__/`).
8. Switch via env, run the app, verify, then remove the old adapter only when nothing references it.
9. Update `docs/02-tech-stack.md` table.
