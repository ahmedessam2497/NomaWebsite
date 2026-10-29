/* ============================================================
   NōMA Stays — Cloudbeds room content proxy (Vercel serverless)
   GET /api/rooms  ->  normalized room types with photos + descriptions

   Why this exists:
   The Cloudbeds API key is a SECRET and must never ship in client-side
   JS. This function runs on the server, calls Cloudbeds with the key
   from an environment variable, and returns only safe, public content
   (room names, descriptions, photo URLs) to the browser.

   Two locations, one key each (Cloudbeds keys are per property):
     GET /api/rooms                        -> NōMA New Cairo  (booking code q3dbO7)
     GET /api/rooms?location=mohandessin   -> NōMA Mohandessin (booking code Av8AgC)

   Vercel environment variables:
     CLOUDBEDS_API_KEY              New Cairo key, e.g. cbat_xxxx (scopes read:room, read:hotel)
     CLOUDBEDS_API_KEY_MOHANDSEEN   Mohandessin key (CLOUDBEDS_API_KEY_MOHANDESSIN also accepted)
   Optional:
     CLOUDBEDS_PROPERTY_ID / CLOUDBEDS_PROPERTY_ID_MOHANDSEEN
                            numeric property id, e.g. 312345
                            (NOT the booking-engine code).
                            If omitted, the first hotel on the key is used.

   The endpoint always responds 200. When it cannot return live data it
   responds { ok:false, ... } so the website silently keeps its local
   images instead of showing an error.
   ============================================================ */

var API_BASE = 'https://hotels.cloudbeds.com/api/v1.2';
var TTL_MS = 1000 * 60 * 30; // cache live data for 30 minutes
var caches = {}; // one cache per location

var LOCATIONS = {
  newcairo: {
    key: function () { return process.env.CLOUDBEDS_API_KEY; },
    propertyID: function () { return process.env.CLOUDBEDS_PROPERTY_ID || ''; },
    keyName: 'CLOUDBEDS_API_KEY'
  },
  mohandessin: {
    key: function () { return process.env.CLOUDBEDS_API_KEY_MOHANDSEEN || process.env.CLOUDBEDS_API_KEY_MOHANDESSIN; },
    propertyID: function () { return process.env.CLOUDBEDS_PROPERTY_ID_MOHANDSEEN || process.env.CLOUDBEDS_PROPERTY_ID_MOHANDESSIN || ''; },
    keyName: 'CLOUDBEDS_API_KEY_MOHANDSEEN'
  }
};

function pickLocation(req) {
  var q = (req.query && req.query.location) || '';
  if (!q && req.url) {
    var m = /[?&]location=([^&]*)/.exec(req.url);
    if (m) q = decodeURIComponent(m[1]);
  }
  q = String(q).toLowerCase().replace(/[^a-z]/g, '');
  if (/^mohand/.test(q)) return 'mohandessin';
  return 'newcairo';
}

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

  var loc = pickLocation(req);
  var conf = LOCATIONS[loc];
  var key = conf.key();
  if (!key) {
    res.status(200).json({ ok: false, configured: false, location: loc, reason: conf.keyName + ' not set', rooms: [] });
    return;
  }

  var cache = caches[loc] || { at: 0, data: null };
  if (cache.data && Date.now() - cache.at < TTL_MS) {
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(cache.data);
    return;
  }

  try {
    var propertyID = conf.propertyID();
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

    var out = { ok: true, configured: true, location: loc, property: { id: propertyID, name: propertyName }, rooms: rooms };
    caches[loc] = { at: Date.now(), data: out };
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(out);
  } catch (e) {
    res.status(200).json({ ok: false, configured: true, location: loc, reason: String((e && e.message) || e), rooms: [] });
  }
};
