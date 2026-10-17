-- 0079: Chattogram content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.

insert into areas (district_id, slug, name_bn, name_en)
select d.id, v.slug, v.name_bn, v.name_en
from (values
  ('khulshi', 'খুলশী', 'Khulshi')
) as v(slug, name_bn, name_en)
join districts d on d.slug = 'chattogram'
on conflict (district_id, slug) do nothing;





insert into places (slug, name_bn, name_en, type, district_id, area_id, search_text, search_key, is_seed)
select v.slug, v.name_bn, v.name_en, v.type::place_type, d.id, a.id, v.search_text, v.search_key, true
from (values
  ('pizzaburg-chattogram', 'পিজ্জাবার্গ চট্টগ্রাম', 'PizzaBurg Chattogram', 'restaurant', 'chattogram-city', 'পিজ্জাবার্গ চট্টগ্রাম pizzaburg chattogram', 'pijabarg catagram pijaburg catagram'),
  ('lezzetli-turkish-delicacy-khulshi', 'লেজ্জেতলি টার্কিশ ডেলিকেসি খুলশী', 'Lezzetli Turkish Delicacy Khulshi', 'restaurant', 'khulshi', 'লেজ্জেতলি টার্কিশ ডেলিকেসি খুলশী lezzetli turkish delicacy khulshi', 'lejetli tarkis delikesi kulsi lejetli turkis delicaci kulsi'),
  ('segafredo-espresso-chattogram', 'সেগাফ্রেডো এসপ্রেসো চট্টগ্রাম', 'Segafredo Espresso Chattogram', 'restaurant', 'chattogram-city', 'সেগাফ্রেডো এসপ্রেসো চট্টগ্রাম segafredo espresso chattogram', 'segafreda esapresa catagram segafreda espresa catagram'),
  ('hunger-killers-chattogram', 'হাঙ্গার কিলারস চট্টগ্রাম', 'Hunger Killers Chattogram', 'restaurant', 'chattogram-city', 'হাঙ্গার কিলারস চট্টগ্রাম hunger killers chattogram', 'hangar kilaras catagram hunger kilers catagram'),
  ('secret-recipe-khulshi', 'সিক্রেট রেসিপি খুলশী', 'Secret Recipe Khulshi', 'restaurant', 'khulshi', 'সিক্রেট রেসিপি খুলশী secret recipe khulshi', 'sikret resipi kulsi secret recipe kulsi'),
  ('barcode-cafe-khulshi', 'বারকোড ক্যাফে খুলশী', 'Barcode Cafe Khulshi', 'restaurant', 'khulshi', 'বারকোড ক্যাফে খুলশী barcode cafe khulshi', 'barkad kiafe kulsi barcade cafe kulsi'),
  ('royal-hut-chattogram', 'রয়্যাল হাট চট্টগ্রাম', 'Royal Hut Chattogram', 'restaurant', 'chattogram-city', 'রয়্যাল হাট চট্টগ্রাম royal hut chattogram', 'raial hat catagram raial hut catagram'),
  ('silver-spoon-chattogram', 'সিলভার স্পুন চট্টগ্রাম', 'Silver Spoon Chattogram', 'restaurant', 'chattogram-city', 'সিলভার স্পুন চট্টগ্রাম silver spoon chattogram', 'silbar spun catagram silber spun catagram'),
  ('sugarbun-chattogram', 'সুগারবান চট্টগ্রাম', 'SugarBun Chattogram', 'restaurant', 'chattogram-city', 'সুগারবান চট্টগ্রাম sugarbun chattogram', 'sugarban catagram sugarbun catagram'),
  ('dawat-multi-cuisine-chattogram', 'দাওয়াত মাল্টি কুইজিন চট্টগ্রাম', 'Dawat Multi Cuisine Chattogram', 'restaurant', 'chattogram-city', 'দাওয়াত মাল্টি কুইজিন চট্টগ্রাম dawat multi cuisine chattogram', 'daiat malti kuijin catagram dabat multi cuisine catagram'),
  ('lone-star-steakhouse-chattogram', 'লোন স্টার স্টেকহাউস চট্টগ্রাম', 'The Lone Star Steakhouse Chattogram', 'restaurant', 'chattogram-city', 'লোন স্টার স্টেকহাউস চট্টগ্রাম the lone star steakhouse chattogram', 'lan star stekaus catagram te lane star steakause catagram'),
  ('the-pavillion-chattogram', 'দ্য প্যাভিলিয়ন চট্টগ্রাম', 'The Pavillion Chattogram', 'restaurant', 'chattogram-city', 'দ্য প্যাভিলিয়ন চট্টগ্রাম the pavillion chattogram', 'di piabilian catagram te pabilian catagram')
) as v(slug, name_bn, name_en, type, area_slug, search_text, search_key)
join districts d on d.slug = 'chattogram'
join areas a on a.district_id = d.id and a.slug = v.area_slug
on conflict (slug) do nothing;



insert into dishes (place_id, food_id, is_seed)
select p.id, f.id, true
from (values
  ('pizzaburg-chattogram', 'pizza'),
  ('pizzaburg-chattogram', 'burger'),
  ('lezzetli-turkish-delicacy-khulshi', 'turkish-food'),
  ('segafredo-espresso-chattogram', 'coffee'),
  ('hunger-killers-chattogram', 'seafood'),
  ('secret-recipe-khulshi', 'cafe-snacks'),
  ('barcode-cafe-khulshi', 'cafe-snacks'),
  ('royal-hut-chattogram', 'kabab'),
  ('silver-spoon-chattogram', 'chinese'),
  ('sugarbun-chattogram', 'fast-food'),
  ('dawat-multi-cuisine-chattogram', 'bangladeshi-meal'),
  ('lone-star-steakhouse-chattogram', 'steak'),
  ('the-pavillion-chattogram', 'thai-food')
) as v(place_slug, food_slug)
join places p on p.slug = v.place_slug
join foods f on f.slug = v.food_slug
on conflict (place_id, food_id) do nothing;





update districts d
set place_count = (select count(*) from places p where p.district_id = d.id and p.status = 'active');
