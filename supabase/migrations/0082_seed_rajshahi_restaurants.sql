-- 0082: Rajshahi content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.

insert into areas (district_id, slug, name_bn, name_en)
select d.id, v.slug, v.name_bn, v.name_en
from (values
  ('rajshahi-city', 'রাজশাহী শহর', 'Rajshahi city')
) as v(slug, name_bn, name_en)
join districts d on d.slug = 'rajshahi'
on conflict (district_id, slug) do nothing;





insert into places (slug, name_bn, name_en, type, district_id, area_id, search_text, search_key, is_seed)
select v.slug, v.name_bn, v.name_en, v.type::place_type, d.id, a.id, v.search_text, v.search_key, true
from (values
  ('pizzaburg-rajshahi', 'পিজ্জাবার্গ রাজশাহী', 'PizzaBurg Rajshahi', 'restaurant', 'rajshahi-city', 'পিজ্জাবার্গ রাজশাহী pizzaburg rajshahi', 'pijabarg rajsahi pijaburg rajsahi'),
  ('aziz-canteen-rajshahi', 'আজিজ ক্যান্টিন রাজশাহী', 'Aziz Canteen Rajshahi', 'restaurant', 'rajshahi-city', 'আজিজ ক্যান্টিন রাজশাহী aziz canteen rajshahi', 'ajij kiantin rajsahi ajij cantin rajsahi'),
  ('kacchi-bhai-rajshahi', 'কাচ্চি ভাই রাজশাহী', 'Kacchi Bhai Rajshahi', 'restaurant', 'rajshahi-city', 'কাচ্চি ভাই রাজশাহী kacchi bhai rajshahi', 'kaci bai rajsahi'),
  ('amana-funville-rajshahi', 'আমানা ফুডভিলা রাজশাহী', 'Amana Funville Rajshahi', 'restaurant', 'saheb-bazar', 'আমানা ফুডভিলা রাজশাহী amana funville rajshahi', 'amana fudbila rajsahi amana funbile rajsahi'),
  ('yatai-rajshahi', 'ইয়াতাই রাজশাহী', 'Yatai Rajshahi', 'restaurant', 'rajshahi-city', 'ইয়াতাই রাজশাহী yatai rajshahi', 'iatai rajsahi'),
  ('master-chef-chinese-rajshahi', 'মাস্টার শেফ চাইনিজ রাজশাহী', 'Master Chef Chinese Rajshahi', 'restaurant', 'rajshahi-city', 'মাস্টার শেফ চাইনিজ রাজশাহী master chef chinese rajshahi', 'mastar sef cainij rajsahi master cef cinese rajsahi'),
  ('chilis-thai-and-chinese-rajshahi', 'চিলিস থাই অ্যান্ড চাইনিজ রাজশাহী', 'Chili''s Thai & Chinese Rajshahi', 'restaurant', 'rajshahi-city', 'চিলিস থাই অ্যান্ড চাইনিজ রাজশাহী chili''s thai & chinese rajshahi', 'cilis tai aiand cainij rajsahi cili s tai cinese rajsahi'),
  ('labongo-chinese-rajshahi', 'লাবঙ্গ চাইনিজ অ্যান্ড ফাস্ট ফুড রাজশাহী', 'Labongo Chinese & Fast Food Rajshahi', 'restaurant', 'rajshahi-city', 'লাবঙ্গ চাইনিজ অ্যান্ড ফাস্ট ফুড রাজশাহী labongo chinese & fast food rajshahi', 'labang cainij aiand fast fud rajsahi labanga cinese fast fud rajsahi'),
  ('nanking-chinese-rajshahi', 'নানকিং চাইনিজ রেস্টুরেন্ট রাজশাহী', 'Nanking Chinese Restaurant Rajshahi', 'restaurant', 'rajshahi-city', 'নানকিং চাইনিজ রেস্টুরেন্ট রাজশাহী nanking chinese restaurant rajshahi', 'nanking cainij resturent rajsahi nanking cinese restaurant rajsahi'),
  ('aurora-pizza-lounge-rajshahi', 'অরোরা পিজ্জা লাউঞ্জ রাজশাহী', 'Aurora Pizza Lounge Rajshahi', 'restaurant', 'rajshahi-city', 'অরোরা পিজ্জা লাউঞ্জ রাজশাহী aurora pizza lounge rajshahi', 'arara pija launj rajsahi aurara pija launge rajsahi'),
  ('rizik-fish-bbq-rajshahi', 'রিযিক ফিশ বিবিকিউ রাজশাহী', 'RIZIK Fish BBQ Rajshahi', 'restaurant', 'rajshahi-city', 'রিযিক ফিশ বিবিকিউ রাজশাহী rizik fish bbq rajshahi', 'rijik fis bibikiu rajsahi rijik fis bk rajsahi'),
  ('hideout-cafe-rajshahi', 'দ্য হাইডআউট ক্যাফে রাজশাহী', 'The Hideout Cafe Rajshahi', 'restaurant', 'rajshahi-city', 'দ্য হাইডআউট ক্যাফে রাজশাহী the hideout cafe rajshahi', 'di haidaut kiafe rajsahi te hideaut cafe rajsahi'),
  ('kabab-house-rajshahi', 'কাবাব হাউস মাল্টি কুইজিন রাজশাহী', 'Kabab House Multi Cuisine Rajshahi', 'restaurant', 'rajshahi-city', 'কাবাব হাউস মাল্টি কুইজিন রাজশাহী kabab house multi cuisine rajshahi', 'kabab haus malti kuijin rajsahi kabab hause multi cuisine rajsahi'),
  ('food-lovers-and-kacchi-vai-rajshahi', 'ফুড লাভার্স অ্যান্ড কাচ্চি ভাই রাজশাহী', 'Food Lovers & Kacchi Vai Rajshahi', 'restaurant', 'rajshahi-city', 'ফুড লাভার্স অ্যান্ড কাচ্চি ভাই রাজশাহী food lovers & kacchi vai rajshahi', 'fud labars aiand kaci bai rajsahi fud labers kaci bai rajsahi')
) as v(slug, name_bn, name_en, type, area_slug, search_text, search_key)
join districts d on d.slug = 'rajshahi'
join areas a on a.district_id = d.id and a.slug = v.area_slug
on conflict (slug) do nothing;



