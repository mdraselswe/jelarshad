-- 0084: Rangpur content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.

insert into areas (district_id, slug, name_bn, name_en)
select d.id, v.slug, v.name_bn, v.name_en
from (values
  ('rangpur-city', 'রংপুর শহর', 'Rangpur city')
) as v(slug, name_bn, name_en)
join districts d on d.slug = 'rangpur'
on conflict (district_id, slug) do nothing;





insert into places (slug, name_bn, name_en, type, district_id, area_id, search_text, search_key, is_seed)
select v.slug, v.name_bn, v.name_en, v.type::place_type, d.id, a.id, v.search_text, v.search_key, true
from (values
  ('treat-me-rangpur', 'ট্রিট মি রংপুর', 'Treat Me Rangpur', 'restaurant', 'rangpur-city', 'ট্রিট মি রংপুর treat me rangpur', 'trit mi rangpur treat me rangpur'),
  ('mithu-hotel-rangpur', 'মিঠু হোটেল অ্যান্ড রেস্টুরেন্ট রংপুর', 'Mithu Hotel And Restaurant Rangpur', 'restaurant', 'rangpur-city', 'মিঠু হোটেল অ্যান্ড রেস্টুরেন্ট রংপুর mithu hotel and restaurant rangpur', 'mitu hatel aiand resturent rangpur mitu hatel and restaurant rangpur'),
  ('singara-house-rangpur', 'সিঙ্গারা হাউস রংপুর', 'Singara House Rangpur', 'restaurant', 'rangpur-city', 'সিঙ্গারা হাউস রংপুর singara house rangpur', 'singara haus rangpur singara hause rangpur'),
  ('rangpur-kala-bhuna-house', 'রংপুর কালাভুনা হাউজ', 'Rangpur Kala Bhuna House', 'restaurant', 'rangpur-city', 'রংপুর কালাভুনা হাউজ rangpur kala bhuna house', 'rangpur kalabuna hauj rangpur kala buna hause'),
  ('shatmatha-kalabhuna-house-rangpur', 'শতমাথা কালাভুনা হাউজ রংপুর', 'Shatmatha KalaBhuna House Rangpur', 'restaurant', 'rangpur-city', 'শতমাথা কালাভুনা হাউজ রংপুর shatmatha kalabhuna house rangpur', 'satamata kalabuna hauj rangpur satmata kalabuna hause rangpur'),
  ('kacchi-dine-rangpur', 'কাচ্চি ডাইন রংপুর', 'Kacchi Dine Rangpur', 'restaurant', 'rangpur-city', 'কাচ্চি ডাইন রংপুর kacchi dine rangpur', 'kaci dain rangpur kaci dine rangpur'),
  ('grill-and-chill-rangpur', 'গ্রিল অ্যান্ড চিল রেস্টুরেন্ট অ্যান্ড কাবাব রংপুর', 'Grill & Chill Restaurant and Kebab Rangpur', 'restaurant', 'rangpur-city', 'গ্রিল অ্যান্ড চিল রেস্টুরেন্ট অ্যান্ড কাবাব রংপুর grill & chill restaurant and kebab rangpur', 'gril aiand cil resturent aiand kabab rangpur gril cil restaurant and kebab rangpur')
) as v(slug, name_bn, name_en, type, area_slug, search_text, search_key)
join districts d on d.slug = 'rangpur'
join areas a on a.district_id = d.id and a.slug = v.area_slug
on conflict (slug) do nothing;



insert into dishes (place_id, food_id, is_seed)
select p.id, f.id, true
from (values
  ('treat-me-rangpur', 'pizza'),
  ('mithu-hotel-rangpur', 'bangladeshi-meal'),
  ('singara-house-rangpur', 'singara'),
  ('rangpur-kala-bhuna-house', 'beef-bhuna'),
  ('shatmatha-kalabhuna-house-rangpur', 'beef-bhuna'),
  ('kacchi-dine-rangpur', 'kacchi'),
  ('grill-and-chill-rangpur', 'kabab'),
  ('grill-and-chill-rangpur', 'grill')
) as v(place_slug, food_slug)
join places p on p.slug = v.place_slug
join foods f on f.slug = v.food_slug
on conflict (place_id, food_id) do nothing;





update districts d
set place_count = (select count(*) from places p where p.district_id = d.id and p.status = 'active');
