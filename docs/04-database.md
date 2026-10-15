# 04 — Database (PostgreSQL on Supabase)

All changes go through `supabase/migrations/NNNN_name.sql`. Generate TS types after each migration
(`pnpm db:types`). Keep SQL portable Postgres (no Supabase-only features except `auth.uid()` in RLS,
which is isolated to policies).

## 1. Entity map
```
districts 1─* areas
districts 1─* regional_fame *─1 foods        (curated "famous for")
places *─1 districts, *─1 areas
dishes = places *─* foods  (unique place_id+food_id)  ← ratings & prices live here
experiences *─1 dishes, *─1 profiles          (one per user per dish)
claims (entity = place | dish) 1─* claim_votes *─1 profiles
media (entity = experience | place | food | claim_vote)
edit_suggestions, reports, saved_items, rate_limit_events, aliases
profiles 1─1 auth.users
```

## 2. Enums
```sql
create type place_type      as enum ('restaurant','shop','street_food','bakery','home_kitchen','other');
create type content_status  as enum ('active','pending','hidden','closed','merged');
create type reaction        as enum ('loved','okay','disliked');          -- 😋 😐 👎
create type claim_type      as enum ('availability','price','place_status','location','opening_hours');
create type claim_status    as enum ('unverified','confirmed','mixed','disputed');
create type verdict         as enum ('correct','partial','wrong');
create type wrong_reason    as enum ('not_available','wrong_price','wrong_location','closed','other');
create type evidence_type   as enum ('photo','link');                     -- extend later: receipt, menu
create type entity_type     as enum ('food','place','dish','district','experience','claim','media','profile');
create type review_status   as enum ('open','approved','rejected');
create type user_role       as enum ('user','moderator','admin');
create type saved_kind      as enum ('want_to_try');
```

