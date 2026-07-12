import { ReactNode, useState, useEffect } from "react";
import { Save, Image as ImageIcon, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAllSiteContent, useSaveContent, SiteContentItem } from "@/hooks/useSiteContent";
import MediaPicker from "./MediaPicker";

/** Field definition for a single piece of editable content */
export type EditableField =
  | {
      kind: "text" | "textarea";
      key: string;
      label: string;
      placeholder?: string;
      bilingual?: boolean; // also expose Arabic value
    }
  | {
      kind: "image";
      key: string;
      label: string;
      help?: string;
    };

export interface SectionConfig {
  /** Section label in the UI */
  title: string;
  description?: string;
  /** Section name used in DB (site_content.section) for text fields */
  textSection: string;
  /** Section name used for image overrides (default "overrides") */
  imageSection?: string;
  fields: EditableField[];
}

interface PageEditorProps {
  page: string;
  /** Page title shown at the top */
  pageTitle: string;
  sections: SectionConfig[];
  /** Optional content rendered above the sections (e.g. logos manager) */
  topSlot?: ReactNode;
}

/**
 * Reusable per-page CMS editor.
 * - Text/textarea fields: site_content row with section=textSection, type=text
 * - Image fields: site_content row with section=imageSection (default "overrides"), type=image_url
 * - Save button persists everything (insert or update) in one shot.
 */
const PageEditor = ({ page, pageTitle, sections, topSlot }: PageEditorProps) => {
  const { toast } = useToast();
  const { data: allContent, isLoading } = useAllSiteContent();
  const saveContent = useSaveContent();

  type FieldState = { value: string; value_ar: string };
  const [state, setState] = useState<Record<string, FieldState>>({});
  const [pickerKey, setPickerKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Stable id for an item key
  const idOf = (section: string, key: string) => `${section}::${key}`;

  // Hydrate from CMS
  useEffect(() => {
    if (!allContent) return;
    const next: Record<string, FieldState> = {};
    for (const sec of sections) {
      for (const f of sec.fields) {
        const section = f.kind === "image" ? (sec.imageSection ?? "overrides") : sec.textSection;
        const item = allContent.find(
          (c) => c.page === page && c.section === section && c.content_key === f.key
        );
        next[idOf(section, f.key)] = {
          value: item?.value ?? "",
          value_ar: item?.value_ar ?? "",
        };
      }
    }
    setState(next);
  }, [allContent, page, sections]);

  const update = (section: string, key: string, patch: Partial<FieldState>) => {
    setState((prev) => ({
      ...prev,
      [idOf(section, key)]: { ...prev[idOf(section, key)], ...patch },
    }));
  };

  const findItem = (section: string, key: string): SiteContentItem | undefined => {
    return allContent?.find(
      (c) => c.page === page && c.section === section && c.content_key === key
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const sec of sections) {
        for (const f of sec.fields) {
          const isImage = f.kind === "image";
          const section = isImage ? (sec.imageSection ?? "overrides") : sec.textSection;
          const fieldState = state[idOf(section, f.key)];
          if (!fieldState) continue;
          // Skip purely empty fields that don't already exist
          const existing = findItem(section, f.key);
          if (!existing && !fieldState.value.trim() && !fieldState.value_ar.trim()) continue;

          await saveContent.mutateAsync({
            id: existing?.id,
            page,
            section,
            content_key: f.key,
            value: fieldState.value,
            value_ar: fieldState.value_ar,
            content_type: isImage ? "image_url" : "text",
            sort_order: existing?.sort_order ?? 0,
          });
        }
      }
      toast({ title: "Page saved successfully" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Loading content...</p>;

  return (
    <div>
      <div className="flex justify-between items-start gap-3 mb-6">
        <h2 className="text-xl font-bold text-foreground">{pageTitle}</h2>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {topSlot && <div className="mb-6">{topSlot}</div>}

      <div className="space-y-6">
        {sections.map((sec) => (
          <div key={sec.title} className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-5 py-3 bg-muted/40 border-b border-border">
              <h3 className="font-semibold text-foreground">{sec.title}</h3>
              {sec.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{sec.description}</p>
              )}
            </div>
            <div className="p-5 space-y-5">
              {sec.fields.map((f) => {
                const section = f.kind === "image" ? (sec.imageSection ?? "overrides") : sec.textSection;
                const fs = state[idOf(section, f.key)] ?? { value: "", value_ar: "" };

                if (f.kind === "image") {
                  return (
                    <div key={f.key}>
                      <label className="text-sm font-semibold text-foreground mb-1 block">
                        {f.label}
                      </label>
                      {f.help && (
                        <p className="text-xs text-muted-foreground mb-2">{f.help}</p>
                      )}
                      {fs.value ? (
                        <div className="relative inline-block mb-2 rounded-lg overflow-hidden border border-border">
                          <img
                            src={fs.value}
                            alt={f.label}
                            className="max-h-40 max-w-full object-contain bg-muted/30"
                          />
                          <button
                            type="button"
                            onClick={() => update(section, f.key, { value: "" })}
                            className="absolute top-1 right-1 bg-background/90 hover:bg-destructive hover:text-destructive-foreground rounded-full p-1 shadow"
                            title="Remove (revert to animation)"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center mb-2 bg-muted/20">
                          <ImageIcon size={22} className="mx-auto mb-1.5 text-muted-foreground/40" />
                          <p className="text-xs text-muted-foreground">
                            No image — animation will be shown
                          </p>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPickerKey(`${section}::${f.key}`)}
                        className="gap-1"
                      >
                        <ImagePlus size={14} />
                        {fs.value ? "Change image" : "Choose image"}
                      </Button>
                    </div>
                  );
                }

                return (
                  <div key={f.key}>
                    <label className="text-sm font-semibold text-foreground mb-1 block">
                      {f.label}
                    </label>
                    <div className={f.bilingual ? "grid grid-cols-1 md:grid-cols-2 gap-3" : ""}>
                      <div>
                        {f.bilingual && (
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                            English
                          </span>
                        )}
                        {f.kind === "textarea" ? (
                          <Textarea
                            value={fs.value}
                            onChange={(e) => update(section, f.key, { value: e.target.value })}
                            placeholder={f.placeholder}
                            rows={3}
                            className="text-sm"
                          />
                        ) : (
                          <Input
                            value={fs.value}
                            onChange={(e) => update(section, f.key, { value: e.target.value })}
                            placeholder={f.placeholder}
                            className="text-sm"
                          />
                        )}
                      </div>
                      {f.bilingual && (
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                            Arabic
                          </span>
                          {f.kind === "textarea" ? (
                            <Textarea
                              value={fs.value_ar}
                              onChange={(e) => update(section, f.key, { value_ar: e.target.value })}
                              placeholder="(اختياري)"
                              dir="rtl"
                              rows={3}
                              className="text-sm"
                            />
                          ) : (
                            <Input
                              value={fs.value_ar}
                              onChange={(e) => update(section, f.key, { value_ar: e.target.value })}
                              placeholder="(اختياري)"
                              dir="rtl"
                              className="text-sm"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <MediaPicker
        open={pickerKey !== null}
        onOpenChange={(v) => !v && setPickerKey(null)}
        onSelect={(url) => {
          if (!pickerKey) return;
          const [section, key] = pickerKey.split("::");
          update(section, key, { value: url });
        }}
        uploadFolder={page}
        title="Choose image"
      />
    </div>
  );
};

export default PageEditor;
