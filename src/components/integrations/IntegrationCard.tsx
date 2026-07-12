import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Copy, Trash2, ImagePlus, X, Pencil, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Integration,
  IntegrationStatus,
  INTEGRATION_STATUSES,
  useSaveIntegration,
  useDeleteIntegration,
} from "@/hooks/useIntegrations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";
import { useEditMode } from "@/components/cms/EditModeContext";
import MediaPicker from "@/components/admin/MediaPicker";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  integration: Integration;
  index?: number;
  /** Drag handle injected by SortableGrid (only present in edit mode). */
  dragHandle?: React.ReactNode;
}

const STATUS_BADGES = {
  available: {
    label: "Available",
    cls: "bg-[hsl(var(--badge-available-bg))] text-[hsl(var(--badge-available-fg))] border-[hsl(var(--badge-available-border))]",
    icon: Sparkles,
  },
  coming_soon: {
    label: "Coming Soon",
    cls: "bg-[hsl(var(--badge-coming-bg))] text-[hsl(var(--badge-coming-fg))] border-[hsl(var(--badge-coming-border))]",
    icon: Zap,
  },
  custom: {
    label: "Custom",
    cls: "bg-[hsl(var(--badge-custom-bg))] text-[hsl(var(--badge-custom-fg))] border-[hsl(var(--badge-custom-border))]",
    icon: Sparkles,
  },
} as const;

const StatusBadge = ({ status }: { status: Integration["status"] }) => {
  const cfg = STATUS_BADGES[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        cfg.cls,
      )}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  );
};

