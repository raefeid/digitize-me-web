import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBrandingAsset } from "@/hooks/useBranding";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
  DEFAULT_TEMPLATES,
  renderTemplateSet,
  type SeoTemplateSet,
  type TemplateKind,
  type TemplateContext,
  type SeoTemplate,
} from "@/lib/seoTemplates";

/**
 * SEO templates are stored as site_content rows:
 *   page="seo", section="templates"
 *   content_key=<kind>_<field>     e.g. "industry_meta_title"
 *   value=EN template, value_ar=AR template
 *
 * If no row exists for a given (kind, field), the bundled DEFAULT_TEMPLATES
 * value is used. This means new installs get sensible defaults out of the
 * box without seeding data.
 */

const FIELDS = ["meta_title", "meta_description", "meta_keywords"] as const;
const KINDS: TemplateKind[] = ["industry", "feature"];

export type TemplatesByKind = Record<TemplateKind, SeoTemplateSet>;

/** Hook: load all templates (industry + feature) merged with defaults. */
export const useSeoTemplates = () =>
  useQuery({
    queryKey: ["seo-templates"],
    queryFn: async (): Promise<TemplatesByKind> => {
      const { data, error } = await supabase
        .from("site_content")
        .select("content_key, value, value_ar")
        .eq("page", "seo")
        .eq("section", "templates");
      if (error) throw error;

      // Start from defaults, then overlay any saved overrides
      const out: TemplatesByKind = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES));
      for (const row of data ?? []) {
        const [kind, ...rest] = row.content_key.split("_");
        const field = rest.join("_") as (typeof FIELDS)[number];
        if (!KINDS.includes(kind as TemplateKind) || !FIELDS.includes(field)) continue;
        if (row.value) out[kind as TemplateKind].en[field] = row.value;
        if (row.value_ar) out[kind as TemplateKind].ar[field] = row.value_ar;
      }
      return out;
    },
  });

/** Hook: save one (kind, field) template — both EN and AR values at once. */
export const useSaveSeoTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      kind: TemplateKind;
      field: (typeof FIELDS)[number];
      en: string;
      ar: string;
    }) => {
      const contentKey = `${input.kind}_${input.field}`;
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("page", "seo")
        .eq("section", "templates")
        .eq("content_key", contentKey)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_content")
          .update({ value: input.en, value_ar: input.ar || null, content_type: "text" })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_content").insert({
          page: "seo",
          section: "templates",
          content_key: contentKey,
          value: input.en,
          value_ar: input.ar || null,
          content_type: "text",
          sort_order: 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seo-templates"] });
      qc.invalidateQueries({ queryKey: ["site-content"] });
      qc.invalidateQueries({ queryKey: ["site-content-all"] });
    },
  });
};

/**
 * Hook: build a TemplateContext from global branding/site content. The caller
 * provides per-page tokens (name, slug, hero_*) and this layers in the
 * brand/tagline/year/location defaults from the CMS.
 */
export const useTemplateGlobals = (): Pick<
  TemplateContext,
  "brand" | "tagline" | "year" | "location"
> => {
  const brand = useBrandingAsset("brand_name", "Digitize me");
  const { items: globals } = useSiteContent("seo", "global");
  const taglineRow = globals.find((g) => g.content_key === "site_tagline");
  const locationRow = globals.find((g) => g.content_key === "default_location");
  return {
    brand,
    tagline: taglineRow?.value || "Bilingual document automation built for the Middle East.",
    year: String(new Date().getFullYear()),
    location: locationRow?.value || "UAE",
  };
};

/**
 * Pure helper — render a (kind, lang) template set with the supplied context.
 * Exposed so call sites that already have the templates object cached (e.g.
 * the editor) can render without re-querying.
 */
export const applySeoTemplate = (
  templates: TemplatesByKind,
  kind: TemplateKind,
  lang: "en" | "ar",
  ctx: TemplateContext,
): SeoTemplate => renderTemplateSet(templates[kind][lang], ctx);
