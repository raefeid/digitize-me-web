-- Replace decorative tatweel + improve Arabic phrasing on three site_content rows
UPDATE public.site_content
SET value_ar = 'كفاية صرف على ١٢ أداة منفصلة'
WHERE page = 'home' AND section = 'allinone' AND content_key = 'aio_title';

UPDATE public.site_content
SET value_ar = 'احجز عرضًا توضيحيًا مخصصًا، وشاهد كيف تُحوّل منصة Digitize me سير عمل مستنداتك بالكامل.'
WHERE page = 'product' AND section = 'cta' AND content_key = 'product_cta_desc';

UPDATE public.site_content
SET value_ar = 'اكتشف محرك الذكاء الاصطناعي في Digitize me للتعرف الضوئي بدقة تتجاوز ٩٩٪ بالعربية والإنجليزية. تصنيف تلقائي وبحث وإدارة لملايين المستندات.'
WHERE page = 'product' AND section = 'seo' AND content_key = 'meta_description';

-- A few other small Arabic refinements (more natural, no tatweel)
UPDATE public.site_content
SET value_ar = 'الوصول إلى API'
WHERE page = 'integrations' AND section = 'api' AND content_key = 'cta_access' AND value_ar = 'اطلب صلاحية API';

UPDATE public.site_content
SET value_ar = 'تشفير شامل من الطرف إلى الطرف'
WHERE page = 'integrations' AND section = 'security' AND content_key = 'pillar1_title' AND value_ar = 'تشفير من الطرف للطرف';

UPDATE public.site_content
SET value_ar = 'صلاحيات دقيقة، تجديد دوري للرموز، ودعم SAML / Azure AD.'
WHERE page = 'integrations' AND section = 'security' AND content_key = 'pillar2_desc' AND value_ar = 'صلاحيات دقيقة وتدوير الرموز ودعم SAML / Azure AD.';

UPDATE public.site_content
SET value_ar = 'محمي محليًا'
WHERE page = 'home' AND section = 'features' AND content_key = 'feat_security_title' AND value_ar = 'مؤمّن محلياً';