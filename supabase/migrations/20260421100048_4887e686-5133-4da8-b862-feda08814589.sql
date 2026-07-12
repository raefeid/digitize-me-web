UPDATE public.site_content SET value = REPLACE(value, ' — ', ' - ') WHERE value LIKE '%—%';
UPDATE public.site_content SET value_ar = REPLACE(value_ar, ' — ', ' - ') WHERE value_ar LIKE '%—%';
UPDATE public.site_content SET value_fr = REPLACE(value_fr, ' — ', ' - ') WHERE value_fr LIKE '%—%';