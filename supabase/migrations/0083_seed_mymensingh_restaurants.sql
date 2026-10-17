-- 0083: Mymensingh content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.







insert into places (slug, name_bn, name_en, type, district_id, area_id, search_text, search_key, is_seed)
select v.slug, v.name_bn, v.name_en, v.type::place_type, d.id, a.id, v.search_text, v.search_key, true
from (values
  ('pizzaburg-mymensingh', 'পিজ্জাবার্গ ময়মনসিংহ', 'PizzaBurg Mymensingh', 'restaurant', 'mymensingh-city', 'পিজ্জাবার্গ ময়মনসিংহ pizzaburg mymensingh', 'pijabarg maiamanasing pijaburg mimensing'),
  ('amigos-mymensingh', 'অ্যামিগোস রেস্টুরেন্ট ময়মনসিংহ', 'Amigos Restaurant Mymensingh', 'restaurant', 'mymensingh-city', 'অ্যামিগোস রেস্টুরেন্ট ময়মনসিংহ amigos restaurant mymensingh', 'aiamigas resturent maiamanasing amigas restaurant mimensing'),
  ('chillox-mymensingh', 'চিলক্স ময়মনসিংহ', 'Chillox Mymensingh', 'restaurant', 'mymensingh-city', 'চিলক্স ময়মনসিংহ chillox mymensingh', 'cilaks maiamanasing cilaks mimensing'),
  ('kacchi-moshai-mymensingh', 'কাচ্চি মশাই ময়মনসিংহ', 'Kacchi Moshai Mymensingh', 'restaurant', 'mymensingh-city', 'কাচ্চি মশাই ময়মনসিংহ kacchi moshai mymensingh', 'kaci masai maiamanasing kaci masai mimensing'),
  ('avanti-restaurant-mymensingh', 'অ্যাভান্তি রেস্টুরেন্ট ময়মনসিংহ', 'Avanti Restaurant Mymensingh', 'restaurant', 'mymensingh-city', 'অ্যাভান্তি রেস্টুরেন্ট ময়মনসিংহ avanti restaurant mymensingh', 'aiabanti resturent maiamanasing abanti restaurant mimensing')
) as v(slug, name_bn, name_en, type, area_slug, search_text, search_key)
join districts d on d.slug = 'mymensingh'
join areas a on a.district_id = d.id and a.slug = v.area_slug
on conflict (slug) do nothing;



insert into dishes (place_id, food_id, is_seed)
select p.id, f.id, true
from (values
  ('pizzaburg-mymensingh', 'pizza'),
  ('pizzaburg-mymensingh', 'burger'),
  ('amigos-mymensingh', 'chinese'),
  ('chillox-mymensingh', 'burger'),
  ('chillox-mymensingh', 'fast-food'),
  ('kacchi-moshai-mymensingh', 'kacchi'),
  ('avanti-restaurant-mymensingh', 'chinese')
) as v(place_slug, food_slug)
join places p on p.slug = v.place_slug
join foods f on f.slug = v.food_slug
on conflict (place_id, food_id) do nothing;





update districts d
set place_count = (select count(*) from places p where p.district_id = d.id and p.status = 'active');
