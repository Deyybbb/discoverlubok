/* =====================================================================
   DISCOVER LOBOC · STAFF DASHBOARD  (Admin + PIO)
   Admin = full access. PIO = News & announcements, Events.
   Every module is defined in MODS below. To add a field to a section,
   add one line to its "fields" list; the form and saving work automatically.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.LOBOC_CONFIG, SEED = window.LOBOC_SEED;
  let L; // shared helpers from app.js (set on first render)
  const BRN = () => API.list("brgys").slice().sort((a, b) => (a.order || 0) - (b.order || 0)).map(b => b.name);
  const YES = ["admin"], BOTH = ["admin", "pio"];

  /* every dashboard action goes through the data layer, which re-checks permissions;
     if it refuses, show why and redraw so the screen matches what was really saved */
  function actionFailed(er) { console.warn(er); if (L) { L.toast(er && er.message ? er.message : "Something went wrong."); if (document.body.classList.contains("dash")) rerender(); } }
  const modOf = col => Object.keys(MODS).find(k => MODS[k].col === col);
  const mustCan = mk => { if (!mk || !can(mk)) { const e = new Error("You don't have permission to do that."); e.code = "FORBIDDEN"; throw e; } };

  /* ---------- module definitions ---------- */
  const MODS = {
    dash:       { label: "Dashboard", icon: "▦", roles: BOTH, group: "" },
    inbox:      { label: "Messages", icon: "✉", roles: YES, group: "Visitors" },
    reviews:    { label: "Reviews", icon: "★", roles: YES, group: "Visitors" },
    news:       { label: "News & announcements", icon: "📢", roles: BOTH, group: "Public information", col: "news", one: "post",
      fields: [
        { k: "type", l: "Type", t: "select", opts: ["Announcement", "News"] },
        { k: "title", l: "Headline", req: 1, max: 140 },
        { k: "body", l: "Content", t: "area", rows: 10, req: 1, max: 6000 },
        { k: "cover", l: "Cover photo", t: "cover" },
        { k: "date", l: "Publish date", t: "date", req: 1, hint: "Future dates stay hidden until that day." },
        { k: "expires", l: "Hide after (optional)", t: "date", hint: "For announcements with an end date. Expired posts hide automatically." },
        { k: "pinned", l: "Pin to the top", t: "check" },
        { k: "status", l: "Status", t: "select", opts: ["Published", "Draft", "Archived"] }
      ],
      def: () => ({ type: "Announcement", title: "", body: "", cover: "", date: L.today(), expires: "", pinned: false, status: "Published", author: "PIO" }),
      row: r => ({ title: r.title, sub: `${r.type} · ${L.fmtDate(r.date)}${r.expires ? " · hides " + L.fmtDate(r.expires) : ""}`, img: r.cover, badges: [[r.status, r.status === "Published" ? "" : r.status === "Draft" ? "gold" : "mute"], r.pinned && ["📌 Pinned", "blue"], r.expires && r.expires < L.today() && ["Expired", "red"]] }),
      filters: ["All", "Published", "Draft", "Archived", "Announcement", "News"], filt: (r, f) => f === r.status || f === r.type },
    events:     { label: "Events calendar", icon: "📅", roles: BOTH, group: "Public information", col: "events", one: "event",
      fields: [
        { k: "title", l: "Event name", req: 1 }, { k: "type", l: "Type", t: "select", opts: [["fiesta", "Fiesta"], ["church", "Religious"], ["culture", "Cultural"], ["holiday", "Holiday"]] },
        { k: "date", l: "Date", t: "date", req: 1 }, { k: "time", l: "Start time", t: "time" }, { k: "venue", l: "Venue or barangay" }, { k: "desc", l: "Description", t: "area" }, { k: "movable", l: "Date changes every year (show a reminder to visitors)", t: "check" }, { k: "photos", l: "Photo", t: "photos", max: 1 }],
      def: () => ({ title: "", type: "fiesta", date: L.today(), time: "", venue: "", desc: "", movable: false, photos: [] }),
      row: r => ({ title: r.title, sub: `${L.fmtDate(r.date)}${r.time ? " · " + r.time : ""}${r.venue ? " · " + r.venue : ""}`, img: (r.photos || [])[0], badges: [[(L.TY[r.type] || ["Event"])[0], "blue"], r.movable && ["Date changes yearly", "gold"], r.date < L.today() && ["Past", "mute"]] }),
      sort: (a, b) => b.date.localeCompare(a.date) },
    highlights: { label: "Home highlights", icon: "✦", roles: YES, group: "Website content", col: "highlights", one: "highlight",
      fields: [
        { k: "title", l: "Title", req: 1 }, { k: "kicker", l: "Small label (e.g. River cruise)" },
        { k: "summary", l: "Short summary (homepage)", t: "area", rows: 2, max: 220 }, { k: "story", l: "Full story (Learn more page)", t: "area", rows: 7 },
        { k: "facts", l: "Quick facts (Learn more page)", t: "facts" },
        { k: "color", l: "Band color", t: "select", opts: [["leaf", "Leaf green"], ["river", "River blue"], ["forest", "Forest green"], ["deep", "Deep green"]] },
        { k: "order", l: "Order on homepage", t: "number" }, { k: "photos", l: "Photos", t: "photos" }, { k: "pub", l: "Show on website", t: "check" }],
      def: () => ({ title: "", kicker: "", summary: "", story: "", facts: [["Where", ""], ["Fee", ""]], color: "leaf", order: 9, photos: [], pub: true }),
      row: r => ({ title: r.title, sub: r.kicker + " · order " + (r.order || "–"), img: (r.photos || [])[0], badges: [pubB(r)] }), sort: (a, b) => (a.order || 0) - (b.order || 0) },
    places:     { label: "Tourist spots", icon: "📍", roles: YES, group: "Website content", col: "places", one: "place",
      fields: [
        { k: "name", l: "Name", req: 1 }, { k: "kind", l: "Kind", t: "select", opts: ["Tourist spot", "Heritage", "Hidden gem"] }, { k: "brgy", l: "Barangay", t: "brgy" },
        { k: "status", l: "Operating status", t: "select", opts: ["Open", "Temporarily closed", "Closed for restoration", "Weather / safety closure"] }, { k: "note", l: "Note when not open", hint: "Reason or expected reopening date." },
        { k: "hours", l: "Opening hours" }, { k: "fee", l: "Entrance fee" }, { k: "desc", l: "Short description", t: "area", rows: 2 }, { k: "story", l: "Full description (detail page)", t: "area", rows: 6 }, { k: "guide", l: "Visitor guidelines", t: "area", rows: 3, hint: "Dress code, safety rules, what to bring." },
        { k: "photos", l: "Photos", t: "photos" }, { k: "pub", l: "Show on website", t: "check" }],
      def: () => ({ name: "", kind: "Tourist spot", brgy: BRN()[0], status: "Open", note: "", hours: "", fee: "", desc: "", story: "", guide: "", photos: [], pub: true }),
      row: r => ({ title: r.name, sub: `${r.kind} · ${r.brgy}`, img: (r.photos || [])[0], badges: [r.status !== "Open" && [r.status, "red"], (!r.hours || !r.fee || /confirm/i.test(r.hours + r.fee)) && ["Hours/fee missing", "gold"], pubB(r)] }),
      filters: ["All", "Tourist spot", "Heritage", "Hidden gem", "Not open"], filt: (r, f) => f === "Not open" ? r.status !== "Open" : r.kind === f },
    activities: { label: "Things to do", icon: "🛶", roles: YES, group: "Website content", col: "activities", one: "activity",
      fields: [{ k: "name", l: "Name", req: 1 }, { k: "cat", l: "Category", t: "select", opts: [["adventure", "Adventure"], ["river", "River & Water Activities"], ["home", "Home & Dining"]] },
        { k: "desc", l: "Description", t: "area", rows: 3 }, { k: "duration", l: "Duration" }, { k: "price", l: "Price / fee" }, { k: "contact", l: "Contact number" }, { k: "photos", l: "Photos", t: "photos" }, { k: "pub", l: "Show on website", t: "check" }],
      def: () => ({ name: "", cat: "adventure", desc: "", duration: "", price: "", contact: "", photos: [], pub: true }),
      row: r => ({ title: r.name, sub: ({ adventure: "Adventure", river: "River & Water", home: "Home & Dining" })[r.cat], img: (r.photos || [])[0], badges: [pubB(r)] }),
      filters: ["All", "adventure", "river", "home"], filt: (r, f) => r.cat === f },
    listings:   { label: "Stay · Eat · Shop", icon: "🏨", roles: YES, group: "Website content", col: "listings", one: "listing",
      fields: [{ k: "name", l: "Name", req: 1 }, { k: "type", l: "Type", t: "select", opts: ["Hotel", "Resort", "Homestay", "Inn", "Lodge", "Restaurant", "Souvenir shop", "Service"] }, { k: "brgy", l: "Barangay", t: "brgy" },
        { k: "priceFrom", l: "Starting price per night (₱)", t: "number", hint: "Leave 0 for restaurants and shops." }, { k: "desc", l: "Description", t: "area", rows: 3 },
        { k: "amenities", l: "Amenities (separate with commas)", hint: "e.g. Wi-Fi, Pool, Aircon, Breakfast, PWD-friendly" },
        { k: "phone", l: "Phone" }, { k: "email", l: "Email (optional)" }, { k: "fb", l: "Facebook page link" },
        { k: "photos", l: "Photos", t: "photos" }, { k: "pub", l: "Show on website", t: "check" }],
      def: () => ({ name: "", type: "Resort", brgy: BRN()[0], priceFrom: 0, desc: "", amenities: "", phone: "", email: "", fb: "", photos: [], pub: true }),
      row: r => ({ title: r.name, sub: `${r.type} · ${r.brgy}${r.priceFrom ? " · from ₱" + Number(r.priceFrom).toLocaleString() : ""}`, img: (r.photos || [])[0], badges: [pubB(r)] }),
      filters: ["All", "Hotel", "Resort", "Homestay", "Inn", "Restaurant", "Souvenir shop", "Service", "Hidden"], filt: (r, f) => f === "Hidden" ? r.pub === false : r.type === f },
    guides:     { label: "Tour guides", icon: "🧭", roles: YES, group: "Visitor guide", col: "guides", one: "tour guide",
      fields: [{ k: "name", l: "Full name", req: 1 }, { k: "phone", l: "Phone number", req: 1 }, { k: "languages", l: "Languages" }, { k: "accNo", l: "Accreditation number" }, { k: "photos", l: "Photo", t: "photos", max: 1 }, { k: "pub", l: "Show on website", t: "check" }],
      def: () => ({ name: "", phone: "", languages: "", accNo: "", photos: [], pub: true }),
      row: r => ({ title: r.name, sub: `${r.phone} · ${r.languages}`, img: (r.photos || [])[0], badges: [pubB(r)] }) },
    hotlines:   { label: "Emergency hotlines", icon: "🚨", roles: YES, group: "Visitor guide", col: "hotlines", one: "hotline",
      fields: [{ k: "name", l: "Office / service", req: 1 }, { k: "number", l: "Number", req: 1 }, { k: "note", l: "Note" }, { k: "order", l: "Order", t: "number" }],
      def: () => ({ name: "", number: "", note: "", order: 9 }), row: r => ({ title: r.name, sub: r.number + (r.note ? " · " + r.note : ""), badges: [] }), sort: (a, b) => a.order - b.order },
    transport:  { label: "Transportation", icon: "🚌", roles: YES, group: "Visitor guide", col: "transport", one: "route",
      fields: [{ k: "title", l: "Route title", req: 1 }, { k: "desc", l: "How to get there", t: "area", rows: 5 }, { k: "order", l: "Order", t: "number" }],
      def: () => ({ title: "", desc: "", order: 9 }), row: r => ({ title: r.title, sub: r.desc.slice(0, 90), badges: [] }), sort: (a, b) => a.order - b.order },
    access:     { label: "Accessibility & family", icon: "♿", roles: YES, group: "Visitor guide", col: "access", one: "facility",
      fields: [{ k: "name", l: "Facility", req: 1 }, { k: "kind", l: "Icon", t: "select", opts: [["breastfeeding", "🤱 Breastfeeding"], ["pwd", "♿ PWD access"], ["restroom", "🚻 Restroom"], ["priority", "⭐ Priority lane"], ["other", "ℹ️ Other"]] },
        { k: "location", l: "Location" }, { k: "desc", l: "Description", t: "area", rows: 3 }, { k: "order", l: "Order", t: "number" }],
      def: () => ({ name: "", kind: "pwd", location: "Loboc Tourism Complex", desc: "", order: 9 }), row: r => ({ title: r.name, sub: r.location, badges: [] }), sort: (a, b) => a.order - b.order },
    officials:  { label: "Officials", icon: "🏛", roles: YES, group: "LGU", col: "officials", one: "official",
      fields: [
        { k: "group", l: "Group", t: "select", opts: [["municipal", "Municipal (Mayor, Vice Mayor)"], ["sb", "Sangguniang Bayan"], ["department", "Department head"], ["barangay", "Barangay"]] },
        { k: "role", l: "Position", req: 1, hint: "Barangay: only “Punong Barangay” or “SK Chairperson”.", list: ["Municipal Mayor", "Municipal Vice Mayor", "Sangguniang Bayan Member", "Department Head", "Punong Barangay", "SK Chairperson"] },
        { k: "name", l: "Full name" }, { k: "office", l: "Office / department", hint: "For department heads, e.g. “Municipal Engineering Office · Municipal Engineer”." },
        { k: "brgy", l: "Barangay (for barangay officials)", t: "brgy", blank: 1 }, { k: "term", l: "Term (e.g. 2025–2028)" }, { k: "end", l: "Term ends (year)", hint: "You'll get a reminder on the dashboard when the term ends." }, { k: "contact", l: "Contact (office use only, never shown publicly)" }, { k: "order", l: "Order", t: "number" }, { k: "photos", l: "Portrait", t: "photos", max: 1 }],
      def: () => ({ group: "department", role: "Department Head", name: "", office: "", brgy: "", term: "", end: "", contact: "", order: 50, photos: [] }),
      row: r => ({ title: r.name || "Name to be added", sub: `${r.role}${r.office ? " · " + r.office : ""}${r.brgy ? " · " + r.brgy : ""}`, img: (r.photos || [])[0], badges: [[({ municipal: "Municipal", sb: "SB", department: "Department", barangay: "Barangay" })[r.group], "blue"], !r.name && ["Needs name", "gold"], r.end && +r.end <= new Date().getFullYear() && ["Term ended: check", "red"]] }),
      filters: ["All", "municipal", "sb", "department", "barangay"], filt: (r, f) => r.group === f, sort: (a, b) => (a.order || 0) - (b.order || 0) || String(a.brgy).localeCompare(b.brgy) },
    brgys:      { label: "Barangays", icon: "🗺", roles: YES, group: "LGU", col: "brgys", one: "barangay", noDelete: 1,
      fields: [{ k: "name", l: "Barangay name", req: 1 }, { k: "pop", l: "Population", t: "number" }, { k: "popNote", l: "Population source and year", hint: "e.g. 2024 CBMS, PSA" }, { k: "area", l: "Land area (e.g. 12.4 km²)" }, { k: "desc", l: "Short profile", t: "area", rows: 4 },
        { k: "photos", l: "Barangay logo / seal (square image works best)", t: "photos", max: 1 },
        { k: "boundary", l: "Boundary (KML or GeoJSON file)", t: "geo" }, { k: "order", l: "Order", t: "number" }],
      def: () => ({ name: "", pop: 0, area: "", desc: "", photos: [], boundary: null, order: 99 }),
      row: r => { const O = API.list("officials").filter(o => o.group === "barangay" && o.brgy === r.name), cap = O.find(o => o.role === "Punong Barangay");
        return { title: r.name, img: (r.photos || [])[0], sub: `Punong Barangay: ${cap && cap.name || "–"} · Population: ${r.pop ? Number(r.pop).toLocaleString() : "–"} · Area: ${r.area || "–"}`, badges: [r.boundary ? ["Boundary uploaded", ""] : ["No boundary yet", "mute"], !(r.photos || [])[0] && ["Temporary logo", "mute"], O.filter(o => o.name).length < 2 && ["Officials incomplete", "gold"]], extra: `<button class="chip sm" data-boffs="${L.hx(r.name)}">Officials</button><a class="chip sm" href="#maps/brgy" data-mapto="${L.hx(r.name)}">View on map</a>` }; },
      sort: (a, b) => (a.order || 0) - (b.order || 0), filters: ["All", "No boundary", "Has boundary"], filt: (r, f) => f === "Has boundary" ? !!r.boundary : !r.boundary,
      top: `<div class="panel" style="margin-bottom:12px"><b>Barangay boundaries</b><p class="fine" style="margin:4px 0 8px">For accurate shapes, trace each barangay over Google Maps in <b>Google My Maps</b> (name each shape after its barangay), then <b>Export to KML</b> (tick “Export as KML instead of KMZ”) and import it here. GeoJSON files from QGIS or NAMRIA/PSA also work. Shapes are matched by barangay name and simplified automatically to keep storage small.</p><label class="btn g sm" style="cursor:pointer">⬆ Import all boundaries (KML or GeoJSON)<input type="file" accept=".geojson,.json,.kml,application/geo+json,application/json,application/vnd.google-earth.kml+xml" data-geoall hidden></label> <span class="fine" id="geoStat"></span></div>` },
    faqs:       { label: "FAQ", icon: "❓", roles: YES, group: "Visitor guide", col: "faqs", one: "question",
      fields: [{ k: "q", l: "Question", req: 1 }, { k: "a", l: "Answer", t: "area", rows: 4, req: 1 }, { k: "order", l: "Order", t: "number" }],
      def: () => ({ q: "", a: "", order: 9 }), row: r => ({ title: r.q, sub: r.a.slice(0, 100), badges: [] }), sort: (a, b) => a.order - b.order },
    gallery:    { label: "Photo gallery", icon: "🖼", roles: YES, group: "Website content", col: "gallery", one: "album",
      fields: [{ k: "title", l: "Album title", req: 1 }, { k: "photos", l: "Photos", t: "photos" }, { k: "order", l: "Order", t: "number" }],
      def: () => ({ title: "", photos: [], order: 9 }), row: r => ({ title: r.title, sub: `${(r.photos || []).length} photo(s) · About › Gallery`, img: (r.photos || [])[0], badges: [] }), sort: (a, b) => a.order - b.order },
    timeline:   { label: "Heritage timeline", icon: "⏳", roles: YES, group: "Website content", col: "timeline", one: "timeline entry",
      fields: [{ k: "year", l: "Year (e.g. 1734 or 2013–2021)", req: 1 }, { k: "title", l: "Title", req: 1 }, { k: "text", l: "Story", t: "area", rows: 4 },
        { k: "anchor", l: "Anchor year (bigger card with a badge)", t: "check" }, { k: "photos", l: "Photos (1st = illustration, 2nd = snapshot)", t: "photos", max: 4 }, { k: "order", l: "Order", t: "number" }],
      def: () => ({ year: "", title: "", text: "", anchor: false, photos: [], order: 99 }),
      row: r => ({ title: r.year + " · " + r.title, sub: (r.text || "").slice(0, 100), img: (r.photos || [])[0], badges: [r.anchor && ["Anchor year", "blue"]] }), sort: (a, b) => (a.order || 0) - (b.order || 0) },
    users:      { label: "Users & roles", icon: "👥", roles: YES, group: "LGU" },
    settings:   { label: "Site settings", icon: "⚙", roles: YES, group: "LGU" }
  };
  const pubB = r => r.pub === false ? ["Hidden", "mute"] : ["Live", ""];
  const FILTER_L = { adventure: "Adventure", river: "River & Water", home: "Home & Dining", municipal: "Municipal", sb: "Sangguniang Bayan", department: "Department heads", barangay: "Barangay" };

  const A = { mod: "dash", q: "", f: "All", msg: null, edit: null, photos: [], removed: [], cover: "", busy: false, nav: false };
  const me = () => API.user();
  const can = m => MODS[m] && MODS[m].roles.includes(me().role);

  /* ---------- shell ---------- */
  function shell(body) {
    const u = me(), groups = {};
    Object.entries(MODS).filter(([k]) => can(k)).forEach(([k, m]) => (groups[m.group] = groups[m.group] || []).push([k, m]));
    const badge = k => { const n = k === "inbox" ? API.messages().filter(m => m.status === "New").length : 0; return n ? `<span class="cnt">${n}</span>` : ""; };
    return `<div class="adm ${A.nav ? "nav-open" : ""}">
      <aside class="side-nav" aria-label="Dashboard sections">
        <div class="sn-top"><span class="logo">${L.logo()}</span><div><b>DiscoverLubok</b><small>${u.role === "admin" ? "Admin dashboard" : "PIO dashboard"}</small></div></div>
        ${Object.entries(groups).map(([g, items]) => `${g ? `<div class="sn-g">${g}</div>` : ""}${items.map(([k, m]) => `<button class="sn-i" data-go="${k}" ${A.mod === k ? 'aria-current="page"' : ""}><span class="sn-ic" aria-hidden="true">${m.icon}</span>${m.label}${badge(k)}</button>`).join("")}`).join("")}
        <div class="sn-foot"><a class="sn-i" href="#home"><span class="sn-ic">↗</span>View website</a><button class="sn-i" data-alogout><span class="sn-ic">⎋</span>Log out</button></div>
      </aside>
      <div class="adm-main">
        <header class="topbar"><button class="tb-burger" data-anav aria-label="Menu">☰</button><h1>${MODS[A.mod].label}</h1>
          <div class="tb-r">${API.mode === "demo" ? `<span class="tag gold" title="Data is saved in this browser only">Preview mode</span>` : ""}<span class="tb-user"><span class="av">${L.hx(L.initials(u.name))}</span><span><b>${L.hx(u.name)}</b><small>${u.role.toUpperCase()}</small></span></span></div></header>
        <div class="adm-body">${body}</div>
      </div><div class="adm-scrim" data-anav></div></div>`;
  }
  function render(app, sub) {
    L = window.LB; app = app || L.qs("#app");
    if (sub && MODS[sub]) A.mod = sub;
    if (!can(A.mod)) A.mod = "dash";
    const m = MODS[A.mod];
    const body = A.mod === "dash" ? dash() : A.mod === "inbox" ? inbox() : A.mod === "reviews" ? reviews() : A.mod === "users" ? users() : A.mod === "settings" ? settings() : list(m);
    app.innerHTML = shell(body);
  }
  const rerender = () => { const y = L.qs(".adm-main") ? scrollY : 0; render(); window.scrollTo(0, y); };

  /* ---------- dashboard ---------- */
  const stat = (n, l, ic, go) => `<button class="stat" ${go ? `data-go="${go}"` : "disabled"}><span class="st-ic" aria-hidden="true">${ic}</span><b>${n}</b><span>${l}</span></button>`;
  function storageMeter() {
    if (API.mode !== "demo") return `<div class="panel"><h3>Photo storage</h3><p class="fine">Photos are compressed to WebP (about ${C.IMAGE_MAX_WIDTH}px wide) before upload, and old photos are deleted when replaced.</p></div>`;
    const used = API.storageUsed(), pct = Math.min(100, used / API.storageLimit * 100);
    return `<div class="panel"><h3>Storage</h3><div class="meter"><i style="width:${pct}%;background:${pct > 85 ? "var(--danger)" : pct > 60 ? "var(--gold)" : "var(--leaf-d)"}"></i></div>
      <p class="fine">${(used / 1048576).toFixed(2)} MB of about ${(API.storageLimit / 1048576).toFixed(0)} MB used in this browser (preview mode). Photos are compressed automatically before saving. When live, photos go to cloud storage instead.</p></div>`;
  }
  function dash() {
    const u = me(), news = API.list("news"), t = L.today();
    if (u.role === "pio") {
      const pub = news.filter(n => n.status === "Published"), drafts = news.filter(n => n.status === "Draft"), soon = news.filter(n => n.expires && n.expires >= t && n.expires <= new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10));
      return `<div class="hello"><div><h2>Good day, ${L.hx(u.name.split(" ")[0])}!</h2><p>Post updates for the people of Loboc and its visitors.</p></div><button class="btn p" data-new="news">+ New announcement</button></div>
        <div class="stats">${stat(pub.length, "Published posts", "📢", "news")}${stat(drafts.length, "Drafts", "📝", "news")}${stat(news.filter(n => n.pinned && n.status === "Published").length, "Pinned", "📌", "news")}${stat(API.list("events").filter(e => e.date >= t).length, "Upcoming events", "📅", "events")}</div>
        <div class="two">${panelList("Recent posts", news.slice().sort((a, b) => String(b.date).localeCompare(a.date)).slice(0, 6), "news")}
          <div class="panel"><h3>Expiring this week</h3>${soon.map(n => `<div class="todo"><span>${L.hx(n.title)} · hides ${L.fmtDate(n.expires)}</span><button class="chip sm" data-edit="news:${n.id}">Edit</button></div>`).join("") || `<p class="fine">Nothing expiring soon.</p>`}
          <h3 style="margin-top:18px">Tips</h3><ul class="fine" style="padding-left:18px;margin:0"><li>Pin urgent announcements so they show first.</li><li>Set “Hide after” for time-limited notices like class suspensions or road closures. They disappear on their own.</li><li>Cover photos are compressed automatically.</li></ul></div></div>`;
    }
    const msgs = API.messages(), nm = msgs.filter(m => m.status === "New"), rv = API.reviews(), avg = rv.length ? (rv.reduce((s, r) => s + r.rating, 0) / rv.length).toFixed(1) : "–";
    const closed = API.list("places").filter(p => p.status !== "Open"), noName = API.list("officials").filter(o => !o.name).length, brgyMiss = BRN().length * 2 - API.list("officials").filter(o => o.group === "barangay" && o.name).length;
    const P0 = API.list("places"), gaps = P0.filter(p => !p.hours || !p.fee || /confirm/i.test(p.hours + p.fee)).length, Y = new Date().getFullYear(), ended = API.list("officials").filter(o => o.end && +o.end <= Y).length, hid = API.list("listings").filter(l => l.pub === false).length, noB = API.list("brgys").filter(b => !b.boundary).length;
    const nextEv = API.list("events").filter(e => e.date >= t).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
    const todo = [nm.length && [`<b>${nm.length}</b> new message${nm.length > 1 ? "s" : ""} from tourists`, "inbox"],
      closed.length && [`<b>${closed.length}</b> tourist spot(s) marked not open`, "places"], noName && [`<b>${noName}</b> official(s) still need a name`, "officials"], brgyMiss > 0 && [`<b>${brgyMiss}</b> barangay captain / SK chair entries missing`, "officials"],
      gaps && [`<b>${gaps}</b> tourist spot(s) missing hours or a fee`, "places"], ended && [`<b>${ended}</b> official(s) with a term ending ${Y} or earlier`, "officials"],
      hid && [`<b>${hid}</b> listing(s) hidden from the public`, "listings"], noB && [`<b>${noB}</b> barangay(s) without a map boundary`, "brgys"]].filter(Boolean);
    const visitors = API.visitorCount();
    return `<div class="hello"><div><h2>Good day, ${L.hx(u.name.split(" ")[0])}!</h2><p>Here's what's happening on DiscoverLubok.</p></div><div class="chips"><button class="btn p sm" data-new="news">+ Announcement</button><button class="btn g sm" data-new="places">+ Tourist spot</button></div></div>
      <div class="stats">${stat(visitors.toLocaleString(), "Website visitors", "👁", "")}${stat(nm.length, "New messages", "✉", "inbox")}${stat(API.list("listings").filter(l => l.pub !== false && !l.phone).length, "Listings without phone", "📞", "listings")}${stat(avg + " ★", rv.length + " reviews", "★", "reviews")}${stat(API.list("news").filter(n => n.status === "Published").length, "Published posts", "📢", "news")}</div>
      <div class="two"><div class="panel"><h3>Needs attention</h3>${todo.map(([t, g]) => `<div class="todo"><span>${t}</span><button class="chip sm" data-go="${g}">Open</button></div>`).join("") || `<p class="ok-box">Everything is up to date.</p>`}
        <h3 style="margin-top:20px">Latest reviews</h3>${rv.slice(-4).reverse().map(r => `<div class="todo"><span>${L.stars(r.rating)} <b>${L.hx(r.name)}</b> on ${L.hx(r.targetName || r.target)}</span></div>`).join("") || `<p class="fine">No reviews yet.</p>`}</div>
        <div><div class="panel"><h3>Next events</h3>${nextEv.map(e => `<div class="todo"><span><b>${L.fmtDate(e.date)}</b> · ${L.hx(e.title)}${e.movable ? ` <span class="tag gold">changes yearly</span>` : ""}</span><button class="chip sm" data-edit="events:${e.id}">Edit</button></div>`).join("") || `<p class="fine">No upcoming events.</p>`}
          <h3 style="margin-top:16px">Quick actions</h3><div class="chips"><button class="btn p sm" data-new="events">+ Event</button><button class="btn g sm" data-new="listings">+ Listing</button><button class="btn g sm" data-go="places">Update a spot's status</button></div></div>${storageMeter()}${API.mode === "demo" ? `<div class="panel"><h3>Preview data</h3><p class="fine">Restore the starting sample content. This erases all edits saved in this browser.</p><button class="btn g sm" data-reset>Reset preview data</button></div>` : ""}</div></div>`;
  }
  const panelList = (t, a, col) => `<div class="panel"><h3>${t}</h3>${a.map(r => { const v = MODS[col].row(r); return `<div class="todo"><span><b>${L.hx(v.title)}</b><br><span class="fine">${L.hx(v.sub)}</span></span><button class="chip sm" data-edit="${col}:${r.id}">Edit</button></div>`; }).join("") || `<p class="fine">Nothing yet.</p>`}</div>`;

  /* ---------- generic list ---------- */
  function list(m) {
    const col = m.col, q = A.q.toLowerCase();
    let a = API.list(col).slice();
    if (m.sort) a.sort(m.sort);
    if (A.f !== "All" && m.filt) a = a.filter(r => m.filt(r, A.f));
    if (q) a = a.filter(r => JSON.stringify(r).toLowerCase().includes(q));
    const rows = a.map(r => { const v = m.row(r);
      return `<div class="lrow"><div class="lthumb">${v.img ? `<img src="${L.hx(v.img)}" alt="" loading="lazy">` : `<span>${m.icon}</span>`}</div>
        <div class="lmain"><b>${L.hx(v.title)}</b><span class="fine">${L.hx(v.sub)}</span><div class="lb">${v.badges.filter(Boolean).map(([t, c]) => `<span class="tag ${c}">${L.hx(t)}</span>`).join("")}</div></div>
        <div class="lacts">${"pub" in r ? `<button class="chip sm" data-tog="${col}:${r.id}">${r.pub === false ? "Show" : "Hide"}</button>` : ""}${v.extra || ""}<button class="chip sm" data-edit="${col}:${r.id}">Edit</button>${m.noDelete ? "" : `<button class="chip sm danger" data-del="${col}:${r.id}" aria-label="Delete ${L.hx(v.title)}">Delete</button>`}</div></div>`; }).join("");
    return `${m.top || ""}<div class="ltools"><input class="inp" type="search" data-aq placeholder="Search ${m.label.toLowerCase()}…" value="${L.hx(A.q)}" aria-label="Search">
      ${m.filters ? `<div class="chips">${m.filters.map(f => `<button class="chip sm" data-af="${f}" aria-pressed="${A.f === f}">${FILTER_L[f] || f}</button>`).join("")}</div>` : ""}
      ${m.noDelete ? "" : `<button class="btn p" data-new="${A.mod}">+ Add ${m.one}</button>`}</div>
      <p class="fine">${a.length} item${a.length === 1 ? "" : "s"}${col === "officials" ? " · Barangays show only the Punong Barangay and SK Chairperson." : ""}</p>
      <div class="llist">${rows || `<div class="a-empty">Nothing here yet. Click “Add ${m.one}”.</div>`}</div>`;
  }

  /* ---------- edit form (slide-in panel) ---------- */
  function field(f, r) {
    const v = r[f.k] == null ? "" : r[f.k], id = "f_" + f.k, H = L.hx, hint = f.hint ? `<span class="hint">${f.hint}</span>` : "";
    const opt = o => { const [a, b] = Array.isArray(o) ? o : [o, o]; return `<option value="${H(a)}" ${String(a) === String(v) ? "selected" : ""}>${H(b)}</option>`; };
    switch (f.t) {
      case "area": return `<label>${f.l}${hint}<textarea name="${f.k}" rows="${f.rows || 4}" ${f.max ? `maxlength="${f.max}"` : ""} ${f.req ? "required" : ""}>${H(v)}</textarea></label>`;
      case "select": return `<label>${f.l}${hint}<select name="${f.k}">${f.opts.map(opt).join("")}</select></label>`;
      case "brgy": return `<label>${f.l}${hint}<select name="${f.k}">${f.blank ? `<option value="">—</option>` : ""}${["Poblacion", ...BRN()].map(opt).join("")}<option value="To be confirmed" ${v === "To be confirmed" ? "selected" : ""}>To be confirmed</option></select></label>`;
      case "check": return `<label class="chk"><input type="checkbox" name="${f.k}" ${v ? "checked" : ""}> ${f.l}</label>`;
      case "number": return `<label>${f.l}${hint}<input type="number" name="${f.k}" value="${H(v)}" min="0"></label>`;
      case "date": case "time": return `<label>${f.l}${hint}<input type="${f.t}" name="${f.k}" value="${H(v)}" ${f.req ? "required" : ""}></label>`;
      case "geo": return `<div class="fld">${f.l}<span class="hint">${v ? "✔ Boundary uploaded. Choose a new file to replace it." : "No boundary yet. Upload a KML from Google My Maps, or GeoJSON from QGIS / geojson.io."}</span><input type="file" accept=".geojson,.json,.kml,application/geo+json,application/json,application/vnd.google-earth.kml+xml" data-geo>${v ? `<label class="chk"><input type="checkbox" name="geo_rm"> Remove the current boundary</label>` : ""}</div>`;
      case "facts": return `<div class="fld">${f.l}<div id="facts">${(v || []).map(factRow).join("")}</div><button type="button" class="chip sm" data-addfact>+ Add fact</button></div>`;
      case "photos": case "cover": { const max = f.t === "cover" ? 1 : f.max || C.MAX_PHOTOS_PER_ITEM;
        return `<div class="fld">${f.l} <span class="hint">Up to ${max}. Photos are resized and compressed automatically.</span><div class="up" data-max="${max}"><div class="up-list" id="upList"></div>
          <label class="up-drop"><input type="file" accept="image/*" ${max > 1 ? "multiple" : ""} data-upload hidden><span>📷 Add photo${max > 1 ? "s" : ""}</span><small>JPG, PNG or WebP · up to ${C.IMAGE_MAX_INPUT_MB} MB each</small></label></div><span class="hint" id="upStat"></span></div>`; }
      default: return `<label>${f.l}${hint}<input name="${f.k}" value="${H(v)}" ${f.req ? "required" : ""} ${f.max ? `maxlength="${f.max}"` : ""} ${f.list ? `list="dl_${f.k}"` : ""}>${f.list ? `<datalist id="dl_${f.k}">${f.list.map(x => `<option value="${H(x)}">`).join("")}</datalist>` : ""}</label>`;
    }
  }
  const factRow = ([a, b] = ["", ""]) => `<div class="factrow"><input class="inp" placeholder="Label" value="${L.hx(a)}" data-fa><input class="inp" placeholder="Value" value="${L.hx(b)}" data-fb><button type="button" class="chip sm danger" data-rmfact aria-label="Remove fact">×</button></div>`;
  function openEdit(modKey, id) {
    mustCan(modKey);
    const m = MODS[modKey], rec = id ? JSON.parse(JSON.stringify(API.get(m.col, id))) : Object.assign({ id: "" }, m.def());
    A.edit = { modKey, id, rec }; A.removed = [];
    A.photos = (rec.photos || []).slice(); A.cover = rec.cover || "";
    const isNews = m.col === "news";
    const panel = document.createElement("div"); panel.className = "editp"; panel.innerHTML = `<div class="editp-in ${isNews ? "with-prev" : ""}" role="dialog" aria-modal="true" aria-labelledby="et">
      <header><div><h2 id="et">${id ? "Edit" : "Add"} ${m.one}</h2>${id ? `<span class="fine">ID: <code>${L.hx(id)}</code> <button type="button" class="link-b" data-copyid="${L.hx(id)}">copy</button> · use this ID in config.js for map coordinates</span>` : ""}</div><button class="x" data-eclose aria-label="Close">×</button></header>
      <div class="editp-body"><form class="frm" id="edf" novalidate>${m.fields.map(f => field(f, rec)).join("")}<span class="err" id="ederr" role="alert"></span></form>${isNews ? `<div class="prev"><div class="eyebrow">Live preview</div><div id="npv"></div></div>` : ""}</div>
      <footer><button class="btn g" data-eclose>Cancel</button><button class="btn p" data-esave>${id ? "Save changes" : "Add " + m.one}</button></footer></div>`;
    document.body.appendChild(panel); requestAnimationFrame(() => panel.classList.add("open"));
    drawPhotos(); if (isNews) newsPreview();
    const f = L.qs("#edf input:not([type=file]), #edf select, #edf textarea"); if (f) f.focus();
  }
  function closeEdit() { const p = L.qs(".editp"); if (!p) return; p.classList.remove("open"); setTimeout(() => p.remove(), 300); A.edit = null; }
  function drawPhotos() {
    const box = L.qs("#upList"); if (!box) return;
    const isCover = A.edit && MODS[A.edit.modKey].fields.some(f => f.t === "cover"), list = isCover ? (A.cover ? [A.cover] : []) : A.photos;
    box.innerHTML = list.map((p, i) => `<div class="up-i"><img src="${L.hx(p)}" alt="Photo ${i + 1}">${i === 0 && !isCover ? `<span class="tag" style="position:absolute;left:6px;top:6px">Main</span>` : ""}<div class="up-a">${i > 0 ? `<button type="button" data-pmain="${i}" title="Make main photo">★</button>` : ""}<button type="button" data-prm="${i}" title="Remove">×</button></div></div>`).join("");
    const drop = L.qs(".up-drop"), max = +L.qs(".up").dataset.max; if (drop) drop.hidden = list.length >= max;
  }
  async function handleUpload(input) {
    const isCover = MODS[A.edit.modKey].fields.some(f => f.t === "cover"), max = +L.qs(".up").dataset.max, cur = isCover ? (A.cover ? 1 : 0) : A.photos.length;
    const files = [...input.files].slice(0, Math.max(0, max - cur)), stat = L.qs("#upStat"); input.value = "";
    let before = 0, after = 0;
    for (const file of files) {
      stat.textContent = `Compressing ${file.name}…`;
      try { const r = await API.files.upload(file); before += r.before; after += r.after; if (isCover) { if (A.cover) A.removed.push(A.cover); A.cover = r.url; } else A.photos.push(r.url); drawPhotos(); }
      catch (e) { L.toast(e.message); }
    }
    if (before) stat.textContent = `Compressed ${(before / 1048576).toFixed(1)} MB → ${(after / 1024).toFixed(0)} KB (saved ${Math.round((1 - after / before) * 100)}%).`;
    else stat.textContent = "";
    if (A.edit && MODS[A.edit.modKey].col === "news") newsPreview();
  }
  function readForm() {
    const m = MODS[A.edit.modKey], f = L.qs("#edf"), out = {};
    for (const d of m.fields) {
      if (d.t === "photos") { out.photos = A.photos.slice(); continue; }
      if (d.t === "cover") { out.cover = A.cover; continue; }
      if (d.t === "geo") continue;
      if (d.t === "facts") { out.facts = L.qsa(".factrow", f).map(r => [L.qs("[data-fa]", r).value.trim(), L.qs("[data-fb]", r).value.trim()]).filter(([a, b]) => a || b); continue; }
      if (d.t === "check") { out[d.k] = f.elements[d.k].checked; continue; }
      const v = f.elements[d.k].value.trim();
      out[d.k] = d.t === "number" ? Number(v) || 0 : v;
    }
    return out;
  }
  /* ---------- GeoJSON boundaries (simplified to stay small) ---------- */
  const normN = t => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  function featuresOf(o) {
    if (!o || typeof o !== "object") return [];
    if (o.type === "FeatureCollection") return o.features || [];
    if (o.type === "Feature") return [o];
    if (o.type === "Polygon" || o.type === "MultiPolygon") return [{ type: "Feature", properties: {}, geometry: o }];
    if (o.type === "GeometryCollection") return (o.geometries || []).map(g => ({ type: "Feature", properties: {}, geometry: g }));
    return [];
  }
  function simplify(gm) {
    const rnd = c => [Math.round(c[0] * 1e5) / 1e5, Math.round(c[1] * 1e5) / 1e5];
    const ring = r => { const k = Math.max(1, Math.ceil(r.length / 250)), o = r.filter((_, i) => i % k === 0 || i === r.length - 1).map(rnd); return o.length >= 4 ? o : r.map(rnd); };
    if (!gm) return null;
    const ok = c => Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90;
    if (gm.type === "Polygon") { if (!ok(gm.coordinates[0][0])) throw new Error("Coordinates must be longitude/latitude (EPSG:4326)."); return { type: "Polygon", coordinates: gm.coordinates.map(ring) }; }
    if (gm.type === "MultiPolygon") { if (!ok(gm.coordinates[0][0][0])) throw new Error("Coordinates must be longitude/latitude (EPSG:4326)."); return { type: "MultiPolygon", coordinates: gm.coordinates.map(p => p.map(ring)) }; }
    return null;
  }
  const featName = f => Object.values(f.properties || {}).filter(v => typeof v === "string");
  const GEO_MAX = 5 * 1048576;
  /* Google My Maps exports KML: read its polygons (Placemark > Polygon) as GeoJSON features. */
  function kmlFeatures(text) {
    const doc = new DOMParser().parseFromString(text, "application/xml");
    if (doc.getElementsByTagName("parsererror").length) throw new Error("That KML file could not be read.");
    const ring = el => { const c = el && el.getElementsByTagName("coordinates")[0]; return c ? c.textContent.trim().split(/\s+/).map(t => t.split(",").slice(0, 2).map(Number)).filter(p => p.length === 2 && p.every(Number.isFinite)) : []; };
    const out = [];
    for (const pm of doc.getElementsByTagName("Placemark")) {
      const nm = pm.getElementsByTagName("name")[0], name = nm ? nm.textContent.trim() : "";
      const polys = [...pm.getElementsByTagName("Polygon")].map(pg => { const outer = ring(pg.getElementsByTagName("outerBoundaryIs")[0]), inner = [...pg.getElementsByTagName("innerBoundaryIs")].map(ring).filter(r => r.length >= 4); return outer.length >= 4 ? [outer, ...inner] : null; }).filter(Boolean);
      if (polys.length) out.push({ type: "Feature", properties: { name }, geometry: polys.length === 1 ? { type: "Polygon", coordinates: polys[0] } : { type: "MultiPolygon", coordinates: polys } });
    }
    return out;
  }
  /* Read a GeoJSON or KML file. If it covers more than Loboc (e.g. a whole-province file), keep only Loboc's shapes. */
  async function shapesOf(file) {
    const text = await file.text(); let fs;
    if (/\.kml$/i.test(file.name) || /^\s*<(\?xml|kml)/i.test(text)) fs = kmlFeatures(text);
    else { let o; try { o = JSON.parse(text); } catch (e) { throw new Error("That file is not valid GeoJSON or KML."); } fs = featuresOf(o); }
    fs = fs.filter(f => f.geometry && /Polygon/.test(f.geometry.type));
    const inLoboc = fs.filter(f => featName(f).some(v => normN(v) === "loboc"));
    return inLoboc.length ? inLoboc : fs;
  }
  async function readGeo(file, name) {
    if (file.size > GEO_MAX) throw new Error("That boundary file is over 5 MB. Simplify it first (e.g. mapshaper.org).");
    const fs = await shapesOf(file); if (!fs.length) throw new Error("No polygon shapes found in that file.");
    const f = fs.find(x => featName(x).some(v => normN(v) === normN(name))) || fs[0];
    return { type: "Feature", properties: { name }, geometry: simplify(f.geometry) };
  }
  async function importAll(file) {
    const st = L.qs("#geoStat"); st.textContent = "Reading…";
    if (file.size > GEO_MAX) { st.textContent = "That file is over 5 MB. Simplify it first (e.g. mapshaper.org)."; return; }
    try {
      const fs = await shapesOf(file); let n = 0; const miss = [];
      if (!fs.length) { st.textContent = "No polygon shapes found in that file."; return; }
      for (const b of API.list("brgys")) { const f = fs.find(x => featName(x).some(v => normN(v) === normN(b.name) || normN(v).endsWith(normN(b.name)))); if (f) { b.boundary = { type: "Feature", properties: { name: b.name }, geometry: simplify(f.geometry) }; await API.save("brgys", b); n++; } else miss.push(b.name); }
      L.toast(`Boundaries imported for ${n} barangay(s)`); rerender();
      const s2 = L.qs("#geoStat"); if (s2) s2.textContent = miss.length ? `Not matched: ${miss.join(", ")}` : "All barangays matched.";
    } catch (e) { st.textContent = e.message; }
  }

  async function saveEdit() {
    const m = MODS[A.edit.modKey], err = L.qs("#ederr"), out = readForm(); err.textContent = "";
    for (const d of m.fields) if (d.req && !String(out[d.k] || "").trim()) { err.textContent = `${d.l} is required.`; const el = L.qs(`#edf [name="${d.k}"]`); if (el) el.focus(); return; }
    if (m.col === "officials") {
      if (out.group === "barangay") {
        if (!["Punong Barangay", "SK Chairperson"].includes(out.role)) return err.textContent = "Barangay officials can only be “Punong Barangay” or “SK Chairperson”.";
        if (!out.brgy) return err.textContent = "Choose the barangay.";
        const dup = API.list("officials").find(o => o.group === "barangay" && o.brgy === out.brgy && o.role === out.role && o.id !== A.edit.id);
        if (dup) return err.textContent = `${out.brgy} already has a ${out.role}. Edit that entry instead.`;
      } else out.brgy = "";
    }
    if (m.col === "news" && out.expires && out.expires < out.date) return err.textContent = "“Hide after” must be after the publish date.";
    if (m.col === "news" && !A.edit.id) out.author = me().name;
    if (m.col === "brgys") {
      const gf = L.qs("#edf [data-geo]"), rm = L.qs('#edf [name="geo_rm"]');
      try { if (gf && gf.files[0]) out.boundary = await readGeo(gf.files[0], out.name); else if (rm && rm.checked) out.boundary = null; } catch (e) { return err.textContent = e.message; }
      const old = A.edit.rec.name;
      if (old && old !== out.name) { if (API.list("brgys").some(b => b.name === out.name && b.id !== A.edit.id)) return err.textContent = "Another barangay already has that name.";
        for (const col of ["officials", "places", "listings"]) for (const r of API.list(col).filter(r => r.brgy === old)) { r.brgy = out.name; await API.save(col, r); } }
    }
    const rec = Object.assign(A.edit.rec, out);
    const btn = L.qs("[data-esave]"); btn.disabled = true;
    try { await API.save(m.col, rec); await API.files.removeMany(A.removed); closeEdit(); L.toast(A.edit && A.edit.id ? "Saved" : "Saved"); rerender(); }
    catch (e) { err.textContent = e.message; btn.disabled = false; }
  }
  function newsPreview() {
    const box = L.qs("#npv"); if (!box) return; const f = L.qs("#edf"), g = k => f.elements[k] ? f.elements[k].value : "";
    box.innerHTML = `<article class="card news-card ${f.elements.pinned && f.elements.pinned.checked ? "pin" : ""}">${L.ph(g("title") || "Headline", A.cover ? [A.cover] : null, g("type"))}<div class="cb"><div class="meta"><span class="tag ${g("type") === "Announcement" ? "gold" : ""}">${L.hx(g("type"))}</span>${f.elements.pinned && f.elements.pinned.checked ? `<span class="tag">📌 Pinned</span>` : ""}<span class="fine">${L.fmtDate(g("date"))}</span></div>
      <h3>${L.hx(g("title") || "Your headline appears here")}</h3><p style="white-space:pre-wrap">${L.hx((g("body") || "Start writing to see the preview.").slice(0, 400))}</p></div></article>
      <p class="fine">Status: <b>${L.hx(g("status"))}</b>${g("status") !== "Published" ? " (not visible to the public)" : ""}</p>`;
  }
  function confirmBox(title, text, onYes) {
    L.openModal(`${L.mhead(title)}<p>${text}</p><div class="chips"><button class="btn p" data-yes>Delete</button><button class="btn g" data-close>Cancel</button></div>`);
    L.qs("[data-yes]").onclick = async () => { try { await onYes(); } catch (er) { L.closeModal(); return actionFailed(er); } L.closeModal(); rerender(); };
  }

  /* ---------- inbox ---------- */
  function inbox() {
    const all = API.messages(), f = A.f === "All" ? "Active" : A.f;
    const a = all.filter(m => f === "Active" ? m.status !== "Archived" : m.status === f).filter(m => !A.q || JSON.stringify(m).toLowerCase().includes(A.q.toLowerCase()));
    const cur = A.msg && all.find(m => m.id === A.msg);
    const cnt = s => all.filter(m => s === "Active" ? m.status !== "Archived" : m.status === s).length;
    return `<div class="ltools"><input class="inp" type="search" data-aq placeholder="Search messages…" value="${L.hx(A.q)}" aria-label="Search messages"><div class="chips">${[["Active", "All"], ["New", "New"], ["Replied", "Replied"], ["Archived", "Archived"]].map(([k, l]) => `<button class="chip sm" data-af="${k}" aria-pressed="${f === k}">${l} (${cnt(k)})</button>`).join("")}</div></div>
      <div class="mail"><div class="mail-l">${a.map(m => `<button class="mail-i ${m.status === "New" ? "unread" : ""}" data-msg="${m.id}" ${cur && cur.id === m.id ? 'aria-current="true"' : ""}><span class="av">${L.hx(L.initials(m.name))}</span><span><b>${L.hx(m.name)}</b><span class="fine" style="float:right">${L.fmtDate(m.created)}</span><br><span class="sj">${L.hx(m.subject)}</span><br><span class="fine">${L.hx(m.body.slice(0, 70))}</span></span></button>`).join("") || `<div class="a-empty">No messages.</div>`}</div>
      <div class="mail-r">${cur ? `<div class="sec-h" style="margin-bottom:8px"><div><h3 style="font-size:1.3rem">${L.hx(cur.subject)}</h3><span class="fine">${L.hx(cur.name)} · <a href="mailto:${L.hx(cur.email)}">${L.hx(cur.email)}</a></span></div><div class="chips"><button class="chip sm" data-mst="${cur.status === "Archived" ? "Read" : "Archived"}">${cur.status === "Archived" ? "Restore" : "Archive"}</button><button class="chip sm danger" data-mdel>Delete</button></div></div>
        <div class="bubble me"><small>${L.hx(cur.name)} · ${L.fmtWhen(cur.created)}</small>${L.hx(cur.body)}</div>${cur.replies.map(r => `<div class="bubble staff"><small>${L.hx(r.by)} · ${L.fmtWhen(r.at)}</small>${L.hx(r.body)}</div>`).join("")}
        <form class="frm" id="replyf" style="margin-top:16px"><label>Reply to ${L.hx(cur.email)}<textarea name="body" rows="5" required placeholder="Write your reply…"></textarea></label><span class="err" id="rperr"></span>
          <div class="chips"><button class="btn p" type="submit">Send reply</button></div><span class="hint">${API.mode === "demo" ? "Preview mode: the reply is saved and shown in the tourist's account. Once live, it is also emailed to their Gmail." : "The reply is emailed to the tourist."}</span></form>` : `<div class="a-empty">Select a message to read and reply.</div>`}</div></div>`;
  }

  /* ---------- reviews ---------- */
  function reviews() {
    const a = API.reviews().slice().reverse().filter(r => (A.f === "All" || r.status === A.f || (A.f === "Low (1–2★)" && r.rating <= 2)) && (!A.q || JSON.stringify(r).toLowerCase().includes(A.q.toLowerCase())));
    return `<div class="ltools"><input class="inp" type="search" data-aq placeholder="Search reviews…" value="${L.hx(A.q)}" aria-label="Search reviews"><div class="chips">${["All", "Published", "Hidden", "Low (1–2★)"].map(s => `<button class="chip sm" data-af="${s}" aria-pressed="${A.f === s}">${s}</button>`).join("")}</div></div>
      <p class="fine">Emails are visible to staff only. Hide reviews that are spam or abusive.</p>
      <div class="llist">${a.map(r => `<div class="lrow"><div class="lthumb"><span class="av">${L.hx(L.initials(r.name))}</span></div><div class="lmain"><b>${L.stars(r.rating)} ${L.hx(r.name)} <span class="fine">on</span> ${L.hx(r.targetName || r.target)}</b><span class="fine">${L.hx(r.email)} · ${L.fmtWhen(r.created)}${r.visit ? " · " + L.hx(r.visit) : ""}</span><span>${L.hx(r.text)}</span>${r.status === "Hidden" ? `<div class="lb"><span class="tag mute">Hidden</span></div>` : ""}</div>
        <div class="lacts"><button class="chip sm" data-rvst="${r.id}:${r.status === "Hidden" ? "Published" : "Hidden"}">${r.status === "Hidden" ? "Show" : "Hide"}</button><button class="chip sm danger" data-rvdel="${r.id}">Delete</button></div></div>`).join("") || `<div class="a-empty">No reviews yet.</div>`}</div>`;
  }

  /* ---------- users ---------- */
  function users() {
    const u = me(), a = API.users().filter(x => !A.q || (x.email + x.name).toLowerCase().includes(A.q.toLowerCase())).filter(x => A.f === "All" || x.role === A.f);
    return `<div class="ltools"><input class="inp" type="search" data-aq placeholder="Search users…" value="${L.hx(A.q)}" aria-label="Search users"><div class="chips">${["All", "admin", "pio", "tourist"].map(s => `<button class="chip sm" data-af="${s}" aria-pressed="${A.f === s}">${s === "All" ? "All" : s.toUpperCase()}</button>`).join("")}</div></div>
      <div class="panel" style="margin-bottom:16px"><b>How staff accounts work</b><p class="fine" style="margin:4px 0 0"><b>Admin</b>: full access to everything. <b>PIO</b>: News &amp; announcements and Events only. <b>Tourist</b>: rates places, books and sends messages. To make someone staff, ask them to sign up with their Gmail, then change their role here.</p></div>
      <div class="llist">${a.map(x => `<div class="lrow"><div class="lthumb"><span class="av">${L.hx(L.initials(x.name))}</span></div><div class="lmain"><b>${L.hx(x.name)}</b><span class="fine">${L.hx(x.email)} · joined ${L.fmtDate(x.created)}</span><div class="lb">${x.verified ? `<span class="tag">Verified</span>` : `<span class="tag gold">Not verified</span>`}</div></div>
        <div class="lacts"><select class="inp" style="min-height:38px;width:auto" data-role="${x.id}" ${x.id === u.id ? "disabled title='You cannot change your own role'" : ""} aria-label="Role">${["tourist", "pio", "admin"].map(r => `<option value="${r}" ${r === x.role ? "selected" : ""}>${r.toUpperCase()}</option>`).join("")}</select>${x.id === u.id ? "" : `<button class="chip sm danger" data-udel="${x.id}">Remove</button>`}</div></div>`).join("")}</div>`;
  }

  /* ---------- settings ---------- */
  const SET = [["landHeadline", "Landing page headline (words in [brackets] are highlighted; new line = line break)", "area"], ["landSub", "Landing page text (**bold**)", "area"], ["heroTitle", "Homepage big title"], ["quote", "Quote (homepage & footer)"], ["heroSub", "Homepage subtitle"], ["welcomeTitle", "Welcome heading"], ["welcomeText", "Welcome text", "area"], ["officeName", "Office name"], ["officeAddress", "Office address"], ["officeHours", "Office hours"], ["hymnTitle", "Hymn title"], ["hymnLyrics", "Hymn lyrics (About page)", "area"]];
  function settings() {
    const s = API.settings();
    return `<div class="two"><form class="frm panel" id="setf">${SET.map(([k, l, t]) => t === "area" ? `<label>${l}<textarea name="${k}" rows="5">${L.hx(s[k])}</textarea></label>` : `<label>${l}<input name="${k}" value="${L.hx(s[k])}"></label>`).join("")}<button class="btn p" type="submit">Save settings</button></form>
      <div><div class="panel"><h3>Set in config.js (VS Code)</h3><p class="fine">These are kept in the code on purpose, so they don't change by accident:</p><ul class="fine" style="padding-left:18px"><li>Logo file, hymn file and hero video</li><li>Facebook and other social media links</li><li>Map coordinates for every Directions button</li><li>Photo size and quality limits</li><li>Backend keys when going live</li></ul></div>${storageMeter()}</div></div>`;
  }

  /* ---------- events ---------- */
  document.addEventListener("click", async e => { try { await onAdminClick(e); } catch (er) { actionFailed(er); } });
  async function onAdminClick(e) {
    if (!document.body.classList.contains("dash")) return;
    const t = e.target, c = s => t.closest(s); let x;
    if ((x = c("[data-go]"))) { if (!can(x.dataset.go)) return; A.mod = x.dataset.go; A.q = ""; A.f = "All"; A.msg = null; A.nav = false; history.replaceState(null, "", "#admin/" + A.mod); render(); window.scrollTo(0, 0); return; }
    if (c("[data-anav]")) { A.nav = !A.nav; L.qs(".adm").classList.toggle("nav-open", A.nav); return; }
    if (c("[data-alogout]")) { await API.signOut(); L.toast("Logged out"); if (location.hash === "#home") L.route(); else location.hash = "home"; return; }
    if ((x = c("[data-af]"))) { A.f = x.dataset.af; rerender(); return; }
    if ((x = c("[data-new]"))) { const k = x.dataset.new; if (k !== A.mod) { A.mod = k; A.f = "All"; A.q = ""; render(); } return openEdit(k); }
    if ((x = c("[data-edit]"))) { const [col, id] = x.dataset.edit.split(":"); return openEdit(Object.keys(MODS).find(k => MODS[k].col === col), id); }
    if ((x = c("[data-boffs]"))) { A.mod = "officials"; A.f = "barangay"; A.q = x.dataset.boffs; history.replaceState(null, "", "#admin/officials"); render(); return; }
    if ((x = c("[data-tog]"))) { const [col, id] = x.dataset.tog.split(":"); mustCan(modOf(col)); const r = API.get(col, id); r.pub = r.pub === false; await API.save(col, r); L.toast(r.pub ? "Now visible on the website" : "Hidden from the website"); rerender(); return; }
    if ((x = c("[data-del]"))) { const [col, id] = x.dataset.del.split(":"), r = API.get(col, id), mk = modOf(col); mustCan(mk); return confirmBox(`Delete this ${MODS[mk].one}?`, `“${L.hx(MODS[mk].row(r).title)}” and its photos will be removed. This can't be undone.`, () => API.remove(col, id)); }
    if (c("[data-eclose]") || t.classList.contains("editp")) return closeEdit();
    if (c("[data-esave]")) return saveEdit();
    if ((x = c("[data-copyid]"))) { try { await navigator.clipboard.writeText(x.dataset.copyid); L.toast("ID copied"); } catch (er) { L.toast(x.dataset.copyid); } return; }
    if ((x = c("[data-prm]"))) { const i = +x.dataset.prm, isCover = MODS[A.edit.modKey].fields.some(f => f.t === "cover"); if (isCover) { A.removed.push(A.cover); A.cover = ""; } else A.removed.push(...A.photos.splice(i, 1)); drawPhotos(); if (MODS[A.edit.modKey].col === "news") newsPreview(); return; }
    if ((x = c("[data-pmain]"))) { const i = +x.dataset.pmain; A.photos.unshift(...A.photos.splice(i, 1)); drawPhotos(); return; }
    if (c("[data-addfact]")) { L.qs("#facts").insertAdjacentHTML("beforeend", factRow()); return; }
    if ((x = c("[data-rmfact]"))) { x.parentElement.remove(); return; }
    if ((x = c("[data-msg]"))) { A.msg = x.dataset.msg; const m = API.messages().find(y => y.id === A.msg); if (m.status === "New") await API.setMessage(m.id, { status: "Read" }); rerender(); return; }
    if ((x = c("[data-mst]"))) { await API.setMessage(A.msg, { status: x.dataset.mst }); L.toast(x.dataset.mst === "Archived" ? "Archived" : "Restored"); rerender(); return; }
    if (c("[data-mdel]")) return confirmBox("Delete this message?", "The conversation will be removed.", async () => { await API.removeMessage(A.msg); A.msg = null; });
    if ((x = c("[data-rvst]"))) { const [id, s] = x.dataset.rvst.split(":"); await API.setReview(id, { status: s }); L.toast(s === "Hidden" ? "Review hidden" : "Review visible"); rerender(); return; }
    if ((x = c("[data-rvdel]"))) return confirmBox("Delete this review?", "It will be removed permanently.", () => API.removeReview(x.dataset.rvdel));
    if ((x = c("[data-udel]"))) return confirmBox("Remove this user?", "They will no longer be able to log in.", () => API.removeUser(x.dataset.udel));
    if (c("[data-reset]")) { L.openModal(`${L.mhead("Reset preview data?")}<p>All edits, messages, reviews and accounts saved in this browser will be erased and the sample content restored.</p><div class="chips"><button class="btn p" data-yesreset>Reset</button><button class="btn g" data-close>Cancel</button></div>`); return; }
    if (c("[data-yesreset]")) return API.resetDemo();
  }
  document.addEventListener("change", async e => { try { await onAdminChange(e); } catch (er) { actionFailed(er); } });
  async function onAdminChange(e) {
    if (!document.body.classList.contains("dash")) return;
    const t = e.target;
    if (t.matches("[data-upload]")) return handleUpload(t);
    if (t.matches("[data-geoall]") && t.files[0]) return importAll(t.files[0]);
    if (t.matches("[data-role]")) { await API.setRole(t.dataset.role, t.value); L.toast("Role updated"); return; }
    if (t.closest("#edf")) { if (t.name === "group" && t.value === "barangay") { const r = L.qs('#edf [name="role"]'); if (!["Punong Barangay", "SK Chairperson"].includes(r.value)) r.value = "Punong Barangay"; } newsPreview(); }
  }
  document.addEventListener("input", e => {
    if (!document.body.classList.contains("dash")) return;
    const t = e.target;
    if (t.hasAttribute("data-aq")) { A.q = t.value; const pos = t.selectionStart; render(); const n = L.qs("[data-aq]"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
    if (t.closest("#edf")) newsPreview();
  });
  document.addEventListener("submit", async e => { try { await onAdminSubmit(e); } catch (er) { actionFailed(er); } });
  async function onAdminSubmit(e) {
    if (!document.body.classList.contains("dash")) return;
    const f = e.target; e.preventDefault();
    if (f.id === "replyf") { const b = f.elements.body.value.trim(); if (b.length < 2) return L.qs("#rperr").textContent = "Write a reply first."; await API.replyMessage(A.msg, b); L.toast(API.mode === "demo" ? "Reply saved (emailed once live)" : "Reply sent to the tourist's email"); rerender(); }
    if (f.id === "setf") { await API.saveSettings(Object.fromEntries(new FormData(f))); L.toast("Settings saved"); }
    if (f.id === "edf") saveEdit();
  }
  document.addEventListener("keydown", e => { if (e.key === "Escape" && L && L.qs(".editp")) closeEdit(); });

  window.LobocAdmin = { render };
})();
