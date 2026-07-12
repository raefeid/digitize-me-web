import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useFeatures,
  useSaveFeature,
  useDeleteFeature,
  type FeatureRow,
} from "@/hooks/useFeatures";
import SectionsEditor from "@/components/admin/SectionsEditor";
import SortableGrid from "@/components/cms/SortableGrid";
import { useReorder, buildSortPayload } from "@/hooks/useReorder";

type FormState = Omit<FeatureRow, "id" | "created_at" | "updated_at"> & { id?: string };

const empty: FormState = {
  slug: "",
  icon: "Sparkles",
  sort_order: 0,
  published: true,
  hero_badge: "",
  hero_badge_ar: "",
  hero_title: "",
  hero_title_ar: "",
  hero_desc: "",
  hero_desc_ar: "",
  hero_image_url: "",
  cta_primary_label: "",
  cta_primary_label_ar: "",
  cta_primary_link: "",
  cta_secondary_label: "",
  cta_secondary_label_ar: "",
  cta_secondary_link: "",
  sections: [],
  sections_ar: [],
  seo_title: "",
  seo_title_ar: "",
  seo_description: "",
  seo_description_ar: "",
  seo_og_image: "",
};

const FeaturesManager = () => {
  const { data: features, isLoading } = useFeatures();
  const save = useSaveFeature();
  const remove = useDeleteFeature();
  const reorder = useReorder({ table: "features" });
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);

  // Auto-open the edit dialog when the admin arrives via
  // /admin?tab=features&edit=<id> (deep-link from the live page edit bar).
  useEffect(() => {
    if (!features?.length) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (!editId) return;
    const target = features.find((f) => f.id === editId);
    if (!target) return;
    setForm({ ...target });
    setOpen(true);
    params.delete("edit");
    const newSearch = params.toString();
    const url =
      window.location.pathname +
      (newSearch ? `?${newSearch}` : "") +
      window.location.hash;
    window.history.replaceState({}, "", url);
  }, [features]);

  const openNew = () => {
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (f: FeatureRow) => {
    setForm({ ...f });
    setOpen(true);
  };

  /**
   * Duplicate an existing feature card. We strip the id (so save() inserts a
   * new row), suffix the slug with `-copy` (and a number if needed) to avoid
   * the unique-slug constraint, prepend "Copy of" to the title, and mark it
   * as Draft so the duplicate doesn't appear publicly until the admin
   * reviews + publishes it.
   */
  const openDuplicate = (f: FeatureRow) => {
    const existingSlugs = new Set((features ?? []).map((x) => x.slug));
    let baseSlug = `${f.slug}-copy`;
    let candidate = baseSlug;
    let n = 2;
    while (existingSlugs.has(candidate)) {
      candidate = `${baseSlug}-${n++}`;
    }
    const { id, created_at, updated_at, ...rest } = f;
    setForm({
      ...rest,
      slug: candidate,
      hero_title: f.hero_title ? `Copy of ${f.hero_title}` : f.hero_title,
      hero_title_ar: f.hero_title_ar ? `نسخة من ${f.hero_title_ar}` : f.hero_title_ar,
      published: false,
      sort_order: (f.sort_order ?? 0) + 1,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.slug || !form.hero_title) {
      toast({ title: "Slug and hero title are required", variant: "destructive" });
      return;
    }
    try {
      await save.mutateAsync({ ...form });
      toast({ title: form.id ? "Feature updated" : "Feature created" });
      setOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const togglePublish = async (f: FeatureRow) => {
    try {
      await save.mutateAsync({ ...f, published: !f.published });
      toast({ title: !f.published ? "Published" : "Unpublished" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this feature page? This can't be undone.")) return;
    try {
      await remove.mutateAsync(id);
      toast({ title: "Feature deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Feature pages</h2>
          <p className="text-sm text-muted-foreground">
            Each feature gets a public page at <code className="text-xs">/features/&lt;slug&gt;</code>.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gap-1.5">
              <Plus size={16} /> New feature
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit feature" : "New feature"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-4">
              {/* Basics */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Slug *</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="ocr"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Icon (Lucide name)
                  </label>
                  <Input
                    value={form.icon ?? ""}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="Sparkles"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Sort order</label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Switch
                    checked={form.published}
                    onCheckedChange={(v) => setForm({ ...form, published: v })}
                  />
                  <span className="text-sm">Published</span>
                </div>
              </div>

              {/* Hero EN */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-2">Hero — English</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Hero badge (EN)"
                    value={form.hero_badge ?? ""}
                    onChange={(e) => setForm({ ...form, hero_badge: e.target.value })}
                  />
                  <Input
                    placeholder="Hero title (EN) *"
                    value={form.hero_title}
                    onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Hero description (EN)"
                    value={form.hero_desc ?? ""}
                    onChange={(e) => setForm({ ...form, hero_desc: e.target.value })}
                  />
                </div>
              </div>

              {/* Hero AR */}
              <div className="border-t pt-4" dir="rtl">
                <h4 className="text-sm font-semibold mb-2">Hero — العربية</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="شارة (AR)"
                    value={form.hero_badge_ar ?? ""}
                    onChange={(e) => setForm({ ...form, hero_badge_ar: e.target.value })}
                  />
                  <Input
                    placeholder="العنوان (AR)"
                    value={form.hero_title_ar ?? ""}
                    onChange={(e) => setForm({ ...form, hero_title_ar: e.target.value })}
                  />
                  <Textarea
                    placeholder="الوصف (AR)"
                    value={form.hero_desc_ar ?? ""}
                    onChange={(e) => setForm({ ...form, hero_desc_ar: e.target.value })}
                  />
                </div>
              </div>

              {/* CTAs */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-2">CTAs</h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Primary label (EN)"
                    value={form.cta_primary_label ?? ""}
                    onChange={(e) => setForm({ ...form, cta_primary_label: e.target.value })}
                  />
                  <Input
                    placeholder="Primary label (AR)"
                    value={form.cta_primary_label_ar ?? ""}
                    onChange={(e) => setForm({ ...form, cta_primary_label_ar: e.target.value })}
                  />
                  <Input
                    placeholder="Primary link (e.g. /contact)"
                    value={form.cta_primary_link ?? ""}
                    onChange={(e) => setForm({ ...form, cta_primary_link: e.target.value })}
                    className="sm:col-span-2"
                  />
                  <Input
                    placeholder="Secondary label (EN)"
                    value={form.cta_secondary_label ?? ""}
                    onChange={(e) => setForm({ ...form, cta_secondary_label: e.target.value })}
                  />
                  <Input
                    placeholder="Secondary label (AR)"
                    value={form.cta_secondary_label_ar ?? ""}
                    onChange={(e) => setForm({ ...form, cta_secondary_label_ar: e.target.value })}
                  />
                  <Input
                    placeholder="Secondary link"
                    value={form.cta_secondary_link ?? ""}
                    onChange={(e) => setForm({ ...form, cta_secondary_link: e.target.value })}
                    className="sm:col-span-2"
                  />
                </div>
              </div>

              {/* Sections — visual editor */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-1">Sections — English</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Add, reorder, and edit content blocks visually.
                </p>
                <SectionsEditor
                  value={form.sections}
                  onChange={(next) => setForm({ ...form, sections: next })}
                />
              </div>
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-1">Sections — العربية</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Leave empty to fall back to the English sections.
                </p>
                <SectionsEditor
                  value={form.sections_ar}
                  onChange={(next) => setForm({ ...form, sections_ar: next })}
                  rtl
                />
              </div>

              {/* SEO */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-2">SEO</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Meta title (EN)"
                    value={form.seo_title ?? ""}
                    onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                  />
                  <Input
                    placeholder="Meta title (AR)"
                    value={form.seo_title_ar ?? ""}
                    onChange={(e) => setForm({ ...form, seo_title_ar: e.target.value })}
                  />
                  <Textarea
                    placeholder="Meta description (EN)"
                    value={form.seo_description ?? ""}
                    onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                  />
                  <Textarea
                    placeholder="Meta description (AR)"
                    value={form.seo_description_ar ?? ""}
                    onChange={(e) => setForm({ ...form, seo_description_ar: e.target.value })}
                  />
                  <Input
                    placeholder="OG image URL"
                    value={form.seo_og_image ?? ""}
                    onChange={(e) => setForm({ ...form, seo_og_image: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={save.isPending}>
                  {save.isPending ? "Saving…" : "Save feature"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !features?.length ? (
        <Card className="p-8 text-center text-muted-foreground text-sm">
          No features yet. Create your first one.
        </Card>
      ) : (
        <SortableGrid
          items={features}
          editMode={true}
          onReorder={(next) => reorder.mutate(buildSortPayload(next))}
          className="grid gap-3"
          renderItem={(f, dragHandle) => (
            <Card className="p-4 pl-12 flex items-center gap-4 flex-wrap relative">
              {dragHandle}
              <div className="flex-1 min-w-[220px]">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{f.hero_title || f.slug}</h3>
                  {!f.published && (
                    <span className="text-[10px] uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  /features/{f.slug} · sort {f.sort_order} · {f.sections?.length ?? 0} sections
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button asChild variant="ghost" size="sm">
                  <Link to={`/features/${f.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink size={14} />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => togglePublish(f)}>
                  {f.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(f)} title="Edit">
                  <Edit size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openDuplicate(f)} title="Duplicate">
                  <Copy size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(f.id)}
                  className="text-destructive hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          )}
        />
      )}
    </div>
  );
};

export default FeaturesManager;
