import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, ImagePlus, X } from "lucide-react";
import {
  useAdminIntegrations,
  useSaveIntegration,
  useDeleteIntegration,
  Integration,
  IntegrationCategory,
  IntegrationStatus,
  INTEGRATION_CATEGORIES,
  INTEGRATION_STATUSES,
} from "@/hooks/useIntegrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MediaPicker from "@/components/admin/MediaPicker";

type Form = {
  id?: string;
  name: string;
  name_ar: string;
  slug: string;
  category: IntegrationCategory;
  description: string;
  description_ar: string;
  logo_url: string;
  status: IntegrationStatus;
  cta_label: string;
  cta_label_ar: string;
  cta_link: string;
  sort_order: number;
  published: boolean;
};

const empty: Form = {
  name: "",
  name_ar: "",
  slug: "",
  category: "productivity",
  description: "",
  description_ar: "",
  logo_url: "",
  status: "available",
  cta_label: "",
  cta_label_ar: "",
  cta_link: "/contact",
  sort_order: 0,
  published: true,
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const CATEGORY_LABEL: Record<IntegrationCategory, string> = {
  erp: "ERP Systems",
  crm: "CRM Systems",
  cloud_storage: "Cloud Storage",
  productivity: "Productivity Tools",
  custom_api: "Custom API",
};

const STATUS_LABEL: Record<IntegrationStatus, string> = {
  available: "Available",
  coming_soon: "Coming Soon",
  custom: "Custom",
};

const STATUS_BADGE: Record<IntegrationStatus, string> = {
  available: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  coming_soon: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  custom: "bg-accent/10 text-accent border-accent/20",
};

const IntegrationsManager = () => {
  const { data: rows = [], isLoading } = useAdminIntegrations();
  const save = useSaveIntegration();
  const del = useDeleteIntegration();
  const { toast } = useToast();
  const [form, setForm] = useState<Form>(empty);
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filter, setFilter] = useState<IntegrationCategory | "all">("all");

  const visible = rows.filter((r) => filter === "all" || r.category === filter);

  const startNew = () => {
    setForm({ ...empty, sort_order: (rows[rows.length - 1]?.sort_order ?? 0) + 10 });
    setOpen(true);
  };

  const startEdit = (r: Integration) => {
    setForm({
      id: r.id,
      name: r.name,
      name_ar: r.name_ar ?? "",
      slug: r.slug,
      category: r.category,
      description: r.description ?? "",
      description_ar: r.description_ar ?? "",
      logo_url: r.logo_url ?? "",
      status: r.status,
      cta_label: r.cta_label ?? "",
      cta_label_ar: r.cta_label_ar ?? "",
      cta_link: r.cta_link ?? "/contact",
      sort_order: r.sort_order,
      published: r.published,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    save.mutate(form, {
      onSuccess: () => {
        toast({ title: form.id ? "Integration updated" : "Integration created" });
        setOpen(false);
        setForm(empty);
      },
      onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const remove = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    del.mutate(id, {
      onSuccess: () => toast({ title: "Deleted" }),
      onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Integrations</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage the cards shown on the public Integrations page.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1" onClick={startNew}>
              <Plus size={16} /> New integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit integration" : "New integration"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name (EN) *</label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                        slug: form.id ? form.slug : slugify(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Name (AR)</label>
                  <Input
                    value={form.name_ar}
                    onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Slug *</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category *</label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v as IntegrationCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTEGRATION_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {CATEGORY_LABEL[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description (EN)</label>
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description (AR)</label>
                <Textarea
                  rows={2}
                  dir="rtl"
                  value={form.description_ar}
                  onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Logo</label>
                <div className="flex items-center gap-3">
                  {form.logo_url ? (
                    <div className="relative w-14 h-14 rounded-lg border border-border bg-muted/40 overflow-hidden">
                      <img src={form.logo_url} alt="logo" className="w-full h-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, logo_url: "" })}
                        className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5"
                        aria-label="Remove logo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">
                      <ImagePlus size={18} />
                    </div>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                    {form.logo_url ? "Change" : "Pick from media"}
                  </Button>
                  <Input
                    placeholder="or paste URL"
                    value={form.logo_url}
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  />
                </div>
                <MediaPicker
                  open={pickerOpen}
                  onOpenChange={setPickerOpen}
                  onSelect={(url) => setForm({ ...form, logo_url: url })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as IntegrationStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTEGRATION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Sort order</label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">CTA label (EN)</label>
                  <Input
                    value={form.cta_label}
                    onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                    placeholder="Learn more"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CTA label (AR)</label>
                  <Input
                    value={form.cta_label_ar}
                    onChange={(e) => setForm({ ...form, cta_label_ar: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">CTA link</label>
                <Input
                  value={form.cta_link}
                  onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                  placeholder="/contact or https://…"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.published}
                  onCheckedChange={(v) => setForm({ ...form, published: v })}
                  id="pub"
                />
                <label htmlFor="pub" className="text-sm">
                  Published (visible to visitors)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={save.isPending}
                >
                  {save.isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-full text-xs border ${
            filter === "all"
              ? "bg-accent text-accent-foreground border-accent"
              : "bg-card text-foreground/70 border-border hover:border-accent/40"
          }`}
        >
          All ({rows.length})
        </button>
        {INTEGRATION_CATEGORIES.map((c) => {
          const count = rows.filter((r) => r.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 rounded-full text-xs border ${
                filter === c
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-foreground/70 border-border hover:border-accent/40"
              }`}
            >
              {CATEGORY_LABEL[c]} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted/40 border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
          No integrations yet. Click "New integration" to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-accent/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center overflow-hidden shrink-0">
                {r.logo_url ? (
                  <img src={r.logo_url} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">{r.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground truncate">{r.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${STATUS_BADGE[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {CATEGORY_LABEL[r.category]}
                  </span>
                  {!r.published && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground inline-flex items-center gap-1">
                      <EyeOff size={10} /> Hidden
                    </span>
                  )}
                </div>
                {r.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{r.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    save.mutate(
                      {
                        id: r.id,
                        name: r.name,
                        name_ar: r.name_ar,
                        slug: r.slug,
                        category: r.category,
                        description: r.description,
                        description_ar: r.description_ar,
                        logo_url: r.logo_url,
                        status: r.status,
                        cta_label: r.cta_label,
                        cta_label_ar: r.cta_label_ar,
                        cta_link: r.cta_link,
                        sort_order: r.sort_order,
                        published: !r.published,
                      },
                      {
                        onSuccess: () =>
                          toast({ title: r.published ? "Hidden from site" : "Published" }),
                      },
                    )
                  }
                  className="gap-1"
                  title={r.published ? "Hide from site" : "Publish"}
                >
                  {r.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => startEdit(r)} title="Edit">
                  <Edit size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(r.id, r.name)}
                  className="text-destructive hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IntegrationsManager;
