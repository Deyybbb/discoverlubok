# DiscoverLubok: Security Review

**Reviewed:** October 8, 2026
**Scope:** the whole website (`index.html`, `js/*`, `css/*`), the go-live database plan (`backend/schema.sql`), and hosting settings.

---

## The most important point

**Preview mode is not secure, and it must never be used as the live site.**

In preview mode everything is saved inside the visitor's own browser. Whoever controls a browser can edit what's stored in it, including user roles. No website code can prevent that. Hiding buttons and checking in the page only stops honest mistakes. They don't stop a determined person.

Real security comes from the **server**. When the site goes live, `backend/schema.sql` makes the database itself check every request (Row Level Security). The checks hold even if someone edits the website's code in their browser. Those rules were run on a real PostgreSQL 16 database and tested as guest, tourist, PIO and Admin. All 45 checks passed (see *Tests* below).

The page still repeats every check, so that preview behaves exactly like the live site. As defense in depth, it also blocks attacks that come through the page itself (scripts, links, forms).

---

## What was found and fixed

| # | Problem found | Risk | What was done |
|---|---|---|---|
| 1 | **Old database plan: the `profiles` table had no Row Level Security.** Any signed-in user could change their own role to `admin`. | Critical | RLS turned on. Only Admin changes roles, nobody changes their own, the last Admin can't be removed, and new sign-ups are always `tourist`. |
| 2 | Permissions were only enforced by **hiding buttons**. | High | Every write is now checked in the data layer (`js/api.js`) **and** in the database. PIO is limited to News & Events. |
| 3 | Passwords were hashed with plain SHA-256 (fast, no salt). | High | Salted **PBKDF2-SHA256, 210,000 rounds**, compared in constant time. Live mode uses Supabase Auth (bcrypt). |
| 4 | No limit on password guessing. | High | 5 wrong tries lock the account for 5 minutes, doubling each time. |
| 5 | One-time codes came from `Math.random()`, could be guessed without limit (including password-reset codes) and resent without limit. | High | Codes come from a crypto-grade random source and work only once. Each code allows 5 tries and expires in 10 minutes. Resending needs a 30-second wait, with at most 5 codes per hour. |
| 6 | Sessions never expired. | Medium | Staff are logged out after **30 minutes idle** or **8 hours**. Tourists stay logged in up to 30 days. |
| 7 | The forgot-password and sign-up forms revealed which emails have accounts. | Medium | Both now give the same answer whether or not the account exists. |
| 8 | A "Facebook link" could hold `javascript:` code that runs when clicked. | High | Links must start with `http(s)://`. Anything else is removed when saved. |
| 9 | Image addresses weren't checked. | Medium | Only real image data, `https://` addresses or plain file paths are accepted. |
| 10 | Map tooltips inserted barangay and place names as HTML. | Medium | Names are escaped first. |
| 11 | Inline `onerror=` handlers made a strict security policy impossible. | Medium | Removed. A **Content Security Policy** now blocks injected scripts, and this was tested with a real injection attempt. |
| 12 | The map library was loaded from a CDN. | Medium | Removed: maps are now drawn locally from bundled boundary data, so no outside map script runs at all. The page only allows its own scripts. |
| 13 | Reviews: the sender could set the status, date or ID. The duplicate check ran only in the page. Emails were visible to page code. | Medium | The server sets those fields. Name, email, length and rating are validated, links are blocked, there's 1 review per place per day and 10 per hour, and the public list never includes emails. |
| 14 | Contact messages: the sender's name and email came from the form, so a reply could be redirected to someone else. | High | Name and email are always taken from the verified account, by a database trigger. A forged sender was tested: the message was recorded under the real sender. |
| 15 | Officials' "office use only" phone numbers were stored with public data. | Medium | They're moved to a separate Admin-only table, and the public table rejects contact numbers. |
| 16 | Drafts, future posts, expired announcements and hidden listings could be read straight from the database. | Medium | Database rules hide them from the public. |
| 17 | Database functions ran with elevated rights but didn't fix their `search_path`. | Medium | `search_path` is fixed, and execute rights are limited. |
| 18 | Photo storage had no size or type limit. | Medium | The bucket allows **2 MB maximum, WebP/JPEG/PNG only**. Only staff can upload or delete. |
| 19 | Phone photos can contain hidden GPS location. | Privacy | Every photo is re-encoded before upload, which strips that data. |
| 20 | Map boundary uploads weren't size-checked or validated. | Low | Files are capped at 5 MB, the shapes are validated, and they're simplified before saving. |
| 21 | Text inputs had no length or character limits. | Low | Lengths are capped. Invisible control and text-direction characters are removed. |
| 22 | No HTTPS or security headers were set for hosting. | Medium | Added `_headers` (Netlify / Cloudflare Pages) and `.htaccess` (Apache): HTTPS only, HSTS, CSP, no framing (clickjacking), nosniff, and Permissions-Policy. |
| 23 | `backend/`, `.md` and `.sql` files would be downloadable from the live site. | Low | `.htaccess` blocks them. Better still, don't upload `backend/` at all. |
| 24 | Guests could post reviews with any email. | Medium | **Open browsing, log in to act.** Anyone may read published content (hidden items, drafts and future or expired news stay hidden). Rating, reviewing, messaging and reporting need an account, and always use its verified name and email. Guests can read published reviews through a view that never includes emails. |
| 25 | Demo staff accounts with known passwords. | Critical if live | They exist only in preview mode. **Delete `DEMO_STAFF` before going live** (see the checklist). |

