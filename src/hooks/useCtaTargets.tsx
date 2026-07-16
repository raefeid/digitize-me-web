import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Per-CTA action stored in the CMS so admins can change where any button
 * goes without code edits.
 *
 * Storage shape (one row per CTA in `site_content`):
 *   page         = "cta_actions"
 *   section      = the CTA key (e.g. "hero_secondary", "nav_demo")
 *   content_key  = "kind" | "value" | "hidden"
 *   value        = "link" | "email" | "phone" | "whatsapp" | "external"
 *                  (for "kind") or the destination string (for "value")
 */
export type CtaKind = "link" | "email" | "phone" | "whatsapp" | "external";

export interface CtaTarget {
  kind: CtaKind;
  value: string;
  hidden?: boolean;
}

const CTA_PAGE = "cta_actions";

export interface CtaDefinition {
  /** Unique key (e.g. "hero_secondary") */
  key: string;
  /** Where this button appears, shown to admins */
  location: string;
  /** Default kind+value used when nothing is in CMS yet */
  defaultKind: CtaKind;
  defaultValue: string;
}

/**
 * Registry of every editable CTA on the site. Add a row here whenever a new
 * CTA gets the `<CtaButton>` treatment so it shows up in the admin editor.
 */
export const CTA_REGISTRY: CtaDefinition[] = [
  // Navbar
  { key: "nav_demo", location: "Navbar — Book a Demo", defaultKind: "link", defaultValue: "/contact" },
  { key: "nav_start", location: "Navbar — Get Started", defaultKind: "external", defaultValue: "https://fotofind.digitizeme.ae/" },

  // Home
  { key: "hero_primary", location: "Home — Hero primary (Get Started)", defaultKind: "external", defaultValue: "https://fotofind.digitizeme.ae/" },
  { key: "hero_secondary", location: "Home — Hero secondary (Book a Demo)", defaultKind: "link", defaultValue: "/contact" },
  { key: "lead_cta_home_hero", location: "Home — Hero lead capture (Talk to sales)", defaultKind: "link", defaultValue: "" },
  { key: "home_cta_start", location: "Home — Final CTA (Get Started)", defaultKind: "external", defaultValue: "https://fotofind.digitizeme.ae/" },
  { key: "home_cta_sales", location: "Home — Final CTA (Contact Sales)", defaultKind: "link", defaultValue: "/contact" },
  // Product
  { key: "product_see_plans", location: "Product — See Plans (SaaS)", defaultKind: "link", defaultValue: "/pricing" },
  { key: "product_contact_sales", location: "Product — Contact Sales (On-prem)", defaultKind: "link", defaultValue: "/contact" },
  { key: "product_cta_demo", location: "Product — Final CTA Book a Demo", defaultKind: "link", defaultValue: "/contact" },
  { key: "product_cta_pricing", location: "Product — Final CTA View Pricing", defaultKind: "link", defaultValue: "/pricing" },
  // Pricing
  { key: "pricing_plan_cta", location: "Pricing — Plan card buttons", defaultKind: "link", defaultValue: "/contact" },
  { key: "pricing_onprem_cta", location: "Pricing — On-Premise CTA", defaultKind: "link", defaultValue: "/contact" },
  { key: "lead_cta_roi_calculator", location: "Pricing — ROI calculator lead capture (Talk to our team)", defaultKind: "link", defaultValue: "" },
  // Features index page
  { key: "features_index_secondary", location: "Features — Final CTA (See pricing)", defaultKind: "link", defaultValue: "/pricing" },
  { key: "lead_cta_features_index", location: "Features — Final CTA lead capture (Talk to sales)", defaultKind: "link", defaultValue: "" },
  // Integrations page
  { key: "integrations_demo", location: "Integrations — Hero Book a Demo", defaultKind: "link", defaultValue: "/contact" },
  { key: "integrations_api", location: "Integrations — Request API access", defaultKind: "link", defaultValue: "/contact" },
  { key: "integrations_api_docs", location: "Integrations — View API docs", defaultKind: "link", defaultValue: "/contact" },
  { key: "integrations_cta_trial", location: "Integrations — Final CTA Start Trial", defaultKind: "link", defaultValue: "/pricing" },
  { key: "integrations_cta_demo", location: "Integrations — Final CTA Book Demo", defaultKind: "link", defaultValue: "/contact" },
  // Feature detail pages
  { key: "feature_cta_talk_to_sales", location: "Feature page — In-page CTA section (Talk to sales)", defaultKind: "link", defaultValue: "/contact" },
  { key: "feature_hero_primary", location: "Feature page — Hero primary CTA", defaultKind: "link", defaultValue: "/contact" },
  { key: "feature_hero_secondary", location: "Feature page — Hero secondary CTA", defaultKind: "link", defaultValue: "/pricing" },
  { key: "feature_not_found_browse", location: "Feature page — Not found 'Browse all features'", defaultKind: "link", defaultValue: "/product" },
  // Industries
  { key: "industries_dontsee_cta", location: "Industries — Don't see your industry", defaultKind: "link", defaultValue: "/contact" },
  { key: "industries_detail_demo", location: "Industry detail — Book a Demo (hero)", defaultKind: "link", defaultValue: "/contact" },
  { key: "industries_detail_hero_pricing", location: "Industry detail — Hero View pricing", defaultKind: "link", defaultValue: "/pricing" },
  { key: "industries_detail_cta", location: "Industry detail — Final CTA", defaultKind: "link", defaultValue: "/contact" },
  { key: "industries_detail_cta_pricing", location: "Industry detail — Final CTA View pricing", defaultKind: "link", defaultValue: "/pricing" },
  { key: "industries_notfound_viewall", location: "Industry not found — View all industries", defaultKind: "link", defaultValue: "/industries" },
  { key: "home_industries_viewall", location: "Home — Industries section View all", defaultKind: "link", defaultValue: "/industries" },
  // Footer — Product column
  { key: "footer_product_features", location: "Footer — Product › Features", defaultKind: "link", defaultValue: "/product" },
  { key: "footer_product_saas", location: "Footer — Product › SaaS", defaultKind: "link", defaultValue: "/product#saas" },
  { key: "footer_product_onprem", location: "Footer — Product › On-Premise", defaultKind: "link", defaultValue: "/product#on-premise" },
  { key: "footer_product_aiocr", location: "Footer — Product › AI OCR", defaultKind: "link", defaultValue: "/product#ai-ocr" },
  { key: "footer_product_pricing", location: "Footer — Product › Pricing", defaultKind: "link", defaultValue: "/pricing" },
  { key: "footer_product_blog", location: "Footer — Product › Blog", defaultKind: "link", defaultValue: "/blog" },
  // Footer — Industries column
  { key: "footer_ind_law", location: "Footer — Industries › Law firms", defaultKind: "link", defaultValue: "/industries/law-firms" },
  { key: "footer_ind_acc", location: "Footer — Industries › Accounting", defaultKind: "link", defaultValue: "/industries/accounting" },
  { key: "footer_ind_health", location: "Footer — Industries › Healthcare", defaultKind: "link", defaultValue: "/industries/healthcare" },
  { key: "footer_ind_re", location: "Footer — Industries › Real Estate", defaultKind: "link", defaultValue: "/industries/real-estate" },
  { key: "footer_ind_log", location: "Footer — Industries › Logistics", defaultKind: "link", defaultValue: "/industries/logistics" },
  { key: "footer_ind_all", location: "Footer — Industries › View all", defaultKind: "link", defaultValue: "/industries" },
  // Footer — Legal
  { key: "footer_legal_privacy", location: "Footer — Legal › Privacy", defaultKind: "link", defaultValue: "/privacy" },
  { key: "footer_legal_terms", location: "Footer — Legal › Terms", defaultKind: "link", defaultValue: "/terms" },
  // Footer — Social icons
  { key: "footer_social_linkedin", location: "Footer — Social › LinkedIn", defaultKind: "external", defaultValue: "https://linkedin.com" },
  { key: "footer_social_facebook", location: "Footer — Social › Facebook", defaultKind: "external", defaultValue: "https://facebook.com" },
  { key: "footer_social_x", location: "Footer — Social › X (Twitter)", defaultKind: "external", defaultValue: "https://x.com" },
  { key: "footer_social_youtube", location: "Footer — Social › YouTube", defaultKind: "external", defaultValue: "https://youtube.com" },
];

