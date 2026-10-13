# Approved screen designs

Source of truth for how MVP screens look. Live canvas: Claude artifact "জেলার স্বাদ স্ক্রিন ডিজাইন".
These `.dc.html` files are design markup (inline styles + a small logic script), **not** production code.
Read them for layout, spacing, sizes, colors, copy and motion; rebuild them with our components,
Tailwind tokens and i18n as described in `docs/06-design-system.md`.

| File | Screen | Notes |
|---|---|---|
| `C-Home.dc.html` | Home | Greeting, search, PassportCard (ring + mini stamps + next stamp), favorites, district chips, floating nav |
| `C-Food.dc.html` | Food page | Interactive reaction picker → pop + reward toast |
| `C-Place.dc.html` | Place page + verify sheet | Status chips, "প্রথমবার? এগুলো অর্ডার করুন", segmented ✅/⚠️/❌, reason chips |
| `C-Passport.dc.html` | Profile / food passport | Gold ring, stats, division tiles, rubber-stamp SVGs, next achievement |
| `C-Search.dc.html` | Search results | Segmented tabs, filter chips, grouped results |
| `C-District.dc.html` | District page | Curated "famous for", empty state invitation with +২০ |
| `C-Add.dc.html` | Add flow (3 steps + success) | Step progress, duplicate check, reaction, discoverer stamp |
| `C-Skeleton.dc.html` | Food page skeleton | Exact layout match for the loading state |

Placeholders like `[দোকানের নাম]` and sample numbers are not real data.

## Desktop and tablet (approved 2026-10-08)

`docs/design/desktop/` holds the approved wide layouts: Home, Food, Place (with the verify panel), District,
Search, Add, Me/Passport at 1440px, and Home and Food at 834px (tablet). Same tokens, fonts and components as the
mobile screens; the differences are layout only:

- Below 768px: the mobile screens above, unchanged.
- 768 to 1023px (tablet): same floating bottom nav, 28px gutter, two-column grids.
- 1024px and up (desktop): top bar (logo, search, links, primary "যোগ") replaces the bottom nav and mobile header;
  1200px content, 32px gutter; breadcrumb instead of the back button; Food and Place use a 8/4 and 7/5 column split;
  Search keeps filters beside the results; the verify sheet becomes a side panel.

The first built version (task 2.8) covers the read pages that exist today. Streak, points, avatar, passport card,
reaction picker, verify panel and the add flow arrive with Phases 3-5 and follow these files.

## The colorful canvas (approved 2026-10-12, built through #72-#73)

The live canvas "জেলার স্বাদ — লাইভ গেমিফাইড ডিজাইন" replaces the older `C-*.dc.html` look for phones. Its boards are
Main (home), Passport, Reward (the reward moment), Food, District, Search, Desktop and Kit (sections, illustrations,
icons, motion). What follows from it in the code:

- Bottom bar: five items, the gold "যোগ" button raised in the middle; passport (`/me`) and profile (`/me/profile`)
  are separate tabs.
- Hero bands per page: home violet, food orange-to-pink with a floating pot, district deep blue with the region and
  pins, search violet with the white field, place pink-violet with a floating plate.
- White panels with 32px radius on the dotted ground; tinted bands (teal, warm, mint, night) with a wave on top;
  48px rank tiles; kind tiles with light-to-strong gradients.
- Not built on purpose: the "nearby" map band on the food page (no location feature exists) and the notification bell
  on home (no notifications exist). The district tagline is the list of its famous foods.
