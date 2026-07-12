-- Audit log for AI-driven SEO field changes on custom pages.
-- Captures which fields the generator filled, the values it set, and the
-- prior values so admins can review before publishing.
CREATE TABLE public.seo_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.custom_pages(id) ON DELETE CASCADE,
  actor_id UUID,
  actor_email TEXT,
  source TEXT NOT NULL DEFAULT 'ai_generate',
  mode TEXT NOT NULL DEFAULT 'fill_missing',
  fields_changed TEXT[] NOT NULL DEFAULT '{}',
  before_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  after_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_audit_log_page_id_created_at
  ON public.seo_audit_log (page_id, created_at DESC);

ALTER TABLE public.seo_audit_log ENABLE ROW LEVEL SECURITY;

-- Anyone with content-editing access can read & write entries for any page.
CREATE POLICY "Editors can view SEO audit log"
ON public.seo_audit_log
FOR SELECT
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['admin','editor','seo_manager']::app_role[])
);

CREATE POLICY "Editors can insert SEO audit log"
ON public.seo_audit_log
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['admin','editor','seo_manager']::app_role[])
  AND (actor_id IS NULL OR actor_id = auth.uid())
);

-- Only admins can delete entries (audit hygiene; no updates allowed).
CREATE POLICY "Admins can delete SEO audit log"
ON public.seo_audit_log
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));