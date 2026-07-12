-- Editable content for sign in / sign up pages
CREATE TABLE public.auth_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE CHECK (page_key IN ('signin','signup')),

  -- Form panel (right side) text — bilingual
  title text NOT NULL DEFAULT '',
  title_ar text,
  subtitle text,
  subtitle_ar text,
  email_label text,
  email_label_ar text,
  email_placeholder text,
  email_placeholder_ar text,
  password_label text,
  password_label_ar text,
  password_placeholder text,
  password_placeholder_ar text,
  full_name_label text,
  full_name_label_ar text,
  full_name_placeholder text,
  full_name_placeholder_ar text,
  forgot_link_label text,
  forgot_link_label_ar text,
  terms_text text,
  terms_text_ar text,
  divider_text text,
  divider_text_ar text,

  -- Footer (e.g. "Don't have an account? Create one")
  footer_prefix text,
  footer_prefix_ar text,
  footer_link_label text,
  footer_link_label_ar text,
  footer_link_url text,

  -- Submit button
  submit_label text NOT NULL DEFAULT 'Submit',
  submit_label_ar text,
  submit_loading_label text,
  submit_loading_label_ar text,
  submit_bg_color text,
  submit_text_color text,
  submit_variant text NOT NULL DEFAULT 'accent',

  -- Google button
  google_enabled boolean NOT NULL DEFAULT true,
  google_label text,
  google_label_ar text,

  -- Feature toggles
  forgot_link_enabled boolean NOT NULL DEFAULT true,
  footer_link_enabled boolean NOT NULL DEFAULT true,
  show_terms_checkbox boolean NOT NULL DEFAULT true,
  show_brand_panel boolean NOT NULL DEFAULT true,

  -- Brand panel (left side) — bilingual
  brand_badge text,
  brand_badge_ar text,
  brand_headline text,
  brand_headline_ar text,
  brand_benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  brand_benefits_ar jsonb NOT NULL DEFAULT '[]'::jsonb,
  brand_footer_text text,
  brand_footer_text_ar text,

  -- Brand panel background — image OR gradient
  background_image_url text,
  background_gradient_from text,
  background_gradient_to text,
  background_overlay_opacity numeric NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.auth_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view auth pages"
  ON public.auth_pages FOR SELECT TO public USING (true);

CREATE POLICY "Editors can insert auth pages"
  ON public.auth_pages FOR INSERT TO authenticated
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role,'editor'::app_role,'seo_manager'::app_role]));

CREATE POLICY "Editors can update auth pages"
  ON public.auth_pages FOR UPDATE TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role,'editor'::app_role,'seo_manager'::app_role]));

CREATE POLICY "Admins can delete auth pages"
  ON public.auth_pages FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER auth_pages_set_updated_at
  BEFORE UPDATE ON public.auth_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed both pages with current defaults so the UI renders identically out of the box
INSERT INTO public.auth_pages (
  page_key, title, title_ar, subtitle, subtitle_ar,
  email_label, email_label_ar, email_placeholder, email_placeholder_ar,
  password_label, password_label_ar, password_placeholder, password_placeholder_ar,
  forgot_link_label, forgot_link_label_ar,
  divider_text, divider_text_ar,
  footer_prefix, footer_prefix_ar, footer_link_label, footer_link_label_ar, footer_link_url,
  submit_label, submit_label_ar, submit_loading_label, submit_loading_label_ar,
  google_label, google_label_ar,
  brand_badge, brand_badge_ar, brand_headline, brand_headline_ar,
  brand_benefits, brand_benefits_ar,
  brand_footer_text, brand_footer_text_ar,
  background_gradient_from, background_gradient_to
) VALUES (
  'signin', 'Welcome back', 'مرحبًا بعودتك',
  'Log in to continue to your workspace.', 'سجّل الدخول للمتابعة إلى مساحة العمل.',
  'Email', 'البريد الإلكتروني', 'you@company.com', 'you@company.com',
  'Password', 'كلمة المرور', '••••••••', '••••••••',
  'Forgot password?', 'نسيت كلمة المرور؟',
  'or', 'أو',
  'Don''t have an account?', 'ليس لديك حساب؟', 'Create one', 'أنشئ حسابك', '/signup',
  'Log in', 'تسجيل الدخول', 'Logging in…', 'جارٍ الدخول…',
  'Continue with Google', 'المتابعة بحساب Google',
  'AI-powered document intelligence', 'ذكاء مستندات مدعوم بالذكاء الاصطناعي',
  'Turn every document into searchable, structured data.', 'حوّل كل مستند إلى بيانات قابلة للبحث ومنظمة.',
  '[
    {"icon":"Zap","title":"Lightning-fast OCR","desc":"Process Arabic & English documents in seconds with AI accuracy."},
    {"icon":"Globe2","title":"Bilingual by design","desc":"Built for the Middle East — full RTL support, native Arabic search."},
    {"icon":"ShieldCheck","title":"Enterprise-grade security","desc":"Your documents stay encrypted at rest and in transit."}
  ]'::jsonb,
  '[
    {"icon":"Zap","title":"تعرّف نصوص فائق السرعة","desc":"عالج المستندات العربية والإنجليزية في ثوانٍ بدقة الذكاء الاصطناعي."},
    {"icon":"Globe2","title":"ثنائية اللغة بالتصميم","desc":"مصممة للشرق الأوسط — دعم كامل للكتابة من اليمين لليسار وبحث عربي أصلي."},
    {"icon":"ShieldCheck","title":"أمان على مستوى المؤسسات","desc":"تبقى مستنداتك مشفرة عند التخزين والنقل."}
  ]'::jsonb,
  '© Digitize me. All rights reserved.', '© Digitize me. جميع الحقوق محفوظة.',
  'hsl(var(--primary))', 'hsl(var(--accent))'
);

