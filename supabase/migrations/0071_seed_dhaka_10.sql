-- 0071: Dhaka content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.







insert into places (slug, name_bn, name_en, type, district_id, area_id, search_text, search_key, is_seed)
select v.slug, v.name_bn, v.name_en, v.type::place_type, d.id, a.id, v.search_text, v.search_key, true
from (values
  ('hotel-new-star-and-kabab-tejgaon', 'হোটেল নিউ স্টার অ্যান্ড কাবাব', 'Hotel New Star & Kabab', 'restaurant', 'tejgaon', 'হোটেল নিউ স্টার অ্যান্ড কাবাব hotel new star & kabab', 'hatel niu star aiand kabab hatel neb star kabab'),
  ('vrindas-kitchen-farmgate', 'বৃন্দাস কিচেন ফার্মগেট', 'Vrinda''s Kitchen Farmgate', 'restaurant', 'farmgate', 'বৃন্দাস কিচেন ফার্মগেট vrinda''s kitchen farmgate', 'brindas kicen farmaget brinda s kitcen farmgate'),
  ('cafe-ninety-nine-farmgate', 'ক্যাফে ৯৯ ফার্মগেট', 'Cafe 99 Farmgate', 'restaurant', 'farmgate', 'ক্যাফে ৯৯ ফার্মগেট cafe 99 farmgate', 'kiafe 99 farmaget cafe 99 farmgate'),
  ('pizzaburg-wari', 'পিজ্জাবার্গ ওয়ারী', 'PizzaBurg Wari', 'restaurant', 'wari', 'পিজ্জাবার্গ ওয়ারী pizzaburg wari', 'pijabarg aiari pijaburg bari'),
  ('swiss-bakery-wari', 'সুইস বেকারি ওয়ারী', 'Swiss Bakery Wari', 'bakery', 'wari', 'সুইস বেকারি ওয়ারী swiss bakery wari', 'suis bekari aiari sbis bakeri bari'),
  ('sub-zero-icecream-parlour-wari', 'সাব-জিরো আইসক্রিম পার্লার ওয়ারী', 'Sub-Zero Icecream Parlour Wari', 'shop', 'wari', 'সাব-জিরো আইসক্রিম পার্লার ওয়ারী sub-zero icecream parlour wari', 'sab jira aisakrim parlar aiari sub jera icecream parlaur bari'),
  ('new-dhaka-biriyani-house-moghbazar', 'নিউ ঢাকা বিরিয়ানি হাউজ মগবাজার', 'New Dhaka Biriyani House Moghbazar', 'restaurant', 'moghbazar', 'নিউ ঢাকা বিরিয়ানি হাউজ মগবাজার new dhaka biriyani house moghbazar', 'niu daka biriani hauj magabajar neb daka biriani hause magbajar'),
  ('mr-shawarma-moghbazar', 'মিস্টার শাওয়ার্মা মগবাজার', 'Mr Shawarma Moghbazar', 'restaurant', 'moghbazar', 'মিস্টার শাওয়ার্মা মগবাজার mr shawarma moghbazar', 'mistar saiarma magabajar mr sabarma magbajar'),
  ('takeout-moghbazar', 'টেকআউট মগবাজার', 'Takeout Moghbazar', 'restaurant', 'moghbazar', 'টেকআউট মগবাজার takeout moghbazar', 'tekaut magabajar takeaut magbajar'),
  ('nabihah-restaurant-baridhara', 'নাবিহা রেস্টুরেন্ট অ্যান্ড ক্যাফে বারিধারা', 'Nabihah Restaurant N Cafe Baridhara', 'restaurant', 'baridhara', 'নাবিহা রেস্টুরেন্ট অ্যান্ড ক্যাফে বারিধারা nabihah restaurant n cafe baridhara', 'nabiha resturent aiand kiafe baridara nabihah restaurant n cafe baridara'),
  ('atrium-restaurant-baridhara', 'দ্য অ্যাট্রিয়াম রেস্টুরেন্ট বারিধারা', 'The Atrium Restaurant Baridhara', 'restaurant', 'baridhara', 'দ্য অ্যাট্রিয়াম রেস্টুরেন্ট বারিধারা the atrium restaurant baridhara', 'di aiatriam resturent baridara te atrium restaurant baridara'),
  ('milk-and-cream-pallabi', 'মিল্ক অ্যান্ড ক্রিম পল্লবী', 'Milk & Cream BD Pallabi', 'shop', 'pallabi', 'মিল্ক অ্যান্ড ক্রিম পল্লবী milk & cream bd pallabi', 'milk aiand krim palabi milk cream bd palabi'),
  ('posh-lounge-rooftop-pallabi', 'পোশ লাউঞ্জ রুফটপ পল্লবী', 'Posh Lounge Rooftop Pallabi', 'restaurant', 'pallabi', 'পোশ লাউঞ্জ রুফটপ পল্লবী posh lounge rooftop pallabi', 'pas launj rufatap palabi pas launge ruftap palabi'),
  ('little-arabia-shantinagar', 'লিটল আরাবিয়া শান্তিনগর', 'Little Arabia Restaurant Shantinagar', 'restaurant', 'shantinagar', 'লিটল আরাবিয়া শান্তিনগর little arabia restaurant shantinagar', 'lital arabia santinagar litle arabia restaurant santinagar'),
  ('mr-burger-malibagh', 'মিস্টার বার্গার মালিবাগ', 'Mr. Burger Malibagh', 'restaurant', 'malibagh', 'মিস্টার বার্গার মালিবাগ mr. burger malibagh', 'mistar bargar malibag mr burger malibag'),
  ('green-house-restaurant-elephant-road', 'গ্রিন হাউস রেস্টুরেন্ট এলিফ্যান্ট রোড', 'Green House Restaurant Elephant Road', 'restaurant', 'elephant-road', 'গ্রিন হাউস রেস্টুরেন্ট এলিফ্যান্ট রোড green house restaurant elephant road', 'grin haus resturent elifiant rad grin hause restaurant elefant rad'),
  ('pizzaburg-dhanmondi', 'পিজ্জাবার্গ ধানমন্ডি', 'PizzaBurg Dhanmondi', 'restaurant', 'dhanmondi', 'পিজ্জাবার্গ ধানমন্ডি pizzaburg dhanmondi', 'pijabarg danamandi pijaburg danmandi'),
  ('sultans-dine-gulshan', 'সুলতানস ডাইন গুলশান', 'Sultan''s Dine Gulshan', 'restaurant', 'gulshan', 'সুলতানস ডাইন গুলশান sultan''s dine gulshan', 'sultanas dain gulsan sultan s dine gulsan'),
  ('star-kabab-thatari-bazar', 'স্টার কাবাব ঠাটারী বাজার', 'Star Kabab Thatari Bazar', 'restaurant', 'thatari-bazar', 'স্টার কাবাব ঠাটারী বাজার star kabab thatari bazar', 'star kabab tatari bajar'),
  ('star-kabab-wari', 'স্টার কাবাব ওয়ারী', 'Star Kabab Wari', 'restaurant', 'wari', 'স্টার কাবাব ওয়ারী star kabab wari', 'star kabab aiari star kabab bari'),
  ('star-kabab-karwan-bazar', 'স্টার কাবাব কারওয়ান বাজার', 'Star Kabab Karwan Bazar', 'restaurant', 'karwan-bazar', 'স্টার কাবাব কারওয়ান বাজার star kabab karwan bazar', 'star kabab karuian bajar star kabab karban bajar'),
  ('star-kabab-farmgate', 'স্টার কাবাব ফার্মগেট', 'Star Kabab Farmgate', 'restaurant', 'farmgate', 'স্টার কাবাব ফার্মগেট star kabab farmgate', 'star kabab farmaget star kabab farmgate'),
  ('star-kabab-banani', 'স্টার কাবাব বনানী', 'Star Kabab Banani', 'restaurant', 'banani', 'স্টার কাবাব বনানী star kabab banani', 'star kabab banani'),
  ('star-kabab-elephant-road', 'স্টার কাবাব এলিফ্যান্ট রোড', 'Star Kabab Elephant Road', 'restaurant', 'elephant-road', 'স্টার কাবাব এলিফ্যান্ট রোড star kabab elephant road', 'star kabab elifiant rad star kabab elefant rad'),
  ('star-kabab-johnson-road', 'স্টার কাবাব জনসন রোড', 'Star Kabab Johnson Road', 'restaurant', 'johnson-road', 'স্টার কাবাব জনসন রোড star kabab johnson road', 'star kabab janasan rad star kabab jahnsan rad')
) as v(slug, name_bn, name_en, type, area_slug, search_text, search_key)
join districts d on d.slug = 'dhaka'
join areas a on a.district_id = d.id and a.slug = v.area_slug
on conflict (slug) do nothing;



