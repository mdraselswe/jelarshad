-- 0085: Coxs-bazar content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.

insert into areas (district_id, slug, name_bn, name_en)
select d.id, v.slug, v.name_bn, v.name_en
from (values
  ('kolatoli', 'কলাতলী', 'Kolatoli'),
  ('inani', 'ইনানী', 'Inani')
) as v(slug, name_bn, name_en)
join districts d on d.slug = 'coxs-bazar'
on conflict (district_id, slug) do nothing;





insert into places (slug, name_bn, name_en, type, district_id, area_id, search_text, search_key, is_seed)
select v.slug, v.name_bn, v.name_en, v.type::place_type, d.id, a.id, v.search_text, v.search_key, true
from (values
  ('amber-loaf-kolatoli', 'অ্যাম্বার লোফ কলাতলী', 'Amber Loaf Kolatoli', 'restaurant', 'kolatoli', 'অ্যাম্বার লোফ কলাতলী amber loaf kolatoli', 'aiambar laf kalatli amber laf kalatali'),
  ('tajdar-biriyani-kolatoli', 'তাজদার বিরিয়ানি কলাতলী', 'Tajdar Biriyani Kolatoli', 'restaurant', 'kolatoli', 'তাজদার বিরিয়ানি কলাতলী tajdar biriyani kolatoli', 'tajdar biriani kalatli tajdar biriani kalatali'),
  ('palongki-kolatoli', 'পালংকি কলাতলী', 'Palongki Kolatoli', 'restaurant', 'kolatoli', 'পালংকি কলাতলী palongki kolatoli', 'palangki kalatli palangki kalatali'),
  ('mermaid-cafe-kolatoli', 'মারমেইড ক্যাফে কলাতলী', 'Mermaid Cafe Kolatoli', 'restaurant', 'kolatoli', 'মারমেইড ক্যাফে কলাতলী mermaid cafe kolatoli', 'marmeid kiafe kalatli mermaid cafe kalatali'),
  ('sun-dancer-cafe-kolatoli', 'সান ড্যান্সার ক্যাফে কলাতলী', 'Sun Dancer Cafe Kolatoli', 'restaurant', 'kolatoli', 'সান ড্যান্সার ক্যাফে কলাতলী sun dancer cafe kolatoli', 'san diansar kiafe kalatli sun dancer cafe kalatali'),
  ('praasad-bbq-coxs-bazar', 'প্রাসাদ বার-বি-কিউ কক্সবাজার', 'Praasad BBQ Restaurant Cox''s Bazar', 'restaurant', 'coxs-bazar-town', 'প্রাসাদ বার-বি-কিউ কক্সবাজার praasad bbq restaurant cox''s bazar', 'prasad bar bi kiu kaksabajar prasad bk restaurant caks s bajar'),
  ('al-goni-restaurant-coxs-bazar', 'আল গনি রেস্টুরেন্ট কক্সবাজার', 'Al-Goni Restaurant Cox''s Bazar', 'restaurant', 'coxs-bazar-town', 'আল গনি রেস্টুরেন্ট কক্সবাজার al-goni restaurant cox''s bazar', 'al gani resturent kaksabajar al gani restaurant caks s bajar'),
  ('palongki-inani', 'পালংকি ইনানী', 'Palongki Inani', 'restaurant', 'inani', 'পালংকি ইনানী palongki inani', 'palangki inani'),
  ('coxs-bazar-sea-food-restaurant', 'কক্সবাজার সি ফুড রেস্টুরেন্ট', 'Cox''s Bazar Sea Food Restaurant', 'restaurant', 'coxs-bazar-town', 'কক্সবাজার সি ফুড রেস্টুরেন্ট cox''s bazar sea food restaurant', 'kaksabajar si fud resturent caks s bajar sea fud restaurant'),
  ('lobster-restaurant-coxs-bazar', 'লবস্টার রেস্টুরেন্ট কক্সবাজার', 'Lobster Restaurant Cox''s Bazar', 'restaurant', 'coxs-bazar-town', 'লবস্টার রেস্টুরেন্ট কক্সবাজার lobster restaurant cox''s bazar', 'labastar resturent kaksabajar labster restaurant caks s bajar'),
  ('tasbih-biryani-house-coxs-bazar', 'তসবিহ রেস্টুরেন্ট অ্যান্ড বিরিয়ানি হাউস কক্সবাজার', 'TASBIH Restaurant & Biryani House Cox''s Bazar', 'restaurant', 'coxs-bazar-town', 'তসবিহ রেস্টুরেন্ট অ্যান্ড বিরিয়ানি হাউস কক্সবাজার tasbih restaurant & biryani house cox''s bazar', 'tasabih resturent aiand biriani haus kaksabajar tasbih restaurant biriani hause caks s bajar'),
  ('zaman-kabab-house-coxs-bazar', 'জামান রেস্টুরেন্ট অ্যান্ড কাবাব হাউস কক্সবাজার', 'Zaman Restaurant & Kabab House Cox''s Bazar', 'restaurant', 'coxs-bazar-town', 'জামান রেস্টুরেন্ট অ্যান্ড কাবাব হাউস কক্সবাজার zaman restaurant & kabab house cox''s bazar', 'jaman resturent aiand kabab haus kaksabajar jaman restaurant kabab hause caks s bajar')
) as v(slug, name_bn, name_en, type, area_slug, search_text, search_key)
join districts d on d.slug = 'coxs-bazar'
join areas a on a.district_id = d.id and a.slug = v.area_slug
on conflict (slug) do nothing;



insert into dishes (place_id, food_id, is_seed)
select p.id, f.id, true
from (values
  ('amber-loaf-kolatoli', 'chinese'),
  ('tajdar-biriyani-kolatoli', 'biryani'),
  ('palongki-kolatoli', 'bangladeshi-meal'),
  ('mermaid-cafe-kolatoli', 'seafood'),
  ('sun-dancer-cafe-kolatoli', 'cafe-snacks'),
  ('praasad-bbq-coxs-bazar', 'bbq'),
  ('al-goni-restaurant-coxs-bazar', 'bangladeshi-meal'),
  ('palongki-inani', 'bangladeshi-meal'),
  ('coxs-bazar-sea-food-restaurant', 'seafood'),
  ('lobster-restaurant-coxs-bazar', 'seafood'),
  ('tasbih-biryani-house-coxs-bazar', 'biryani'),
  ('zaman-kabab-house-coxs-bazar', 'kabab')
) as v(place_slug, food_slug)
join places p on p.slug = v.place_slug
join foods f on f.slug = v.food_slug
on conflict (place_id, food_id) do nothing;





update districts d
set place_count = (select count(*) from places p where p.district_id = d.id and p.status = 'active');
