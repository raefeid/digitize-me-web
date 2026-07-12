# About page + UAE reinforcement

## New page: `/about` (and `/ar/about`)

Bilingual, fully CMS-editable via existing `EditableText` / `EditableImage` patterns. Route added to `src/App.tsx` with lazy import.

### Sections (top → bottom)

1. **Hero** — eyebrow ("About Digitize me"), H1, lede paragraph, subtle hero visual. Editable.
2. **Our Story — 30+ year timeline** — vertical/horizontal timeline of milestone cards (year + title + short copy). Seeded with placeholder milestones (group founding, regional expansion, digital transformation practice, launch of Digitize me, UAE cloud rollout, today). Each milestone editable; admin can add/remove via existing CMS list pattern.
3. **Founder's Message — Raef Eid** — portrait slot, name, title ("Founder & CEO"), signed message. Empty editable slots (you'll paste real copy/photo later). I'll add a short neutral placeholder so the layout reads correctly until you fill it.
4. **UAE Trust block** — "Hosted in the UAE. Built for the region." 3 trust pillars: UAE data residency, Arabic-first product, regional support. Icon + title + description each, editable.
5. **CTA footer** — "Talk to our team" button → canonical `/contact` (normalized, so Arabic version routes to `/ar/contact` correctly per existing localization rules).

### SEO
- `SEOHead` with localized title/description, `pageKey="about"`, breadcrumbs (Home → About).
- Add `about` entry to breadcrumb label dictionary in `src/lib/jsonLd.ts` (EN "About", AR "من نحن").
- Add `/about` to sitemap seed list in `supabase/functions/sitemap/index.ts` and to static `public/sitemap-en.xml` / `public/sitemap-ar.xml` / `public/sitemap-index.xml`.

### Navigation
- Add "About" / "من نحن" link to primary nav (via `useNavItems` default seed) and to footer "Company" column.

## Site-wide UAE reinforcement (medium scope)

A small reusable `UAEHostingBadge` component (flag glyph + "Hosted in the UAE" / "مستضاف في الإمارات"), styled with existing tokens, editable label via CMS keys.

Placement:
- **Footer** (`src/components/layout/Footer.tsx`) — badge in the bottom bar next to copyright, shown on every page.
- **Homepage** (`src/pages/Index.tsx`) — one-line trust strip inside the existing TrustedBy / Security area.
- **Pricing** (`src/pages/Pricing.tsx`) — badge under the plan grid header reinforcing local hosting.
- **Contact** (`src/pages/Contact.tsx`) — badge in the contact info sidebar.

All copy goes through `EditableText` so you can refine wording in admin.

## Content source decision
Per your "Mix" answer:
- I'll write placeholder copy for the **Hero, Story timeline milestones, UAE trust pillars, and CTA**.
- **Founder's message** section gets a short neutral placeholder + empty portrait slot — you paste Raef Eid's real message and photo later via the admin editor.

## Technical notes
- New files: `src/pages/About.tsx`, `src/components/about/StoryTimeline.tsx`, `src/components/about/FoundersMessage.tsx`, `src/components/about/UAETrustBlock.tsx`, `src/components/common/UAEHostingBadge.tsx`.
- Edits: `src/App.tsx` (route), `src/lib/jsonLd.ts` (breadcrumb label), `src/components/layout/Footer.tsx` & `Navbar.tsx` (nav link + badge), `src/pages/Index.tsx`, `src/pages/Pricing.tsx`, `src/pages/Contact.tsx` (badge insertion), sitemap files.
- No DB schema changes — uses existing `site_content` table for editable copy.
- Arabic translations added to `src/i18n/translations.ts` for nav label.

## Out of scope (ask if needed)
- Leadership team grid (you chose the slimmer structure).
- Real founder photo/bio copy — you'll provide.
- Heavy site-wide UAE injection on product/industries/integrations pages.
