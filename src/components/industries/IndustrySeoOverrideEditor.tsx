import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ImageIcon, Loader2, Save, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useEditMode } from "@/components/cms/EditModeContext";
import { useAllSiteContent, useSaveContent } from "@/hooks/useSiteContent";
import { useToast } from "@/hooks/use-toast";
import MediaPicker from "@/components/admin/MediaPicker";
import { analyzeIndustryKeywords } from "@/lib/industrySeo";

interface Props {
  /** Industry slug — used to scope SEO rows under page=`industry_<slug>` */
  slug: string;
  industryName: string;
  headline: string;
  description?: string;
  painPoints?: string[];
  solutions?: string[];
  useCases?: string[];
  /** Auto-generated meta title (used as the placeholder/fallback hint) */
  fallbackTitle: string;
  /** Auto-generated meta description (used as the placeholder/fallback hint) */
  fallbackDescription: string;
}

type LangVal = { en: string; ar: string };
type FieldKey = "meta_title" | "meta_description" | "meta_keywords";

/**
 * Inline SEO override editor for a single industry detail page.
 *
 * Rendered only for admins in edit mode. Lets the admin override:
 *   - Meta title (EN + AR)
 *   - Meta description (EN + AR)
 *   - Open Graph image
 *
 * Empty fields automatically fall back to the page's auto-generated SEO
 * (handled inside SEOHead via getContent(key, fallback)).
 *
 * Storage convention (matches the global SeoEditor):
 *   page = `industry_<slug>`, section = "seo"
 *   content_key ∈ { "meta_title", "meta_description", "og_image" }
 */