## 3. Tables
```sql
create extension if not exists pg_trgm;
create extension if not exists unaccent;
create extension if not exists postgis;
-- Order in the migration: districts → areas → profiles → foods → … (profiles references districts)

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null,
  avatar_url text,
  role user_role not null default 'user',
  home_district_id smallint references districts,
  is_banned boolean not null default false,
  created_at timestamptz not null default now()
);

create table districts (
  id smallint primary key,
  slug text unique not null,               -- 'bogura'
  name_bn text not null, name_en text not null,
  division_bn text not null, division_en text not null,
  center geography(point),
  place_count int not null default 0,       -- denormalized for home/district lists
  search_text text not null default '', search_key text not null default ''
);

create table areas (
  id serial primary key,
  district_id smallint not null references districts,
  slug text not null, name_bn text not null, name_en text,
  unique (district_id, slug)
);

create table foods (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,               -- 'kacchi'
  name_bn text not null, name_en text,
  about_bn text,                           -- "কেন বিখ্যাত" (admin)
  cover_media_id uuid,
  status content_status not null default 'active',
  search_text text not null default '', search_key text not null default '',
  experience_count int not null default 0,
  loved_count int not null default 0,
  created_by uuid references profiles,
  created_at timestamptz not null default now()
);

create table aliases (                      -- Banglish/variants for foods, places, districts
  id bigserial primary key,
  entity entity_type not null,
  entity_id text not null,
  alias text not null,
  search_key text not null,
  unique (entity, entity_id, search_key)
);

create table places (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,               -- 'akbaria-hotel-bogura'
  name_bn text not null, name_en text,
  type place_type not null default 'restaurant',
  district_id smallint not null references districts,
  area_id int references areas,
  address text,
  location geography(point),
  opening_hours jsonb,                     -- { "sat": [["10:00","22:00"]], … } nullable
  price_min int, price_max int,            -- taka, derived from dishes
  status content_status not null default 'active',
  merged_into uuid references places,
  search_text text not null default '', search_key text not null default '',
  created_by uuid references profiles,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table regional_fame (
  id serial primary key,
  district_id smallint not null references districts,
  area_id int references areas,
  food_id uuid not null references foods,
  note_bn text,
  source_url text,                         -- editorial source
  sort_order smallint not null default 0,
  unique (district_id, food_id)
);

create table dishes (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places on delete cascade,
  food_id uuid not null references foods,
  display_name text,                       -- override e.g. 'স্পেশাল কাচ্চি'
  price_min int, price_max int,
  price_confirmed_at timestamptz,
  loved_count int not null default 0,
  okay_count int not null default 0,
  disliked_count int not null default 0,
  experience_count int generated always as (loved_count + okay_count + disliked_count) stored,
  wilson_score double precision not null default 0,
  last_experience_at timestamptz,
  status content_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (place_id, food_id)
);

create table experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles,
  dish_id uuid not null references dishes on delete cascade,
  reaction reaction not null,
  comment text check (char_length(comment) <= 500),
  price_paid int check (price_paid between 1 and 100000),
  visited_on date,
  status content_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dish_id)
);

create table claims (
  id uuid primary key default gen_random_uuid(),
  entity entity_type not null check (entity in ('place','dish')),
  entity_id uuid not null,
  type claim_type not null,
  value jsonb not null,                    -- { "available": true } | { "min":250,"max":350 } | …
  status claim_status not null default 'unverified',
  correct_count int not null default 0, partial_count int not null default 0, wrong_count int not null default 0,
  last_confirmed_at timestamptz,
  expires_at timestamptz,                  -- last_confirmed_at + ttl(type); null = never
  created_by uuid references profiles,
  created_at timestamptz not null default now(),
  unique (entity, entity_id, type)
);

create table claim_votes (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references claims on delete cascade,
  user_id uuid not null references profiles,
  verdict verdict not null,
  reason wrong_reason,
  note text check (char_length(note) <= 300),
  evidence_type evidence_type,
  evidence_media_id uuid,
  evidence_url text,
  created_at timestamptz not null default now(),
  unique (claim_id, user_id)               -- re-vote updates the row
);

create table media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles,
  entity entity_type not null,
  entity_id text not null,
  provider text not null,                  -- 'cloudinary' | 'imagekit' | …
  provider_key text not null,              -- public id / path
  width int not null, height int not null,
  dominant_color text,                     -- '#c48a3a' for placeholder
  status content_status not null default 'active',
  created_at timestamptz not null default now()
);

create table edit_suggestions (
  id uuid primary key default gen_random_uuid(),
  entity entity_type not null, entity_id text not null,
  field text not null, current_value text, proposed_value text not null,
  note text, user_id uuid not null references profiles,
  status review_status not null default 'open',
  reviewed_by uuid references profiles, reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  entity entity_type not null, entity_id text not null,
  reason text not null, note text,
  user_id uuid not null references profiles,
  status review_status not null default 'open',
  created_at timestamptz not null default now()
);

create table saved_items (
  user_id uuid not null references profiles on delete cascade,
  entity entity_type not null check (entity in ('food','dish','place')),
  entity_id text not null,
  kind saved_kind not null default 'want_to_try',
  created_at timestamptz not null default now(),
  primary key (user_id, entity, entity_id, kind)
);

-- Gamification (MVP-light). Points are an append-only ledger; totals are derived.
create type point_reason as enum ('experience','place_create','discoverer','claim_vote','edit_accepted','revoked');

create table point_events (
  id bigserial primary key,
  user_id uuid not null references profiles on delete cascade,
  reason point_reason not null,
  points int not null,                       -- negative for revocations
  entity entity_type, entity_id text,        -- what earned it (for revocation)
  created_at timestamptz not null default now(),
  unique (user_id, reason, entity, entity_id) -- one award per action
);

create table district_stamps (               -- passport: first experience per district
  user_id uuid not null references profiles on delete cascade,
  district_id smallint not null references districts,
  first_experience_id uuid references experiences on delete set null,
  is_discoverer boolean not null default false,
  stamped_at timestamptz not null default now(),
  primary key (user_id, district_id)
);
-- profiles gets: points_total int not null default 0 (updated by award_points())

create table search_misses (               -- queries with no results → guide aliases/content
  search_key text primary key,
  sample_query text not null,
  count int not null default 1,
  last_seen_at timestamptz not null default now()
);

create table rate_limit_events (
  id bigserial primary key,
  user_id uuid not null,
  action text not null,
  created_at timestamptz not null default now()
);
```

## 4. Indexes
```sql
create index on foods  using gin (search_text gin_trgm_ops);
create index on foods  using gin (search_key  gin_trgm_ops);
create index on places using gin (search_text gin_trgm_ops);
create index on places using gin (search_key  gin_trgm_ops);
create index on districts using gin (search_key gin_trgm_ops);
create index on aliases using gin (search_key gin_trgm_ops);
create index on places (district_id, status);
create index on places using gist (location);
create index on dishes (food_id, wilson_score desc) where status = 'active';
create index on dishes (place_id, wilson_score desc) where status = 'active';
create index on experiences (dish_id, created_at desc) where status = 'active';
create index on experiences (user_id, created_at desc);
create index on claims (entity, entity_id);
create index on claims (expires_at) where expires_at is not null;
create index on media (entity, entity_id) where status = 'active';
create index on rate_limit_events (user_id, action, created_at desc);
create index on edit_suggestions (status, created_at) where status = 'open';
create index on reports (status, created_at) where status = 'open';
```

