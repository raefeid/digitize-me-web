
-- Revoke EXECUTE on trigger-only helper functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_assign_admin() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_invited_role() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;

-- Update is_super_admin to prefer role-table membership, keeping email as fallback for continuity
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  ) OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id AND lower(email) = 'marketing@infasme.com'
  )
$function$;

-- Seed super_admin role for the existing marketing account so the role table is authoritative
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role FROM auth.users WHERE lower(email) = 'marketing@infasme.com'
ON CONFLICT (user_id, role) DO NOTHING;
