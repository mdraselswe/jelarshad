-- Database behaviour: RLS, privileges and SQL functions (docs/04-database.md §5, §7).
-- Runs in CI against the DEV project after migrations: `supabase test db --linked`.
-- Everything happens inside one transaction that is rolled back, so DEV data is never changed.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(73);

-- Fixtures (as the migration owner, RLS bypassed) -------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-0000000000a1', 'rls-a@test.invalid'),
  ('00000000-0000-4000-8000-0000000000b2', 'rls-b@test.invalid');
-- (migration 0009 already made profiles for them; replace with the fixture ones)
delete from profiles where id in ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000b2');
insert into districts (id, slug, name_bn, name_en, division_bn, division_en, search_key)
  values (900, 'rls-test-district', 'টেস্ট জেলা', 'Test District', 'টেস্ট', 'Test', 'test');
insert into profiles (id, display_name, home_district_id) values
  ('00000000-0000-4000-8000-0000000000a1', 'A', 900),
  ('00000000-0000-4000-8000-0000000000b2', 'B', 900);
insert into foods (id, slug, name_bn, status, search_text, search_key) values
  ('00000000-0000-4000-8000-00000000f001', 'rls-test-doi', 'টেস্ট দই', 'active', 'টেস্ট দই', 'test dai'),
  ('00000000-0000-4000-8000-00000000f002', 'rls-test-hidden', 'লুকানো', 'hidden', '', '');
insert into places (id, slug, name_bn, district_id) values
  ('00000000-0000-4000-8000-00000000c001', 'rls-test-place', 'টেস্ট দোকান', 900);
insert into dishes (id, place_id, food_id) values
  ('00000000-0000-4000-8000-00000000d001', '00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000f001');

-- Functions ---------------------------------------------------------------------------------
select ok(abs(wilson_lower_bound(3, 3) - 0.4385) < 0.0001, 'wilson 3/3 matches lib/ranking/wilson.ts');
select ok(abs(wilson_lower_bound(950, 1000) - 0.9347) < 0.0001, 'wilson 950/1000 matches lib');
select is(wilson_lower_bound(0, 0), 0::double precision, 'wilson with no experiences is 0');
select ok(
  exists (select 1 from search_all('টেস্ট দই', 'test dai') where slug = 'rls-test-doi'),
  'search_all finds an active food'
);
select ok(
  not exists (select 1 from search_all('লুকানো', '') where slug = 'rls-test-hidden'),
  'search_all skips hidden foods'
);

-- Anonymous visitor -------------------------------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select is((select count(*)::int from foods where slug like 'rls-test-%'), 1, 'anon reads only active foods');
select is((select count(*)::int from places where slug = 'rls-test-place'), 1, 'anon reads active places');
select is((select count(*)::int from profiles), 0, 'anon cannot read profiles directly');
select ok((select count(*) from public_profiles) >= 2, 'anon reads names via public_profiles');
select throws_ok(
  $$ insert into foods (slug, name_bn) values ('rls-anon-food', 'x') $$,
  '42501', null, 'anon cannot add a food'
);
select is_empty(
  $$ update dishes set loved_count = 999 where id = '00000000-0000-4000-8000-00000000d001' returning id $$,
  'anon cannot change dish counters'
);
select throws_ok(
  $$ select refresh_dish_stats('00000000-0000-4000-8000-00000000d001') $$,
  '42501', null, 'anon cannot run refresh_dish_stats'
);

-- Signed-in user A ----------------------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);