interface CtaRow {
  section: string;
  content_key: string;
  value: string;
}

const fetchCtaTargets = async () => {
  const { data, error } = await supabase
    .from("site_content")
    .select("section, content_key, value")
    .eq("page", CTA_PAGE);
  if (error) throw error;
  return (data ?? []) as CtaRow[];
};

/**
 * React Query hook returning the resolved target for a given CTA key, with
 * a sensible default applied when the admin hasn't customized it yet.
 */
export const useCtaTargets = () => {
  const query = useQuery({
    queryKey: ["cta-actions"],
    queryFn: fetchCtaTargets,
    staleTime: 60_000,
  });

  const get = (key: string): CtaTarget => {
    const def = CTA_REGISTRY.find((d) => d.key === key);
    const fallback: CtaTarget = {
      kind: def?.defaultKind ?? "link",
      // Leave empty for unregistered (dynamic) keys so the consumer's
      // `defaultTo` prop wins — registered keys still get their default.
      value: def?.defaultValue ?? "",
      hidden: false,
    };
    if (!query.data) return fallback;
    const kindRow = query.data.find((r) => r.section === key && r.content_key === "kind");
    const valueRow = query.data.find((r) => r.section === key && r.content_key === "value");
    const hiddenRow = query.data.find((r) => r.section === key && r.content_key === "hidden");
    return {
      kind: (kindRow?.value as CtaKind) || fallback.kind,
      value: valueRow?.value || fallback.value,
      hidden: hiddenRow?.value === "1",
    };
  };

  return { get, isLoading: query.isLoading, rows: query.data ?? [] };
};

/**
 * Convert a target into an `href` (and target/rel) for a plain anchor.
 * Returns null if the target is an internal link (use <Link to=...> instead).
 */
export const targetToAnchor = (
  target: CtaTarget
): { href: string; external: boolean } | null => {
  switch (target.kind) {
    case "email":
      return { href: `mailto:${target.value.replace(/^mailto:/, "")}`, external: false };
    case "phone":
      return { href: `tel:${target.value.replace(/^tel:/, "").replace(/\s+/g, "")}`, external: false };
    case "whatsapp": {
      const num = target.value.replace(/[^\d+]/g, "").replace(/^\+/, "");
      return { href: `https://wa.me/${num}`, external: true };
    }
    case "external":
      return { href: target.value, external: true };
    case "link":
    default:
      return null;
  }
};
