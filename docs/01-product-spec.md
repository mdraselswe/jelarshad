# 01 — Product Spec (MVP)

## 1. Vision
**জেলার স্বাদ (Jelar Shad)** = Bangladesh's community-validated food map.
People add → people verify → people discover → better data → more people.

Core loop:
```
Search → Discover → Find place → Eat → React (😋/😐/👎) → Verify / Correct → Better data → More search
```

## 2. Principles
1. A first-time user understands the app in 10 seconds.
2. Any action takes at most 3 taps.
3. Buttons over typing. Typing is always optional.
4. Viewing never needs login. Acting (react, add, verify, save, report) needs Google login — asked at that moment.
5. Honest wording: "কমিউনিটির প্রিয়" not "সেরা"; "কমিউনিটি নিশ্চিত" not "Verified".
6. "Famous" ≠ "Best". RegionalFame is curated; rankings come from experiences.

## 3. MVP scope

### 3.1 Screens
| # | Route | Screen | Login |
|---|---|---|---|
| 1 | `/` | Home | No |
| 2 | `/search?q=` | Search results | No |
| 3 | `/food/[slug]` | Food page | No |
| 4 | `/place/[slug]` | Place page | No |
| 5 | `/district/[slug]` | District page | No |
| 6 | `/district/[slug]/[foodSlug]` | Food in district (SEO landing) | No |
| 7 | `/add` | Add (3-step) | Yes |
| 8 | `/me` | Profile + food passport (stamps, points) · contributions · tried · want to try | Yes |
| 9 | `/admin/*` | Moderation panel | Admin |
| 10 | `/dev/skeletons` | Skeleton parity page (dev only) | — |
| 11 | `/policy`, `/about` | Content policy, about + privacy | No |

Bottom navigation (mobile, floating): হোম · খুঁজুন · যোগ (primary pill) · আমি

### 3.2 Home
- Greeting + avatar (logged in) — title "আজ কী খাবেন?" — search box "খাবার, জেলা বা দোকানের নাম".
- `PassportCard` (logged in) or a "পাসপোর্ট শুরু করুন" invite card (guest).
- Section "কমিউনিটির প্রিয়" — grouped list of top dishes (min experiences threshold from config).
- Section "জেলা ধরে খুঁজুন" — horizontal chips (district + famous food).
- Section "সম্প্রতি যোগ হয়েছে" — newest places/dishes.

### 3.3 Search
- One box. Bangla, Banglish, typos all work (`kacchi`, `kachchi`, `kacci`, `কাচ্চি`, `কাচি`).
- Suggestions while typing (debounced 200ms), grouped: খাবার · জায়গা · জেলা.
- Results page tabs: সব · খাবার · জায়গা · জেলা.
- Filters (MVP): price range, place type. (Distance is V1.5.)

### 3.4 Food page (`/food/doi`)
Top → bottom:
1. Name, cover photo, "❤️ X% পছন্দ করেছেন · Y জন খেয়েছেন"
2. "যেসব জেলার সাথে বিখ্যাতভাবে যুক্ত" (RegionalFame chips)
3. 🏆 কমিউনিটির প্রিয় জায়গা — dishes ranked by Wilson score; below threshold show "এখনও পর্যাপ্ত অভিজ্ঞতা নেই" but still list
4. 💰 সাধারণ দাম ৳min–৳max · "শেষ নিশ্চিত: X দিন আগে"
5. 📸 মানুষের তোলা ছবি
6. 💬 মানুষ যা বলছেন (latest experiences with comments)
7. Short "কেন বিখ্যাত" text (admin-written)
8. Actions: "আমি খেয়েছি" · "খেতে চাই" · "শেয়ার"

### 3.5 Place page
1. Name, type badge (🍽️ রেস্টুরেন্ট / 🏪 দোকান / 🥘 স্ট্রিট ফুড / 🥯 বেকারি / 🏠 হোম কিচেন), area, district
2. "প্রথমবার? এগুলো অর্ডার করুন" — top 3 dishes by Wilson
3. All dishes with ❤️ % and price
4. Address + "ম্যাপে দেখুন" (external Google Maps directions link), opening hours, price range
5. Claim status badges + "তথ্য ঠিক আছে?" entry point
6. Actions: "আমি খেয়েছি" · "✏️ সংশোধন" · "রিপোর্ট" · "শেয়ার"

### 3.6 District page
- "এই জেলার সাথে বিখ্যাতভাবে যুক্ত": RegionalFame foods (curated).
- For each: where to get it (places with that dish in this district).
- Empty state: "কোথায় ভালো পাওয়া যায়, এখনও কেউ জানায়নি। আপনি কি কোনো জায়গা জানেন?" → `/add?district=…&food=…`
- Thin districts are `noindex` until they have at least `SEO.MIN_PLACES_TO_INDEX` places.

### 3.7 Add flow (3 steps, one screen each)
1. **কী খাবার?** — search-select existing Food or create new (name). Photo optional.
2. **কোথায়?** — search-select existing Place (duplicate check) or create: name, type, district → area dropdown, address text, optional map pin (lat/lng from a link or "আমার লোকেশন" button).
3. **কেমন লাগল?** — 😋 দারুণ / 😐 মোটামুটি / 👎 ভালো না. Optional: comment, price, photo (max 2).
Submit → creates Food/Place/Dish if new + Experience + initial Claims (availability, price if given).
Duplicate check: "আপনি কি এই জায়গার কথা বলছেন?" [হ্যাঁ, এটিই] [না, নতুন জায়গা].

