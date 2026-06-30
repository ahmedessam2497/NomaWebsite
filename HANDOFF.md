# NōMA Stays — Project Handoff

A working brief for anyone joining the project. Read this first.

## What this is
The marketing website for **NōMA Stays** (HAAM Management) — two brands, NōMA
(serviced buildings) and BEIT (boutique stays) — with real **Cloudbeds** booking
built in. It's a fast, hand-built static site (HTML/CSS/JS) plus a couple of small
serverless functions on Vercel. No framework, no build step.

- **Live site:** https://noma-website-steel.vercel.app  (custom domain `noma-stays.com` pending)
- **Code:** GitHub — `ahmedessam2497/NomaWebsite`
- **Hosting:** Vercel (auto-deploys on every push to `main`)

## How to work on it (workflow)
1. Edit files locally.
2. `git add -A` → `git commit -m "..."` → `git push`.
3. Vercel automatically builds and deploys within ~1 minute.
4. Hard-refresh (Ctrl+Shift+R) to bypass cached CSS/JS when checking changes.

> Tip: `chrome.js`, `site.css` and `tokens.css` are large. If you edit them with a
> tool/editor that has a size limit, confirm the file isn't truncated and has no
> stray null bytes before committing.

## File map
- `index.html` — homepage (hero + brand diptych + search).
- `noma.html` — NōMA brand + properties (Arabella, District 9).
- `beit.html` — BEIT brand + Beit Hend.
- `about.html` — company story + "Our people".
- `partner.html` — for property owners.
- `book.html` — full-page Cloudbeds booking (fallback; CTAs use the overlay instead).
- `chrome.js` — shared header, footer, mobile nav, back button, rotating heroes,
  photo lightbox, booking-overlay launcher, and the waitlist modal. Loaded on every page.
- `tokens.css` — design tokens (colors, fonts, type scale) + @font-face.
- `site.css` — all component styles.
- `api/rooms.js` — serverless: pulls live room types/photos from Cloudbeds.
- `api/waitlist.js` — serverless: forwards waitlist leads to a Google Sheet.
- `assets/` — images & fonts:
  - `hero-main/`, `hero-noma/`, `hero-beit/` — rotating hero photos (`1.jpg`, `2.jpg`…; auto-detected).
  - `rooms/` — local fallback room photos (live photos come from Cloudbeds).
  - `people/` — "Our people" photos (see its README; currently placeholders).
  - `fonts/` — Lineal + DecoType Naskh (self-hosted).

## Integrations & setup status
- **Cloudbeds booking overlay** — property code `q3dbO7`. All booking CTAs
  ("Book a stay", "Find a stay", "Check availability") open the same slide-in
  overlay. ⚠️ The live + preview domains must be in Cloudbeds → Booking Engine →
  **Whitelisted/Allowed Domains** for the overlay to render inline.
- **Live room content** (`/api/rooms`) — needs env var `CLOUDBEDS_API_KEY`
  (scopes `read:room`, `read:hotel`). Property is "NOMA New Cairo". See `CLOUDBEDS_SETUP.md`.
- **Waitlist → Google Sheet** (`/api/waitlist`) — BEIT / District 9 "Join the waitlist"
  buttons open a form that writes to a Google Sheet via Apps Script. Needs env var
  `WAITLIST_SHEET_URL`. Full steps in `WAITLIST_SETUP.md`.
- **Booking engine colors** — set in the Cloudbeds dashboard (Settings → Booking
  Engine → Customize), not in the code.

## Vercel environment variables
| Variable | Purpose |
|---|---|
| `CLOUDBEDS_API_KEY` | Live room photos/descriptions via `/api/rooms` |
| `WAITLIST_SHEET_URL` | Google Apps Script URL for waitlist leads |

(Env vars only apply to deployments created *after* they're added — redeploy.)

## Brand quick reference
- **Fonts:** Lineal (headlines/labels, uppercase), EB Garamond (body copy & buttons),
  DecoType Naskh (Arabic).
- **NōMA wordmark:** used as the logo image in headlines/standalone spots; written
  as plain text inside paragraphs. Files: `assets/noma-wordmark-maroon.png` (light bg),
  `…-cream.png` (dark bg).
- **Colors:** maroon `#4A1514`, terracotta `#92452B`, eggshell `#EFEAD6` / `#E8E2CA`,
  sky `#5E7FA6`. Full palette in `tokens.css`.

## Content you can update without touching code
- **Hero photos:** drop `1.jpg, 2.jpg, 3.jpg…` into `assets/hero-noma/` (or `-main`/`-beit`), push.
- **Room photos/descriptions:** managed in Cloudbeds — they appear automatically.
- **Our people photos:** drop the named files into `assets/people/` (see its README).

## Open items / next up
- [ ] Whitelist `noma-stays.com` + `www.` (and the Vercel domain) in Cloudbeds.
- [ ] Finish Cloudbeds env keys if not set in Vercel (`CLOUDBEDS_API_KEY`, `WAITLIST_SHEET_URL`).
- [ ] Complete the waitlist Google Sheet (Apps Script) per `WAITLIST_SETUP.md`.
- [ ] Upload real "Our people" photos to `assets/people/`.
- [ ] Upload real room photos in Cloudbeds for the 4 room types that have none.
- [ ] Point the `noma-stays.com` domain at Vercel.

## Reference docs in this repo
- `CLOUDBEDS_SETUP.md` — live room content setup.
- `WAITLIST_SETUP.md` — waitlist → Google Sheet setup.
- `README.md` — original project notes.
