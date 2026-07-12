DROP POLICY IF EXISTS "Admins can delete site content" ON public.site_content;
CREATE POLICY "Editors can delete site content"
ON public.site_content
FOR DELETE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));