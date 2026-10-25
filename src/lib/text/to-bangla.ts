// Latin → Bangla "phonetic" typing, in the style of Avro (the keyboard most people type Bangla with):
// "salad" → সালাদ, "kacchi" → কাচ্চি, "doi" → দই. It is a suggestion the person confirms or edits, never
// applied silently: Bangla spelling has more sounds than Latin letters, so some words need a fix.
//
// Lowercase is the common sound; a capital picks the other one, as in Avro (T ট, Th ঠ, D ড, Dh ঢ, N ণ).

type Token = { roman: string; bn: string };

// Longest match first.
const CONSONANTS: readonly Token[] = [
  { roman: "chh", bn: "ছ" },
  { roman: "Th", bn: "ঠ" },
  { roman: "Dh", bn: "ঢ" },
  { roman: "ch", bn: "চ" },
  { roman: "kh", bn: "খ" },
  { roman: "gh", bn: "ঘ" },
  { roman: "ng", bn: "ং" },
  { roman: "jh", bn: "ঝ" },
  { roman: "th", bn: "থ" },
  { roman: "dh", bn: "ধ" },
  { roman: "ph", bn: "ফ" },
  { roman: "bh", bn: "ভ" },
  { roman: "sh", bn: "শ" },
  { roman: "rh", bn: "ড়" },
  { roman: "T", bn: "ট" },
  { roman: "D", bn: "ড" },
  { roman: "N", bn: "ণ" },
  { roman: "S", bn: "ষ" },
  { roman: "c", bn: "চ" },
  { roman: "k", bn: "ক" },
  { roman: "q", bn: "ক" },
  { roman: "g", bn: "গ" },
  { roman: "j", bn: "জ" },
  { roman: "z", bn: "জ" },
  { roman: "t", bn: "ত" },
  { roman: "d", bn: "দ" },
  { roman: "n", bn: "ন" },
  { roman: "p", bn: "প" },
  { roman: "f", bn: "ফ" },
  { roman: "b", bn: "ব" },
  { roman: "v", bn: "ভ" },
  { roman: "m", bn: "ম" },
  { roman: "y", bn: "য়" },
  { roman: "r", bn: "র" },
  { roman: "l", bn: "ল" },
  { roman: "s", bn: "স" },
  { roman: "h", bn: "হ" },
  { roman: "w", bn: "ও" },
  { roman: "x", bn: "ক্স" },
];

// [roman, as a letter on its own, as a sign after a consonant]
const VOWELS: readonly (readonly [string, string, string])[] = [
  ["OI", "ঐ", "ৈ"],
  ["OU", "ঔ", "ৌ"],
  ["ee", "ঈ", "ী"],
  ["oo", "ঊ", "ূ"],
  ["aa", "আ", "া"],
  ["a", "আ", "া"],
  ["i", "ই", "ি"],
  ["u", "উ", "ু"],
  ["e", "এ", "ে"],
  ["I", "ঈ", "ী"],
  ["U", "ঊ", "ূ"],
];

const HASANTA = "্";

type Previous = "start" | "consonant" | "vowel";

function convertWord(word: string): string {
  let out = "";
  let previous: Previous = "start";
  let lastConsonant = "";
  let index = 0;
  while (index < word.length) {
    const rest = word.slice(index);

    // A lowercase "o" is the inherent sound: nothing after a consonant, "অ" at the start. The vowel
    // after it is a letter of its own ("doi" is দ + অ + ই = দই).
    if (rest.startsWith("o") && !rest.startsWith("oo")) {
      if (previous === "start") out += "অ";
      else if (previous === "vowel") out += "ও";
      previous = "vowel";
      lastConsonant = "";
      index += 1;
      continue;
    }

    const vowel = VOWELS.find(([roman]) => rest.startsWith(roman));
    if (vowel) {
      const [roman, letter, sign] = vowel;
      out += previous === "consonant" ? sign : letter;
      previous = "vowel";
      lastConsonant = "";
      index += roman.length;
      continue;
    }

    const consonant = CONSONANTS.find(({ roman }) => rest.startsWith(roman));
    if (consonant) {
      // Back-to-back consonants join into a conjunct (cc → চ্চ, st → স্ত); "ry" is "রিয়" in food names
      // (biryani), so a vowel sign goes in first.
      if (previous === "consonant") {
        if (consonant.bn === "য়" && lastConsonant === "র") out += "ি";
        else out += HASANTA;
      }
      out += consonant.bn;
      previous = "consonant";
      lastConsonant = consonant.bn;
      index += consonant.roman.length;
      continue;
    }

    out += word[index] ?? "";
    previous = "start";
    lastConsonant = "";
    index += 1;
  }
  return out;
}

const LATIN_ONLY = /^[\sA-Za-z'’.-]+$/;

/** True for text typed only in Latin letters (what we offer to turn into Bangla). */
export function isLatinText(input: string): boolean {
  return input.trim() !== "" && LATIN_ONLY.test(input);
}

/**
 * True for a name written in English rather than Bangla: it has a Latin letter and no Bangla one.
 * Unlike isLatinText it allows "&", digits and other signs ("Grill & Thrill", "Cafe 21").
 */
export function isEnglishName(input: string): boolean {
  return /[A-Za-z]/.test(input) && !/[ঀ-৿]/.test(input);
}

/** "salad" → "সালাদ". Words are converted one by one; anything that is not a Latin letter stays. */
export function latinToBangla(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .map((word) => convertWord(word.replace(/['’.-]/g, "")))
    .join(" ");
}