select lives_ok(
  $$ insert into experiences (user_id, dish_id, reaction)
     values ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-00000000d001', 'loved') $$,
  'user adds their own experience'
);
select throws_ok(
  $$ insert into experiences (user_id, dish_id, reaction)
     values ('00000000-0000-4000-8000-0000000000b2', '00000000-0000-4000-8000-00000000d001', 'okay') $$,
  '42501', null, 'user cannot add an experience as someone else'
);
select throws_ok(
  $$ insert into experiences (user_id, dish_id, reaction)
     values ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-00000000d001', 'okay') $$,
  '23505', null, 'one experience per user per dish'
);
select throws_ok(
  $$ insert into dishes (place_id, food_id, loved_count)
     values ('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000f002', 50) $$,
  '42501', null, 'a new dish cannot start with counts'
);
select throws_ok(
  $$ insert into claims (entity, entity_id, type, value, created_by, status)
     values ('place', '00000000-0000-4000-8000-00000000c001', 'availability', '{}',
             '00000000-0000-4000-8000-0000000000a1', 'confirmed') $$,
  '42501', null, 'a new claim cannot start confirmed'
);
select lives_ok(
  $$ update profiles set display_name = 'নতুন নাম' where id = '00000000-0000-4000-8000-0000000000a1' $$,
  'user renames themselves'
);
select throws_ok(
  $$ update profiles set role = 'admin' where id = '00000000-0000-4000-8000-0000000000a1' $$,
  'P0001', null, 'user cannot make themselves admin'
);
select is_empty(
  $$ update profiles set display_name = 'hacked' where id = '00000000-0000-4000-8000-0000000000b2' returning id $$,
  'user cannot edit another profile'
);
select lives_ok(
  $$ insert into saved_items (user_id, entity, entity_id)
     values ('00000000-0000-4000-8000-0000000000a1', 'food', '00000000-0000-4000-8000-00000000f001') $$,
  'user saves a food'
);

-- User B sees none of A's private rows -----------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000b2","role":"authenticated"}', true);
select is((select count(*)::int from saved_items), 0, 'saved lists are private');

-- Direct database session (SQL editor, seed): no JWT, may manage privileges ------------------------
reset role;
select set_config('request.jwt.claims', '', true);
select lives_ok(
  $$ update profiles set is_banned = true where id = '00000000-0000-4000-8000-0000000000b2' $$,
  'a direct database session can ban a user'
);

-- Banned user ------------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000b2","role":"authenticated"}', true);
set local role authenticated;
select throws_ok(
  $$ insert into reports (entity, entity_id, reason, user_id)
     values ('food', 'x', 'spam', '00000000-0000-4000-8000-0000000000b2') $$,
  '42501', null, 'banned users cannot write'
);

-- Server (service role) maintains aggregates --------------------------------------------------
reset role;
set local role service_role;
select lives_ok(
  $$ select refresh_dish_stats('00000000-0000-4000-8000-00000000d001') $$,
  'service role refreshes dish stats'
);


-- Curated launch content (migrations 0006–0007) ------------------------------------------------
reset role;
select is((select count(*)::int from districts where id < 900), 64, 'all 64 districts are seeded');
select ok(
  exists (select 1 from foods where slug = 'doi' and is_seed)
  and exists (select 1 from places where slug = 'haji-biryani-dhaka' and is_seed),
  'launch content carries the is_seed flag'
);
select ok(
  exists (select 1 from search_all('kacchi', 'kaci') where slug = 'kacchi')
  and exists (select 1 from search_all('কাচি', 'kaci') where slug = 'kacchi')
  and exists (select 1 from search_all('doi', 'dai') where slug = 'doi')
  and exists (select 1 from search_all('bogra', 'bagra') where slug = 'bogura'),
  'search_all finds kacchi / কাচি / doi / bogra from the seed'
);

set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);
select throws_ok(
  $$ insert into foods (slug, name_bn, created_by, is_seed)
     values ('rls-user-seed-food', 'x', '00000000-0000-4000-8000-0000000000a1', true) $$,
  'P0001', null, 'users cannot flag their own rows as seed content'
);
select throws_ok(
  $$ select purge_seed_data() $$,
  '42501', null, 'users cannot run purge_seed_data'
);
reset role;

-- A real person rated one seed dish; purging must keep what they built on.
insert into experiences (user_id, dish_id, reaction)
select '00000000-0000-4000-8000-0000000000a1', d.id, 'loved'
from dishes d join places p on p.id = d.place_id
where p.slug = 'haji-biryani-dhaka';

set local role service_role;
select lives_ok($$ select purge_seed_data() $$, 'service role purges seed content');
select ok(
  not exists (select 1 from places where slug = 'fakruddin-biryani-dhaka')
  and not exists (select 1 from regional_fame where is_seed),
  'unused seed places and the famous-for list are gone'
);
select ok(
  exists (select 1 from places where slug = 'haji-biryani-dhaka')
  and exists (select 1 from foods where slug = 'kacchi'),
  'a seed place with a real experience, and its food, are kept'
);
select ok(
  exists (select 1 from places where slug = 'rls-test-place')
  and (select count(*)::int from districts where id < 900) = 64,
  'user-made rows and districts are never purged'
);
select lives_ok($$ select purge_seed_data(false) $$, 'purge_seed_data(false) removes everything flagged');
select ok(
  not exists (select 1 from foods where is_seed)
  and not exists (select 1 from places where is_seed)
  and not exists (select 1 from dishes where is_seed),
  'no seed rows remain'
);
select ok(
  not exists (select 1 from aliases a where a.entity = 'food' and not exists (select 1 from foods f where f.id::text = a.entity_id)),
  'aliases of removed foods are cleaned up'
);