const IntegrationCard = ({ integration, index = 0, dragHandle }: Props) => {
  const { lang, isRTL } = useLanguage();
  const { enabled } = useEditMode();
  const save = useSaveIntegration();
  const del = useDeleteIntegration();
  const { toast } = useToast();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: integration.name,
    name_ar: integration.name_ar ?? "",
    description: integration.description ?? "",
    description_ar: integration.description_ar ?? "",
    cta_label: integration.cta_label ?? "",
    cta_label_ar: integration.cta_label_ar ?? "",
    cta_link: integration.cta_link ?? "/contact",
  });

  const name = lang === "ar" && integration.name_ar ? integration.name_ar : integration.name;
  const desc =
    lang === "ar" && integration.description_ar
      ? integration.description_ar
      : integration.description ?? "";
  const ctaLabel =
    (lang === "ar" && integration.cta_label_ar
      ? integration.cta_label_ar
      : integration.cta_label) ||
    (integration.status === "custom"
      ? lang === "ar"
        ? "اطلب تكاملًا"
        : "Request integration"
      : lang === "ar"
        ? "اعرف المزيد"
        : "Learn more");
  const ctaLink = integration.cta_link || "/contact";
  const isExternal = /^https?:\/\//.test(ctaLink);

  const initial = name?.charAt(0)?.toUpperCase() ?? "?";

  const baseInput = {
    name: integration.name,
    name_ar: integration.name_ar,
    slug: integration.slug,
    category: integration.category,
    description: integration.description,
    description_ar: integration.description_ar,
    logo_url: integration.logo_url,
    status: integration.status,
    cta_label: integration.cta_label,
    cta_label_ar: integration.cta_label_ar,
    cta_link: integration.cta_link,
    sort_order: integration.sort_order,
    published: integration.published,
  };

  const handleLogoSelect = (url: string) => {
    save.mutate(
      { ...baseInput, id: integration.id, logo_url: url },
      {
        onSuccess: () => toast({ title: "Logo updated" }),
        onError: (e: Error) =>
          toast({ title: "Failed", description: e.message, variant: "destructive" }),
      },
    );
  };

  const handleRemoveLogo = () => {
    save.mutate(
      { ...baseInput, id: integration.id, logo_url: "" },
      { onSuccess: () => toast({ title: "Logo removed" }) },
    );
  };

  const handleDuplicate = () => {
    const baseSlug = integration.slug.replace(/-copy(-\d+)?$/, "");
    const newSlug = `${baseSlug}-copy-${Math.random().toString(36).slice(2, 6)}`;
    save.mutate(
      {
        ...baseInput,
        slug: newSlug,
        name: `${integration.name} (copy)`,
        sort_order: integration.sort_order + 1,
      },
      {
        onSuccess: () => toast({ title: "Integration duplicated" }),
        onError: (e: Error) =>
          toast({ title: "Failed", description: e.message, variant: "destructive" }),
      },
    );
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${integration.name}"?`)) return;
    del.mutate(integration.id, {
      onSuccess: () => toast({ title: "Integration deleted" }),
      onError: (e: Error) =>
        toast({ title: "Failed", description: e.message, variant: "destructive" }),
    });
  };

  const saveEdit = () => {
    save.mutate(
      { ...baseInput, id: integration.id, ...draft },
      {
        onSuccess: () => {
          toast({ title: "Card updated" });
          setEditOpen(false);
        },
        onError: (e: Error) =>
          toast({ title: "Failed", description: e.message, variant: "destructive" }),
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      className="group relative bg-card border border-border rounded-2xl p-5 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all flex flex-col h-full"
    >
      {/* Drag handle (provided by SortableGrid in edit mode) */}
      {dragHandle}
      {/* Edit-mode toolbar */}
      {enabled && (
        <div className="absolute -top-2 -right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            disabled={save.isPending}
            className="bg-card border border-border rounded-full p-1.5 shadow-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            title="Edit fields"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={save.isPending}
            className="bg-card border border-border rounded-full p-1.5 shadow-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            title="Duplicate"
          >
            <Copy size={12} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={del.isPending}
            className="bg-card border border-border rounded-full p-1.5 shadow-md text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      <div className={cn("flex items-start gap-3 mb-4", isRTL && "flex-row-reverse")}>
        {/* Logo (with edit overlay in edit mode) */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center overflow-hidden">
            {integration.logo_url ? (
              <img
                src={integration.logo_url}
                alt={`${name} logo`}
                loading="lazy"
                className="w-full h-full object-contain p-1.5"
              />
            ) : (
              <span className="text-base font-bold text-muted-foreground">{initial}</span>
            )}
          </div>
          {enabled && (
            <>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                disabled={save.isPending}
                className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground rounded-full p-1 shadow-md hover:scale-110 transition-transform disabled:opacity-50"
                title="Change logo"
              >
                <ImagePlus size={10} />
              </button>
              {integration.logo_url && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  disabled={save.isPending}
                  className="absolute -top-1 -right-1 bg-background border border-border rounded-full p-0.5 shadow text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  title="Remove logo"
                >
                  <X size={10} />
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <div className="mt-1">
            {enabled ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={save.isPending}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium hover:opacity-80 transition-opacity disabled:opacity-50 cursor-pointer",
                      STATUS_BADGES[integration.status].cls,
                    )}
                    title="Change status"
                  >
                    {(() => {
                      const Icon = STATUS_BADGES[integration.status].icon;
                      return <Icon size={11} />;
                    })()}
                    {STATUS_BADGES[integration.status].label}
                    <ChevronDown size={10} className="opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[160px]">
                  {INTEGRATION_STATUSES.map((s) => {
                    const cfg = STATUS_BADGES[s];
                    const Icon = cfg.icon;
                    return (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => {
                          if (s === integration.status) return;
                          save.mutate(
                            { ...baseInput, id: integration.id, status: s as IntegrationStatus },
                            {
                              onSuccess: () => toast({ title: `Status set to ${cfg.label}` }),
                              onError: (e: Error) =>
                                toast({
                                  title: "Failed",
                                  description: e.message,
                                  variant: "destructive",
                                }),
                            },
                          );
                        }}
                        className={cn(
                          "gap-2 text-xs cursor-pointer",
                          s === integration.status && "bg-accent/10 font-semibold",
                        )}
                      >
                        <Icon size={12} />
                        {cfg.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <StatusBadge status={integration.status} />
            )}
          </div>
        </div>
      </div>

      {desc && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3 flex-1">
          {desc}
        </p>
      )}

      {(() => {
        const isComing = integration.status === "coming_soon";
        const linkClass = cn(
          "inline-flex items-center gap-1.5 text-sm font-medium group-hover:gap-2 transition-all mt-auto",
          isComing ? "text-muted-foreground hover:text-accent" : "text-accent",
          isRTL && "flex-row-reverse",
        );
        const target = isComing ? (integration.cta_link || "/contact") : ctaLink;
        const targetExternal = /^https?:\/\//.test(target);
        const inner = (
          <>
            {ctaLabel}
            <ArrowRight size={14} className={cn(isRTL && "rotate-180")} />
          </>
        );
        return targetExternal ? (
          <a href={target} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {inner}
          </a>
        ) : (
          <Link to={localizeInternalPath(target, lang)} className={linkClass}>
            {inner}
          </Link>
        );
      })()}

      {/* Logo picker */}
      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(url) => handleLogoSelect(url)}
        uploadFolder="integrations/logos"
        title="Pick or upload an app logo"
      />

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit integration card</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Name (EN)</label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Name (AR)</label>
                <Input
                  dir="rtl"
                  value={draft.name_ar}
                  onChange={(e) => setDraft({ ...draft, name_ar: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Description (EN)</label>
              <Textarea
                rows={2}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Description (AR)</label>
              <Textarea
                rows={2}
                dir="rtl"
                value={draft.description_ar}
                onChange={(e) => setDraft({ ...draft, description_ar: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">CTA label (EN)</label>
                <Input
                  value={draft.cta_label}
                  onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })}
                  placeholder="Learn more"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">CTA label (AR)</label>
                <Input
                  dir="rtl"
                  value={draft.cta_label_ar}
                  onChange={(e) => setDraft({ ...draft, cta_label_ar: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">CTA link</label>
              <Input
                value={draft.cta_link}
                onChange={(e) => setDraft({ ...draft, cta_link: e.target.value })}
                placeholder="/contact or https://…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveEdit}
              disabled={save.isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default IntegrationCard;
