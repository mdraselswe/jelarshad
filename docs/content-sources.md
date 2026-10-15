# Content sources

Where the launch content in `scripts/seed/*.ts` comes from. Rules: facts only (a name, an area, what it
is known for), nothing copied word for word, no ratings, prices or reviews. Shops close and move, so
every place is flagged `is_seed` and the app's verify flow is how real people correct it
(`select purge_seed_data();` removes the lot).

## Dhaka (migration 0013)

| What | Source |
|---|---|
| Haji Biryani (Nazira Bazar), Hanif, Bokhari, Bismillah Kabab Ghar, Badshahi Kabab, Kabab King, Beauty Lassi | [Prothom Alo English, Old Dhaka eateries](https://en.prothomalo.com/lifestyle/5j2cgkma56) |
| Nanna Miar Biryani, Junu Polao Ghor, Rahmania Kabab (Gandaria), Bot Tolar Kabab (Thatari Bazar) | [Dhaka Tribune, Culinary delights of Puran Dhaka](https://www.dhakatribune.com/bangladesh/351060/culinary-delights-of-puran-dhaka-a-voyage-through) |
| Beauty Lassi and Faluda (Johnson Road) | [The Business Standard](https://www.tbsnews.net/node/260941), [Wikipedia](https://en.wikipedia.org/wiki/Beauty_Lacchi_and_Faluda) |
| Bokhari (Johnson Road: lassi, faluda, kebab) | [The Daily Star Bangla](https://bangla.thedailystar.net/life-living/food-recipe/news-3906956) |
| Bakarkhani shops (Al-Amin, Shahjalal at Agamasi Lane, Yakub Ali at Nazira Bazar, Mostofa at Becharam Dewri) | [The Business Standard, Still in love with Bakarkhani](https://www.tbsnews.net/feature/food/still-love-bakarkhani) |
| Star Hotel, Hotel Al-Razzaque | [ESPNcricinfo, Dhaka's biryani](https://espncricinfo.com/story/dhaka-s-biryani-489063), [Lonely Planet](https://www.lonelyplanet.com/bangladesh/restaurants?page=1) |
| Fuchka: Jummon (Armanitola), Mujibur Miar (Bangshal), Mama (Lalmatia), Paanipuri (Gulshan) | [The Business Standard, The best fuchkawalas of Dhaka](https://www.tbsnews.net/node/493514) |
| Mostakim's Chaap (Mohammadpur) | [The Daily Star, Mostakim](https://tds-images.thedailystar.net/lifestyle/the-love-food/mostakim-tale-broken-dreams-1325557), [TBS, An evening at the chaap side of the town](https://www.tbsnews.net/node/29997) |
| Selim Kabab Ghor (Mohammadpur), Shawkat Kabab Ghor (Mirpur 10) | [The Financial Express](https://thefinancialexpress.com.bd/food/from-kabab-to-pitha-mohammadpurs-streets-tell-a-story-in-flavours), [Asia News Network / Daily Star](https://asianews.network/?p=176220) |
| Kallu Kabab Ghar (Mirpur) | [The Daily Star, Secret alleys](https://www.thedailystar.net/lifestyle/the-love-food/kallu-king-1487227) |
| Kasturi (Dhanmondi), Chittagong Bull (Gulshan) | [The Daily Star, Bengali cuisine in Dhaka](https://www.thedailystar.net/life-living/food-recipes/news/top-7-places-try-bengali-cuisine-dhaka-3113316), [Financial Express](https://thefinancialexpress.com.bd/lifestyle/food/craving-indian-food-in-dhaka-give-these-restaurants-a-try) |
| Star Kabab (Dhanmondi) | [Lonely Planet](https://www.lonelyplanet.com/bangladesh/restaurants?page=1) |
| Kacchi Wala (Uttara) | [The Daily Star](https://www.thedailystar.net/lifestyle/news/kacchi-wala-2072745) |
| Tehari Ghar (Dhanmondi), Moti Biryani House (Nazira Bazar), Shad Tehari Ghar (Lalmatia), Maruf Biryani House (Hazaribagh) | [The Business Standard, Dhaka's top 5 tehari places](https://www.tbsnews.net/node/366331) |
| Farmgate pavement chitoi pitha with bhorta | [bdnews24 photo feature](https://bdnews24.com/media-en/hob5vtnb45) |
| Bukhara, Lucknow (Banani) | [The Financial Express](https://thefinancialexpress.com.bd/food/craving-indian-food-in-dhaka-give-these-restaurants-a-try) |
| Madhur Canteen (Shahbagh, Dhaka University) | [Wikipedia](https://en.wikipedia.org/wiki/Madhur_Canteen), [The Daily Star](https://www.thedailystar.net/node/1153813) |
| Iskaton Garden Road kabab vans (near Shahbagh) | [Prothom Alo, street food spots](https://www.prothomalo.com/lifestyle/spaqn1qg00) |
| Metro Kitchens (Bashundhara R/A, fish BBQ) | [The Daily Star, Five popular hangout zones](https://www.thedailystar.net/star-youth/five-popular-hangout-zones-1456795) |
| Star Hotel (started at Thatari Bazar, branch at Karwan Bazar), Rabbani Hotel (Mirpur 11), Hotel Jannat (Mohammadpur) | [The Business Standard Bangla, five old food hotels of Dhaka](https://www.tbsnews.net/bangla/feature/news-details-366616) |
| Mamun Biryani House (Nazirabazar) | [Prothom Alo, restaurants open nearly 24 hours](https://www.prothomalo.com/lifestyle/%E0%A6%A2%E0%A6%BE%E0%A6%95%E0%A6%BE%E0%A7%9F-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A7%9F-%E0%A7%A8%E0%A7%AA-%E0%A6%98%E0%A6%A3%E0%A7%8D%E0%A6%9F%E0%A6%BE%E0%A6%87-%E0%A6%96%E0%A7%8B%E0%A6%B2%E0%A6%BE-%E0%A6%A5%E0%A6%BE%E0%A6%95%E0%A7%87-%E0%A6%AF%E0%A7%87%E0%A6%B8%E0%A6%AC-%E0%A6%B0%E0%A7%87%E0%A6%B8%E0%A7%8D%E0%A6%A4%E0%A7%8B%E0%A6%B0%E0%A6%BE%E0%A6%81) |
| Chawkbazar iftar market (boro baper polay khay, jilapi, haleem, borhani) | [Wikipedia](https://en.wikipedia.org/wiki/Chawkbazar_Iftar_Market), [The Business Standard](https://www.tbsnews.net/features/food/famous-iftar-lane-chawkbazar-running-more-legacy-taste-818521), [The Daily Star](https://www.thedailystar.net/culture/news/chawkbazar-comes-alive-iftar-delicacies-3837901) |
| Shahi jilapi (Chawkbazar) | [Wikipedia](https://en.wikipedia.org/wiki/Shahi_jilapi) |
| Sweet shops: Madina (Lalbagh), Omullo (Shakharibazar), Green Sweet Meat (Thatari Bazar), Shonamia (Gandaria), Moron Chand and Grandsons (Nawabpur) | [The Financial Express, Top sweets shops in Dhaka](https://thefinancialexpress.com.bd/lifestyle/food/top-sweets-shops-in-dhaka-where-you-can-find-varieties-of-sweets) |
| Haleem: Mona Bhai (Mohammadpur), Khaza (Gopibag), Mama (Kalabagan) | [The Business Standard, 5 hearty haleems in Dhaka](https://www.tbsnews.net/features/food/5-hearty-haleems-dhaka-city-407646) |
| Decent Bakery (Dhanmondi, haleem) | [The Daily Star, Best haleem and jilapi of Dhaka recognised](https://www.thedailystar.net/city/news/best-haleem-and-jilapi-dhaka-recognised-1748149) |
| Breakfast: Nirob Hotel (Chankharpul), Chowrangi Restaurant (Banglabazar), Hirajheel Hotel (Motijheel), Deshbondhu Sweetmeat (Hathkhola), Green Sweetmeat (Thatari Bazar) | [The Business Standard, 5 classic breakfast places in Dhaka](https://www.tbsnews.net/feature/food/5-classic-breakfast-places-dhaka-163855) |
| Pitha: Adda Prabartana, Mirpur Pitha Ghar, Bailey Pitha Ghor, Shantinagar Pitha Ghar | [The Business Standard, Best places to get pitha this winter](https://www.tbsnews.net/feature/food/best-places-get-pitha-winter-186202) |
| Uttara Pitha Ghar | [The Daily Star, Pithas](https://www.thedailystar.net/lifestyle/check-it-out/pithas-1339204) |

Prices in the iftar articles change every year, so none are stored.

Badda and Jatrabari: no article found that names a shop there, so none is listed. Contributors add them in the app.
| Kacchi: Kolkata Kachchi (Satrowza), Grand Nawab (Old Dhaka), Kachchi Bhai, Bashmoti Kachchi (Jigatola) | [The Business Standard, Best 5 Dhakai kacchi](https://www.tbsnews.net/feature/food/best-5-dhakai-kacchi-town-137398) |
| Morog polao: Jhunu Polao Ghor (Narinda) | [The Business Standard](https://www.tbsnews.net/feature/food/jhunu-polao-ghor-serving-aromatic-morog-polao-51-years-229126) |
| Nihari: Nihariwala (Banani), Mia Bhai (Banasree), Peshwarain (Wari), Grand Chandu Shahi Nihari, Maa Shahi Haleem and Nihari (Lalbagh) | [The Business Standard, Best nihari in Dhaka](https://www.tbsnews.net/features/food/5-restaurants-around-dhaka-satisfy-your-nihari-cravings-525830) |
| Maa Shahi Halim, Siddiqui Bhai (Subal Das Lane, Lalbagh) | [The Daily Star](https://www.thedailystar.net/my-dhaka/news/why-old-dhakas-siddiqui-bhai-nihari-must-try-3972511) |
| Lahori Nihari Dhaka (West Dhanmondi) | [Dhaka Tribune](https://www.dhakatribune.com/business/329877/lahori-nihari-dhaka-a-hidden-gem-in-dhanmondi) |
| Shawarma House, Arabian Fast Food (older article, Dhanmondi area) | [The Daily Star, For the love of shawarma](https://www.thedailystar.net/news/for-the-love-of-shawarma) |
| Tea: Pannu's Tea (Nazira Bazar), Cha Chai (Gulshan Avenue), Star Hotel Thatari Bazar | [The Daily Star, The best tea spots you can find](https://www.thedailystar.net/life-living/food-recipes/news/the-best-tea-spots-you-can-find-3161996) |

Mishti doi: no newspaper names a Dhaka shop for it, so none is listed.

## Chattogram (migration 0018)

| What | Source |
|---|---|
| Mezzan Haile Aiyun (Shulakbahar, mezbani) | [Prothom Alo](https://www.prothomalo.com/lifestyle/recipe/legbd117mu), [The Business Standard, Mezban](https://www.tbsnews.net/features/food/mezban-cuisine-choice-feasts-310606) |
| Kutumbari (AK Khan), Bir Chattala (SS Khaled Road), Member Hotel (Pahartali), Hotel Nizam (railway station area) | [The Business Standard, Where to find the best desi food in Chattogram](https://www.tbsnews.net/features/food/where-find-best-desi-food-chattogram-310618) |
| Hamid Bhai er Malai Tea (beside MA Aziz Stadium) | [The Business Standard, Drinks and dessert in Chattogram](https://www.tbsnews.net/features/food/food-happiness-drinks-dessert-chattogram-310639) |
| Goni Bakery (biscuits baked in wood-fired ovens) | [The Daily Star via Asia News Network](https://asianews.network/why-you-should-explore-bangladeshs-chattogram-the-city-of-stories-shores-and-surprises/) |
| Jhautola street food (chaap, haleem) | [The Business Standard, The delicious street foods of Chattogram](https://www.tbsnews.net/features/food/delicious-street-foods-chattogram-363451) |

## Sylhet (migration 0019)

| What | Source |
|---|---|
| Akhni, the iftar dish of Sylhet | [The Daily Star, Akhni: a staple at Sylheti iftars](https://www.thedailystar.net/news/bangladesh/news/akhni-staple-sylheti-iftars-3583866) |
| Shatkora beef | [Wikipedia](https://en.wikipedia.org/wiki/Satkara_beef) |
| Panshi and Pach Bhai (already seeded) linked to shatkora beef | Travel guides: [Hello Sylhet](https://hellosylhetcity.com/en/blog/a-taste-of-sylhet-must-try-sylheti-food-best-places), [Sylhet Tourist Guide](https://sylhettouristguide.com/restaurant/panshi). No newspaper names Sylhet shops, so no other Sylhet shop is listed. |

## Khulna, Rajshahi, Bogura, Cumilla (migrations 0021 to 0024)

| What | Source |
|---|---|
| Khulna: Abbas Hotel (chui jhal), Gesco Kabab, Indramohan Sweets, New Howrah Bakery, Rupsha Ghat snacks | [The Business Standard, An ode to Khulna](https://www.tbsnews.net/features/food/ode-khulna-love-food-1107281) |
| Rajshahi: puri burger (New Market), Sadhur Mor seekh burger, Haji and Tripti (Laxmipur, kaliza singara), Jorakali (Malopara), Ranar's Sweet (Ranibazar), Noborup (Saheb Bazar), Batar Morer Jilapi | [The Business Standard, Rajshahi food you should never miss](https://www.tbsnews.net/feature/food/rajshahi-food-you-should-never-miss) |
| Bogura doi: Shri Gour Gopal (Nawabbari Road), Ruchita, Sherpur Doi Ghar, Enam Doi Ghar (Jhautala), Asia Sweets, Akbaria, Chinipata, Shyamoli | [BSS, Bogura's yoghurt](https://www.bssnews.net/district/316161) |
| Cumilla: Matri Bhandar (Manoharpur), Cumilla Mishti Bhandar, Bhagwati Peda Bhandar, Shital Bhandar | [BSS, Cumilla's rasmalai](https://www.bssnews.net/district/311066) |

## Barishal, Mymensingh, Rangpur, Cox's Bazar (migrations 0025 to 0028)

Few newspaper-named shops exist for these districts, so the lists are short. Restaurants that only
appear on Tripadvisor, Foodpanda or blogs (for example Mouban and Kacchi Dine in Rangpur) are not added.

| What | Source |
|---|---|
| Barishal: Gaur Nitai Mistanna Bhandar, Gournadi doi and rasmalai | [Bangladesh Post, Gournadi yogurt](https://bangladeshpost.net/posts/gournadi-yogurt-gains-popularity-64263) |
| Mymensingh: Janaki Nag Sweets (Swadeshi Bazar), Krishna Cabin, malaikari | [Prothom Alo, Mymensingh malaikari](https://www.prothomalo.com/bangladesh/district/x2r6bnyevm) |
| Mymensingh: Gopal Pal's Shingha Marka Monda, Muktagachha | [The Financial Express, history of monda](https://thefinancialexpress.com.bd/national/the-interesting-history-behind-sweetmeat-monda-1578594577) |
| Mymensingh: Bikrampur Sweet Meat, Adarsha Mistanno Bhandar (Boro Kalibari, pera) | [The Daily Star, Mymensingh sweets for Durga Puja](https://www.thedailystar.net/culture/news/mymensinghs-sweet-offerings-durga-puja-3725996) |
| Rangpur: Rangpur Shingara House (Haripatti Road, beside the Kalibari) | [The Financial Express, Rangpur Shingara House](https://thefinancialexpress.com.bd/lifestyle/food/rangpur-shingara-house-63-years-of-mesmerising-taste) |
| Cox's Bazar: Poushi (loitta fry), Jhaubon (rupchanda fry) | [The Daily Star (Bangla), Bhromone bhojon](https://bangla.thedailystar.net/%E0%A6%86%E0%A6%A8%E0%A6%A8%E0%A7%8D%E0%A6%A6%E0%A6%A7%E0%A6%BE%E0%A6%B0%E0%A6%BE/%E0%A6%AD%E0%A7%8D%E0%A6%B0%E0%A6%AE%E0%A6%A3/%E0%A6%AD%E0%A7%8D%E0%A6%B0%E0%A6%AE%E0%A6%A3%E0%A7%87-%E0%A6%AD%E0%A7%8B%E0%A6%9C%E0%A6%A8-76527), [UNB, must-try food in Cox's Bazar](https://unb.com.bd/category/lifestyle/must-try-food-items-in-coxs-bazar/84946) |
| Cox's Bazar: Salt Bistro and Cafe (spicy crab); dry fish | [UNB](https://unb.com.bd/category/lifestyle/must-try-food-items-in-coxs-bazar/84946), [The Daily Star, Cox's Bazar to-do list](https://www.thedailystar.net/coxs-bazar-to-do-list-48534) |

## Remaining districts (migrations 0029 to 0059)

Only shops and restaurants that a newspaper names are added. Districts without such an article
(for example Narayanganj, Gazipur, Chandpur, Noakhali, Dinajpur, Thakurgaon) have no places yet.

| District | What | Source |
|---|---|---|
| Jamalpur | Burima Mistanna Bhandar (Amlapara) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/life-living/food-recipe/news-565046) |
| Tangail | Kalidas Mistanna Bhandar (Jamurki, Mirzapur) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/life-living/food-recipe/news-569376) |
| Kurigram | Jhantu Mishtanno Bhandar (Kalibari, since 1939) | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/y2rqugo3s4) |
| Jashore | Jolojog (Chowrasta, since 1893) | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/3hv0p2e13h) |
| Pabna | Kori Pal's sweet shop (Ashmobaria Bazar, Ishwardi) | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/d00en4tiu0) |
| Gopalganj | Dutta Mistanna Bhandar (DC Market, since 1938) | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/jj6fjs9ind) |
| Habiganj | Adi Gopal Mistanna Bhandar | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/3dlh7p9fbi) |
| Satkhira | Jayhun Dairy Shop (Laboni Mor), Atar Ali's doi (Boro Bazar), Sushil Moyra | [Prothom Alo](https://www.prothomalo.com/bangladesh/p050vp928j) |
| Shariatpur | Haru Ghosh Mishtanno Bhandar (Palong Bazar) | [Prothom Alo (English)](https://en.prothomalo.com/bangladesh/local-news/giqxr3h9aw) |
| Sirajganj | Bholanath and Rani Mistanna Bhandar (Enayetpur, Chauhali) | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/l45uvwbeqp) |
| Naogaon | Sabbir Hotel and Restaurant (Atapatti, Dharmatala Road) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/life-living/news-547576) |
| Feni | Khondoler Patwary Misti Mela (Parshuram), khondol sweet | [The Financial Express](https://thefinancialexpress.com.bd/views/fenis-khondol-sweet-a-taste-of-tradition-1627031408) |
| Madaripur | Jibon Misthanna Bhandar (khirpuri, since 1930) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/life-living/food-recipe/news-668541) |
| Manikganj | Nizamer Mishti (Terashri Bazar, Ghior) | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/biyjxc7tkb) |
| Faridpur | Surjomukhi (Boalmari, para shondesh) | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/j5c2o96evk) |
| Munshiganj | Shree Durga Mistanna Bhandar (Haldia Bazar, Louhajong) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/news/bangladesh/news-3952376) |
| Brahmanbaria | Mahadev Mistanna Bhandar (chhanamukhi), Chunilal's Roshogolla (Sarail) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/life-living/food-recipe/news-673826), [The Daily Star (Bangla)](https://bangla.thedailystar.net/news/bangladesh/news-699001) |
| Jhalokati | Debnath, Nagen Ghosh, Gopal Ghosh, Naren Kuri, Muslim Mistanna Bhandar | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/v6bazog45s) |
| Gaibandha | Ramesh Sweets (Circular Road, since 1948), rasmanjuri | [The Daily Star (Bangla)](https://bangla.thedailystar.net/life-living/food-recipe/news-630421) |
| Pirojpur | Hotel Sotota (Press Club Road) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/news/bangladesh/news-472666) |
| Jhenaidah | Molla Hotel (Hamdaha bus stand, since 1968) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/life-living/travel/news-708296) |
| Khagrachhari | System Restaurant, Bamboo Shoot, Heritage Dine, Kalyani Restaurant | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/d8nmswa444) |
| Rangamati | Sunzuk Hotel and Restaurant (bamboo shoot dishes) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/life-living/food-recipe/news-681331) |
| Moulvibazar | Kutumbari Restaurant (Sreemangal) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/%E0%A6%86%E0%A6%A8%E0%A6%A8%E0%A7%8D%E0%A6%A6%E0%A6%A7%E0%A6%BE%E0%A6%B0%E0%A6%BE/%E0%A6%AD%E0%A7%8D%E0%A6%B0%E0%A6%AE%E0%A6%A3/%E0%A6%AD%E0%A7%8D%E0%A6%B0%E0%A6%AE%E0%A6%A3%E0%A7%87-%E0%A6%AD%E0%A7%8B%E0%A6%9C%E0%A6%A8-76527) |
| Patuakhali | Lebur Char (Kuakata, crab bhuna) | same Daily Star article as Moulvibazar |
| Natore | Joy Kali Mistanna Bhandar (Lalbazar); kacha golla source | [Prothom Alo](https://www.prothomalo.com/bangladesh/cwz6zjpax6) |
| Netrokona | Gayanath Mistanna Bhandar (Barhatta Road, balish mishti) | [Prothom Alo](https://www.prothomalo.com/lifestyle/recipe/%E0%A6%AC%E0%A6%BE%E0%A6%B2%E0%A6%BF%E0%A6%B6-%E0%A6%AE%E0%A6%BF%E0%A6%B7%E0%A7%8D%E0%A6%9F%E0%A6%BF%E0%A6%B0-%E0%A6%87%E0%A6%A4%E0%A6%BF%E0%A6%95%E0%A6%A5%E0%A6%BE) |
| Kushtia | New Special Bhai Bhai Tiler Khaja (Joynabad) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/news/bangladesh/news-415586) |
| Chattogram | Bose Brothers (Nandan Kanan Mor) | [The Daily Star (Bangla)](https://bangla.thedailystar.net/news/bangladesh/news-423231) |
| Rajshahi | Hoba Ghosh's Roshogolla (court area, since about 1937) | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/elnwbpz0eg) |
| Cox's Bazar | Pal Misti Bhandar (Harbang Bazar, Chakaria) | [Prothom Alo](https://www.prothomalo.com/bangladesh/district/2nd2vm1v8y) |

## Customer reviews

None are copied. Articles, Google Maps, Foodpanda and Facebook reviews belong to their authors and
platforms; reviews in Jelar Shad come only from people using the app (decision P5).

## Dhaka neighbourhoods, Khilgaon, Taltola, hill food, Gazipur (migrations 0064 and 0065)

Area names (Badda, Merul Badda, Rampura, Aftabnagar, Malibagh, Mouchak, Khilgaon, Savar, Ashulia, and about
fifty more Dhaka neighbourhoods and upazilas; Joydebpur, Tongi, Konabari, Kaliakair and others in Gazipur)
are place names only, so a contributor can add a shop under the right one. Nothing is claimed about food there.

| What | Source |
|---|---|
| Khilgaon: Pithaghar (pitha), Kachchi Bhai (kacchi), Delhi Darbar (kacchi, tehari, khichuri), Yangtze Kabab, Shahin Spicy Kabab | [Prothom Alo, Khilgaon](https://www.prothomalo.com/bangladesh/capital/5ophqgcwu2) |
| Taltola food street: Apon Coffee Shop (cold coffee), Tangail Chom Chom Ghor and Bakery (chom chom) | [The Business Standard, How a food street transformed Khilgaon-Taltola](https://www.tbsnews.net/features/panorama/how-food-street-transformed-face-khilgaon-taltola-702258) |
| Hill food: Larang (Malibagh), Jumghor (Merul Badda), Roaja (Uttara), Jaba (Farmgate) | [The Daily Star Bangla, from Uttara to Malibagh](https://bangla.thedailystar.net/life-living/food-recipe/news-3950581) |
| Gazipur famous for: shahi nashta, nakshi pitha, chapa shutki, Kaliganj kalojam | [tourbd.info, Gazipur district food](https://tourbd.info/gazipur-jelar-bikkhato-khabar/) (a travel site; it names no shop, so no Gazipur place is listed) |

Not listed on purpose: Savar, Ashulia, Rampura, Banasree, Aftabnagar, Mouchak and Gazipur shops. The only
places that name them are review and directory sites (ratings aggregators, delivery apps), which the
content rules exclude, and no newspaper article found names a shop there. Contributors add them in the app.

## Directory-listed places (migrations 0066 and 0067, decision T20)

The owner asked for the areas that newspapers do not cover (Savar, Banasree, Khilgaon, Uttara, Banani,
Gazipur). These rows keep only a name, an area and a kind of food from the listing's own area/address
field. No rating, review count, price, hour or address is stored. Cuisine tags on a listing are only used
where they match the place's own name (Chinese, pizza, kacchi, tehari).

| What | Source |
|---|---|
| Savar: Shiraj Chuigosto, Kacchi Bhai, Haji Nanna Biriyani, Alom Tehari Ghor, Kacchi Dine, PizzaClub (Thana Road, Talbag) | [BDPlaces, Restaurants in Savar](https://bdplaces.com/restaurants-in-savar/) |
| Banasree: Shiraj Chuigosto, El Cardo. Khilgaon and Taltola: Vooter Adda (Shahid Baki Road), Churrasco, Pasta Club | [BDPlaces, place pages for Khilgaon and Banasree](https://bdplaces.com/place/vooter-adda/), [El Cardo](https://bdplaces.com/place/el-cardo-banasree/), [Churrasco](https://bdplaces.com/place/churrasco/), [Pasta Club](https://bdplaces.com/place/pasta-club/) |
| Uttara: PizzaBurg, Izakaya, Foodies' Pond, Kala Bhuna and Kabab Nook, Takumi, Kacchi Darbar, Thai Emerald. Banani: Herfy | [BDPlaces, Restaurants in Uttara](https://bdplaces.com/restaurants-in-uttara/), [Restaurants in Banani](https://bdplaces.com/restaurants-in-banani/) |
| Gazipur (Joydebpur): Euro Bangla Chinese Restaurant | [BDPlaces, Restaurants in Gazipur](https://bdplaces.com/restaurants-in-gazipur/) |

Still not listed: Rampura, Aftabnagar, Mouchak, Badda and Malibagh shops other than the newspaper ones above;
no listing stated an area for them. Contributors add them in the app.

## Dhaka restaurants by area (migration 0068, decision T20)

Names, area and a kind of food only, from the listing site's own area pages and kind labels. Hotels, bars and places whose area the page does not state are left out. New foods added for common dishes: biryani, fried rice, chicken fry, buffet, burger, steak, momo, Korean, Italian, seafood, sandwich, Arabian, Turkish, continental, ice cream, Bangladeshi meal, chicken roast, mutton curry, noodles, grill, cafe.

| Area | Source |
| --- | --- |
| Dhanmondi, Gulshan, Mirpur, Uttara, Banani, Mohammadpur, Bashundhara, Old Dhaka (Lalbagh, Bangshal), Motijheel, Khilgaon (with Basabo, Malibagh, Tilpapara), Banasree, Mohakhali | [BDPlaces, Restaurants in Dhaka areas](https://bdplaces.com/restaurants-in-dhaka/) (area pages: dhanmondi, gulshan, mirpur, uttara, banani, mohammadpur, bashundhara, old-dhaka, motijheel, khilgaon, banasree, mohakhali) |

## More Dhaka places by area (migrations 0071 and 0072, decision T20)

Found for the areas the first directory had no page for (Tejgaon, Farmgate, Wari, Moghbazar, Baridhara, Pallabi, Shantinagar, Malibagh, Elephant Road). Name, area and kind of food only. Listings that name no kind of food were left out. Rampura, Badda, Aftabnagar, Jatrabari, Lalmatia and Shahbagh have no named place in any source found, so they stay empty.

| Places | Source |
| --- | --- |
| Hotel New Star & Kabab (Tejgaon); Vrinda's Kitchen, Cafe 99 (Farmgate); PizzaBurg, Swiss Bakery, Sub-Zero Icecream Parlour (Wari); New Dhaka Biriyani House, Mr Shawarma, Takeout (Moghbazar); Nabihah Restaurant, The Atrium (Baridhara); Milk & Cream, Posh Lounge Rooftop (Pallabi); Little Arabia (Shantinagar); Mr. Burger (Malibagh); Green House Restaurant (Elephant Road); PizzaBurg Dhanmondi; Sultan's Dine Gulshan | [DhakaEats neighbourhood pages](https://dhakaeats.com/neighbourhoods/) |
| Star Kabab branches: Thatari Bazar, Wari, Kawran Bazar, Farmgate, Banani, Elephant Road, Johnson Road | [Wikipedia, Star Kabab](https://en.wikipedia.org/wiki/Star_Kabab) |
