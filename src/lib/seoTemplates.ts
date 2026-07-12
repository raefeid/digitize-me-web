/**
 * SEO Template engine — interpolates {tokens} into title/description/keywords
 * strings using context derived from an industry or feature row.
 *
 * Why this exists:
 *   - Manually writing SEO for every new industry/feature page is repetitive
 *     and error-prone. Templates give admins consistent, brand-aligned defaults
 *     (e.g. "OCR for {name} in {location} | {brand}") that can be auto-applied
 *     on page creation and regenerated on demand from the SEO editor.
 *
 * Storage: templates live in site_content (page="seo", section="templates")
 * keyed by `<kind>_<field>_<lang>` — e.g. `industry_meta_title_en`. Defaults
 * defined here are used when the admin hasn't customized a template yet.
 */

export type TemplateKind = "industry" | "feature";
export type TemplateField = "meta_title" | "meta_description" | "meta_keywords";
export type TemplateLang = "en" | "ar";

export type SeoTemplate = {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
};

export type SeoTemplateSet = Record<TemplateLang, SeoTemplate>;

/**
 * Default templates shipped with the build. These render the moment a new
 * industry or feature is created if the admin hasn't customized them yet.
 *
 * Tokens supported:
 *   {name}              — industry/feature display name
 *   {slug}              — URL slug
 *   {hero_title}        — hero headline (features only — falls back to {name})
 *   {hero_desc}         — hero subtitle (features only)
 *   {brand}             — global brand name
 *   {tagline}           — global tagline
 *   {year}              — current 4-digit year
 *   {primary_keyword}   — first keyword from the page's keyword list
 *   {industry_keywords} — comma-separated keyword list
 *   {location}          — geo target (UAE / Dubai etc.)
 */
export const DEFAULT_TEMPLATES: Record<TemplateKind, SeoTemplateSet> = {
  industry: {
    en: {
      meta_title: "OCR & Document Management for {name} in {location} | {brand}",
      meta_description:
        "Bilingual Arabic-English OCR and document automation built for {name} businesses in {location}. {tagline}",
      meta_keywords: "{primary_keyword}, OCR for {name}, document management {location}, {industry_keywords}",
    },
    ar: {
      meta_title: "حلول OCR وإدارة المستندات لقطاع {name} في {location} | {brand}",
      meta_description:
        "حلول OCR ثنائية اللغة (عربي-إنجليزي) وأتمتة المستندات لشركات {name} في {location}. {tagline}",
      meta_keywords: "{primary_keyword}, OCR لـ {name}, إدارة المستندات {location}, {industry_keywords}",
    },
  },
  feature: {
    en: {
      meta_title: "{hero_title} | {brand}",
      meta_description:
        "{hero_desc} Built for teams in {location} who need bilingual Arabic-English document automation.",
      meta_keywords: "{primary_keyword}, {slug}, {industry_keywords}",
    },
    ar: {
      meta_title: "{hero_title} | {brand}",
      meta_description:
        "{hero_desc} مصمّم للفرق في {location} التي تحتاج إلى أتمتة المستندات ثنائية اللغة.",
      meta_keywords: "{primary_keyword}, {slug}, {industry_keywords}",
    },
  },
};

/**
 * Context bag passed to the interpolator. All fields optional — missing tokens
 * are stripped (along with any leading ", " or " | " punctuation that becomes
 * orphaned) so the rendered output stays clean.
 */
export type TemplateContext = {
  name?: string;
  slug?: string;
  hero_title?: string;
  hero_desc?: string;
  brand?: string;
  tagline?: string;
  year?: string;
  primary_keyword?: string;
  industry_keywords?: string;
  location?: string;
};

const TOKEN_RE = /\{([a-z_]+)\}/g;

/**
 * Interpolate {tokens} in a template string using the provided context.
 * Empty/missing tokens are removed and orphaned punctuation cleaned up so
 * "OCR for {name} in {location}" with no location becomes "OCR for Healthcare".
 */
export const renderTemplate = (template: string, ctx: TemplateContext): string => {
  if (!template) return "";

  let out = template.replace(TOKEN_RE, (_, key: string) => {
    const v = ctx[key as keyof TemplateContext];
    return v ? String(v).trim() : "";
  });

  // Clean up artifacts left behind by missing tokens
  out = out
    // Empty parens / brackets
    .replace(/\(\s*\)/g, "")
    .replace(/\[\s*\]/g, "")
    // Orphaned " in " / " for " / " | " at boundaries
    .replace(/\s+(in|for|by)\s+(?=[|·•\-,]|$)/gi, " ")
    .replace(/\s*\|\s*\|\s*/g, " | ")
    .replace(/^\s*[|·•\-,]\s*/, "")
    .replace(/\s*[|·•\-,]\s*$/, "")
    // Collapse repeated separators / whitespace
    .replace(/,\s*,+/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();

  return out;
};

/**
 * Render an entire template set (title + description + keywords) for the
 * given language. Convenience wrapper around `renderTemplate`.
 */
export const renderTemplateSet = (
  set: SeoTemplate,
  ctx: TemplateContext,
): SeoTemplate => ({
  meta_title: renderTemplate(set.meta_title, ctx),
  meta_description: renderTemplate(set.meta_description, ctx),
  meta_keywords: renderTemplate(set.meta_keywords, ctx),
});

/** Build a token list (for the editor's "available tokens" hint). */
export const ALL_TOKENS: { token: string; description: string }[] = [
  { token: "{name}", description: "Industry/feature display name" },
  { token: "{slug}", description: "URL slug (kebab-case)" },
  { token: "{hero_title}", description: "Hero headline (features only)" },
  { token: "{hero_desc}", description: "Hero subtitle (features only)" },
  { token: "{brand}", description: "Global brand name from Branding settings" },
  { token: "{tagline}", description: "Global brand tagline" },
  { token: "{year}", description: "Current 4-digit year" },
  { token: "{primary_keyword}", description: "First keyword from the page's keyword list" },
  { token: "{industry_keywords}", description: "Full comma-separated keyword list" },
  { token: "{location}", description: "Geo target (UAE, Dubai, etc.)" },
];
