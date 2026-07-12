-- =========================================================================
-- Rework: industry SEO landing data is keyed by slug, not persona_id
-- =========================================================================
-- Reason: the production industry list comes from `industriesData` (hardcoded)
-- + `site_content` (custom CMS entries). The `personas` table is unused by
-- the public site. Keying SEO landing data + FAQs by industry slug means
-- both hardcoded and CMS industries get the same editing surface.
-- =========================================================================

-- 1) Drop the columns we previously added to personas (they were unreachable)
ALTER TABLE public.personas
  DROP COLUMN IF EXISTS seo_landing_enabled,
  DROP COLUMN IF EXISTS seo_title,
  DROP COLUMN IF EXISTS seo_title_ar,
  DROP COLUMN IF EXISTS seo_description,
  DROP COLUMN IF EXISTS seo_description_ar,
  DROP COLUMN IF EXISTS seo_og_image,
  DROP COLUMN IF EXISTS seo_canonical_url,
  DROP COLUMN IF EXISTS seo_keywords,
  DROP COLUMN IF EXISTS solutions_h1,
  DROP COLUMN IF EXISTS solutions_h1_ar,
  DROP COLUMN IF EXISTS solutions_intro,
  DROP COLUMN IF EXISTS solutions_intro_ar,
  DROP COLUMN IF EXISTS solutions_sections,
  DROP COLUMN IF EXISTS solutions_sections_ar,
  DROP COLUMN IF EXISTS solutions_cta_label,
  DROP COLUMN IF EXISTS solutions_cta_label_ar,
  DROP COLUMN IF EXISTS solutions_cta_link,
  DROP COLUMN IF EXISTS related_industry_slugs,
  DROP COLUMN IF EXISTS related_feature_slugs,
  DROP COLUMN IF EXISTS related_blog_slugs;

DROP INDEX IF EXISTS public.idx_personas_seo_landing;

-- 2) Drop the persona_id-keyed FAQ table (we'll recreate it slug-keyed)
DROP TABLE IF EXISTS public.industry_faqs;

-- 3) Per-industry SEO landing config, keyed by industry slug
CREATE TABLE IF NOT EXISTS public.industry_seo_landing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_slug text NOT NULL UNIQUE,

  -- Toggle the dedicated /solutions/:slug page on/off
  enabled boolean NOT NULL DEFAULT true,

  -- SEO meta (English + Arabic)
  seo_title text,
  seo_title_ar text,
  seo_description text,
  seo_description_ar text,
  seo_og_image text,
  seo_canonical_url text,
  seo_keywords text[] NOT NULL DEFAULT '{}',

  -- Long-form copy distinct from /industries/:slug hero
  h1 text,
  h1_ar text,
  intro text,
  intro_ar text,
  -- Each section is `{ heading, heading_ar, body, body_ar }`
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Conversion CTA on the SEO landing page
  cta_label text,
  cta_label_ar text,
  cta_link text,

  -- Internal-linking pickers (lists of slugs from other tables)
  related_industry_slugs text[] NOT NULL DEFAULT '{}',
  related_feature_slugs text[] NOT NULL DEFAULT '{}',
  related_blog_slugs text[] NOT NULL DEFAULT '{}',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_industry_seo_landing_enabled
  ON public.industry_seo_landing (enabled, industry_slug);

DROP TRIGGER IF EXISTS trg_industry_seo_landing_updated_at ON public.industry_seo_landing;
CREATE TRIGGER trg_industry_seo_landing_updated_at
  BEFORE UPDATE ON public.industry_seo_landing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Per-industry FAQs, keyed by industry slug
CREATE TABLE IF NOT EXISTS public.industry_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_slug text NOT NULL,
  question text NOT NULL,
  question_ar text,
  answer text NOT NULL,
  answer_ar text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_industry_faqs_slug
  ON public.industry_faqs (industry_slug, sort_order);

DROP TRIGGER IF EXISTS trg_industry_faqs_updated_at ON public.industry_faqs;
CREATE TRIGGER trg_industry_faqs_updated_at
  BEFORE UPDATE ON public.industry_faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5) RLS — same model as other CMS-managed tables
ALTER TABLE public.industry_seo_landing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view enabled SEO landing" ON public.industry_seo_landing;
CREATE POLICY "Anyone can view enabled SEO landing"
  ON public.industry_seo_landing
  FOR SELECT
  TO public
  USING (
    enabled = true
    OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role])
  );

DROP POLICY IF EXISTS "Editors can insert SEO landing" ON public.industry_seo_landing;
CREATE POLICY "Editors can insert SEO landing"
  ON public.industry_seo_landing
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role])
  );

DROP POLICY IF EXISTS "Editors can update SEO landing" ON public.industry_seo_landing;
CREATE POLICY "Editors can update SEO landing"
  ON public.industry_seo_landing
  FOR UPDATE
  TO authenticated
  USING (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role])
  );

DROP POLICY IF EXISTS "Admins can delete SEO landing" ON public.industry_seo_landing;
CREATE POLICY "Admins can delete SEO landing"
  ON public.industry_seo_landing
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

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