insert into dishes (place_id, food_id, is_seed)
select p.id, f.id, true
from (values
  ('hotel-new-star-and-kabab-tejgaon', 'bangladeshi-meal'),
  ('hotel-new-star-and-kabab-tejgaon', 'kabab'),
  ('vrindas-kitchen-farmgate', 'bangladeshi-meal'),
  ('cafe-ninety-nine-farmgate', 'cafe-snacks'),
  ('pizzaburg-wari', 'pizza'),
  ('pizzaburg-wari', 'burger'),
  ('swiss-bakery-wari', 'cafe-snacks'),
  ('sub-zero-icecream-parlour-wari', 'ice-cream'),
  ('new-dhaka-biriyani-house-moghbazar', 'biryani'),
  ('mr-shawarma-moghbazar', 'shawarma'),
  ('takeout-moghbazar', 'fast-food'),
  ('nabihah-restaurant-baridhara', 'cafe-snacks'),
  ('atrium-restaurant-baridhara', 'thai-food'),
  ('milk-and-cream-pallabi', 'ice-cream'),
  ('posh-lounge-rooftop-pallabi', 'thai-food'),
  ('little-arabia-shantinagar', 'arabian-food'),
  ('mr-burger-malibagh', 'burger'),
  ('green-house-restaurant-elephant-road', 'chinese'),
  ('pizzaburg-dhanmondi', 'pizza'),
  ('pizzaburg-dhanmondi', 'burger'),
  ('sultans-dine-gulshan', 'kacchi'),
  ('star-kabab-thatari-bazar', 'kabab'),
  ('star-kabab-wari', 'kabab'),
  ('star-kabab-karwan-bazar', 'kabab'),
  ('star-kabab-farmgate', 'kabab'),
  ('star-kabab-banani', 'kabab'),
  ('star-kabab-elephant-road', 'kabab'),
  ('star-kabab-johnson-road', 'kabab')
) as v(place_slug, food_slug)
join places p on p.slug = v.place_slug
join foods f on f.slug = v.food_slug
on conflict (place_id, food_id) do nothing;





update districts d
set place_count = (select count(*) from places p where p.district_id = d.id and p.status = 'active');
