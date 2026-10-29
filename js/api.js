/* =====================================================================
   DATA LAYER  (backend-ready, with security checks built in)
   ---------------------------------------------------------------------
   The website never touches storage directly. Every read and write goes
   through window.API below, and every write is checked here:
     • who is allowed to do it (Admin / PIO / Tourist / guest)
     • that the input is the right type and length
     • that links and image addresses are safe
     • rate limits against spam and password guessing
   The same rules are enforced again on the server in backend/schema.sql
   once the site is live. See SECURITY.md.

   Right now API uses the DEMO adapter (saves to this browser only).
   IMPORTANT: demo mode is for previewing. Anything stored in a browser
   can be edited by whoever uses that browser, so demo mode must never be
   used as the live site. Going live = Supabase adapter + schema.sql.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.LOBOC_CONFIG, SEED = window.LOBOC_SEED;
  const NS = "loboc:v2:";
  const COLLECTIONS = ["highlights","places","activities","listings","guides","hotlines","transport","access","events","news","officials","brgys","faqs","gallery","timeline"];

  /* ---------- security settings ---------- */
  const SEC = {
    WRITE: { admin: COLLECTIONS, pio: ["news", "events"] },   // who may change which section
    STAFF_SESSION_MS: 8 * 3600e3,      // Admin/PIO must log in again after 8 hours
    STAFF_IDLE_MS: 30 * 60e3,          // ...or after 30 minutes without activity
    TOURIST_SESSION_MS: 30 * 864e5,    // tourists stay logged in up to 30 days
    MAX_FAILS: 5, LOCK_MS: 5 * 60e3,   // 5 wrong passwords → locked for 5 minutes (doubles each time)
    OTP_TTL_MS: 10 * 60e3, OTP_TRIES: 5, OTP_COOLDOWN_MS: 30e3, OTP_PER_HOUR: 5,
    PBKDF2_ITER: 210000,               // password hashing strength (OWASP 2023 guidance for PBKDF2-SHA256)
    REVIEWS_PER_HOUR: 10, MESSAGES_PER_HOUR: 5
  };
  const COMMON_PW = ["password","password1","password123","12345678","123456789","1234567890","qwerty123","qwertyuiop","iloveyou","1q2w3e4r","abc12345","11111111","00000000","passw0rd","admin123","welcome1","loboc123","bohol123","loboc2026","bohol2026","letmein1","sunshine1","princess1","football1","monkey123"];

  /* ---------- small helpers ---------- */
  const rand = n => crypto.getRandomValues(new Uint8Array(n));
  const b64 = u8 => btoa(String.fromCharCode(...u8));
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const uid = (p = "id") => p + "-" + [...rand(8)].map(b => b.toString(36).padStart(2, "0")).join("").slice(0, 12);
  const now = () => new Date().toISOString();
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(NS + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) {
      try { localStorage.setItem(NS + k, JSON.stringify(v)); return true; }
      catch (e) { const err = new Error("Browser storage is full. Remove some photos (demo mode keeps photos in the browser)."); err.code = "QUOTA"; throw err; }
    },
    del(k) { try { localStorage.removeItem(NS + k); } catch (e) {} }
  };
  const listeners = { auth: [], visitors: [], data: [] };
  const emit = (k, v) => listeners[k].forEach(f => { try { f(v); } catch (e) { console.error(e); } });
  const deny = () => { const e = new Error("You don't have permission to do that."); e.code = "FORBIDDEN"; throw e; };
  const fail = m => { throw new Error(m); };

  /* text: remove control characters and invisible direction tricks, trim, cap length */
  const clean = (v, max = 300) => String(v == null ? "" : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‪-‮⁦-⁩]/g, "").trim().slice(0, max);
  /* links: only http(s). Blocks javascript:, data:, vbscript: and similar */
  const safeUrl = u => { u = clean(u, 500); return /^https?:\/\/[^\s<>"']+$/i.test(u) ? u : ""; };
  /* images: only real image data, https, or a plain relative file path */
  const safeImg = u => { u = String(u || "").trim();
    if (/^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(u)) return u.length < 3e6 ? u : "";
    if (/^https:\/\/[^\s<>"']+$/i.test(u)) return u.slice(0, 1000);
    if (/^[\w\-./]+\.(png|jpe?g|webp|gif|svg)$/i.test(u) && !u.includes("..") && !u.startsWith("/")) return u;
    return ""; };
  const emailOk = e => /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[a-z]{2,}$/i.test(e) && e.length <= 254;
  const ctEqual = (a, b) => { a = String(a); b = String(b); let d = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return d === 0; };

  /* ---------- passwords: salted PBKDF2-SHA256, never stored in plain text ---------- */
  async function pbkdf2(password, salt, iter) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    return new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter }, key, 256));
  }
  async function hashPw(password) { const salt = rand(16); return `pbkdf2$${SEC.PBKDF2_ITER}$${b64(salt)}$${b64(await pbkdf2(password, salt, SEC.PBKDF2_ITER))}`; }
  async function verifyPw(stored, password) {
    const [kind, iter, salt, hash] = String(stored || "").split("$");
    if (kind !== "pbkdf2") return false;
    return ctEqual(b64(await pbkdf2(password, unb64(salt), +iter)), hash);
  }
  /* password rules (same rules shown on the sign-up form) */
  function checkPassword(pw, email = "") {
    pw = String(pw || "");
    if (pw.length < 8) return "Use at least 8 characters.";
    if (pw.length > 128) return "Use 128 characters or fewer.";
    if (!/[a-z]/i.test(pw) || !/\d/.test(pw)) return "Use both letters and numbers.";
    if (COMMON_PW.includes(pw.toLowerCase())) return "That password is too common. Choose another.";
    const local = String(email).split("@")[0].toLowerCase();
    if (local.length >= 4 && pw.toLowerCase().includes(local)) return "Don't use your email name in the password.";
    return "";
  }
  const nameOk = n => n.length >= 2 && n.length <= 60 && !/[<>{}\[\]\\/=@$%^*_|~`]/.test(n);

  /* ---------- rate limits (per browser in demo; per server in live mode) ---------- */
  function rateOk(key, max, perMs) {
    const t = Date.now(), a = (ls.get("rate:" + key, []) || []).filter(x => t - x < perMs);
    if (a.length >= max) return false; a.push(t); ls.set("rate:" + key, a); return true;
  }

  /* ---------- record clean-up before saving any content ---------- */
  const LONG = new Set(["body", "story", "text", "desc", "a", "guide", "summary", "note", "welcomeText", "hymnLyrics", "safety", "aboutText", "landSub", "landHeadline"]);
  const NUM = new Set(["priceFrom", "order", "pop"]);
  const BOOL = new Set(["pub", "pinned", "accredited", "movable", "anchor"]);
  const DATE = new Set(["date", "expires"]);
  function validGeo(g) {
    if (!g || g.type !== "Feature" || !g.geometry || !/^(Multi)?Polygon$/.test(g.geometry.type)) return null;
    const flat = JSON.stringify(g.geometry.coordinates); if (flat.length > 400000 || /[^\d.,\-\[\]e]/i.test(flat)) return null;
    return { type: "Feature", properties: { name: clean(g.properties && g.properties.name, 80) }, geometry: { type: g.geometry.type, coordinates: JSON.parse(flat) } };
  }
  function sanitize(col, rec) {
    const out = { id: /^[\w-]{1,60}$/.test(rec.id || "") ? rec.id : uid(col.slice(0, 2)) };
    const maxPhotos = col === "timeline" ? 4 : (C.MAX_PHOTOS_PER_ITEM || 6);
    for (const [k, v] of Object.entries(rec)) {
      if (k === "id" || k === "updated") continue;
      if (k === "photos") { out.photos = (Array.isArray(v) ? v : []).map(safeImg).filter(Boolean).slice(0, maxPhotos); continue; }
      if (k === "cover") { out.cover = safeImg(v); continue; }
      if (k === "fb") { out.fb = safeUrl(v); continue; }
      if (k === "facts") { out.facts = (Array.isArray(v) ? v : []).slice(0, 12).map(f => [clean(f && f[0], 40), clean(f && f[1], 120)]); continue; }
      if (k === "boundary") { out.boundary = col === "brgys" ? validGeo(v) : null; continue; }
      if (NUM.has(k)) { const n = Number(v); out[k] = Number.isFinite(n) && n >= 0 ? Math.min(n, 1e9) : 0; continue; }
      if (BOOL.has(k)) { out[k] = v === true; continue; }
      if (DATE.has(k)) { out[k] = /^\d{4}-\d{2}-\d{2}$/.test(v || "") ? v : ""; continue; }
      if (k === "time") { out.time = /^\d{2}:\d{2}$/.test(v || "") ? v : ""; continue; }
      if (k === "email") { const e = clean(v, 254).toLowerCase(); out.email = e && emailOk(e) ? e : ""; continue; }
      if (typeof v === "string") { out[k] = clean(v, LONG.has(k) ? 6000 : 300); continue; }
      // anything else (unexpected objects, functions, numbers in text fields) is dropped
    }
    return out;
  }

  /* ---------- image compression (used in every mode) ----------
     Resizes and re-encodes every photo. Besides saving space, re-encoding
     removes hidden data such as GPS location in phone photos and anything
     smuggled inside the file. */
  async function compressImage(file, maxW = C.IMAGE_MAX_WIDTH, q = C.IMAGE_QUALITY) {
    if (!file || !/^image\/(jpeg|png|webp|gif|heic|heif)$/i.test(file.type)) throw new Error("Please choose a JPG, PNG or WebP photo.");
    if (file.size > C.IMAGE_MAX_INPUT_MB * 1048576) throw new Error(`That photo is over ${C.IMAGE_MAX_INPUT_MB} MB.`);
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("Could not read that image.")); i.src = url; });
      if (img.naturalWidth * img.naturalHeight > 60e6) throw new Error("That image is too large in pixels.");
      const scale = Math.min(1, maxW / img.naturalWidth);
      const w = Math.max(1, Math.round(img.naturalWidth * scale)), h = Math.max(1, Math.round(img.naturalHeight * scale));
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
      cv.getContext("2d").drawImage(img, 0, 0, w, h);
      const blob = await new Promise(r => cv.toBlob(b => r(b), "image/webp", q));
      const out = blob && blob.type === "image/webp" ? blob : await new Promise(r => cv.toBlob(r, "image/jpeg", q));
      return { blob: out, width: w, height: h, before: file.size, after: out.size };
    } finally { URL.revokeObjectURL(url); }
  }
  const blobToDataURL = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });

  /* =====================================================================
     DEMO ADAPTER  (no server; this browser only; for preview)
     ===================================================================== */
  const Demo = {
    mode: "demo",
    cache: {},
    async init() {
      COLLECTIONS.forEach(c => { this.cache[c] = ls.get(c, null) || JSON.parse(JSON.stringify(SEED[c] || [])); });
      this.cache.settings = Object.assign({}, SEED.settings, ls.get("settings", {}));
      // Preview mode: when the starting content changes (SEED.dataVersion goes up), browsers
      // that still hold older sample content load the new content. Accounts, reviews,
      // messages and the visitor count are kept.
      const dv = SEED.dataVersion || 1;
      if (ls.get("dataVersion", 1) < dv) {
        COLLECTIONS.forEach(c => { this.cache[c] = JSON.parse(JSON.stringify(SEED[c] || [])); ls.set(c, this.cache[c]); });
        this.cache.settings = Object.assign({}, SEED.settings); ls.set("settings", {});
        ls.set("dataVersion", dv);
      }
      this.cache.reviews = ls.get("reviews", []);
      this.cache.messages = ls.get("messages", []);
      let users = ls.get("users", null);
      // older preview data used a weak password hash: start the accounts fresh
      if (users && users.some(u => !String(u.pw).startsWith("pbkdf2$"))) users = null;
      if (!users) {
        users = [];
        for (const s of C.DEMO_STAFF || []) users.push({ id: uid("u"), email: s.email.toLowerCase(), name: s.name, role: s.role, verified: true, pw: await hashPw(s.password), created: now() });
        ls.set("users", users); ls.del("session");
      }
      // add any preview account that's missing (e.g. one added to config.js later)
      for (const s of C.DEMO_STAFF || []) if (!users.some(u => u.email === s.email.toLowerCase())) { users.push({ id: uid("u"), email: s.email.toLowerCase(), name: s.name, role: s.role, verified: true, pw: await hashPw(s.password), created: now() }); ls.set("users", users); }
      this.cache.users = users;
      // staff idle timer: any click or key press counts as activity
      const touch = () => this._touch(); ["pointerdown", "keydown"].forEach(ev => document.addEventListener(ev, touch, { passive: true }));
      setInterval(() => { if (ls.get("session", null) && !this.user()) emit("auth", null); }, 60e3);
      // other tabs: keep the visitor counter and data in sync (simulates realtime)
      window.addEventListener("storage", e => {
        if (!e.key || !e.key.startsWith(NS)) return;
        const k = e.key.slice(NS.length);
        if (k === "visitors") emit("visitors", ls.get("visitors", 0));
        else if (k === "session") emit("auth", this.user());
        else if (COLLECTIONS.includes(k) || ["settings", "reviews", "messages", "users"].includes(k)) { this.cache[k] = k === "settings" ? Object.assign({}, SEED.settings, ls.get(k, {})) : ls.get(k, []); emit("data", k); }
      });
    },

    /* ----- who is logged in, and what may they do ----- */
    role() { const u = this.user(); return u ? u.role : "guest"; },
    canWrite(col) { return (SEC.WRITE[this.role()] || []).includes(col); },
    isAdmin() { return this.role() === "admin"; },
    isStaff() { return ["admin", "pio"].includes(this.role()); },

    /* ----- content collections ----- */
    // Open browsing: everyone may read the tourism content. Writing is still checked by role.
    list(col) { if (!COLLECTIONS.includes(col)) return []; return this.cache[col]; },
    landingStats() {
      const pubN = c => this.cache[c].filter(r => r.pub !== false).length;
      return { destinations: pubN("places") + pubN("highlights"), guides: pubN("guides"), barangays: this.cache.brgys.length, years: new Date().getFullYear() - 1597 };
    },
    get(col, id) { return this.list(col).find(r => r.id === id); },
    async save(col, rec) {
      if (!COLLECTIONS.includes(col)) deny();
      if (!this.canWrite(col)) deny();
      const clean = sanitize(col, rec || {}); clean.updated = now();
      const a = this.cache[col], i = a.findIndex(r => r.id === clean.id), prev = i >= 0 ? a[i] : null;
      i >= 0 ? (a[i] = clean) : a.push(clean);
      try { ls.set(col, a); } catch (e) { if (prev) a[i] = prev; else a.pop(); throw e; }
      if (rec && typeof rec === "object") Object.assign(rec, clean);
      emit("data", col); return clean;
    },
    async remove(col, id) {
      if (!COLLECTIONS.includes(col) || !this.canWrite(col)) deny();
      if (col === "brgys") fail("Barangays can be edited but not deleted.");
      const a = this.cache[col], i = a.findIndex(r => r.id === id);
      if (i >= 0) { await this.files.removeMany(collectPhotos(a[i])); a.splice(i, 1); ls.set(col, a); }
      emit("data", col);
    },
    settings() { return this.cache.settings; },
    async saveSettings(s) {
      if (!this.isAdmin()) deny();
      const out = {}; Object.keys(SEED.settings).forEach(k => { if (k in s) out[k] = clean(s[k], LONG.has(k) ? 6000 : 300); });
      this.cache.settings = Object.assign({}, this.cache.settings, out); ls.set("settings", this.cache.settings); emit("data", "settings");
    },
    async resetDemo() { if (!this.isAdmin()) deny(); Object.keys(localStorage).filter(k => k.startsWith(NS)).forEach(k => localStorage.removeItem(k)); location.reload(); },

    /* ----- photos (staff only) ----- */
    files: {
      async upload(file) {
        if (!Demo.isStaff()) deny();
        const c = await compressImage(file, Math.min(C.IMAGE_MAX_WIDTH, 1200), Math.min(C.IMAGE_QUALITY, .65));
        return { url: await blobToDataURL(c.blob), before: c.before, after: c.after };
      },
      async removeMany(urls) { /* demo: nothing to delete; the photo goes away with the record */ }
    },
    storageUsed() { let n = 0; for (const k of Object.keys(localStorage)) if (k.startsWith(NS)) n += (localStorage.getItem(k) || "").length * 2; return n; },
    storageLimit: 5 * 1048576,

    /* ----- accounts: Gmail + one-time code + password ----- */
    _otp: {},
    _touch() { const s = ls.get("session", null); if (s && Date.now() - (s.seen || 0) > 30e3 && this.user()) { s.seen = Date.now(); ls.set("session", s); } },
    user() {
      const s = ls.get("session", null); if (!s || typeof s !== "object") return null;
      const u = this.cache.users.find(x => x.id === s.id), t = Date.now();
      const staff = u && u.role !== "tourist";
      if (!u || !u.verified || t > s.exp || (staff && t - (s.seen || 0) > SEC.STAFF_IDLE_MS)) { ls.del("session"); return null; }
      return { id: u.id, email: u.email, name: u.name, role: u.role, verified: u.verified, created: u.created };
    },
    _startSession(u) { const t = Date.now(); ls.set("session", { id: u.id, exp: t + (u.role === "tourist" ? SEC.TOURIST_SESSION_MS : SEC.STAFF_SESSION_MS), seen: t }); },
    onAuth(f) { listeners.auth.push(f); },
    checkPassword,
    _locked(email) { const l = (ls.get("locks", {}) || {})[email]; return l && l.until > Date.now() ? Math.ceil((l.until - Date.now()) / 60000) : 0; },
    _failed(email) { const all = ls.get("locks", {}) || {}, l = all[email] || { n: 0, strikes: 0, until: 0 }; l.n++;
      if (l.n >= SEC.MAX_FAILS) { l.strikes++; l.until = Date.now() + SEC.LOCK_MS * Math.pow(2, l.strikes - 1); l.n = 0; } all[email] = l; ls.set("locks", all); },
    _clearFails(email) { const all = ls.get("locks", {}) || {}; delete all[email]; ls.set("locks", all); },
    async signUpStart({ email, password, name }) {
      email = clean(email, 254).toLowerCase(); name = clean(name, 60);
      if (!/^[a-z0-9._%+-]{1,64}@gmail\.com$/.test(email)) fail("Please use a Gmail address (name@gmail.com).");
      if (!nameOk(name)) fail("Please enter your real name (2–60 letters).");
      const bad = checkPassword(password, email); if (bad) fail(bad);
      const ex = this.cache.users.find(u => u.email === email);
      // Same answer whether or not the Gmail is registered, so nobody can test which emails have accounts.
      if (ex && ex.verified) return { demoCode: null, generic: true };
      const pw = await hashPw(password);
      if (ex) Object.assign(ex, { pw, name }); else this.cache.users.push({ id: uid("u"), email, name, role: "tourist", verified: false, pw, created: now() });
      ls.set("users", this.cache.users);
      return this.sendOtp(email);
    },
    async sendOtp(email) {
      email = clean(email, 254).toLowerCase();
      const o = this._otp[email] || { sent: [] }, t = Date.now();
      o.sent = (o.sent || []).filter(x => t - x < 3600e3);
      if (o.sent.length && t - o.sent[o.sent.length - 1] < SEC.OTP_COOLDOWN_MS) fail("Please wait 30 seconds before asking for a new code.");
      if (o.sent.length >= SEC.OTP_PER_HOUR) fail("Too many codes requested. Try again in an hour.");
      const r = new Uint32Array(1); let n; do { crypto.getRandomValues(r); n = r[0]; } while (n >= 4294000000);
      const code = String(n % 1000000).padStart(6, "0");
      o.sent.push(t); this._otp[email] = { code, exp: t + SEC.OTP_TTL_MS, tries: 0, sent: o.sent };
      // LIVE: the code is emailed to the Gmail and never returned to the page. DEMO: returned so the preview can show it.
      return { demoCode: code };
    },
    _useOtp(email, code) {
      const o = this._otp[email];
      if (!o || !o.code || Date.now() > o.exp) fail("This code has expired. Tap Resend code.");
      if (++o.tries > SEC.OTP_TRIES) { o.code = null; fail("Too many wrong tries. Tap Resend code."); }
      if (!/^\d{6}$/.test(String(code)) || !ctEqual(o.code, String(code))) fail("That code is not correct.");
      o.code = null;
    },
    async verifyOtp(email, code) {
      email = clean(email, 254).toLowerCase(); this._useOtp(email, code);
      const u = this.cache.users.find(x => x.email === email); if (!u) fail("That code is not correct.");
      u.verified = true; ls.set("users", this.cache.users); this._startSession(u); const me = this.user(); emit("auth", me); return me;
    },
    async signIn(email, password) {
      email = clean(email, 254).toLowerCase();
      const m = this._locked(email); if (m) fail(`Too many wrong tries. Try again in ${m} minute${m > 1 ? "s" : ""}.`);
      const u = this.cache.users.find(x => x.email === email);
      const ok = u ? await verifyPw(u.pw, String(password || "")) : (await hashPw("x"), false); // similar timing either way
      if (!ok) { this._failed(email); fail("Wrong email or password."); }
      this._clearFails(email);
      if (!u.verified) { let r = { demoCode: null }; try { r = await this.sendOtp(email); } catch (e) {} const e = new Error("Please verify your Gmail first. We sent a code."); e.code = "UNVERIFIED"; e.demoCode = r.demoCode; throw e; }
      this._startSession(u); const me = this.user(); emit("auth", me); return me;
    },
    async resetPasswordStart(email) {
      email = clean(email, 254).toLowerCase(); if (!emailOk(email)) fail("Please enter a valid email.");
      // Always the same answer, whether or not the account exists.
      if (!this.cache.users.find(u => u.email === email)) return { demoCode: null, generic: true };
      return this.sendOtp(email);
    },
    async resetPassword(email, code, password) {
      email = clean(email, 254).toLowerCase(); this._useOtp(email, code);
      const bad = checkPassword(password, email); if (bad) fail(bad);
      const u = this.cache.users.find(x => x.email === email); if (!u) fail("That code is not correct.");
      u.pw = await hashPw(password); u.verified = true; ls.set("users", this.cache.users); this._clearFails(email);
      ls.del("session"); emit("auth", null);
    },
    async signOut() { ls.del("session"); emit("auth", null); },

    /* ----- users & roles (Admin only) ----- */
    users() { return this.isAdmin() ? this.cache.users.map(({ pw, ...u }) => u) : []; },
    _admins() { return this.cache.users.filter(u => u.role === "admin" && u.verified).length; },
    async setRole(id, role) {
      if (!this.isAdmin()) deny(); if (!["tourist", "pio", "admin"].includes(role)) fail("Unknown role.");
      const u = this.cache.users.find(x => x.id === id); if (!u) fail("User not found.");
      if (u.id === this.user().id) fail("You can't change your own role.");
      if (u.role === "admin" && role !== "admin" && this._admins() <= 1) fail("There must always be at least one Admin.");
      u.role = role; ls.set("users", this.cache.users);
    },
    async removeUser(id) {
      if (!this.isAdmin()) deny(); const u = this.cache.users.find(x => x.id === id); if (!u) return;
      if (u.id === this.user().id) fail("You can't remove your own account here.");
      if (u.role === "admin" && this._admins() <= 1) fail("There must always be at least one Admin.");
      this.cache.users = this.cache.users.filter(x => x.id !== id); ls.set("users", this.cache.users);
    },

    /* ----- reviews (name + email required; email visible to Admin only) ----- */
    reviews(target) {
      const a = this.cache.reviews.filter(r => !target || r.target === target);
      return this.isAdmin() ? a : a.filter(r => r.status === "Published").map(({ email, ...r }) => r);
    },
    myReviews() { const u = this.user(); return u ? this.cache.reviews.filter(r => r.userId === u.id).map(({ email, ...r }) => r) : []; },
    _targetName(id) { for (const c of ["highlights", "places", "activities", "listings"]) { const r = this.get(c, id); if (r) return r.title || r.name; } return null; },
    async addReview(r) {
      const u = this.user(); if (!u) fail("Please log in to write a review.");
      const target = clean(r.target, 60), tname = this._targetName(target);
      if (!tname) fail("That place could not be found.");
      const rating = Number(r.rating), name = u.name, email = u.email, text = clean(r.text, 600);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) fail("Please tap a star rating.");
      if (!nameOk(name)) fail("Please enter your name (2–60 letters).");
      if (!emailOk(email)) fail("Please enter a valid email.");
      if (text.length < 10) fail("Please write at least a short sentence (10+ characters).");
      if (/(https?:\/\/|www\.)/i.test(text)) fail("Links are not allowed in reviews.");
      if (this.cache.reviews.some(x => x.target === target && x.email === email && Date.now() - new Date(x.created) < 864e5)) fail("You already reviewed this place today. Thank you!");
      if (!rateOk("review", SEC.REVIEWS_PER_HOUR, 3600e3)) fail("Too many reviews from this device. Please try again later.");
      const visit = ["Solo", "Couple", "Family", "Friends", "Group tour", "Business"].includes(r.visit) ? r.visit : "";
      const rec = { id: uid("rv"), target, targetName: tname, rating, name, email, text, visit, userId: u.id, created: now(), status: "Published" };
      this.cache.reviews.push(rec); ls.set("reviews", this.cache.reviews); emit("data", "reviews"); return rec;
    },
    async setReview(id, patch) {
      if (!this.isAdmin()) deny(); const r = this.cache.reviews.find(x => x.id === id); if (!r) return;
      if (patch && ["Published", "Hidden"].includes(patch.status)) r.status = patch.status;
      ls.set("reviews", this.cache.reviews); emit("data", "reviews");
    },
    async removeReview(id) { if (!this.isAdmin()) deny(); this.cache.reviews = this.cache.reviews.filter(x => x.id !== id); ls.set("reviews", this.cache.reviews); emit("data", "reviews"); },

    /* ----- contact messages (tourist → admin → reply by email) ----- */
    SUBJECTS: ["General inquiry", "Group visit / tour guide request", "Accessibility request", "Feedback", "Report a concern"],
    messages() { return this.isAdmin() ? this.cache.messages : []; },
    myMessages() { const u = this.user(); return u ? this.cache.messages.filter(m => m.userId === u.id) : []; },
    async sendMessage({ subject, body }) {
      const u = this.user(); if (!u) fail("Please log in to send a message.");
      subject = this.SUBJECTS.includes(subject) ? subject : "General inquiry"; body = clean(body, 1500);
      if (body.length < 10) fail("Please write a little more (10+ characters).");
      if (!rateOk("msg:" + u.id, SEC.MESSAGES_PER_HOUR, 3600e3)) fail("You've sent several messages already. Please wait for a reply.");
      // name and email always come from the verified account, never from the form
      const m = { id: uid("msg"), userId: u.id, name: u.name, email: u.email, subject, body, created: now(), status: "New", replies: [] };
      this.cache.messages.unshift(m); ls.set("messages", this.cache.messages); emit("data", "messages"); return m;
    },
    async replyMessage(id, body) {
      if (!this.isAdmin()) deny(); body = clean(body, 3000); if (body.length < 2) fail("Write a reply first.");
      const m = this.cache.messages.find(x => x.id === id), u = this.user(); if (!m) fail("Message not found.");
      m.replies.push({ body, at: now(), by: u.name }); m.status = "Replied";
      ls.set("messages", this.cache.messages); emit("data", "messages");
      return { emailed: false }; // LIVE: the reply-message Edge Function emails it to m.email
    },
    async setMessage(id, patch) {
      if (!this.isAdmin()) deny(); const m = this.cache.messages.find(x => x.id === id); if (!m) return;
      if (patch && ["New", "Read", "Replied", "Archived"].includes(patch.status)) m.status = patch.status;
      ls.set("messages", this.cache.messages); emit("data", "messages");
    },
    async removeMessage(id) { if (!this.isAdmin()) deny(); this.cache.messages = this.cache.messages.filter(x => x.id !== id); ls.set("messages", this.cache.messages); emit("data", "messages"); },

    /* ----- visitor counter ----- */
    async hitVisitor() {
      let n = ls.get("visitors", 0);
      try { if (!sessionStorage.getItem(NS + "counted")) { n += 1; ls.set("visitors", n); sessionStorage.setItem(NS + "counted", "1"); } } catch (e) {}
      emit("visitors", n); return n;
    },
    onVisitors(f) { listeners.visitors.push(f); f(ls.get("visitors", 0)); },
    visitorCount() { return ls.get("visitors", 0); },
    onData(f) { listeners.data.push(f); }
  };

  function collectPhotos(r) { const a = []; if (r && Array.isArray(r.photos)) a.push(...r.photos); if (r && r.cover) a.push(r.cover); return a; }

  /* =====================================================================
     SUPABASE ADAPTER  (fill in when going live; see README, SECURITY.md
     and backend/schema.sql). The server repeats every check above, so the
     rules hold even if someone edits the page's code in their browser.
     Load the client in index.html first (pin the version, add integrity):
       <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js" crossorigin="anonymous"></script>
     Then: const sb = supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);
     NEVER put the service_role key in this file or anywhere in the website.
     ===================================================================== */
  const Supabase = Object.assign(Object.create(Demo), {
    mode: "supabase",
    async init() {
      // TODO: for each collection: const { data } = await sb.from(col).select("id,data"); this.cache[col] = data.map(r => ({ id: r.id, ...r.data }));
      // TODO: settings:  await sb.from("settings").select("data").single()
      // TODO: reviews:   await sb.from("reviews_public").select("*")      ← the view without emails (logged-in users only)
    // TODO: landing page before log in: highlights + settings + sb.rpc("landing_stats") — nothing else is readable without an account
      // TODO: realtime visitor count:
      //   sb.channel("visits").on("postgres_changes",{event:"UPDATE",schema:"public",table:"site_stats"},p=>emit("visitors",p.new.visits)).subscribe();
      throw new Error("Supabase adapter not connected yet. Keep BACKEND: \"demo\" until going live.");
    },
    // save(col, rec)          → sb.from(col).upsert({ id, data: sanitize(col, rec) })   (keep sanitize() on the client too)
    // remove(col, id)         → files.removeMany(photos) then sb.from(col).delete().eq("id", id)
    // files.upload(file)      → const c = await compressImage(file); const path = `${uid("img")}.webp`;
    //                           await sb.storage.from("photos").upload(path, c.blob, { contentType: c.blob.type, upsert: false });
    // files.removeMany(urls)  → sb.storage.from("photos").remove(paths)
    // signUpStart             → sb.auth.signUp({ email, password, options:{ data:{ name } } })
    // verifyOtp               → sb.auth.verifyOtp({ email, token: code, type: "signup" })
    // signIn                  → sb.auth.signInWithPassword({ email, password })
    // resetPasswordStart      → sb.auth.resetPasswordForEmail(email)  ; resetPassword → verifyOtp({type:"recovery"}) + sb.auth.updateUser({ password })
    // user()                  → (await sb.auth.getUser()) + select role from profiles (role is set by the server only)
    // addReview               → sb.from("reviews").insert({ target, rating, name, email, text, visit })   (server fills the rest)
    // sendMessage             → sb.from("messages").insert({ subject, body })   (server fills name/email from the account)
    // replyMessage            → sb.functions.invoke("reply-message", { body: { id, body } })   (function checks the caller is Admin)
    // hitVisitor              → sb.rpc("hit_visit")
  });

  window.API = Object.assign(C.BACKEND === "supabase" ? Supabase : Demo, { uid, compressImage, safeUrl, safeImg, clean });
})();
