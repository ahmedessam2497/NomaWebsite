# NōMA — property & room-type photos

Drop your photos into this folder (`assets/rooms/`) using the exact filenames below.
The site loads them automatically. **Missing files are skipped** — you can add them gradually, and the gallery will only show the photos that exist.

Format: JPG recommended, landscape, ideally ~1600×1067px or larger. Filenames are case-sensitive.

---

## NōMA Arabella

**Property gallery (up to 10 — shown when you click any photo / "View all photos"):**
- `arabella-1.jpg` … `arabella-10.jpg`

**Room-type galleries (up to 5 each — shown when you click the room type):**
- Studio → `arabella-studio-1.jpg` … `arabella-studio-5.jpg`
- Studio with Balcony → `arabella-studio-balcony-1.jpg` … `-5.jpg`
- Deluxe Studio → `arabella-deluxe-studio-1.jpg` … `-5.jpg`
- One-Bedroom → `arabella-onebed-1.jpg` … `-5.jpg`
- One-Bedroom with Balcony → `arabella-onebed-balcony-1.jpg` … `-5.jpg`
- Deluxe One-Bedroom → `arabella-deluxe-onebed-1.jpg` … `-5.jpg`

## NōMA District 9

**Property gallery (up to 10):**
- `district9-1.jpg` … `district9-10.jpg`

**Room-type galleries (up to 5 each):**
- Studio → `district9-studio-1.jpg` … `-5.jpg`
- Studio with Balcony → `district9-studio-balcony-1.jpg` … `-5.jpg`
- Deluxe Studio → `district9-deluxe-studio-1.jpg` … `-5.jpg`
- One-Bedroom → `district9-onebed-1.jpg` … `-5.jpg`
- One-Bedroom with Balcony → `district9-onebed-balcony-1.jpg` … `-5.jpg`
- Deluxe One-Bedroom → `district9-deluxe-onebed-1.jpg` … `-5.jpg`

---

To change how many photos a gallery looks for, edit the `data-count` attribute on the
matching element in `noma.html` (e.g. `data-count="10"` on the property gallery,
`data-count="5"` on a room-type card).
