import { useEffect, useState } from "react";
import { Save, Loader2, Trash2, Image as ImageIcon, X, icons as lucideIcons } from "lucide-react";
import LucideIconPicker from "@/components/cms/LucideIconPicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CTA_REGISTRY, useCtaTargets, CtaKind } from "@/hooks/useCtaTargets";
import {
  CtaStyle,
  CtaStyleBorderColor,
  CtaStyleColor,
  CtaStyleFontWeight,
  CtaStyleIconPosition,
  CtaStyleRadius,
  CtaStyleSize,
  CtaStyleTextColor,
  CtaStyleVariant,
  ctaStyleToClassName,
  ctaStyleToVariant,
  useCtaStyles,
  useSaveCtaStyle,
} from "@/hooks/useCtaStyles";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useEditLang } from "@/components/cms/EditModeContext";
import { normalizeCtaDestination, ctaDestinationNeedsNormalization } from "@/lib/normalizeCtaDestination";

export interface CtaLabelEditorConfig {
  page: string;
  section: string;
  contentKey: string;
  fallback: string;
}

interface CtaStyleEditorProps {
  /** Registry key being edited (e.g. "nav_demo") — null = closed */
  ctaKey: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Defaults supplied by the calling button so the dialog opens with current style */
  fallbackStyle?: Partial<CtaStyle>;
  /** When true, hide destination fields (for form submits / non-link buttons) */
  styleOnly?: boolean;
  /** Custom location label when ctaKey is not in CTA_REGISTRY (e.g. form buttons) */
  customLocation?: string;
  /** Optional CMS text row for editing this CTA label from the same dialog */
  labelEditor?: CtaLabelEditorConfig;
}

const VARIANTS: { value: CtaStyleVariant; label: string; preview: string }[] = [
  { value: "primary", label: "Primary", preview: "bg-primary text-primary-foreground" },
  { value: "accent", label: "Accent", preview: "bg-accent text-accent-foreground" },
  { value: "outline", label: "Outline", preview: "border-2 border-input bg-background text-foreground" },
  { value: "ghost", label: "Ghost", preview: "text-foreground hover:bg-accent/20" },
  { value: "secondary", label: "Secondary", preview: "bg-secondary text-secondary-foreground" },
  { value: "link", label: "Link", preview: "text-primary underline" },
];

const SIZES: { value: CtaStyleSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "default", label: "Default" },
  { value: "lg", label: "Large" },
];

const COLORS: { value: CtaStyleColor; label: string; swatch: string }[] = [
  { value: "default", label: "Use variant default", swatch: "bg-muted" },
  { value: "primary", label: "Primary (brand)", swatch: "bg-primary" },
  { value: "accent", label: "Accent", swatch: "bg-accent" },
  { value: "destructive", label: "Destructive", swatch: "bg-destructive" },
  { value: "muted", label: "Muted", swatch: "bg-muted-foreground" },
];

const BORDER_COLORS: { value: CtaStyleBorderColor; label: string; swatch: string }[] = [
  { value: "default", label: "Use current border", swatch: "bg-muted" },
  { value: "primary", label: "Primary", swatch: "bg-primary" },
  { value: "accent", label: "Accent", swatch: "bg-accent" },
  { value: "destructive", label: "Destructive", swatch: "bg-destructive" },
  { value: "muted", label: "Muted", swatch: "bg-muted-foreground" },
  { value: "foreground", label: "Foreground", swatch: "bg-foreground" },
];

const TEXT_COLORS: { value: CtaStyleTextColor; label: string; swatch: string }[] = [
  { value: "default", label: "Use variant default", swatch: "bg-muted" },
  { value: "white", label: "White", swatch: "bg-white border" },
  { value: "foreground", label: "Foreground", swatch: "bg-foreground" },
  { value: "primary", label: "Primary", swatch: "bg-primary" },
  { value: "primary-foreground", label: "Primary contrast", swatch: "bg-primary-foreground border" },
  { value: "accent", label: "Accent", swatch: "bg-accent" },
  { value: "accent-foreground", label: "Accent contrast", swatch: "bg-accent-foreground" },
  { value: "muted-foreground", label: "Muted", swatch: "bg-muted-foreground" },
  { value: "destructive", label: "Destructive", swatch: "bg-destructive" },
];

