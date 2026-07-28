/**
 * JSON-LD structured data builders.
 *
 * Used by SEOHead to automatically emit rich-result schemas (Organization,
 * WebSite, BreadcrumbList, Product/Service, FAQPage, Article) without any
 * per-page boilerplate. Pages can pass extras via props; FAQ entries can also
 * be stored in site_content (section="seo", key="faq_json" → JSON array).
 *
 * All builders are language-aware: pass `lang: "ar"` to emit localized
 * Organization names and breadcrumb labels.
 */

const SITE_NAME_EN = "Digitize me";
const SITE_NAME_AR = "ديجيتايز مي";
const ORG_LEGAL_EN = "Digitize me";
const ORG_LEGAL_AR = "ديجيتايز مي";

export type Lang = "en" | "ar";

export type FaqItem = { question: string; answer: string };

const pickName = (lang: Lang) => (lang === "ar" ? SITE_NAME_AR : SITE_NAME_EN);
const pickLegal = (lang: Lang) => (lang === "ar" ? ORG_LEGAL_AR : ORG_LEGAL_EN);

export const buildOrganization = (baseUrl: string, logoUrl?: string, lang: Lang = "en") => ({
  "@type": "Organization",
  "@id": `${baseUrl}/#organization`,
  name: pickLegal(lang),
  alternateName: lang === "ar" ? SITE_NAME_EN : SITE_NAME_AR,
  url: baseUrl,
  logo: logoUrl || `${baseUrl}/og-image.jpg`,
  image: logoUrl || `${baseUrl}/og-image.jpg`,
  sameAs: [
    "https://www.linkedin.com/company/digitizeme",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    areaServed: "AE",
    availableLanguage: ["en", "ar"],
  },
});

