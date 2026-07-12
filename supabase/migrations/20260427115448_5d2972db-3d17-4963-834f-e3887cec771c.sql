
ALTER TABLE public.nav_auth_buttons
  ADD COLUMN IF NOT EXISTS helper_caption text,
  ADD COLUMN IF NOT EXISTS helper_caption_ar text;
