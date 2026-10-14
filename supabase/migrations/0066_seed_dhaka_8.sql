-- 0066: Dhaka content, by area (generated — do not edit by hand).
-- Source: scripts/seed/dhaka-data.ts · regenerate: pnpm db:seed · sources: docs/content-sources.md
--
-- Same rules as 0007: flagged is_seed (select purge_seed_data(); removes it), and no ratings,
-- reviews, prices, hours, addresses or claims are written here. A place is a name, an area and what
-- it is known for; real people add and verify the rest.



insert into foods (slug, name_bn, name_en, about_bn, search_text, search_key, is_seed) values
  ('chinese', 'চাইনিজ', 'Chinese', 'নুডলস, ফ্রাইড রাইস ও চিলি চিকেনের মতো বাংলাদেশি ধাঁচের চাইনিজ খাবার।', 'চাইনিজ chinese', 'cainij cinese', true),
  ('pizza', 'পিজ্জা', 'Pizza', 'ময়দার রুটির ওপর চিজ ও টপিং দিয়ে সেঁকা ইতালীয় খাবার।', 'পিজ্জা pizza', 'pija', true),
  ('bbq', 'বারবিকিউ', 'Barbecue', 'কয়লা বা গ্রিলে সেঁকা মাংস ও মাছ।', 'বারবিকিউ barbecue', 'barbikiu barbecue', true),
  ('fast-food', 'ফাস্ট ফুড', 'Fast Food', 'বার্গার, স্যান্ডউইচ ও ফ্রাইয়ের মতো দ্রুত পাওয়া যায় এমন খাবার।', 'ফাস্ট ফুড fast food', 'fast fud', true),
  ('thai-food', 'থাই খাবার', 'Thai Food', 'টক-ঝাল-মিষ্টির মিশ্রণে থাইল্যান্ডের স্যুপ, নুডলস ও কারি।', 'থাই খাবার thai food', 'tai kabar tai fud', true),
  ('japanese-food', 'জাপানিজ খাবার', 'Japanese Food', 'সুশি, রামেন ও টেম্পুরার মতো জাপানি খাবার।', 'জাপানিজ খাবার japanese food', 'japanij kabar japanese fud', true)
on conflict (slug) do nothing;

insert into aliases (entity, entity_id, alias, search_key)
select 'food', f.id::text, v.alias, v.search_key
from (values
  ('chinese', 'chinese food', 'cinese fud'),
  ('chinese', 'chaynij', 'cainij'),
  ('chinese', 'chainis', 'cainis'),
  ('chinese', 'চাইনিজ খাবার', 'cainij kabar'),
  ('pizza', 'pizza', 'pija'),
  ('pizza', 'pitza', 'pitja'),
  ('pizza', 'পিৎজা', 'pitja'),
  ('bbq', 'barbecue', 'barbecue'),
  ('bbq', 'bbq', 'bk'),
  ('bbq', 'grill', 'gril'),
  ('bbq', 'বার-বি-কিউ', 'bar bi kiu'),
  ('bbq', 'গ্রিল', 'gril'),
  ('fast-food', 'fastfood', 'fastfud'),
  ('fast-food', 'fast food', 'fast fud'),
  ('fast-food', 'burger', 'burger'),
  ('fast-food', 'বার্গার', 'bargar'),
  ('thai-food', 'thai', 'tai'),
  ('thai-food', 'thai soup', 'tai saup'),
  ('thai-food', 'থাই', 'tai'),
  ('japanese-food', 'japanese', 'japanese'),
  ('japanese-food', 'sushi', 'susi'),
  ('japanese-food', 'ramen', 'ramen'),
  ('japanese-food', 'জাপানিজ', 'japanij'),
  ('japanese-food', 'সুশি', 'susi')
) as v(food_slug, alias, search_key)
join foods f on f.slug = v.food_slug
on conflict do nothing;