## 5. SQL functions
```sql
-- Wilson lower bound (portable Postgres)
create or replace function wilson_lower_bound(pos int, n int, z double precision default 1.96)
returns double precision language sql immutable as $$
  select case when n = 0 then 0 else
    ((pos::float/n) + z*z/(2*n) - z*sqrt(((pos::float/n)*(1-(pos::float/n)) + z*z/(4*n))/n)) / (1 + z*z/n)
  end
$$;

-- Recompute a dish's aggregates (called by the service after experience writes, inside one transaction)
create or replace function refresh_dish_stats(p_dish uuid) returns void language sql as $$
  update dishes d set
    loved_count    = s.loved, okay_count = s.okay, disliked_count = s.disliked,
    wilson_score   = wilson_lower_bound(s.loved, s.loved + s.okay + s.disliked),
    last_experience_at = s.last_at,
    price_min = coalesce(s.pmin, d.price_min), price_max = coalesce(s.pmax, d.price_max)
  from (
    select count(*) filter (where reaction='loved')    loved,
           count(*) filter (where reaction='okay')     okay,
           count(*) filter (where reaction='disliked') disliked,
           max(created_at) last_at,
           percentile_disc(0.1) within group (order by price_paid) pmin,
           percentile_disc(0.9) within group (order by price_paid) pmax
    from experiences where dish_id = p_dish and status = 'active'
  ) s where d.id = p_dish;
$$;

-- Unified search: returns typed hits; query is pre-normalized by lib/text (see §6)
create or replace function search_all(q_text text, q_key text, lim int default 8)
returns table (kind text, id text, slug text, title text, subtitle text, score real)
language sql stable as $$
  ( select 'food' as kind, f.id::text as id, f.slug, f.name_bn as title, null as subtitle,
           greatest(similarity(f.search_text, q_text), similarity(f.search_key, q_key)) as score
    from foods f where f.status='active' and (f.search_text % q_text or f.search_key % q_key)
    union all
    select 'food', f.id::text, f.slug, f.name_bn, a.alias, similarity(a.search_key, q_key)
    from aliases a join foods f on a.entity='food' and f.id::text = a.entity_id
    where a.search_key % q_key
    union all
    select 'place', p.id::text, p.slug, p.name_bn, d.name_bn,
           greatest(similarity(p.search_text, q_text), similarity(p.search_key, q_key))
    from places p join districts d on d.id = p.district_id
    where p.status='active' and (p.search_text % q_text or p.search_key % q_key)
    union all
    select 'district', d.id::text, d.slug, d.name_bn, d.division_bn, similarity(d.search_key, q_key)
    from districts d where d.search_key % q_key )
  order by score desc limit lim
$$;
-- Dedupe by (kind,id) in the service layer. Tune threshold with: set pg_trgm.similarity_threshold.

-- Rate limit check (returns true if allowed and records the event)
create or replace function check_rate_limit(p_user uuid, p_action text, p_max int, p_window interval)
returns boolean language plpgsql security definer set search_path = public as $$
declare used int;
begin
  select count(*) into used from rate_limit_events
   where user_id = p_user and action = p_action and created_at > now() - p_window;
  if used >= p_max then return false; end if;
  insert into rate_limit_events(user_id, action) values (p_user, p_action);
  return true;
end $$;

create or replace function is_admin() returns boolean language sql stable security definer
set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator'))
$$;
```
```sql
-- Award points idempotently and keep the cached total in sync (called by services, security definer)
create or replace function award_points(p_user uuid, p_reason point_reason, p_points int,
  p_entity entity_type, p_entity_id text) returns int
language plpgsql security definer set search_path = public as $$
declare inserted int;
begin
  insert into point_events(user_id, reason, points, entity, entity_id)
  values (p_user, p_reason, p_points, p_entity, p_entity_id)
  on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted = 1 then
    update profiles set points_total = points_total + p_points where id = p_user;
    return p_points;
  end if;
  return 0;
end $$;
```
Stamp rule (in `services/passportService.ts`): after an experience is created, `insert … on conflict do nothing`
into `district_stamps` for the place's district; if a row was inserted, return `{ stampUnlocked: district }`
so the UI shows the stamp animation. Indexes: `point_events (user_id, created_at desc)`,
`district_stamps (user_id)`. RLS: owner-only read for `point_events`; `district_stamps` public read
(passports are shareable), writes only via services.

Claim status is computed in `services/claimService.ts` (rules in `appConfig.claims`), then saved.
Rule: votes = correct+partial+wrong; if votes < minVotes → `unverified` (or keep prior);
correct/votes ≥ confirmRatio → `confirmed`; wrong/votes ≥ disputeRatio → `disputed`; else `mixed`.
On `correct` vote: `last_confirmed_at = now()`, `expires_at = now() + ttl(type)`.