---

## Risks that remain (what to know)

- **The visitor counter** can be inflated by automated visits. The impact is low, because it's only a number.
- **Sign-up and login bots:** turn on CAPTCHA (hCaptcha or Cloudflare Turnstile) in Supabase Auth when live.
- **Admin accounts** should use two-factor authentication (Supabase supports authenticator apps).
- **The reply-email function** (`reply-message`) isn't written yet. When it is, it must:
  - check that the caller is Admin,
  - read the recipient email from the database (never from the request),
  - keep the email-service key on the server.
- **Third-party services** (Google Fonts, Open-Meteo, YouTube, Google Maps) see visitors' IP addresses. For maximum privacy, the fonts and the map library can be self-hosted.
- **Philippine Data Privacy Act (RA 10173):** the site collects names and emails. Publish a privacy notice and keep the consent checkbox. Decide how long messages and reviews are kept, and check with the LGU's Data Protection Officer about NPC requirements. This is general information, not legal advice.

---

## Go-live security checklist

1. ☐ Set `BACKEND: "supabase"` and fill in the Supabase adapter. **Never** put the `service_role` key in the website; only the `anon` key goes there.
2. ☐ Run `backend/schema.sql`, then make the first Admin in SQL: `update profiles set role='admin' where email='…';`
3. ☐ **Delete `DEMO_STAFF`** from `js/config.js`.
4. ☐ In Supabase Auth:
   - turn on email confirmation and set the OTP expiry to 10 minutes or less,
   - turn on CAPTCHA and leaked-password protection,
   - set the minimum password length to 8 or more,
   - require two-factor authentication for Admin accounts.
5. ☐ Host on **HTTPS only**, and make sure `_headers` or `.htaccess` is active. Check the result at securityheaders.com.
6. ☐ Don't upload the `backend/` folder, `README.md` or `SECURITY.md` to the public web folder.
7. ☐ Write the `reply-message` Edge Function as described above.
8. ☐ Turn on database backups (Point-in-Time Recovery or daily backups).
9. ☐ Publish a privacy notice and name a Data Protection Officer contact.
10. ☐ Review the Users list monthly, and remove staff accounts when people leave their posts.

---

## Tests that were run

- **51 attack tests in the browser**, all passed. They covered:
  - script injection through reviews, names and links,
  - `javascript:` links and bad image addresses,
  - guests, tourists and PIO trying Admin actions,
  - role self-promotion,
  - forged message senders,
  - password guessing (lockout), code guessing, resend limits and email enumeration,
  - password storage format,
  - the staff idle logout,
  - whether the Content Security Policy blocks an injected script.
- **52 database rule tests** on PostgreSQL 16 with the hardened `schema.sql`, all passed. Each was run as guest, tourist, PIO and Admin. Guests read only published content and live news, see no reviewer emails or private contacts, and cannot write anything.
- **Open browsing tests** (PC and phone), all passed. Guests can open every page and the 360° tour. Rating, reviewing, messaging, "My account" and the staff dashboard ask them to log in, and after login they return to the same page. Logging out keeps them on the page they were reading.
- **Regression tests** (sign-up, login, reviews, contact, dashboards, photo upload, maps, landing page, phone layout): no errors.
- **Syntax check:** the SQL was checked with the PostgreSQL parser.
