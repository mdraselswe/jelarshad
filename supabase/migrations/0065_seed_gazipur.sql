-- 0065: Gazipur content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.

insert into areas (district_id, slug, name_bn, name_en)
select d.id, v.slug, v.name_bn, v.name_en
from (values
  ('joydebpur', 'জয়দেবপুর', 'Joydebpur'),
  ('tongi', 'টঙ্গী', 'Tongi'),
  ('chandana-chowrasta', 'চন্দনা চৌরাস্তা', 'Chandana Chowrasta'),
  ('board-bazar', 'বোর্ড বাজার', 'Board Bazar'),
  ('konabari', 'কোনাবাড়ী', 'Konabari'),
  ('mawna', 'মাওনা', 'Mawna'),
  ('kaliakair', 'কালিয়াকৈর', 'Kaliakair'),
  ('kaliganj', 'কালীগঞ্জ', 'Kaliganj'),
  ('kapasia', 'কাপাসিয়া', 'Kapasia'),
  ('sreepur', 'শ্রীপুর', 'Sreepur')
) as v(slug, name_bn, name_en)
join districts d on d.slug = 'gazipur'
on conflict (district_id, slug) do nothing;

insert into foods (slug, name_bn, name_en, about_bn, search_text, search_key, is_seed) values
  ('shahi-nashta', 'শাহী নাশতা', 'Shahi Nashta', 'পরোটার সঙ্গে সেমাই, হালুয়া, কোরমা ও মাংস দিয়ে সাজানো ভারী নাশতা।', 'শাহী নাশতা shahi nashta', 'sahi nasta', true),
  ('nakshi-pitha', 'নকশি পিঠা', 'Nakshi Pitha', 'চালের গুঁড়ার তৈরি নকশা-করা পিঠা। শীতে গ্রামাঞ্চলে বেশি তৈরি হয়।', 'নকশি পিঠা nakshi pitha', 'nakasi pita naksi pita', true)
on conflict (slug) do nothing;

insert into aliases (entity, entity_id, alias, search_key)
select 'food', f.id::text, v.alias, v.search_key
from (values
  ('shahi-nashta', 'shahi nasta', 'sahi nasta'),
  ('shahi-nashta', 'shahi nashta', 'sahi nasta'),
  ('shahi-nashta', 'শাহি নাস্তা', 'sahi nasta'),
  ('nakshi-pitha', 'nokshi pitha', 'naksi pita'),
  ('nakshi-pitha', 'naksi pitha', 'naksi pita'),
  ('nakshi-pitha', 'নকসি পিঠা', 'nakasi pita')
) as v(food_slug, alias, search_key)
join foods f on f.slug = v.food_slug
on conflict do nothing;







insert into regional_fame (district_id, food_id, note_bn, source_url, sort_order, is_seed)
select d.id, f.id, v.note_bn, v.source_url, v.sort_order, true
from (values
  ('gazipur', 'shahi-nashta', 'গাজীপুরের শাহী নাশতা', 'https://tourbd.info/gazipur-jelar-bikkhato-khabar/', 200),
  ('gazipur', 'nakshi-pitha', 'গাজীপুরের নকশি পিঠা', 'https://tourbd.info/gazipur-jelar-bikkhato-khabar/', 201),
  ('gazipur', 'shutki', 'গাজীপুরের চ্যাপা শুঁটকি', 'https://tourbd.info/gazipur-jelar-bikkhato-khabar/', 202),
  ('gazipur', 'kalo-jam', 'কালীগঞ্জের কালোজাম', 'https://tourbd.info/gazipur-jelar-bikkhato-khabar/', 203)
) as v(district_slug, food_slug, note_bn, source_url, sort_order)
join districts d on d.slug = v.district_slug
join foods f on f.slug = v.food_slug
on conflict (district_id, food_id) do nothing;



update districts d
set place_count = (select count(*) from places p where p.district_id = d.id and p.status = 'active');

-- Foods with exactly the same name become one (seed food first, then the one with a description).
do $$
declare
  r record;
begin
  for r in
    select dup.id as dup_id, dup.keep_id
    from (
      select id,
             first_value(id) over (
               partition by lower(btrim(name_bn))
               order by is_seed desc, (about_bn is not null) desc, created_at, id
             ) as keep_id
      from foods
      where status = 'active'
    ) as dup
    where dup.id <> dup.keep_id
  loop
    perform merge_foods(r.dup_id, r.keep_id);
  end loop;
end;
$$;