-- Search misses (migration 0008) ----------------------------------------------------------
select lives_ok(
  $$ select record_search_miss('zzqq', 'zzqq') $$,
  'service role records a search miss'
);
select lives_ok(
  $$ select record_search_miss('zzqq', 'ZZQQ again') $$,
  'recording the same miss again counts it'
);
select is(
  (select count from search_misses where search_key = 'zzqq'),
  2,
  'repeated misses are counted, one row per key'
);
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok(
  $$ select record_search_miss('x', 'x') $$,
  '42501', null, 'visitors cannot write search misses'
);
select is_empty(
  $$ select 1 from search_misses $$,
  'visitors cannot read search misses'
);
reset role;

-- New users get a profile (migration 0009) ------------------------------------------------------
insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
values (
  'aaaaaaaa-0000-4000-8000-000000000009', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'new.person@example.com',
  '{"full_name":"নতুন মানুষ","picture":"https://example.com/p.jpg"}'::jsonb
);
select is(
  (select display_name from profiles where id = 'aaaaaaaa-0000-4000-8000-000000000009'),
  'নতুন মানুষ',
  'signing up creates a profile with the Google name'
);
select is(
  (select avatar_url from profiles where id = 'aaaaaaaa-0000-4000-8000-000000000009'),
  'https://example.com/p.jpg',
  'the Google picture becomes the avatar'
);
select is(
  (select role::text from profiles where id = 'aaaaaaaa-0000-4000-8000-000000000009'),
  'user',
  'a new profile is never an admin'
);
insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
values (
  'aaaaaaaa-0000-4000-8000-00000000000a', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'no.name@example.com', '{}'::jsonb
);
select is(
  (select display_name from profiles where id = 'aaaaaaaa-0000-4000-8000-00000000000a'),
  'no.name',
  'without a Google name the email prefix is used'
);

-- Points and stamps (migration 0011) ------------------------------------------------------------
select is(
  award_points('00000000-0000-4000-8000-0000000000a1', 'experience', 'experience', 'exp-1', 10),
  10, 'a first award returns its points'
);
select is(
  award_points('00000000-0000-4000-8000-0000000000a1', 'experience', 'experience', 'exp-1', 10),
  0, 'the same action is never paid twice'
);
select is(
  (select points_total from profiles where id = '00000000-0000-4000-8000-0000000000a1'),
  10, 'the total counts it once'
);
select is(revoke_points('experience', 'exp-1'), 10, 'revoking returns the points taken back');
select is(
  (select points_total from profiles where id = '00000000-0000-4000-8000-0000000000a1'),
  0, 'and the total drops'
);
select is(revoke_points('experience', 'exp-1'), 0, 'revoking twice takes nothing more');
select is(
  unlock_stamp('00000000-0000-4000-8000-0000000000a1', 900::smallint, 'visit', null),
  true, 'a first stamp for a district is new'
);
select is(
  unlock_stamp('00000000-0000-4000-8000-0000000000a1', 900::smallint, 'visit', null),
  false, 'the same stamp again is not new'
);

-- Merging places (migration 0012) -----------------------------------------------------------------
-- start from a clean survivor dish so the move below is the only change
delete from experiences where dish_id = '00000000-0000-4000-8000-00000000d001';
insert into places (id, slug, name_bn, district_id) values
  ('00000000-0000-4000-8000-00000000c002', 'rls-test-duplicate', 'টেস্ট দোকান (ডুপ্লিকেট)', 900);
insert into dishes (id, place_id, food_id) values
  ('00000000-0000-4000-8000-00000000d002', '00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000f001');
insert into experiences (id, dish_id, user_id, reaction) values
  ('00000000-0000-4000-8000-00000000e001', '00000000-0000-4000-8000-00000000d002', '00000000-0000-4000-8000-0000000000a1', 'loved');
