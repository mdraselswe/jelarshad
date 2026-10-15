-- Chains ("brands"): one brand, many branches, each branch its own place (own dishes and reactions).
-- A branch's reactions are never added to another branch; the brand only groups them for navigation.
create table brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_bn text not null,
  name_en text,
  created_at timestamptz not null default now()
);

alter table brands enable row level security;
create policy "brands are public" on brands for select using (true);

alter table places add column brand_id uuid references brands on delete set null;
create index places_brand_id_idx on places (brand_id) where brand_id is not null;

-- The same Khilgaon shop was seeded twice under two spellings; keep the older page.
select merge_places(
  (select id from places where slug = 'kacchi-bhai-khilgaon'),
  (select id from places where slug = 'kachchi-bhai-khilgaon')
);

insert into brands (slug, name_bn, name_en) values
  ('sultans-dine', 'সুলতানস ডাইন', 'Sultan''s Dine'),
  ('kacchi-bhai', 'কাচ্চি ভাই', 'Kacchi Bhai'),
  ('shiraj-chuigosto', 'শিরাজ চুইগোশত', 'Shiraj Chuigosto'),
  ('pizzaburg', 'পিজ্জাবার্গ', 'PizzaBurg'),
  ('thai-emerald', 'থাই এমারেল্ড', 'Thai Emerald'),
  ('herfy', 'হারফি', 'Herfy'),
  ('yum-cha-district', 'ইয়াম চা ডিস্ট্রিক্ট', 'Yum Cha District'),
  ('avano', 'আভানো', 'Avano'),
  ('roadside-kitchen', 'রোডসাইড কিচেন', 'Roadside Kitchen'),
  ('dim-sum-town', 'ডিম সাম টাউন', 'Dim Sum Town'),
  ('madchef', 'ম্যাডশেফ', 'Madchef'),
  ('khao-san', 'খাও সান', 'Khao San'),
  ('cafe-darbar', 'ক্যাফে দরবার', 'Cafe Darbar'),
  ('secret-recipe', 'সিক্রেট রেসিপি', 'Secret Recipe'),
  ('xinxian', 'শিনশিয়ান', 'Xinxian'),
  ('kfc', 'কেএফসি', 'KFC'),
  ('khanas', 'খানাস', 'Khana''s'),
  ('kudos', 'কুডোস', 'Kudos'),
  ('chilis', 'চিলিস', 'Chilis'),
  ('rustic-eatery', 'রাস্টিক ইটারি', 'Rustic Eatery'),
  ('alfresco', 'আলফ্রেসকো', 'Alfresco'),
  ('woodhouse-grill', 'উডহাউস গ্রিল', 'Woodhouse Grill'),
  ('takeout', 'টেকআউট', 'Takeout'),
  ('mr-burger', 'মিস্টার বার্গার', 'Mr. Burger'),
  ('pizza-hut', 'পিজ্জা হাট', 'Pizza Hut'),
  ('shawarma-king', 'শাওয়ার্মা কিং', 'Shawarma King');

update places set brand_id = (select id from brands where slug = 'sultans-dine') where slug in ('sultans-dine-dhaka');
update places set brand_id = (select id from brands where slug = 'kacchi-bhai') where slug in ('kachchi-bhai-dhaka', 'kachchi-bhai-khilgaon', 'kachchi-bhai-savar', 'kacchi-bhai-banasree');
update places set brand_id = (select id from brands where slug = 'shiraj-chuigosto') where slug in ('shiraj-chuigosto-savar', 'shiraj-chuigosto-banasree');
update places set brand_id = (select id from brands where slug = 'pizzaburg') where slug in ('pizzaburg-uttara', 'pizzaburg-mirpur', 'pizzaburg-mohammadpur', 'pizzaburg-bashundhara', 'pizzaburg-khilgaon');
update places set brand_id = (select id from brands where slug = 'thai-emerald') where slug in ('thai-emerald-uttara', 'thai-emerald-dhanmondi');
update places set brand_id = (select id from brands where slug = 'herfy') where slug in ('herfy-banani', 'herfy-mirpur-twelve', 'herfy-bashundhara', 'herfy-khilgaon');
update places set brand_id = (select id from brands where slug = 'yum-cha-district') where slug in ('yum-cha-district-dhanmondi', 'yum-cha-district-gulshan');
update places set brand_id = (select id from brands where slug = 'avano') where slug in ('avano-dhanmondi', 'avano-mirpur');
update places set brand_id = (select id from brands where slug = 'roadside-kitchen') where slug in ('roadside-kitchen-dhanmondi', 'roadside-kitchen-bashundhara', 'roadside-kitchen-khilgaon');
update places set brand_id = (select id from brands where slug = 'dim-sum-town') where slug in ('dim-sum-town-dhanmondi', 'dim-sum-town-uttara');
update places set brand_id = (select id from brands where slug = 'madchef') where slug in ('madchef-dhanmondi', 'madchef-mirpur', 'madchef-uttara');
update places set brand_id = (select id from brands where slug = 'khao-san') where slug in ('khao-san-dhanmondi', 'khao-san-gulshan');
update places set brand_id = (select id from brands where slug = 'cafe-darbar') where slug in ('cafe-darbar-dhanmondi', 'cafe-darbar-uttara');
update places set brand_id = (select id from brands where slug = 'secret-recipe') where slug in ('secret-recipe-dhanmondi', 'secret-recipe-mohammadpur', 'secret-recipe-bashundhara', 'secret-recipe-mohakhali');
update places set brand_id = (select id from brands where slug = 'xinxian') where slug in ('xinxian-dhanmondi', 'xinxian-mirpur-one', 'xinxian-mirpur-ten', 'xinxian-uttara');
update places set brand_id = (select id from brands where slug = 'kfc') where slug in ('kfc-dhanmondi', 'kfc-khilgaon');
update places set brand_id = (select id from brands where slug = 'khanas') where slug in ('khanas-mirpur', 'khanas-mirpur-twelve', 'khanas-mohammadpur', 'khanas-khilgaon', 'khanas-club-house-bashundhara');
update places set brand_id = (select id from brands where slug = 'kudos') where slug in ('kudos-mirpur', 'kudos-uttara', 'kudos-mohammadpur', 'kudos-bashundhara');
update places set brand_id = (select id from brands where slug = 'chilis') where slug in ('chilis-mirpur-twelve', 'chilis-mohammadpur', 'chilis-banasree');
update places set brand_id = (select id from brands where slug = 'rustic-eatery') where slug in ('rustic-eatery-uttara', 'rustic-eatery-banani');
update places set brand_id = (select id from brands where slug = 'alfresco') where slug in ('alfresco-uttara', 'alfresco-banani');
update places set brand_id = (select id from brands where slug = 'woodhouse-grill') where slug in ('woodhouse-grill-banani', 'woodhouse-grill-mohakhali');
update places set brand_id = (select id from brands where slug = 'takeout') where slug in ('takeout-mohammadpur', 'takeout-banasree');
update places set brand_id = (select id from brands where slug = 'mr-burger') where slug in ('mr-burger-khilgaon', 'mr-burger-banasree');
update places set brand_id = (select id from brands where slug = 'pizza-hut') where slug in ('pizza-hut-basabo', 'pizza-hut-banasree');
update places set brand_id = (select id from brands where slug = 'shawarma-king') where slug in ('shawarma-king-khilgaon', 'shawarma-king-banasree');
