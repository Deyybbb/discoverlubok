# DiscoverLubok: Tourism Portal

> **Security:** read `SECURITY.md` before going live. Preview mode is for previewing only and is not secure as a live site.

The official tourism website for the Municipality of Loboc, Bohol. It is **not live yet**: it runs in **preview mode**, so everything is saved in the browser you open it in. The site is built so a backend can be connected later without rewriting any pages.

---

## 1. Open the preview

**Option A:** Double-click `index.html`.

**Option B (recommended in VS Code):** Install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.

### Preview accounts

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@loboc.demo   | Admin1234 |
| PIO   | pio@loboc.demo     | Pio12345  |
| Tourist | tourist@loboc.demo | Tourist2026 |

Visitors first see the **landing page**. **Open browsing:** anyone can view every page without an account (**Explore Loboc** goes straight into the site). An account is needed only to **rate and review**, **send a message** or **report a concern**. Those places show a "Log in" box, and after logging in the visitor comes back to the same page.

Tourists create their own accounts through **Sign up**. Sign-up needs a Gmail address, a 6-digit code (OTP), and a password. In preview mode no email is sent, so the code is shown on screen.

The dashboard is at `index.html#admin`. Logged-in staff can also reach it through the account menu.

---

## 2. What to edit, and where

| What | Where |
|---|---|
| Text, photos, highlights, tourist spots, things to do, listings, guides, hotlines, officials, barangay profiles & boundaries, FAQ, photo gallery, news, events, quote | **Inside the website:** Admin dashboard. No code needed. |
| Logo, hymn MP3, hero video | Put the files in `assets/`, using the names in `js/config.js` |
| **Landing page** (shown before log in): background photo, "Watch Video" link | `js/config.js` → `HERO_IMAGE_SRC`, `TOUR_VIDEO_URL` (YouTube link or MP4) |
| Landing headline and text | Admin → Site settings. Words in `[brackets]` are highlighted, e.g. `Hear the [RIVER.]` |
| Heritage timeline (years, stories, anchor years, photos) | Admin → Heritage timeline |
| Facebook and social media links, phone, email | `js/config.js` → `SOCIAL` |
| **Map coordinates for Directions buttons** | `js/config.js` → `COORDS` (see below) |
| Photo size limits | `js/config.js` → `IMAGE_MAX_WIDTH`, `IMAGE_QUALITY` |
| Colors | `css/style.css`, top of the file (`--leaf` is the main light leaf green) |

### Maps

- **Maps tab (Barangays and Locations):** a **drawn map of Loboc**, with the town outline and the shapes of all 28 barangays in the site's leaf-green colors. It needs no map service, API key or internet map tiles.
- **Everywhere else** (each tourist spot page, the Visitor Guide and Contact) shows a **Google Map** of the place.

- **Shapes:** these are the LGU's official barangay boundaries (shapefile `Barangay_Bndry`), converted to longitude/latitude and included in `js/loboc-shapes.js`. Land area per barangay is the LGU's figure in hectares (total 5,692 ha). Population is from the 2024 CBMS (PSA).
- **Barangays tab:** a large map. Tapping a barangay (or a card in the **Barangays of Loboc** frame below it) zooms to it and shows its profile, Punong Barangay and SK Chair. Drag to move; use + / − / ⤢ to zoom.
- **Locations tab:** places with coordinates in `js/config.js › COORDS` get a colored pin. Places without coordinates still highlight their barangay when tapped.
- **Logos:** each barangay starts with a temporary leaf seal with its initials. Upload the real logo in **Admin → Barangays → Edit** (*Barangay logo / seal*).
- **Replacing a shape (optional):** in **Admin → Barangays**, import a KML (e.g. traced in Google My Maps) or a GeoJSON file. Shapes are matched by barangay name.
- **Directions** buttons open Google Maps directions to the place.

### Adding coordinates

1. In Google Maps, right-click the spot and click the numbers at the top of the menu to copy them.
2. In `js/config.js`, find the place's ID and paste the coordinates:
   ```js
   "pl-busay": { lat: 9.6412, lng: 124.0357 },
   ```
3. Every item's ID is shown at the top of its edit panel in Admin, with a **copy** button.

If a place has no coordinates, its Directions button searches Google Maps for "*name*, Loboc, Bohol" instead. Places with coordinates also get a pin on the drawn map, colored by category (tourist spots, heritage, hidden gems, highlights, things to do, stay, eat, souvenir shops, services).

The "Today in Loboc" weather on the homepage comes from Open-Meteo, which is free, needs no key, and needs an internet connection.

---

