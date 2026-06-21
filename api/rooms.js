/* ============================================================
   NōMA Stays — Cloudbeds room content proxy (Vercel serverless)
   GET /api/rooms  ->  normalized room types with photos + descriptions

   Why this exists:
   The Cloudbeds API key is a SECRET and must never ship in client-side
   JS. This function runs on the server, calls Cloudbeds with the key
   from an environment variable, and returns only safe, public content
   (room names, descriptions, photo URLs) to the browser.

   Required Vercel environment variable:
     CLOUDBEDS_API_KEY      e.g. cbat_xxxxxxxxxxxxxxxx   (scope: read:room, read:hotel)
   Optional:
     CLOUDBEDS_PROPERTY_ID  numeric property id, e.g. 312345
                            (NOT the booking-engine code q3dbO7).
                            If omitted, the first hotel on the key is used.

   The endpoint always responds 200. When it cannot return live data it
   responds { ok:false, ... } so the website silently keeps its local
   images instead of showing an error.
   ============================================================ */

var API_BASE = 'https://hotels.cloudbeds.com/api/v1.2';
var TTL_MS = 1000 * 60 * 30; // cache live data for 30 minutes
var cache = { at: 0, data: null };

async function cbGet(method, key) {
  var res = await fetch(API_BASE + '/' + method, {
    headers: { 'x-api-key': key, Accept: 'application/json' }
  });
  var json = {};
  try { json = await res.json(); } catch (e) { json = {}; }
  if (!res.ok || json.success === false) {
    var detail = json && (json.message || (json.errors && JSON.stringify(json.errors)));
    throw new Error('Cloudbeds ' + method + ' failed (' + res.status + ')' + (detail ? ': ' + detail : ''));
  }
  return json;
}

function stripHtml(s) {
  return String(s || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractPhotos(room) {
  var arr = room.roomTypePhotos || room.photos || room.images || [];
  if (!Array.isArray(arr)) arr = [];
  var urls = arr.map(function (p) {
    if (typeof p === 'string') return p;
    if (!p) return null;
    return p.image || p.url || p.large || p.original || p.thumb || p.thumbnail || null;
  });
  return urls.filter(Boolean);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  var key = process.env.CLOUDBEDS_API_KEY;
  if (!key) {
    res.status(200).json({ ok: false, configured: false, reason: 'CLOUDBEDS_API_KEY not set', rooms: [] });
    return;
  }

  if (cache.data && Date.now() - cache.at < TTL_MS) {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(cache.data);
    return;
  }

  try {
    var propertyID = process.env.CLOUDBEDS_PROPERTY_ID || '';
    var propertyName = '';

    if (!propertyID) {
      var hotels = await cbGet('getHotels', key);
      var first = (hotels.data && hotels.data[0]) || {};
      propertyID = first.propertyID || first.id || '';
      propertyName = first.propertyName || first.name || '';
    }

    var path = 'getRoomTypes' + (propertyID ? '?propertyIDs=' + encodeURIComponent(propertyID) : '');
    var rt = await cbGet(path, key);

    var rooms = (rt.data || []).map(function (r) {
      return {
        id: r.roomTypeID,
        name: r.roomTypeName || r.roomTypeNameShort || '',
        description: stripHtml(r.roomTypeDescription),
        maxGuests: r.maxGuests || null,
        photos: extractPhotos(r)
      };
    }).filter(function (r) { return r.name; });

    var out = { ok: true, configured: true, property: { id: propertyID, name: propertyName }, rooms: rooms };
    cache = { at: Date.now(), data: out };
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(out);
  } catch (e) {
    res.status(200).json({ ok: false, configured: true, reason: String((e && e.message) || e), rooms: [] });
  }
};
