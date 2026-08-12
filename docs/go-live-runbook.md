# Go-Live Runbook — Digitize me

Consolidated deployment checklist for the work on branch `security/blockers-1-2`
(11 commits). Do the steps **in order** — the database migrations must land before
the new frontend goes live, and several fixes are inert until secrets are set.

- **Supabase project:** `tobhnxzhpfzopjzgyzlq`
- **Production host:** A2 Hosting (Apache/LiteSpeed), domain `www.digitizeme.ae`
- **Frontend:** static SPA build (`dist/`) — Vite + React

> Legend: **[DB]** database, **[SECRET]** env/secret config, **[DEPLOY]** ship files,
> **[VERIFY]** post-step check.

---

## 0. Pre-flight

- [ ] Merge or deploy from `security/blockers-1-2`. Review the 11 commits first.
- [ ] Confirm you can reach: the Supabase dashboard (or `supabase` CLI linked to the
      project), the A2 hosting file manager / SFTP, and DNS if needed.
- [ ] Take a note of the current live state so you can roll back (see §7).
- [ ] `npm ci && npm run build` locally — must succeed. This runs the SEO-lint gate
      and regenerates `dist/` including sitemaps and the `.htaccess`.

---

## 1. [DB] Apply the three new migrations

These are **not yet on the live database**. Two of them fix live problems (a
privilege-escalation hole and a role-check outage), so apply them first.

Files (in `supabase/migrations/`):
1. `20260811150000_…` — drops the `user_roles` self-escalation policy **and** restores
   `EXECUTE` on `has_role`/`has_any_role`/`is_super_admin` to `authenticated`
   (fixes the 401s currently breaking role-gated edge functions).
2. `20260811150500_…` — restricts the raw-HTML `custom_head`/`custom_body` fields to
   super-admin (stored-XSS lockdown).
3. `20260811151000_…` — lead-notification trigger + `pg_net` (enables §4).

**Via Supabase CLI:**
```bash
supabase link --project-ref tobhnxzhpfzopjzgyzlq
supabase db push
```
**Or via Lovable:** sync/push migrations through the Lovable project (matches how the
existing migrations were applied).

- [ ] **[VERIFY]** Log in as a real `admin` → the admin panel loads and the SEO/AI
      edge functions (`generate-industry-page`, `validate-seo`, `ga4-cta-stats`) work
      (no 403/401). This confirms the `EXECUTE` restore took effect.
- [ ] **[VERIFY]** A plain `editor` account can no longer write `custom_head`
      (the field is hidden for them; a direct write is rejected by RLS).
- [ ] **[VERIFY]** An `admin` cannot insert a `super_admin` row into `user_roles`.

---

## 2. [SECRET] Edge-function secrets & DB settings

