-- =========================================================
-- Phase 1: Conversion funnel + Trust layer
-- =========================================================

-- ---------- LEADS ----------
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case TEXT,
  industry TEXT,
  company_size TEXT,
  full_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT,
  cta_source TEXT,
  page_path TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
ON public.leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Staff can view leads"
ON public.leads FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Staff can update leads"
ON public.leads FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_status ON public.leads(status);

-- ---------- TESTIMONIALS ----------
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_name_ar TEXT,
  role TEXT,
  role_ar TEXT,
  company TEXT,
  company_ar TEXT,
  quote TEXT NOT NULL,
  quote_ar TEXT,
  avatar_url TEXT,
  company_logo_url TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published testimonials"
ON public.testimonials FOR SELECT
TO public
USING (published = true OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can insert testimonials"
ON public.testimonials FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can update testimonials"
ON public.testimonials FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Admins can delete testimonials"
ON public.testimonials FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- CLIENT LOGOS ----------
CREATE TABLE public.client_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published client logos"
ON public.client_logos FOR SELECT
TO public
USING (published = true OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can insert client logos"
ON public.client_logos FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can update client logos"
ON public.client_logos FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Admins can delete client logos"
ON public.client_logos FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_client_logos_updated_at
BEFORE UPDATE ON public.client_logos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- PRICING HIGHLIGHTS ----------
CREATE TABLE public.pricing_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT NOT NULL UNIQUE,
  most_popular BOOLEAN NOT NULL DEFAULT false,
  badge_label TEXT,
  badge_label_ar TEXT,
  cta_label_override TEXT,
  cta_label_override_ar TEXT,
  cta_link_override TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing highlights"
ON public.pricing_highlights FOR SELECT
TO public
USING (true);

CREATE POLICY "Editors can insert pricing highlights"
ON public.pricing_highlights FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can update pricing highlights"
ON public.pricing_highlights FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Admins can delete pricing highlights"
ON public.pricing_highlights FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_pricing_highlights_updated_at
BEFORE UPDATE ON public.pricing_highlights
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();