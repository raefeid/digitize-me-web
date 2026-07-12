import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, ImagePlus, X } from "lucide-react";
import {
  useAdminClientLogos,
  useSaveClientLogo,
  useDeleteClientLogo,
  ClientLogo,
} from "@/hooks/useClientLogos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type Form = {
  id?: string;
  company_name: string;
  logo_url: string;
  link_url: string;
  sort_order: number;
  published: boolean;
};

const empty: Form = {
  company_name: "",
  logo_url: "",
  link_url: "",
  sort_order: 0,
  published: true,
};

const ClientLogosManager = () => {
  const { data: rows = [], isLoading } = useAdminClientLogos();
  const save = useSaveClientLogo();
  const del = useDeleteClientLogo();
  const { toast } = useToast();
  const [form, setForm] = useState<Form>(empty);
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const startNew = () => {
    setForm({ ...empty, sort_order: (rows[rows.length - 1]?.sort_order ?? 0) + 10 });
    setOpen(true);
  };

  const startEdit = (r: ClientLogo) => {
    setForm({
      id: r.id,
      company_name: r.company_name,
      logo_url: r.logo_url,
      link_url: r.link_url ?? "",
      sort_order: r.sort_order,
      published: r.published,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.logo_url) {
      toast({ title: "Company name and logo are required", variant: "destructive" });
      return;
    }
    save.mutate(form, {
      onSuccess: () => {
        toast({ title: form.id ? "Logo updated" : "Logo added" });
        setOpen(false);
        setForm(empty);
      },
      onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  const remove = (r: ClientLogo) => {
    if (!confirm(`Remove "${r.company_name}" logo?`)) return;
    del.mutate(r.id, {
      onSuccess: () => toast({ title: "Removed" }),
      onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Client logos</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logos shown in the "Companies that trust us" carousel.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1" onClick={startNew}>
              <Plus size={16} /> New logo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit logo" : "New client logo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Company name *</label>
                <Input
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Logo *</label>
                <div className="flex items-center gap-3">
                  {form.logo_url ? (
                    <div className="relative w-16 h-16 rounded-lg border border-border bg-muted/40 overflow-hidden">
                      <img src={form.logo_url} alt="" className="w-full h-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, logo_url: "" })}
                        className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">
                      <ImagePlus size={18} />
                    </div>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                    {form.logo_url ? "Change" : "Pick from media"}
                  </Button>
                </div>
                <MediaPicker
                  open={pickerOpen}
                  onOpenChange={setPickerOpen}
                  onSelect={(url) => setForm({ ...form, logo_url: url })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Link URL (optional)</label>
                <Input
                  value={form.link_url}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Sort order</label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.published}
                      onCheckedChange={(v) => setForm({ ...form, published: v })}
                      id="logopub"
                    />
                    <label htmlFor="logopub" className="text-sm">Published</label>
                  </div>
                </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted/40 border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted-foreground">
          No client logos yet. Click "New logo" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className={`group bg-card border border-border rounded-xl p-3 ${!r.published ? "opacity-60" : ""}`}
            >
              <div className="aspect-[3/2] rounded-lg bg-muted/40 border border-border/60 flex items-center justify-center overflow-hidden mb-2">
                <img src={r.logo_url} alt={r.company_name} className="max-w-[80%] max-h-[70%] object-contain" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground truncate">{r.company_name}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() =>
                      save.mutate(
                        { ...r, published: !r.published },
                        { onSuccess: () => toast({ title: r.published ? "Hidden" : "Published" }) },
                      )
                    }
                    title={r.published ? "Hide" : "Publish"}
                  >
                    {r.published ? <Eye size={12} /> : <EyeOff size={12} />}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(r)}>
                    <Edit size={12} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => remove(r)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientLogosManager;
