# Scroll-driven "Paper to Digital" animation

Replace the current auto-cycling `AnimatedDocFlow` with a scroll-pinned cinematic sequence where a stylized laptop/browser mockup drives through all 4 steps as the user scrolls.

## UX flow

The section becomes a tall scroll container (~4x viewport height). Inside, a sticky stage pins a PC/browser mockup to the center of the viewport. As the user scrolls:

1. **Upload (0–25%)** — Cursor glides across the screen, hovers a file, drag-drops `Contract_2024.pdf` into an upload zone. Progress bar fills.
2. **Scan & OCR (25–50%)** — Document appears on screen, a horizontal scan-line sweeps top→bottom, Arabic + English text lines materialize with checkmarks; "99% accuracy" badge pops.
3. **AI Classify (50–75%)** — Brain icon pulses; tags fly in one by one (Contract, Commercial, Arabic, Signed…); a mini knowledge-graph line connects them.
4. **Ready (75–100%)** — Green check bursts, document shrinks into a folder, "Searchable • Shareable • Archived" badges slide in.

The 4 step nodes above the mockup stay visible and highlight in sync with scroll progress (progress bar fills as a single continuous line).

## Layout

```text
┌─────────────────────────── section (h ≈ 400vh) ───────────────────────────┐
│  ┌─────────── sticky stage (h = 100vh) ────────────┐                       │
│  │  ● ─── ● ─── ● ─── ●   step rail (active = scroll progress)             │
│  │                                                                          │
│  │     ╔══════════════════════════╗                                         │
│  │     ║  ▄▄ browser chrome ▄▄    ║   ← laptop / browser mockup            │
│  │     ║                          ║      content swaps per step             │
│  │     ║   [step content]         ║                                         │
│  │     ╚══════════════════════════╝                                         │
│  │     caption line (step description, crossfades)                          │
│  └──────────────────────────────────────────────────┘                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Technical approach

- New component: `src/components/home/ScrollDocFlow.tsx` (replaces `AnimatedDocFlow` on the homepage; keep the old file for now in case we need to revert).
- Use Framer Motion `useScroll({ target: sectionRef, offset: ["start start", "end end"] })` + `useTransform` to drive:
  - progress bar `scaleX`
  - active step index (via `useMotionValueEvent`)
  - per-step opacity/scale/translate of the internal scenes
- Browser mockup: styled `div` with traffic-light dots + URL bar (uses design tokens — `bg-card`, `border-border`, `text-accent`).
- Reuse the existing per-step visual pieces from `AnimatedDocFlow` (upload card, OCR lines, tags, ready badges), repackaged as 4 absolutely-positioned scenes that cross-fade based on scroll progress instead of a `setInterval`.
- CMS content: keep pulling `step{n}_label` / `step{n}_desc` from `useSiteContent("home", "doc_flow")` so admin overrides still work. Bilingual (EN/AR) preserved via `useLanguage()`.
- Accessibility / motion: respect `useReducedMotion()` — if reduced motion is on, fall back to the current stacked (non-scroll-driven) 4-panel view with no pinning.
- Mobile (< md): shorter scroll length (~300vh) and simplified mockup (no chrome frame, smaller cursor). On very small screens, fall back to the current tap-through version to avoid awkward long scrolls.

## Files touched

- **Add** `src/components/home/ScrollDocFlow.tsx`
- **Edit** `src/pages/Index.tsx` — swap `AnimatedDocFlow` import for `ScrollDocFlow` in the doc-flow section.
- No CMS/schema changes. No changes to other sections.

## Out of scope

- No new images or 3D assets — pure CSS/SVG mockup.
- No changes to pricing, hero, or Infasme attribution sections.
- Keeping `AnimatedDocFlow.tsx` in the repo (unused) so we can revert quickly; can delete in a follow-up if you're happy.
