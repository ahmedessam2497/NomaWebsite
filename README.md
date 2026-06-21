# NōMA Stays — website

Marketing + booking front-end for **NōMA Stays** (HAAM Management): two brands — NōMA (serviced
buildings) and BEIT (boutique stays). Static site, no framework, no build step.

## Run it locally

It's plain HTML/CSS/JS. Either:

- Open `index.html` directly in a browser, **or** (recommended, so fonts and relative paths behave)
- Serve the folder with any static server:
  - VS Code → "Live Server" extension, or
  - `python -m http.server` then visit `http://localhost:8000`

No npm install, no compile.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | The Group / homepage (two-brand diptych, search) |
| `noma.html` | NōMA brand + properties (Arabella, District 9) + room types |
| `beit.html` | BEIT brand + Beit Hend |
| `about.html` | HAAM story, mission/values, people, roadmap |
| `partner.html` | For property owners |
| `book.html` | Demo booking flow |

## Shared code

- **`tokens.css`** — design system: CSS variables for colour, typography, spacing, radius, shadow.
  Start here before changing any styling. Brand palette (maroon/eggshell/terracotta/sky/pistachio)
  and the type scale live here.
- **`site.css`** — component styles (buttons, cards, nav, footer, galleries, lightbox, cursor).
- **`chrome.js`** — injected on every page: builds the header + footer, currency toggle,
  rotating hero photos, the Ō cursor, and the photo lightbox. Pages just set
  `<body data-page="..." class="brand-noma|brand-beit">`.

## Fonts

Brand font is **Lineal** (Velvetyne, SIL Open Font License — see `assets/fonts/OFL.txt`),
self-hosted in `assets/fonts/` and declared via `@font-face` in `tokens.css`.
Lineal's named weights are non-standard (Thin = 200, Medium = 600), so the `@font-face`
rules use weight *ranges* to map CSS weights onto the four shipped faces.
EB Garamond (serif) and Amiri (Arabic) load from Google Fonts.

The logo wordmark is `assets/noma-wordmark-lower-{maroon,cream}.png` — set as "NōMA"
(only the *o* is lowercase, with the macron).

## Conventions worth knowing

- **Prices:** tag any element `<span data-egp="2400"></span>`. `chrome.js` formats it and
  re-renders on the EGP/USD toggle. Don't hard-code currency strings.
- **Property galleries:** `<div class="prop-gallery" data-prefix="arabella" data-count="10"
  data-gallery-title="NōMA Arabella">`. Clicking any tile opens the lightbox cycling all photos.
- **Room types:** `<div class="rt" data-prefix="arabella-studio" data-count="5"
  data-title="Studio · NōMA Arabella">`. Clicking opens that type's photos.
- **Photos** live in `assets/rooms/` as `<prefix>-<n>.jpg` (e.g. `arabella-1.jpg`,
  `arabella-studio-1.jpg`). **Missing files are skipped automatically**, so partial sets are fine.
  Full naming list: `assets/rooms/_PHOTO_MANIFEST.md`.

## Open items / next steps

- District 9 photos (`assets/rooms/district9-*.jpg`) — placeholders until the building is shot.
- Arabella room-type photo groupings are a first pass; re-sort per the real unit each photo shows.
- Booking flow in `book.html` is a front-end demo (no real payments/Cloudbeds integration yet).

## Image rights — important

Only use imagery that is **owned or properly licensed**. Do not add third-party press/archive
or celebrity photos (e.g. Getty, golden-age film stills) without a commercial licence — even
without a visible watermark they're copyrighted and carry publicity-rights risk on a live
commercial site.
