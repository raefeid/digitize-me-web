ALTER TABLE public.site_content DROP CONSTRAINT IF EXISTS site_content_content_type_check;

ALTER TABLE public.site_content
ADD CONSTRAINT site_content_content_type_check
CHECK (
  content_type IN (
    'text',
    'html',
    'image_url',
    'json',
    'pricing_plan',
    'promotion',
    'industry_card',
    'industry_order',
    'plan_order'
  )
);