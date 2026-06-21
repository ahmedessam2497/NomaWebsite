# NōMA Stays — Cloudbeds live room content

The website pulls **room photos + descriptions** straight from Cloudbeds at
runtime. Photos are the real ones in your Cloudbeds account — update them there
and they update on the site (within 30 min cache).

## How it works

- `api/rooms.js` is a **Vercel serverless function** (`/api/rooms`). It calls the
  Cloudbeds API using a secret key stored as an environment variable, and returns
  only safe public content (room names, descriptions, photo URLs).
- `chrome.js` fetches `/api/rooms` on page load and fills in:
  - room-type cards on `noma.html` (tagged `data-cb-room="..."`)
  - the Arabella photo gallery (tagged `data-cb-gallery`)
- If the key isn't set or the API fails, the site **silently keeps the local
  images** in `assets/rooms/`. Nothing breaks.

## One-time setup

### 1. Get a Cloudbeds API key
In Cloudbeds: **Account → Apps & Marketplace → API Credentials → + New Credentials**,
then create an **API Key** with scopes **`read:room`** and **`read:hotel`**.
Copy the key (looks like `cbat_xxxxxxxx`) — it's shown only once.

### 2. Add it to Vercel
Vercel project → **Settings → Environment Variables**, add:

| Name | Value | Notes |
|---|---|---|
| `CLOUDBEDS_API_KEY` | `cbat_…` your key | **required** |
| `CLOUDBEDS_PROPERTY_ID` | numeric property id | optional; if omitted the first property on the key is used |

> `CLOUDBEDS_PROPERTY_ID` is the **numeric** property id, NOT the booking-engine
> code `q3dbO7`. If you don't know it, leave it blank — the function auto-detects
> the first hotel. To pin it later, call `getHotels` once and read `propertyID`.

### 3. Redeploy
Trigger a redeploy (or just push). Done.

## Mapping room names
The room-type cards match Cloudbeds room types **by name** (case/spacing
insensitive). The page currently expects: Studio, Studio with Balcony,
Deluxe Studio, One-Bedroom, One-Bedroom with Balcony, Deluxe One-Bedroom.
If your Cloudbeds names differ, either rename them in Cloudbeds or change the
`data-cb-room="..."` value on the matching card in `noma.html`.

## Still required (separate from this)
Add your domains to **Cloudbeds → Booking Engine → Whitelisted Domains** so the
booking overlay renders inline instead of opening a new tab:
`noma-website-steel.vercel.app` and `noma-stays.com` (and `www.` if used).
