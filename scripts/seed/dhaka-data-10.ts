/**
 * More Dhaka places by area (migration 0071), found for the areas the first directory had no page
 * for: a name, an area and a kind of food, from DhakaEats' neighbourhood pages and Star Kabab's
 * branch list on Wikipedia (decision T20). Only places whose listing names the area are here; no
 * ratings, review counts, prices, hours or addresses are stored. Flagged is_seed. Sources are in
 * docs/content-sources.md.
 */
import type { DhakaSet } from "./dhaka-data";

type Place = DhakaSet["places"][number];
type Row = [
  slug: string,
  nameBn: string,
  nameEn: string,
  area: string,
  foods: string[],
  type?: Place["type"],
];

const BD = "bangladeshi-meal";

const rows: Row[] = [
  // তেজগাঁও
  [
    "hotel-new-star-and-kabab-tejgaon",
    "হোটেল নিউ স্টার অ্যান্ড কাবাব",
    "Hotel New Star & Kabab",
    "tejgaon",
    [BD, "kabab"],
  ],
  // ফার্মগেট
  [
    "vrindas-kitchen-farmgate",
    "বৃন্দাস কিচেন ফার্মগেট",
    "Vrinda's Kitchen Farmgate",
    "farmgate",
    [BD],
  ],
  [
    "cafe-ninety-nine-farmgate",
    "ক্যাফে ৯৯ ফার্মগেট",
    "Cafe 99 Farmgate",
    "farmgate",
    ["cafe-snacks"],
  ],
  // ওয়ারী
  ["pizzaburg-wari", "পিজ্জাবার্গ ওয়ারী", "PizzaBurg Wari", "wari", ["pizza", "burger"]],
  [
    "swiss-bakery-wari",
    "সুইস বেকারি ওয়ারী",
    "Swiss Bakery Wari",
    "wari",
    ["cafe-snacks"],
    "bakery",
  ],
  [
    "sub-zero-icecream-parlour-wari",
    "সাব-জিরো আইসক্রিম পার্লার ওয়ারী",
    "Sub-Zero Icecream Parlour Wari",
    "wari",
    ["ice-cream"],
    "shop",
  ],
  // মগবাজার
  [
    "new-dhaka-biriyani-house-moghbazar",
    "নিউ ঢাকা বিরিয়ানি হাউজ মগবাজার",
    "New Dhaka Biriyani House Moghbazar",
    "moghbazar",
    ["biryani"],
  ],
  [
    "mr-shawarma-moghbazar",
    "মিস্টার শাওয়ার্মা মগবাজার",
    "Mr Shawarma Moghbazar",
    "moghbazar",
    ["shawarma"],
  ],
  ["takeout-moghbazar", "টেকআউট মগবাজার", "Takeout Moghbazar", "moghbazar", ["fast-food"]],
  // বারিধারা
  [
    "nabihah-restaurant-baridhara",
    "নাবিহা রেস্টুরেন্ট অ্যান্ড ক্যাফে বারিধারা",
    "Nabihah Restaurant N Cafe Baridhara",
    "baridhara",
    ["cafe-snacks"],
  ],
  [
    "atrium-restaurant-baridhara",
    "দ্য অ্যাট্রিয়াম রেস্টুরেন্ট বারিধারা",
    "The Atrium Restaurant Baridhara",
    "baridhara",
    ["thai-food"],
  ],
  // পল্লবী
  [
    "milk-and-cream-pallabi",
    "মিল্ক অ্যান্ড ক্রিম পল্লবী",
    "Milk & Cream BD Pallabi",
    "pallabi",
    ["ice-cream"],
    "shop",
  ],
  [
    "posh-lounge-rooftop-pallabi",
    "পোশ লাউঞ্জ রুফটপ পল্লবী",
    "Posh Lounge Rooftop Pallabi",
    "pallabi",
    ["thai-food"],
  ],
  // শান্তিনগর
  [
    "little-arabia-shantinagar",
    "লিটল আরাবিয়া শান্তিনগর",
    "Little Arabia Restaurant Shantinagar",
    "shantinagar",
    ["arabian-food"],
  ],
  // মালিবাগ
  ["mr-burger-malibagh", "মিস্টার বার্গার মালিবাগ", "Mr. Burger Malibagh", "malibagh", ["burger"]],
  // এলিফ্যান্ট রোড
  [
    "green-house-restaurant-elephant-road",
    "গ্রিন হাউস রেস্টুরেন্ট এলিফ্যান্ট রোড",
    "Green House Restaurant Elephant Road",
    "elephant-road",
    ["chinese"],
  ],
  // ধানমন্ডি ও গুলশান: চেইনের আরও শাখা
  [
    "pizzaburg-dhanmondi",
    "পিজ্জাবার্গ ধানমন্ডি",
    "PizzaBurg Dhanmondi",
    "dhanmondi",
    ["pizza", "burger"],
  ],
  ["sultans-dine-gulshan", "সুলতানস ডাইন গুলশান", "Sultan's Dine Gulshan", "gulshan", ["kacchi"]],
  // স্টার কাবাব: উইকিপিডিয়ার শাখা-তালিকা
  [
    "star-kabab-thatari-bazar",
    "স্টার কাবাব ঠাটারী বাজার",
    "Star Kabab Thatari Bazar",
    "thatari-bazar",
    ["kabab"],
  ],
  ["star-kabab-wari", "স্টার কাবাব ওয়ারী", "Star Kabab Wari", "wari", ["kabab"]],
  [
    "star-kabab-karwan-bazar",
    "স্টার কাবাব কারওয়ান বাজার",
    "Star Kabab Karwan Bazar",
    "karwan-bazar",
    ["kabab"],
  ],
  ["star-kabab-farmgate", "স্টার কাবাব ফার্মগেট", "Star Kabab Farmgate", "farmgate", ["kabab"]],
  ["star-kabab-banani", "স্টার কাবাব বনানী", "Star Kabab Banani", "banani", ["kabab"]],
  [
    "star-kabab-elephant-road",
    "স্টার কাবাব এলিফ্যান্ট রোড",
    "Star Kabab Elephant Road",
    "elephant-road",
    ["kabab"],
  ],
  [
    "star-kabab-johnson-road",
    "স্টার কাবাব জনসন রোড",
    "Star Kabab Johnson Road",
    "johnson-road",
    ["kabab"],
  ],
];

export const DHAKA_SET_10: DhakaSet = {
  migration: "0071_seed_dhaka_10.sql",
  number: "0071",
  fameSortStart: 400,
  areas: [],
  foods: [],
  places: rows.map(([slug, nameBn, nameEn, area, famousFor, type]) => ({
    slug,
    nameBn,
    nameEn,
    district: "dhaka",
    type: type ?? "restaurant",
    area,
    famousFor,
  })),
  existingAreas: [],
  existingDishes: [],
  fame: [],
  fameSources: [],
};
