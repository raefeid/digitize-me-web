import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Briefcase, Zap, Info } from "lucide-react";
import { useSeoTemplates, useSaveSeoTemplate, useTemplateGlobals } from "@/hooks/useSeoTemplates";
import { renderTemplate, ALL_TOKENS, type TemplateKind } from "@/lib/seoTemplates";

/**
 * Admin UI for editing the SEO templates that drive auto-fill on new
 * industry/feature pages and the "Apply template" button in the SEO editor.
 *
 * Layout:
 *   - Tabs to switch between Industry / Feature templates
 *   - For each, three field editors (title / description / keywords) with
 *     EN+AR side by side
 *   - Live preview using a sample context so admins see what'll be rendered
 *   - Reference list of available {tokens}
 */

const FIELD_META: Record<
  "meta_title" | "meta_description" | "meta_keywords",
  { label: string; hint: string; type: "text" | "textarea" }
> = {
  meta_title: {
    label: "Meta title template",
    hint: "Becomes the page <title> and Google's blue link. Aim for under 60 chars after token expansion.",
    type: "text",
  },
  meta_description: {
    label: "Meta description template",
    hint: "Becomes the snippet under the link in Google. Aim for under 160 chars.",
    type: "textarea",
  },
  meta_keywords: {
    label: "Keywords template",
    hint: "Comma-separated keyword hints. Used internally for SERP score scoring.",
    type: "text",
  },
};

const KIND_META: Record<TemplateKind, { label: string; icon: typeof Briefcase; sample: any }> = {
  industry: {
    label: "Industry pages",
    icon: Briefcase,
    sample: {
      name: "Healthcare",
      slug: "healthcare",
      primary_keyword: "medical OCR",
      industry_keywords: "patient records, EHR digitization, medical scanning",
    },
  },
  feature: {
    label: "Feature pages",
    icon: Zap,
    sample: {
      name: "Bilingual OCR",
      slug: "bilingual-ocr",
      hero_title: "Arabic & English OCR in one click",
      hero_desc: "Extract text from scans in both languages with 99% accuracy.",
      primary_keyword: "Arabic OCR",
      industry_keywords: "Arabic OCR, English OCR, text extraction",
    },
  },
};

