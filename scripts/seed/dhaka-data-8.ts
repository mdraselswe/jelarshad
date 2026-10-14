/**
 * Directory-listed places (migrations 0066 and 0067), added on the owner's explicit request
 * (decision T20): a name, an area and a kind of food, taken from the listing site's own address or
 * area field. No ratings, review counts, prices, hours or addresses are stored, and a place is only
 * here when the listing states where it is. Everything is flagged is_seed and the verify flow in the
 * app is how real people correct it. Sources in docs/content-sources.md.
 */
import type { DhakaSet } from "./dhaka-data";

type Place = DhakaSet["places"][number];

const dhaka = (
  slug: string,
  nameBn: string,
  nameEn: string,
  type: Place["type"],
  areaSlug: string,
  famousFor: string[],
): Place => ({ slug, nameBn, nameEn, district: "dhaka", type, area: areaSlug, famousFor });

export const DHAKA_SET_8: DhakaSet = {
  migration: "0066_seed_dhaka_8.sql",
  number: "0066",
  fameSortStart: 70,
  areas: [],
  foods: [
    {
      slug: "chinese",
      nameBn: "চাইনিজ",
      nameEn: "Chinese",
      aboutBn: "নুডলস, ফ্রাইড রাইস ও চিলি চিকেনের মতো বাংলাদেশি ধাঁচের চাইনিজ খাবার।",
      aliases: ["chinese food", "chaynij", "chainis", "চাইনিজ খাবার"],
    },
    {
      slug: "pizza",
      nameBn: "পিজ্জা",
      nameEn: "Pizza",
      aboutBn: "ময়দার রুটির ওপর চিজ ও টপিং দিয়ে সেঁকা ইতালীয় খাবার।",
      aliases: ["pizza", "pitza", "পিৎজা"],
    },
    {
      slug: "bbq",
      nameBn: "বারবিকিউ",
      nameEn: "Barbecue",
      aboutBn: "কয়লা বা গ্রিলে সেঁকা মাংস ও মাছ।",
      aliases: ["barbecue", "bbq", "grill", "বার-বি-কিউ", "গ্রিল"],
    },
    {
      slug: "fast-food",
      nameBn: "ফাস্ট ফুড",
      nameEn: "Fast Food",
      aboutBn: "বার্গার, স্যান্ডউইচ ও ফ্রাইয়ের মতো দ্রুত পাওয়া যায় এমন খাবার।",
      aliases: ["fastfood", "fast food", "burger", "বার্গার"],
    },
    {
      slug: "thai-food",
      nameBn: "থাই খাবার",
      nameEn: "Thai Food",
      aboutBn: "টক-ঝাল-মিষ্টির মিশ্রণে থাইল্যান্ডের স্যুপ, নুডলস ও কারি।",
      aliases: ["thai", "thai soup", "থাই"],
    },
    {
      slug: "japanese-food",
      nameBn: "জাপানিজ খাবার",
      nameEn: "Japanese Food",
      aboutBn: "সুশি, রামেন ও টেম্পুরার মতো জাপানি খাবার।",
      aliases: ["japanese", "sushi", "ramen", "জাপানিজ", "সুশি"],
    },
  ],
  places: [
    // সাভার
    dhaka("shiraj-chuigosto-savar", "শিরাজ চুইগোশত", "Shiraj Chuigosto", "restaurant", "savar", [
      "chui-jhal",
    ]),
    dhaka("kachchi-bhai-savar", "কাচ্চি ভাই সাভার", "Kachchi Bhai Savar", "restaurant", "savar", [
      "kacchi",
    ]),
    dhaka(
      "haji-nanna-biriyani-savar",
      "হাজী নান্না বিরিয়ানি",
      "Haji Nanna Biriyani",
      "restaurant",
      "savar",
      ["kacchi"],
    ),
    dhaka("alom-tehari-ghor-savar", "আলম তেহারি ঘর", "Alom Tehari Ghor", "restaurant", "savar", [
      "tehari",
    ]),
    dhaka("kacchi-dine-savar", "কাচ্চি ডাইন সাভার", "Kacchi Dine Savar", "restaurant", "savar", [
      "kacchi",
    ]),
    dhaka("pizzaclub-savar", "পিজ্জাক্লাব সাভার", "PizzaClub Savar", "restaurant", "savar", [
      "pizza",
    ]),
    // বনশ্রী
    dhaka(
      "shiraj-chuigosto-banasree",
      "শিরাজ চুইগোশত বনশ্রী",
      "Shiraj Chuigosto Banasree",
      "restaurant",
      "banasree",
      ["chui-jhal"],
    ),
    dhaka("el-cardo-banasree", "এল কার্ডো", "El Cardo", "restaurant", "banasree", ["fast-food"]),
    // খিলগাঁও ও তালতলা
    dhaka("vooter-adda-taltola", "ভূতের আড্ডা", "Vooter Adda", "restaurant", "taltola", [
      "chinese",
    ]),
    dhaka("churrasco-khilgaon", "চুরাসকো", "Churrasco", "restaurant", "khilgaon", ["bbq"]),
    dhaka("pasta-club-khilgaon", "পাস্তা ক্লাব", "Pasta Club", "restaurant", "khilgaon", ["pizza"]),
    // উত্তরা
    dhaka("pizzaburg-uttara", "পিজ্জাবার্গ উত্তরা", "PizzaBurg Uttara", "restaurant", "uttara", [
      "pizza",
    ]),
    dhaka("izakaya-uttara", "ইজাকায়া উত্তরা", "Izakaya Uttara", "restaurant", "uttara", [
      "japanese-food",
    ]),
    dhaka(
      "foodies-pond-uttara",
      "ফুডিজ পন্ড রেস্টুরেন্ট",
      "Foodies' Pond Restaurant",
      "restaurant",
      "uttara",
      ["chinese"],
    ),
    dhaka(
      "kala-bhuna-kabab-nook-uttara",
      "কালা ভুনা অ্যান্ড কাবাব নুক",
      "Kala Bhuna & Kabab Nook",
      "restaurant",
      "uttara",
      ["kabab"],
    ),
    dhaka(
      "takumi-uttara",
      "তাকুমি জাপানিজ রেস্টুরেন্ট উত্তরা",
      "Takumi Japanese Restaurant Uttara",
      "restaurant",
      "uttara",
      ["japanese-food"],
    ),
    dhaka(
      "kacchi-darbar-uttara",
      "কাচ্চি দরবার উত্তরা",
      "Kacchi Darbar Uttara",
      "restaurant",
      "uttara",
      ["kacchi"],
    ),
    dhaka(
      "thai-emerald-uttara",
      "থাই এমারেল্ড উত্তরা",
      "Thai Emerald Uttara",
      "restaurant",
      "uttara",
      ["thai-food"],
    ),
    // বনানী
    dhaka("herfy-banani", "হারফি বনানী", "Herfy Banani", "restaurant", "banani", ["fast-food"]),
  ],
  existingAreas: [],
  existingDishes: [],
  fame: [],
  fameSources: [],
};

export const GAZIPUR_SET_2: DhakaSet = {
  migration: "0067_seed_gazipur_2.sql",
  number: "0067",
  districtSlug: "gazipur",
  fameSortStart: 210,
  areas: [],
  foods: [],
  places: [
    {
      slug: "euro-bangla-chinese-joydebpur",
      nameBn: "ইউরো বাংলা চাইনিজ রেস্টুরেন্ট",
      nameEn: "Euro Bangla Chinese Restaurant",
      district: "gazipur",
      type: "restaurant",
      area: "joydebpur",
      famousFor: ["chinese"],
    },
  ],
  existingAreas: [],
  existingDishes: [],
  fame: [],
  fameSources: [],
};
