# NōMA Stays — Waitlist → Google Sheet setup

The "Join the waitlist" buttons (Beit Hend, NōMA District 9) open a modal form
that captures **name, email, phone, and which property**. Submissions flow:

`form → /api/waitlist (Vercel) → your Google Apps Script → your Google Sheet`

You need to do three short things once.

## 1. Create the Sheet
Make a new Google Sheet (e.g. "NōMA Waitlist"). Optionally add a header row:

| Timestamp | Name | Email | Phone | Property | Source |
|---|---|---|---|---|---|

## 2. Add the Apps Script
In that Sheet: **Extensions → Apps Script**, delete the sample, paste this, and Save:

```javascript
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Waitlist') || ss.getActiveSheet();
  var d = {};
  try { d = JSON.parse(e.postData.contents); } catch (err) {}
  sheet.appendRow([ new Date(), d.name || '', d.email || '', d.phone || '', d.property || '', d.source || '' ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Then deploy it:
- Click **Deploy → New deployment**
- Type: **Web app**
- **Execute as:** Me
- **Who has access:** **Anyone**
- Click **Deploy**, authorise when prompted, and **copy the Web app URL**
  (looks like `https://script.google.com/macros/s/AKfy…/exec`).

## 3. Add the URL to Vercel
Vercel project → **Settings → Environment Variables**:

| Name | Value |
|---|---|
| `WAITLIST_SHEET_URL` | the Web app URL from step 2 |

Make sure **Production** is ticked, save, then **redeploy** (push any commit, or Deployments → ⋯ → Redeploy).

## Done
Submitting the waitlist form now appends a row to your Sheet. Until the env var
is set, the form shows a friendly "please email us" message instead of failing
silently — so nothing looks broken during setup.

To change the form fields, edit the waitlist modal block in `chrome.js`
(and mirror the columns in the Apps Script `appendRow`).
