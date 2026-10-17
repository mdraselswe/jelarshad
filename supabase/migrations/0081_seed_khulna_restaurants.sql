-- 0081: Khulna content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.

insert into areas (district_id, slug, name_bn, name_en)
select d.id, v.slug, v.name_bn, v.name_en
from (values
  ('sonadanga', 'সোনাডাঙ্গা', 'Sonadanga')
) as v(slug, name_bn, name_en)
join districts d on d.slug = 'khulna'
on conflict (district_id, slug) do nothing;





insert into places (slug, name_bn, name_en, type, district_id, area_id, search_text, search_key, is_seed)
select v.slug, v.name_bn, v.name_en, v.type::place_type, d.id, a.id, v.search_text, v.search_key, true
from (values
  ('pizzaburg-khulna', 'পিজ্জাবার্গ খুলনা', 'PizzaBurg Khulna', 'restaurant', 'khulna-city', 'পিজ্জাবার্গ খুলনা pizzaburg khulna', 'pijabarg kulna pijaburg kulna'),
  ('deshi-kitchen-sonadanga', 'দেশি কিচেন সোনাডাঙ্গা', 'Deshi Kitchen Sonadanga', 'restaurant', 'sonadanga', 'দেশি কিচেন সোনাডাঙ্গা deshi kitchen sonadanga', 'desi kicen sanadanga desi kitcen sanadanga'),
  ('rajmahal-food-court-khulna', 'রাজমহল ফুড কোর্ট খুলনা', 'Rajmahal Food Court Khulna', 'restaurant', 'khulna-city', 'রাজমহল ফুড কোর্ট খুলনা rajmahal food court khulna', 'rajamahal fud kart kulna rajmahal fud caurt kulna'),
  ('new-kaifeng-chinese-khulna', 'নিউ কাইফেং চাইনিজ রেস্টুরেন্ট খুলনা', 'New Kaifeng Chinese Restaurant Khulna', 'restaurant', 'khulna-city', 'নিউ কাইফেং চাইনিজ রেস্টুরেন্ট খুলনা new kaifeng chinese restaurant khulna', 'niu kaifeng cainij resturent kulna neb kaifeng cinese restaurant kulna'),
  ('sultans-dine-khulna', 'সুলতানস ডাইন খুলনা', 'Sultan''s Dine Khulna', 'restaurant', 'khulna-city', 'সুলতানস ডাইন খুলনা sultan''s dine khulna', 'sultanas dain kulna sultan s dine kulna'),
  ('kfc-khulna', 'কেএফসি খুলনা', 'KFC Khulna', 'restaurant', 'khulna-city', 'কেএফসি খুলনা kfc khulna', 'kifsi kulna kfc kulna'),
  ('haji-kacchi-ghor-khulna', 'হাজী কাচ্চি ঘর বয়রা খুলনা', 'Haji Kacchi Ghor Boyra Khulna', 'restaurant', 'khulna-city', 'হাজী কাচ্চি ঘর বয়রা খুলনা haji kacchi ghor boyra khulna', 'haji kaci gar baiara kulna haji kaci gar baira kulna'),
  ('new-swad-biriany-house-khulna', 'নিউ স্বাদ বিরিয়ানি হাউস খুলনা', 'New Swad Biriany House Khulna', 'restaurant', 'khulna-city', 'নিউ স্বাদ বিরিয়ানি হাউস খুলনা new swad biriany house khulna', 'niu sbad biriani haus kulna neb sbad biriani hause kulna'),
  ('new-azmiri-kacchi-kitchen-khulna', 'নিউ আযমিরী কাচ্চি কিচেন খুলনা', 'New Azmiri Kacchi Kitchen Khulna', 'restaurant', 'khulna-city', 'নিউ আযমিরী কাচ্চি কিচেন খুলনা new azmiri kacchi kitchen khulna', 'niu ajmiri kaci kicen kulna neb ajmiri kaci kitcen kulna'),
  ('pizzaology-khulna', 'পিজাওলজি খুলনা', 'Pizzaology Khulna', 'restaurant', 'khulna-city', 'পিজাওলজি খুলনা pizzaology khulna', 'pijalji kulna pijalagi kulna'),
  ('road-home-chinese-khulna', 'রোড হোম চাইনিজ খুলনা', 'Road Home Chinese & Restaurant Khulna', 'restaurant', 'khulna-city', 'রোড হোম চাইনিজ খুলনা road home chinese & restaurant khulna', 'rad ham cainij kulna rad hame cinese restaurant kulna')
) as v(slug, name_bn, name_en, type, area_slug, search_text, search_key)
join districts d on d.slug = 'khulna'
join areas a on a.district_id = d.id and a.slug = v.area_slug
on conflict (slug) do nothing;



insert into dishes (place_id, food_id, is_seed)
select p.id, f.id, true
from (values
  ('pizzaburg-khulna', 'pizza'),
  ('pizzaburg-khulna', 'burger'),
  ('deshi-kitchen-sonadanga', 'bangladeshi-meal'),
  ('rajmahal-food-court-khulna', 'fast-food'),
  ('new-kaifeng-chinese-khulna', 'chinese'),
  ('sultans-dine-khulna', 'biryani'),
  ('sultans-dine-khulna', 'kacchi'),
  ('kfc-khulna', 'chicken-fry'),
  ('kfc-khulna', 'fast-food'),
  ('haji-kacchi-ghor-khulna', 'kacchi'),
  ('new-swad-biriany-house-khulna', 'biryani'),
  ('new-azmiri-kacchi-kitchen-khulna', 'kacchi'),
  ('pizzaology-khulna', 'pizza'),
  ('road-home-chinese-khulna', 'chinese')
) as v(place_slug, food_slug)
join places p on p.slug = v.place_slug
join foods f on f.slug = v.food_slug
on conflict (place_id, food_id) do nothing;





update districts d
set place_count = (select count(*) from places p where p.district_id = d.id and p.status = 'active');
