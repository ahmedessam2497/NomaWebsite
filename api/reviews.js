/* ============================================================
   NōMA Stays — Google reviews proxy (Vercel serverless)
   GET /api/reviews  ->  { ok, rating, count, url, reviews:[...] }

   Pulls NōMA's live Google rating, review count and up to 5 reviews
   (Google chooses which) from the Google Places API (New). The API key
   is a SECRET: it stays on the server, never in the browser.

   Required Vercel environment variable:
     GOOGLE_PLACES_API_KEY   a Google Cloud key with "Places API (New)"
                             enabled (restrict it to that API).
   Optional:
     GOOGLE_PLACE_ID         NōMA's Place ID (starts with "ChIJ").
                             If omitted, it is looked up once by name
                             near the Arabella pin and logged.

   Always responds 200. { ok:false } means "keep the reviews already on
   the page" — the website never shows an error to guests.
   Responses are cached at Vercel's edge for 6 hours to keep API costs low.
   ============================================================ */

var BASE = 'https://places.googleapis.com/v1';
var PIN = { latitude: 29.9880527, longitude: 31.4303714 };
var TTL_MS = 1000 * 60 * 60 * 6;
var cache = { at: 0, data: null, placeId: null };

async function gfetch(url, key, fields, body) {
  var res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: Object.assign({ 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': fields },
      body ? { 'Content-Type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined
  });
  var json = {};
  try { json = await res.json(); } catch (e) { json = {}; }
  if (!res.ok) throw new Error('Google ' + res.status + ': ' + ((json.error && json.error.message) || 'request failed'));
  return json;
}

async function findPlaceId(key) {
  var j = await gfetch(BASE + '/places:searchText', key, 'places.id,places.displayName,places.formattedAddress', {
    textQuery: 'NOMA serviced accommodation New Cairo',
    locationBias: { circle: { center: PIN, radius: 400 } },
    maxResultCount: 3
  });
  var p = (j.places || [])[0];
  if (!p) throw new Error('Place not found');
  console.log('[reviews] Resolved GOOGLE_PLACE_ID =', p.id, '(' + (p.displayName && p.displayName.text) + ', ' + p.formattedAddress + ')');
  return p.id;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    res.status(200).json({ ok: false, configured: false, reason: 'GOOGLE_PLACES_API_KEY not set', reviews: [] });
    return;
  }
  if (cache.data && Date.now() - cache.at < TTL_MS) {
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    res.status(200).json(cache.data);
    return;
  }
  try {
    var placeId = process.env.GOOGLE_PLACE_ID || cache.placeId || await findPlaceId(key);
    cache.placeId = placeId;
    var p = await gfetch(BASE + '/places/' + encodeURIComponent(placeId) + '?languageCode=en', key,
      'displayName,rating,userRatingCount,googleMapsUri,reviews');
    var reviews = (p.reviews || []).map(function (r) {
      var a = r.authorAttribution || {};
      return {
        rating: r.rating || null,
        text: (r.text && r.text.text) || (r.originalText && r.originalText.text) || '',
        when: r.relativePublishTimeDescription || '',
        time: r.publishTime || '',
        author: a.displayName || 'Google user',
        authorUrl: a.uri || '',
        authorPhoto: a.photoUri || '',
        url: r.googleMapsUri || ''
      };
    }).filter(function (r) { return r.text; });
    var out = {
      ok: true, configured: true,
      name: (p.displayName && p.displayName.text) || 'NōMA',
      rating: p.rating || null, count: p.userRatingCount || 0,
      url: p.googleMapsUri || 'https://maps.google.com/?cid=15635143835366761898',
      reviews: reviews
    };
    cache = { at: Date.now(), data: out, placeId: placeId };
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    res.status(200).json(out);
  } catch (e) {
    res.status(200).json({ ok: false, configured: true, reason: String((e && e.message) || e), reviews: [] });
  }
};
