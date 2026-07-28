import { type ReactElement } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useBrandingAsset } from "@/hooks/useBranding";
import {
  buildJsonLdGraph,
  defaultServiceForPage,
  parseFaqsFromCms,
  type FaqItem,
  type ProductSchemaInput,
  type ServiceSchemaInput,
  type ArticleSchemaInput,
} from "@/lib/jsonLd";
import { getLanguageFromPath, localizeInternalPath, stripArabicPrefix } from "@/lib/localizedRoutes";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  titleAr?: string;
  descriptionAr?: string;
  type?: string;
  /**
   * Optional override or addition to the auto-generated JSON-LD.
   * - If an object with `@graph`, it fully replaces the auto-built graph.
   * - If a plain entity object, it's appended to the auto-built graph.
   * - Backwards compatible with old single-schema usage.
   */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Page-level FAQ entries — emitted as FAQPage schema */
  faqs?: FaqItem[];
  /** Page-level Product info — emitted as Product schema (e.g. /pricing) */
  product?: ProductSchemaInput;
  /** Page-level Service info — emitted as Service schema. Auto-filled for
   * SaaS pages (home, /product, /industries, /features) when
   * not explicitly provided. Pass `null` to suppress the auto-emission. */
  service?: ServiceSchemaInput | null;
  /** Page-level Article info — emitted as Article schema (e.g. blog posts) */
  article?: ArticleSchemaInput;
  /** Explicit robots directive override for templates that must stay indexable */
  robotsOverride?: string;
  /**
   * Page key used to look up CMS-managed SEO overrides
   * (site_content.section = "seo"). Defaults to the path's first segment
   * so existing pages work without changes.
   */
  pageKey?: string;
  /**
   * Override the auto-computed canonical URL. Use this on duplicate-content
   * variants (e.g. /solutions/:slug pointing back to the primary
   * /industries/:slug) to prevent keyword cannibalization. The value should
   * be an absolute URL.
   */
  canonicalOverride?: string;
}

/**
 * Maps a route path (/, /product, /pricing, ...) to a CMS page key used by
 * the SEO editor. The editor stores rows under the same `page` value.
 */
const pathToPageKey = (path: string): string => {
  if (path === "/" || path === "") return "home";
  const seg = path.replace(/^\//, "").split("/")[0];
  return seg || "home";
};

const SEOHead = ({ 
  title, description, path,
  titleAr, descriptionAr,
  type = "website", jsonLd, pageKey,
  faqs, product, service, article,
  robotsOverride,
  canonicalOverride,
}: SEOHeadProps): ReactElement => {
  const { lang } = useLanguage();
  const location = useLocation();
  const baseUrl = "https://www.digitizeme.ae";
  const routeLang = getLanguageFromPath(location.pathname);
  const routePath = stripArabicPrefix(path || location.pathname || "/");
  const localizedPath = localizeInternalPath(routePath, routeLang);
  const enUrl = `${baseUrl}${localizeInternalPath(routePath, "en")}`;
  const arUrl = `${baseUrl}${localizeInternalPath(routePath, "ar")}`;
  const canonical = canonicalOverride ?? `${baseUrl}${localizedPath}`;

  // CMS overrides (admins edit these in /admin → SEO)
  const cmsKey = pageKey ?? pathToPageKey(path);
  const { getContent, getImage } = useSiteContent(cmsKey, "seo");

  // Pick the right language fallback (existing prop behaviour)
  const activeLang = routeLang ?? lang;
  const propTitle = activeLang === "ar" && titleAr ? titleAr : title;
  const propDesc = activeLang === "ar" && descriptionAr ? descriptionAr : description;

  // CMS values override props when set; otherwise fall back to the page's defaults
  const displayTitle = getContent("meta_title", propTitle);
  const displayDesc = getContent("meta_description", propDesc);
  const keywords = getContent("meta_keywords", "");
  const ogTitle = getContent("og_title", displayTitle);
  const ogDesc = getContent("og_description", displayDesc);
  const ogLocale = activeLang === "ar" ? "ar_AE" : "en_AE";
  const ogLocaleAlt = activeLang === "ar" ? "en_AE" : "ar_AE";

  // Robots directives — admins can flip these per page from the SEO editor.
  // Defaults to "index, follow" when not explicitly set.
  const robotsIndex = getContent("robots_index", "true") !== "false";
  const robotsFollow = getContent("robots_follow", "true") !== "false";
  const robotsContent = robotsOverride ?? `${robotsIndex ? "index" : "noindex"}, ${robotsFollow ? "follow" : "nofollow"}`;

  // OG image resolution priority:
  //   1. Page-specific override (site_content: page=<page>, section=seo, key=og_image)
  //   2. Global branding default (site_content: page=branding, section=logos, key=og_image)
  //   3. Bundled fallback `/og-image.jpg` shipped with the build
  const brandingDefaultOg = useBrandingAsset("og_image", `${baseUrl}/og-image.jpg`);
  // Ensure absolute URL — Branding may store a relative public-bucket path or
  // an absolute https URL; normalize either way.
  const normalizeUrl = (u: string) =>
    u.startsWith("http") ? u : `${baseUrl}${u.startsWith("/") ? "" : "/"}${u}`;
  const ogImage = normalizeUrl(getImage("og_image", brandingDefaultOg));
  const cmsFaqs = parseFaqsFromCms(getContent("faq_json", ""));

  // Build JSON-LD: auto-graph by default. If a caller passes a full @graph
  // object, use it as-is (back-compat). If they pass a single entity, append it.
  const isFullGraph =
    jsonLd && !Array.isArray(jsonLd) && "@graph" in (jsonLd as object);
  const extraEntities = isFullGraph
    ? undefined
    : Array.isArray(jsonLd)
      ? (jsonLd as Record<string, unknown>[])
      : jsonLd
        ? [jsonLd as Record<string, unknown>]
        : undefined;

  // Auto-emit Service schema for SaaS pages unless caller explicitly opts out
  // (by passing `service={null}`) or already supplies one.
  const resolvedService =
    service === null
      ? undefined
      : service ?? defaultServiceForPage(cmsKey, activeLang) ?? undefined;

  const autoGraph = buildJsonLdGraph({
    baseUrl,
    path: localizedPath,
    title: displayTitle,
    description: displayDesc,
    logoUrl: ogImage,
    lang: activeLang,
    faqs: faqs && faqs.length > 0 ? faqs : cmsFaqs,
    product,
    service: resolvedService,
    article,
    extraEntities,
  });

  const finalJsonLd = isFullGraph ? jsonLd : autoGraph;

  return (
    <Helmet>
      <title>{displayTitle}</title>
      <meta name="description" content={displayDesc} />
      <meta name="robots" content={robotsContent} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDesc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Digitize me" />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={ogLocaleAlt} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogTitle} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@digitizeme" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDesc} />
      <meta name="twitter:image" content={ogImage} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="ar" href={arUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />
      <script type="application/ld+json">{JSON.stringify(finalJsonLd)}</script>
    </Helmet>
  );
};

export default SEOHead;