insert into dishes (place_id, food_id, is_seed)
select p.id, f.id, true
from (values
  ('pizzaburg-rajshahi', 'pizza'),
  ('pizzaburg-rajshahi', 'burger'),
  ('aziz-canteen-rajshahi', 'bangladeshi-meal'),
  ('kacchi-bhai-rajshahi', 'kacchi'),
  ('amana-funville-rajshahi', 'chinese'),
  ('yatai-rajshahi', 'japanese-food'),
  ('master-chef-chinese-rajshahi', 'chinese'),
  ('chilis-thai-and-chinese-rajshahi', 'chinese'),
  ('chilis-thai-and-chinese-rajshahi', 'thai-food'),
  ('labongo-chinese-rajshahi', 'chinese'),
  ('labongo-chinese-rajshahi', 'fast-food'),
  ('nanking-chinese-rajshahi', 'chinese'),
  ('aurora-pizza-lounge-rajshahi', 'pizza'),
  ('rizik-fish-bbq-rajshahi', 'fish-bbq'),
  ('hideout-cafe-rajshahi', 'cafe-snacks'),
  ('kabab-house-rajshahi', 'kabab'),
  ('food-lovers-and-kacchi-vai-rajshahi', 'kacchi')
) as v(place_slug, food_slug)
join places p on p.slug = v.place_slug
join foods f on f.slug = v.food_slug
on conflict (place_id, food_id) do nothing;





update districts d
set place_count = (select count(*) from places p where p.district_id = d.id and p.status = 'active');
