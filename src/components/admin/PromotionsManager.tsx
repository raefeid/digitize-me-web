import { useMemo, useState } from "react";
import {
  Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Loader2, Calendar as CalendarIcon,
  Megaphone, MousePointer2, BellRing, ImagePlus, X as XIcon, ExternalLink, Mail, Phone, MessageCircle, Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";
import {
  Promo,
  PromoData,
  PromoMode,
  PromoTheme,
  PromoDismiss,
  defaultPromo,
  newPromoId,
  usePromotions,
  useSavePromotion,
  useDeletePromotion,
} from "@/hooks/usePromotions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import MediaPicker from "./MediaPicker";

const MODE_META: Record<PromoMode, { label: string; icon: typeof Megaphone; desc: string }> = {
  bar:    { label: "Top announcement bar", icon: Megaphone,    desc: "Slim strip pinned to the top of every page" },
  popup:  { label: "Pop-up dialog",        icon: BellRing,     desc: "Centered overlay shown once per visitor" },
  inline: { label: "Inline section",       icon: MousePointer2, desc: "A banner section in the home-page flow" },
};

const THEME_META: Record<PromoTheme, { label: string; swatch: string }> = {
  accent:  { label: "Accent (brand)", swatch: "bg-accent" },
  success: { label: "Success (green)", swatch: "bg-emerald-600" },
  warning: { label: "Warning (amber)", swatch: "bg-amber-500" },
  info:    { label: "Info (blue)",     swatch: "bg-sky-600" },
  dark:    { label: "Dark",            swatch: "bg-foreground" },
};

const DISMISS_META: Record<PromoDismiss, { label: string; desc: string }> = {
  forever: { label: "Hide forever once closed", desc: "After a visitor clicks ✕, they never see it again on this device." },
  week:    { label: "Hide for 7 days",          desc: "Re-shows after a week — gentle nudge without nagging." },
  always:  { label: "Show every visit",         desc: "Always visible until you turn it off or the schedule ends." },
};

const KIND_META = [
  { value: "none",     label: "No button",      icon: XIcon,         placeholder: "" },
  { value: "link",     label: "Internal page",  icon: LinkIcon,      placeholder: "/pricing" },
  { value: "email",    label: "Email",          icon: Mail,          placeholder: "hello@digitizeme.ae" },
  { value: "phone",    label: "Phone",          icon: Phone,         placeholder: "+971 4 123 4567" },
  { value: "whatsapp", label: "WhatsApp",       icon: MessageCircle, placeholder: "+971501234567" },
  { value: "external", label: "External URL",   icon: ExternalLink,  placeholder: "https://example.com" },
] as const;

interface DraftPromo {
  rowId?: string;
  id: string;
  sortOrder: number;
  en: PromoData;
  ar: { headline?: string; body?: string; ctaLabel?: string };
}

const promoToDraft = (p: Promo): DraftPromo => ({
  rowId: p.rowId,
  id: p.id,
  sortOrder: p.sortOrder,
  en: {
    enabled: p.enabled, mode: p.mode, theme: p.theme,
    headline: p.headline, body: p.body, ctaLabel: p.ctaLabel,
    ctaKind: p.ctaKind, ctaValue: p.ctaValue, imageUrl: p.imageUrl,
    startAt: p.startAt, endAt: p.endAt, dismiss: p.dismiss,
  },
  ar: { ...p.ar },
});

const newDraft = (sortOrder: number): DraftPromo => ({
  id: newPromoId(),
  sortOrder,
  en: { ...defaultPromo(), enabled: true, headline: "🎉 New promotion", ctaLabel: "Learn more" },
  ar: {},
});

const PromotionsManager = () => {
  const { promos } = usePromotions();
  const save = useSavePromotion();
  const del = useDeletePromotion();
  const { toast } = useToast();

  const [editing, setEditing] = useState<DraftPromo | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Promo | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);

  const sorted = useMemo(() => [...promos].sort((a, b) => a.sortOrder - b.sortOrder), [promos]);

  const updateEn = (patch: Partial<PromoData>) =>
    setEditing((d) => (d ? { ...d, en: { ...d.en, ...patch } } : d));
  const updateAr = (patch: Partial<{ headline: string; body: string; ctaLabel: string }>) =>
    setEditing((d) => (d ? { ...d, ar: { ...d.ar, ...patch } } : d));

  const submit = async () => {
    if (!editing) return;
    try {
      await save.mutateAsync({
        rowId: editing.rowId,
        id: editing.id,
        sortOrder: editing.sortOrder,
        en: editing.en,
        ar: editing.ar,
      });
      toast({ title: "Promotion saved" });
      setEditing(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    }
  };

  const togglePublished = async (p: Promo) => {
    try {
      await save.mutateAsync({
        rowId: p.rowId,
        id: p.id,
        sortOrder: p.sortOrder,
        en: { ...p, enabled: !p.enabled } as PromoData,
        ar: p.ar,
      });
      toast({ title: !p.enabled ? "Promo turned ON" : "Promo turned OFF" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Update failed", description: msg, variant: "destructive" });
    }
  };

  const move = async (p: Promo, dir: -1 | 1) => {
    const i = sorted.findIndex((x) => x.id === p.id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sorted.length) return;
    const a = sorted[i];
    const b = sorted[j];
    await Promise.all([
      save.mutateAsync({ rowId: a.rowId, id: a.id, sortOrder: b.sortOrder, en: a, ar: a.ar }),
      save.mutateAsync({ rowId: b.rowId, id: b.id, sortOrder: a.sortOrder, en: b, ar: b.ar }),
    ]);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await del.mutateAsync(confirmDelete.rowId);
      toast({ title: "Promotion deleted" });
      setConfirmDelete(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Delete failed", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Promotions</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Run sales, announcements, or new-feature pushes from one place. Each promo can be a top
            bar, a pop-up, or an inline home-page section. Schedule and translations are built in.
          </p>
        </div>
        <Button
          onClick={() => setEditing(newDraft((sorted[sorted.length - 1]?.sortOrder ?? 0) + 1))}
          className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus size={16} /> New promotion
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl bg-muted/30">
          <Megaphone size={36} className="mx-auto text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-foreground mb-1">No promotions yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first promo — a sale banner, a launch popup, or a feature announcement.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sorted.map((p, idx) => {
            const Icon = MODE_META[p.mode].icon;
            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-xl border bg-card p-4 flex items-start gap-4 transition-colors",
                  p.enabled ? "border-border" : "border-dashed border-muted-foreground/30 opacity-70"
                )}
              >
                <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center shrink-0", THEME_META[p.theme].swatch, "text-white")}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-foreground truncate">{p.headline || <span className="italic text-muted-foreground">Untitled promo</span>}</h4>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                      {MODE_META[p.mode].label}
                    </span>
                    {!p.enabled && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted-foreground/20 text-muted-foreground font-semibold">
                        Off
                      </span>
                    )}
                  </div>
                  {p.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.body}</p>}
                  {(p.startAt || p.endAt) && (
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      <CalendarIcon size={11} />
                      {p.startAt ? format(new Date(p.startAt), "MMM d") : "now"}
                      {" → "}
                      {p.endAt ? format(new Date(p.endAt), "MMM d, yyyy") : "no end"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(p, -1)} disabled={idx === 0} title="Move up">
                    <ChevronUp size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(p, 1)} disabled={idx === sorted.length - 1} title="Move down">
                    <ChevronDown size={14} />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => togglePublished(p)}
                    title={p.enabled ? "Turn off" : "Turn on"}
                  >
                    {p.enabled ? <Eye size={14} /> : <EyeOff size={14} className="text-muted-foreground" />}
                  </Button>
                  <Button variant="outline" size="sm" className="h-8" onClick={() => setEditing(promoToDraft(p))}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmDelete(p)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------- Editor dialog ----------------- */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && !save.isPending && setEditing(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.rowId ? "Edit promotion" : "New promotion"}</DialogTitle>
            <DialogDescription>
              Set the message, pick how it appears, schedule it, and translate it for Arabic visitors.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
                <div>
                  <Label className="text-base">Live on the site</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Turn off to keep editing without showing it.</p>
                </div>
                <Switch checked={editing.en.enabled} onCheckedChange={(v) => updateEn({ enabled: v })} />
              </div>

              {/* Display mode */}
              <div className="space-y-2">
                <Label>Where to show it</Label>
                <div className="grid sm:grid-cols-3 gap-2">
                  {(Object.keys(MODE_META) as PromoMode[]).map((m) => {
                    const meta = MODE_META[m];
                    const Icon = meta.icon;
                    const active = editing.en.mode === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => updateEn({ mode: m })}
                        className={cn(
                          "text-left rounded-xl border p-3 transition-all",
                          active ? "border-accent bg-accent/10 shadow-sm" : "border-border hover:border-accent/50 bg-background"
                        )}
                      >
                        <Icon size={18} className={active ? "text-accent" : "text-muted-foreground"} />
                        <div className="font-semibold text-sm mt-2">{meta.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{meta.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <Label>Color theme</Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(THEME_META) as PromoTheme[]).map((th) => {
                    const meta = THEME_META[th];
                    const active = editing.en.theme === th;
                    return (
                      <button
                        key={th}
                        type="button"
                        onClick={() => updateEn({ theme: th })}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
                          active ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
                        )}
                      >
                        <span className={cn("w-4 h-4 rounded-full ring-1 ring-border", meta.swatch)} />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="grid sm:grid-cols-2 gap-4 rounded-xl border border-border p-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">English</h4>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Headline</Label>
                    <Input value={editing.en.headline} onChange={(e) => updateEn({ headline: e.target.value })} placeholder="🎉 Launch sale — 30% off" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Body / sub-text</Label>
                    <Textarea rows={2} value={editing.en.body} onChange={(e) => updateEn({ body: e.target.value })} placeholder="Use code DIGITIZE30 at checkout. Ends April 30." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Button label</Label>
                    <Input value={editing.en.ctaLabel} onChange={(e) => updateEn({ ctaLabel: e.target.value })} placeholder="Claim discount" />
                  </div>
                </div>
                <div className="space-y-3" dir="rtl">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" dir="ltr">Arabic (optional)</h4>
                  <div className="space-y-1.5">
                    <Label className="text-xs" dir="ltr">Headline (AR)</Label>
                    <Input value={editing.ar.headline ?? ""} onChange={(e) => updateAr({ headline: e.target.value })} placeholder="🎉 خصم 30٪" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs" dir="ltr">Body (AR)</Label>
                    <Textarea rows={2} value={editing.ar.body ?? ""} onChange={(e) => updateAr({ body: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs" dir="ltr">Button label (AR)</Label>
                    <Input value={editing.ar.ctaLabel ?? ""} onChange={(e) => updateAr({ ctaLabel: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* CTA destination */}
              <div className="rounded-xl border border-border p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Button destination</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Type</Label>
                    <Select value={editing.en.ctaKind} onValueChange={(v) => updateEn({ ctaKind: v as PromoData["ctaKind"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {KIND_META.map((k) => {
                          const Ico = k.icon;
                          return (
                            <SelectItem key={k.value} value={k.value}>
                              <span className="inline-flex items-center gap-2"><Ico size={14} /> {k.label}</span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Destination</Label>
                    <Input
                      value={editing.en.ctaValue}
                      onChange={(e) => updateEn({ ctaValue: e.target.value })}
                      placeholder={KIND_META.find((k) => k.value === editing.en.ctaKind)?.placeholder ?? ""}
                      disabled={editing.en.ctaKind === "none"}
                    />
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="rounded-xl border border-border p-4 space-y-2">
                <Label>Banner image (popup &amp; inline only)</Label>
                <div className="flex items-center gap-3">
                  {editing.en.imageUrl ? (
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={editing.en.imageUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => updateEn({ imageUrl: "" })}
                        aria-label="Remove image"
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/90 flex items-center justify-center text-destructive hover:bg-background"
                      >
                        <XIcon size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground/60 shrink-0">
                      <ImagePlus size={20} />
                    </div>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={() => setMediaOpen(true)} className="gap-1">
                    <ImagePlus size={13} /> {editing.en.imageUrl ? "Change image" : "Pick from media"}
                  </Button>
                </div>
              </div>

              {/* Schedule */}
              <div className="grid sm:grid-cols-2 gap-3 rounded-xl border border-border p-4">
                <DateField
                  label="Show from"
                  value={editing.en.startAt}
                  onChange={(iso) => updateEn({ startAt: iso })}
                  helper="Leave empty to start immediately."
                />
                <DateField
                  label="Show until"
                  value={editing.en.endAt}
                  onChange={(iso) => updateEn({ endAt: iso })}
                  helper="Leave empty for no end date."
                />
              </div>

              {/* Dismiss */}
              <div className="rounded-xl border border-border p-4 space-y-2">
                <Label>If a visitor closes it, what happens?</Label>
                <Select value={editing.en.dismiss} onValueChange={(v) => updateEn({ dismiss: v as PromoDismiss })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(DISMISS_META) as PromoDismiss[]).map((d) => (
                      <SelectItem key={d} value={d}>{DISMISS_META[d].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{DISMISS_META[editing.en.dismiss].desc}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={save.isPending}>Cancel</Button>
            <Button onClick={submit} disabled={save.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              {save.isPending && <Loader2 size={14} className="animate-spin" />}
              Save promotion
            </Button>
          </DialogFooter>

          <MediaPicker
            open={mediaOpen}
            onOpenChange={setMediaOpen}
            onSelect={(url) => { updateEn({ imageUrl: url }); setMediaOpen(false); }}
            uploadFolder="promotions"
            title="Pick a promotion banner"
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this promotion?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.headline || "Untitled promo"}" will be removed from the site. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/** Small wrapper over shadcn Calendar that stores its value as an ISO string. */
const DateField = ({
  label, value, onChange, helper,
}: { label: string; value: string | null; onChange: (iso: string | null) => void; helper?: string }) => {
  const date = value ? new Date(value) : undefined;
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("flex-1 justify-start gap-2 font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon size={14} />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => onChange(d ? d.toISOString() : null)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {date && (
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => onChange(null)} title="Clear">
            <XIcon size={14} />
          </Button>
        )}
      </div>
      {helper && <p className="text-[11px] text-muted-foreground">{helper}</p>}
    </div>
  );
};

export default PromotionsManager;
