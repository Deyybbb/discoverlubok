/* =====================================================================
   DISCOVER LOBOC · SITE CONFIG
   ---------------------------------------------------------------------
   This is the file to edit in VS Code. Everything else (text, photos,
   officials, news) is edited inside the website's Admin dashboard.
   ===================================================================== */
window.LOBOC_CONFIG = {

  /* ---------- 1. BACKEND --------------------------------------------
     "demo"     = runs with no server. Data is saved in this browser only.
                  Use this while the site is not live yet.
     "supabase" = live mode. Fill in the two keys below and follow
                  README.md > "Going live". */
  BACKEND: "demo",
  SUPABASE_URL: "",        // e.g. "https://xxxx.supabase.co"
  SUPABASE_ANON_KEY: "",   // the public "anon" key (never the service key)

  /* ---------- 2. BRAND FILES ----------------------------------------
     Put your files in the assets folder with these names, or change
     the paths. If a file is missing, the site shows a fallback. */
  LOGO_SRC: "assets/img/loboc-logo.png",       // official Loboc seal (PNG/SVG, square)
  BRAND_LOGO_SRC: "assets/img/loboc-brand.png", // tourism brand logo ("Loboc, a piece of heaven"), shown on the landing page
  HERO_VIDEO_SRC: "assets/video/loboc-river.mp4", // optional; leave "" for none
  HYMN_SRC: "assets/audio/loboc-hymn.mp3",     // Loboc Hymn (MP3)
  HERO_IMAGE_SRC: "assets/img/hero-loboc-river.jpg", // landing page background photo (wide, about 1920px)
  TOUR_VIDEO_URL: "",   // "Watch Video" button: a YouTube link or an MP4 path. Empty = uses HERO_VIDEO_SRC


  /* ---------- 3. SOCIAL MEDIA & CONTACT LINKS -----------------------
     Leave a link as "" to hide its button. */
  SOCIAL: {
    facebook:  "https://www.facebook.com/",   // LGU Loboc Facebook page
    tourismFb: "",                            // Loboc Tourism Office page
    instagram: "",
    youtube:   "",
    tiktok:    "",
    x:         "",
    website:   "",                            // e.g. official .gov.ph site
    email:     "tourism@loboc.gov.ph",        // shown on Contact page
    phone:     "09XX-XXX-XXXX"
  },

  /* ---------- 4. MAP COORDINATES ------------------------------------
     Each "Directions" button opens Google Maps to these coordinates.
     The key must match the item's ID (shown in Admin under each item's
     "ID" label). If an item has no entry here, Google Maps searches by
     its name + "Loboc, Bohol" instead.
     How to get coordinates: in Google Maps, right-click the spot and
     click the numbers at the top of the menu to copy them. */
  COORDS: {
    // Highlights
    "hl-floating":    { lat: 0, lng: 0 },  // Floating Restaurant (Loboc River Cruise)
    "hl-ecopark":     { lat: 0, lng: 0 },  // Loboc Eco Adventure Park
    "hl-rondalla":    { lat: 0, lng: 0 },  // Rondalla performance venue
    "hl-bolibong":    { lat: 0, lng: 0 },  // Bolibongkingking Festival venue
    "hl-suroy":       { lat: 0, lng: 0 },  // Suroy sa Musikero starting point

    // Tourist spots
    "pl-church":          { lat: 0, lng: 0 },  // San Pedro Apostol Church (Loboc Church)
    "pl-belltower":       { lat: 0, lng: 0 },  // Loboc Bell Tower
    "pl-hall":            { lat: 0, lng: 0 },  // Loboc Municipal Hall
    "pl-gabaldon":        { lat: 0, lng: 0 },  // Gabaldon Building
    "pl-santonino":       { lat: 0, lng: 0 },  // Señor Santo Niño Shrine
    "pl-plaza":           { lat: 0, lng: 0 },  // Loboc Plaza
    "pl-tourism":         { lat: 0, lng: 0 },  // Loboc Tourism Complex
    "pl-krus":            { lat: 0, lng: 0 },  // Krus Daku
    "pl-guadalupe":       { lat: 0, lng: 0 },  // Birhen sa Guadalupe Statue and Shrine
    "pl-busay":           { lat: 0, lng: 0 },  // Busay Falls
    "pl-guimba":          { lat: 0, lng: 0 },  // Mount Guimba
    "pl-forest":          { lat: 0, lng: 0 },  // Man-made Forest
    "pl-zoo":             { lat: 0, lng: 0 },  // Zoocolate Thrills
    "pl-salabat":         { lat: 0, lng: 0 },  // Loboc Salabat Ginger Facility
    "pl-quinoguitan":     { lat: 0, lng: 0 },  // Quinoguitan Parish Church
    "pl-rosario":         { lat: 0, lng: 0 },  // Santo Rosario Chapel
    "pl-busai":           { lat: 0, lng: 0 },  // Busai Dream Falls
    "pl-loctob":          { lat: 0, lng: 0 },  // Loctob Spring
    "pl-jimilianspring":  { lat: 0, lng: 0 },  // Jimilian Spring
    "pl-guimbacave":      { lat: 0, lng: 0 },  // Guimba Cave
    "pl-bonboncave":      { lat: 0, lng: 0 },  // Bonbon Upper Cave
    "pl-kasampong":       { lat: 0, lng: 0 },  // Kasampong Cave
    "pl-pangas":          { lat: 0, lng: 0 },  // Pangas Falls
    "pl-isla":            { lat: 0, lng: 0 },  // Isla Eden

    // Add more here: "id-from-admin": { lat: 9.6xxx, lng: 124.0xxx },
  },

  /* Map starting point (center of Loboc) and zoom for the Maps page */
  MAP_CENTER: { lat: 9.6375, lng: 124.0310, zoom: 13 },

  /* ---------- 5. LIMITS (keeps storage small) ----------------------- */
  IMAGE_MAX_WIDTH: 1600,      // photos are resized to this width before upload
  IMAGE_QUALITY: 0.72,        // 0–1, WebP/JPEG quality
  IMAGE_MAX_INPUT_MB: 15,     // bigger files are refused
  MAX_PHOTOS_PER_ITEM: 6,
  NEWS_PER_PAGE: 6,

  /* ---------- 6. DEMO ACCOUNTS (demo mode only) ---------------------
     ⚠ SECURITY: these passwords are public. Delete these before going live. Live staff accounts are created by
     signing up, then an Admin changes the role in Admin > Users. */
  DEMO_STAFF: [
    { email: "admin@loboc.demo", password: "Admin1234", name: "LGU Admin",  role: "admin" },
    { email: "pio@loboc.demo",   password: "Pio12345",  name: "PIO Officer", role: "pio" },
    { email: "tourist@loboc.demo", password: "Tourist2026", name: "Juan Turista", role: "tourist" }
  ]
};