export const buildWebSite = (baseUrl: string, lang: Lang = "en") => ({
  "@type": "WebSite",
  "@id": `${baseUrl}/#website`,
  url: baseUrl,
  name: pickName(lang),
  publisher: { "@id": `${baseUrl}/#organization` },
  inLanguage: ["en", "ar"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});

export const buildWebPage = (
  baseUrl: string,
  path: string,
  title: string,
  description: string,
  inLanguage: string,
  image?: string,
) => ({
  "@type": "WebPage",
  "@id": `${baseUrl}${path}#webpage`,
  url: `${baseUrl}${path}`,
  name: title,
  description,
  isPartOf: { "@id": `${baseUrl}/#website` },
  inLanguage,
  primaryImageOfPage: image,
});

/**
 * Localized breadcrumb labels for known route segments.
 * Falls back to a Title-Cased version of the slug when not in the dictionary.
 */
const BREADCRUMB_LABELS: Record<string, { en: string; ar: string }> = {
  home: { en: "Home", ar: "الرئيسية" },
  product: { en: "Product", ar: "المنتج" },
  pricing: { en: "Pricing", ar: "الأسعار" },
  industries: { en: "Industries", ar: "القطاعات" },
  contact: { en: "Contact", ar: "اتصل بنا" },
  about: { en: "About", ar: "من نحن" },
  features: { en: "Features", ar: "المميزات" },
  blog: { en: "Blog", ar: "المدونة" },
  privacy: { en: "Privacy", ar: "الخصوصية" },
  terms: { en: "Terms", ar: "الشروط" },
};

const labelFor = (segment: string, lang: Lang): string => {
  const dict = BREADCRUMB_LABELS[segment.toLowerCase()];
  if (dict) return dict[lang];
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

/** Build a BreadcrumbList from a path like /industries/legal */
export const buildBreadcrumbs = (baseUrl: string, path: string, lang: Lang = "en") => {
  // Strip the /ar prefix when computing breadcrumb URLs and segments,
  // then re-apply it for the URLs so the breadcrumb chain stays in-language.
  const isArabic = lang === "ar";
  const stripped = path.replace(/^\/ar(?=\/|$)/, "") || "/";
  if (stripped === "/" || stripped === "") return null;

  const segments = stripped.replace(/^\//, "").split("/").filter(Boolean);
  const homeUrl = `${baseUrl}${isArabic ? "/ar" : "/"}`;
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: labelFor("home", lang),
      item: homeUrl,
    },
    ...segments.map((seg, i) => {
      const subPath = `/${segments.slice(0, i + 1).join("/")}`;
      const localizedUrl = `${baseUrl}${isArabic ? `/ar${subPath}` : subPath}`;
      return {
        "@type": "ListItem",
        position: i + 2,
        name: labelFor(seg, lang),
        item: localizedUrl,
      };
    }),
  ];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
};

export const buildFaqPage = (faqs: FaqItem[]) => {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
};

export type ProductSchemaInput = {
  name: string;
  description: string;
  image?: string;
  offers?: Array<{ name: string; price: string; priceCurrency: string }>;
};

export const buildProduct = (baseUrl: string, p: ProductSchemaInput, lang: Lang = "en") => ({
  "@type": "Product",
  name: p.name,
  description: p.description,
  image: p.image || `${baseUrl}/og-image.jpg`,
  brand: { "@type": "Brand", name: pickName(lang) },
  ...(p.offers && p.offers.length > 0
    ? {
        offers: p.offers.map((o) => ({
          "@type": "Offer",
          name: o.name,
          price: o.price,
          priceCurrency: o.priceCurrency,
          availability: "https://schema.org/InStock",
          url: `${baseUrl}${lang === "ar" ? "/ar" : ""}/pricing`,
        })),
      }
    : {}),
});

/**
 * Service schema — for B2B SaaS pages where the offering is a service rather
 * than a packaged product. Used on home, /product, /industries and industry
 * detail pages where appropriate.
 */
export type ServiceSchemaInput = {
  name: string;
  description: string;
  serviceType?: string;
  areaServed?: string | string[];
  image?: string;
};

export const buildService = (baseUrl: string, s: ServiceSchemaInput, lang: Lang = "en") => ({
  "@type": "Service",
  name: s.name,
  description: s.description,
  serviceType: s.serviceType ?? "AI Document Management",
  provider: { "@id": `${baseUrl}/#organization` },
  brand: { "@type": "Brand", name: pickName(lang) },
  areaServed: s.areaServed ?? ["AE", "SA", "KW", "QA", "OM", "BH"],
  availableLanguage: ["en", "ar"],
  image: s.image || `${baseUrl}/og-image.jpg`,
  url: `${baseUrl}${lang === "ar" ? "/ar" : ""}/`,
});

export type ArticleSchemaInput = {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  url: string;
};

export const buildArticle = (baseUrl: string, a: ArticleSchemaInput, lang: Lang = "en") => ({
  "@type": "Article",
  headline: a.headline,
  description: a.description,
  image: a.image || `${baseUrl}/og-image.jpg`,
  datePublished: a.datePublished,
  dateModified: a.dateModified || a.datePublished,
  author: { "@type": "Person", name: a.author || pickName(lang) },
  publisher: { "@id": `${baseUrl}/#organization` },
  mainEntityOfPage: a.url,
});

export type BuildGraphArgs = {
  baseUrl: string;
  path: string;
  title: string;
  description: string;
  logoUrl?: string;
  lang?: Lang;
  faqs?: FaqItem[];
  product?: ProductSchemaInput;
  service?: ServiceSchemaInput;
  article?: ArticleSchemaInput;
  /** When provided, replaces the auto-generated WebPage block */
  extraEntities?: Array<Record<string, unknown>>;
};

/**
 * Build a complete @graph document combining all relevant schemas for the
 * current page. Always includes Organization + WebSite + WebPage. Adds
 * BreadcrumbList for sub-pages and any opt-in entities (FAQ/Product/Service/Article).
 */
export const buildJsonLdGraph = (args: BuildGraphArgs) => {
  const {
    baseUrl,
    path,
    title,
    description,
    logoUrl,
    lang = "en",
    faqs,
    product,
    service,
    article,
    extraEntities,
  } = args;

  const graph: Array<Record<string, unknown>> = [
    buildOrganization(baseUrl, logoUrl, lang),
    buildWebSite(baseUrl, lang),
    buildWebPage(baseUrl, path, title, description, lang, logoUrl),
  ];

  const breadcrumbs = buildBreadcrumbs(baseUrl, path, lang);
  if (breadcrumbs) graph.push(breadcrumbs);

  const faq = buildFaqPage(faqs ?? []);
  if (faq) graph.push(faq);

  if (product) graph.push(buildProduct(baseUrl, product, lang));
  if (service) graph.push(buildService(baseUrl, service, lang));
  if (article) graph.push(buildArticle(baseUrl, article, lang));
  if (extraEntities) graph.push(...extraEntities);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};

/** Safely parse a stringified FAQ array stored in site_content */
export const parseFaqsFromCms = (raw: string | null | undefined): FaqItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === "object" && x.question && x.answer)
      .map((x) => ({ question: String(x.question), answer: String(x.answer) }));
  } catch {
    return [];
  }
};

/**
 * Returns a default Service schema for pages that should advertise the SaaS
 * as a service (home, /product, /industries, industry detail). Returns null
 * for pages where Service is not the right primitive (pricing → Product,
 * blog → Article, legal pages → none).
 */
export const defaultServiceForPage = (
  pageKey: string,
  lang: Lang,
): ServiceSchemaInput | null => {
  const SERVICE_PAGES = new Set(["home", "product", "industries", "features"]);
  if (!SERVICE_PAGES.has(pageKey)) return null;

  if (lang === "ar") {
    return {
      name: "Digitize me — منصة إدارة المستندات بالذكاء الاصطناعي",
      description:
        "منصة سحابية وعلى الخوادم لإدارة المستندات مع OCR للعربية والإنجليزية بدقة 99%+، وأتمتة بالذكاء الاصطناعي، وأمان على مستوى المؤسسات.",
      serviceType: "AI Document Management",
    };
  }
  return {
    name: "Digitize me — AI Document Management Platform",
    description:
      "Cloud and on-premise document management with bilingual Arabic/English OCR (99%+ accuracy), AI-powered automation and enterprise-grade security.",
    serviceType: "AI Document Management",
  };
};
