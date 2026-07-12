ALTER TABLE public.auth_pages
  ADD COLUMN IF NOT EXISTS illustration_url text,
  ADD COLUMN IF NOT EXISTS illustration_alignment text NOT NULL DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS illustration_max_width integer NOT NULL DEFAULT 420,
  ADD COLUMN IF NOT EXISTS pattern_overlay text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS pattern_overlay_opacity numeric NOT NULL DEFAULT 0.15,
  ADD COLUMN IF NOT EXISTS logo_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS logo_position text NOT NULL DEFAULT 'top-left',
  ADD COLUMN IF NOT EXISTS submit_size text NOT NULL DEFAULT 'md',
  ADD COLUMN IF NOT EXISTS submit_radius text NOT NULL DEFAULT 'md',
  ADD COLUMN IF NOT EXISTS submit_full_width boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS submit_hover_bg_color text,
  ADD COLUMN IF NOT EXISTS submit_shadow text NOT NULL DEFAULT 'none';

-- Defensive value constraints via CHECKs (immutable comparisons, safe to add).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_pages_illustration_alignment_check') THEN
    ALTER TABLE public.auth_pages
      ADD CONSTRAINT auth_pages_illustration_alignment_check
      CHECK (illustration_alignment IN ('top','center','bottom'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_pages_pattern_overlay_check') THEN
    ALTER TABLE public.auth_pages
      ADD CONSTRAINT auth_pages_pattern_overlay_check
      CHECK (pattern_overlay IN ('none','dots','grid','waves','noise'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_pages_logo_position_check') THEN
    ALTER TABLE public.auth_pages
      ADD CONSTRAINT auth_pages_logo_position_check
      CHECK (logo_position IN ('top-left','top-center','above-headline'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_pages_submit_size_check') THEN
    ALTER TABLE public.auth_pages
      ADD CONSTRAINT auth_pages_submit_size_check
      CHECK (submit_size IN ('sm','md','lg'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_pages_submit_radius_check') THEN
    ALTER TABLE public.auth_pages
      ADD CONSTRAINT auth_pages_submit_radius_check
      CHECK (submit_radius IN ('none','md','full'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_pages_submit_shadow_check') THEN
    ALTER TABLE public.auth_pages
      ADD CONSTRAINT auth_pages_submit_shadow_check
      CHECK (submit_shadow IN ('none','sm','md','lg','glow'));
  END IF;
END $$;