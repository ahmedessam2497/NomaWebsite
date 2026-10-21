# Google reviews on the homepage

The homepage "What our guests say" section shows NōMA's live Google rating, review
count and up to 3 Google reviews. They come from `/api/reviews` (a Vercel function),
which calls the Google Places API (New) with a key that stays on the server.

Until the key is set, the section shows the Booking.com score and the 3 quotes that
are written into `index.html`, so nothing looks broken.

## One-time setup (about 10 minutes)
1. Go to https://console.cloud.google.com and create (or pick) a project.
2. Turn on billing for the project (Google requires it for the Places API).
3. APIs & Services → Library → enable **Places API (New)**.
4. APIs & Services → Credentials → **Create credentials → API key**.
5. Edit the key → API restrictions → **Restrict key** → tick only **Places API (New)** → Save.
6. Vercel → project `noma-website` → Settings → Environment Variables → add
   `GOOGLE_PLACES_API_KEY` = the key (Production and Preview).
7. Optional: add `GOOGLE_PLACE_ID` (starts with `ChIJ`). If you skip it, the function
   finds NōMA by name near the Arabella pin and writes the ID in the Vercel logs, so
   you can copy it in later.
8. Redeploy (Vercel → Deployments → ⋯ → Redeploy), then open
   https://noma-stays.com/api/reviews — it should show `"ok": true`.

## Good to know
- Google decides which 5 reviews the API returns; the site shows the first 3, unedited,
  with the reviewer's name and a "See all reviews on Google" link (Google requires this).
- Results are cached for 6 hours at Vercel's edge, so the API is called only a few times a day.
- Booking.com, Expedia and Airbnb don't offer a public reviews feed, so the Booking.com
  score next to Google is updated by hand in `index.html` (search for "9.7").
