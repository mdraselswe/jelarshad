# 12 — Gap report (2026-10-17)

What the app does today compared with `docs/01-product-spec.md`, and what is still missing for a good
public launch. Everything marked **checked** was read in the code or counted in the seed data on this
date. Items marked **judgement** are my reading of what users will expect; no competitor was
benchmarked and no real user was observed.

## 1. Numbers that matter (checked)

| What | Count |
| --- | --- |
| Seeded places | about 474 (382 in Dhaka, about 92 in the other 63 districts) |
| Districts with at least one place | 39 of 64; 25 have none |
| Largest non-Dhaka districts | Chattogram 9, Rajshahi 9, Bogura 8, Khulna 5, Mymensingh 5 |
| Chains grouped as brands | 28 brands covering about 75 places; the rest are single places |
| Analytics | `noop` adapter only |
| Error reporting | console adapter only |
| Service worker | installable only, caches nothing |

Decision P12 promised 10-15 districts with real depth. Today only Dhaka has it.

## 2. Gaps, most important first

### A. Before the public launch

1. **No usage measurement.** The analytics port exists but only a no-op adapter is wired. The success
   metrics in spec section 6 (searches per session, experiences per week, claims verified, shares)
   cannot be measured. A privacy-light option (page views and a handful of events) should be in place
   before the first invite goes out.
2. **No production error reporting.** Errors go to the console. A broken action in production would
   be invisible until someone complains.
3. **Content is thin outside Dhaka.** 25 districts show an empty "no place yet" page, and Dhaka areas
   such as Rampura, Badda, Aftabnagar, Jatrabari, Lalmatia and Shahbagh have no named place in any
   source found. Every place is "new" (no reactions), so the first visit shows no "community favourite"
   at all. Plan for this: either list only districts that have content on the home page, or make the
   empty page the main call to action ("be the first to tell us").
4. **Leaderboard starts empty.** People are off the board by default, so the new contributors page
   is empty on day one. Ask once, right after a person's first experience.

### B. Core product gaps (judgement, high value)

5. **Place page lacks the facts people look for:** a phone number (call button), website or Facebook
   page, opening hours (the field exists but nothing in the app fills it), and a list of what people
   said. The food page has "what people say"; the place page has no equivalent although experiences
   carry comments.
6. **No "near me".** Coordinates are not stored (`location` is always null) and the map is only an
   external link. For a "what shall I eat" app this is probably the most used question. Spec puts it
   at V1.5; it is worth scheduling soon.
7. **Browsing is search-only.** There is no index of foods, no index of districts or brands, no
   browsing by kind (Chinese, pizza, biryani, burger, cafe) although those foods now exist, no
   "popular this week", and no editorial lists ("Dhaka's old-town breakfast"). Search has type and
   price filters but no sort and no area filter.
8. **Contribution lifecycle is one-way.** A person cannot withdraw an experience, and photos can only be attached to the
   person's own experience (no "add a photo to this place" button); a place's owner of record cannot edit it directly (suggestions go to an admin queue).
9. **Chains and branches need tooling.** Branch grouping exists, but only about 75 places are grouped and
   every new branch needs a migration. There is no admin screen to attach a place to a brand, and no
   brand index page.

### C. Growth and retention (judgement)

10. **Google sign-in only.** Facebook login and phone OTP are listed as V2. Facebook groups are
    named as the launch channel, so people arriving from them will need Google to do anything.
11. **No way to bring people back.** No push, no email, no reminder for a streak, no invite link. The
    streak and missions need some form of return trigger to matter.
12. **No public profile.** Leaderboard names and photos lead nowhere. Spec lists public profile pages
    for V2.
13. **Slow-network behaviour is untested in the field.** The LCP budget is 4.0 s on CI. There is no
    offline cache, and real Bangladeshi mobile networks are slower and less steady than the CI
    profile.

### D. Operations and quality debt (checked unless noted)

