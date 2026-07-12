-- Enums
CREATE TYPE public.integration_category AS ENUM ('erp', 'crm', 'cloud_storage', 'productivity', 'custom_api');
CREATE TYPE public.integration_status AS ENUM ('available', 'coming_soon', 'custom');

-- Table
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  slug TEXT NOT NULL UNIQUE,
  category public.integration_category NOT NULL DEFAULT 'productivity',
  description TEXT,
  description_ar TEXT,
  logo_url TEXT,
  status public.integration_status NOT NULL DEFAULT 'available',
  cta_label TEXT,
  cta_label_ar TEXT,
  cta_link TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for filtering
CREATE INDEX idx_integrations_category ON public.integrations(category);
CREATE INDEX idx_integrations_status ON public.integrations(status);
CREATE INDEX idx_integrations_sort ON public.integrations(sort_order);

-- RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published integrations"
  ON public.integrations FOR SELECT
  USING (published = true OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can insert integrations"
  ON public.integrations FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can update integrations"
  ON public.integrations FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Admins can delete integrations"
  ON public.integrations FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated-at trigger
CREATE TRIGGER integrations_set_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();