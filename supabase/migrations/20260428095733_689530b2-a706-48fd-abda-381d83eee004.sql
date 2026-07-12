-- Phase 3: Industries table — structured per-industry content (replaces hardcoded `industriesData` array)
CREATE TABLE public.industries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  -- Display
  name TEXT NOT NULL,
  name_ar TEXT,
  icon TEXT NOT NULL DEFAULT 'Briefcase', -- lucide icon name
  -- Hero
  headline TEXT NOT NULL DEFAULT '',
  headline_ar TEXT,
  description TEXT NOT NULL DEFAULT '',
  description_ar TEXT,
  -- Structured content (arrays of strings)
  pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  pain_points_ar JSONB NOT NULL DEFAULT '[]'::jsonb,
  solutions JSONB NOT NULL DEFAULT '[]'::jsonb,
  solutions_ar JSONB NOT NULL DEFAULT '[]'::jsonb,
  use_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  use_cases_ar JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Before / after comparison
  before_text TEXT NOT NULL DEFAULT '',
  before_text_ar TEXT,
  after_text TEXT NOT NULL DEFAULT '',
  after_text_ar TEXT,
  -- CTA
  cta TEXT NOT NULL DEFAULT '',
  cta_ar TEXT,
  -- Lifecycle
  published BOOLEAN NOT NULL DEFAULT true,
  is_hardcoded BOOLEAN NOT NULL DEFAULT false, -- true for the 12 originally-shipped industries
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_industries_slug ON public.industries(slug);
CREATE INDEX idx_industries_published ON public.industries(published);
CREATE INDEX idx_industries_sort_order ON public.industries(sort_order);

ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published industries"
  ON public.industries FOR SELECT
  USING (published = true OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can insert industries"
  ON public.industries FOR INSERT
  TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can update industries"
  ON public.industries FOR UPDATE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Admins can delete industries"
  ON public.industries FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_industries_updated_at
  BEFORE UPDATE ON public.industries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();