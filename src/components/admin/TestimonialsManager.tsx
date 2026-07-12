import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, ImagePlus, X } from "lucide-react";
import {
  useAdminTestimonials,
  useSaveTestimonial,
  useDeleteTestimonial,
  Testimonial,
} from "@/hooks/useTestimonials";
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
import MediaPicker from "@/components/admin/MediaPicker";
import SortableGrid from "@/components/cms/SortableGrid";
import { useReorder, buildSortPayload } from "@/hooks/useReorder";

type Form = {
  id?: string;
  author_name: string;
  author_name_ar: string;
  role: string;
  role_ar: string;
  company: string;
  company_ar: string;
  quote: string;
  quote_ar: string;
  avatar_url: string;
  company_logo_url: string;
  rating: number;
  featured: boolean;
  sort_order: number;
  published: boolean;
};

const empty: Form = {
  author_name: "",
  author_name_ar: "",
  role: "",
  role_ar: "",
  company: "",
  company_ar: "",
  quote: "",
  quote_ar: "",
  avatar_url: "",
  company_logo_url: "",
  rating: 5,
  featured: false,
  sort_order: 0,
  published: true,
};

const TestimonialsManager = () => {
  const { data: rows = [], isLoading } = useAdminTestimonials();
  const save = useSaveTestimonial();
  const del = useDeleteTestimonial();
  const reorder = useReorder({
    table: "testimonials",
    invalidateKeys: [["testimonials"], ["testimonials", "admin"]],
  });
  const { toast } = useToast();
  const [form, setForm] = useState<Form>(empty);
  const [open, setOpen] = useState(false);
  const [pickerType, setPickerType] = useState<"avatar" | "logo" | null>(null);

  const startNew = () => {
    setForm({ ...empty, sort_order: (rows[rows.length - 1]?.sort_order ?? 0) + 10 });
    setOpen(true);
  };

  const startEdit = (r: Testimonial) => {
    setForm({
      id: r.id,
      author_name: r.author_name,
      author_name_ar: r.author_name_ar ?? "",
      role: r.role ?? "",
      role_ar: r.role_ar ?? "",
      company: r.company ?? "",
      company_ar: r.company_ar ?? "",
      quote: r.quote,
      quote_ar: r.quote_ar ?? "",
      avatar_url: r.avatar_url ?? "",
      company_logo_url: r.company_logo_url ?? "",
      rating: r.rating,
      featured: r.featured,
      sort_order: r.sort_order,
      published: r.published,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name || !form.quote) {
      toast({ title: "Author name and quote are required", variant: "destructive" });
      return;
    }
    save.mutate(form, {
      onSuccess: () => {
        toast({ title: form.id ? "Testimonial updated" : "Testimonial created" });
        setOpen(false);
        setForm(empty);
      },
      onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const remove = (r: Testimonial) => {
    if (!confirm(`Delete testimonial from "${r.author_name}"?`)) return;
    del.mutate(r.id, {
      onSuccess: () => toast({ title: "Deleted" }),
      onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Testimonials</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customer quotes shown on the home page and trust sections.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1" onClick={startNew}>
              <Plus size={16} /> New testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit testimonial" : "New testimonial"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Author name (EN) *</label>
                  <Input
                    value={form.author_name}
                    onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Author name (AR)</label>
                  <Input
                    value={form.author_name_ar}
                    onChange={(e) => setForm({ ...form, author_name_ar: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Role (EN)</label>
                  <Input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Head of Operations"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Role (AR)</label>
                  <Input
                    value={form.role_ar}
                    onChange={(e) => setForm({ ...form, role_ar: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Company (EN)</label>
                  <Input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Company (AR)</label>
                  <Input
                    value={form.company_ar}
                    onChange={(e) => setForm({ ...form, company_ar: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Quote (EN) *</label>
                <Textarea
                  rows={3}
                  value={form.quote}
                  onChange={(e) => setForm({ ...form, quote: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Quote (AR)</label>
                <Textarea
                  rows={3}
                  dir="rtl"
                  value={form.quote_ar}
                  onChange={(e) => setForm({ ...form, quote_ar: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ImagePickField
                  label="Author avatar"
                  url={form.avatar_url}
                  onChange={(u) => setForm({ ...form, avatar_url: u })}
                  onPick={() => setPickerType("avatar")}
                />
                <ImagePickField
                  label="Company logo"
                  url={form.company_logo_url}
                  onChange={(u) => setForm({ ...form, company_logo_url: u })}
                  onPick={() => setPickerType("logo")}
                />
              </div>
              <MediaPicker
                open={pickerType !== null}
                onOpenChange={(o) => !o && setPickerType(null)}
                onSelect={(url) => {
                  if (pickerType === "avatar") setForm({ ...form, avatar_url: url });
                  if (pickerType === "logo") setForm({ ...form, company_logo_url: url });
                  setPickerType(null);
                }}
              />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Rating (1–5)</label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Math.min(5, Math.max(1, Number(e.target.value) || 5)) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Sort order</label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.featured}
                      onCheckedChange={(v) => setForm({ ...form, featured: v })}
                      id="feat"
                    />
                    <label htmlFor="feat" className="text-sm">Featured</label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.published}
                  onCheckedChange={(v) => setForm({ ...form, published: v })}
                  id="pub"
                />
                <label htmlFor="pub" className="text-sm">Published</label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
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

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted/40 border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
          No testimonials yet. Click "New testimonial" to add one.
        </div>
      ) : (
        <SortableGrid
          items={rows}
          editMode={true}
          onReorder={(next) =>
            reorder.mutate(buildSortPayload(next), {
              onSuccess: () => toast({ title: "Order saved" }),
              onError: (e: Error) =>
                toast({ title: "Reorder failed", description: e.message, variant: "destructive" }),
            })
          }
          className="space-y-2"
          renderItem={(r, dragHandle) => (
            <div
              className="relative flex items-start gap-3 bg-card border border-border rounded-xl p-3 pl-9 hover:border-accent/30 transition-colors"
            >
              {dragHandle}
              <div className="w-10 h-10 rounded-full bg-muted/60 border border-border/60 flex items-center justify-center overflow-hidden shrink-0">
                {r.avatar_url ? (
                  <img src={r.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">{r.author_name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground truncate">{r.author_name}</span>
                  {r.role && <span className="text-xs text-muted-foreground">· {r.role}</span>}
                  {r.company && <span className="text-xs text-muted-foreground">· {r.company}</span>}
                  {r.featured && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 inline-flex items-center gap-1">
                      <Star size={10} className="fill-accent" /> Featured
                    </span>
                  )}
                  {!r.published && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground inline-flex items-center gap-1">
                      <EyeOff size={10} /> Hidden
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">"{r.quote}"</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    save.mutate(
                      { ...r, published: !r.published },
                      { onSuccess: () => toast({ title: r.published ? "Hidden" : "Published" }) },
                    )
                  }
                  title={r.published ? "Hide" : "Publish"}
                >
                  {r.published ? <Eye size={14} /> : <EyeOff size={14} />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => startEdit(r)}>
                  <Edit size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r)} className="text-destructive hover:text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
};

const ImagePickField = ({
  label,
  url,
  onChange,
  onPick,
}: {
  label: string;
  url: string;
  onChange: (u: string) => void;
  onPick: () => void;
}) => (
  <div>
    <label className="text-sm font-medium mb-1 block">{label}</label>
    <div className="flex items-center gap-3">
      {url ? (
        <div className="relative w-12 h-12 rounded-lg border border-border bg-muted/40 overflow-hidden shrink-0">
          <img src={url} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <div className="w-12 h-12 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground shrink-0">
          <ImagePlus size={16} />
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={onPick}>
        {url ? "Change" : "Pick"}
      </Button>
    </div>
  </div>
);

export default TestimonialsManager;