### 360° virtual tours
A place with a tour shows a **Virtual Tour** button on its page (under the description and over the map). It opens a full-screen 360° viewer that works on phones, tablets and computers.

- Photos go in `assets/tour/<place>/` (for example `assets/tour/loboc-church/`). Use 2:1 360° JPGs from the Osmo 360, resized to **4096×2048** (about 1–1.5 MB each), plus a small `-thumb.jpg` (480×240).
- The tour itself is listed in `js/tours.js`: one entry per place ID, one scene per photo, and `links` for the walking arrows. `yaw` is the arrow's direction in degrees (0 = middle of the photo, 90 = right, -90 = left, 180 = behind), `pitch` how low it sits.
- Tours also work when `index.html` is opened by double-clicking (no server, no internet). For that, each photo has a `.js` copy with the same name. After adding or replacing photos, run `python tools/make-tour-js.py` from the website folder to make them.
- The viewer is Pannellum 2.5.6 (MIT licence, free), saved in `js/vendor` and `css/vendor`. It only loads when someone opens a tour.

## 3. Who can do what

| | Admin | PIO | Tourist | Not logged in |
|---|:-:|:-:|:-:|:-:|
| See the landing page | ✓ | ✓ | ✓ | ✓ |
| Browse the rest of the site | ✓ | ✓ | ✓ | |
| Rate & review (uses the account name + email) | ✓ | ✓ | ✓ | |
| Send a contact message, receive replies by email | | | ✓ | |
| Call or text a homestay/hotel owner directly | ✓ | ✓ | ✓ | |
| News & announcements, Events | ✓ | ✓ | | |
| All other content, messages, reviews, users, settings | ✓ | | | |

**To make someone staff:** they sign up with their Gmail, then an Admin changes their role in **Admin → Users & roles**.

---

## 4. Keeping storage small

- Every photo is **resized and compressed in the browser before upload** (WebP, 1600px wide). A typical 5–7 MB phone photo becomes about 150–300 KB.
- Each item can have at most 6 photos (`MAX_PHOTOS_PER_ITEM`). Files over 15 MB are refused.
- When a photo is removed or replaced, or an item is deleted, its old photo files are deleted too.
- Announcements can have a **Hide after** date, so they disappear on their own. News is shown page by page.

---

## 5. Going live (later)

The website talks to data only through `js/api.js`. Right now that file uses the **demo adapter** (browser storage). To go live:

1. Create a free project at **supabase.com**.
2. Run `backend/schema.sql` in **SQL Editor**. It creates the tables, roles, security rules, and the visitor counter.
3. In **Authentication → Providers → Email**, turn on **Confirm email** and set the email template to send the **6-digit code** (`{{ .Token }}`).
4. In **Storage**, create a public bucket named `photos`.
5. Create an **Edge Function** `reply-message` that emails admin replies (for example through Resend or Gmail SMTP).
6. Fill in the Supabase adapter in `js/api.js`. Each method has a `TODO` with the exact call.
7. In `js/config.js`, set `BACKEND: "supabase"` and add `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
8. **Delete `DEMO_STAFF`** from `config.js`, then follow the go-live security checklist in `SECURITY.md`.
9. Upload the folder to any static host (Netlify, Vercel, GitHub Pages, or the LGU's server).

Once live, the visitor counter updates in real time for everyone, through Supabase Realtime.

> **Security note:** In preview mode, roles are checked in the browser only. Once live, `schema.sql` enforces them on the server with Row Level Security, so a PIO account cannot edit other sections even through the browser console.

---

## 6. Files

```
index.html          page shell
css/style.css       all styles (colors at the top)
js/config.js        ← edit in VS Code: links, coordinates, files, backend keys
js/loboc-shapes.js  official barangay boundaries (LGU shapefile)
js/content.js       first-run sample content (after that, use Admin)
js/api.js           data layer: demo adapter now, Supabase adapter later
js/app.js           public website
js/admin.js         Admin + PIO dashboard
backend/schema.sql  database plan for going live
assets/             logo, hymn, video, photos
```

### Data from the LGU (October 2026)
Officials, registered accommodations (CY 2026), souvenir shops, barangay population (2024 CBMS), barangay boundaries, the Loboc seal and tourism logo, and the attractions, activities, dining, festivals and history in the Tourism Development Plan 2026–2028 are already entered in `js/content.js`.

### Placeholders to replace before launch
Items marked "to be confirmed" or `09XX-XXX-XXXX`: hotline numbers, accredited tour guides, department heads, fees, hours and prices, map coordinates, the hymn, and photos.

When you change `js/content.js`, raise `dataVersion` at its top by 1 so preview browsers load the new content (accounts, reviews and messages are kept).
