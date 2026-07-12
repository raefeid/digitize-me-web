# Digitize me — Marketing Website & CMS

A bilingual (English / Arabic) marketing site for **Digitize me**, an AI-powered document-management & OCR platform serving the UAE/MENA market. The codebase ships with a fully self-service admin so non-technical editors can update copy, images, SEO, pricing, promotions, branding, and team access without touching code.

**Live preview:** managed via Lovable
**Admin:** `/admin` (sign in at `/admin/login`)

---

## ✨ Features

### Public site
- **Bilingual** — full EN / AR with RTL support, auto-switched via `LanguageContext`
- **Pages:** Home, Product, Pricing, Industries (+ dynamic per-industry pages), Blog, Contact, Privacy, Terms
- **SEO out of the box** — per-page meta titles, descriptions, keywords, OG/Twitter cards, JSON-LD graph (Organization, WebSite, BreadcrumbList, FAQ, Product, Article), canonical URLs, hreflang alternates
- **Performance & a11y** — semantic `<main>` landmark, skip-to-content link, keyboard-accessible nav, focus rings everywhere, lazy loading, framer-motion reveals
- **Region-aware pricing** with geo-detection
- **Promotions** — banners / popups configurable from admin
- **Live demo** widget (OCR preview)

### Admin (`/admin`)
| Panel | What it does |
|---|---|
| **Dashboard** | Overview of posts, content count, quick links |
| **Site Content** | Edit every text/image on every page (EN + AR + FR) |
| **SEO** | Per-page meta tags, OG image, FAQ JSON, live SERP & social previews, SEO health score |
| **Branding & logos** | Navbar / Footer / Powered-by logos, favicon, default OG image |
| **Pricing** | Plans, features, regional currency overrides |
| **Promotions** | Banners, popups, scheduling |
| **Media Library** | Browse / upload / delete images in the `cms-images` bucket |
| **Home page** | Visual section editor for the hero & marketing blocks |
| **Sitemap & robots** | Manage `sitemap.xml` & `robots.txt` |
| **Integrations** | Tracking pixels, GA4, third-party scripts |
| **CTAs** | Centralized button targets + click analytics (GA4) |
| **Section reveals** | Toggle scroll animations per section |
| **Team access** | Invite editors / SEO managers / blog authors (super-admin only) |
| **Posts & Categories** | Blog CMS with bilingual rich-text (BlockNote) |

### Roles
Stored in `user_roles` (never on profiles). Roles: `admin`, `editor`, `seo_manager`, `blog_author`, `moderator`, `user`. Super-admin is hard-pinned to `marketing@infasme.com`.

---

## 🛠 Tech stack

- **React 18** + **Vite 5** + **TypeScript 5**
- **Tailwind CSS 3** with HSL design tokens (`index.css`, `tailwind.config.ts`)
- **shadcn/ui** + Radix primitives
- **TanStack Query** for server state
- **react-router-dom v6**
- **react-helmet-async** for SEO `<head>`
- **framer-motion** for animations
- **BlockNote** for rich-text editing
- **Lovable Cloud** (Supabase) — Postgres, Auth, Storage, Edge Functions
- **Lovable AI Gateway** — Gemini / GPT models, no extra API key needed
- **Vitest** + Testing Library

---

## 📁 Project structure

```
src/
├── components/
│   ├── admin/          # All admin panels (SiteContentManager, SeoEditor, ...)
│   ├── cms/            # Inline edit-mode primitives (EditableText, EditableImage, ...)
│   ├── home/           # Home page sections
│   ├── industries/     # Industry pages
│   ├── layout/         # Navbar, Footer, Layout (skip link, <main>)
│   ├── product/        # Product page sections
│   ├── promotions/     # Banner / popup host
│   └── ui/             # shadcn primitives
├── hooks/              # useAuth, useSiteContent, useBranding, useCtaStyles, ...
├── i18n/               # LanguageContext + translation tables
├── integrations/
│   └── supabase/       # client.ts + types.ts (auto-generated — do not edit)
├── lib/                # jsonLd, utils, trackCtaClick
├── pages/              # Route components
└── test/               # Vitest setup

supabase/
├── functions/          # Edge functions: sitemap, robots, ga4-cta-stats, invite-team-member
├── migrations/         # SQL migrations (managed by Lovable)
└── config.toml         # Project config (do not edit project_id)
```

---

## 🗄 Database (Lovable Cloud / Supabase)

Public tables:
- **`site_content`** — every editable string/image on the site, keyed by `(page, section, content_key)` with `value`, `value_ar`, `value_fr`
- **`blog_posts`** — bilingual posts with publish workflow
- **`blog_categories`**
- **`user_roles`** — role assignments (separate from auth.users)
- **`invited_team_members`** — pending invites, auto-applied on sign-up

All tables have RLS enabled. SECURITY DEFINER helpers (`has_role`, `has_any_role`, `is_super_admin`) prevent recursive policy issues.

Storage:
- **`cms-images`** (public bucket) — all uploads from Media Library, SEO editor, branding, blog featured images

---

## 🚀 Getting started

```bash
# Install
npm install

# Run dev server
npm run dev

# Build
npm run build

# Lint
npm run lint

# Tests
npm test
```

The Supabase URL & anon key are auto-injected into `.env` by Lovable Cloud — never edit `.env` or `src/integrations/supabase/{client,types}.ts` manually.

---

## ✏️ Editing content

1. Sign in at `/admin/login` (super-admin: `marketing@infasme.com`)
2. Pick a panel from the dashboard
3. Changes are live the moment you save (TanStack Query auto-invalidates)

For inline editing on the public site, click the **pencil icon** in the bottom-right while signed in as an editor.

---

## 🎨 Design system

All colors live as HSL CSS variables in `src/index.css` and are mapped in `tailwind.config.ts`. **Never hardcode colors in components** — always use semantic tokens (`bg-background`, `text-foreground`, `bg-accent`, etc.) so dark/light modes and rebrands stay consistent.

---

## 🔒 Security notes

- Roles are stored in `user_roles`, never on the profile/users table — prevents privilege escalation
- Admin status is checked server-side via the `has_role` SQL function — never trust client storage
- All RLS policies use SECURITY DEFINER helpers to avoid recursion
- Edge functions verify JWT for write operations
- The super-admin email is checked inside `is_super_admin()` — change it in `supabase/migrations/` if ownership transfers

---

## 📄 License

Proprietary — © Infasme / Digitize me.
