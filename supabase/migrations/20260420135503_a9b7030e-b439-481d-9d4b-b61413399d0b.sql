CREATE TABLE public.features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,

  hero_badge TEXT,
  hero_badge_ar TEXT,
  hero_title TEXT NOT NULL DEFAULT '',
  hero_title_ar TEXT,
  hero_desc TEXT,
  hero_desc_ar TEXT,
  hero_image_url TEXT,

  cta_primary_label TEXT,
  cta_primary_label_ar TEXT,
  cta_primary_link TEXT,
  cta_secondary_label TEXT,
  cta_secondary_label_ar TEXT,
  cta_secondary_link TEXT,

  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  sections_ar JSONB NOT NULL DEFAULT '[]'::jsonb,

  seo_title TEXT,
  seo_title_ar TEXT,
  seo_description TEXT,
  seo_description_ar TEXT,
  seo_og_image TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published features"
ON public.features FOR SELECT
USING (
  published = true
  OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role])
);

CREATE POLICY "Editors can insert features"
ON public.features FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can update features"
ON public.features FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Admins can delete features"
ON public.features FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_features_updated_at
BEFORE UPDATE ON public.features
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_features_slug ON public.features(slug);
CREATE INDEX idx_features_published ON public.features(published);