
# Homepage Overhaul Plan

Section-by-section changes to `src/pages/Index.tsx` and related components. Brand colors, fonts, and overall visual language are preserved.

---

## 1. Hero Section
- **CTAs**: Reduce to exactly two buttons — **Start Free Trial** and **Book a Demo**. Remove all other hero CTAs.
- **Tagline**: Move "Scan, extract, classify…" to its own line directly under the H1 "From Paper Chaos to Smart Archives". Force single-line via responsive font-size + `whitespace-nowrap` (with a smaller mobile fallback so it still fits).
- **Brand video**: Embed the Google Drive video (`1oeBzPVkCrv3WCjkm3CGJ4PyhilLkghST`) into the hero. Use a **poster thumbnail with click-to-open modal** (autoplay in-modal, muted), so the initial hero paint stays fast. Video shown via Drive's `/preview` iframe inside a lightbox.

## 2. Client Logos Strip
- No content changes.
- Boost visibility: increase logo height (~40 → ~64px), remove/soften the grayscale filter, raise opacity to 100%, lighten section background one shade for contrast.

## 3. Stats / "Built by Infasme"
- **Numbers**: Wrap each stat in a card (soft background, border, subtle shadow). Increase number font size and weight for higher visual pop.
- **Infasme logo**: Regenerate a high-resolution/vector-style logo asset and move the "Crafted by Infasme" block **above** the stats row.

## 4. Merge "What the Platform Is About" + Features → single interactive section
- Merge the two current blocks into one section with a centered header.
- Two-column layout below:
  - **Left**: 4–5 USPs as checkbox-style bullets (checkmark icon + short label + one-line description). Clicking/hovering a bullet selects it.
  - **Right**: A visual panel that swaps its graphic based on the active USP (e.g. Upload, OCR, Classify, Search, Export). Smooth crossfade between states.
- Content edit inside the doc preview graphic: change label **"Issued to:" → "Vendor:"**, keep "Gulf Logistics".

## 5. Industry Section
- Split the banner into two halves.
- **Left half**: existing copy/text.
- **Right half**: 6 industry boxes in a 3×2 grid (larger tiles than today).
- Move the rotating orbit/circles graphic to the right side, sized to balance the left column.
- Fix the orbit animation so the circles stay on a stable horizontal axis (correct transform-origin, remove drift from any translateY oscillation).

## 6. "$10,000 Worth of Software. Included."
- **Sub A (inclusion boxes)**: Keep headline/subheadline. Enlarge the inclusion tiles and distribute evenly full-width via a responsive grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`, equal gap, `w-full`).
- **Sub B (chart)**: No changes.
- **Sub C (dark panel with left visual)**: Enlarge the left-side visual (wider column, larger illustration) without changing the rest of the layout.

## 7. Testimonials (NEW)
- Add a new section below the "$10,000" block containing:
  - A row of numeric proof stats (e.g. "500+ businesses", "5M+ pages processed", "99.9% uptime", "4.9/5 rating") in bold card treatment.
  - 3 written testimonial cards (quote, name, role, company).
  - Client logos row alongside/under the testimonials.
- Seeded with placeholder testimonials from the existing `useTestimonials` data if present; otherwise inline three plausible UAE-market quotes clearly marked as sample content so you can edit later via the admin.

## 8. Ending CTA
- Wrap the final CTA in a large dark container (rounded, deep brand-dark background, generous padding, subtle inner glow).
- Increase heading + subcopy font sizes for prominence.
- Keep copy and CTA button destinations unchanged.

---

## Technical notes

**Files touched (create/modify):**
- `src/pages/Index.tsx` — reorder/compose sections.
- `src/components/home/BilingualOCRHero.tsx` (or current hero) — CTA reduction, tagline placement, video embed trigger.
- `src/components/home/HeroVideoModal.tsx` *(new)* — lightbox wrapping Drive `/preview` iframe.
- `src/components/home/ClientLogosCarousel.tsx` — sizing/contrast tweaks.
- `src/components/home/AnimatedStatsCounter.tsx` — card treatment, larger numerals.
- `src/components/home/MadeByInfasme.tsx` — swap in HD logo asset, ensure it renders above stats via order in `Index.tsx`.
- `src/components/home/InteractiveFeaturesSection.tsx` *(new)* — merged section with USP list ↔ visual panel; "Vendor:" label fix lives here.
- `src/components/home/AnimatedDocFlow.tsx` or similar — remove now-duplicated feature block.
- `src/components/home/IndustrySplitSection.tsx` *(new)* — split layout, 3×2 tile grid, relocated orbit.
- Orbit component (existing) — patch transform math to lock the horizontal axis.
- `src/components/home/AllInOneSection.tsx` — inclusion tile sizing/distribution; enlarge dark-panel left visual.
- `src/components/home/TestimonialsProofSection.tsx` *(new)* — stats + quotes + logos.
- Final CTA component — dark container + larger typography.
- `src/assets/infasme-logo-hd.png.asset.json` *(new)* — regenerated HD logo via imagegen + `lovable-assets`.

**Interaction pattern (Section 4):** Local `useState<number>` for active USP, keyboard-accessible list (`role="tablist"` + arrow-key nav), right panel uses Framer Motion `AnimatePresence` crossfade keyed on the active index.

**Video embed:** `<iframe src="https://drive.google.com/file/d/1oeBzPVkCrv3WCjkm3CGJ4PyhilLkghST/preview" allow="autoplay">` mounted only when the modal opens.

**Orbit fix:** current drift is from a `translateY` on the orbiting children. Replacement: parent rotates, children counter-rotate, positioned purely via `translateX(radius)` so they trace a perfect horizontal ellipse.

**Non-goals:** No color/font changes. No copy changes outside "Vendor:" label. No changes to sections/subsections explicitly marked "no changes".

**Open item before build:** Testimonial content — I'll use plausible sample quotes labeled clearly so you can replace them from the admin. Say the word if you'd rather supply the exact quotes/logos first.
