import { useState } from "react";
import { Image as ImageIcon, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  useAllSiteContent,
  useSaveContent,
  useDeleteContent,
  SiteContentItem,
} from "@/hooks/useSiteContent";
import MediaPicker from "./MediaPicker";

type Slot = {
  key: string;
  label: string;
  help: string;
  recommended: string;
};

const BRANDING_SLOTS: Slot[] = [
  {
    key: "logo_navbar",
    label: "Navbar logo (light)",
    help: "Shown in the top navigation bar across the public site.",
    recommended: "PNG/SVG, transparent background, ~300×96px",
  },
  {
    key: "logo_footer",
    label: "Footer logo (dark)",
    help: "Shown in the dark footer panel.",
    recommended: "PNG/SVG, transparent background, ~300×96px",
  },
  {
    key: "logo_powered_by",
    label: "Powered-by logo",
    help: "Small partner logo shown next to the 'Powered by' label in the footer.",
    recommended: "PNG, transparent, ~200×60px",
  },
  {
    key: "favicon",
    label: "Favicon / browser icon",
    help: "Shown in the browser tab. Update via index.html for full PWA support.",
    recommended: "PNG/ICO, square, 512×512px",
  },
  {
    key: "og_image",
    label: "Default social share image (Open Graph)",
    help: "Used when pages are shared on LinkedIn / Facebook / WhatsApp without a page-specific image.",
    recommended: "JPG/PNG, 1200×630px",
  },
];

const PAGE = "branding";
const SECTION = "logos";

const BrandingEditor = () => {
  const { toast } = useToast();
  const { data: all = [], isLoading } = useAllSiteContent();
  const saveContent = useSaveContent();
  const deleteContent = useDeleteContent();

  const [picker, setPicker] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const items = (all as SiteContentItem[]).filter(
    (r) => r.page === PAGE && r.section === SECTION
  );
  const findItem = (key: string) => items.find((r) => r.content_key === key);

  const valueFor = (key: string) => {
    if (drafts[key] !== undefined) return drafts[key];
    return findItem(key)?.value || "";
  };

  const persist = async (key: string, value: string) => {
    const existing = findItem(key);
    await saveContent.mutateAsync({
      id: existing?.id,
      page: PAGE,
      section: SECTION,
      content_key: key,
      content_type: "image_url",
      value,
      value_ar: null,
      sort_order: existing?.sort_order ?? 0,
    });
    setDrafts((d) => {
      const next = { ...d };
      delete next[key];
      return next;
    });
  };

  const clearSlot = async (key: string) => {
    const existing = findItem(key);
    if (existing) await deleteContent.mutateAsync(existing.id);
    setDrafts((d) => {
      const next = { ...d };
      delete next[key];
      return next;
    });
    toast({ title: "Logo cleared", description: "Falling back to the default bundled image." });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground">Branding & logos</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Replace the logos used in the navigation bar, footer, browser tab and social share previews. Leave any slot empty to use the bundled default.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {BRANDING_SLOTS.map((slot) => {
            const v = valueFor(slot.key);
            const dirty = drafts[slot.key] !== undefined && drafts[slot.key] !== (findItem(slot.key)?.value || "");
            return (
              <div key={slot.key} className="border border-border rounded-lg p-4 space-y-3 bg-background/40">
                <div>
                  <p className="text-sm font-semibold text-foreground">{slot.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{slot.help}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">Recommended: {slot.recommended}</p>
                </div>

                {v ? (
                  <div className="rounded-md border border-border bg-muted/30 p-3 flex items-center justify-center min-h-[80px]">
                    <img src={v} alt={slot.label} className="max-h-16 w-auto object-contain" />
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-border p-3 flex items-center justify-center min-h-[80px] text-xs text-muted-foreground gap-2">
                    <ImageIcon size={14} /> Using bundled default
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Input
                    value={v}
                    onChange={(e) => setDrafts((d) => ({ ...d, [slot.key]: e.target.value }))}
                    placeholder="Image URL or pick from media library"
                    className="text-xs"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => setPicker(slot.key)}>
                    Pick
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => persist(slot.key, v)}
                    disabled={!dirty || saveContent.isPending}
                    className="gap-1"
                  >
                    <Save size={14} /> Save
                  </Button>
                  {findItem(slot.key) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive gap-1"
                      onClick={() => clearSlot(slot.key)}
                    >
                      <X size={14} /> Reset to default
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <MediaPicker
        open={!!picker}
        onOpenChange={(v) => { if (!v) setPicker(null); }}
        title="Pick a brand asset"
        uploadFolder="branding"
        onSelect={async (url) => {
          if (!picker) return;
          setDrafts((d) => ({ ...d, [picker]: url }));
          await persist(picker, url);
          setPicker(null);
          toast({ title: "Logo updated" });
        }}
      />
    </div>
  );
};

export default BrandingEditor;