### 3.8 Experience ("আমি খেয়েছি")
- One experience per user per dish (editable). Reaction required; comment/price/photo optional.
- After submit, inline micro-check: "দাম আর ঠিকানা কি এখনও ঠিক আছে? ✅ হ্যাঁ / ❌ বদলেছে".

### 3.9 Trust
- On place/dish: "তথ্য ঠিক আছে?" → ✅ ঠিক / ⚠️ আংশিক / ❌ ভুল
- If ⚠️/❌: pick reason chip — খাবার পাওয়া যায় না · দাম ভুল · জায়গা/ঠিকানা ভুল · জায়গা বন্ধ · অন্য কিছু — + optional note + optional evidence (photo or link).
- ✏️ সংশোধন: field, current value, proposed value → admin queue.
- Stale claims show inline "এই তথ্য কি এখনও ঠিক আছে?" one-tap confirm.
- Status badges: 🟢 কমিউনিটি নিশ্চিত · 🟡 মতভেদ আছে · 🔴 কমিউনিটি বলছে ভুল · ⏳ শেষ নিশ্চিত X দিন আগে.
- Report: ভুল তথ্য · বিভ্রান্তিকর · ভুল জায়গা · জায়গা বন্ধ · ভুয়া ছবি · আপত্তিকর · অন্য.

### 3.10 Ranking (display vs sort)
- Display: "❤️ X% পছন্দ করেছেন" where X = 😋 / total experiences.
- Sort: Wilson lower bound with positive = 😋, n = total (😐 counts as not-positive).
- "🏆 কমিউনিটির প্রিয়" badge only when n ≥ `RANKING.FAVORITE_MIN_EXPERIENCES`.
- Below `RANKING.MIN_EXPERIENCES_TO_RANK` items stay visible with "এখনও পর্যাপ্ত অভিজ্ঞতা নেই".

### 3.11 Profile (`/me`)
Tabs: আমার অবদান · খেয়েছি · খেতে চাই. Settings sheet: থিম (সিস্টেম / হালকা / গাঢ়), লগআউট.
The theme switcher also works for guests (stored on the device).

### 3.11b Gamification (MVP-light)
Built only from data we already collect (experiences, contributions, claim votes) — no extra tracking system.
- **Food passport**: a district is unlocked by the user's first experience at any place in that district.
  Shows `৭/৬৪`, division progress, stamps. Home shows the `PassportCard` with the next suggested stamp
  (a RegionalFame food in a locked district, nearest/popular first).
- **Stamps**: one per unlocked district (ink color + rotation fixed per district), dated by first experience.
  Special stamp **"আবিষ্কারক"** when the user is the first to add a place for a RegionalFame food.
- **Points** (`appConfig.points`): experience +10, new place +20, first place for a famous food +20 bonus,
  claim vote +5, accepted edit suggestion +15. Shown as a gold `+১০` toast. Points are never spent; they are a score.
- **Anti-farming**: points only for actions that pass rate limits; points from hidden/removed content are revoked;
  one experience per dish per user.
- **Levels** (decision P15): XP is the points total; `appConfig.gamification.levelThresholds` sets where each of the 8 levels starts; names in the message files (`level.1…8`).
- **Daily streak**: consecutive Bangladesh days with at least one earning action; a run that ended yesterday still counts until midnight, a missed day resets it, the best run is kept. No penalties.
- **Missions**: one daily and a few weekly goals (`appConfig.gamification.missions`), counted from actions already stored; the bonus XP is paid once per period (the points table refuses repeats).
- **Badges**: derived from counts (districts, best streak, experiences, places, discoveries), nothing stored.
- **Weekly board**: only people who opted in (settings on `/me`); shows display name and the XP of the week. Off by default.
- **V2**: local expert, public profile pages.

### 3.12 Share
Food, place, district and top-list pages: native share sheet (Web Share API) with copy-link fallback.
Every page has its own OG image card with Jelar Shad branding.

### 3.13 Admin
Queues: reports · disputed claims · edit suggestions · new places · duplicate candidates · flagged media.
Actions: approve/reject edit, merge duplicate places, hide content, ban user, edit RegionalFame.

## 4. Out of MVP (do not build)
- **V1.5:** nearby + distance filter, interactive Bangladesh map, trending, seasonal section, area pages, offline mode, trust weighting.
- **V2:** badges beyond stamps, local expert, leaderboards, polls, travel guide, roadside food, price history, push notifications, phone OTP, Facebook login.
- **V3:** AI assistant, personalization, owner portal, food awards, yearly wrap, monetization (requires moving off Vercel Hobby).

## 5. Launch content plan
- All 64 districts with 1–3 curated RegionalFame foods (with source note).
- 10–15 districts with places + dishes: Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Cumilla, Bogura, Tangail, Mymensingh, Barishal (+ optional Natore, Cox's Bazar, Chapainawabganj).
- 20–30 founding contributors (food bloggers / group admins).

## 6. Success metrics (first 90 days)
| Metric | Target |
|---|---|
| Weekly active users | growth week-over-week |
| % sessions that search | > 60% |
| Experiences per week | growth |
| % claims with ≥1 vote | > 30% |
| Shares per 100 sessions | > 3 |
| Lighthouse mobile (perf/SEO/a11y/best) | ≥ 95 each |
