REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) FROM anon;
DROP POLICY IF EXISTS "Public can view published client logos" ON public.client_logos;
CREATE POLICY "Anon can view published client logos"
  ON public.client_logos FOR SELECT
  TO anon
  USING (published = true);
CREATE POLICY "Authenticated can view client logos"
  ON public.client_logos FOR SELECT
  TO authenticated
  USING (published = true OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));