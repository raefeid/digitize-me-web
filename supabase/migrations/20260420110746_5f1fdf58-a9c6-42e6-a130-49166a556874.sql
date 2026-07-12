-- Super-admin check (hardcoded email)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id
      AND lower(email) = 'marketing@infasme.com'
  )
$$;

-- Convenience: any of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Invited team members table
CREATE TABLE IF NOT EXISTS public.invited_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role public.app_role NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  accepted_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.invited_team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin can view invites" ON public.invited_team_members;
DROP POLICY IF EXISTS "Super admin can insert invites" ON public.invited_team_members;
DROP POLICY IF EXISTS "Super admin can update invites" ON public.invited_team_members;
DROP POLICY IF EXISTS "Super admin can delete invites" ON public.invited_team_members;

CREATE POLICY "Super admin can view invites"
  ON public.invited_team_members FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admin can insert invites"
  ON public.invited_team_members FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admin can update invites"
  ON public.invited_team_members FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admin can delete invites"
  ON public.invited_team_members FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Auto-apply role when invited user signs up
CREATE OR REPLACE FUNCTION public.apply_invited_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_row public.invited_team_members%ROWTYPE;
BEGIN
  SELECT * INTO invite_row
  FROM public.invited_team_members
  WHERE lower(email) = lower(NEW.email)
    AND accepted_at IS NULL
  LIMIT 1;

  IF FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, invite_row.role)
    ON CONFLICT (user_id, role) DO NOTHING;

    UPDATE public.invited_team_members
    SET accepted_at = now(),
        accepted_user_id = NEW.id
    WHERE id = invite_row.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS apply_invited_role_trigger ON auth.users;
CREATE TRIGGER apply_invited_role_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.apply_invited_role();

-- Ensure unique constraint on (user_id, role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $$;

-- Super admin can manage user_roles
DROP POLICY IF EXISTS "Super admin can manage user roles" ON public.user_roles;
CREATE POLICY "Super admin can manage user roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- blog_posts: admin or blog_author can manage
DROP POLICY IF EXISTS "Authors and admins can manage posts" ON public.blog_posts;
CREATE POLICY "Authors and admins can manage posts"
  ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','blog_author']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','blog_author']::public.app_role[]));

-- site_content: admin/editor/seo_manager can write; only admin can delete
DROP POLICY IF EXISTS "Admins can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can update site content" ON public.site_content;
DROP POLICY IF EXISTS "Admins can delete site content" ON public.site_content;
DROP POLICY IF EXISTS "Editors can insert site content" ON public.site_content;
DROP POLICY IF EXISTS "Editors can update site content" ON public.site_content;

CREATE POLICY "Editors can insert site content"
  ON public.site_content FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','editor','seo_manager']::public.app_role[]));
CREATE POLICY "Editors can update site content"
  ON public.site_content FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','editor','seo_manager']::public.app_role[]));
CREATE POLICY "Admins can delete site content"
  ON public.site_content FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
