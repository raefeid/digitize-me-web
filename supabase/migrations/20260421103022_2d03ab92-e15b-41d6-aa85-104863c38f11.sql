-- =========================================================
-- custom_pages: author-built pages with a JSON block array
-- =========================================================
CREATE TABLE public.custom_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  title_ar text,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  blocks_ar jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at timestamptz,
  seo_title text,
  seo_title_ar text,
  seo_description text,
  seo_description_ar text,
  seo_og_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published custom pages"
ON public.custom_pages FOR SELECT
USING (status = 'published'
       OR has_any_role(auth.uid(), ARRAY['admin'::app_role,'editor'::app_role,'seo_manager'::app_role]));

CREATE POLICY "Editors can insert custom pages"
ON public.custom_pages FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role,'editor'::app_role,'seo_manager'::app_role]));

CREATE POLICY "Editors can update custom pages"
ON public.custom_pages FOR UPDATE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role,'editor'::app_role,'seo_manager'::app_role]));

CREATE POLICY "Admins can delete custom pages"
ON public.custom_pages FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_custom_pages_updated
BEFORE UPDATE ON public.custom_pages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_custom_pages_slug ON public.custom_pages(slug);
CREATE INDEX idx_custom_pages_status ON public.custom_pages(status);

-- =========================================================
-- nav_items: navbar + footer menu structure
-- =========================================================
CREATE TABLE public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.nav_items(id) ON DELETE CASCADE,
  location text NOT NULL DEFAULT 'navbar' CHECK (location IN ('navbar','footer')),
  footer_column text,
  label text NOT NULL,
  label_ar text,
  target_type text NOT NULL DEFAULT 'route' CHECK (target_type IN ('route','custom_page','external')),
  target_route text,
  custom_page_id uuid REFERENCES public.custom_pages(id) ON DELETE SET NULL,
  external_url text,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view nav items"
ON public.nav_items FOR SELECT USING (true);

CREATE POLICY "Editors can insert nav items"
ON public.nav_items FOR INSERT TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role,'editor'::app_role,'seo_manager'::app_role]));

CREATE POLICY "Editors can update nav items"
ON public.nav_items FOR UPDATE TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role,'editor'::app_role,'seo_manager'::app_role]));

CREATE POLICY "Admins can delete nav items"
ON public.nav_items FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_nav_items_updated
BEFORE UPDATE ON public.nav_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_nav_items_location ON public.nav_items(location, sort_order);
CREATE INDEX idx_nav_items_parent ON public.nav_items(parent_id);