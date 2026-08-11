-- Security fix 1 — Close privilege-escalation hole on public.user_roles.
--
-- The original "Admins can manage roles" policy (migration 20260416081935) was a
-- FOR ALL policy gated only on has_role(auth.uid(), 'admin'). It was never dropped,
-- so any user holding the 'admin' role could INSERT/UPDATE their own user_roles row
-- to grant themselves 'super_admin' (or hand 'admin' to any user id), bypassing the
-- invite-only design (invite-team-member excludes super_admin from ALLOWED_ROLES).
--
-- Legitimate role management is unaffected:
--   * "Super admin can manage user roles" (migration 20260420110746) keeps super_admin
--     able to manage all rows.
--   * The invite-team-member edge function runs with the service_role key and bypasses
--     RLS entirely, so admin-driven invites still work.
--   * "Admins can view all roles" and "Users can view their own roles" (SELECT) remain,
--     so client role lookups (useAuth, useTeamAccess) still work.
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Security fix 2 — Restore EXECUTE on the role-check helpers to `authenticated`.
--
-- Migration 20260718071922 revoked EXECUTE on these SECURITY DEFINER helpers from
-- PUBLIC/anon/authenticated and only restored service_role. But:
--   * _shared/require-role.ts and ga4-cta-stats call these as the authenticated user
--     (anon key + user JWT), so every role-gated edge function returned 403 to real
--     admins ("permission denied for function ...").
--   * RLS policies on user_roles, site_content, custom_pages, leads, industries,
--     features, nav_items, etc. call has_role/has_any_role in their USING/WITH CHECK
--     clauses. EXECUTE on functions referenced in a policy is checked against the
--     querying role, so the revoke risked breaking those reads/writes for every
--     authenticated session.
--
-- The helpers are SECURITY DEFINER + STABLE + pinned search_path and only read
-- user_roles for the supplied user id, so granting EXECUTE to `authenticated` is safe.
-- `anon` is intentionally NOT re-granted — no anon RLS policy references these
-- functions (see migration 20260718074552).
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, public.app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