select is(
  merge_places('00000000-0000-4000-8000-00000000c002', '00000000-0000-4000-8000-00000000c001'),
  1, 'merging reports how many dishes were handled'
);
select is(
  (select status::text from places where id = '00000000-0000-4000-8000-00000000c002'),
  'merged', 'the duplicate is kept with status merged'
);
select is(
  (select merged_into from places where id = '00000000-0000-4000-8000-00000000c002'),
  '00000000-0000-4000-8000-00000000c001'::uuid, 'and points at the survivor'
);
select is(
  (select dish_id from experiences where id = '00000000-0000-4000-8000-00000000e001'),
  '00000000-0000-4000-8000-00000000d001'::uuid, 'its experiences move to the survivor''s dish'
);
select is_empty(
  $$ select 1 from dishes where id = '00000000-0000-4000-8000-00000000d002' $$,
  'the duplicate dish is gone'
);
select throws_ok(
  $$ select merge_places('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000c001') $$,
  'P0001', null, 'a place cannot be merged into itself'
);
select throws_ok(
  $$ select merge_places('00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000c002') $$,
  'P0001', null, 'the survivor must be active'
);

-- Merging foods (migration 0060) ------------------------------------------------------------------
insert into foods (id, slug, name_bn) values
  ('00000000-0000-4000-8000-00000000f0a2', 'rls-test-food-duplicate', 'টেস্ট খাবার (ডুপ্লিকেট)');
insert into dishes (id, place_id, food_id) values
  ('00000000-0000-4000-8000-00000000d0a3', '00000000-0000-4000-8000-00000000c001', '00000000-0000-4000-8000-00000000f0a2');
select is(
  merge_foods('00000000-0000-4000-8000-00000000f0a2', '00000000-0000-4000-8000-00000000f001'),
  1, 'merging foods reports how many dishes were handled'
);
select is(
  (select status::text from foods where id = '00000000-0000-4000-8000-00000000f0a2'),
  'merged', 'the duplicate food is kept with status merged'
);
select is(
  (select merged_into from foods where id = '00000000-0000-4000-8000-00000000f0a2'),
  '00000000-0000-4000-8000-00000000f001'::uuid, 'and points at the survivor'
);
select is_empty(
  $$ select 1 from dishes where id = '00000000-0000-4000-8000-00000000d0a3' $$,
  'a dish both foods had at one place becomes one dish'
);
select throws_ok(
  $$ select merge_foods('00000000-0000-4000-8000-00000000f001', '00000000-0000-4000-8000-00000000f0a2') $$,
  'P0001', null, 'the surviving food must be active'
);

-- Weekly board (migration 0062) -------------------------------------------------------------------
select is(
  (select leaderboard_opt_in from profiles where id = '00000000-0000-4000-8000-0000000000a1'),
  false, 'nobody is on the board until they choose to be'
);
select award_points('00000000-0000-4000-8000-0000000000a1', 'experience', 'experience', 'board-1', 10);
select award_points('00000000-0000-4000-8000-0000000000a1', 'place_create', 'place', 'board-2', 20);
select is_empty(
  $$ select 1 from weekly_leaderboard(now() - interval '1 day', 5)
     where user_id = '00000000-0000-4000-8000-0000000000a1' $$,
  'someone who did not opt in is not listed'
);
update profiles set leaderboard_opt_in = true where id = '00000000-0000-4000-8000-0000000000a1';
select is(
  (select xp from weekly_leaderboard(now() - interval '1 day', 5)
    where user_id = '00000000-0000-4000-8000-0000000000a1'),
  30, 'an opted-in person is listed with the XP of the week'
);
select is(
  (select count(*)::int from weekly_leaderboard(now() + interval '1 day', 5)),
  0, 'actions before the start of the week do not count'
);

-- District board (migration 0063) ------------------------------------------------------------------
select award_points(
  '00000000-0000-4000-8000-0000000000a1', 'experience', 'experience', 'board-district-1', 10, 900::smallint
);
select is(
  (select xp from district_leaderboard(900::smallint, now() - interval '1 day', 5)
    where user_id = '00000000-0000-4000-8000-0000000000a1'),
  10, 'an action that remembers its district counts on that district board'
);
select is_empty(
  $$ select 1 from district_leaderboard(1::smallint, now() - interval '1 day', 5)
     where user_id = '00000000-0000-4000-8000-0000000000a1' $$,
  'and not on another district board'
);
select is(
  (select district_id from point_events where entity_id = 'board-1'),
  null, 'an action without a district is kept without one'
);

select * from finish();
rollback;
