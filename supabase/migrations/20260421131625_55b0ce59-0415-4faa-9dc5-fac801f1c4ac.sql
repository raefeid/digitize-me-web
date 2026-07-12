-- Track SERP score snapshots over time, one row per save per page+language.
-- Lets editors see how their edits improved (or hurt) length compliance,
-- keyword coverage and duplicate risk.
CREATE TABLE public.seo_score_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL,           -- e.g. "home", "industry_<slug>", "feature_<id>", "custom_<id>"
  page_label TEXT NOT NULL,         -- human-friendly label captured at snapshot time
  lang TEXT NOT NULL CHECK (lang IN ('en','ar')),
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  -- Per-check sub-scores (0–100, rounded). Same check ids as SerpScorePanel.
  title_length_score INTEGER NOT NULL DEFAULT 0,
  desc_length_score INTEGER NOT NULL DEFAULT 0,
  keyword_coverage_score INTEGER NOT NULL DEFAULT 0,
  duplicate_risk_score INTEGER NOT NULL DEFAULT 0,
  -- Lightweight context for forensics
  meta_title_length INTEGER NOT NULL DEFAULT 0,
  meta_description_length INTEGER NOT NULL DEFAULT 0,
  keyword_count INTEGER NOT NULL DEFAULT 0,
  actor_id UUID,
  actor_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_score_snapshots_page_lang_time
  ON public.seo_score_snapshots (page_key, lang, created_at DESC);

ALTER TABLE public.seo_score_snapshots ENABLE ROW LEVEL SECURITY;

-- Editors can read & write their own snapshots; admins/seo_managers see all.
CREATE POLICY "Editors can view SEO score snapshots"
  ON public.seo_score_snapshots
  FOR SELECT
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can insert SEO score snapshots"
  ON public.seo_score_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role])
    AND (actor_id IS NULL OR actor_id = auth.uid())
  );

CREATE POLICY "Admins can delete SEO score snapshots"
  ON public.seo_score_snapshots
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));