const FONT_WEIGHTS: { value: CtaStyleFontWeight; label: string; className: string }[] = [
  { value: "default", label: "Default", className: "" },
  { value: "normal", label: "Normal", className: "font-normal" },
  { value: "medium", label: "Medium", className: "font-medium" },
  { value: "semibold", label: "Semibold", className: "font-semibold" },
  { value: "bold", label: "Bold", className: "font-bold" },
];

const RADII: { value: CtaStyleRadius; label: string; className: string }[] = [
  { value: "default", label: "Default", className: "rounded-md" },
  { value: "square", label: "Square", className: "rounded-none" },
  { value: "rounded", label: "Rounded", className: "rounded-lg" },
  { value: "pill", label: "Pill", className: "rounded-full" },
];

const CTA_PAGE = "cta_actions";
const KIND_LABELS: Record<CtaKind, string> = {
  link: "Internal page",
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  external: "External URL",
};

/**
 * In-place button editor that opens when an admin clicks any registry CTA
 * while edit mode is on. Edits the style (saved to `cta_styles`) AND the
 * destination (saved to `cta_actions`) in one place.
 *
 * Per-key (not per-instance): all buttons sharing the registry key update
 * together. Theme-token colors only — no free-form hex.
 */
const CtaStyleEditor = ({ ctaKey, open, onOpenChange, fallbackStyle, styleOnly = false, customLocation, labelEditor }: CtaStyleEditorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { get: getStyle } = useCtaStyles();
  const { get: getTarget } = useCtaTargets();
  const saveStyle = useSaveCtaStyle();
  const editLang = useEditLang();

  const registryDef = ctaKey ? CTA_REGISTRY.find((d) => d.key === ctaKey) : undefined;
  const def = registryDef ?? (ctaKey && customLocation ? { key: ctaKey, location: customLocation, defaultKind: "link" as CtaKind, defaultValue: "" } : undefined);

  const [style, setStyle] = useState<CtaStyle>({
    variant: "primary",
    size: "default",
    color: "default",
    textColor: "default",
    hoverColor: "default",
    hoverTextColor: "default",
    hoverBorderColor: "default",
    fontWeight: "default",
    radius: "default",
    icon: null,
    iconPosition: "left",
    newTab: false,
    ...fallbackStyle,
  });
  const [kind, setKind] = useState<CtaKind>("link");
  const [value, setValue] = useState("");
  const [savingDest, setSavingDest] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [labelValue, setLabelValue] = useState("");
  const [labelValueAr, setLabelValueAr] = useState("");
  const [labelRow, setLabelRow] = useState<{ id: string; value: string | null; value_ar: string | null; sort_order: number | null } | null>(null);
  const [featureLabelRow, setFeatureLabelRow] = useState<{ id: string; value: string | null; value_ar: string | null } | null>(null);
  const [loadingLabel, setLoadingLabel] = useState(false);

  // Hydrate when opened
  useEffect(() => {
    if (!open || !ctaKey) return;
    let cancelled = false;
    setStyle(getStyle(ctaKey, fallbackStyle));
    if (!styleOnly) {
      const t = getTarget(ctaKey);
      setKind(t.kind);
      setValue(t.value);
    }
    if (!labelEditor) {
      setLabelValue("");
      setLabelValueAr("");
      setLabelRow(null);
      setFeatureLabelRow(null);
      setLoadingLabel(false);
      return () => {
        cancelled = true;
      };
    }

    const loadLabel = async () => {
      setLoadingLabel(true);
      setLabelValue(labelEditor.fallback);
      setLabelValueAr("");
      try {
        if (labelEditor.page.startsWith("feature-") && labelEditor.section === "cta_labels") {
          const slug = labelEditor.page.replace(/^feature-/, "");
          const enField = labelEditor.contentKey;
          const arField = `${enField}_ar`;
          const { data, error } = await supabase
            .from("features")
            .select(`id,${enField},${arField}`)
            .eq("slug", slug)
            .maybeSingle();
          if (cancelled) return;
          if (error) throw error;
          const row = data as unknown as Record<string, string | null> | null;
          setFeatureLabelRow(row ? { id: String(row.id), value: row[enField] ?? null, value_ar: row[arField] ?? null } : null);
          setLabelRow(null);
          setLabelValue(row?.[enField] || labelEditor.fallback);
          setLabelValueAr(row?.[arField] || "");
          return;
        }

        const { data, error } = await supabase
          .from("site_content")
          .select("id,value,value_ar,sort_order")
          .eq("page", labelEditor.page)
          .eq("section", labelEditor.section)
          .eq("content_key", labelEditor.contentKey)
          .maybeSingle();
        if (cancelled) return;
        if (error) throw error;
        setFeatureLabelRow(null);
        setLabelRow(data ?? null);
        setLabelValue(data?.value || labelEditor.fallback);
        setLabelValueAr(data?.value_ar || "");
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Could not load button text";
        toast({ title: "Button text unavailable", description: msg, variant: "destructive" });
      } finally {
        if (!cancelled) setLoadingLabel(false);
      }
    };
    void loadLabel();

    return () => {
      cancelled = true;
    };
  }, [open, ctaKey, styleOnly, editLang, labelEditor?.page, labelEditor?.section, labelEditor?.contentKey, labelEditor?.fallback]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!def) return null;

  const handleSave = async () => {
    if (!ctaKey) return;
    setSavingDest(true);
    try {
      // Save destination (kind + value) — skip in styleOnly mode
      if (!styleOnly) {
        // Strip any /ar prefix so the value is language-agnostic; the runtime
        // localizer adds /ar automatically based on the visitor's language.
        const normalizedValue = normalizeCtaDestination(kind, value);
        if (normalizedValue !== value) setValue(normalizedValue);

        for (const [contentKey, v] of [["kind", kind], ["value", normalizedValue]] as const) {
          const { data: existing } = await supabase
            .from("site_content")
            .select("id")
            .eq("page", CTA_PAGE)
            .eq("section", ctaKey)
            .eq("content_key", contentKey)
            .maybeSingle();
          if (existing) {
            await supabase
              .from("site_content")
              .update({ value: v, content_type: "text" })
              .eq("id", existing.id);
          } else {
            await supabase.from("site_content").insert({
              page: CTA_PAGE,
              section: ctaKey,
              content_key: contentKey,
              value: v,
              content_type: "text",
              sort_order: 0,
            });
          }
        }
        await queryClient.invalidateQueries({ queryKey: ["cta-actions"] });
      }

      if (labelEditor) {
        const trimmedEn = labelValue.trim() || labelEditor.fallback;
        const trimmedAr = labelValueAr.trim() || null;
        const payload = {
          value: trimmedEn,
          value_ar: trimmedAr,
          content_type: "text",
          sort_order: labelRow?.sort_order ?? 0,
        };

        if (featureLabelRow?.id && labelEditor.page.startsWith("feature-") && labelEditor.section === "cta_labels") {
          const enField = labelEditor.contentKey;
          const arField = `${enField}_ar`;
          const featurePayload = { [enField]: trimmedEn, [arField]: trimmedAr } as never;
          const { error } = await supabase
            .from("features")
            .update(featurePayload)
            .eq("id", featureLabelRow.id);
          if (error) throw error;
          await queryClient.invalidateQueries({ queryKey: ["features"] });
        } else if (labelRow?.id) {
          const { error } = await supabase.from("site_content").update(payload).eq("id", labelRow.id);
          if (error) throw error;
          await queryClient.invalidateQueries({ queryKey: ["site-content"] });
          await queryClient.invalidateQueries({ queryKey: ["site-content-all"] });
        } else {
          const { error } = await supabase.from("site_content").insert({
            page: labelEditor.page,
            section: labelEditor.section,
            content_key: labelEditor.contentKey,
            ...payload,
          });
          if (error) throw error;
          await queryClient.invalidateQueries({ queryKey: ["site-content"] });
          await queryClient.invalidateQueries({ queryKey: ["site-content-all"] });
        }
      }

      // Save style
      await saveStyle.mutateAsync({ key: ctaKey, style });

      toast({ title: "Button updated", description: `${def.location} saved.` });
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Save failed", description: msg, variant: "destructive" });
    } finally {
      setSavingDest(false);
    }
  };

  const handleResetStyle = async () => {
    if (!ctaKey) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Sign in required",
          description: "You must be signed in as an admin or editor to reset button styles.",
          variant: "destructive",
        });
        return;
      }
      const { data, error } = await supabase
        .from("site_content")
        .delete()
        .eq("page", "cta_styles")
        .eq("section", ctaKey)
        .select("id");
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["cta-styles"] });
      toast({
        title: data?.length ? "Style reset" : "Already at defaults",
        description: data?.length ? "Back to design defaults." : "No style overrides to clear.",
      });
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Reset failed", description: msg, variant: "destructive" });
    }
  };

  const handleDeleteAll = async () => {
    if (!ctaKey) return;
    if (!window.confirm("Hide this button from the website?\n\nIt will stay hidden until you re-enable it from visual editing. This does not reset it back to defaults.")) return;
    try {
      // Verify the user is signed in — RLS requires an authenticated editor/admin
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Sign in required",
          description: "You must be signed in as an admin or editor to delete button overrides.",
          variant: "destructive",
        });
        return;
      }

      const { data: existingHidden } = await supabase
        .from("site_content")
        .select("id")
        .eq("page", CTA_PAGE)
        .eq("section", ctaKey)
        .eq("content_key", "hidden")
        .maybeSingle();

      if (existingHidden?.id) {
        const { error } = await supabase
          .from("site_content")
          .update({ value: "1", content_type: "text" })
          .eq("id", existingHidden.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_content").insert({
          page: CTA_PAGE,
          section: ctaKey,
          content_key: "hidden",
          value: "1",
          content_type: "text",
          sort_order: 0,
        });
        if (error) throw error;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cta-actions"] }),
      ]);

      toast({
        title: "Button hidden",
        description: "The button is now hidden on the live page and stays available in edit mode.",
      });
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Delete failed", description: msg, variant: "destructive" });
    }
  };

  const previewVariant = ctaStyleToVariant(style);
  const previewClass = ctaStyleToClassName(style);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit button: {def.location}</DialogTitle>
          <DialogDescription className="font-mono text-xs">{def.key}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Live preview */}
          <div className="rounded-lg border bg-muted/30 p-6 flex items-center justify-center">
            <Button variant={previewVariant} size={style.size} className={previewClass}>
              {style.icon && style.iconPosition === "left" && (() => {
                const Icon = lucideIcons[style.icon as keyof typeof lucideIcons];
                return Icon ? <Icon size={16} className="mr-2" /> : null;
              })()}
              {labelEditor
                ? (editLang === "ar" ? (labelValueAr || labelValue || labelEditor.fallback) : (labelValue || labelEditor.fallback))
                : "Preview"}
              {style.icon && style.iconPosition === "right" && (() => {
                const Icon = lucideIcons[style.icon as keyof typeof lucideIcons];
                return Icon ? <Icon size={16} className="ml-2" /> : null;
              })()}
            </Button>
          </div>

          {labelEditor && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Button text
              </Label>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="cta-label-en" className="text-[11px] font-medium text-muted-foreground/80">
                    English
                  </Label>
                  <Input
                    id="cta-label-en"
                    value={labelValue}
                    onChange={(e) => setLabelValue(e.target.value)}
                    placeholder={labelEditor.fallback}
                    disabled={loadingLabel}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cta-label-ar" className="text-[11px] font-medium text-muted-foreground/80">
                    العربية (Arabic)
                  </Label>
                  <Input
                    id="cta-label-ar"
                    value={labelValueAr}
                    onChange={(e) => setLabelValueAr(e.target.value)}
                    placeholder="—"
                    disabled={loadingLabel}
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Destination — hidden for style-only buttons (form submits etc.) */}
          {!styleOnly && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Destination
              </Label>
              <div className="grid grid-cols-[160px_1fr] gap-2">
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as CtaKind)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                >
                  {(Object.keys(KIND_LABELS) as CtaKind[]).map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABELS[k]}
                    </option>
                  ))}
                </select>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={kind === "link" ? "/contact" : kind === "email" ? "info@example.com" : "+971..."}
                />
              </div>
              {ctaDestinationNeedsNormalization(kind, value) && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  Tip: don't include the <code className="font-mono">/ar</code> prefix —
                  we'll save this as <code className="font-mono">{normalizeCtaDestination(kind, value)}</code> so
                  Arabic and English visitors are routed correctly.
                </p>
              )}
            </div>
          )}
          {/* Variant */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Style
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {VARIANTS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setStyle((s) => ({ ...s, variant: v.value }))}
                  className={`rounded-md border-2 p-2 text-xs font-medium transition-all ${
                    style.variant === v.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className={`rounded px-2 py-1.5 mb-1 text-center ${v.preview}`}>
                    Aa
                  </div>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Size
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStyle((p) => ({ ...p, size: s.value }))}
                  className={`rounded-md border-2 px-3 py-2 text-sm font-medium transition-all ${
                    style.size === s.value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Color (theme tokens)
            </Label>
            <div className="grid grid-cols-1 gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setStyle((s) => ({ ...s, color: c.value }))}
                  className={`flex items-center gap-3 rounded-md border-2 px-3 py-2 text-sm transition-all ${
                    style.color === c.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className={`w-5 h-5 rounded ${c.swatch} border border-border`} />
                  <span className="text-foreground">{c.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Colors come from the design system to keep your site on-brand.
            </p>
          </div>

          {/* Font color */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Font color
            </Label>
            <div className="grid grid-cols-1 gap-1.5">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setStyle((s) => ({ ...s, textColor: c.value }))}
                  className={`flex items-center gap-3 rounded-md border-2 px-3 py-2 text-sm transition-all ${
                    style.textColor === c.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className={`w-5 h-5 rounded ${c.swatch} border border-border`} />
                  <span className="text-foreground">{c.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Overrides the variant's default text color.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hover background
              </Label>
              <div className="grid grid-cols-1 gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={`hover-bg-${c.value}`}
                    type="button"
                    onClick={() => setStyle((s) => ({ ...s, hoverColor: c.value }))}
                    className={`flex items-center gap-3 rounded-md border-2 px-3 py-2 text-sm transition-all ${
                      style.hoverColor === c.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded ${c.swatch} border border-border`} />
                    <span className="text-foreground">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hover text
              </Label>
              <div className="grid grid-cols-1 gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={`hover-text-${c.value}`}
                    type="button"
                    onClick={() => setStyle((s) => ({ ...s, hoverTextColor: c.value }))}
                    className={`flex items-center gap-3 rounded-md border-2 px-3 py-2 text-sm transition-all ${
                      style.hoverTextColor === c.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded ${c.swatch} border border-border`} />
                    <span className="text-foreground">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hover border
              </Label>
              <div className="grid grid-cols-1 gap-1.5">
                {BORDER_COLORS.map((c) => (
                  <button
                    key={`hover-border-${c.value}`}
                    type="button"
                    onClick={() => setStyle((s) => ({ ...s, hoverBorderColor: c.value }))}
                    className={`flex items-center gap-3 rounded-md border-2 px-3 py-2 text-sm transition-all ${
                      style.hoverBorderColor === c.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded ${c.swatch} border border-border`} />
                    <span className="text-foreground">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Font weight */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Font weight
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {FONT_WEIGHTS.map((w) => (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => setStyle((s) => ({ ...s, fontWeight: w.value }))}
                  className={`rounded-md border-2 px-2 py-2 text-sm transition-all ${
                    style.fontWeight === w.value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  } ${w.className}`}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Controls the thickness of the button text.
            </p>
          </div>

          {/* Border radius */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Corner radius
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {RADII.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setStyle((s) => ({ ...s, radius: r.value }))}
                  className={`flex flex-col items-center gap-1.5 border-2 px-2 py-2 text-xs font-medium transition-all ${r.className} ${
                    style.radius === r.value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <div className={`w-full h-5 bg-muted-foreground/30 ${r.className}`} />
                  {r.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Square = sharp edges. Pill = fully round.
            </p>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Icon
            </Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIconPickerOpen(true)}
                className="flex items-center gap-2 rounded-md border-2 border-border hover:border-foreground/30 px-3 py-2 text-sm transition-all flex-1"
              >
                {style.icon ? (() => {
                  const Icon = lucideIcons[style.icon as keyof typeof lucideIcons];
                  return Icon ? (
                    <>
                      <Icon size={18} className="text-foreground" />
                      <span className="text-foreground">{style.icon}</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={18} className="text-muted-foreground" />
                      <span className="text-muted-foreground">Pick an icon…</span>
                    </>
                  );
                })() : (
                  <>
                    <ImageIcon size={18} className="text-muted-foreground" />
                    <span className="text-muted-foreground">Pick an icon…</span>
                  </>
                )}
              </button>
              {style.icon && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setStyle((s) => ({ ...s, icon: null }))}
                  title="Remove icon"
                >
                  <X size={16} />
                </Button>
              )}
            </div>

            {/* Position toggle (only when icon is set) */}
            {style.icon && (
              <div className="grid grid-cols-2 gap-2">
                {(["left", "right"] as CtaStyleIconPosition[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setStyle((s) => ({ ...s, iconPosition: pos }))}
                    className={`rounded-md border-2 px-3 py-2 text-sm font-medium transition-all capitalize ${
                      style.iconPosition === pos
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {pos === "left" ? "← Left" : "Right →"}
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              Choose any of 1,700+ Lucide icons to prepend or append to the button label.
            </p>
          </div>
          {!styleOnly && (
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="new-tab" className="text-sm font-medium">
                  Open in new tab
                </Label>
                <p className="text-xs text-muted-foreground">External URLs and WhatsApp open in a new tab automatically.</p>
              </div>
              <Switch
                id="new-tab"
                checked={style.newTab}
                onCheckedChange={(v) => setStyle((s) => ({ ...s, newTab: v }))}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={handleResetStyle} type="button" className="text-muted-foreground">
              <Trash2 size={14} className="mr-1" /> Reset style
            </Button>
            <Button variant="ghost" onClick={handleDeleteAll} type="button" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 size={14} className="mr-1" /> Hide button
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={savingDest || saveStyle.isPending || loadingLabel} type="button">
              {savingDest || saveStyle.isPending ? (
                <Loader2 size={14} className="mr-1 animate-spin" />
              ) : (
                <Save size={14} className="mr-1" />
              )}
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <LucideIconPicker
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        value={style.icon}
        onSelect={(name) => setStyle((s) => ({ ...s, icon: name }))}
        title="Pick a button icon"
      />
    </Dialog>
  );
};

export default CtaStyleEditor;
