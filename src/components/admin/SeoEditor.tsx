import { useState, useEffect } from "react";
import { useAllSiteContent, useSaveContent, useUploadCmsImage } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Globe, ImageIcon, Loader2, Search, Bot, Sparkles, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDynamicIndustries } from "@/hooks/useDynamicIndustries";
import { useCustomPages } from "@/hooks/useCustomPages";
import { useFeatures } from "@/hooks/useFeatures";
import { useSeoTemplates, useTemplateGlobals, applySeoTemplate } from "@/hooks/useSeoTemplates";
import SeoHealthPanel from "./SeoHealthPanel";
import SeoValidationPanel from "./SeoValidationPanel";
import SerpSocialPreview from "./SerpSocialPreview";
import SerpScorePanel, { type AllPageSeoSnapshot, type SerpScoreBreakdown } from "./SerpScorePanel";
import DualLangSerpPreview from "./DualLangSerpPreview";
import TitleDescVariationsGenerator from "./TitleDescVariationsGenerator";
import ScoreHistoryPanel from "./ScoreHistoryPanel";
import SeoTemplatesEditor from "./SeoTemplatesEditor";
import ImageUploadPreviewDialog from "./ImageUploadPreviewDialog";
import { useCreateScoreSnapshot } from "@/hooks/useScoreSnapshots";
import { formatUploadBytes, getImageUploadGuidance, validateImageFileWithDimensions } from "@/lib/imageUploadGuidance";
import { optimizeImageForUpload } from "@/lib/imageUploadOptimization";

/**
 * SEO Editor — manage Meta tags, OG/social preview, keywords, and image alt
 * texts for every page in the site. Stored in site_content under section "seo"
 * (per page) and section "alt" (for image alt texts).
 *
 * Why this lives here:
 *   - Non-tech editors need to update SEO without code edits
 *   - Multilingual: each field has EN / AR / FR values
 *   - Re-uses existing site_content table & RLS — no new schema
 */

// Static pages exposed for SEO editing. Industry detail pages are appended
// dynamically inside the component (one entry per industry, keyed
// `industry_<slug>` to match the storage convention used by /industries/:slug).
const STATIC_PAGES: { key: string; label: string; path: string }[] = [
  { key: "home", label: "Home", path: "/" },
  { key: "product", label: "Product", path: "/product" },
  { key: "pricing", label: "Pricing", path: "/pricing" },
  { key: "features", label: "Features (index)", path: "/features" },
  { key: "industries", label: "Industries (index)", path: "/industries" },
  { key: "contact", label: "Contact", path: "/contact" },
  { key: "blog", label: "Blog", path: "/blog" },
  { key: "privacy", label: "Privacy Policy", path: "/privacy" },
  { key: "terms", label: "Terms of Service", path: "/terms" },
];

const FIELDS: {
  key: string;
  label: string;
  type: "text" | "textarea";
  placeholder: string;
  hint: string;
  max?: number;
}[] = [
  {
    key: "meta_title",
    label: "Meta title",
    type: "text",
    placeholder: "Short, keyword-rich page title",
    hint: "Shown in browser tabs & Google results. Keep under 60 characters.",
    max: 70,
  },
  {
    key: "meta_description",
    label: "Meta description",
    type: "textarea",
    placeholder: "Compelling summary that makes people click",
    hint: "Shown under the title in Google results. Keep under 160 characters.",
    max: 170,
  },
  {
    key: "meta_keywords",
    label: "Keywords",
    type: "text",
    placeholder: "ocr, document management, dubai",
    hint: "Comma-separated. Optional — most search engines ignore this, but useful for internal SEO tracking.",
  },
  {
    key: "og_title",
    label: "Social share title (Open Graph)",
    type: "text",
    placeholder: "Defaults to meta title if blank",
    hint: "Used when the page is shared on Facebook, LinkedIn, X, WhatsApp.",
  },
  {
    key: "og_description",
    label: "Social share description",
    type: "textarea",
    placeholder: "Defaults to meta description if blank",
    hint: "Shown under the title in social shares.",
  },
];

type LangVal = { en: string; ar: string };
type RowMap = Record<string, LangVal>;

