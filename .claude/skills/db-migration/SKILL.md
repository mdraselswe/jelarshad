---
name: db-migration
description: Change the Jelar Shad PostgreSQL schema safely - new table, column, index, function or RLS policy - via Supabase migration files, regenerated types and repository updates. Use for any database change.
---

# Database migration

1. Read `docs/04-database.md`. Keep SQL portable Postgres; Supabase-specific bits only in RLS (`auth.uid()`).
2. Create `supabase/migrations/<timestamp>_<snake_name>.sql` (`pnpm supabase migration new <name>`). Never edit an applied migration; add a new one.
3. For every new table: primary key, `created_at`, needed indexes, `alter table … enable row level security`, explicit policies (public read only for active rows; owner insert/update; admin via `is_admin()`).
4. Aggregates/counters are updated only through `security definer` functions with `set search_path = public`.
5. Apply locally (`pnpm db:migrate`), then `pnpm db:types`.
6. Update repository mappers in `src/infrastructure/supabase/repositories/` and domain types in `src/core/domain/` — DB row types never leave `infrastructure/`.
7. Add/adjust tests: RLS (anon vs user vs admin), function outputs (e.g. `wilson_lower_bound` matches `lib/ranking/wilson.ts`).
8. Update `docs/04-database.md` so the doc always matches the schema.
9. Check free-tier impact: row size, index size, query plan (`explain analyze`) for hot paths.