INSERT INTO public.auth_pages (
  page_key, title, title_ar, subtitle, subtitle_ar,
  email_label, email_label_ar, email_placeholder, email_placeholder_ar,
  password_label, password_label_ar, password_placeholder, password_placeholder_ar,
  full_name_label, full_name_label_ar, full_name_placeholder, full_name_placeholder_ar,
  divider_text, divider_text_ar,
  footer_prefix, footer_prefix_ar, footer_link_label, footer_link_label_ar, footer_link_url,
  submit_label, submit_label_ar, submit_loading_label, submit_loading_label_ar,
  google_label, google_label_ar,
  terms_text, terms_text_ar,
  brand_badge, brand_badge_ar, brand_headline, brand_headline_ar,
  brand_benefits, brand_benefits_ar,
  brand_footer_text, brand_footer_text_ar,
  background_gradient_from, background_gradient_to
) VALUES (
  'signup', 'Create your account', 'أنشئ حسابك',
  'Start organizing documents with AI in minutes.', 'ابدأ تنظيم مستنداتك بالذكاء الاصطناعي في دقائق.',
  'Work email', 'البريد الإلكتروني للعمل', 'you@company.com', 'you@company.com',
  'Password', 'كلمة المرور', '••••••••', '••••••••',
  'Full name', 'الاسم الكامل', 'Jane Doe', 'اسمك الكامل',
  'or', 'أو',
  'Already have an account?', 'لديك حساب بالفعل؟', 'Log in', 'تسجيل الدخول', '/signin',
  'Create account', 'إنشاء الحساب', 'Creating…', 'جارٍ الإنشاء…',
  'Sign up with Google', 'إنشاء حساب بـ Google',
  'I agree to the Terms of Service and Privacy Policy.', 'أوافق على شروط الخدمة وسياسة الخصوصية.',
  'Join 1,000+ teams already digitizing', 'انضم إلى أكثر من 1000 فريق يقومون بالرقمنة',
  'Turn every document into searchable, structured data.', 'حوّل كل مستند إلى بيانات قابلة للبحث ومنظمة.',
  '[
    {"icon":"Zap","title":"Lightning-fast OCR","desc":"Process Arabic & English documents in seconds with AI accuracy."},
    {"icon":"Globe2","title":"Bilingual by design","desc":"Built for the Middle East — full RTL support, native Arabic search."},
    {"icon":"ShieldCheck","title":"Enterprise-grade security","desc":"Your documents stay encrypted at rest and in transit."}
  ]'::jsonb,
  '[
    {"icon":"Zap","title":"تعرّف نصوص فائق السرعة","desc":"عالج المستندات العربية والإنجليزية في ثوانٍ بدقة الذكاء الاصطناعي."},
    {"icon":"Globe2","title":"ثنائية اللغة بالتصميم","desc":"مصممة للشرق الأوسط — دعم كامل للكتابة من اليمين لليسار وبحث عربي أصلي."},
    {"icon":"ShieldCheck","title":"أمان على مستوى المؤسسات","desc":"تبقى مستنداتك مشفرة عند التخزين والنقل."}
  ]'::jsonb,
  '© Digitize me. All rights reserved.', '© Digitize me. جميع الحقوق محفوظة.',
  'hsl(var(--primary))', 'hsl(var(--accent))'
);
