-- 0064: Dhaka content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.

insert into areas (district_id, slug, name_bn, name_en)
select d.id, v.slug, v.name_bn, v.name_en
from (values
  ('badda', 'বাড্ডা', 'Badda'),
  ('merul-badda', 'মেরুল বাড্ডা', 'Merul Badda'),
  ('rampura', 'রামপুরা', 'Rampura'),
  ('aftabnagar', 'আফতাবনগর', 'Aftabnagar'),
  ('malibagh', 'মালিবাগ', 'Malibagh'),
  ('mouchak', 'মৌচাক', 'Mouchak'),
  ('khilgaon', 'খিলগাঁও', 'Khilgaon'),
  ('taltola', 'তালতলা', 'Taltola'),
  ('sipahibagh', 'সিপাহীবাগ', 'Sipahibagh'),
  ('goran', 'গোড়ান', 'Goran'),
  ('basabo', 'বাসাবো', 'Basabo'),
  ('mugda', 'মুগদা', 'Mugda'),
  ('maniknagar', 'মানিকনগর', 'Maniknagar'),
  ('sabujbagh', 'সবুজবাগ', 'Sabujbagh'),
  ('jatrabari', 'যাত্রাবাড়ী', 'Jatrabari'),
  ('demra', 'ডেমরা', 'Demra'),
  ('shyampur', 'শ্যামপুর', 'Shyampur'),
  ('kadamtali', 'কদমতলী', 'Kadamtali'),
  ('postogola', 'পোস্তগোলা', 'Postogola'),
  ('dholaikhal', 'ধোলাইখাল', 'Dholaikhal'),
  ('sutrapur', 'সূত্রাপুর', 'Sutrapur'),
  ('tikatuli', 'টিকাটুলি', 'Tikatuli'),
  ('kamalapur', 'কমলাপুর', 'Kamalapur'),
  ('segunbagicha', 'সেগুনবাগিচা', 'Segunbagicha'),
  ('paltan', 'পল্টন', 'Paltan'),
  ('kakrail', 'কাকরাইল', 'Kakrail'),
  ('moghbazar', 'মগবাজার', 'Moghbazar'),
  ('tejgaon', 'তেজগাঁও', 'Tejgaon'),
  ('mohakhali', 'মহাখালী', 'Mohakhali'),
  ('baridhara', 'বারিধারা', 'Baridhara'),
  ('niketan', 'নিকেতন', 'Niketan'),
  ('kuril', 'কুড়িল', 'Kuril'),
  ('khilkhet', 'খিলক্ষেত', 'Khilkhet'),
  ('nikunja', 'নিকুঞ্জ', 'Nikunja'),
  ('pallabi', 'পল্লবী', 'Pallabi'),
  ('kafrul', 'কাফরুল', 'Kafrul'),
  ('shewrapara', 'শেওড়াপাড়া', 'Shewrapara'),
  ('kazipara', 'কাজীপাড়া', 'Kazipara'),
  ('agargaon', 'আগারগাঁও', 'Agargaon'),
  ('shyamoli', 'শ্যামলী', 'Shyamoli'),
  ('kallyanpur', 'কল্যাণপুর', 'Kallyanpur'),
  ('adabor', 'আদাবর', 'Adabor'),
  ('rayerbazar', 'রায়েরবাজার', 'Rayerbazar'),
  ('azimpur', 'আজিমপুর', 'Azimpur'),
  ('elephant-road', 'এলিফ্যান্ট রোড', 'Elephant Road'),
  ('science-lab', 'সায়েন্স ল্যাব', 'Science Lab'),
  ('panthapath', 'পান্থপথ', 'Panthapath'),
  ('green-road', 'গ্রিন রোড', 'Green Road'),
  ('savar', 'সাভার', 'Savar'),
  ('ashulia', 'আশুলিয়া', 'Ashulia'),
  ('dhamrai', 'ধামরাই', 'Dhamrai'),
  ('keraniganj', 'কেরানীগঞ্জ', 'Keraniganj'),
  ('nawabganj', 'নবাবগঞ্জ', 'Nawabganj'),
  ('dohar', 'দোহার', 'Dohar')
) as v(slug, name_bn, name_en)
join districts d on d.slug = 'dhaka'
on conflict (district_id, slug) do nothing;

insert into foods (slug, name_bn, name_en, about_bn, search_text, search_key, is_seed) values
  ('coffee', 'কফি', 'Coffee', 'গরম বা ঠান্ডা কফি। ঢাকার বিভিন্ন পাড়ায় কফি শপে পাওয়া যায়।', 'কফি coffee', 'kafi cafi', true)
on conflict (slug) do nothing;

