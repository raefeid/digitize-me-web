-- Site content table for CMS
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  value_ar TEXT,
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'image_url', 'json')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page, section, content_key)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read site content"
ON public.site_content FOR SELECT
USING (true);

-- Admin write
CREATE POLICY "Admins can insert site content"
ON public.site_content FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site content"
ON public.site_content FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site content"
ON public.site_content FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_site_content_page_section ON public.site_content(page, section);

-- Storage bucket for CMS images
INSERT INTO storage.buckets (id, name, public) VALUES ('cms-images', 'cms-images', true);

-- Storage policies
CREATE POLICY "Public read for CMS images"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-images');

CREATE POLICY "Admins can upload CMS images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update CMS images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete CMS images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'));