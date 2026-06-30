# CLAUDE.md — NōMA Stays website

Context for an AI assistant (Claude) helping edit this project. If you're opening
this repo in Cowork or Claude Code, this file is read automatically. Read it fully
before making changes.

## What this is
The marketing website for **NōMA Stays** (HAAM Management): two brands — **NōMA**
(serviced buildings) and **BEIT** (boutique stays) — with live **Cloudbeds** booking.
It is a hand-built **static site** (plain HTML/CSS/JS, no framework, no build step)
plus two small **Vercel serverless functions** in `/api`.

- Live: https://noma-website-steel.vercel.app  (domain `noma-stays.com` pending)
- GitHub: `ahmedessam2497/NomaWebsite`
- Hosting: Vercel — **auto-deploys on every push to `main`** (~1 min).

## Workflow
Edit files → `git add -A` → `git commit -m "..."` → `git push` → Vercel deploys.
Hard-refresh (Ctrl+Shift+R) when checking, to bypass cached CSS/JS.

## ⚠️ CRITICAL editing rules (read before touching JS/CSS)
`chrome.js`, `site.css`, and `tokens.css` are large (>10 KB). Some editors/agent
tools silently **truncate** large files on a full-file write and can leave **null
bytes** — this has corrupted these files before. To stay safe:

1. Prefer **small, targeted edits**. For big rewrites of `chrome.js`, write it in
   chunks via shell append (`cat >> file <<'EOF' … EOF`) rather than one giant write.
2. After editing any of these files, **verify**:
   - JS valid: `node --check chrome.js` (and `api/*.js`).
   - No null bytes: `tr -cd '\000' < file | wc -c` should print `0`.
   - File isn't cut short (check it ends with the proper closing braces / `</html>`).
3. The HTML files have been cleaned of null bytes — keep them clean.
4. Never commit a file you haven't verified opens/parses.

## File map
- `index.html` homepage · `noma.html` · `beit.html` · `about.html` · `partner.html`
- `book.html` — full-page Cloudbeds booking (fallback only; CTAs use the overlay)
- `chrome.js` — shared on every page: header, footer, mobile hamburger nav, back
  button, rotating hero photos, photo lightbox, **booking-overlay launcher**
  (`window.NOMA_BOOK`), and the **waitlist modal** (`window.NOMA_WAITLIST`).
- `tokens.css` — design tokens (color/font/type vars) + `@font-face`.
- `site.css` — all component styles.
- `api/rooms.js` — returns live Cloudbeds room types/photos/descriptions.
- `api/waitlist.js` — forwards waitlist leads to a Google Sheet.
- `assets/hero-main|hero-noma|hero-beit/` — hero photos `1.jpg,2.jpg…` (auto-detected,
  also accepts .jpeg/.png/.webp; numbering must be consecutive from 1).
- `assets/rooms/` — local fallback room photos (live ones come from Cloudbeds).
- `assets/people/` — "Our people" photos (placeholders until uploaded; see its README).
- `assets/fonts/` — Lineal + DecoType Naskh (self-hosted).
- `assets/noma-wordmark-*.png` — brand wordmark logos.

## Integrations
- **Booking overlay** — Cloudbeds Immersive Experience 2.0, property code `q3dbO7`.
  Every booking CTA opens the same slide-in overlay via the `<cb-book-now-button>`
  web component / `window.NOMA_BOOK(params)`. The Cloudbeds script is in each page's
  `<head>`. The site's live + preview domains must be **whitelisted in Cloudbeds**
  (Booking Engine → Allowed Domains) or the overlay opens in a new tab instead.
- **Live rooms** `/api/rooms` — needs Vercel env `CLOUDBEDS_API_KEY` (scopes
  `read:room`, `read:hotel`). On `noma.html`, the `[data-cb-roomtypes]` grid and the
  `[data-cb-gallery]` gallery are rebuilt from this. Degrades to local images if absent.
  Details: `CLOUDBEDS_SETUP.md`.
- **Waitlist → Google Sheet** `/api/waitlist` — needs Vercel env `WAITLIST_SHEET_URL`
  (a Google Apps Script web-app URL). Triggered by `[data-waitlist]` buttons.
  Details + Apps Script code: `WAITLIST_SETUP.md`.
- **Booking engine colors** are set in the Cloudbeds dashboard, not the code.

Vercel env vars: `CLOUDBEDS_API_KEY`, `WAITLIST_SHEET_URL`. They apply only to
deployments created after they're added (redeploy after changing).

## Brand rules
- **Fonts:** Lineal = headlines & uppercase labels; EB Garamond = lowercase body
  copy and buttons (buttons are sentence-case, not uppercase); DecoType Naskh = Arabic
  (via the `--font-arabic` token / `.ar`, `.ar-display` classes).
- **NōMA name:** render as the **wordmark logo image** in headlines and standalone
  spots (class `noma-wm`; maroon `assets/noma-wordmark-maroon.png` on light backgrounds,
  cream `…-cream.png` on dark). Inside **paragraphs, keep it as plain text "NōMA"**.
  BEIT keeps its serif-italic text treatment (no logo).
- **Colors:** maroon `#4A1514`, terracotta `#92452B`, eggshell `#EFEAD6`/`#E8E2CA`,
  sky `#5E7FA6`. Full palette in `tokens.css`.

## Common content tasks (no code needed)
- New hero photos → drop `1.jpg, 2.jpg…` in `assets/hero-noma/` (or `-main`/`-beit`), push.
- Room photos/descriptions → managed in Cloudbeds; appear automatically.
- "Our people" photos → drop named files in `assets/people/` (see its README), push.

## Open items
- Whitelist `noma-stays.com` (+ `www.`) and the Vercel domain in Cloudbeds.
- Confirm `CLOUDBEDS_API_KEY` and `WAITLIST_SHEET_URL` are set in Vercel.
- Finish the waitlist Google Sheet (Apps Script) — see `WAITLIST_SETUP.md`.
- Upload real "Our people" photos and the remaining Cloudbeds room photos.
- Connect the `noma-stays.com` domain to Vercel.

## Other docs
`HANDOFF.md` (human overview), `CLOUDBEDS_SETUP.md`, `WAITLIST_SETUP.md`, `README.md`.
