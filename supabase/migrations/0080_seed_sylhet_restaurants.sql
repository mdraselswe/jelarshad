-- 0080: Sylhet content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.

insert into areas (district_id, slug, name_bn, name_en)
select d.id, v.slug, v.name_bn, v.name_en
from (values
  ('sylhet-city', 'সিলেট শহর', 'Sylhet city'),
  ('nayasarak', 'নয়াসড়ক', 'Nayasarak'),
  ('kumarpara', 'কুমারপাড়া', 'Kumarpara')
) as v(slug, name_bn, name_en)
join districts d on d.slug = 'sylhet'
on conflict (district_id, slug) do nothing;





insert into places (slug, name_bn, name_en, type, district_id, area_id, search_text, search_key, is_seed)
select v.slug, v.name_bn, v.name_en, v.type::place_type, d.id, a.id, v.search_text, v.search_key, true
from (values
  ('meatup-sylhet', 'মিটআপ সিলেট', 'MEATUP Sylhet', 'restaurant', 'sylhet-city', 'মিটআপ সিলেট meatup sylhet', 'mitap silet meatup silet'),
  ('bon-thai-sylhet', 'বন থাই সিলেট', 'BON Thai Sylhet', 'restaurant', 'sylhet-city', 'বন থাই সিলেট bon thai sylhet', 'ban tai silet'),
  ('seasons-meat-and-grill-sylhet', 'সিজনস মিট অ্যান্ড গ্রিল সিলেট', 'SEASONS Meat & Grill Sylhet', 'restaurant', 'sylhet-city', 'সিজনস মিট অ্যান্ড গ্রিল সিলেট seasons meat & grill sylhet', 'sijanas mit aiand gril silet seasans meat gril silet'),
  ('nawabs-kitchen-sylhet', 'নবাবস কিচেন সিলেট', 'Nawab''s Kitchen Sylhet', 'restaurant', 'nayasarak', 'নবাবস কিচেন সিলেট nawab''s kitchen sylhet', 'nababas kicen silet nabab s kitcen silet'),
  ('spice-opera-sylhet', 'স্পাইস অপেরা সিলেট', 'Spice Opera Sylhet', 'restaurant', 'sylhet-city', 'স্পাইস অপেরা সিলেট spice opera sylhet', 'spais apera silet spice apera silet'),
  ('foodbus-sylhet', 'ফুডবাস সিলেট', 'FOODBUS Sylhet', 'restaurant', 'sylhet-city', 'ফুডবাস সিলেট foodbus sylhet', 'fudbas silet fudbus silet'),
  ('cine-vibe-sylhet', 'সিনে ভাইব রেস্টুরেন্ট সিলেট', 'Cine Vibe Restaurant Sylhet', 'restaurant', 'sylhet-city', 'সিনে ভাইব রেস্টুরেন্ট সিলেট cine vibe restaurant sylhet', 'sine baib resturent silet cine bibe restaurant silet'),
  ('seasons-grand-sylhet', 'সিজনস গ্র্যান্ড সিলেট', 'SEASONS Grand Sylhet', 'restaurant', 'sylhet-city', 'সিজনস গ্র্যান্ড সিলেট seasons grand sylhet', 'sijanas griand silet seasans grand silet'),
  ('spicy-restaurant-sylhet', 'স্পাইসি রেস্টুরেন্ট অ্যান্ড পার্টি সেন্টার সিলেট', 'Spicy Restaurant & Party Center Sylhet', 'restaurant', 'sylhet-city', 'স্পাইসি রেস্টুরেন্ট অ্যান্ড পার্টি সেন্টার সিলেট spicy restaurant & party center sylhet', 'spaisi resturent aiand parti sentar silet spici restaurant parti center silet'),
  ('kebab-cottage-sylhet', 'কাবাব কটেজ সিলেট', 'Kebab Cottage Sylhet', 'restaurant', 'kumarpara', 'কাবাব কটেজ সিলেট kebab cottage sylhet', 'kabab katej silet kebab catage silet'),
  ('woondaal-king-kebab-sylhet', 'উন্ডাল কিং কাবাব সিলেট', 'Woondaal King Kebab Sylhet', 'restaurant', 'sylhet-city', 'উন্ডাল কিং কাবাব সিলেট woondaal king kebab sylhet', 'undal king kabab silet bundal king kebab silet')
) as v(slug, name_bn, name_en, type, area_slug, search_text, search_key)
join districts d on d.slug = 'sylhet'
join areas a on a.district_id = d.id and a.slug = v.area_slug
on conflict (slug) do nothing;



insert into dishes (place_id, food_id, is_seed)
select p.id, f.id, true
from (values
  ('meatup-sylhet', 'steak'),
  ('bon-thai-sylhet', 'thai-food'),
  ('seasons-meat-and-grill-sylhet', 'steak'),
  ('seasons-meat-and-grill-sylhet', 'grill'),
  ('nawabs-kitchen-sylhet', 'bangladeshi-meal'),
  ('spice-opera-sylhet', 'chinese'),
  ('foodbus-sylhet', 'chinese'),
  ('cine-vibe-sylhet', 'bangladeshi-meal'),
  ('seasons-grand-sylhet', 'chinese'),
  ('spicy-restaurant-sylhet', 'chinese'),
  ('kebab-cottage-sylhet', 'kabab'),
  ('woondaal-king-kebab-sylhet', 'kabab')
) as v(place_slug, food_slug)
join places p on p.slug = v.place_slug
join foods f on f.slug = v.food_slug
on conflict (place_id, food_id) do nothing;





update districts d
set place_count = (select count(*) from places p where p.district_id = d.id and p.status = 'active');
