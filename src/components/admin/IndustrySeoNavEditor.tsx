import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAllSiteContent, useSaveContent } from "@/hooks/useSiteContent";
import { useToast } from "@/hooks/use-toast";

type Props = {
  slug: string;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackH1: string;
};

type LangValue = { en: string; ar: string };

const IndustrySeoNavEditor = ({ slug, fallbackTitle, fallbackDescription, fallbackH1 }: Props) => {
  const { data: allContent } = useAllSiteContent();
  const save = useSaveContent();
  const { toast } = useToast();
  const pageKey = `industry_${slug}`;
  const [open, setOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<"en" | "ar">("en");
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState<LangValue>({ en: "", ar: "" });
  const [description, setDescription] = useState<LangValue>({ en: "", ar: "" });
  const [h1, setH1] = useState<LangValue>({ en: "", ar: "" });

  const rows = useMemo(() => {
    const map = new Map<string, { id: string; value: string; value_ar: string }>();
    for (const row of allContent ?? []) {
      if (row.page !== pageKey) continue;
      if ((row.section === "seo" && ["meta_title", "meta_description"].includes(row.content_key)) || (row.section === "hero" && row.content_key === "headline")) {
        map.set(`${row.section}:${row.content_key}`, {
          id: row.id,
          value: row.value ?? "",
          value_ar: row.value_ar ?? "",
        });
      }
    }
    return map;
  }, [allContent, pageKey]);

  useEffect(() => {
    setTitle({
      en: rows.get("seo:meta_title")?.value ?? "",
      ar: rows.get("seo:meta_title")?.value_ar ?? "",
    });
    setDescription({
      en: rows.get("seo:meta_description")?.value ?? "",
      ar: rows.get("seo:meta_description")?.value_ar ?? "",
    });
    setH1({
      en: rows.get("hero:headline")?.value ?? "",
      ar: rows.get("hero:headline")?.value_ar ?? "",
    });
  }, [rows]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const persist = async (section: string, content_key: string, value: string, value_ar: string) => {
        const existing = rows.get(`${section}:${content_key}`);
        await save.mutateAsync({
          id: existing?.id,
          page: pageKey,
          section,
          content_key,
          value,
          value_ar,
          sort_order: 0,
          content_type: "text",
        });
      };

      await persist("seo", "meta_title", title.en.trim(), title.ar.trim());
      await persist("seo", "meta_description", description.en.trim(), description.ar.trim());
      await persist("hero", "headline", h1.en.trim(), h1.ar.trim());
      toast({ title: "Industry SEO saved" });
    } catch (error: any) {
      toast({ title: "Save failed", description: error?.message ?? "Unknown error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const currentTitle = activeLang === "en" ? title.en : title.ar;
  const currentDescription = activeLang === "en" ? description.en : description.ar;
  const currentH1 = activeLang === "en" ? h1.en : h1.ar;

  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-muted/40 transition-colors"
      >
        <div>
          <p className="text-xs font-semibold text-foreground">Industry SEO</p>
          <p className="text-[11px] text-muted-foreground">Auto title, meta description, and H1 with optional overrides.</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border p-3 space-y-3">
          <div className="inline-flex rounded-md border border-border p-0.5 bg-background">
            {(["en", "ar"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 text-xs rounded ${activeLang === lang ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
              >
                {lang === "en" ? "English" : "العربية"}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Meta title</Label>
            <Input
              value={currentTitle}
              dir={activeLang === "ar" ? "rtl" : "ltr"}
              placeholder={activeLang === "en" ? fallbackTitle : "اتركه فارغًا للاستخدام التلقائي"}
              onChange={(e) =>
                setTitle((prev) => ({ ...prev, [activeLang]: e.target.value }))
              }
            />
            <p className="text-[11px] text-muted-foreground">Auto: {fallbackTitle}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Meta description</Label>
            <Textarea
              rows={3}
              value={currentDescription}
              dir={activeLang === "ar" ? "rtl" : "ltr"}
              placeholder={activeLang === "en" ? fallbackDescription : "اتركه فارغًا للاستخدام التلقائي"}
              onChange={(e) =>
                setDescription((prev) => ({ ...prev, [activeLang]: e.target.value }))
              }
            />
            <p className="text-[11px] text-muted-foreground line-clamp-2">Auto: {fallbackDescription}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">H1</Label>
            <Input
              value={currentH1}
              dir={activeLang === "ar" ? "rtl" : "ltr"}
              placeholder={activeLang === "en" ? fallbackH1 : "اتركه فارغًا للاستخدام التلقائي"}
              onChange={(e) =>
                setH1((prev) => ({ ...prev, [activeLang]: e.target.value }))
              }
            />
            <p className="text-[11px] text-muted-foreground">Auto: {fallbackH1}</p>
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save SEO"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrySeoNavEditor;