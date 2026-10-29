/* =====================================================================
   DISCOVER LOBOC · PUBLIC SITE
   Pages are built from the data in API (see api.js). Nothing here needs
   editing for normal content changes; use the Admin dashboard instead.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.LOBOC_CONFIG, SEED = window.LOBOC_SEED;
  const qs = (s, r = document) => r.querySelector(s), qsa = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hx = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const S = () => API.settings();
  const pub = col => API.list(col).filter(r => r.pub !== false);
  const byOrder = (a, b) => (a.order || 0) - (b.order || 0);
  const MO = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const fmtDate = d => { if (!d) return ""; const t = new Date(d.length === 10 ? d + "T00:00:00" : d); return isNaN(t) ? "" : t.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }); };
  const fmtWhen = d => { try { return new Date(d).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return ""; } };
  const today = () => new Date().toISOString().slice(0, 10);
  const initials = n => (n || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const peso = n => "₱" + Number(n).toLocaleString("en-PH");

  /* ---------- toast & modal ---------- */
  let hymnTuck; addEventListener("scroll", () => { const h = document.getElementById("hymn"); if (!h) return; h.classList.add("tuck"); clearTimeout(hymnTuck); hymnTuck = setTimeout(() => h.classList.remove("tuck"), 1200); }, { passive: true });
  const toast = t => { const e = qs("#toast"); e.textContent = t; e.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("show"), 2000); };
  const modal = qs("#modal"), mb = qs("#mb"); let lastFocus = null;
  function openModal(h, wide) {
    mb.className = "mb" + (wide ? " wide" : ""); mb.innerHTML = h; lastFocus = document.activeElement;
    modal.classList.add("open"); document.body.style.overflow = "hidden";
    const f = qs("input:not([type=hidden]):not([readonly]), textarea, select, button.x", mb); if (f) f.focus();
  }
  function closeModal() { modal.classList.remove("open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  const mhead = t => `<div class="mh"><h3 id="mt">${t}</h3><button class="x" data-close aria-label="Close">×</button></div>`;

  /* ---------- logo (official file with a drawn fallback) ---------- */
  const LOGO_FALLBACK = `<svg viewBox="0 0 64 64" role="img" aria-label="Loboc"><circle cx="32" cy="32" r="31" fill="#8CCB55"/><circle cx="32" cy="32" r="26" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/><path d="M8 40c6-5 10 4 16 0s10 4 16 0 10 4 16 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M8 47c6-5 10 4 16 0s10 4 16 0 10 4 16 0" fill="none" stroke="#2A7FC4" stroke-width="2.4" stroke-linecap="round"/><path d="M28 34V16l12-4v16" fill="none" stroke="#1C3D12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="25" cy="34" rx="4.4" ry="3.4" fill="#1C3D12"/><ellipse cx="37" cy="28" rx="4.4" ry="3.4" fill="#1C3D12"/></svg>`;
  window.LOBOC_LOGO_FALLBACK = img => { const s = document.createElement("span"); s.innerHTML = LOGO_FALLBACK; img.replaceWith(s.firstChild); };
  // One listener replaces inline onerror="" attributes (needed for the Content Security Policy)
  document.addEventListener("error", e => {
    const t = e.target, f = t && t.dataset && t.dataset.fb; if (!f) return;
    if (f === "logo") window.LOBOC_LOGO_FALLBACK(t);
    else if (f === "partner") window.LOBOC_PARTNER_FALLBACK(t);
    else if (f === "remove") t.remove();
    else if (f === "parent" && t.parentNode) t.parentNode.remove();
    else if (f === "video" && t.parentNode) t.parentNode.innerHTML = '<p class="fine" style="color:#fff;padding:20px">The video file has not been added yet.</p>';
  }, true);
  const logo = () => C.LOGO_SRC ? `<img src="${hx(C.LOGO_SRC)}" alt="Municipality of Loboc seal" data-fb="logo">` : LOGO_FALLBACK;

  /* ---------- photos ---------- */
  const PAL = ["linear-gradient(135deg,#8CCB55,#2F6420)", "linear-gradient(135deg,#7EC4E8,#2A7FC4)", "linear-gradient(135deg,#B9E28C,#4E8F2A)", "linear-gradient(135deg,#2F6420,#2A7FC4)", "linear-gradient(135deg,#A6D873,#3E8E6E)"];
  const hash = s => [...String(s || "")].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 0);
  function ph(name, photos, cap, i = 0) {
    const src = API.safeImg(Array.isArray(photos) ? photos[i] : photos);
    if (src) return `<div class="ph"><img src="${hx(src)}" alt="${hx(name)}" loading="lazy">${cap ? `<span class="cap">${hx(cap)}</span>` : ""}</div>`;
    const n = ["♪","♫","♩","♬"][hash(name) % 4];
    return `<div class="ph empty" style="background:${PAL[hash(name) % PAL.length]}"><span class="big-n" aria-hidden="true">${n}</span>${cap !== "" ? `<span class="cap">${hx(cap || "Photo coming soon")}</span>` : ""}</div>`;
  }
  let pv = null;
  function viewer(title, photos, i = 0) {
    const list = photos && photos.length ? photos : [null, null, null];
    pv = { title, photos: list, i };
    openModal(`${mhead(hx(title))}<div class="viewer">${list[i] ? ph(title, list, "", i) : ph(title + i, null, `Photo ${i + 1} of ${list.length}`)}</div>
      <div class="thumbs">${list.map((p, k) => `<button data-vth="${k}" aria-label="Photo ${k + 1}" ${k === i ? 'aria-current="true"' : ""}>${p ? ph(title, list, "", k) : ph(title + k, null, "")}</button>`).join("")}</div>
      ${photos && photos.length ? "" : `<p class="fine">Photos will appear here once the LGU uploads them.</p>`}`, true);
  }

  /* ---------- 360° VIRTUAL TOUR ----------------------------------------
     Scenes live in js/tours.js. The viewer (Pannellum, MIT licence) is in
     js/vendor and only loads when someone opens a tour. */
  const tourOf = id => { const t = (window.LOBOC_TOURS || {})[id]; return t && t.scenes && t.scenes.length ? t : null; };
  function tourBtn(id, cls = "") {
    const t = tourOf(id); if (!t) return "";
    const s = t.scenes.find(x => x.id === t.start) || t.scenes[0];
    return `<button class="vtbtn ${cls}" data-tour="${hx(id)}" aria-label="Open the 360° virtual tour of ${hx(t.title)}"><img src="${hx(t.cover || s.thumb || s.img)}" alt="" loading="lazy"><span>${ICON.r360}Virtual Tour</span></button>`;
  }
  let VT = null, pnlLoad = null;
  function loadPannellum() {
    if (window.pannellum) return Promise.resolve();
    if (pnlLoad) return pnlLoad;
    pnlLoad = new Promise((ok, bad) => {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "css/vendor/pannellum.css?v=20261025b"; document.head.appendChild(l);
      const s = document.createElement("script"); s.src = "js/vendor/pannellum.js?v=20261025b"; s.onload = ok; s.onerror = () => { pnlLoad = null; bad(new Error("load")); }; document.head.appendChild(s);
    });
    return pnlLoad;
  }
  function vtArrow(div, label) {
    div.innerHTML = '<div class="chev"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15l7-7 7 7"/></svg></div><span class="lbl"></span>';
    div.querySelector(".lbl").textContent = label; div.setAttribute("title", label);
  }
  async function openTour(id) {
    const t = tourOf(id); if (!t) return;
    closeTour(true);
    const el = document.createElement("div"); el.className = "vt"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Virtual tour: " + t.title);
    el.innerHTML = `<div class="vt-pano" id="vtPano"></div>
      <div class="vt-top"><div class="vt-t"><b>${hx(t.title)}</b><span id="vtName"></span></div>
        <button class="vt-ic" data-vtfs aria-label="Full screen" title="Full screen"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
        <button class="vt-ic" data-vtx aria-label="Close the virtual tour" title="Close (Esc)"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      <div class="vt-load" id="vtLoad"><span></span>Loading 360° view…</div>
      <p class="vt-hint" id="vtHint">Drag to look around · tap the arrows to walk</p>
      <button class="vt-nav prev" data-vtstep="-1" aria-label="Previous spot"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
      <button class="vt-nav next" data-vtstep="1" aria-label="Next spot"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
      <div class="vt-strip" id="vtStrip">${t.scenes.map((s, i) => `<button data-vts="${hx(s.id)}" aria-label="Spot ${i + 1}: ${hx(s.title)}"><img src="${hx(s.thumb || s.img)}" alt="" loading="lazy"><span>${i + 1}. ${hx(s.title)}</span></button>`).join("")}</div>`;
    document.body.appendChild(el); document.documentElement.classList.add("vt-open");
    VT = { id, t, el, v: null, focus: document.activeElement };
    if (!(el.requestFullscreen || el.webkitRequestFullscreen)) qs("[data-vtfs]", el).hidden = true;
    else if (!matchMedia("(pointer:coarse)").matches && el.requestFullscreen) el.requestFullscreen().catch(() => {});
    qs("[data-vtx]", el).focus();
    try { await loadPannellum(); } catch (er) { qs("#vtLoad", el).textContent = "The 360° viewer could not load. Please try again."; return; }
    if (!VT || VT.el !== el) return;
    vtShow(t.start || t.scenes[0].id);
  }
  /* Opened as a double-clicked file (no server), browsers block loading the
     .jpg into the 3D viewer. Each photo then has a .js copy (same name) that
     holds the picture as text, which browsers do allow. Online, the .jpg is used. */
  const vtFile = () => location.protocol === "file:";
  const vtScript = src => new Promise((ok, bad) => { const s = document.createElement("script"); s.src = src; s.onload = () => { s.remove(); ok(); }; s.onerror = () => { s.remove(); bad(new Error("load")); }; document.head.appendChild(s); });
  /* Photos are loaded and decoded ahead of time (current spot + the spots one
     step away), so a step can start blending almost at once. */
  const vtImgs = new Map();
  function vtImage(s) {
    if (vtImgs.has(s.img)) return vtImgs.get(s.img);
    const p = (async () => {
      let src = s.img;
      if (vtFile()) {
        window.LOBOC_PANO = window.LOBOC_PANO || {};
        if (!window.LOBOC_PANO[s.img]) await vtScript(s.img.replace(/\.jpe?g$/i, ".js"));
        src = window.LOBOC_PANO[s.img]; if (!src) throw new Error("missing");
      }
      const img = new Image(); if (!vtFile()) img.crossOrigin = "anonymous"; img.src = src;
      if (img.decode) await img.decode(); else await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; });
      return img;
    })();
    p.catch(() => vtImgs.delete(s.img));
    vtImgs.set(s.img, p); return p;
  }
  function vtUpd() {
    if (!VT) return; const { t, el, cur } = VT, i = t.scenes.findIndex(s => s.id === cur); if (i < 0) return;
    qs("#vtName", el).textContent = `Spot ${i + 1} of ${t.scenes.length} · ${t.scenes[i].title}`;
    qsa("[data-vts]", el).forEach(b => { const on = b.dataset.vts === cur; b.toggleAttribute("aria-current", on); if (on) b.scrollIntoView({ block: "nearest", inline: "center", behavior: RM ? "auto" : "smooth" }); });
    qs(".vt-nav.prev", el).disabled = i <= 0; qs(".vt-nav.next", el).disabled = i >= t.scenes.length - 1;
  }
  const vtHintOff = () => { const h = VT && qs("#vtHint", VT.el); if (h) h.classList.add("gone"); };
  async function vtShow(sceneId, view, walking) {
    if (!VT) return; const { t, el } = VT, s = t.scenes.find(x => x.id === sceneId); if (!s) return;
    const tok = VT.tok = (VT.tok || 0) + 1, load = qs("#vtLoad", el);
    load.innerHTML = "<span></span>Loading 360° view…"; clearTimeout(VT.loadT);
    VT.loadT = setTimeout(() => { if (VT && VT.tok === tok && VT.shown !== tok) load.hidden = false; }, VT.v ? 900 : 0);
    VT.cur = sceneId; vtUpd();
    let img;
    try { img = await vtImage(s); } catch (er) { if (VT && tok === VT.tok) { load.textContent = "This 360° photo could not load."; load.hidden = false; } return; }
    if (!VT || tok !== VT.tok) return;
    // let the glide get going on screen before the (heavier) new view is set up
    if (walking) { await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); if (!VT || tok !== VT.tok) return; }
    // The step always blends (even with the computer's "reduce motion" setting on,
    // which only makes the glide gentler).
    const glide = walking && !!VT.v, hfov = view ? view.hfov : 100;
    const layer = document.createElement("div"); layer.className = VT.v ? "vt-layer in" : "vt-layer"; qs("#vtPano", el).appendChild(layer);
    // Arriving: the new spot starts a little wider (as if still a step behind) and the
    // camera glides in to the normal view, so the forward motion never stops.
    const v = pannellum.viewer(layer, {
      type: "equirectangular", panorama: img, dynamic: true, dynamicUpdate: true, autoLoad: true,
      yaw: view ? view.yaw : (s.yaw || 0), pitch: view ? view.pitch : (s.pitch || 0), hfov: glide ? Math.min(120, hfov * (RM ? 1.08 : 1.22)) : hfov, minHfov: 40, maxHfov: 120,
      showFullscreenCtrl: false, compass: false, friction: .15,
      hotSpots: (s.links || []).map(k => ({ yaw: k.yaw, pitch: k.pitch == null ? -18 : k.pitch, cssClass: "vt-arrow", createTooltipFunc: vtArrow,
        createTooltipArgs: k.label || (t.scenes.find(x => x.id === k.to) || {}).title || "Walk", clickHandlerFunc: (e, a) => vtWalk(a, e), clickHandlerArgs: k }))
    });
    v.on("error", () => { if (VT && tok === VT.tok) { load.textContent = "This 360° photo could not load."; load.hidden = false; } });
    v.on("mousedown", vtHintOff); v.on("touchstart", vtHintOff);
    requestAnimationFrame(() => {
      v.setUpdate(false); // the photo is already on the graphics chip; draw only when the view moves
      if (!VT || tok !== VT.tok) { try { v.destroy(); } catch (er) {} layer.remove(); return; }
      VT.shown = tok; const old = VT.v, oldLayer = VT.layer, snap = VT.snap; VT.v = v; VT.layer = layer; VT.snap = null;
      // Street View timing: the blend starts about 0.15 s after the click
      const wait = glide ? Math.max(0, (VT.walkStart || 0) + 150 - Date.now()) : 0;
      setTimeout(() => {
        if (!VT || VT.layer !== layer) return;
        load.hidden = true;
        try { const D = Math.PI / 180; v.getRenderer().render(v.getPitch() * D, v.getYaw() * D, v.getHfov() * D, { roll: 0 }); } catch (er) {}
        layer.classList.add("on");
        if (glide) v.setHfov(hfov, RM ? 350 : 420);
      }, wait);
      if (old) setTimeout(() => { try { old.destroy(); } catch (er) {} if (oldLayer) oldLayer.remove(); if (snap) snap.remove(); }, wait + 450);
      vtPreload(s);
    });
  }
  /* Walking (like Street View): zoom straight into the arrow with a motion
     blur, then the next photo snaps in, still facing the same way. */
  /* Copy the current view into a flat picture laid over it. The old 3D view
     is hidden, so the change of photo can never flash black. */
  function vtSnap() {
    if (!VT || !VT.v || !VT.layer || VT.snap) return VT && VT.snap;
    const v = VT.v, layer = VT.layer;
    try {
      const gl = qs("canvas", layer), D = Math.PI / 180;
      v.getRenderer().render(v.getPitch() * D, v.getYaw() * D, v.getHfov() * D, { roll: 0 });
      const c = document.createElement("canvas"), k2 = Math.min(1, 960 / gl.width);
      c.width = Math.round(gl.width * k2); c.height = Math.round(gl.height * k2);
      c.getContext("2d", { willReadFrequently: true }).drawImage(gl, 0, 0, c.width, c.height);
      c.className = "vt-snap"; layer.after(c); layer.style.visibility = "hidden"; VT.snap = c; return c;
    } catch (er) { return null; }
  }
  function vtWalk(k, e) {
    if (!VT || VT.cur === k.to || Date.now() < (VT.walkUntil || 0)) return; const v = VT.v, layer = VT.layer;
    const view = v ? { yaw: k.targetYaw != null ? k.targetYaw : v.getYaw() + (k.turn || 0), pitch: 0, hfov: v.getHfov() } : null;
    if (v && layer) {
      v.stopMovement && v.stopMovement();
      // glide toward the arrow's direction, on the horizon (like Street View)
      const r = layer.getBoundingClientRect(), hs = e && e.target && e.target.closest ? e.target.closest(".vt-arrow") : null;
      const x = hs ? hs.getBoundingClientRect().left + hs.offsetWidth / 2 - r.left : r.width / 2;
      const fx = vtSnap() || layer;
      fx.style.transformOrigin = `${Math.max(r.width * .2, Math.min(r.width * .8, x))}px 50%`;
      VT.walkStart = Date.now(); VT.walkUntil = VT.walkStart + 250;
      fx.getBoundingClientRect(); // lock in the starting size, then start the glide right away
      fx.classList.add("warp", ...(RM ? ["soft"] : []));
    }
    vtShow(k.to, view, true);
  }
  /* Prepare the photos one step away (and forget ones further away, to save memory). */
  function vtPreload(s) {
    if (!VT) return;
    const keep = new Set([s.img]);
    (s.links || []).forEach(k => { const n = VT.t.scenes.find(x => x.id === k.to); if (n) { keep.add(n.img); vtImage(n).catch(() => {}); } });
    [...vtImgs.keys()].forEach(k => { if (!keep.has(k)) vtImgs.delete(k); });
  }
  function vtGo(sceneId) { if (VT && sceneId && VT.cur !== sceneId) { vtSnap(); vtShow(sceneId); } }
  function closeTour(quiet) {
    if (!VT) return; const { el, v, focus } = VT; VT = null; vtImgs.clear();
    try { if (v) v.destroy(); } catch (er) {}
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    el.remove(); document.documentElement.classList.remove("vt-open");
    if (!quiet && focus && focus.focus) focus.focus();
  }
  function vtFull() {
    if (!VT) return; const el = VT.el;
    if (document.fullscreenElement) return document.exitFullscreen().catch(() => {});
    const rq = el.requestFullscreen || el.webkitRequestFullscreen;
    if (rq) { const r = rq.call(el); if (r && r.catch) r.catch(() => toast("Full screen is not available on this device")); }
    else toast("Already full screen. On iPhone, turn your phone sideways for a wider view.");
  }

  /* ---------- decorations ---------- */
  const NOTE_CH = ["♪","♫","♩","♬","𝄞"];
  function notes(n = 6, seed = 1) {
    let h = "";
    for (let i = 0; i < n; i++) { const k = (seed * 7 + i * 13) % 97; h += `<i style="left:${(k * 1.03) % 96}%;top:${(k * 2.7 + i * 17) % 88}%;font-size:${1.4 + (k % 5) * .6}rem;animation-delay:-${k % 9}s">${NOTE_CH[(i + seed) % NOTE_CH.length]}</i>`; }
    return `<div class="notes" aria-hidden="true">${h}</div>`;
  }
  function wave(from, to, flip) {
    const p = o => { let d = flip ? `M0 100H2400V${40 + o}` : `M0 0H2400V${40 + o}`; for (let x = 2400; x > 0; x -= 600) d += `C${x - 150} ${o} ${x - 450} ${80 + o} ${x - 600} ${40 + o}`; return d + "Z"; };
    return `<div class="wave" aria-hidden="true" style="background:${to}"><svg class="b2" viewBox="0 0 2400 100" preserveAspectRatio="none"><path d="${p(flip ? -10 : 10)}" fill="${flip ? "#2A7FC4" : from}"/></svg><svg viewBox="0 0 2400 100" preserveAspectRatio="none"><path d="${p(0)}" fill="${from}"/></svg></div>`;
  }
  const COL = { leaf: "#8CCB55", river: "#DCEEFA", forest: "#2F6420", deep: "#1C3D12", white: "#fff", leafl: "#F3FAEA" };

  /* ---------- maps & directions ---------- */
  const coord = id => { const c = C.COORDS && C.COORDS[id]; return c && Number(c.lat) && Number(c.lng) ? c : null; };
  const dirURL = (id, name) => { const c = coord(id); return c ? `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ", Loboc, Bohol")}`; };
  /* Google Map of the whole town of Loboc (Visitor Guide) */
  const townMap = () => `<div class="mini-map"><iframe title="Map of Loboc, Bohol" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent("Loboc, Bohol")}&z=13&output=embed"></iframe></div>`;
  const mapEmbed = (id, name) => { const c = coord(id), q = c ? `${c.lat},${c.lng}` : `${name}, Loboc, Bohol`; return `<div class="mini-map"><iframe title="Map of ${hx(name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed"></iframe></div>`; };
  const ICON = {
    pin: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/></svg>',
    cam: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    r360: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 16.8C5.2 16.3 2 14.4 2 12c0-2.8 4.5-5 10-5s10 2.2 10 5c0 2-2.3 3.7-5.7 4.5"/><path d="M8 14.2l2.4 2.6-2.6 2.4"/></svg>'
  };
  const dirBtn = (id, name, cls = "g sm") => `<a class="btn ${cls}" href="${dirURL(id, name)}" target="_blank" rel="noopener">${ICON.pin} Directions</a>`;

  /* ---------- social links ---------- */
  const SOC = {
    facebook: ["Facebook", '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z"/>'],
    tourismFb: ["Tourism Facebook", '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z"/>'],
    instagram: ["Instagram", '<path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>'],
    youtube: ["YouTube", '<path d="M22 8.5a3 3 0 0 0-2-2C18 6 12 6 12 6s-6 0-8 .5a3 3 0 0 0-2 2A31 31 0 0 0 2 12a31 31 0 0 0 0 3.5 3 3 0 0 0 2 2c2 .5 8 .5 8 .5s6 0 8-.5a3 3 0 0 0 2-2 31 31 0 0 0 0-7zM10 15V9l5 3z"/>'],
    tiktok: ["TikTok", '<path d="M16 3c.3 2.2 1.8 3.8 4 4v3.2a7 7 0 0 1-4-1.3V15a6 6 0 1 1-6-6v3.3a2.8 2.8 0 1 0 2.8 2.7V3z"/>'],
    x: ["X", '<path d="M4 4h4.5l4 5.6L17 4h3l-6.1 7.3L21 20h-4.5l-4.4-6-5 6H4l6.6-7.8z"/>'],
    website: ["Website", '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-3a15 15 0 0 0-1.3-4A8 8 0 0 1 18.9 8zM12 4c.9 1.2 1.6 2.6 2 4h-4c.4-1.4 1.1-2.8 2-4zM4.3 14a8 8 0 0 1 0-4h3.4a17 17 0 0 0 0 4zm.8 2h3a15 15 0 0 0 1.3 4A8 8 0 0 1 5.1 16zm3-8h-3a8 8 0 0 1 4.3-4A15 15 0 0 0 8.1 8zM12 20c-.9-1.2-1.6-2.6-2-4h4c-.4 1.4-1.1 2.8-2 4zm2.3-6H9.7a15 15 0 0 1 0-4h4.6a15 15 0 0 1 0 4zm.3 6a15 15 0 0 0 1.3-4h3a8 8 0 0 1-4.3 4zm1.7-6a17 17 0 0 0 0-4h3.4a8 8 0 0 1 0 4z"/>']
  };
  const socials = () => `<div class="socials">${Object.entries(SOC).filter(([k]) => C.SOCIAL[k]).map(([k, [l, p]]) => `<a class="soc" href="${hx(C.SOCIAL[k])}" target="_blank" rel="noopener" aria-label="${l}" title="${l}"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg></a>`).join("")}</div>`;

  /* ---------- ratings ---------- */
  const reviewsOf = t => API.reviews(t).filter(r => r.status === "Published");
  const avgOf = t => { const a = reviewsOf(t); return { avg: a.length ? a.reduce((s, r) => s + r.rating, 0) / a.length : 0, n: a.length }; };
  const stars = v => `<span class="stars" aria-label="${v.toFixed ? v.toFixed(1) : v} out of 5">${[1,2,3,4,5].map(i => `<span class="${v >= i - .25 ? "" : "off"}">★</span>`).join("")}</span>`;
  const rateLine = (id, name) => { const { avg, n } = avgOf(id); return `<div class="rate-line">${stars(avg)}${n ? `<b>${avg.toFixed(1)}</b><span>(${n} review${n > 1 ? "s" : ""})</span>` : `<span>No reviews yet</span>`}<button class="link-b" data-rv="${hx(id)}" data-rvn="${hx(name)}">Rate &amp; review</button></div>`; };
  const STAR_L = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
  const VISIT = ["Solo", "Couple", "Family", "Friends", "Group tour", "Business"];
  let rvSort = "new";
  /* Shown wherever an account is needed (rate, review, message, report). */
  function loginBox(title, text, small) {
    return `<div class="estab need-login" style="text-align:center${small ? ";padding:18px" : ""}"><h3 style="font-size:${small ? "1.15rem" : "1.4rem"}">🔒 ${hx(title)}</h3><p>${hx(text)} Browsing the site stays free without an account.</p><div class="chips" style="justify-content:center"><button class="btn p" data-auth="login" data-here>Log in</button><button class="btn g" data-auth="signup" data-here>Create a free account</button></div></div>`;
  }
  function openReviews(id, name) {
    const a = reviewsOf(id), { avg, n } = avgOf(id), u = API.user();
    const dist = [5,4,3,2,1].map(s => [s, a.filter(r => r.rating === s).length]);
    const sorted = a.slice().sort(rvSort === "high" ? (x, y) => y.rating - x.rating : rvSort === "low" ? (x, y) => x.rating - y.rating : (x, y) => y.created.localeCompare(x.created));
    openModal(`${mhead("Reviews · " + hx(name))}
      <div class="rv-sum"><div class="rv-big"><b>${n ? avg.toFixed(1) : "–"}</b>${stars(avg)}<div class="fine">${n} review${n === 1 ? "" : "s"}</div></div>
        <div class="rv-bars">${dist.map(([s, c]) => `<div class="rv-bar"><span>${s}★</span><span><i style="width:${n ? c / n * 100 : 0}%"></i></span><span>${c}</span></div>`).join("")}</div></div>
      ${u ? `<form class="frm" id="rvf" data-id="${hx(id)}" data-name="${hx(name)}" novalidate>
        <h3 style="font-size:1.15rem">Share your experience</h3>
        <div class="fld">Your rating <div class="star-pick" role="radiogroup" aria-label="Star rating">${[1,2,3,4,5].map(i => `<button type="button" role="radio" aria-checked="false" aria-label="${i} star${i > 1 ? "s" : ""}, ${STAR_L[i]}" data-star="${i}">★</button>`).join("")}<span class="star-lbl" id="starLbl">Tap a star</span></div></div>
        <input type="hidden" name="rating" value="0"><input type="hidden" name="visit" value="">
        <div class="fld"><span>Who did you visit with? <span class="lh">(optional)</span></span><div class="vchips">${VISIT.map(v => `<button type="button" data-visit="${v}" aria-pressed="false">${v}</button>`).join("")}</div></div>
        <div class="row2"><label>Your name<input name="name" required maxlength="60" autocomplete="name" value="${hx(u ? u.name : "")}" ${u ? "readonly" : ""}></label>
        <label><span>Email ${u ? '<span class="lh">(from your account)</span>' : ""}</span><input name="email" type="email" required maxlength="120" autocomplete="email" value="${hx(u ? u.email : "")}" ${u ? "readonly" : ""}></label></div>
        <label>Your review<textarea name="text" rows="4" maxlength="600" required placeholder="What did you enjoy? Any tips for other visitors?"></textarea><span class="counter"><span id="rvc">0</span>/600</span></label>
        <label class="sr" aria-hidden="true">Leave empty<input name="website" tabindex="-1" autocomplete="off"></label>
        <p class="hint" style="margin:0">Name and email are required for security. Your email is never shown publicly.</p>
        <span class="err" id="rverr" role="alert"></span>
        <button class="btn p" type="submit">${ICON.star} Post review</button>
      </form>` : loginBox("Log in to rate and review", "Reviews are linked to a verified account so visitors can trust them.", true)}
      <div style="margin-top:22px">${n ? `<div class="sec-h" style="margin:0"><h3 style="font-size:1.15rem">What visitors say</h3><div class="seg">${[["new","Newest"],["high","Highest"],["low","Lowest"]].map(([k, l]) => `<button type="button" data-rvsort="${k}" aria-pressed="${rvSort === k}">${l}</button>`).join("")}</div></div>` : `<p class="fine">No reviews yet. Be the first!</p>`}
      ${sorted.map(r => `<div class="rv-item"><span class="av">${hx(initials(r.name))}</span><div><div class="who"><b>${hx(r.name)}</b>${stars(r.rating)}${r.visit ? `<span class="tag mute">${hx(r.visit)}</span>` : ""}<span class="fine">${fmtDate(r.created)}</span></div><p>${hx(r.text)}</p></div></div>`).join("")}</div>`, true);
  }
  async function submitReview(f) {
    const err = qs("#rverr"), d = Object.fromEntries(new FormData(f)), id = f.dataset.id;
    if (d.website) return; // bot trap
    const rating = +d.rating, name = d.name.trim(), email = d.email.trim().toLowerCase(), text = d.text.trim();
    if (!rating) return err.textContent = "Please tap a star rating.";
    if (name.length < 2) return err.textContent = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err.textContent = "Please enter a valid email.";
    if (text.length < 10) return err.textContent = "Please write at least a short sentence (10+ characters).";
    const btn = qs("button[type=submit]", f); btn.disabled = true;
    try { await API.addReview({ target: id, rating, name, email, text, visit: d.visit }); }
    catch (e) { btn.disabled = false; return err.textContent = e.message; }
    toast("Thank you! Your review is posted."); openReviews(id, f.dataset.name); refreshSoft();
  }

  /* ---------- shared parts ---------- */
  function footer() {
    const s = S();
    return `<footer>${notes(8, 3)}<div class="wrap">
      <div class="fquote">“${hx(s.quote)}”<small>Loboc, Bohol · Music Capital of Bohol</small></div>
      <div class="fgrid">
        <div><a class="brand" href="#home" style="color:#fff"><span class="logo">${logo()}</span><span>Discover<b style="color:var(--leaf-l)">Lubok</b></span></a>
          <p style="max-width:36ch">${hx(s.officeName)}<br>${hx(s.officeAddress)}</p>${socials()}
          <div class="vcount" aria-live="polite"><span class="live" aria-hidden="true"></span><div><b id="vc">–</b><small>Website visitors</small></div></div></div>
        <div><h3>Explore</h3><ul><li><a href="#explore">Tourist spots</a></li><li><a href="#todo">Things to do</a></li><li><a href="#heritage">Heritage</a></li><li><a href="#stay">Stay &amp; eat</a></li><li><a href="#maps">Maps</a></li><li><a href="#calendar">Calendar</a></li></ul></div>
        <div><h3>Visitor help</h3><ul><li><a href="#guide/transport">Transportation</a></li><li><a href="#guide/guides">Accredited tour guides</a></li><li><a href="#guide/hotlines">Emergency hotlines</a></li><li><a href="#guide/access">Accessibility &amp; breastfeeding</a></li></ul></div>
        <div><h3>LGU</h3><ul><li><a href="#news">News &amp; announcements</a></li><li><a href="#officials">Officials</a></li><li><a href="#about">About Loboc</a></li><li><a href="#contact">Contact us</a></li><li><a href="#admin">Admin / staff login</a></li></ul>
          <p style="font-size:.88rem;margin-top:14px">${hx(s.officeHours)}<br>${hx(C.SOCIAL.phone)}</p></div>
      </div>
      <div class="copy"><span>© ${new Date().getFullYear()} Municipality of Loboc, Bohol</span><span>${API.mode === "demo" ? "Preview build · not yet live" : ""}</span></div>
    </div></footer>`;
  }
  const pageHead = (eb, title, intro) => `<section class="phead staff">${notes(7, title.length)}<div class="wrap"><div class="eyebrow pop">${eb}</div><h1 class="pop fromL" style="--d:.08s">${title}</h1>${intro ? `<p class="pop" style="--d:.18s">${intro}</p>` : ""}</div></section>${wave("#8CCB55", "#fff")}`;
  const page = (eb, title, intro, body) => `${pageHead(eb, title, intro)}<section class="pad" style="padding-top:30px"><div class="wrap">${body}</div></section>${wave("#fff", "#1C3D12")}${footer()}`;
  const tabs = (key, items, cur) => `<div class="chips" role="group" style="margin-bottom:18px">${items.map(([k, l]) => `<button class="chip" data-tab="${key}|${k}" aria-pressed="${k === cur}">${l}</button>`).join("")}</div>`;
  const ST = { maps: "brgy", mapB: "", layers: {}, about: "about", route: 0, exb: "All", stq: "", sbr: "All", explore: "all", exq: "", todo: "adventure", stay: "lodging", stype: "All", ssort: "rec", news: "all", npage: 1, off: "municipal", offq: "", cm: new Date().getMonth(), cy: new Date().getFullYear() };

  /* =====================================================================
     PAGES
     ===================================================================== */
  const P = {};

  /* ----- HOME ----- */
  P.home = () => {
    post = weather;
    const s = S(), hl = pub("highlights").sort(byOrder);
    const colors = ["leaf", "river", "forest", "leaf", "river", "deep"];
    const bands = hl.map((h, i) => {
      const c = h.color || colors[i % colors.length], flip = i % 2 === 1, next = hl[i + 1] ? (hl[i + 1].color || colors[(i + 1) % colors.length]) : "leafl";
      const dark = c === "forest" || c === "deep";
      return `<section class="band pad staff ${flip ? "flip" : ""} s-${c === "river" ? "river" : c}">${notes(5, i + 2)}<div class="wrap">
        <div class="txt pop ${flip ? "fromR" : "fromL"}"><span class="num">0${i + 1}</span><br><span class="kick">${hx(h.kicker)}</span><h2>${hx(h.title)}</h2><p>${hx(h.summary)}</p>
          <div class="row"><a class="btn ${dark ? "l" : "p"}" href="#highlight/${hx(h.id)}">Learn more</a>${dirBtn(h.id, h.title, dark ? "w sm" : "g sm")}</div>
          <div style="margin-top:14px">${rateLine(h.id, h.title)}</div></div>
        <div class="pop ${flip ? "fromL" : "fromR"}" style="--d:.15s"><a href="#highlight/${hx(h.id)}" aria-label="${hx(h.title)}" style="display:block;text-decoration:none">${i % 2 === 0
          ? `<figure class="fa">${ph(h.title, h.photos, "")}<figcaption>${hx(h.title)} · ${hx(h.kicker)}</figcaption></figure>`
          : `<div class="fb">${ph(h.title, h.photos, "")}<i class="cbr tl"></i><i class="cbr tr"></i><i class="cbr bl"></i><i class="cbr br"></i></div>`}</a></div>
      </div></section>${wave(COL[c === "river" ? "river" : c], COL[next === "river" ? "river" : next])}`;
    }).join("");
    const ev = upcoming(3);
    const news = activeNews().slice(0, 6);
    return `
      <section class="hero"><div class="hbg" data-hbg>
        ${C.HERO_VIDEO_SRC ? `<video autoplay muted loop playsinline preload="metadata" aria-hidden="true"><source src="${hx(C.HERO_VIDEO_SRC)}" type="video/mp4" data-fb="parent"></video>` : ""}
        <div class="staffs" aria-hidden="true">${[22, 62].map(t => `<svg viewBox="0 0 1200 100" preserveAspectRatio="none" style="top:${t}%;height:90px">${[10, 30, 50, 70, 90].map(y => `<path d="M0 ${y}C300 ${y - 20} 600 ${y + 20} 1200 ${y}" stroke="#2F6420" stroke-width="1.2" fill="none"/>`).join("")}</svg>`).join("")}</div></div>
        ${notes(16, 9)}
        <div class="hero-in"><div class="seal pop">${logo()}</div><h1 class="pop" style="--d:.1s">${hx(s.heroTitle)}</h1>
          <p class="quote pop" style="--d:.2s">${hx(s.quote)}</p><p class="sub pop" style="--d:.25s">${hx(s.heroSub)}</p>
          <div class="row pop" style="--d:.3s"><a class="btn p" href="#explore">Explore Loboc</a><a class="btn w" href="#heritage">Heritage</a><a class="btn w" href="#todo">Things to do</a><a class="btn o" href="#guide">Visitor guide</a></div></div>
        <button class="cue" data-scroll="top1" aria-label="Scroll down">Scroll<span></span></button>
        ${wave("#1C3D12", "transparent", true)}
      </section>
      <div class="ticker"><button class="lbl" data-news-open>♫ News &amp; Announcements</button><div class="run"><div>${(news.length ? news.concat(news) : [{ id: "", title: "No announcements right now." }, { id: "", title: "No announcements right now." }]).map(n => `<a href="${n.id ? "#news/" + hx(n.id) : "#news"}">${n.type === "Announcement" ? "📢 " : ""}${hx(n.title)}</a>`).join("")}</div></div></div>
      <div class="wticker" aria-hidden="true"><div>${"<span>RIVER</span>·<span>MUSIC</span>·<span>HERITAGE</span>·<span>CHOIR</span>·<span>FIESTA</span>·<span>CRAFTS</span>·<span>RONDALLA</span>·".repeat(8)}</div></div>
      <section class="pad s-leafl staff" id="top1">${notes(6, 4)}<div class="wrap two">
        <div><div class="eyebrow pop">Welcome to Loboc</div><h2 class="h2 pop">${hx(s.welcomeTitle)}</h2><p class="lead pop">${hx(s.welcomeText)}</p>
          <span class="wx pop" id="wx">☁ Today in Loboc: checking the weather…</span>
          <div class="chips pop" style="margin-top:20px">${[["explore","Tourist spots"],["explore","Hidden gems"],["maps","Maps"],["todo","Things to do"],["stay","Places to stay"],["heritage","Heritage"],["calendar","Events"],["officials","Officials"]].map(([k, l]) => `<a class="chip" href="#${k}">${l}</a>`).join("")}</div></div>
        <div class="pop" style="--d:.15s"><div class="eyebrow">Visitor guide</div><div class="cat-tiles" style="grid-template-columns:1fr 1fr">
          ${[["transport","🚌","Transportation","t2"],["guides","🧭","Tour guides",""],["hotlines","🚨","Emergency hotlines","t6"],["access","♿","PWD & breastfeeding","t4"]].map(([k, ic, l, c]) => `<a class="tile ${c}" style="min-height:150px" href="#guide/${k}"><span class="ico" aria-hidden="true">${ic}</span><span class="go" aria-hidden="true">→</span><h3 style="font-size:1.1rem">${l}</h3></a>`).join("")}
        </div><a class="btn p sm" style="margin-top:14px" href="#guide">See more visitor info</a></div>
      </div></section>
      ${wave("#F3FAEA", COL[(hl[0] && hl[0].color) === "river" ? "river" : (hl[0] && hl[0].color) || "leaf"])}
      ${bands}
      <section class="pad s-leafl staff">${notes(6, 11)}<div class="wrap">
        <div class="sec-h"><div><div class="eyebrow">Things to do</div><h2 class="h2" style="margin:0">Pick your Loboc adventure</h2></div><a class="btn p sm" href="#todo">All activities</a></div>
        <div class="cat-tiles">${TODO_CATS.map(([k, ic, l, d, c]) => `<a class="tile ${c} pop" href="#todo/${k}"><span class="ico" aria-hidden="true">${ic}</span><span class="go" aria-hidden="true">→</span><h3>${l}</h3><p>${d}</p></a>`).join("")}</div>
      </div></section>
      ${wave("#F3FAEA", "#fff")}
      <section class="pad staff"><div class="wrap two">
        <div><div class="eyebrow">Coming up</div><h2 class="h2">Events in Loboc</h2>${ev.length ? ev.map(evRow).join("") : `<p class="fine">No upcoming events listed.</p>`}<a class="btn p sm" href="#calendar">Full calendar</a></div>
        <div><div class="eyebrow">Latest</div><h2 class="h2">News &amp; announcements</h2>${news.slice(0, 3).map(nItem).join("") || `<p class="fine">No posts yet.</p>`}<a class="btn p sm" style="margin-top:14px" href="#news">All news</a></div>
      </div><div class="wrap" style="margin-top:44px"><div class="eyebrow">Heritage</div><h2 class="h2">Loboc through time</h2><div class="chips">${TL().map((t, i) => `<a class="chip pop" style="--d:${i * .05}s" href="#heritage/${i}">${hx(t.year)} · ${hx(t.title)}</a>`).join("")}</div><p class="fine">Opens the Anchor Timeline.</p></div></section>
      ${wave("#fff", "#1C3D12")}${footer()}`;
  };

  /* ----- HIGHLIGHT / PLACE DETAIL ----- */
  function detailPage({ id, title, kicker, summary, story, facts, photos, back, backL, extra, after }) {
    const g = photos && photos.length ? photos : [];
    const gal = `<div class="gal">${(g.length ? g : [null, null, null, null, null]).slice(0, 5).map((p, i) => `<button data-view="${hx(id)}" data-vi="${i}" aria-label="Open photo ${i + 1}">${p ? ph(title, g, "", i) : ph(title + i, null, i === 0 ? "Photos coming soon" : "")}</button>`).join("")}</div>`;
    return `<section class="dhero"><div class="bgimg">${ph(title, g, "")}</div>${notes(10, title.length)}<div class="wrap">
        <div class="crumbs"><a href="#${back}" style="color:#fff">‹ ${backL}</a></div><span class="kick">${hx(kicker)}</span><h1>${hx(title)}</h1>
        <p style="font-size:1.15rem;max-width:56ch;margin:10px 0 0">${hx(summary)}</p>${rateLine(id, title)}${tourBtn(id, "inhero")}</div></section>
      <div class="wrap"><div class="facts">${(facts || []).map(([l, v]) => `<div class="fact pop"><small>${hx(l)}</small><b>${hx(v)}</b></div>`).join("")}</div></div>
      <section class="pad staff"><div class="wrap two w">
        <div><div class="eyebrow">The story</div><p class="story">${hx(story || summary)}</p>${extra || ""}
          <h2 class="h2" style="font-size:1.8rem;margin-top:30px">Photos</h2>${gal}
          <div class="sec-h" style="margin-top:36px"><h2 class="h2" style="font-size:1.8rem;margin:0">Visitor reviews</h2><button class="btn p sm" data-rv="${hx(id)}" data-rvn="${hx(title)}">${ICON.star} Write a review</button></div>
          ${reviewsOf(id).slice(-3).reverse().map(r => `<div class="rv-item"><span class="av">${hx(initials(r.name))}</span><div><div class="who"><b>${hx(r.name)}</b>${stars(r.rating)}<span class="fine">${fmtDate(r.created)}</span></div><p>${hx(r.text)}</p></div></div>`).join("") || `<p class="fine">No reviews yet. Be the first to share your experience.</p>`}
        </div>
        <aside class="side"><h3>Plan your visit</h3>${tourOf(id) ? `<div class="vtmap">${mapEmbed(id, title)}${tourBtn(id, "onmap")}</div>` : mapEmbed(id, title)}${dirBtn(id, title, "p")}<button class="btn g" data-share="${hx(title)}">Share this place</button>
          <p class="fine" style="margin:0">Need help? <a href="#contact">Contact the Tourism Office</a> or see <a href="#guide/guides">accredited tour guides</a>.</p></aside>
      </div></section>${after || wave("#fff", "#1C3D12")}${footer()}`;
  }
  P.highlight = id => { const h = API.get("highlights", id); if (!h) return P.notfound(); return detailPage({ id: h.id, title: h.title, kicker: h.kicker, summary: h.summary, story: h.story, facts: h.facts, photos: h.photos, back: "home", backL: "Home" }); };
  P.place = id => { const p = API.get("places", id); if (!p) return P.notfound();
    return detailPage({ id: p.id, title: p.name, kicker: p.kind, summary: p.desc, story: p.story || p.desc, photos: p.photos, back: "explore", backL: "Tourist spots",
      facts: [["Status", p.status], ["Hours", p.hours || "To be confirmed"], ["Entrance fee", p.fee || "To be confirmed"], ["Barangay", p.brgy || "–"]],
      extra: (p.status !== "Open" ? `<div class="warn-box"><b>${hx(p.status)}.</b> ${hx(p.note || "")}</div>` : "") + (p.guide ? `<h2 class="h2" style="font-size:1.8rem;margin-top:30px">Visitor guidelines</h2><div class="route"><p style="margin:0;white-space:pre-wrap">${hx(p.guide)}</p></div>` : ""),
      after: nearby(p) }); };
  function nearby(p) {
    const a = pub("places").filter(x => x.id !== p.id).sort((x, y) => (y.brgy === p.brgy) - (x.brgy === p.brgy)).slice(0, 3);
    return a.length ? `${wave("#fff", "#F3FAEA")}<section class="pad s-leafl" style="padding-top:20px"><div class="wrap"><h2 class="h2" style="font-size:2rem">Nearby places</h2><div class="grid">${a.map(x => `<article class="card"><a href="#place/${hx(x.id)}">${ph(x.name, x.photos, x.kind)}</a><div class="cb"><h3>${hx(x.name)}</h3>${rateLine(x.id, x.name)}<div class="acts"><a class="btn p sm" href="#place/${hx(x.id)}">View</a>${dirBtn(x.id, x.name)}</div></div></article>`).join("")}</div></div></section>${wave("#F3FAEA", "#1C3D12")}` : wave("#fff", "#1C3D12");
  }

  /* ----- EXPLORE ----- */
  P.explore = () => {
    const kinds = [["all","All"],["Tourist spot","Tourist spots"],["Heritage","Heritage"],["Hidden gem","Hidden gems"]];
    const q = ST.exq.toLowerCase();
    const brs = [...new Set(pub("places").map(p => p.brgy).filter(Boolean))].sort();
    const a = pub("places").filter(p => (ST.explore === "all" || p.kind === ST.explore) && (ST.exb === "All" || p.brgy === ST.exb) && (!q || (p.name + " " + p.desc + " " + p.brgy).toLowerCase().includes(q)));
    return page("Explore", "Tourist Spots", "Waterfalls, heritage, river views and hidden gems. Rate the places you visit.",
      tabs("explore", kinds, ST.explore) + `<div class="tools"><input class="inp" type="search" data-q="exq" placeholder="Search tourist spots…" aria-label="Search tourist spots" value="${hx(ST.exq)}"><select class="inp" data-sel="exb" aria-label="Barangay">${["All", ...brs].map(b => `<option value="${hx(b)}" ${ST.exb === b ? "selected" : ""}>${b === "All" ? "All barangays" : hx(b)}</option>`).join("")}</select><a class="btn g sm" href="#maps/loc">📍 Map view</a></div>
      <div class="grid">${a.map((p, i) => `<article class="card pop" style="--d:${i * .05}s"><a href="#place/${hx(p.id)}">${ph(p.name, p.photos, p.kind)}</a><div class="cb">
        <div class="meta"><span class="tag">${hx(p.kind)}</span>${p.status !== "Open" ? `<span class="tag red">${hx(p.status)}</span>` : ""}</div>
        <h3>${hx(p.name)}</h3>${rateLine(p.id, p.name)}<p>${hx(p.desc)}</p>
        <div class="acts"><a class="btn p sm" href="#place/${hx(p.id)}">View</a>${dirBtn(p.id, p.name)}</div></div></article>`).join("") || `<p>No places match your search.</p>`}</div>`);
  };

  /* ----- THINGS TO DO ----- */
  const TODO_CATS = [["adventure","🧗","Adventure","Zipline, cable car, mountain treks and caves.",""],["river","🛶","River & Water Activities","River cruise, paddleboarding, kayaking and firefly watching.","t2"],["home","🍲","Home & Dining","Homestays, carabao dishes, ginger farm and pasalubong.","t3"]];
  P.todo = sub => {
    if (sub && TODO_CATS.some(c => c[0] === sub)) ST.todo = sub;
    const cat = TODO_CATS.find(c => c[0] === ST.todo), a = pub("activities").filter(x => x.cat === ST.todo);
    return page("Things to do", "Things To Do in Loboc", "Adventure, river and water activities, and home and dining experiences.",
      `<div class="cat-tiles" style="margin-bottom:30px">${TODO_CATS.map(([k, ic, l, d, c]) => `<button class="tile ${c}" style="min-height:150px;${k === ST.todo ? "box-shadow:0 0 0 3px var(--forest)" : ""}" data-tab="todo|${k}" aria-pressed="${k === ST.todo}"><span class="ico" aria-hidden="true">${ic}</span><h3 style="font-size:1.15rem">${l}</h3></button>`).join("")}</div>
      <h2 class="h2" style="font-size:2rem">${cat[1]} ${cat[2]}</h2>
      <div class="grid">${a.map((x, i) => `<article class="card pop" style="--d:${i * .05}s"><button style="border:0;padding:0;background:none;cursor:pointer" data-view="${hx(x.id)}" data-vi="0" aria-label="Photos of ${hx(x.name)}">${ph(x.name, x.photos, cat[2])}</button><div class="cb">
        <h3>${hx(x.name)}</h3>${rateLine(x.id, x.name)}<p>${hx(x.desc)}</p>
        <div class="meta">${x.duration ? `<span class="tag mute">⏱ ${hx(x.duration)}</span>` : ""}${x.price ? `<span class="tag mute">${hx(x.price)}</span>` : ""}</div>
        <div class="acts">${dirBtn(x.id, x.name)}${x.contact ? `<a class="btn g sm" href="tel:${hx(x.contact.replace(/[^\d+]/g, ""))}">${ICON.phone} Call</a>` : ""}</div></div></article>`).join("") || `<p>No activities listed yet.</p>`}</div>`);
  };

  /* ----- STAY · EAT · SHOP (call the owner directly) ----- */
  const LODGE = ["Hotel","Resort","Homestay","Inn","Lodge"];
  P.stay = () => {
    const isL = ST.stay === "lodging", TK = { lodging: LODGE, eat: ["Restaurant"], shop: ["Souvenir shop"], services: ["Service"] };
    const base = pub("listings").filter(l => TK[ST.stay].includes(l.type)), brs = [...new Set(base.map(l => l.brgy).filter(Boolean))].sort(), sq = ST.stq.toLowerCase();
    let a = base.filter(l => (ST.sbr === "All" || l.brgy === ST.sbr) && (!sq || (l.name + " " + l.desc + " " + l.amenities + " " + l.brgy).toLowerCase().includes(sq)));
    if (isL && ST.stype !== "All") a = a.filter(l => l.type === ST.stype);
    if (ST.ssort === "low") a.sort((x, y) => (x.priceFrom || 9e9) - (y.priceFrom || 9e9));
    if (ST.ssort === "high") a.sort((x, y) => (y.priceFrom || 0) - (x.priceFrom || 0));
    if (ST.ssort === "rate") a.sort((x, y) => avgOf(y.id).avg - avgOf(x.id).avg);
    const types = [...new Set(pub("listings").filter(l => LODGE.includes(l.type)).map(l => l.type))];
    return page("Stay · Eat · Shop", "Places to Stay in Loboc", "Find riverside resorts, homestays and inns, then call or text the owner directly.",
      tabs("stay", [["lodging","🛏 Stay"],["eat","🍽 Eat"],["shop","🛍 Souvenirs"],["services","🧭 Other services"]], ST.stay) +
      `<div class="tools"><input class="inp" type="search" data-q="stq" placeholder="Search…" aria-label="Search listings" value="${hx(ST.stq)}"><select class="inp" data-sel="sbr" aria-label="Barangay">${["All", ...brs].map(b => `<option value="${hx(b)}" ${ST.sbr === b ? "selected" : ""}>${b === "All" ? "All barangays" : hx(b)}</option>`).join("")}</select></div>` +
      (isL ? `<div class="tools"><div class="chips">${["All", ...types].map(t => `<button class="chip" data-stype="${hx(t)}" aria-pressed="${ST.stype === t}">${hx(t)}</button>`).join("")}</div><select class="inp" data-ssort aria-label="Sort by" style="flex:0 1 220px;margin-left:auto">${[["rec","Recommended"],["low","Price: low to high"],["high","Price: high to low"],["rate","Guest rating"]].map(([k, l]) => `<option value="${k}" ${ST.ssort === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>` : "") +
      `<div class="grid">${a.map((l, i) => `<article class="card pop" style="--d:${i * .05}s"><button style="border:0;padding:0;background:none;cursor:pointer;position:relative" data-view="${hx(l.id)}" data-vi="0" aria-label="Photos of ${hx(l.name)}">${ph(l.name, l.photos, l.type)}</button><div class="cb">
        <div class="meta"><span class="tag">${hx(l.type)}</span><span class="tag mute">${hx(l.brgy)}</span></div>
        <h3>${hx(l.name)}</h3>${rateLine(l.id, l.name)}<p>${hx(l.desc)}</p>
        ${l.amenities ? `<div class="meta">${l.amenities.split(",").slice(0, 5).map(x => `<span class="tag mute">${hx(x.trim())}</span>`).join("")}</div>` : ""}
        ${isL && l.priceFrom ? `<div class="price">${peso(l.priceFrom)} <small>/ night, starting price</small></div>` : ""}
        <div class="callbox">${l.phone ? `<span>${isL ? "Call the owner" : "Contact"}</span><a class="tel" href="tel:${hx(l.phone.replace(/[^\d+]/g, ""))}">📞 ${hx(l.phone)}</a>` : `<span>Phone number</span><b>To be added by the LGU</b>`}</div>
        <div class="acts">${l.phone ? `<a class="btn p sm" href="tel:${hx(l.phone.replace(/[^\d+]/g, ""))}">${ICON.phone} Call now</a><a class="btn g sm" href="sms:${hx(l.phone.replace(/[^\d+]/g, ""))}">Text</a><button class="btn g sm" data-copy="${hx(l.phone)}">Copy</button>` : ""}<button class="btn g sm" data-view="${hx(l.id)}" data-vi="0">${ICON.cam} Photos</button>${API.safeUrl(l.fb) ? `<a class="btn g sm" href="${hx(API.safeUrl(l.fb))}" target="_blank" rel="noopener">Facebook</a>` : ""}${dirBtn(l.id, l.name)}</div></div></article>`).join("") || `<p>Nothing listed here yet.</p>`}</div>
      <p class="fine" style="margin-top:20px">Prices are starting rates set by each establishment and may change. To reserve, call or text the owner directly. The LGU does not take bookings or payments on this site.</p>`);
  };
  /* ----- VISITOR GUIDE ----- */
  P.guide = sub => {
    const hot = API.list("hotlines").slice().sort(byOrder), tr = API.list("transport").slice().sort(byOrder), gd = pub("guides"), ax = API.list("access").slice().sort(byOrder);
    const AXI = { breastfeeding: ["🤱", "#F6E1EA"], pwd: ["♿", "#DCEEFA"], restroom: ["🚻", "#E3F3CF"], priority: ["⭐", "#FCEFC9"], other: ["ℹ️", "#EEF0EC"] };
    if (sub) setTimeout(() => { const t = qs("#g-" + sub); if (t) t.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" }); }, 120);
    return page("Visitor guide", "Visitor Guide", "Getting here, accredited tour guides, emergency hotlines and accessibility.",
      `<div class="gtabs"><div class="chips">${[["transport","🚌 Transportation"],["guides","🧭 Tour guides"],["hotlines","🚨 Hotlines"],["access","♿ Accessibility"]].map(([k, l]) => `<a class="chip" href="#guide/${k}">${l}</a>`).join("")}</div></div>
      <section id="g-transport" style="scroll-margin-top:150px"><h2 class="h2">Transportation</h2><div class="two"><div style="display:grid;gap:12px">${tr.map(t => `<div class="route"><h3 style="font-size:1.15rem">${hx(t.title)}</h3><p style="margin:6px 0 0">${hx(t.desc)}</p></div>`).join("")}</div>${townMap()}</div></section>
      <section id="g-guides" style="scroll-margin-top:150px;margin-top:56px"><h2 class="h2">Accredited Tour Guides</h2><p class="lead">Hire a local guide accredited by the LGU/DOT. Call or text them directly.</p>
        <div class="grid" style="margin-top:18px">${gd.map(g => `<div class="guide-c">${ph(g.name, g.photos, "")}<div><b>${hx(g.name)}</b> <span class="tag blue">✔ Accredited</span><div class="fine">${hx(g.languages)}${g.accNo ? " · Acc. no. " + hx(g.accNo) : ""}</div>
          <a class="btn p sm" style="margin-top:8px" href="tel:${hx((g.phone || "").replace(/[^\d+]/g, ""))}">${ICON.phone} ${hx(g.phone)}</a></div></div>`).join("") || `<p>No tour guides listed yet.</p>`}</div></section>
      <section id="g-hotlines" style="scroll-margin-top:150px;margin-top:56px"><h2 class="h2">Emergency Hotlines</h2><div class="grid">${hot.map(h => `<div class="hot"><span class="ic" aria-hidden="true">🚨</span><div><b>${hx(h.name)}</b><span class="fine">${hx(h.note)}</span></div><a class="num" href="tel:${hx(h.number.replace(/[^\d+]/g, ""))}">${hx(h.number)}</a></div>`).join("")}</div></section>
      <section id="g-access" style="scroll-margin-top:150px;margin-top:56px"><h2 class="h2">PWD-Friendly &amp; Family Facilities</h2><p class="lead">Accessible features and the breastfeeding station at the Loboc Tourism Complex.</p>
        <div class="grid" style="margin-top:18px">${ax.map(a => { const [ic, bg] = AXI[a.kind] || AXI.other; return `<div class="acc"><span class="ic" style="background:${bg}" aria-hidden="true">${ic}</span><div><h3 style="font-size:1.1rem">${hx(a.name)}</h3><div class="fine">📍 ${hx(a.location)}</div><p style="margin:6px 0 0">${hx(a.desc)}</p></div></div>`; }).join("")}</div>
        <div style="margin-top:16px">${dirBtn("pl-tourism", "Loboc Tourism Complex", "p")}</div></section>`);
  };

  /* ----- NEWS ----- */
  const activeNews = () => API.list("news").filter(n => n.status === "Published" && (!n.expires || n.expires >= today()) && (!n.date || n.date <= today()))
    .sort((a, b) => (b.pinned - a.pinned) || String(b.date).localeCompare(a.date));
  const nItem = n => `<a class="n-item" href="#news/${hx(n.id)}">${ph(n.title, n.cover ? [n.cover] : null, "")}<span><span class="tag ${n.type === "Announcement" ? "gold" : ""}">${n.pinned ? "📌 " : ""}${hx(n.type)}</span><b>${hx(n.title)}</b><span class="fine">${fmtDate(n.date)}</span></span></a>`;
  P.news = id => {
    if (id) { const n = API.get("news", id); if (!n || n.status !== "Published") return P.notfound();
      return page(n.type, hx(n.title), `${fmtDate(n.date)} · ${hx(n.author || "PIO")}`, `<article class="article"><a class="btn g sm" href="#news">‹ All news</a>${n.cover ? `<div style="margin:22px 0">${ph(n.title, [n.cover], "")}</div>` : ""}<div class="body" style="margin-top:20px">${hx(n.body)}</div>
        <div class="chips" style="margin-top:28px"><button class="btn g sm" data-share="${hx(n.title)}">Share</button>${C.SOCIAL.facebook ? `<a class="btn g sm" href="${hx(C.SOCIAL.facebook)}" target="_blank" rel="noopener">Follow LGU Loboc on Facebook</a>` : ""}</div></article>`); }
    const all = activeNews().filter(n => ST.news === "all" || n.type === ST.news), per = C.NEWS_PER_PAGE, pages = Math.max(1, Math.ceil(all.length / per));
    ST.npage = Math.min(ST.npage, pages); const a = all.slice((ST.npage - 1) * per, ST.npage * per);
    return page("News", "News &amp; Announcements", "Official updates from the LGU of Loboc and the Public Information Office.",
      tabs("news", [["all","All"],["Announcement","📢 Announcements"],["News","📰 News"]], ST.news) +
      `<div class="grid">${a.map((n, i) => `<article class="card news-card pop ${n.pinned ? "pin" : ""}" style="--d:${i * .05}s"><a href="#news/${hx(n.id)}">${ph(n.title, n.cover ? [n.cover] : null, n.type)}</a><div class="cb">
        <div class="meta"><span class="tag ${n.type === "Announcement" ? "gold" : ""}">${hx(n.type)}</span>${n.pinned ? `<span class="tag">📌 Pinned</span>` : ""}<span class="fine">${fmtDate(n.date)}</span></div>
        <h3>${hx(n.title)}</h3><p>${hx(n.body.slice(0, 140))}${n.body.length > 140 ? "…" : ""}</p><div class="acts"><a class="btn p sm" href="#news/${hx(n.id)}">Read</a></div></div></article>`).join("") || `<p>No posts yet.</p>`}</div>
      ${pages > 1 ? `<div class="pager">${Array.from({ length: pages }, (_, i) => `<button class="chip" data-npage="${i + 1}" aria-pressed="${ST.npage === i + 1}">${i + 1}</button>`).join("")}</div>` : ""}`);
  };
  function renderDrawer() {
    const a = activeNews().slice(0, 8);
    qs("#newsBody").innerHTML = `${mhead("News &amp; Announcements")}${a.map(nItem).join("") || `<p class="fine">No announcements right now.</p>`}<a class="btn p" style="width:100%;margin-top:18px" href="#news">See all news</a>`;
    const seen = (() => { try { return localStorage.getItem("loboc:newsSeen") || ""; } catch (e) { return ""; } })();
    qs("#newsDot").hidden = !a.length || a[0].id + a[0].updated === seen;
  }
  function toggleDrawer(open) {
    const d = qs("#newsDrawer"), s = qs("#scrim");
    if (open) { renderDrawer(); const a = activeNews()[0]; if (a) try { localStorage.setItem("loboc:newsSeen", a.id + a.updated); } catch (e) {} qs("#newsDot").hidden = true; }
    d.classList.toggle("open", open); s.classList.toggle("open", open); d.setAttribute("aria-hidden", !open); qs("#newsBtn").setAttribute("aria-expanded", open);
    if (open) { const x = qs(".x", d); if (x) x.focus(); }
  }

  /* ----- CALENDAR ----- */
  const TY = { fiesta: ["Fiesta", "#2A7FC4"], church: ["Religious", "#6A4FB3"], culture: ["Cultural", "#2F6420"], holiday: ["Holiday", "#C2412D"] };
  const evs = () => API.list("events").slice().sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = n => evs().filter(e => e.date >= today() && e.type !== "holiday").slice(0, n);
  const evRow = e => { const d = new Date(e.date + "T00:00:00"); return `<button class="ev" data-ev="${hx(e.id)}"><span class="d" style="background:${(TY[e.type] || TY.culture)[1]};color:#fff">${d.getDate()}<small>${MO[d.getMonth()].slice(0, 3)}</small></span><span><b>${hx(e.title)}</b><br><span class="fine">${(TY[e.type] || ["Event"])[0]}${e.venue ? " · " + hx(e.venue) : ""}${e.movable ? " · date changes yearly" : ""}</span></span><span aria-hidden="true">›</span></button>`; };
  P.calendar = () => {
    const m = ST.cm, y = ST.cy, first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), t = today();
    const E = evs().filter(e => { const d = new Date(e.date + "T00:00:00"); return d.getMonth() === m && d.getFullYear() === y; });
    let c = ["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => `<span class="h">${d}</span>`).join("") + "<span></span>".repeat(first);
    for (let d = 1; d <= days; d++) { const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`, e = E.find(x => x.date === ds), cls = ds === t ? "today" : "";
      c += e ? `<button class="${cls}" data-ev="${hx(e.id)}" style="background:${(TY[e.type] || TY.culture)[1]}" aria-label="${d}: ${hx(e.title)}">${d}</button>` : `<span class="${cls}">${d}</span>`; }
    return page("Calendar", "Fiestas &amp; Events", "Fiestas, church feasts, cultural events and holidays.",
      `<div class="two"><div><div class="tools" style="justify-content:space-between"><button class="btn p sm" data-mo="-1" aria-label="Previous month">‹</button><b style="font-size:1.2rem">${MO[m]} ${y}</b><button class="btn p sm" data-mo="1" aria-label="Next month">›</button></div><div class="cal">${c}</div>
        <div class="chips" style="margin-top:14px">${Object.values(TY).map(v => `<span class="fine"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${v[1]}"></span> ${v[0]}</span>`).join("")}</div></div>
        <div><h3 style="margin-bottom:12px">This month</h3>${E.map(evRow).join("") || `<p class="fine">No events listed this month.</p>`}</div></div>`);
  };
  function openEvent(id) { const e = API.get("events", id); if (!e) return;
    openModal(`${mhead(hx(e.title))}${ph(e.title, e.photos, (TY[e.type] || ["Event"])[0])}<p style="margin-top:14px"><b>${fmtDate(e.date)}</b>${e.time ? " · " + hx(e.time) : ""}<br>${e.venue ? "📍 " + hx(e.venue) : ""}</p><p>${hx(e.desc)}</p>${e.movable ? `<p class="warn-box"><i>This date changes every year. Confirm with the Tourism Office.</i></p>` : ""}
      <div class="chips"><a class="btn p sm" target="_blank" rel="noopener" href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${e.date.replace(/-/g, "")}/${e.date.replace(/-/g, "")}&details=${encodeURIComponent(e.desc || "")}&location=${encodeURIComponent((e.venue || "") + " Loboc, Bohol")}">Add to Google Calendar</a>${e.venue ? dirBtn(e.id, e.venue) : ""}</div>`); }

  /* ----- OFFICIALS ----- */
  const person = (o, top) => `<div class="person ${top ? "top" : ""} pop">${ph(o.name || o.role, o.photos, "")}<h3>${o.name ? hx(o.name) : "Name to be added"}</h3><p><b>${hx(o.role)}</b>${o.office ? "<br>" + hx(o.office) : ""}${o.term ? "<br>Term " + hx(o.term) : ""}</p></div>`;
  P.officials = () => {
    const O = API.list("officials").slice().sort(byOrder), g = k => O.filter(o => o.group === k);
    let body = tabs("off", [["municipal","Municipal officials"],["department","Department heads"],["barangay","Barangay officials"]], ST.off);
    if (ST.off === "municipal") body += `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),320px));justify-content:center">${g("municipal").map(o => person(o, true)).join("")}</div>
      ${g("sb").length ? `<h2 class="h2" style="margin-top:44px;font-size:2rem">Sangguniang Bayan</h2><div class="grid">${g("sb").map(o => person(o)).join("")}</div>` : ""}`;
    else if (ST.off === "department") body += `<p class="lead">Heads of the offices of the LGU of Loboc.</p><div class="grid" style="margin-top:18px">${g("department").map(o => person(o)).join("") || "<p>None listed yet.</p>"}</div>`;
    else {
      const q = ST.offq.toLowerCase(), B = API.list("officials").filter(o => o.group === "barangay");
      const find = (b, r) => B.find(o => o.brgy === b && o.role === r) || { name: "", role: r, photos: [] };
      body += `<p class="lead">The Punong Barangay (Barangay Captain) and SK Chairperson of each of Loboc's ${BRN().length} barangays.</p>
        <div class="tools" style="margin-top:14px"><input class="inp" type="search" data-q="offq" placeholder="Search barangay or name…" aria-label="Search barangay" value="${hx(ST.offq)}"></div>
        <div style="display:grid;gap:10px">${BRN().map(b => [b, find(b, "Punong Barangay"), find(b, "SK Chairperson")]).filter(([b, c, s]) => !q || (b + c.name + s.name).toLowerCase().includes(q)).map(([b, c, s]) => `<div class="brgy-row"><h3>${hx(b)} <a class="chip sm" style="vertical-align:middle;min-height:30px" href="#maps/brgy" data-mapto="${hx(b)}" aria-label="${hx(b)} on the map">📍 Map</a></h3>
          <div class="brgy-p">${ph(c.name || b, c.photos, "")}<div><small>Punong Barangay</small><b>${c.name ? hx(c.name) : "To be added"}</b></div></div>
          <div class="brgy-p">${ph(s.name || b + "sk", s.photos, "")}<div><small>SK Chairperson</small><b>${s.name ? hx(s.name) : "To be added"}</b></div></div></div>`).join("") || "<p>No match.</p>"}</div>`;
    }
    return page("Officials", "LGU Officials", "The people serving the Municipality of Loboc.", body);
  };

  /* ----- live weather (Open-Meteo, free, no key) ----- */
  const WMO = c => c === 0 ? ["☀", "Clear"] : c <= 3 ? ["⛅", "Partly cloudy"] : c <= 48 ? ["🌫", "Foggy"] : c <= 57 ? ["🌦", "Drizzle"] : c <= 67 ? ["🌧", "Rain"] : c <= 82 ? ["🌧", "Rain showers"] : ["⛈", "Thunderstorm"];
  function weather() {
    const el = qs("#wx"); if (!el) return;
    const paint = w => { const [ic, t] = WMO(w.code); el.innerHTML = `${ic} Today in Loboc: <b>${Math.round(w.temp)}°C</b>, ${t}${w.rain != null ? ` · ${w.rain}% chance of rain` : ""}`; };
    try { const c = JSON.parse(sessionStorage.getItem("loboc:wx") || "null"); if (c && Date.now() - c.at < 18e5) return paint(c); } catch (e) {}
    const k = C.MAP_CENTER || { lat: 9.6375, lng: 124.031 };
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${k.lat}&longitude=${k.lng}&current=temperature_2m,weather_code&daily=precipitation_probability_max&forecast_days=1&timezone=Asia%2FManila`)
      .then(r => r.json()).then(d => { const w = { temp: d.current.temperature_2m, code: d.current.weather_code, rain: d.daily && d.daily.precipitation_probability_max ? d.daily.precipitation_probability_max[0] : null, at: Date.now() }; try { sessionStorage.setItem("loboc:wx", JSON.stringify(w)); } catch (e) {} paint(w); })
      .catch(() => { el.textContent = "☁ Weather is unavailable right now."; });
  }

  /* ----- MAPS (Barangays + Locations) ----- */
  const BRN = () => API.list("brgys").slice().sort(byOrder).map(b => b.name);
  /* ---------------------------------------------------------------------
     Drawn map of Loboc: no Google Maps, no map tiles. The barangay shapes
     (the LGU's official barangay boundaries, or ones imported in Admin) are
     drawn as one consistent SVG illustration. Pins use the coordinates in
     js/config.js > COORDS.
     --------------------------------------------------------------------- */
  const MAPC = { spot: ["Tourist spots", "#2F6420"], heritage: ["Heritage", "#6A4FB3"], gem: ["Hidden gems", "#2A7FC4"], hl: ["Highlights", "#C2412D"], todo: ["Things to do", "#D97A00"], stay: ["Stay", "#0B3C8C"], eat: ["Eat", "#B5476B"], shop: ["Souvenir shops", "#7A5C2E"], services: ["Services", "#3E8E6E"] };
  function allLocs() {
    const out = [], lt = t => LODGE.includes(t) ? "stay" : t === "Restaurant" ? "eat" : t === "Souvenir shop" ? "shop" : "services";
    pub("highlights").forEach(h => out.push({ id: h.id, name: h.title, cat: "hl", photos: h.photos, desc: h.summary, link: "#highlight/" + h.id }));
    pub("places").forEach(p => out.push({ id: p.id, name: p.name, cat: p.kind === "Heritage" ? "heritage" : p.kind === "Hidden gem" ? "gem" : "spot", photos: p.photos, desc: p.desc, brgy: p.brgy, link: "#place/" + p.id }));
    pub("activities").forEach(a => out.push({ id: a.id, name: a.name, cat: "todo", photos: a.photos, desc: a.desc, phone: a.contact }));
    pub("listings").forEach(l => out.push({ id: l.id, name: l.name, cat: lt(l.type), photos: l.photos, desc: l.desc, phone: l.phone, brgy: l.brgy }));
    return out;
  }
  const ringsOf = g => !g ? [] : g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : [];
  let geoC = null;
  /* Project every barangay once (equirectangular, corrected for latitude) and cache it until the data changes. */
  function geo() {
    const B = API.list("brgys").slice().sort(byOrder).filter(b => b.boundary && b.boundary.geometry), key = B.map(b => b.name + JSON.stringify(b.boundary.geometry).length).join("|");
    if (geoC && geoC.key === key) return geoC;
    if (!B.length) return (geoC = { key, list: [] });
    let x0 = 180, x1 = -180, y0 = 90, y1 = -90;
    B.forEach(b => ringsOf(b.boundary.geometry).forEach(r => r.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); })));
    const k = Math.cos((y0 + y1) / 2 * Math.PI / 180), S = 1000 / Math.max((x1 - x0) * k, 1e-6), W = 1000, H = Math.max((y1 - y0) * S, 1);
    const P = ([x, y]) => [(x - x0) * k * S, (y1 - y) * S];
    const list = B.map(b => {
      const rings = ringsOf(b.boundary.geometry).map(r => r.map(P)); let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9;
      rings[0].forEach(([x, y]) => { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); });
      return { name: b.name, rings, box: [bx0, by0, bx1 - bx0, by1 - by0], d: rings.map(r => "M" + r.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z").join("") };
    });
    list.forEach(s => { s.lab = labelPoint(s); });
    colorize(list);
    return (geoC = { key, list, W, H, P, S, inside: (lat, lng) => lng >= x0 - .02 && lng <= x1 + .02 && lat >= y0 - .02 && lat <= y1 + .02 });
  }
  const inRing = (x, y, r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const segD = (x, y, [ax, ay], [bx, by]) => { const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(x - ax - t * dx, y - ay - t * dy); };
  /* Label at the point deepest inside the shape, so names never sit on a border. */
  function labelPoint(s) {
    const [bx, by, bw, bh] = s.box, r0 = s.rings[0]; let best = null, bd = -1;
    for (let i = 1; i < 24; i++) for (let j = 1; j < 24; j++) {
      const x = bx + bw * i / 24, y = by + bh * j / 24; if (!inRing(x, y, r0)) continue;
      let d = 1e9; s.rings.forEach(r => { for (let a = 0; a < r.length - 1; a++) d = Math.min(d, segD(x, y, r[a], r[a + 1])); });
      if (d > bd) { bd = d; best = [x, y]; }
    }
    return best ? [best[0], best[1], bd] : [bx + bw / 2, by + bh / 2, Math.min(bw, bh) / 4];
  }
  /* Neighbouring barangays never share a color. */
  function colorize(list) {
    const near = (a, b) => a.rings[0].some(p => b.rings[0].some(q => Math.abs(p[0] - q[0]) < 1.5 && Math.abs(p[1] - q[1]) < 1.5));
    list.forEach((s, i) => { const used = new Set(list.slice(0, i).filter(o => near(s, o)).map(o => o.c)); s.c = [0, 1, 2, 3, 4].find(c => !used.has(c)); if (s.c == null) s.c = i % 5; });
  }
  const DM = { el: null, vb: null, drag: null, moved: false, anim: 0 };
  /* opts: { mode: "brgy" | "loc" | "mini", sel: barangay name, pins: [{id,name,cat,lat,lng}], focus: [lat,lng] } */
  function drawnMap(opts) {
    const G = geo(), mini = opts.mode === "mini";
    if (!G.list.length) return `<div class="dmap empty"><p>The barangay map appears here once boundaries are added in Admin › Barangays.</p></div>`;
    const pins = (opts.pins || []).filter(p => G.inside(p.lat, p.lng)).map(p => { const [x, y] = G.P([p.lng, p.lat]); return `<g class="pin" data-loc="${hx(p.id)}" data-x="${x.toFixed(1)}" data-y="${y.toFixed(1)}" style="--pc:${MAPC[p.cat] ? MAPC[p.cat][1] : "#2F6420"}" tabindex="0" role="button" aria-label="${hx(p.name)}"><title>${hx(p.name)}</title><circle/></g>`; }).join("");
    const shapes = G.list.map(s => `<path class="bp c${s.c} ${s.name === opts.sel ? "sel" : ""}" d="${s.d}" ${opts.mode === "brgy" ? `data-bn="${hx(s.name)}" tabindex="0" role="button"` : ""} data-nm="${hx(s.name)}" aria-label="${hx(s.name)}"><title>${hx(s.name)}</title></path>`).join("");
    const labels = G.list.map(s => `<text class="bl ${s.name === opts.sel ? "sel" : ""}" data-nm="${hx(s.name)}" x="${s.lab[0].toFixed(1)}" y="${s.lab[1].toFixed(1)}">${hx(s.name)}</text>`).join("");
    const halo = G.list.map(s => `<path d="${s.d}"/>`).join("");
    return `<div class="dmap ${mini ? "mini" : ""}" data-dmap data-mode="${opts.mode}" ${opts.sel ? `data-sel="${hx(opts.sel)}"` : ""} ${opts.focus ? `data-focus="${opts.focus.join(",")}"` : ""}>
      <svg viewBox="0 0 ${G.W} ${G.H.toFixed(0)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Drawn map of the barangays of Loboc">
        <defs><pattern id="dmgrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none"/></pattern></defs>
        <g class="halo">${halo}</g><g class="shapes">${shapes}</g><g class="labels">${labels}</g><g class="pins">${pins}</g></svg>
      ${mini ? "" : `<div class="dm-title"><span class="n">♪</span><b>Loboc</b><small>Bohol · ${G.list.length} barangays</small></div>
      <div class="dm-ctl"><button type="button" data-dz="in" aria-label="Zoom in">+</button><button type="button" data-dz="out" aria-label="Zoom out">−</button><button type="button" data-dz="all" aria-label="Show all of Loboc">⤢</button></div>
      <div class="dm-north" aria-hidden="true"><svg viewBox="0 0 24 34"><path d="M12 2l7 20-7-5-7 5z"/><text x="12" y="33">N</text></svg></div>
      <div class="dm-scale" aria-hidden="true"><i></i><span></span></div>`}
    </div>`;
  }
  const easeV = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  function dmSet(vb) {
    const el = DM.el; if (!el) return; DM.vb = vb; const svg = qs("svg", el); svg.setAttribute("viewBox", vb.map(v => v.toFixed(2)).join(" "));
    const G = geo(), w = vb[2], sel = el.dataset.sel, box = svg.getBoundingClientRect(), ppu = Math.min(box.width / vb[2], box.height / vb[3]) || 1;
    const fs = (el.classList.contains("mini") ? 11 : box.width < 600 ? 11.5 : 13.5) / ppu;  // same on-screen text size at every zoom
    svg.style.setProperty("--fs", fs + "px");
    G.list.forEach(s => { const t = qs(`text.bl[data-nm="${CSS.escape(s.name)}"]`, svg); if (!t) return; const tw = s.name.length * fs * .56;
      t.style.display = s.name === sel || (tw <= s.lab[2] * 2.6 && fs <= s.lab[2] * 1.4) ? "" : "none"; });
    qsa(".pin", svg).forEach(p => { const r = 8 / ppu; p.querySelector("circle").setAttribute("r", r); p.querySelector("circle").setAttribute("cx", p.dataset.x); p.querySelector("circle").setAttribute("cy", p.dataset.y); p.style.strokeWidth = r * .35; });
    const sc = qs(".dm-scale", el); if (sc) { const unitKm = G.S / 111.32;
      const km = [.25, .5, 1, 2, 5].find(k => k * unitKm * ppu >= 70) || 5; qs("i", sc).style.width = (km * unitKm * ppu) + "px"; qs("span", sc).textContent = km < 1 ? km * 1000 + " m" : km + " km"; }
  }
  function dmGo(target, fast) {
    cancelAnimationFrame(DM.anim); const from = DM.vb.slice(), t0 = performance.now(), dur = fast || RM ? 0 : 420;
    const step = now => { const t = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - t, 3); dmSet(easeV(from, target, e)); if (t < 1) DM.anim = requestAnimationFrame(step); };
    DM.anim = requestAnimationFrame(step);
  }
  const dmFull = () => { const G = geo(), p = 18; return [-p, -p, G.W + 2 * p, G.H + 2 * p]; };
  /* Fit a box, keeping the map's own proportions and a sensible closest zoom. */
  function dmFit([x, y, w, h], minW) {
    const F = dmFull(), ar = F[3] / F[2]; let W = Math.max(w * 1.6, minW || 160), H = W * ar; if (H < h * 1.6) { H = h * 1.6; W = H / ar; }
    return [x + w / 2 - W / 2, y + h / 2 - H / 2, W, H];
  }
  function dmInit() {
    const el = qs("[data-dmap]"); DM.el = el; if (!el || !qs("svg", el)) return;
    const G = geo(), sel = el.dataset.sel, s = sel && G.list.find(b => b.name === sel);
    DM.vb = dmFull(); dmSet(DM.vb);
    if (el.dataset.focus) { const [la, ln] = el.dataset.focus.split(",").map(Number), [x, y] = G.P([ln, la]); dmSet(dmFit([x - 1, y - 1, 2, 2], 260)); }
    else if (s && el.dataset.mode !== "brgy") dmSet(dmFit(s.box, 220));
    if (el.classList.contains("mini")) return;
    const svg = qs("svg", el), pt = e => { const r = svg.getBoundingClientRect(), k = Math.max(DM.vb[2] / r.width, DM.vb[3] / r.height); return [e.clientX * k, e.clientY * k]; };
    svg.addEventListener("pointerdown", e => { if (e.button) return; DM.drag = { s: pt(e), vb: DM.vb.slice(), x: e.clientX, y: e.clientY }; DM.moved = false; });
    svg.addEventListener("pointermove", e => { const d = DM.drag; if (!d) return; if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5) { DM.moved = true; svg.setPointerCapture(e.pointerId); el.classList.add("dragging"); }
      if (DM.moved) { const p = pt(e); dmSet([d.vb[0] - (p[0] - d.s[0]), d.vb[1] - (p[1] - d.s[1]), d.vb[2], d.vb[3]]); } });
    const end = () => { DM.drag = null; el.classList.remove("dragging"); };
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    if (s && el.dataset.mode === "brgy") dmGo(dmFit(s.box, 220), true);
  }
  function dmZoom(dir) {
    if (!DM.vb) return; const [x, y, w, h] = DM.vb, F = dmFull();
    if (dir === "all") return dmGo(F);
    const k = dir === "in" ? .65 : 1 / .65, W = Math.min(Math.max(w * k, 90), F[2] * 1.2), H = W * h / w;
    dmGo([x + w / 2 - W / 2, y + h / 2 - H / 2, W, H]);
  }
  function dmHighlight(name, zoom) {
    const el = DM.el; if (!el) return; el.dataset.sel = name || "";
    qsa(".bp", el).forEach(p => p.classList.toggle("sel", p.dataset.nm === name)); qsa(".bl", el).forEach(t => t.classList.toggle("sel", t.dataset.nm === name));
    const s = name && geo().list.find(b => b.name === name), selP = s && qs(`.bp[data-nm="${CSS.escape(name)}"]`, el); if (selP) selP.parentNode.appendChild(selP);
    if (zoom) dmGo(s ? dmFit(s.box, 220) : dmFull()); else dmSet(DM.vb);
  }

  /* ----- barangay logos, panel and selection ----- */
  /* Temporary barangay seal: a leaf-green circle with initials. Replaced by the logo uploaded in Admin › Barangays. */
  function brgyLogo(b, size) {
    const img = b && (b.photos || [])[0] ? API.safeImg(b.photos[0]) : "";
    if (img) return `<span class="blogo" style="--s:${size}px"><img src="${hx(img)}" alt="${hx(b.name)} logo" loading="lazy"></span>`;
    const n = (b && b.name) || "", ini = n.split(/\s+/).filter(w => /^[A-Za-z]/.test(w)).map(w => w[0]).join("").slice(0, 2).toUpperCase() || n.slice(0, 2).toUpperCase();
    return `<span class="blogo tmp" style="--s:${size}px;--h:${80 + hash(n) % 60}" title="Temporary logo"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47"/><circle cx="50" cy="50" r="39" class="r2"/><path d="M50 14c9 7 13 15 0 23-13-8-9-16 0-23z" class="lf"/><text x="50" y="66">${hx(ini)}</text></svg></span>`;
  }
  function brgPanel(name) {
    if (!name) return `<div class="bp-empty">${brgyLogo({ name: "Loboc" }, 64)}<div><h3>Select a barangay</h3><p class="fine" style="margin:4px 0 0">Tap a barangay on the map, choose one from the list, or tap a card below to see its profile, officials and places.</p></div></div>`;
    const b = API.list("brgys").find(x => x.name === name) || { name }, O = API.list("officials");
    const cap = O.find(o => o.group === "barangay" && o.brgy === name && o.role === "Punong Barangay"), sk = O.find(o => o.group === "barangay" && o.brgy === name && o.role === "SK Chairperson");
    const here = [...pub("places"), ...pub("listings")].filter(p => p.brgy === name);
    return `<div class="bp-head">${brgyLogo(b, 76)}<div><span class="tag">Barangay</span><h3 style="font-size:1.6rem;margin-top:6px">${hx(name)}</h3></div></div>
      <div class="facts" style="margin:12px 0">${[["Population" + (b.pop && b.popNote ? ` (${b.popNote})` : ""), b.pop ? Number(b.pop).toLocaleString("en-PH") : "Not yet listed"], ["Land area", b.area || "Not yet listed"], ["Punong Barangay", cap && cap.name || "To be added"], ["SK Chairperson", sk && sk.name || "To be added"]].map(([l, v]) => `<div class="fact" style="box-shadow:none;border:1px solid var(--line)"><small>${l}</small><b>${hx(v)}</b></div>`).join("")}</div>
      ${b.desc ? `<p>${hx(b.desc)}</p>` : ""}<p><b>Places here:</b> ${here.length ? here.map(p => p.kind ? `<a href="#place/${hx(p.id)}">${hx(p.name)}</a>` : hx(p.name)).join(", ") : "None listed yet"}</p>
      <div class="chips"><a class="btn p sm" href="#officials" data-offb="${hx(name)}">View officials</a>${dirBtn(b.id || name, "Barangay " + name)}</div>`;
  }
  function selectB(name, scroll) {
    ST.mapB = name; const bp = qs("#bp"); if (bp) bp.innerHTML = brgPanel(name);
    qsa(".bcard[data-bn]").forEach(g => g.classList.toggle("sel", g.dataset.bn === name));
    const s = qs("[data-mapb]"); if (s) s.value = name;
    dmHighlight(name, true);
    if (scroll) { const m = qs(".bigmap"); if (m) m.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" }); }
  }
  const pinsOf = () => allLocs().filter(p => ST.layers[p.cat] !== false).map(p => { const k = coord(p.id); return k ? { id: p.id, name: p.name, cat: p.cat, lat: k.lat, lng: k.lng } : null; }).filter(Boolean);
  function showLoc(id) {
    const p = allLocs().find(x => x.id === id), pc = qs("#pc"); if (!p || !pc) return;
    pc.innerHTML = `<div class="pc-grid"><div class="pc-ph">${ph(p.name, p.photos, MAPC[p.cat][0])}</div><div><h3>${hx(p.name)}</h3><div class="meta" style="margin:6px 0"><span class="tag" style="background:${MAPC[p.cat][1]};color:#fff">${MAPC[p.cat][0]}</span>${p.brgy ? `<span class="tag mute">${hx(p.brgy)}</span>` : ""}</div>
      <p class="fine">${hx(p.desc || "")}</p>${rateLine(p.id, p.name)}${p.phone ? `<p><b>📞 ${hx(p.phone)}</b></p>` : ""}
      <div class="chips" style="margin-top:10px">${p.link ? `<a class="btn p sm" href="${hx(p.link)}">View</a>` : ""}${p.phone ? `<a class="btn g sm" href="tel:${hx(p.phone.replace(/[^\d+]/g, ""))}">${ICON.phone} Call</a>` : ""}<button class="btn g sm" data-view="${hx(p.id)}" data-vi="0">${ICON.cam} Photos</button>${dirBtn(p.id, p.name)}</div></div></div>`;
    qsa("[data-loc]").forEach(b => { b.setAttribute("aria-current", b.dataset.loc === id); b.classList.toggle("sel", b.dataset.loc === id); });
    const pin = DM.el && qs(`.pin[data-loc="${CSS.escape(id)}"]`, DM.el);
    if (pin) { pin.parentNode.appendChild(pin); dmHighlight(p.brgy || "", false); dmGo(dmFit([+pin.dataset.x - 1, +pin.dataset.y - 1, 2, 2], 260)); }
    else dmHighlight(p.brgy || "", !!p.brgy);
  }
  P.maps = sub => {
    if (sub === "brgy" || sub === "loc") ST.maps = sub;
    let body = tabs("maps", [["brgy", "Barangays"], ["loc", "Locations"]], ST.maps);
    if (ST.maps === "brgy") {
      const B = API.list("brgys").slice().sort(byOrder), O = API.list("officials"), G = geo();
      const off = (n, r) => { const o = O.find(x => x.group === "barangay" && x.brgy === n && x.role === r); return o && o.name || "To be added"; };
      body += `<div class="tools"><select class="inp" data-mapb aria-label="Choose a barangay"><option value="">All of Loboc</option>${B.map(b => `<option ${b.name === ST.mapB ? "selected" : ""}>${hx(b.name)}</option>`).join("")}</select></div>
        <div class="bigmap">${drawnMap({ mode: "brgy", sel: ST.mapB })}</div>
        <p class="fine" style="margin-top:8px">Tap a barangay to see its profile. Drag to move the map; use + and − to zoom. Boundaries: LGU Loboc${G.list.length < B.length ? ` (${G.list.length} of ${B.length} barangays drawn)` : ""}.</p>
        <div class="bpanel" id="bp" aria-live="polite">${brgPanel(ST.mapB)}</div>
        <section class="bframe" aria-labelledby="bfh"><div class="bframe-h"><h2 class="h2" id="bfh" style="margin:0">Barangays of Loboc</h2><span class="tag">${B.length} barangays</span></div>
          <div class="bgrid">${B.map(b => `<button class="bcard ${ST.mapB === b.name ? "sel" : ""}" data-bn="${hx(b.name)}" data-bscroll>${brgyLogo(b, 64)}<b>${hx(b.name)}</b><small>Punong Barangay: ${hx(off(b.name, "Punong Barangay"))}</small><small>SK Chair: ${hx(off(b.name, "SK Chairperson"))}</small></button>`).join("")}</div></section>`;
    } else {
      const L0 = allLocs(), missing = L0.filter(p => !coord(p.id)), shown = L0.filter(p => ST.layers[p.cat] !== false);
      body += `<div class="chips" style="margin-bottom:14px">${Object.entries(MAPC).map(([k, [l, col]]) => `<label class="chip"><input type="checkbox" data-layer="${k}" ${ST.layers[k] !== false ? "checked" : ""} style="accent-color:${col}"> <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${col}"></span> ${l}</label>`).join("")}</div>
        <div class="bigmap">${drawnMap({ mode: "loc", pins: pinsOf() })}</div>
        ${missing.length ? `<p class="fine" style="margin-top:8px">${L0.length - missing.length} of ${L0.length} places have a pin. The rest get one once their coordinates are added in js/config.js; until then, tapping them highlights their barangay.</p>` : ""}
        <div class="bpanel" id="pc" aria-live="polite"><h3>Tap a pin or a place</h3><p class="fine" style="margin:0">Photo, phone, rating and directions appear here.</p></div>
        <h3 style="margin:26px 0 10px">All locations</h3><div class="loclist">${shown.map(p => `<button data-loc="${hx(p.id)}"><span style="background:${MAPC[p.cat][1]}"></span><b>${hx(p.name)}</b><small>${MAPC[p.cat][0]}${coord(p.id) ? "" : " · no pin yet"}</small></button>`).join("") || `<p class="fine">Turn on a category above.</p>`}</div>`;
    }
    post = dmInit;
    return page("Maps", "Maps", "Barangays and locations of interest.", body);
  };

  /* ----- HERITAGE ----- */
  /* ----- HERITAGE (with the scroll-filling Anchor Timeline) ----- */
  const TL = () => API.list("timeline").slice().sort(byOrder);
  function timelineSec() {
    const T = TL(); if (!T.length) return "";
    const last = String(T[T.length - 1].year).split(/[–-]/).pop();
    return `<section class="tlbg pad" id="timeline">${notes(10, 7)}<div class="wrap">
      <div class="eyebrow pop" style="justify-content:center;color:var(--leaf-l)">Anchor timeline</div>
      <h2 class="h2 pop" style="color:#fff;text-align:center;margin-bottom:10px">${hx(T[0].year)} to ${hx(last)}</h2>
      <p class="pop" style="text-align:center;color:#CFE6BF;margin:0 0 30px">Scroll down. The line fills as you travel through Loboc's history.</p>
      <div class="tline" id="tl"><div class="line" aria-hidden="true"><div class="fill" id="fill"></div></div>
      ${T.map((t, i) => { const p = t.photos || [];
        return `<div class="tli ${i % 2 ? "flip" : ""}" id="tl${i}"><span class="dot" aria-hidden="true">♪</span>
          <div class="${i % 2 ? "fromR" : "fromL"} pop"><div class="tcard ${t.anchor ? "anc" : ""}">${t.anchor ? '<span class="badge">Anchor year</span>' : ""}<div class="yr">${hx(t.year)}</div><h3>${hx(t.title)}</h3><p>${hx(t.text)}</p></div></div>
          <div class="ill-w"><div class="pop tilt" style="--d:.15s"><button class="ill" data-tlv="${hx(t.id)}" aria-label="Photos for ${hx(t.year)}">${p[0] ? `<img src="${hx(p[0])}" alt="${hx(t.title)}" loading="lazy">` : `<div class="paper"><div><svg viewBox="0 0 40 30" fill="none" stroke="#2F6420" stroke-width="2"><path d="M2 26l10-14 8 9 7-12 11 17z"/></svg>Illustration<b>${hx(t.year)}</b></div></div>`}</button></div>
            <div class="snap" data-par><div class="pop swing" style="--d:.45s"><div>${p[1] ? ph(t.title, p, "", 1) : ph(t.year + t.title, null, "Snapshot")}</div></div></div></div></div>`; }).join("")}
      </div></div></section>`;
  }
  P.heritage = sub => {
    const H = SEED.heritage, her = pub("places").filter(p => p.kind === "Heritage"), T = TL();
    if (sub !== undefined && sub !== "") setTimeout(() => { const t = qs("#tl" + sub); if (t) { t.classList.add("flash"); t.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "center" }); } }, 200);
    return `${pageHead("Heritage", "Heritage of Loboc", "Stone, song and river: the places and years that made Loboc.")}
      <section class="pad staff" style="padding-top:30px"><div class="wrap">
        <div class="chips pop" style="margin-bottom:24px"><a class="chip sm" href="#heritage/0" style="background:var(--forest);color:#fff;border-color:var(--forest)">▼ Jump to the timeline</a>${T.map((t, i) => `<a class="chip sm" href="#heritage/${i}">${hx(t.year)}</a>`).join("")}</div>
        <div class="estab pop"><div class="eyebrow">Quick review</div><h2 class="h2" style="font-size:1.9rem">Establishment of Loboc, Bohol</h2>
          <div class="facts" style="margin:14px 0">${H.established.map(([l, v]) => `<div class="fact" style="box-shadow:none;border:1px solid var(--line);border-top:4px solid var(--leaf)"><small>${l}</small><b>${v}</b></div>`).join("")}</div>
          <p><b>What does “Loboc” mean?</b> ${H.meaning}</p><h3>How it happened</h3><ol class="steps">${H.steps.map(s => `<li>${s}</li>`).join("")}</ol>
          <details class="fq"><summary>Was there a decree creating the town?</summary><p>${H.decree}</p></details></div>
        <h2 class="h2 pop" style="margin-top:50px;font-size:2rem">Heritage gallery</h2><p class="fine">Tap a site to open its photos.</p>
        <div class="hgal">${her.map((p, i) => `<button class="pop" style="--d:${i * .08}s" data-view="${hx(p.id)}" data-vi="0" aria-label="Open photos: ${hx(p.name)}">${ph(p.name, p.photos, "")}<span>${hx(p.name)}${p.photos && p.photos.length ? ` · ${p.photos.length} photo${p.photos.length > 1 ? "s" : ""}` : ""}</span></button>`).join("") || `<p class="fine">No heritage sites listed yet.</p>`}</div>
        ${her.length ? `<h2 class="h2 pop" style="margin-top:44px;font-size:2rem">Rate and review our heritage sites</h2><div class="grid">${her.map((p, i) => `<article class="card pop" style="--d:${i * .08}s"><a href="#place/${hx(p.id)}">${ph(p.name, p.photos, "Heritage")}</a><div class="cb"><h3>${hx(p.name)}</h3>${rateLine(p.id, p.name)}<p>${hx(p.desc)}</p><div class="acts"><a class="btn p sm" href="#place/${hx(p.id)}">View</a>${dirBtn(p.id, p.name)}</div></div></article>`).join("")}</div>` : ""}
      </div></section>${wave("#fff", "#1C3D12")}${timelineSec()}${wave("#1E5A3C", "#1C3D12")}${footer()}`;
  };

  /* ----- ABOUT (About Loboc · Getting there & FAQ · Gallery) ----- */
  const ABT = {
    about: () => { const s = S(); return `<div class="two"><div><p class="story">${hx(s.aboutText || s.welcomeText)}</p><p>${hx(s.welcomeText)}</p><div class="chips" style="margin:18px 0"><a class="chip" href="#heritage">See Heritage timeline</a><a class="chip" href="#officials">Officials</a><a class="chip" href="#guide">Visitor guide</a><a class="chip" href="#maps">Maps</a></div>
        <div class="estab" style="background:var(--leaf-50)"><div class="eyebrow">Our hymn</div><h3 style="font-size:1.5rem">${hx(s.hymnTitle)}</h3><p style="white-space:pre-wrap">${hx(s.hymnLyrics)}</p><button class="btn p sm" data-hymn>♪ Play the hymn</button></div></div>
        <div>${(() => { const g = API.list("gallery").find(x => x.photos && x.photos.length); return g ? `<button class="cd-btn" data-album="${hx(g.id)}" aria-label="Open photo slideshow">${ph(g.title, g.photos, "Slideshow")}</button>` : ph("Loboc", null, "Photo slideshow"); })()}
          <h3 style="margin:20px 0 10px">Quick facts</h3><div class="facts" style="margin:0">${[["Location","Bohol, Central Visayas"],["Barangays", String(BRN().length)],["Best months","December to May"],["Known for","River cruise, choir, music"],["Patron","San Pedro Apostol"],["Founded","1597"]].map(([l, v]) => `<div class="fact"><small>${l}</small><b>${v}</b></div>`).join("")}</div></div></div>`; },
    info: () => { const R = API.list("transport").slice().sort(byOrder), r = R[ST.route] || R[0], F = API.list("faqs").slice().sort(byOrder), H = API.list("hotlines").slice().sort(byOrder).slice(0, 4);
      return `<div class="two"><div><h2 class="h2" style="font-size:1.8rem">Getting there</h2><div class="chips" role="group" style="margin-bottom:12px">${R.map((x, i) => `<button class="chip" data-route="${i}" aria-pressed="${x === r}">${hx(x.title)}</button>`).join("")}</div>
          ${r ? `<div class="route"><h3 style="font-size:1.15rem">${hx(r.title)}</h3><p style="margin:6px 0 0">${hx(r.desc)}</p></div>` : `<p class="fine">Routes not added yet.</p>`}
          <h2 class="h2" style="font-size:1.8rem;margin-top:32px">FAQ</h2>${F.map(f => `<details class="fq"><summary>${hx(f.q)}</summary><p>${hx(f.a)}</p></details>`).join("") || `<p class="fine">No questions yet.</p>`}</div>
        <div><h2 class="h2" style="font-size:1.8rem">Safety, etiquette &amp; emergency contacts</h2><p>${hx(S().safety || "")}</p>
          <div style="display:grid;gap:8px">${H.map(h => `<div class="hot"><span class="ic" aria-hidden="true">🚨</span><div><b>${hx(h.name)}</b><span class="fine">${hx(h.note)}</span></div><a class="num" href="tel:${hx(h.number.replace(/[^\d+]/g, ""))}">${hx(h.number)}</a></div>`).join("")}</div>
          <a class="btn p sm" style="margin-top:14px" href="#guide/hotlines">All hotlines</a></div></div>`; },
    gallery: () => { const G = API.list("gallery").slice().sort(byOrder);
      return `<p class="fine">Tap an album to view its photos.</p><div class="grid">${G.map((g, i) => `<button class="card pop cd-btn" style="--d:${i * .05}s" data-album="${hx(g.id)}">${ph(g.title, g.photos, (g.photos || []).length ? g.photos.length + " photos" : "Photos coming soon")}<div class="cb"><h3>${hx(g.title)}</h3></div></button>`).join("") || `<p>No albums yet.</p>`}</div>`; }
  };
  P.about = sub => { if (ABT[sub]) ST.about = sub;
    return page("About", "About &amp; Visitor Info", "River town and Music Capital of Bohol. Plan your visit here.", tabs("about", [["about", "About Loboc"], ["info", "Getting there & FAQ"], ["gallery", "Gallery"]], ST.about) + ABT[ST.about]()); };

  /* ----- CONTACT ----- */
  P.contact = () => { const s = S(), u = API.user();
    const form = u ? `<form class="frm" id="cf" novalidate><div class="row2"><label>Name<input readonly value="${hx(u.name)}"></label><label><span>Email <span class="lh">(replies go here)</span></span><input readonly value="${hx(u.email)}"></label></div>
        <label>Subject<select name="subject">${API.SUBJECTS.map(x => `<option>${x}</option>`).join("")}</select></label>
        <label>Message<textarea name="body" rows="5" maxlength="1500" required></textarea><span class="counter"><span id="cfc">0</span>/1500</span></label>
        <span class="err" id="cferr" role="alert"></span><button class="btn p" type="submit">Send message</button><div id="cfok" role="status"></div></form>`
      : loginBox("Log in to send a message or report", "Messages and reports are linked to your verified Gmail so the Tourism Office knows who sent them and can reply straight to your inbox.");
    return page("Contact", "Contact Us", "Questions, group visits, accessibility requests and feedback.",
      `<div class="two w"><div>${form}</div><aside class="side"><h3>${hx(s.officeName)}</h3><p style="margin:0">📍 ${hx(s.officeAddress)}<br>🕘 ${hx(s.officeHours)}<br>📞 <a href="tel:${hx(C.SOCIAL.phone.replace(/[^\d+]/g, ""))}">${hx(C.SOCIAL.phone)}</a><br>✉️ <a href="mailto:${hx(C.SOCIAL.email)}">${hx(C.SOCIAL.email)}</a></p>
        <div><b>Follow &amp; message us</b>${socials()}</div>${C.SOCIAL.facebook ? `<a class="btn r" href="${hx(C.SOCIAL.facebook)}" target="_blank" rel="noopener">Message us on Facebook</a>` : ""}${mapEmbed("pl-tourism", "Loboc Tourism Complex")}</aside></div>`); };

  /* ----- ACCOUNT ----- */
  P.account = () => { const u = API.user(); if (!u) return page("Account", "My account", "Your reviews and messages.", loginBox("Log in to see your account", "Your reviews and your messages to the Tourism Office are kept here."));
    const msgs = API.myMessages(), rv = API.myReviews();
    return page("My account", `Hello, ${hx(u.name.split(" ")[0])}`, hx(u.email),
      `<div class="chips" style="margin-bottom:24px">${u.role !== "tourist" ? `<a class="btn p sm" href="#admin">Open dashboard</a>` : ""}<button class="btn g sm" data-logout>Log out</button></div>
      <div class="two"><div><h2 class="h2" style="font-size:1.7rem">My messages</h2>${msgs.map(m => `<div class="thread"><div class="sec-h" style="margin:0"><b>${hx(m.subject)}</b><span class="tag ${m.status === "Replied" ? "" : "mute"}">${hx(m.status)}</span></div>
        <div class="bubble me"><small>You · ${fmtWhen(m.created)}</small>${hx(m.body)}</div>${m.replies.map(r => `<div class="bubble staff"><small>${hx(r.by)} (Tourism Office) · ${fmtWhen(r.at)}</small>${hx(r.body)}</div>`).join("")}</div>`).join("") || `<p class="fine">No messages yet. <a href="#contact">Send one</a>.</p>`}</div>
      <div><h2 class="h2" style="font-size:1.7rem">My reviews</h2>${rv.map(r => `<div class="thread"><b>${hx(r.targetName || "")}</b> ${stars(r.rating)}<p style="margin:6px 0 0">${hx(r.text)}</p></div>`).join("") || `<p class="fine">No reviews yet.</p>`}</div></div>`); };

  P.notfound = () => page("Not found", "Page not found", "That page doesn't exist or was removed.", `<a class="btn p" href="#home">Back home</a>`);

  /* =====================================================================
     WELCOME / LOG IN / SIGN UP  (shown first when not logged in)
     ===================================================================== */
  const AU = { mode: "login", email: "", demoCode: "", cool: 0, staff: false };
  function authCard(mode) {
    if (mode) AU.mode = mode;
    const s = S(), m = AU.mode;
    const pw = (n, ph, ac) => `<div class="pw-w"><input name="${n}" type="password" required minlength="8" autocomplete="${ac}" placeholder="${ph}"><button type="button" data-pw aria-label="Show password">Show</button></div>`;
    let card = "";
    if (m === "login" || m === "signup") card = `<h2>${m === "login" ? (AU.staff ? "Staff log in" : "Welcome back") : "Create your account"}</h2><p class="fine" style="margin:0">${AU.staff ? "Admin and PIO accounts only." : m === "login" ? "Log in to enter DiscoverLubok." : "Use your Gmail. We'll send a 6-digit code to verify it."}</p>
      ${AU.staff ? "" : `<div class="seg" role="group"><button type="button" data-amode="login" aria-pressed="${m === "login"}">Log in</button><button type="button" data-amode="signup" aria-pressed="${m === "signup"}">Sign up</button></div>`}
      <form class="frm" id="authf" data-mode="${m}" novalidate style="${AU.staff ? "margin-top:18px" : ""}">
        ${m === "signup" ? `<label>Full name<input name="name" required maxlength="60" autocomplete="name"></label>` : ""}
        <label>${m === "signup" ? "Gmail address" : "Email"}<input name="email" type="email" required autocomplete="email" placeholder="${m === "signup" ? "yourname@gmail.com" : ""}" value="${hx(AU.email)}"></label>
        <label>Password${pw("password", m === "signup" ? "At least 8 characters" : "", m === "signup" ? "new-password" : "current-password")}</label>
        ${m === "signup" ? `<div class="pw-meter"><i id="pwm"></i></div><span class="hint" id="pwh">Use 8+ characters with letters and numbers.</span><label>Confirm password${pw("password2", "", "new-password")}</label>
          <label class="chk"><input type="checkbox" name="agree" required> I agree that the LGU may use my email to reply to my messages and reviews.</label>` : `<button type="button" class="link-b" data-amode="forgot" style="justify-self:end;font-size:.84rem">Forgot password?</button>`}
        <span class="err" id="aerr" role="alert"></span><button class="btn p" type="submit">${m === "login" ? "Log in" : "Send verification code"}</button></form>
      ${AU.staff ? `<a class="btn g guest-b" href="#welcome" data-close>‹ Back to the welcome page</a>` : `<p class="fine" style="text-align:center;margin:14px 0 0">Log in to rate places, write reviews and message the Tourism Office. You can browse without an account.</p>`}`;
    else if (m === "verify" || m === "reset") card = `<h2>${m === "verify" ? "Check your Gmail" : "Reset password"}</h2><p class="fine">${m === "verify" ? `If <b>${hx(AU.email)}</b> is new, we sent it a 6-digit code. Already registered? <button type="button" class="link-b" data-amode="login">Log in</button> or reset your password.` : `If an account exists for <b>${hx(AU.email)}</b>, we sent it a 6-digit code.`} The code expires in 10 minutes.</p>
      <form class="frm" id="otpf" data-mode="${m}" novalidate><div class="otp">${[0,1,2,3,4,5].map(i => `<input inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" data-otp="${i}" autocomplete="${i ? "off" : "one-time-code"}">`).join("")}</div>
        ${m === "reset" ? `<label>New password${pw("password", "At least 8 characters", "new-password")}</label>` : ""}
        <span class="err" id="aerr" role="alert"></span><button class="btn p" type="submit">${m === "verify" ? "Verify and continue" : "Save new password"}</button>
        <button type="button" class="btn g" data-resend ${AU.cool > Date.now() ? "disabled" : ""}>Resend code</button><button type="button" class="link-b" data-amode="login">‹ Back to log in</button></form>
      ${AU.demoCode && API.mode === "demo" ? `<div class="demo-note"><b>Preview mode:</b> emails are not sent yet. Your code is <b style="font-size:1.1rem;letter-spacing:.2em">${AU.demoCode}</b></div>` : ""}`;
    else if (m === "forgot") card = `<h2>Forgot password</h2><p class="fine">Enter your email and we'll send a reset code.</p><form class="frm" id="forgotf" novalidate><label>Email<input name="email" type="email" required value="${hx(AU.email)}"></label><span class="err" id="aerr" role="alert"></span><button class="btn p" type="submit">Send reset code</button><button type="button" class="link-b" data-amode="login">‹ Back to log in</button></form>`;
    const demo = API.mode === "demo" && (m === "login") ? `<div class="demo-note"><b>Preview accounts</b> (remove before going live):<br>${C.DEMO_STAFF.map(d => `${d.role.toUpperCase()}: ${hx(d.email)} / ${hx(d.password)}`).join("<br>")}</div>` : "";
    return `<button class="x authx" data-close aria-label="Close">×</button>${card}${demo}`;
  }
  /* =====================================================================
     LANDING PAGE (shown before log in) + log in / sign up pop-up
     ===================================================================== */
  window.LOBOC_PARTNER_FALLBACK = img => { const s = document.createElement("span"); s.className = "pbadge"; s.textContent = img.alt; img.replaceWith(s); };
  const fmtHead = t => hx(t).replace(/\[(.+?)\]/g, "<em>$1</em>").replace(/\n/g, "<br>");
  const fmtBold = t => hx(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  function landing() {
    const s = S(), hl = pub("highlights").sort(byOrder), yrs = new Date().getFullYear() - 1597;
    const L0 = API.landingStats(), stats = [[L0.destinations, "+", "Destinations"], [L0.guides, "", "Accredited guides"], [L0.barangays, "", "Barangays"], [L0.years, "", "Years of history"]];
    const why = [["🎶", "Music Capital of Bohol", "Choirs, rondalla and brass bands that have played for over four centuries."], ["🛶", "River adventures", "Floating restaurants, paddleboarding, kayaking and waterfalls."], ["⛪", "Living heritage", "The 1734 coral-stone church and a history that began in 1597."], ["♿", "Friendly for everyone", "PWD access and a breastfeeding station at the Tourism Complex."]];
    return `<div class="land">
      <header class="lnav" id="lnav"><a class="lbrand" href="#welcome" data-lgo="ltop"><span class="logo">${logo()}</span><span>Discover<b>Lubok</b></span></a>
        <nav class="llinks" id="llinks" aria-label="Landing">${[["ltop", "Home"], ["ldest", "Destinations"], ["lcontact", "Contacts"], ["labout", "About Us"]].map(([k, l], i) => `<a href="#welcome" data-lgo="${k}" ${i ? "" : 'aria-current="true"'}>${l}</a>`).join("")}</nav>
        <div class="lnav-r"><button class="btn l sm" data-auth="login">Log In</button><button class="lmenu" data-lmenu aria-label="Menu" aria-expanded="false">☰</button></div></header>
      <section class="lhero" id="ltop">
        <div class="lbg" data-hbg>${C.HERO_IMAGE_SRC ? `<img src="${hx(C.HERO_IMAGE_SRC)}" alt="" data-fb="remove">` : ""}${C.HERO_VIDEO_SRC ? `<video autoplay muted loop playsinline preload="metadata" aria-hidden="true"><source src="${hx(C.HERO_VIDEO_SRC)}" type="video/mp4" data-fb="parent"></video>` : ""}</div>
        <div class="lshade"></div>${notes(12, 3)}
        <div class="lin">
          <p class="lquote pop">♪ “${hx(s.quote)}” ♪</p>
          <h1 class="pop" style="--d:.1s">${fmtHead(s.landHeadline || "Hear the [RIVER.]\nFeel the [MUSIC.]")}</h1>
          <p class="lsub pop" style="--d:.2s">${fmtBold(s.landSub || "")}</p>
          <div class="lbtns pop" style="--d:.3s"><button class="btn l" data-auth="login" data-to="explore"><svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg> Explore Loboc</button><button class="btn lghost" data-video><svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></svg> Watch Video</button></div>
          <div class="lstats pop" style="--d:.4s">${stats.map(([n, suf, l]) => `<div><b data-count="${n}" data-suf="${suf}">0${suf}</b><span>${l}</span></div>`).join("")}</div>
        </div>
        <button class="cue" data-lgo="ldest" aria-label="Scroll to destinations" style="color:#fff">Scroll<span style="border-color:#fff"></span></button>
      </section>
      <section class="pad staff" id="ldest">${notes(6, 2)}<div class="wrap">
        <div class="sec-h"><div><div class="eyebrow pop">Destinations</div><h2 class="h2 pop fromL">Top things to see in Loboc</h2></div><button class="btn p sm pop" data-auth="login" data-to="explore">See all tourist spots</button></div>
        <div class="grid">${hl.map((h, i) => `<article class="card pop ${i % 2 ? "fromR" : "fromL"}" style="--d:${i * .08}s"><button class="cd-btn" data-auth="login" data-to="highlight/${hx(h.id)}" aria-label="${hx(h.title)}">${ph(h.title, h.photos, h.kicker)}</button><div class="cb"><span class="tag">${hx(h.kicker)}</span><h3>${hx(h.title)}</h3><p>${hx(h.summary)}</p><div class="acts"><button class="btn p sm" data-auth="login" data-to="highlight/${hx(h.id)}">Learn more</button></div></div></article>`).join("")}</div>
      </div></section>
      ${wave("#fff", "#F3FAEA")}
      <section class="pad s-leafl staff" id="labout">${notes(6, 8)}<div class="wrap">
        ${C.BRAND_LOGO_SRC ? `<img class="lbrandmark pop zoom" src="${hx(C.BRAND_LOGO_SRC)}" alt="Loboc, a piece of heaven" data-fb="remove">` : ""}
        <div class="eyebrow pop">About Loboc</div><h2 class="h2 pop fromL">Why visit Loboc?</h2><p class="lead pop">${hx(s.welcomeText)}</p>
        <div class="cat-tiles" style="margin-top:24px">${why.map(([ic, t, d], i) => `<div class="tile ${["", "t2", "t3", "t4"][i]} pop tilt" style="--d:${i * .1}s;cursor:default"><span class="ico" aria-hidden="true">${ic}</span><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>
        <div class="lcta pop zoom"><div><h3>Make the most of your visit</h3><ul><li>⭐ Rate and review the places you visit</li><li>✉️ Message the Tourism Office and get replies in your Gmail</li><li>📢 Never miss news and announcements</li></ul></div>
          <div class="lcta-b"><button class="btn p" data-auth="signup">Create a free account</button><button class="btn g" data-auth="login">Log in</button><span class="fine">Browse freely. A free account is only needed to rate, review or send a message.</span></div></div>
      </div></section>
      ${wave("#F3FAEA", "#1C3D12")}<div id="lcontact">${footer()}</div></div>`;
  }
  function counters() {
    qsa("[data-count]").forEach(el => { const n = +el.dataset.count, suf = el.dataset.suf || "", t0 = performance.now(), dur = RM ? 0 : 1600;
      const step = t => { const k = dur ? Math.min(1, (t - t0) / dur) : 1, v = Math.round(n * (1 - Math.pow(1 - k, 3))); el.textContent = v.toLocaleString("en-PH") + suf; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step); });
  }
  function openVideo() {
    const raw = C.TOUR_VIDEO_URL || C.HERO_VIDEO_SRC || "", u = /^https:\/\//i.test(raw) || /^[\w\-./]+\.(mp4|webm)$/i.test(raw) ? raw : "", yt = /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(u);
    const body = yt ? `<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0" title="Loboc tourism video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`
      : u ? `<div class="vid"><video src="${hx(u)}" controls autoplay playsinline data-fb="video"></video></div>`
      : `<p>The tourism video will be added by the LGU soon.</p>`;
    openModal(`${mhead("DiscoverLubok")}${body}`, true);
  }
  function openAuth(mode) {
    const box = qs("#authBox");
    if (box && modal.classList.contains("open")) { box.innerHTML = authCard(mode); }
    else { openModal(`<div id="authBox">${authCard(mode)}</div>`); mb.classList.add("authm"); }
    const f = qs("[data-otp]", mb) || qs("#authf input, #forgotf input", mb); if (f) f.focus();
  }
  const pwScore = p => [/.{8,}/, /[a-z]/i, /\d/, /[^a-z0-9]/i, /.{12,}/].reduce((s, r) => s + r.test(p), 0);
  function afterLogin(u) {
    toast("Welcome, " + u.name.split(" ")[0] + "!");
    const back = AU.back && !/^welcome/.test(AU.back) ? AU.back : (u.role === "tourist" ? "home" : "admin");
    AU.staff = false; AU.back = ""; closeModal(); go(back);
  }
  async function authSubmit(f) {
    const err = qs("#aerr"), d = Object.fromEntries(new FormData(f)), btn = qs("button[type=submit]", f); err.textContent = "";
    const busy = b => { btn.disabled = b; };
    try {
      if (f.id === "authf") {
        AU.email = (d.email || "").trim();
        if (f.dataset.mode === "signup") {
          if ((d.name || "").trim().length < 2) throw new Error("Please enter your full name.");
          if (!/^[a-z0-9._%+-]+@gmail\.com$/i.test(AU.email)) throw new Error("Please use a Gmail address (name@gmail.com).");
          { const bad = API.checkPassword(d.password, AU.email); if (bad) throw new Error(bad); }
          if (d.password !== d.password2) throw new Error("Passwords do not match.");
          if (!d.agree) throw new Error("Please tick the consent box.");
          busy(true); const r = await API.signUpStart({ email: AU.email, password: d.password, name: d.name.trim() });
          AU.demoCode = r.demoCode; AU.cool = Date.now() + 30000; d.password = d.password2 = ""; render("verify");
        } else {
          busy(true); const u = await API.signIn(AU.email, d.password);
          if (AU.staff && u.role === "tourist") { await API.signOut(); throw new Error("This account is not a staff account."); }
          afterLogin(u);
        }
      } else if (f.id === "otpf") {
        const code = qsa("[data-otp]", f).map(i => i.value).join("");
        if (code.length !== 6) throw new Error("Enter all 6 digits.");
        busy(true);
        if (f.dataset.mode === "verify") afterLogin(await API.verifyOtp(AU.email, code));
        else { const bad = API.checkPassword(d.password || "", AU.email); if (bad) throw new Error(bad); await API.resetPassword(AU.email, code, d.password); toast("Password changed. Please log in."); render("login"); }
      } else if (f.id === "forgotf") {
        AU.email = d.email.trim(); busy(true); const r = await API.resetPasswordStart(AU.email); AU.demoCode = r.demoCode; AU.cool = Date.now() + 30000; render("reset");
      }
    } catch (e) {
      busy(false);
      if (e.code === "UNVERIFIED") { AU.demoCode = e.demoCode; AU.cool = Date.now() + 30000; render("verify"); toast(e.message); return; }
      err.textContent = e.message;
    }
  }
  const go = h => { if (location.hash.slice(1) === h) route(); else location.hash = h; };
  function render(mode) { openAuth(mode); }

  /* =====================================================================
     NAVIGATION, ROUTER
     ===================================================================== */
  const NAV = [["home", "Home"], { g: "Explore", items: [["explore", "Tourist spots"], ["todo", "Things to do"], ["heritage", "Heritage"]] }, ["stay", "Stay & Eat"], ["guide", "Visitor Guide"], ["maps", "Maps"], ["news", "News"], ["officials", "Officials"], { g: "More", items: [["calendar", "Calendar"], ["about", "About"], ["contact", "Contact"]] }];
  function buildNav() {
    qs("#links").innerHTML = NAV.map(n => Array.isArray(n) ? `<li><a href="#${n[0]}" data-k="${n[0]}">${n[1]}</a></li>` : `<li><button class="grp" aria-haspopup="true" data-g="${n.items.map(i => i[0]).join(" ")}">${n.g} ▾</button><ul class="sub">${n.items.map(([k, l]) => `<li><a href="#${k}" data-k="${k}">${l}</a></li>`).join("")}</ul></li>`).join("");
    qs("#mlinks").innerHTML = NAV.map(n => Array.isArray(n) ? `<li><a href="#${n[0]}" data-k="${n[0]}">${n[1]}</a></li>` : `<li class="mh-l">${n.g}</li>${n.items.map(([k, l]) => `<li><a href="#${k}" data-k="${k}">${l}</a></li>`).join("")}`).join("");
    qsa("[data-logo]").forEach(e => e.innerHTML = logo());
  }
  function buildAcct() {
    const u = API.user(), a = qs("#acct");
    a.innerHTML = u ? `<button class="acct-b" data-acct aria-expanded="false"><span class="av">${hx(initials(u.name))}</span><span class="brand-t">${hx(u.name.split(" ")[0])}</span></button>` : `<button class="acct-b login" data-auth="login" data-here>Log in</button>`;
  }
  function acctMenu() {
    const u = API.user(); let m = qs(".acct-menu"); if (m) return m.remove();
    m = document.createElement("div"); m.className = "acct-menu";
    m.innerHTML = `<div class="who"><b style="color:var(--deep)">${hx(u.name)}</b><br>${hx(u.email)}<br><span class="tag" style="margin-top:4px">${hx(u.role)}</span></div><a href="#account">My account</a>${u.role !== "tourist" ? `<a href="#admin">Dashboard</a>` : ""}<button data-logout>Log out</button>`;
    qs(".pill").appendChild(m);
  }

  let current = "", post = null;
  let raf = 0;
  function motion() {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
    qsa(".pop").forEach(el => RM ? el.classList.add("in") : io.observe(el));
    const tl = qs("#tl"), fill = qs("#fill"), dots = qsa(".tli .dot"), snaps = qsa("[data-par]"), hbg = qs("[data-hbg]"), top = qs("#totop");
    const upd = () => {
      raf = 0; const y = window.scrollY, vh = window.innerHeight;
      if (hbg && !RM) hbg.style.transform = `translateY(${y * .25}px) scale(1.05)`;
      if (!RM) snaps.forEach(s => { const r = s.getBoundingClientRect(); s.style.setProperty("--py", ((r.top + r.height / 2 - vh / 2) * -.07).toFixed(1) + "px"); });
      if (tl && fill) { const r = tl.getBoundingClientRect(), mark = vh * .6, p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
        fill.style.transform = `scaleY(${RM ? 1 : p})`; dots.forEach(d => d.classList.toggle("lit", d.getBoundingClientRect().top < mark)); }
      if (top) top.classList.toggle("show", y > vh * 1.2);
    };
    window.onscroll = window.onresize = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
  }
  function showLanding() {
    if (modal.classList.contains("open")) closeModal();
    document.body.classList.add("gate"); qs("#app").innerHTML = landing(); document.title = "DiscoverLubok · " + S().quote; window.scrollTo(0, 0);
    motion(); paintCount(); counters();
    const nav = qs("#lnav"), io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) qsa("[data-lgo]", nav).forEach(a => a.toggleAttribute("aria-current", a.dataset.lgo === e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
    ["ltop", "ldest", "labout", "lcontact"].forEach(id => { const el = qs("#" + id); if (el) io.observe(el); });
  }
  function route() {
    const [k0, sub] = (location.hash.slice(1) || "home").split("/"), k = k0 || "home";
    const app = qs("#app"), u = API.user();
    document.body.classList.remove("dash", "gate"); qs(".acct-menu") && qs(".acct-menu").remove();
    toggleDrawer(false); qs("#mlinks").classList.remove("open"); qs("#burger").setAttribute("aria-expanded", "false");

    // Staff dashboard
    if (k === "admin") {
      if (!u || u.role === "tourist") { AU.staff = true; AU.back = "admin"; showLanding(); openAuth("login"); return; }
      document.body.classList.add("dash"); window.LobocAdmin.render(app, sub); document.title = "Dashboard · DiscoverLubok"; window.scrollTo(0, 0); return;
    }
    // Open browsing: anyone can view every page. The welcome (landing) page greets
    // first-time visitors; an account is needed only to rate, review or message.
    if (k === "welcome" || (!u && !location.hash.slice(1))) {
      if (u && k === "welcome") { location.hash = "home"; return; }
      AU.staff = false; showLanding(); if (sub === "signup" || sub === "login") openAuth(sub); else if (AU.mode === "verify" && AU.email) openAuth("verify"); return;
    }
    const fn = P[k] || P.notfound;
    post = null; DM.el = null; app.innerHTML = fn(sub); current = k;
    qsa("[data-k]").forEach(a => a.dataset.k === k ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
    qsa("button.grp").forEach(b => b.classList.toggle("cur", b.dataset.g.split(" ").includes(k)));
    document.title = (k === "home" ? "DiscoverLubok · " + S().quote : (qs(`[data-k="${k}"]`) ? qs(`[data-k="${k}"]`).textContent + " · " : "") + "DiscoverLubok");
    if (!(k === "guide" && sub)) window.scrollTo(0, 0);
    buildAcct(); renderDrawer(); motion(); paintCount(); if (post) post();
  }
  function refreshSoft() { const y = scrollY; const [k, sub] = (location.hash.slice(1) || "home").split("/"); if (P[k] && !document.body.classList.contains("dash")) { post = null; DM.el = null; qs("#app").innerHTML = P[k](sub); motion(); paintCount(); window.scrollTo(0, y); if (post) post(); } }
  let vcount = 0; const paintCount = () => { const e = qs("#vc"); if (e) e.textContent = vcount.toLocaleString("en-PH"); };

  /* =====================================================================
     EVENTS
     ===================================================================== */
  document.addEventListener("click", async e => {
    const t = e.target, c = s => t.closest(s); let x;
    if (t === modal || c("[data-close]")) { if (c("#newsDrawer")) return toggleDrawer(false); return closeModal(); }
    if (!c(".acct-menu") && !c("[data-acct]") && qs(".acct-menu")) qs(".acct-menu").remove();
    if (t.id === "scrim" || c("[data-news-open]") || c("#newsBtn")) return toggleDrawer(!qs("#newsDrawer").classList.contains("open") && t.id !== "scrim");
    if (c("#newsDrawer a")) toggleDrawer(false);
    if (c("#burger")) { const o = qs("#mlinks").classList.toggle("open"); qs("#burger").setAttribute("aria-expanded", o); return; }
    if ((x = c("button.grp"))) { const s = x.nextElementSibling; qsa(".sub.open").forEach(o => o !== s && o.classList.remove("open")); s.classList.toggle("open"); return; }
    if (!c(".links")) qsa(".sub.open").forEach(o => o.classList.remove("open"));
    if (c("[data-acct]")) return acctMenu();
    if (c("[data-logout]")) { await API.signOut(); AU.back = ""; toast("Logged out"); if (/^account/.test(location.hash.slice(1))) go("home"); else route(); return; }
    if ((x = c("[data-auth]"))) { AU.staff = false; if (x.dataset.to) { go(x.dataset.to); return; } AU.back = x.hasAttribute("data-here") ? location.hash.slice(1) : ""; openAuth(x.dataset.auth); return; }
    if (c("[data-video]")) return openVideo();
    if (c("[data-lmenu]")) { const o = qs("#llinks").classList.toggle("open"); qs("[data-lmenu]").setAttribute("aria-expanded", o); return; }
    if ((x = c("[data-lgo]"))) { e.preventDefault(); const t = qs("#" + x.dataset.lgo); if (t) window.scrollTo({ top: x.dataset.lgo === "ltop" ? 0 : t.getBoundingClientRect().top + scrollY - 70, behavior: RM ? "auto" : "smooth" }); const m = qs("#llinks"); if (m) m.classList.remove("open"); return; }
    if ((x = c("[data-amode]"))) { render(x.dataset.amode); return; }
    if ((x = c("[data-pw]"))) { const i = x.previousElementSibling; i.type = i.type === "password" ? "text" : "password"; x.textContent = i.type === "password" ? "Show" : "Hide"; return; }
    if (c("[data-resend]")) { try { const r = await API.sendOtp(AU.email.trim().toLowerCase()); AU.demoCode = r.demoCode; AU.cool = Date.now() + 30000; render(AU.mode); toast("New code sent"); } catch (er) { toast(er.message); } return; }
    if ((x = c("[data-tab]"))) { const [k, v] = x.dataset.tab.split("|"); ST[k] = v; if (k === "news") ST.npage = 1; if (["todo", "maps", "about"].includes(k)) history.replaceState(null, "", "#" + k + "/" + v); refreshSoft(); return; }
    if ((x = c("[data-stype]"))) { ST.stype = x.dataset.stype; refreshSoft(); return; }
    if ((x = c("[data-npage]"))) { ST.npage = +x.dataset.npage; refreshSoft(); window.scrollTo(0, 300); return; }
    if ((x = c("[data-mo]"))) { ST.cm += +x.dataset.mo; if (ST.cm < 0) { ST.cm = 11; ST.cy--; } if (ST.cm > 11) { ST.cm = 0; ST.cy++; } refreshSoft(); return; }
    if ((x = c("[data-ev]"))) return openEvent(x.dataset.ev);
    if ((x = c("[data-dz]"))) return dmZoom(x.dataset.dz);
    if (DM.moved && c("[data-dmap]")) { DM.moved = false; return; }
    // Click a barangay to zoom in; click the same barangay again to zoom back out to the whole map
    if ((x = c("[data-bn]"))) return selectB(x.dataset.bn === ST.mapB ? "" : x.dataset.bn, x.hasAttribute("data-bscroll"));
    if ((x = c("[data-tlv]"))) { const t = API.get("timeline", x.dataset.tlv); return viewer(t.year + " · " + t.title, t.photos || [], 0); }
    if (c("#totop")) { window.scrollTo({ top: 0, behavior: RM ? "auto" : "smooth" }); return; }
    if ((x = c("[data-loc]"))) return showLoc(x.dataset.loc);
    if ((x = c("[data-mapto]"))) { ST.mapB = x.dataset.mapto; ST.maps = "brgy"; }
    if ((x = c("[data-offb]"))) { ST.off = "barangay"; ST.offq = x.dataset.offb; }
    if ((x = c("[data-route]"))) { ST.route = +x.dataset.route; refreshSoft(); return; }
    if ((x = c("[data-album]"))) { const g = API.get("gallery", x.dataset.album); return viewer(g.title, g.photos || [], 0); }
    if ((x = c("[data-copy]"))) { try { await navigator.clipboard.writeText(x.dataset.copy); toast("Number copied: " + x.dataset.copy); } catch (er) { toast(x.dataset.copy); } return; }
    if ((x = c("[data-scroll]"))) { const t = qs("#" + x.dataset.scroll); if (t) t.scrollIntoView({ behavior: RM ? "auto" : "smooth" }); return; }
    if ((x = c("[data-rv]"))) { rvSort = "new"; return openReviews(x.dataset.rv, x.dataset.rvn); }
    if ((x = c("[data-rvsort]"))) { const f = qs("#rvf"); rvSort = x.dataset.rvsort; return openReviews(f.dataset.id, f.dataset.name); }
    if ((x = c("[data-star]"))) { const f = x.closest("form"), v = +x.dataset.star; f.elements.rating.value = v; qsa("[data-star]", f).forEach(b => { b.classList.toggle("on", +b.dataset.star <= v); b.setAttribute("aria-checked", +b.dataset.star === v); }); qs("#starLbl").textContent = STAR_L[v]; return; }
    if ((x = c("[data-visit]"))) { const f = x.closest("form"), on = x.getAttribute("aria-pressed") !== "true"; qsa("[data-visit]", f).forEach(b => b.setAttribute("aria-pressed", "false")); x.setAttribute("aria-pressed", on); f.elements.visit.value = on ? x.dataset.visit : ""; return; }
    if ((x = c("[data-tour]"))) { e.preventDefault(); return openTour(x.dataset.tour); }
    if (c("[data-vtx]")) return closeTour();
    if (c("[data-vtfs]")) return vtFull();
    if ((x = c("[data-vts]"))) return vtGo(x.dataset.vts);
    if ((x = c("[data-vtstep]"))) { if (VT) { const i = VT.t.scenes.findIndex(s => s.id === VT.cur), n = VT.t.scenes[i + +x.dataset.vtstep]; if (n) vtGo(n.id); } return; }
    if ((x = c("[data-view]"))) { const id = x.dataset.view, r = ["highlights","places","activities","listings"].map(col => API.get(col, id)).find(Boolean); return viewer(r ? (r.title || r.name) : "Photos", r ? r.photos : [], +x.dataset.vi || 0); }
    if ((x = c("[data-vth]"))) return viewer(pv.title, pv.photos[0] ? pv.photos : [], +x.dataset.vth);
    if ((x = c("[data-share]"))) { const d = { title: x.dataset.share, url: location.href }; if (navigator.share) navigator.share(d).catch(() => {}); else { try { await navigator.clipboard.writeText(location.href); toast("Link copied"); } catch (er) { toast(location.href); } } return; }
    if (c("[data-hymn]")) return toggleHymn();
  });
  document.addEventListener("submit", async e => {
    const f = e.target; if (!f.id) return; e.preventDefault();
    if (["authf", "otpf", "forgotf"].includes(f.id)) return authSubmit(f);
    if (f.id === "rvf") return submitReview(f);
    if (f.id === "cf") { const err = qs("#cferr"), body = f.elements.body.value.trim(); if (body.length < 10) return err.textContent = "Please write a little more (10+ characters).";
      try { await API.sendMessage({ subject: f.elements.subject.value, body }); f.reset(); qs("#cfc").textContent = 0; err.textContent = ""; qs("#cfok").innerHTML = `<div class="ok-box">Message sent! The reply will go to your Gmail and to <a href="#account">My account</a>.</div>`; } catch (er) { err.textContent = er.message; } return; }
  });
  document.addEventListener("input", e => {
    const t = e.target;
    if (t.dataset.q) { ST[t.dataset.q] = t.value; const pos = t.selectionStart; refreshSoft(); const n = qs(`[data-q="${t.dataset.q}"]`); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
    if (t.name === "text" && t.closest("#rvf")) qs("#rvc").textContent = t.value.length;
    if (t.name === "body" && t.closest("#cf")) qs("#cfc").textContent = t.value.length;
    if (t.name === "password" && t.closest("#authf[data-mode=signup]")) { const s = pwScore(t.value), m = qs("#pwm"); m.style.width = s * 20 + "%"; m.style.background = s < 3 ? "#C2412D" : s < 4 ? "#F2B630" : "#4E8F2A"; const em = (qs("#authf [name=email]") || {}).value || ""; qs("#pwh").textContent = API.checkPassword(t.value, em) || ["Too short", "Weak", "Weak", "Okay", "Strong", "Very strong"][s]; }
    if (t.dataset.otp != null) { t.value = t.value.replace(/\D/g, "").slice(-1); if (t.value && t.nextElementSibling) t.nextElementSibling.focus(); }
  });
  document.addEventListener("paste", e => { const t = e.target; if (t.dataset && t.dataset.otp != null) { e.preventDefault(); const d = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6); qsa("[data-otp]").forEach((i, k) => i.value = d[k] || ""); } });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { if (VT) { if (!document.fullscreenElement) closeTour(); return; } if (modal.classList.contains("open")) closeModal(); else toggleDrawer(false); }
    if (VT && e.key === "Tab") { const f = qsa("button:not([disabled])", VT.el).filter(b => b.offsetParent); if (f.length) { const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } }
    if ((e.key === "Enter" || e.key === " ") && e.target.dataset && e.target.dataset.bn) { e.preventDefault(); selectB(e.target.dataset.bn); }
    if (e.key === "Backspace" && e.target.dataset && e.target.dataset.otp != null && !e.target.value && e.target.previousElementSibling) e.target.previousElementSibling.focus();
    if (e.key === "Tab" && modal.classList.contains("open")) { const f = qsa("button, a[href], input:not([type=hidden]), select, textarea", mb).filter(x => !x.disabled && x.offsetParent); if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.hasAttribute("data-ssort")) { ST.ssort = t.value; refreshSoft(); }
    if (t.dataset.sel) { ST[t.dataset.sel] = t.value; refreshSoft(); }
    if (t.hasAttribute("data-mapb")) selectB(t.value);
    if (t.dataset.layer) { const k = t.dataset.layer; ST.layers[k] = t.checked;
      const box = qs(".loclist"), pins = DM.el && qs("svg .pins", DM.el); if (box) { const tmp = document.createElement("div"); tmp.innerHTML = P.maps("loc"); post = dmInit; const nb = qs(".loclist", tmp), np = qs("svg .pins", tmp); if (nb) box.innerHTML = nb.innerHTML; if (pins && np) { pins.innerHTML = np.innerHTML; dmSet(DM.vb); } } }
  });

  /* ---------- hymn ---------- */
  const audio = qs("#hymnAudio");
  function toggleHymn() {
    const h = qs("#hymn"), b = qs("#hymnBtn");
    if (!audio.src) audio.src = C.HYMN_SRC;
    if (audio.paused) audio.play().then(() => { h.classList.add("on"); b.setAttribute("aria-pressed", "true"); b.setAttribute("aria-label", "Pause the Loboc Hymn"); }).catch(() => toast("Add the hymn file at " + C.HYMN_SRC + " to play it."));
    else { audio.pause(); h.classList.remove("on"); b.setAttribute("aria-pressed", "false"); b.setAttribute("aria-label", "Play the Loboc Hymn"); }
  }
  qs("#hymnBtn").addEventListener("click", toggleHymn);
  audio.addEventListener("error", () => { qs("#hymn").classList.remove("on"); });

  /* ---------- start ---------- */
  window.LB = { qs, qsa, hx, toast, openModal, closeModal, mhead, ph, logo, stars, fmtDate, fmtWhen, initials, today, TY, MO, LODGE, TODO_CATS, route, refreshNav: () => { buildNav(); buildAcct(); } };
  (async () => {
    try { await API.init(); }
    catch (e) { qs("#app").innerHTML = `<div style="padding:120px 24px;text-align:center"><h1>Site is being set up</h1><p>${hx(e.message)}</p></div>`; console.error(e); return; }
    buildNav(); buildAcct();
    API.onAuth(u => { buildAcct(); if (!u && !document.body.classList.contains("gate")) { toast("Your session ended. Please log in again."); route(); } });
    API.onVisitors(n => { vcount = n; paintCount(); });
    API.hitVisitor();
    window.addEventListener("hashchange", () => closeTour(true));
    window.addEventListener("hashchange", route); route();
  })();
})();
