
CREATE TABLE public.nav_auth_buttons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  button_key text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT '',
  label_ar text,
  link text NOT NULL DEFAULT '/',
  variant text NOT NULL DEFAULT 'default',
  custom_bg_color text,
  custom_text_color text,
  visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_auth_buttons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view auth buttons"
  ON public.nav_auth_buttons FOR SELECT
  USING (true);

CREATE POLICY "Editors can insert auth buttons"
  ON public.nav_auth_buttons FOR INSERT
  TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Editors can update auth buttons"
  ON public.nav_auth_buttons FOR UPDATE
  TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'editor'::app_role, 'seo_manager'::app_role]));

CREATE POLICY "Admins can delete auth buttons"
  ON public.nav_auth_buttons FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER nav_auth_buttons_updated_at
  BEFORE UPDATE ON public.nav_auth_buttons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.nav_auth_buttons (button_key, label, label_ar, link, variant, sort_order, visible)
VALUES
  ('signin', 'Log in', 'تسجيل الدخول', '/signin', 'ghost', 1, true),
  ('signup', 'Sign up', 'إنشاء حساب', '/signup', 'default', 2, true);
