
-- 1) Leads: replace always-true insert with validation
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a validated lead"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  work_email IS NOT NULL
  AND char_length(work_email) BETWEEN 3 AND 255
  AND work_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND full_name IS NOT NULL
  AND char_length(full_name) BETWEEN 1 AND 200
  AND (company IS NULL OR char_length(company) <= 200)
  AND (phone IS NULL OR char_length(phone) <= 40)
  AND (message IS NULL OR char_length(message) <= 5000)
  AND (use_case IS NULL OR char_length(use_case) <= 200)
  AND (industry IS NULL OR char_length(industry) <= 200)
  AND (company_size IS NULL OR char_length(company_size) <= 100)
  AND (cta_source IS NULL OR char_length(cta_source) <= 200)
  AND (page_path IS NULL OR char_length(page_path) <= 500)
  AND (utm_source IS NULL OR char_length(utm_source) <= 200)
  AND (utm_medium IS NULL OR char_length(utm_medium) <= 200)
  AND (utm_campaign IS NULL OR char_length(utm_campaign) <= 200)
);

-- 2) cms-images storage: drop duplicates and restrict listing to admins
DROP POLICY IF EXISTS "Admins can delete cms-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update cms-images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload to cms-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read CMS image files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read cms-images" ON storage.objects;

CREATE POLICY "Admins can list cms-images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) Add super_admin role value
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
