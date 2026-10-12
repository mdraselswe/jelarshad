-- Resets the production database to "only the project's own (seed) data" (decision T19).
--
-- Run by the owner in Supabase -> SQL Editor on the PROD project, once, before launch.
-- It removes everything people contributed while testing, and keeps:
--   * all seed data (rows flagged is_seed: foods, places, dishes, famous-for lists), districts and areas
--   * the people's accounts (profiles); their points go back to 0
--
-- What it deletes (counts seen on 2026-10-13: 2 foods, 2 places, 2 dishes, 3 experiences, 6 claims,
-- 2 saved items, 2 stamps, 1 photo record, 9 point events):
--   claim votes, claims, reports, edit suggestions, saved items, photo records, experiences,
--   district stamps, point events, rate-limit events, search misses,
--   foods / places / dishes / famous-for rows that are not seed rows, their aliases, and areas that
--   only they used.
-- Photos already uploaded stay in the Cloudinary account (delete the folder there by hand if wanted).

begin;

delete from claim_votes;
delete from claims;
delete from reports;
delete from edit_suggestions;
delete from saved_items;
delete from media;
delete from experiences;
delete from district_stamps;
delete from point_events;
delete from rate_limit_events;
delete from search_misses;

delete from regional_fame where not is_seed;
delete from dishes where not is_seed;
delete from places where not is_seed;
delete from foods where not is_seed;
delete from aliases a
  where a.entity = 'food' and not exists (select 1 from foods f where f.id::text = a.entity_id);
-- Areas people created while adding a place (seed areas always have an English name).
delete from areas a
  where a.name_en is null and not exists (select 1 from places p where p.area_id = a.id);

-- Counters back to a clean start.
update dishes set loved_count = 0, okay_count = 0, disliked_count = 0, wilson_score = 0,
  last_experience_at = null, price_confirmed_at = null, price_min = null, price_max = null;
update places set price_min = null, price_max = null;
update foods set experience_count = 0, loved_count = 0;
update profiles set points_total = 0;
update districts d set place_count =
  (select count(*) from places p where p.district_id = d.id and p.status = 'active');

commit;

-- Check: foods 75, places 166, dishes 228 (the seed), everything people made is 0.
select
  (select count(*) from foods) as foods,
  (select count(*) from places) as places,
  (select count(*) from dishes) as dishes,
  (select count(*) from experiences) as experiences,
  (select count(*) from claims) as claims,
  (select count(*) from point_events) as point_events,
  (select count(*) from profiles) as profiles;