14. **Every data fix is a migration plus a pull request.** Area names, duplicate places (Kacchi Bhai
    Khilgaon was seeded twice under two spellings), brand links and typos have no admin screen.
    Admin has queues for reports, claims, edits, places, fame and foods, but no bulk or free-edit tool.
15. **Seed names can go stale.** The directory listings used for the Dhaka seed may include places
    that closed. The verify flow is the only correction mechanism, and it needs visitors.
16. **Search quality has known soft spots.** Banglish and Bangla meet at a phonetic key, but the key
    does not always match ("khilgaon" and "খিলগাঁও" needed a looser match inside lists). There is no
    "did you mean" and no recent or popular searches.
17. **Bangla only.** Intended for the MVP; worth noting for tourists and expatriates (judgement).

## 3. Suggested order

| When | What | Why |
| --- | --- | --- |
| Before inviting anyone | Analytics, error reporting | Without them the soft launch teaches nothing |
| Before inviting anyone | Place page: phone, website/Facebook, comments, hours | The place page is the destination of most searches |
| Soft launch (weeks 1-2) | Leaderboard prompt after first experience; admin tool for brands, area names and duplicates | Cuts the migration-per-fix cost while feedback arrives |
| After feedback | Browse indexes (foods, brands, kinds); search sort and area filter | Discovery without typing |
| Next | Near-me with stored coordinates; Facebook login; return triggers | Largest effect on repeat use |
| Content in parallel | Founding contributors fill the empty Dhaka areas and 5 more districts | Data cannot be bought in; people must add it |

## 4. Not checked

- Real-device performance on a slow connection.
- Competitor features (Google Maps, delivery apps, Facebook groups) and how people use them today.
- Photo moderation behaviour beyond the flag queue.
- Any data in the production database beyond what the seed files contain.

## 5. Status (end of the day)

| # | Gap | Status |
| --- | --- | --- |
| 1 | No usage measurement | Done: first-party counts, `/admin/insights` (PR 101) |
| 2 | No error reporting | Done: server, action and browser errors in the same page (PR 101) |
| 3 | Thin content outside Dhaka | Partly: about 130 places in seven more districts and 24 more in Dhaka areas; areas with no source (Rampura, Badda, Aftabnagar, Jatrabari, Lalmatia, Shahbagh) stay empty until people add them |
| 4 | Leaderboard empty on day one | Done: asked once after the first experience (PR 103) |
| 5 | Place page facts | Done: phone, website or Facebook page, hours, what people say (PR 102) |
| 6 | No "near me" | Done by neighbourhood (centre points from OpenStreetMap for 103 of 173 neighbourhoods); exact distances to a door need coordinates people add (PR 112) |
| 7 | Search-only browsing | Done: foods, chains and districts index pages; sort by match, name or price; area chips (PRs 104, 105, 88, 89) |
| 8 | One-way contributions | Done: take back an experience, add a photo later, creators correct their own place (PRs 106, 107) |
| 9 | Chain tooling | Done: `/admin/manage` edits a place, its neighbourhood and its chain; chain index and pages (PRs 108, 87, 104) |
| 10 | Google only | Code done, off until the owner sets up the Facebook provider (PR 114) |
| 11 | No way to bring people back | Code done, off until the owner sets the key pair: evening streak reminders (PR 115) |
| 12 | No public profile | Done: `/people/<id>` for people on the list (PR 109) |
| 13 | Slow networks | Done: static files cached, visited pages open offline, offline page (PR 113); real-device testing still to do |
| 14 | Every data fix needs a migration | Done: `/admin/manage` (PR 108) |
| 15 | Seeds can go stale | Done: every place has a "still open?" fact to confirm (PR 111) |
| 16 | Search soft spots | Done: did-you-mean, popular and recent searches (PR 110) |
| 17 | Bangla only | Left on purpose: a per-visitor language needs locale routing and would touch every page; not started |
