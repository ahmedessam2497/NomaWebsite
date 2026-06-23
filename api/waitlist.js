/* ============================================================
   NōMA Stays — Waitlist capture (Vercel serverless)
   POST /api/waitlist  { name, email, phone, property, source }
   Forwards the lead to a Google Apps Script Web App, which appends
   a row to your Google Sheet.

   Required Vercel environment variable:
     WAITLIST_SHEET_URL  = the Apps Script Web App URL
       (https://script.google.com/macros/s/XXXX/exec)
   See WAITLIST_SETUP.md for the Apps Script code and setup steps.

   Always responds 200. { ok:false, configured:false } means the env
   var isn't set yet, so the form can show a friendly fallback.
   ============================================================ */

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, reason: 'POST only' });
    return;
  }

  var data = req.body;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch (e) { data = {}; } }
  data = data || {};

  if (!data.email || !String(data.email).trim()) {
    res.status(400).json({ ok: false, reason: 'email required' });
    return;
  }

  var url = process.env.WAITLIST_SHEET_URL;
  if (!url) {
    res.status(200).json({ ok: false, configured: false, reason: 'WAITLIST_SHEET_URL not set' });
    return;
  }

  var payload = {
    name: (data.name || '').toString().slice(0, 200),
    email: (data.email || '').toString().slice(0, 200),
    phone: (data.phone || '').toString().slice(0, 60),
    property: (data.property || '').toString().slice(0, 80),
    source: (data.source || '').toString().slice(0, 200),
    ts: new Date().toISOString()
  };

  try {
    var r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    res.status(200).json({ ok: r.ok });
  } catch (e) {
    res.status(200).json({ ok: false, reason: String((e && e.message) || e) });
  }
};
