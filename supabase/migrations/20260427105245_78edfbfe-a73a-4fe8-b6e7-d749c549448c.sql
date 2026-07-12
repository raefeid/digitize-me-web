
-- 1. Add customer role to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';

-- 2. Update handle_new_user to also assign customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''))
  ON CONFLICT (id) DO NOTHING;

  -- Tag every new auth user as a customer (team members will get
  -- additional roles via invited_team_members trigger).
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 3. Make sure on_auth_user_created trigger exists and fires both functions.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_admin();

DROP TRIGGER IF EXISTS on_auth_user_created_invite ON auth.users;
CREATE TRIGGER on_auth_user_created_invite
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.apply_invited_role();