## 6. Search normalization (in `src/lib/text/`)
`normalizeBn(s)`: NFC → remove ZWJ/ZWNJ/zero-width → unify `য়`/`য়`, `ড়`/`ড়`, `ঢ়` composed forms →
collapse spaces → lowercase Latin.
`toSearchKey(s)`: Bangla → rough Latin transliteration (map table), then phonetic folding:
`chh|ch|c→c`, `sh|s→s`, `z|j→j`, `ph|f→f`, `w|v→b`, `kh→k`, `gh→g`, `th→t`, `dh→d`, `bh→b`,
`ee|i→i`, `oo|u→u`, `o|a→a` (Bangla inherent vowel), `y→i`, drop `h` after consonants, collapse doubled letters.
(Do not strip vowels entirely — it merges unrelated foods. Typos beyond this are handled by trigram similarity.)
So `kacchi`, `kachchi`, `kacci`, `কাচ্চি`, `কাচি` → same key. Stop-words removed from queries:
`er, ar, r, kothay, kotha, ভালো, কোথায়, এর`.
Both `search_text` (normalized original + aliases) and `search_key` are written by the service on
create/update. Unit-test this file heavily (it is the heart of search quality).

## 7. Row Level Security
Enable RLS on every table. Patterns:
```sql
alter table foods enable row level security;
create policy "public read active" on foods for select using (status = 'active' or is_admin());
create policy "auth insert"        on foods for insert with check (auth.uid() = created_by);
create policy "admin update"       on foods for update using (is_admin());

-- experiences
create policy "public read"  on experiences for select using (status = 'active' or user_id = auth.uid() or is_admin());
create policy "own insert"   on experiences for insert with check (user_id = auth.uid()
  and not exists (select 1 from profiles where id = auth.uid() and is_banned));
create policy "own update"   on experiences for update using (user_id = auth.uid());
create policy "own delete"   on experiences for delete using (user_id = auth.uid() or is_admin());
```
- `saved_items`, `rate_limit_events`: owner-only select; no public read.
- `reports`, `edit_suggestions`: insert by auth user; select own or admin.
- `profiles`: public read of `display_name, avatar_url` via a view `public_profiles`; update own (not `role`, `is_banned` — enforce with column privileges or a trigger).
- Aggregate columns (`*_count`, `wilson_score`, claim status) are updated only by `security definer`
  functions called from the service with the server client; regular users cannot update them.

As implemented (`supabase/migrations/0001–0005`, tests in `supabase/tests/database.test.sql`, run on the DEV
project by the Preview workflow):
- Extensions live in the `extensions` schema (`extensions.geography`, `extensions.gin_trgm_ops`).
- `is_active_user()` = signed in and not banned; every user insert policy requires it.
- Inserts must start "empty": a new dish has zero counts, a new claim is `unverified` with zero votes.
- `protect_profile_privileges` trigger: end-user requests (`anon`/`authenticated`) can change `role` / `is_banned`
  only as admins; the service role and direct DB sessions (SQL editor, seed) are not restricted (0005).
- `refresh_dish_stats` and `check_rate_limit` are executable by `service_role` only.
- `search_misses` has RLS with no policies (server only); `rate_limit_events` is owner-read only.
- Gamification tables (`point_events`, `district_stamps`, `profiles.points_total`) come in Phase 6b.1.

## 8. Seed data (decision T16)
Launch content ships as a migration, so DEV and PROD get it through the normal pipeline:
- Source: `scripts/seed/data.ts` (typed, reviewed in PRs). `pnpm db:seed` generates
  `supabase/migrations/0007_seed_curated_data.sql`; `scripts/seed/seed.test.ts` fails if the file is stale.
- Contents: all 64 districts (division, Banglish/old-name aliases such as `bogra`, `chittagong`, `ctg`,
  `comilla`, `barisal`, `jessore`), the curated "famous for" list (RegionalFame), the foods behind it with
  aliases, and a few well-known places. **No ratings, reviews, prices, hours, addresses or claims are invented** —
  people add those. A change after the migration is applied needs a new migration.
- Search fields (`search_text`, `search_key`) come from `lib/text/normalize` (`buildSearchFields`), the same code
  the app uses; food/district aliases are separate rows (`aliases`) or part of the district key.
- **Removing it later:** everything except districts carries `is_seed = true` (users can never set it — trigger
  `protect_seed_flag`). In the Supabase SQL editor:
  ```sql
  select purge_seed_data();        -- removes unused seed rows; keeps seed places/dishes real users already rated or saved
  select purge_seed_data(false);   -- removes ALL flagged rows, including experiences on them
  ```
  It returns how many rows of each kind were removed, refreshes `districts.place_count` and leaves districts alone.

## Brands (migration 0069)
`brands (id, slug, name_bn, name_en)` and `places.brand_id`. A chain's branches are separate places with
their own dishes, reactions and claims; the brand only groups them so a place page can list its
sibling branches (`PlaceRepository.branches`). Reactions are never summed across branches.