insert into aliases (entity, entity_id, alias, search_key)
select 'food', f.id::text, v.alias, v.search_key
from (values
  ('coffee', 'cold coffee', 'cald cafi'),
  ('coffee', 'coffee', 'cafi'),
  ('coffee', 'কোল্ড কফি', 'kald kafi')
) as v(food_slug, alias, search_key)
join foods f on f.slug = v.food_slug
on conflict do nothing;

insert into places (slug, name_bn, name_en, type, district_id, area_id, search_text, search_key, is_seed)
select v.slug, v.name_bn, v.name_en, v.type::place_type, d.id, a.id, v.search_text, v.search_key, true
from (values
  ('pithaghar-khilgaon', 'পিঠাঘর', 'Pithaghar', 'shop', 'khilgaon', 'পিঠাঘর pithaghar', 'pitagar'),
  ('kachchi-bhai-khilgaon', 'কাচ্চি ভাই', 'Kachchi Bhai', 'restaurant', 'khilgaon', 'কাচ্চি ভাই kachchi bhai', 'kaci bai'),
  ('delhi-darbar-khilgaon', 'দিল্লি দরবার', 'Delhi Darbar', 'restaurant', 'khilgaon', 'দিল্লি দরবার delhi darbar', 'dili darabar deli darbar'),
  ('yangtze-kabab-khilgaon', 'ইয়াংসি কাবাব', 'Yangtze Kabab', 'restaurant', 'khilgaon', 'ইয়াংসি কাবাব yangtze kabab', 'iangsi kabab iangtje kabab'),
  ('shahin-spicy-kabab-khilgaon', 'শাহিন স্পাইসি কাবাব', 'Shahin Spicy Kabab', 'restaurant', 'khilgaon', 'শাহিন স্পাইসি কাবাব shahin spicy kabab', 'sahin spaisi kabab sahin spici kabab'),
  ('apon-coffee-shop-taltola', 'আপন কফি শপ', 'Apon Coffee Shop', 'shop', 'taltola', 'আপন কফি শপ apon coffee shop', 'apan kafi sap apan cafi sap'),
  ('tangail-chom-chom-ghor-taltola', 'টাঙ্গাইল চমচম ঘর অ্যান্ড বেকারি', 'Tangail Chom Chom Ghor and Bakery', 'bakery', 'taltola', 'টাঙ্গাইল চমচম ঘর অ্যান্ড বেকারি tangail chom chom ghor and bakery', 'tangail camacam gar aiand bekari tangail cam cam gar and bakeri'),
  ('larang-restaurant-malibagh', 'লারং রেস্টুরেন্ট', 'Larang Restaurant', 'restaurant', 'malibagh', 'লারং রেস্টুরেন্ট larang restaurant', 'larang resturent larang restaurant'),
  ('jumghor-merul-badda', 'জুমঘর', 'Jumghor', 'restaurant', 'merul-badda', 'জুমঘর jumghor', 'jumagar jumgar'),
  ('roaja-restaurant-uttara', 'রোয়াজা', 'Roaja', 'restaurant', 'uttara', 'রোয়াজা roaja', 'raiaja raja'),
  ('jaba-restaurant-farmgate', 'জাবা', 'Jaba', 'restaurant', 'farmgate', 'জাবা jaba', 'jaba')
) as v(slug, name_bn, name_en, type, area_slug, search_text, search_key)
join districts d on d.slug = 'dhaka'
join areas a on a.district_id = d.id and a.slug = v.area_slug
on conflict (slug) do nothing;



insert into dishes (place_id, food_id, is_seed)
select p.id, f.id, true
from (values
  ('pithaghar-khilgaon', 'puli-pitha'),
  ('pithaghar-khilgaon', 'patishapta'),
  ('kachchi-bhai-khilgaon', 'kacchi'),
  ('delhi-darbar-khilgaon', 'kacchi'),
  ('delhi-darbar-khilgaon', 'tehari'),
  ('delhi-darbar-khilgaon', 'khichuri'),
  ('yangtze-kabab-khilgaon', 'kabab'),
  ('shahin-spicy-kabab-khilgaon', 'kabab'),
  ('apon-coffee-shop-taltola', 'coffee'),
  ('tangail-chom-chom-ghor-taltola', 'chomchom'),
  ('larang-restaurant-malibagh', 'pahari-khabar'),
  ('jumghor-merul-badda', 'pahari-khabar'),
  ('roaja-restaurant-uttara', 'pahari-khabar'),
  ('jaba-restaurant-farmgate', 'pahari-khabar')
) as v(place_slug, food_slug)
join places p on p.slug = v.place_slug
join foods f on f.slug = v.food_slug
on conflict (place_id, food_id) do nothing;





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
