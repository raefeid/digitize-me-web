-- =========================================================================
-- SEO landing pages per industry
-- =========================================================================
-- Adds columns to `personas` so each industry can power both:
--   * /industries/:slug  (existing product-style page)
--   * /solutions/:slug   (new SEO-optimized landing page)
-- And introduces a sibling table `industry_faqs` for the per-industry FAQ
-- block (FAQPage schema).
-- =========================================================================

-- 1) Per-industry SEO landing config on personas
ALTER TABLE public.personas
  -- Toggle the new /solutions/:slug page on/off per industry
  ADD COLUMN IF NOT EXISTS seo_landing_enabled boolean NOT NULL DEFAULT true,

  -- SEO meta (English + Arabic)
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_title_ar text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_description_ar text,
  ADD COLUMN IF NOT EXISTS seo_og_image text,
  ADD COLUMN IF NOT EXISTS seo_canonical_url text,
  ADD COLUMN IF NOT EXISTS seo_keywords text[] NOT NULL DEFAULT '{}',

  -- Long-form copy for the SEO landing page (separate from product hero copy)
  ADD COLUMN IF NOT EXISTS solutions_h1 text,
  ADD COLUMN IF NOT EXISTS solutions_h1_ar text,
  ADD COLUMN IF NOT EXISTS solutions_intro text,
  ADD COLUMN IF NOT EXISTS solutions_intro_ar text,
  ADD COLUMN IF NOT EXISTS solutions_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS solutions_sections_ar jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Conversion CTA on the SEO landing page
  ADD COLUMN IF NOT EXISTS solutions_cta_label text,
  ADD COLUMN IF NOT EXISTS solutions_cta_label_ar text,
  ADD COLUMN IF NOT EXISTS solutions_cta_link text,

  -- Internal-linking pickers (admin chooses which slugs to surface)
  -- Stored as text[] of slugs so we don't need brittle FKs to other tables.
  ADD COLUMN IF NOT EXISTS related_industry_slugs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_feature_slugs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_blog_slugs text[] NOT NULL DEFAULT '{}';

-- Helpful index for sitemap / listing queries
CREATE INDEX IF NOT EXISTS idx_personas_seo_landing
  ON public.personas (seo_landing_enabled, published, sort_order);

-- 2) Per-industry FAQs (powers FAQPage schema)
CREATE TABLE IF NOT EXISTS public.industry_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  question text NOT NULL,
  question_ar text,
  answer text NOT NULL,
  answer_ar text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_industry_faqs_persona
  ON public.industry_faqs (persona_id, sort_order);

-- Reuse the existing timestamp trigger function
DROP TRIGGER IF EXISTS trg_industry_faqs_updated_at ON public.industry_faqs;
CREATE TRIGGER trg_industry_faqs_updated_at
  BEFORE UPDATE ON public.industry_faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3) RLS — same model as personas (public read of published, editor writes)
ALTER TABLE public.industry_faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published industry FAQs" ON public.industry_faqs;
CREATE POLICY "Anyone can view published industry FAQs"
  ON public.industry_faqs
  FOR SELECT
  TO public
  USING (
    published = true
    OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role])
  );

DROP POLICY IF EXISTS "Editors can insert industry FAQs" ON public.industry_faqs;
CREATE POLICY "Editors can insert industry FAQs"
  ON public.industry_faqs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role])
  );

DROP POLICY IF EXISTS "Editors can update industry FAQs" ON public.industry_faqs;
CREATE POLICY "Editors can update industry FAQs"
  ON public.industry_faqs
  FOR UPDATE
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role])
  );

DROP POLICY IF EXISTS "Admins can delete industry FAQs" ON public.industry_faqs;
CREATE POLICY "Admins can delete industry FAQs"
  ON public.industry_faqs
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));