### 2a. Lead notifications (required to receive leads)
The trigger no-ops until configured. Set the DB settings (out of git so the secret
isn't committed) — pick any strong random string for `<SECRET>`:
```sql
alter database postgres set app.notify_lead_url =
  'https://tobhnxzhpfzopjzgyzlq.functions.supabase.co/notify-lead';
alter database postgres set app.notify_lead_secret = '<SECRET>';
```
Then set the edge-function secrets (Supabase dashboard → Edge Functions → Secrets):
- [ ] `NOTIFY_LEAD_SECRET` = the same `<SECRET>` as above
- [ ] **One** delivery channel:
  - Fastest: `LEAD_WEBHOOK_URL` = a Slack/Teams/Discord/Zapier incoming webhook, **or**
  - Email: `RESEND_API_KEY` + `LEAD_NOTIFY_TO` (comma-separated recipients) +
    `LEAD_NOTIFY_FROM` (a verified Resend sender)
- [ ] Deploy the `notify-lead` function (it's new).

### 2b. Edge-function JWT posture
`supabase/config.toml` now declares `verify_jwt` per function (public
`robots`/`sitemap`/`notify-lead` = false; all authenticated functions = true).
- [ ] Deploy so the config takes effect, or confirm the dashboard matches it.

### 2c. Sentry (optional but recommended)
- [ ] Create a Sentry project, then set **`VITE_SENTRY_DSN`** in the **build**
      environment. If unset, Sentry is fully tree-shaken out (no-op).

> The Supabase anon/publishable key already lives in the committed `.env` — that key
> is public by design. **Never** add a service-role key or other real secret to
> `.env`; those belong only in the Supabase secrets store.

---

## 3. [DEPLOY] Ship the frontend to A2 Hosting

The React app must serve from `www.digitizeme.ae`. (Note: the apex currently serves a
WordPress site — coordinate the cutover.)

- [ ] Build: `npm run build` → produces `dist/`.
- [ ] Upload the **contents of `dist/`** to the web root (e.g. `public_html/`).
- [ ] **Ensure `dist/.htaccess` is uploaded** (dotfiles are easy to miss). It provides
      security headers (CSP/HSTS/X-Frame-Options/…), the SPA rewrite (deep links /
      hard refresh), asset caching, and gzip. Without it, deep links 404 and there are
      no security headers.
- [ ] Confirm `mod_headers`, `mod_rewrite`, and `mod_deflate` are enabled on the plan
      (LiteSpeed supports all three; ask A2 support if headers don't appear).

- [ ] **[VERIFY]** Security headers are present:
      ```bash
      curl -sI https://www.digitizeme.ae/ | grep -iE 'content-security-policy|strict-transport|x-frame|x-content-type|referrer-policy'
      ```
- [ ] **[VERIFY]** Deep link works (returns the app, HTTP 200):
      `curl -sI https://www.digitizeme.ae/pricing` → 200, and the page renders in a
      browser.
- [ ] **[VERIFY]** With DevTools open on the live site, there are **no CSP violations**
      once real tracker IDs are active. If a tracker's beacon domain is blocked, add it
      to `connect-src` in `public/.htaccess` and redeploy (one-line change).

---

## 4. [VERIFY] Cookie consent + tracking

- [ ] First visit shows the consent banner (EN and `/ar` RTL). No analytics/marketing
      network calls fire **before** a choice (check the Network tab).
- [ ] "Accept all" → trackers load; choice persists across reload; "Cookie
      preferences" in the footer reopens the banner.
- [ ] Configure real tracker IDs in the admin (GA4/GTM/etc.) if not already set.

---

## 5. [VERIFY] SEO / sitemaps

Sitemaps and `robots.txt` are generated at build time with the correct domain.
- [ ] `curl -s https://www.digitizeme.ae/robots.txt` → points to
      `https://www.digitizeme.ae/sitemap.xml`.
- [ ] `curl -s https://www.digitizeme.ae/sitemap.xml` → valid sitemap **index**
      (correct domain, current `lastmod`).
- [ ] Submit `https://www.digitizeme.ae/sitemap.xml` in Google Search Console.
- [ ] Confirm no `aggregateRating` remains and the Organization `logo.png` resolves
      (`curl -sI https://www.digitizeme.ae/logo.png` → 200).
- [ ] Test a couple of URLs in Google's Rich Results Test.

---

## 6. [VERIFY] End-to-end smoke test

- [ ] Home, Product, Pricing, Industries (+ a detail page), Contact, Blog, Privacy,
      Terms — all render, EN and `/ar`.
- [ ] Industry cards show the new photos (accounting, banking, education, trade,
      insurance, logistics, retail).
- [ ] **Submit the contact form** → lead appears in the admin **and** the
      notification fires (Slack/email). This is the critical revenue path.
- [ ] Admin login works; the BlockNote editor loads (lazy chunk).
- [ ] Trigger nothing-broke: force a JS error path if convenient and confirm the error
      boundary shows the recovery screen rather than a white page.

---

## 7. Rollback

- **Frontend:** keep the previous `dist/` (or the WordPress site) to restore the web
  root. Static swap — instant.
- **Database:** migrations are additive but change policies/grants. To reverse:
  - Re-grant / re-drop is scriptable, but **test any down-migration on a branch/db
    first.** Simplest safety net: take a Supabase backup/snapshot **before** §1.
- **Secrets:** unsetting `app.notify_lead_url` disables lead notifications without
  affecting lead capture.

---

## 8. Post-launch follow-ups (not blockers)

- [ ] **Legal:** finish `docs/privacy-policy-draft.md` with counsel; publish a **DPA**
      and **sub-processor list**; create a `privacy@` mailbox; set a leads-retention
      policy; add a consent checkbox to the contact form.
- [ ] **`.env` hygiene:** add `.env` to `.gitignore` and ship a `.env.example` (the
      committed key is public, but this prevents a future real secret being committed).
- [ ] **CI:** the GitHub Actions workflow runs on push/PR; drive the non-blocking lint
      backlog (207 issues) down, then make lint a hard gate.
- [ ] **Dynamic content in sitemap:** blog-post and feature-detail URLs are DB-driven
      and not in the static sitemap — add them to `scripts/generate-sitemap.mjs` (with
      a build-time Supabase fetch) or wire up the existing sitemap edge function.
- [ ] **Remaining CDN images:** several industry photos (law-firms, oil-gas, etc.) and
      hero media still load from Lovable `/__l5e/` CDN paths and may not resolve on
      A2 — verify each renders on the live domain; bundle any that break.
- [ ] **CSP tightening:** drop `'unsafe-inline'` from `script-src` once trackers move
      to GTM/nonce-based loading.

---

### Quick reference — what each commit shipped
| Area | What to verify live |
|---|---|
| Role escalation + EXECUTE (migration) | admin panel + edge functions work; no self-escalation |
| Stored-XSS DOMPurify + injection lockdown | CMS renders; `custom_head` super-admin only |
| Cookie consent | banner gates all 7 trackers, EN/AR |
| Security headers + SPA `.htaccess` | headers present; deep links 200 |
| Fake structured data removed | no `aggregateRating`; logo.png resolves |
| Lead notifications | contact form → notification received |
| Error boundary + Sentry | no white-screen; errors reach Sentry (if DSN set) |
| CI + green tests | workflow green on PR |
| Industry images / favicons / bundle split | photos load; fast first paint |
| Sitemap/robots correct-domain | GSC accepts sitemap |