const IndustrySeoOverrideEditor = ({
  slug,
  industryName,
  headline,
  description,
  painPoints,
  solutions,
  useCases,
  fallbackTitle,
  fallbackDescription,
}: Props) => {
  const { canEdit, enabled } = useEditMode();
  const { data: allContent } = useAllSiteContent();
  const save = useSaveContent();
  const { toast } = useToast();

  const pageKey = `industry_${slug}`;
  const [open, setOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<"en" | "ar">("en");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<Record<FieldKey, LangVal>>({
    meta_title: { en: "", ar: "" },
    meta_description: { en: "", ar: "" },
    meta_keywords: { en: "", ar: "" },
  });
  const [ogImage, setOgImage] = useState("");

  const keywordAnalysis = useMemo(
    () => ({
      en: analyzeIndustryKeywords(
        industryName,
        { headline, description, painPoints, solutions, useCases },
        "en",
      ),
      ar: analyzeIndustryKeywords(
        industryName,
        { headline, description, painPoints, solutions, useCases },
        "ar",
      ),
    }),
    [industryName, headline, description, painPoints, solutions, useCases],
  );

  // Find existing rows for this industry
  const rows = useMemo(() => {
    const map = new Map<string, { id: string; en: string; ar: string }>();
    if (!allContent) return map;
    for (const r of allContent) {
      if (r.page !== pageKey || r.section !== "seo") continue;
      map.set(r.content_key, { id: r.id, en: r.value ?? "", ar: r.value_ar ?? "" });
    }
    return map;
  }, [allContent, pageKey]);

  // Hydrate local state when rows arrive
  useEffect(() => {
    setPending({
      meta_title: { en: rows.get("meta_title")?.en ?? "", ar: rows.get("meta_title")?.ar ?? "" },
      meta_description: {
        en: rows.get("meta_description")?.en ?? "",
        ar: rows.get("meta_description")?.ar ?? "",
      },
      meta_keywords: {
        en: rows.get("meta_keywords")?.en ?? "",
        ar: rows.get("meta_keywords")?.ar ?? "",
      },
    });
    setOgImage(rows.get("og_image")?.en ?? "");
  }, [rows]);

  if (!canEdit || !enabled) return null;

  const setField = (key: FieldKey, lang: "en" | "ar", value: string) =>
    setPending((p) => ({ ...p, [key]: { ...p[key], [lang]: value } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const writeRow = async (key: string, en: string, ar: string, contentType = "text") => {
        const existing = rows.get(key);
        // If both blank and nothing exists, skip (keeps the table tidy)
        if (!existing && !en && !ar) return;
        await save.mutateAsync({
          id: existing?.id,
          page: pageKey,
          section: "seo",
          content_key: key,
          value: en,
          value_ar: ar,
          content_type: contentType,
          sort_order: 0,
        });
      };

      await writeRow("meta_title", pending.meta_title.en.trim(), pending.meta_title.ar.trim());
      await writeRow(
        "meta_description",
        pending.meta_description.en.trim(),
        pending.meta_description.ar.trim(),
      );
      await writeRow("meta_keywords", pending.meta_keywords.en.trim(), pending.meta_keywords.ar.trim());
      await writeRow("og_image", ogImage.trim(), "", "image_url");

      toast({
        title: "SEO overrides saved",
        description: "These will be picked up on next page load.",
      });
    } catch (err: any) {
      toast({
        title: "Could not save",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Helpers — show admin how the live values compare to the fallback
  const titleVal = pending.meta_title[activeLang];
  const descVal = pending.meta_description[activeLang];
  const keywordsVal = pending.meta_keywords[activeLang];
  const titleLen = titleVal.length;
  const descLen = descVal.length;
  const activeAnalysis = keywordAnalysis[activeLang];

  const applySuggestedKeywords = () => {
    setPending((current) => ({
      ...current,
      meta_keywords: {
        en: current.meta_keywords.en || keywordAnalysis.en.recommendedMetaKeywords,
        ar: current.meta_keywords.ar || keywordAnalysis.ar.recommendedMetaKeywords,
      },
    }));
  };

  return (
    <div className="container-max px-4 sm:px-6 lg:px-8 mt-3">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search size={16} className="text-accent shrink-0" />
            <span className="text-sm font-semibold text-foreground">SEO overrides</span>
            <span className="text-xs text-muted-foreground truncate">
              Per-industry meta title, description &amp; share image. Empty = auto.
            </span>
          </div>
          {open ? (
            <ChevronUp size={16} className="text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground shrink-0" />
          )}
        </button>

        {open && (
          <div className="border-t border-border p-4 space-y-4">
            {/* Language tabs */}
            <div className="inline-flex rounded-md border border-border p-0.5 bg-muted">
              {(["en", "ar"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveLang(l)}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    activeLang === l
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>

            {/* Meta title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Meta title</Label>
                <span
                  className={`text-[11px] ${
                    titleLen > 60 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {titleLen}/60
                </span>
              </div>
              <Input
                value={titleVal}
                onChange={(e) => setField("meta_title", activeLang, e.target.value)}
                placeholder={activeLang === "en" ? fallbackTitle : "اتركه فارغاً للاستخدام التلقائي"}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
              <p className="text-[11px] text-muted-foreground">
                Leave blank to use auto:{" "}
                <span className="italic">{fallbackTitle}</span>
              </p>
            </div>

            {/* Meta description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Meta description</Label>
                <span
                  className={`text-[11px] ${
                    descLen > 160 ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {descLen}/160
                </span>
              </div>
              <Textarea
                value={descVal}
                onChange={(e) => setField("meta_description", activeLang, e.target.value)}
                placeholder={
                  activeLang === "en" ? fallbackDescription : "اتركه فارغاً للاستخدام التلقائي"
                }
                rows={3}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                Leave blank to use auto:{" "}
                <span className="italic">{fallbackDescription.slice(0, 160)}</span>
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">Keyword analysis</p>
                  <p className="text-[11px] text-muted-foreground">
                    Website themes + top target keywords tailored for this industry page.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={applySuggestedKeywords}>
                  <Sparkles size={14} /> Apply suggestions
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Meta keywords</Label>
                <Textarea
                  value={keywordsVal}
                  onChange={(e) => setField("meta_keywords", activeLang, e.target.value)}
                  rows={3}
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  placeholder={activeAnalysis.recommendedMetaKeywords}
                />
                <p className="text-[11px] text-muted-foreground line-clamp-2">
                  Suggested: <span className="italic">{activeAnalysis.recommendedMetaKeywords}</span>
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { label: "Website themes", values: activeAnalysis.websiteThemes },
                  { label: "Primary keywords", values: activeAnalysis.primaryKeywords },
                  { label: "Solution keywords", values: activeAnalysis.solutionKeywords },
                  { label: "Long-tail keywords", values: activeAnalysis.longTailKeywords },
                  { label: "Local keywords", values: activeAnalysis.localKeywords },
                ].map((group) => (
                  <div key={group.label} className="rounded-md border border-border bg-background p-3">
                    <p className="text-[11px] font-semibold text-foreground mb-2">{group.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.values.map((keyword) => (
                        <span
                          key={keyword}
                          className="inline-flex items-center rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OG image */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Share image (Open Graph)</Label>
              <div className="flex items-start gap-3">
                <div className="w-32 h-20 rounded-md border border-border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                  {ogImage ? (
                    <img src={ogImage} alt="OG preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={20} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <Input
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    placeholder="https://… (or pick from media)"
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPickerOpen(true)}
                    >
                      <ImageIcon size={14} /> Choose…
                    </Button>
                    {ogImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setOgImage("")}
                      >
                        <X size={14} /> Clear
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    1200×630 recommended. Used when the page is shared on social media.
                  </p>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Saving…" : "Save SEO overrides"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(url) => {
          setOgImage(url);
          setPickerOpen(false);
        }}
        uploadFolder="industries"
        title="Pick a share image"
      />
    </div>
  );
};

export default IndustrySeoOverrideEditor;