insert into places (slug, name_bn, name_en, type, district_id, area_id, search_text, search_key, is_seed)
select v.slug, v.name_bn, v.name_en, v.type::place_type, d.id, a.id, v.search_text, v.search_key, true
from (values
  ('shiraj-chuigosto-savar', 'শিরাজ চুইগোশত', 'Shiraj Chuigosto', 'restaurant', 'savar', 'শিরাজ চুইগোশত shiraj chuigosto', 'siraj cuigasat siraj cuigasta'),
  ('kachchi-bhai-savar', 'কাচ্চি ভাই সাভার', 'Kachchi Bhai Savar', 'restaurant', 'savar', 'কাচ্চি ভাই সাভার kachchi bhai savar', 'kaci bai sabar'),
  ('haji-nanna-biriyani-savar', 'হাজী নান্না বিরিয়ানি', 'Haji Nanna Biriyani', 'restaurant', 'savar', 'হাজী নান্না বিরিয়ানি haji nanna biriyani', 'haji nana biriani'),
  ('alom-tehari-ghor-savar', 'আলম তেহারি ঘর', 'Alom Tehari Ghor', 'restaurant', 'savar', 'আলম তেহারি ঘর alom tehari ghor', 'alam tehari gar'),
  ('kacchi-dine-savar', 'কাচ্চি ডাইন সাভার', 'Kacchi Dine Savar', 'restaurant', 'savar', 'কাচ্চি ডাইন সাভার kacchi dine savar', 'kaci dain sabar kaci dine sabar'),
  ('pizzaclub-savar', 'পিজ্জাক্লাব সাভার', 'PizzaClub Savar', 'restaurant', 'savar', 'পিজ্জাক্লাব সাভার pizzaclub savar', 'pijaklab sabar pijaclub sabar'),
  ('shiraj-chuigosto-banasree', 'শিরাজ চুইগোশত বনশ্রী', 'Shiraj Chuigosto Banasree', 'restaurant', 'banasree', 'শিরাজ চুইগোশত বনশ্রী shiraj chuigosto banasree', 'siraj cuigasat banasri siraj cuigasta banasri'),
  ('el-cardo-banasree', 'এল কার্ডো', 'El Cardo', 'restaurant', 'banasree', 'এল কার্ডো el cardo', 'el karda el carda'),
  ('vooter-adda-taltola', 'ভূতের আড্ডা', 'Vooter Adda', 'restaurant', 'taltola', 'ভূতের আড্ডা vooter adda', 'buter ada'),
  ('churrasco-khilgaon', 'চুরাসকো', 'Churrasco', 'restaurant', 'khilgaon', 'চুরাসকো churrasco', 'curaska curasca'),
  ('pasta-club-khilgaon', 'পাস্তা ক্লাব', 'Pasta Club', 'restaurant', 'khilgaon', 'পাস্তা ক্লাব pasta club', 'pasta klab pasta club'),
  ('pizzaburg-uttara', 'পিজ্জাবার্গ উত্তরা', 'PizzaBurg Uttara', 'restaurant', 'uttara', 'পিজ্জাবার্গ উত্তরা pizzaburg uttara', 'pijabarg utara pijaburg utara'),
  ('izakaya-uttara', 'ইজাকায়া উত্তরা', 'Izakaya Uttara', 'restaurant', 'uttara', 'ইজাকায়া উত্তরা izakaya uttara', 'ijakaia utara'),
  ('foodies-pond-uttara', 'ফুডিজ পন্ড রেস্টুরেন্ট', 'Foodies'' Pond Restaurant', 'restaurant', 'uttara', 'ফুডিজ পন্ড রেস্টুরেন্ট foodies'' pond restaurant', 'fudij pand resturent fudies pand restaurant'),
  ('kala-bhuna-kabab-nook-uttara', 'কালা ভুনা অ্যান্ড কাবাব নুক', 'Kala Bhuna & Kabab Nook', 'restaurant', 'uttara', 'কালা ভুনা অ্যান্ড কাবাব নুক kala bhuna & kabab nook', 'kala buna aiand kabab nuk kala buna kabab nuk'),
  ('takumi-uttara', 'তাকুমি জাপানিজ রেস্টুরেন্ট উত্তরা', 'Takumi Japanese Restaurant Uttara', 'restaurant', 'uttara', 'তাকুমি জাপানিজ রেস্টুরেন্ট উত্তরা takumi japanese restaurant uttara', 'takumi japanij resturent utara takumi japanese restaurant utara'),
  ('kacchi-darbar-uttara', 'কাচ্চি দরবার উত্তরা', 'Kacchi Darbar Uttara', 'restaurant', 'uttara', 'কাচ্চি দরবার উত্তরা kacchi darbar uttara', 'kaci darabar utara kaci darbar utara'),
  ('thai-emerald-uttara', 'থাই এমারেল্ড উত্তরা', 'Thai Emerald Uttara', 'restaurant', 'uttara', 'থাই এমারেল্ড উত্তরা thai emerald uttara', 'tai emareld utara tai emerald utara'),
  ('herfy-banani', 'হারফি বনানী', 'Herfy Banani', 'restaurant', 'banani', 'হারফি বনানী herfy banani', 'harfi banani herfi banani')
) as v(slug, name_bn, name_en, type, area_slug, search_text, search_key)
join districts d on d.slug = 'dhaka'
join areas a on a.district_id = d.id and a.slug = v.area_slug
on conflict (slug) do nothing;



insert into dishes (place_id, food_id, is_seed)
select p.id, f.id, true
from (values
  ('shiraj-chuigosto-savar', 'chui-jhal'),
  ('kachchi-bhai-savar', 'kacchi'),
  ('haji-nanna-biriyani-savar', 'kacchi'),
  ('alom-tehari-ghor-savar', 'tehari'),
  ('kacchi-dine-savar', 'kacchi'),
  ('pizzaclub-savar', 'pizza'),
  ('shiraj-chuigosto-banasree', 'chui-jhal'),
  ('el-cardo-banasree', 'fast-food'),
  ('vooter-adda-taltola', 'chinese'),
  ('churrasco-khilgaon', 'bbq'),
  ('pasta-club-khilgaon', 'pizza'),
  ('pizzaburg-uttara', 'pizza'),
  ('izakaya-uttara', 'japanese-food'),
  ('foodies-pond-uttara', 'chinese'),
  ('kala-bhuna-kabab-nook-uttara', 'kabab'),
  ('takumi-uttara', 'japanese-food'),
  ('kacchi-darbar-uttara', 'kacchi'),
  ('thai-emerald-uttara', 'thai-food'),
  ('herfy-banani', 'fast-food')
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