const SeoTemplatesEditor = () => {
  const { data: templates, isLoading } = useSeoTemplates();
  const saveTemplate = useSaveSeoTemplate();
  const globals = useTemplateGlobals();
  const { toast } = useToast();

  const [activeKind, setActiveKind] = useState<TemplateKind>("industry");
  // Local pending state so admins can edit freely before saving
  const [pending, setPending] = useState<
    Record<TemplateKind, Record<"meta_title" | "meta_description" | "meta_keywords", { en: string; ar: string }>>
  >({
    industry: {
      meta_title: { en: "", ar: "" },
      meta_description: { en: "", ar: "" },
      meta_keywords: { en: "", ar: "" },
    },
    feature: {
      meta_title: { en: "", ar: "" },
      meta_description: { en: "", ar: "" },
      meta_keywords: { en: "", ar: "" },
    },
  });
  const [savingField, setSavingField] = useState<string | null>(null);

  // Hydrate pending state once templates load
  useEffect(() => {
    if (!templates) return;
    setPending({
      industry: {
        meta_title: { en: templates.industry.en.meta_title, ar: templates.industry.ar.meta_title },
        meta_description: { en: templates.industry.en.meta_description, ar: templates.industry.ar.meta_description },
        meta_keywords: { en: templates.industry.en.meta_keywords, ar: templates.industry.ar.meta_keywords },
      },
      feature: {
        meta_title: { en: templates.feature.en.meta_title, ar: templates.feature.ar.meta_title },
        meta_description: { en: templates.feature.en.meta_description, ar: templates.feature.ar.meta_description },
        meta_keywords: { en: templates.feature.en.meta_keywords, ar: templates.feature.ar.meta_keywords },
      },
    });
  }, [templates]);

  const handleSave = async (
    field: "meta_title" | "meta_description" | "meta_keywords",
  ) => {
    setSavingField(`${activeKind}_${field}`);
    try {
      await saveTemplate.mutateAsync({
        kind: activeKind,
        field,
        en: pending[activeKind][field].en,
        ar: pending[activeKind][field].ar,
      });
      toast({ title: "Template saved", description: `${KIND_META[activeKind].label} → ${FIELD_META[field].label.toLowerCase()}.` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSavingField(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={18} /> Loading templates…
      </div>
    );
  }

  // Build sample preview context for the active kind
  const sampleCtx = { ...KIND_META[activeKind].sample, ...globals };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 bg-accent/5 border border-accent/20 rounded-xl p-4">
        <Sparkles size={20} className="text-accent shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground text-sm">SEO Templates</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Define reusable title, description, and keyword templates with{" "}
            <code className="text-[11px] bg-muted px-1 py-0.5 rounded">{`{tokens}`}</code> that auto-fill
            when new industry or feature pages are created. Use the "Apply template" button on any page
            in the SEO & Meta Tags editor to regenerate fields from the latest template.
          </p>
        </div>
      </div>

      {/* Kind selector */}
      <div className="flex gap-2">
        {(["industry", "feature"] as TemplateKind[]).map((k) => {
          const Icon = KIND_META[k].icon;
          return (
            <button
              key={k}
              onClick={() => setActiveKind(k)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                activeKind === k
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card border-border text-foreground hover:border-accent/50"
              }`}
            >
              <Icon size={16} />
              {KIND_META[k].label}
            </button>
          );
        })}
      </div>

      {/* Field editors */}
      <div className="space-y-6">
        {(["meta_title", "meta_description", "meta_keywords"] as const).map((field) => {
          const meta = FIELD_META[field];
          const enVal = pending[activeKind][field].en;
          const arVal = pending[activeKind][field].ar;
          const enPreview = renderTemplate(enVal, sampleCtx);
          const arPreview = renderTemplate(arVal, sampleCtx);
          const original = templates?.[activeKind];
          const dirty =
            (original?.en[field] ?? "") !== enVal || (original?.ar[field] ?? "") !== arVal;
          const saving = savingField === `${activeKind}_${field}`;

          return (
            <div key={field} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div>
                <Label className="text-sm font-semibold">{meta.label}</Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">{meta.hint}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">English</Label>
                  {meta.type === "textarea" ? (
                    <Textarea
                      value={enVal}
                      onChange={(e) =>
                        setPending((p) => ({
                          ...p,
                          [activeKind]: { ...p[activeKind], [field]: { ...p[activeKind][field], en: e.target.value } },
                        }))
                      }
                      rows={2}
                      className="mt-1 font-mono text-xs"
                    />
                  ) : (
                    <Input
                      value={enVal}
                      onChange={(e) =>
                        setPending((p) => ({
                          ...p,
                          [activeKind]: { ...p[activeKind], [field]: { ...p[activeKind][field], en: e.target.value } },
                        }))
                      }
                      className="mt-1 font-mono text-xs"
                    />
                  )}
                  <div className="mt-1.5 px-2 py-1.5 bg-muted/50 border border-border rounded text-[11px] text-foreground">
                    <span className="text-muted-foreground">Preview: </span>
                    {enPreview || <span className="italic text-muted-foreground">empty</span>}
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">العربية</Label>
                  {meta.type === "textarea" ? (
                    <Textarea
                      value={arVal}
                      dir="rtl"
                      onChange={(e) =>
                        setPending((p) => ({
                          ...p,
                          [activeKind]: { ...p[activeKind], [field]: { ...p[activeKind][field], ar: e.target.value } },
                        }))
                      }
                      rows={2}
                      className="mt-1 font-mono text-xs"
                    />
                  ) : (
                    <Input
                      value={arVal}
                      dir="rtl"
                      onChange={(e) =>
                        setPending((p) => ({
                          ...p,
                          [activeKind]: { ...p[activeKind], [field]: { ...p[activeKind][field], ar: e.target.value } },
                        }))
                      }
                      className="mt-1 font-mono text-xs"
                    />
                  )}
                  <div className="mt-1.5 px-2 py-1.5 bg-muted/50 border border-border rounded text-[11px] text-foreground" dir="rtl">
                    <span className="text-muted-foreground">معاينة: </span>
                    {arPreview || <span className="italic text-muted-foreground">فارغ</span>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => handleSave(field)}
                  disabled={!dirty || saving}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {saving ? <><Loader2 className="animate-spin mr-1.5" size={14} /> Saving…</> : "Save template"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Token reference */}
      <div className="bg-muted/30 border border-border rounded-xl p-4">
        <div className="flex items-start gap-2 mb-3">
          <Info size={16} className="text-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Available tokens</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Drop these into any template above. Missing tokens are stripped automatically.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {ALL_TOKENS.map((t) => (
            <div key={t.token} className="flex items-baseline gap-2 text-xs">
              <code className="text-[11px] bg-background border border-border px-1.5 py-0.5 rounded text-accent shrink-0">
                {t.token}
              </code>
              <span className="text-muted-foreground">{t.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeoTemplatesEditor;
