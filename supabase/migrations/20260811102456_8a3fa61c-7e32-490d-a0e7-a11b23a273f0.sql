CREATE OR REPLACE FUNCTION public.apply_invited_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_row public.invited_team_members%ROWTYPE;
BEGIN
  -- Only accounts created through an actual Supabase invite link may pick up a
  -- staff role. Self-registered accounts that merely share the invited email
  -- address are ignored.
  IF NEW.invited_at IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO invite_row
  FROM public.invited_team_members
  WHERE lower(email) = lower(NEW.email)
    AND accepted_at IS NULL
    AND invited_at <= NEW.invited_at
  ORDER BY invited_at DESC
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
$function$;