-- Security fix 2b — Lock down the raw-HTML injection fields to super_admin.
--
-- site_content rows page='integrations' / content_key IN ('custom_head','custom_body')
-- are injected verbatim into <head>/<body> by useTrackingScripts.tsx (they must
-- carry raw <script>, so they cannot be HTML-sanitized like other CMS copy).
-- The existing write policies allow admin/editor/seo_manager to write ANY
-- site_content row, so a lower-privileged editor could plant a site-wide script
-- and steal the super_admin's session — a privilege-escalation path.
--
-- All other CMS rich content is sanitized with DOMPurify at render time
-- (src/lib/sanitizeHtml.ts). These two keys are the exception, so we restrict
-- *writing* them to super_admin only, via RESTRICTIVE policies that AND with the
-- existing permissive editor policies.
--
-- Depends on is_super_admin(uuid) being EXECUTE-able by `authenticated`
-- (restored in migration 20260811150000).

DROP POLICY IF EXISTS "Only super admin writes raw injection (insert)" ON public.site_content;
CREATE POLICY "Only super admin writes raw injection (insert)"
  ON public.site_content
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT (page = 'integrations' AND content_key IN ('custom_head', 'custom_body'))
    OR public.is_super_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Only super admin writes raw injection (update)" ON public.site_content;
CREATE POLICY "Only super admin writes raw injection (update)"
  ON public.site_content
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (
    NOT (page = 'integrations' AND content_key IN ('custom_head', 'custom_body'))
    OR public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    NOT (page = 'integrations' AND content_key IN ('custom_head', 'custom_body'))
    OR public.is_super_admin(auth.uid())
  );
