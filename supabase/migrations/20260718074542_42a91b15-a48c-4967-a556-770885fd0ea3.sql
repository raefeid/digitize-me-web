DROP POLICY IF EXISTS "Anyone can view published client logos" ON public.client_logos;
CREATE POLICY "Public can view published client logos"
  ON public.client_logos FOR SELECT
  TO anon, authenticated
  USING (published = true OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));
GRANT SELECT ON public.client_logos TO anon;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) TO anon;