const SeoEditor = () => {
  const { data: allContent, isLoading } = useAllSiteContent();
  const saveContent = useSaveContent();
  const uploadImage = useUploadCmsImage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { list: industries } = useDynamicIndustries();
  const { data: customPages } = useCustomPages({ includeDrafts: true });
  const { data: features } = useFeatures();
  const { data: templates } = useSeoTemplates();
  const templateGlobals = useTemplateGlobals();
  const [showTemplatesEditor, setShowTemplatesEditor] = useState(false);
  const ogGuidance = getImageUploadGuidance("og");
  // Combine static pages, industry detail pages, feature detail pages, and
  // custom CMS pages so admins can edit per-page SEO from one panel. Custom
  // pages and features are routed to their own tables (with seo_* columns)
  // instead of site_content. Newly-created features/custom-pages appear here
  // automatically because they're sourced from live queries.
  const PAGES = [
    ...STATIC_PAGES,
    ...industries.map((i) => ({
      key: `industry_${i.slug}`,
      label: `Industry: ${i.name}`,
      path: `/industries/${i.slug}`,
    })),
    ...((features ?? []).map((f) => ({
      key: `feature_${f.id}`,
      label: `Feature: ${f.hero_title || f.slug}${f.published ? "" : " (draft)"}`,
      path: `/features/${f.slug}`,
    }))),
    ...((customPages ?? []).map((p) => ({
      key: `custom_${p.id}`,
      label: `Custom: ${p.title}${p.status === "draft" ? " (draft)" : ""}`,
      path: `/${p.slug}`,
    }))),
  ];

  const [activePage, setActivePage] = useState(STATIC_PAGES[0].key);
  const [activeLang, setActiveLang] = useState<"en" | "ar">("en");
  const [pending, setPending] = useState<RowMap>({});
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingOgFiles, setPendingOgFiles] = useState<File[]>([]);
  const [ogPreviewOpen, setOgPreviewOpen] = useState(false);
  const [optimizeUploads, setOptimizeUploads] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  // Robots directives — language-agnostic, stored once per page
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);
  // Latest live SERP score breakdown — captured by SerpScorePanel via callback
  // and snapshotted to seo_score_snapshots whenever the editor saves.
  const [scoreBreakdown, setScoreBreakdown] = useState<SerpScoreBreakdown | null>(null);
  const createSnapshot = useCreateScoreSnapshot();

  // Helpers — custom pages live in their own table with dedicated columns
  const isCustomPage = activePage.startsWith("custom_");
  const customPageId = isCustomPage ? activePage.slice("custom_".length) : null;
  const activeCustomPage = customPageId ? customPages?.find((p) => p.id === customPageId) : null;

  // Features also have their own seo_* columns on the features table
  const isFeaturePage = activePage.startsWith("feature_");
  const featurePageId = isFeaturePage ? activePage.slice("feature_".length) : null;
  const activeFeaturePage = featurePageId ? features?.find((f) => f.id === featurePageId) : null;

  // Industry pages — derive context from the registry entry for templating
  const isIndustryPage = activePage.startsWith("industry_");
  const industrySlug = isIndustryPage ? activePage.slice("industry_".length) : null;
  const activeIndustry = industrySlug ? industries.find((i) => i.slug === industrySlug) : null;

  /**
   * Apply the saved SEO template for the active page (industry or feature).
   * Overwrites the pending meta_title / meta_description / meta_keywords
   * fields for BOTH languages with the rendered template output. The admin
   * still needs to click "Save SEO for this page" to persist.
   */
  const handleApplyTemplate = () => {
    if (!templates) return;
    const kind = isIndustryPage ? "industry" : isFeaturePage ? "feature" : null;
    if (!kind) return;

    // Build the per-page context bag
    const keywordsEn = pending["meta_keywords"]?.en ?? "";
    const ctx = {
      ...templateGlobals,
      slug: isIndustryPage ? activeIndustry?.slug : activeFeaturePage?.slug,
      name: isIndustryPage ? activeIndustry?.name : activeFeaturePage?.hero_title,
      hero_title: activeFeaturePage?.hero_title ?? "",
      hero_desc: activeFeaturePage?.hero_desc ?? "",
      primary_keyword: keywordsEn.split(",")[0]?.trim() || "",
      industry_keywords: keywordsEn,
    };

    const en = applySeoTemplate(templates, kind, "en", ctx);
    const ar = applySeoTemplate(templates, kind, "ar", ctx);

    setPending((prev) => ({
      ...prev,
      meta_title: { en: en.meta_title, ar: ar.meta_title },
      meta_description: { en: en.meta_description, ar: ar.meta_description },
      meta_keywords: { en: en.meta_keywords, ar: ar.meta_keywords },
    }));

    toast({
      title: "Template applied",
      description: "Review the generated fields, then click Save SEO for this page.",
    });
  };

  const canApplyTemplate = (isIndustryPage && activeIndustry) || (isFeaturePage && activeFeaturePage);

  // Load existing SEO content for the active page into local pending state
  useEffect(() => {
    // Robots directives live in site_content for ALL page types so the same
    // editor works for static, industry, feature, and custom pages without
    // schema changes. Defaults: index=true, follow=true.
    const robotsIndexRow = allContent?.find(
      (c) => c.page === activePage && c.section === "seo" && c.content_key === "robots_index"
    );
    const robotsFollowRow = allContent?.find(
      (c) => c.page === activePage && c.section === "seo" && c.content_key === "robots_follow"
    );
    setRobotsIndex(robotsIndexRow?.value === "false" ? false : true);
    setRobotsFollow(robotsFollowRow?.value === "false" ? false : true);

    if (isCustomPage) {
      if (!activeCustomPage) return;
      setPending({
        meta_title: { en: activeCustomPage.seo_title ?? "", ar: activeCustomPage.seo_title_ar ?? "" },
        meta_description: { en: activeCustomPage.seo_description ?? "", ar: activeCustomPage.seo_description_ar ?? "" },
        meta_keywords: { en: "", ar: "" },
        og_title: { en: "", ar: "" },
        og_description: { en: "", ar: "" },
      });
      setOgImageUrl(activeCustomPage.seo_og_image ?? "");
      return;
    }
    if (isFeaturePage) {
      if (!activeFeaturePage) return;
      setPending({
        meta_title: { en: activeFeaturePage.seo_title ?? "", ar: activeFeaturePage.seo_title_ar ?? "" },
        meta_description: { en: activeFeaturePage.seo_description ?? "", ar: activeFeaturePage.seo_description_ar ?? "" },
        meta_keywords: { en: "", ar: "" },
        og_title: { en: "", ar: "" },
        og_description: { en: "", ar: "" },
      });
      setOgImageUrl(activeFeaturePage.seo_og_image ?? "");
      return;
    }
    if (!allContent) return;
    const next: RowMap = {};
    for (const f of FIELDS) {
      const row = allContent.find(
        (c) => c.page === activePage && c.section === "seo" && c.content_key === f.key
      );
      next[f.key] = {
        en: row?.value ?? "",
        ar: row?.value_ar ?? "",
      };
    }
    setPending(next);

    const og = allContent.find(
      (c) => c.page === activePage && c.section === "seo" && c.content_key === "og_image"
    );
    setOgImageUrl(og?.value ?? "");
  }, [allContent, activePage, isCustomPage, activeCustomPage, isFeaturePage, activeFeaturePage]);

  // Save robots directives (index/follow) into site_content. Lives outside
  // the per-page branches so the same flag storage works for static, industry,
  // feature, and custom pages — SEOHead reads them by the same composite key.
  const saveRobotsDirectives = async () => {
    for (const key of ["robots_index", "robots_follow"] as const) {
      const value = key === "robots_index" ? String(robotsIndex) : String(robotsFollow);
      const existing = allContent?.find(
        (c) => c.page === activePage && c.section === "seo" && c.content_key === key
      );
      if (existing) {
        await supabase.from("site_content").update({ value, content_type: "text" }).eq("id", existing.id);
      } else {
        await supabase.from("site_content").insert({
          page: activePage,
          section: "seo",
          content_key: key,
          value,
          content_type: "text",
          sort_order: 0,
        });
      }
    }
  };

  // Capture a SERP score snapshot for the active page+lang. Fire-and-forget —
  // never blocks save success even if RLS rejects (e.g. unauthenticated dev).
  const captureScoreSnapshot = async () => {
    if (!scoreBreakdown) return;
    const pageLabel = PAGES.find((p) => p.key === activePage)?.label ?? activePage;
    const titleVal = pending["meta_title"]?.[activeLang] ?? "";
    const descVal = pending["meta_description"]?.[activeLang] ?? "";
    const kwVal = pending["meta_keywords"]?.[activeLang] ?? "";
    try {
      await createSnapshot.mutateAsync({
        page_key: activePage,
        page_label: pageLabel,
        lang: activeLang,
        score: scoreBreakdown.score,
        title_length_score: scoreBreakdown.titleLengthScore,
        desc_length_score: scoreBreakdown.descLengthScore,
        keyword_coverage_score: scoreBreakdown.keywordCoverageScore,
        duplicate_risk_score: scoreBreakdown.duplicateRiskScore,
        meta_title_length: titleVal.length,
        meta_description_length: descVal.length,
        keyword_count: kwVal.split(",").map((k) => k.trim()).filter((k) => k.length >= 2).length,
      });
    } catch {
      // Non-fatal — surfaced separately via react-query devtools if needed.
    }
  };

  // Save all SEO fields for the current page in one click
  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      if (isCustomPage && customPageId) {
        // Route writes to the custom_pages table's own SEO columns
        const { error } = await supabase
          .from("custom_pages")
          .update({
            seo_title: pending.meta_title?.en || null,
            seo_title_ar: pending.meta_title?.ar || null,
            seo_description: pending.meta_description?.en || null,
            seo_description_ar: pending.meta_description?.ar || null,
            seo_og_image: ogImageUrl || null,
          })
          .eq("id", customPageId);
        if (error) throw error;
        await saveRobotsDirectives();
        await captureScoreSnapshot();
        queryClient.invalidateQueries({ queryKey: ["custom_pages"] });
        queryClient.invalidateQueries({ queryKey: ["site-content"] });
        queryClient.invalidateQueries({ queryKey: ["site-content-all"] });
        toast({ title: "SEO saved", description: `${PAGES.find((p) => p.key === activePage)?.label} SEO has been updated.` });
        return;
      }

      if (isFeaturePage && featurePageId) {
        // Route writes to the features table's own SEO columns
        const { error } = await supabase
          .from("features")
          .update({
            seo_title: pending.meta_title?.en || null,
            seo_title_ar: pending.meta_title?.ar || null,
            seo_description: pending.meta_description?.en || null,
            seo_description_ar: pending.meta_description?.ar || null,
            seo_og_image: ogImageUrl || null,
          })
          .eq("id", featurePageId);
        if (error) throw error;
        await saveRobotsDirectives();
        await captureScoreSnapshot();
        queryClient.invalidateQueries({ queryKey: ["features"] });
        queryClient.invalidateQueries({ queryKey: ["site-content"] });
        queryClient.invalidateQueries({ queryKey: ["site-content-all"] });
        toast({ title: "SEO saved", description: `${PAGES.find((p) => p.key === activePage)?.label} SEO has been updated.` });
        return;
      }

      for (const f of FIELDS) {
        const v = pending[f.key];
        if (!v) continue;
        const existing = allContent?.find(
          (c) => c.page === activePage && c.section === "seo" && c.content_key === f.key
        );
        if (existing) {
          await supabase
            .from("site_content")
            .update({
              value: v.en,
              value_ar: v.ar || null,
              content_type: "text",
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("site_content").insert({
            page: activePage,
            section: "seo",
            content_key: f.key,
            value: v.en,
            value_ar: v.ar || null,
            content_type: "text",
            sort_order: 0,
          });
        }
      }

      // OG image
      const ogRow = allContent?.find(
        (c) => c.page === activePage && c.section === "seo" && c.content_key === "og_image"
      );
      if (ogRow) {
        await supabase
          .from("site_content")
          .update({ value: ogImageUrl, content_type: "image_url" })
          .eq("id", ogRow.id);
      } else if (ogImageUrl) {
        await supabase.from("site_content").insert({
          page: activePage,
          section: "seo",
          content_key: "og_image",
          value: ogImageUrl,
          content_type: "image_url",
          sort_order: 0,
        });
      }

      await saveRobotsDirectives();
      await captureScoreSnapshot();

      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      queryClient.invalidateQueries({ queryKey: ["site-content-all"] });
      toast({ title: "SEO saved", description: `${PAGES.find((p) => p.key === activePage)?.label} SEO has been updated.` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSavingAll(false);
    }
  };

  // Upload an OG / social preview image to the cms-images bucket
  const handleOgUpload = async (file: File) => {
    const error = await validateImageFileWithDimensions(file, ogGuidance);
    if (error) {
      toast({ title: "Upload blocked", description: error, variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const optimizedFile = await optimizeImageForUpload(file, optimizeUploads);
      const path = `seo/${activePage}-og-${Date.now()}-${optimizedFile.name.replace(/\s+/g, "_")}`;
      const url = await uploadImage.mutateAsync({ file: optimizedFile, path });
      setOgImageUrl(url);
      toast({ title: "Image uploaded", description: "Don't forget to save." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Build a list of all images currently referenced anywhere in CMS so admins
  // can edit their alt text in one place. Image rows are stored with
  // content_type = "image_url" anywhere in site_content.
  const imageRows = (allContent ?? []).filter((c) => c.content_type === "image_url");

  const updatePending = (key: string, lang: "en" | "ar", val: string) => {
    setPending((prev) => ({ ...prev, [key]: { ...prev[key], [lang]: val } }));
  };

  // Save a single image alt text (per-language)
  const saveAlt = async (
    page: string,
    section: string,
    imageKey: string,
    lang: "en" | "ar",
    value: string
  ) => {
    const altKey = `${imageKey}__alt`;
    const existing = allContent?.find(
      (c) => c.page === page && c.section === section && c.content_key === altKey
    );
    const patch: any = { content_type: "text" };
    if (lang === "en") patch.value = value;
    if (lang === "ar") patch.value_ar = value || null;

    if (existing) {
      await supabase.from("site_content").update(patch).eq("id", existing.id);
    } else {
      await supabase.from("site_content").insert({
        page,
        section,
        content_key: altKey,
        value: lang === "en" ? value : "",
        value_ar: lang === "ar" ? value : null,
        content_type: "text",
        sort_order: 0,
      });
    }
    queryClient.invalidateQueries({ queryKey: ["site-content"] });
    queryClient.invalidateQueries({ queryKey: ["site-content-all"] });
    toast({ title: "Alt text saved" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={18} /> Loading SEO settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl p-4">
        <Search size={20} className="text-accent shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground text-sm">Search engine optimization</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Edit how your pages appear on Google and when shared on social media. Each field supports English and Arabic.
          </p>
        </div>
      </div>

      {/* SEO health metrics */}
      <SeoHealthPanel
        allContent={allContent as any}
        pages={PAGES}
        activePage={activePage}
        onSelectPage={setActivePage}
      />

      {/* Live validation pass — fetches each route and audits rendered HTML */}
      <SeoValidationPanel />

      {/* Reusable SEO templates — collapsible. Templates auto-fill new
          industry/feature pages and back the "Apply template" button below. */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTemplatesEditor((s) => !s)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <span className="text-sm font-semibold text-foreground">SEO templates</span>
            <span className="text-[11px] text-muted-foreground">
              for industry & feature pages
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {showTemplatesEditor ? "Hide" : "Manage templates"}
          </span>
        </button>
        {showTemplatesEditor && (
          <div className="px-4 pb-4 pt-1 border-t border-border">
            <SeoTemplatesEditor />
          </div>
        )}
      </div>

      {/* Page selector */}
      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Page</Label>
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible">
          {PAGES.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePage(p.key)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                activePage === p.key
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card border-border text-foreground hover:border-accent/50"
              }`}
              aria-pressed={activePage === p.key}
            >
              {p.label}
              <span className="ml-1.5 text-[10px] opacity-60">{p.path}</span>
            </button>
          ))}
        </div>

        {/* Apply template — only shown for industry/feature pages where a
            template is defined. Overwrites pending fields with rendered values. */}
        {canApplyTemplate && (
          <div className="mt-3 flex items-center justify-between gap-3 bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <Wand2 size={14} className="text-accent shrink-0" />
              <span className="text-xs text-foreground">
                {isIndustryPage ? "Industry" : "Feature"} template available — auto-generate title,
                description & keywords from the page name and hero content.
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleApplyTemplate}
              className="shrink-0"
            >
              <Wand2 size={12} className="mr-1.5" />
              Apply template
            </Button>
          </div>
        )}
      </div>

      {/* Language tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["en", "ar"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setActiveLang(l)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeLang === l
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe size={14} className="inline mr-1.5" />
            {l === "en" ? "English" : "العربية"}
          </button>
        ))}
      </div>

      {/* Live SERP score — length, keyword coverage, duplicate risk */}
      <SerpScorePanel
        metaTitle={pending["meta_title"]?.[activeLang] ?? ""}
        metaDescription={pending["meta_description"]?.[activeLang] ?? ""}
        ogTitle={pending["og_title"]?.[activeLang] ?? ""}
        ogDescription={pending["og_description"]?.[activeLang] ?? ""}
        keywords={pending["meta_keywords"]?.[activeLang] ?? ""}
        activePageKey={activePage}
        otherPages={(() => {
          const snapshots: AllPageSeoSnapshot[] = [];
          // site_content-backed pages
          for (const p of PAGES) {
            if (p.key.startsWith("custom_") || p.key.startsWith("feature_")) continue;
            const titleRow = allContent?.find((c) => c.page === p.key && c.section === "seo" && c.content_key === "meta_title");
            const descRow = allContent?.find((c) => c.page === p.key && c.section === "seo" && c.content_key === "meta_description");
            snapshots.push({
              pageKey: p.key,
              pageLabel: p.label,
              metaTitle: (activeLang === "ar" ? titleRow?.value_ar : titleRow?.value) ?? "",
              metaDescription: (activeLang === "ar" ? descRow?.value_ar : descRow?.value) ?? "",
            });
          }
          for (const f of features ?? []) {
            snapshots.push({
              pageKey: `feature_${f.id}`,
              pageLabel: `Feature: ${f.hero_title || f.slug}`,
              metaTitle: (activeLang === "ar" ? f.seo_title_ar : f.seo_title) ?? "",
              metaDescription: (activeLang === "ar" ? f.seo_description_ar : f.seo_description) ?? "",
            });
          }
          for (const cp of customPages ?? []) {
            snapshots.push({
              pageKey: `custom_${cp.id}`,
              pageLabel: `Custom: ${cp.title}`,
              metaTitle: (activeLang === "ar" ? cp.seo_title_ar : cp.seo_title) ?? "",
              metaDescription: (activeLang === "ar" ? cp.seo_description_ar : cp.seo_description) ?? "",
            });
          }
          return snapshots;
        })()}
        rtl={activeLang === "ar"}
        onScoreChange={setScoreBreakdown}
      />

      {/* Saved score history — sparkline + per-check trend bars */}
      <ScoreHistoryPanel
        pageKey={activePage}
        pageLabel={PAGES.find((p) => p.key === activePage)?.label ?? activePage}
        lang={activeLang}
        rtl={activeLang === "ar"}
      />

      {/* Side-by-side EN + AR Google SERP snippet preview */}
      <DualLangSerpPreview
        pagePath={PAGES.find((p) => p.key === activePage)?.path ?? "/"}
        en={{
          metaTitle: pending["meta_title"]?.en ?? "",
          metaDescription: pending["meta_description"]?.en ?? "",
        }}
        ar={{
          metaTitle: pending["meta_title"]?.ar ?? "",
          metaDescription: pending["meta_description"]?.ar ?? "",
        }}
      />

      {/* Live SERP & social previews — fed by pending state, updates on every keystroke */}
      <SerpSocialPreview
        pagePath={PAGES.find((p) => p.key === activePage)?.path ?? "/"}
        metaTitle={pending["meta_title"]?.[activeLang] ?? ""}
        metaDescription={pending["meta_description"]?.[activeLang] ?? ""}
        ogTitle={pending["og_title"]?.[activeLang] ?? ""}
        ogDescription={pending["og_description"]?.[activeLang] ?? ""}
        ogImage={ogImageUrl}
        rtl={activeLang === "ar"}
      />

      {/* Auto-generated title/description variations — pick one to apply */}
      <TitleDescVariationsGenerator
        rtl={activeLang === "ar"}
        context={{
          lang: activeLang,
          name:
            (isIndustryPage
              ? activeIndustry?.name
              : isFeaturePage
              ? activeFeaturePage?.hero_title
              : isCustomPage
              ? activeCustomPage?.title
              : PAGES.find((p) => p.key === activePage)?.label) ?? "",
          hero_title: activeFeaturePage?.hero_title ?? activeIndustry?.name ?? "",
          hero_desc: activeFeaturePage?.hero_desc ?? "",
          keywords: pending["meta_keywords"]?.[activeLang] ?? "",
          brand: templateGlobals.brand,
          tagline: templateGlobals.tagline,
          location: templateGlobals.location,
        }}
        onApply={({ title, description }) => {
          setPending((prev) => ({
            ...prev,
            meta_title: { ...(prev.meta_title ?? { en: "", ar: "" }), [activeLang]: title },
            meta_description: {
              ...(prev.meta_description ?? { en: "", ar: "" }),
              [activeLang]: description,
            },
          }));
          toast({
            title: "Variation applied",
            description: "Review the title & description, then click Save SEO for this page.",
          });
        }}
      />

      {/* SEO fields */}
      <div className="space-y-5">
        {FIELDS.map((f) => {
          const val = pending[f.key]?.[activeLang] ?? "";
          const len = val.length;
          const overLimit = f.max && len > f.max;
          return (
            <div key={f.key}>
              <div className="flex items-baseline justify-between mb-1">
                <Label className="text-sm font-medium">{f.label}</Label>
                {f.max && (
                  <span className={`text-[11px] ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
                    {len} / {f.max}
                  </span>
                )}
              </div>
              {f.type === "textarea" ? (
                <Textarea
                  value={val}
                  onChange={(e) => updatePending(f.key, activeLang, e.target.value)}
                  placeholder={f.placeholder}
                  rows={3}
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                />
              ) : (
                <Input
                  value={val}
                  onChange={(e) => updatePending(f.key, activeLang, e.target.value)}
                  placeholder={f.placeholder}
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                />
              )}
              <p className="text-[11px] text-muted-foreground mt-1">{f.hint}</p>
            </div>
          );
        })}

        {/* Robots directives — language-agnostic crawler instructions.
            Use noindex on drafts/staging-only pages so search engines skip them. */}
        <div className="bg-muted/30 border border-border rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <Bot size={18} className="text-accent shrink-0 mt-0.5" />
            <div>
              <Label className="text-sm font-medium">Robots directives</Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Control whether search engines can index this page and follow its links. Use <strong>noindex</strong> on drafts.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-3 bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-accent/50 transition-colors">
              <input
                type="checkbox"
                checked={robotsIndex}
                onChange={(e) => setRobotsIndex(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-accent shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {robotsIndex ? "Index" : "Noindex"}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {robotsIndex
                    ? "This page can appear in Google search results."
                    : "Hidden from search results — good for drafts and private pages."}
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-accent/50 transition-colors">
              <input
                type="checkbox"
                checked={robotsFollow}
                onChange={(e) => setRobotsFollow(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-accent shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  {robotsFollow ? "Follow" : "Nofollow"}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {robotsFollow
                    ? "Crawlers follow links on this page to discover more content."
                    : "Crawlers won't follow links from this page."}
                </p>
              </div>
            </label>
          </div>
          <div className="mt-3 px-3 py-2 bg-background border border-border rounded-md text-[11px] font-mono text-muted-foreground">
            &lt;meta name="robots" content="{robotsIndex ? "index" : "noindex"},{robotsFollow ? "follow" : "nofollow"}" /&gt;
          </div>
        </div>
        {/* OG image (shared across languages) */}
        <div>
          <Label className="text-sm font-medium">Social share image (1200×630)</Label>
          <p className="text-[11px] text-muted-foreground mt-1 mb-2">
            Shown when your page is shared on Facebook, LinkedIn, X, WhatsApp. PNG or JPG, ideally 1200×630px.
          </p>
          <p className="text-[11px] text-muted-foreground mb-2">
            Max file size: {formatUploadBytes(ogGuidance.maxBytes)}.
          </p>
          {ogImageUrl ? (
            <div className="relative inline-block rounded-lg overflow-hidden border border-border bg-muted/30">
              <img src={ogImageUrl} alt="Social preview" className="max-h-40 max-w-full object-contain" />
              <button
                type="button"
                onClick={() => setOgImageUrl("")}
                className="absolute top-1 right-1 bg-background/90 text-foreground rounded-md text-xs px-2 py-1 hover:bg-background"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer text-sm text-accent hover:underline">
              <ImageIcon size={16} />
              {uploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPendingOgFiles([file]);
                    setOgPreviewOpen(true);
                  }
                }}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={handleSaveAll} disabled={savingAll} className="bg-accent text-accent-foreground hover:bg-accent/90">
          {savingAll ? (<><Loader2 className="animate-spin mr-2" size={16} /> Saving…</>) : "Save SEO for this page"}
        </Button>
      </div>

      {/* Image alt-text manager */}
      <div className="pt-8 border-t border-border">
        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <ImageIcon size={16} className="text-accent" />
          Image alt text
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Alt text describes images for screen readers and search engines. Edit alt text for every uploaded image below.
        </p>
        {imageRows.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No CMS images yet. Upload images on the page using visual edit mode and they'll appear here.
          </p>
        ) : (
          <div className="space-y-3">
            {imageRows.map((row) => {
              const altRow = allContent?.find(
                (c) =>
                  c.page === row.page &&
                  c.section === row.section &&
                  c.content_key === `${row.content_key}__alt`
              );
              const altEn = altRow?.value ?? "";
              const altAr = altRow?.value_ar ?? "";
              return (
                <div key={row.id} className="bg-card border border-border rounded-lg p-3 flex gap-3 items-start">
                  <img
                    src={row.value}
                    alt={altEn || "image"}
                    className="w-20 h-20 object-cover rounded border border-border bg-muted/30 shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="text-[11px] text-muted-foreground truncate">
                      <span className="font-medium text-foreground">{row.page}</span> / {row.section} / {row.content_key}
                    </div>
                    <AltInput label="EN" initial={altEn} onSave={(v) => saveAlt(row.page, row.section, row.content_key, "en", v)} />
                    <AltInput label="AR" initial={altAr} dir="rtl" onSave={(v) => saveAlt(row.page, row.section, row.content_key, "ar", v)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ImageUploadPreviewDialog
        open={ogPreviewOpen}
        files={pendingOgFiles}
        guidance={ogGuidance}
        title="Preview social share crop"
        description="Confirm the exact social share framing before uploading this image."
        confirmLabel="Upload share image"
        isSubmitting={uploading}
        optimizeUploads={optimizeUploads}
        onCancel={() => {
          setOgPreviewOpen(false);
          setPendingOgFiles([]);
        }}
        onOptimizeUploadsChange={setOptimizeUploads}
        onConfirm={async (files) => {
          const file = files[0];
          if (!file) return;
          await handleOgUpload(file);
          setOgPreviewOpen(false);
          setPendingOgFiles([]);
        }}
      />
    </div>
  );
};

const AltInput = ({
  label,
  initial,
  dir = "ltr",
  onSave,
}: {
  label: string;
  initial: string;
  dir?: "ltr" | "rtl";
  onSave: (v: string) => void | Promise<void>;
}) => {
  const [val, setVal] = useState(initial);
  useEffect(() => setVal(initial), [initial]);
  const dirty = val !== initial;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold text-muted-foreground w-6">{label}</span>
      <Input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={`Alt text (${label})`}
        dir={dir}
        className="h-8 text-xs"
      />
      <Button
        size="sm"
        variant={dirty ? "default" : "ghost"}
        onClick={() => onSave(val)}
        disabled={!dirty}
        className="h-8 text-xs"
      >
        Save
      </Button>
    </div>
  );
};

export default SeoEditor;
