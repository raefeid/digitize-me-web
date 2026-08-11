import { useMemo, useState, ReactNode, MouseEvent, forwardRef, type Ref, type MouseEventHandler, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { LazyLucideIcon } from "@/components/cms/LazyLucideIcon";
import { Button, ButtonProps } from "@/components/ui/button";
import LeadCaptureModal from "./LeadCaptureModal";
import { trackCtaClick } from "@/lib/trackCtaClick";
import { cn } from "@/lib/utils";
import {
  useCtaStyles,
  ctaStyleToVariant,
  ctaStyleToClassName,
  CtaStyle,
  hasCtaSizeClasses,
  stripCtaColorClasses,
  stripCtaFontWeightClasses,
  stripCtaRadiusClasses,
  stripCtaSizeClasses,
} from "@/hooks/useCtaStyles";
import { useCtaTargets, targetToAnchor } from "@/hooks/useCtaTargets";
import { useEditMode } from "@/components/cms/EditModeContext";
import CtaStyleEditor from "@/components/cms/CtaStyleEditor";
import { extractLabelEditor } from "@/components/cms/extractLabelEditor";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";

interface LeadCaptureCTAProps extends Omit<ButtonProps, "asChild" | "onClick"> {
  /** Stored on the lead row for attribution (e.g. "home_hero", "pricing_footer") */
  source?: string;
  /** Display label */
  children: ReactNode;
  /**
   * Optional default style preset used when nothing is saved in the CMS yet.
   * The CMS key for styling is derived from `source` so each placement has
   * its own per-key style row (matches the per-placement modal source).
   */
  defaultStyle?: Partial<CtaStyle>;
}

const renderIcon = (name: string | null | undefined, position: "left" | "right") => {
  if (!name) return null;
  return <LazyLucideIcon name={name} size={16} className={position === "left" ? "mr-2 shrink-0" : "ml-2 shrink-0"} />;
};

/**
 * Dedicated CTA that opens the multi-step lead capture modal.
 *
 * In edit mode (admin), clicking the button opens the same `CtaStyleEditor`
 * dialog used by `CtaButton` (in `styleOnly` mode — destination is the modal
 * and is not editable). The CMS style key is `lead_cta_<source>` so each
 * placement (home_hero, features_index, …) can be styled independently.
 */
const LeadCaptureCTA = forwardRef<HTMLButtonElement, LeadCaptureCTAProps>(({
  source = "lead_cta",
  children,
  className,
  variant,
  size,
  defaultStyle,
  ...buttonProps
}, ref) => {
  const [open, setOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const { enabled: editEnabled } = useEditMode();
  const { get: getStyle, hasOverride } = useCtaStyles();
  const { get: getTarget, rows: targetRows } = useCtaTargets();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  // One CMS row per placement, namespaced so it doesn't collide with
  // the registry keys used by CtaButton.
  const ctaKey = `lead_cta_${source}`;

  // Destination: by default, this button opens the lead-capture modal.
  // Admins can override the destination (link/email/phone/...) in the editor.
  // We detect "admin overrode it" by checking if a real CMS row exists for
  // this key — if so, navigate; otherwise open the modal.
  const target = getTarget(ctaKey);
  const hasCustomDestination = targetRows.some((r) => r.section === ctaKey);

  const cmsStyle = getStyle(ctaKey, {
    ...defaultStyle,
    variant:
      defaultStyle?.variant ??
      (variant === "outline" ? "outline" : variant === "ghost" ? "ghost" : "accent"),
    size: defaultStyle?.size ?? (size as "sm" | "default" | "lg" | undefined) ?? "default",
  });

  const resolvedVariant = ctaStyleToVariant(cmsStyle);
  const hasColorOverride = hasOverride(ctaKey, ["variant", "color", "text_color", "hover_color", "hover_text_color", "hover_border_color"]);
  const hasSizeOverride = hasOverride(ctaKey, ["size"]);
  const hasRadiusOverride = hasOverride(ctaKey, ["radius"]);
  const hasFontWeightOverride = hasOverride(ctaKey, ["font_weight"]);

  const sanitizedClassName = useMemo(() => {
    let next = className;
    if (hasColorOverride) next = stripCtaColorClasses(next);
    if (hasSizeOverride) next = stripCtaSizeClasses(next);
    if (hasRadiusOverride) next = stripCtaRadiusClasses(next);
    if (hasFontWeightOverride) next = stripCtaFontWeightClasses(next);
    return next;
  }, [className, hasColorOverride, hasFontWeightOverride, hasRadiusOverride, hasSizeOverride]);

  const resolvedSize = !hasSizeOverride && hasCtaSizeClasses(className)
    ? undefined
    : cmsStyle.size;

  const resolvedClassName = cn(
    !cmsStyle.color && resolvedVariant === "default" && "bg-accent text-accent-foreground hover:bg-accent/90 px-8",
    sanitizedClassName,
    ctaStyleToClassName(cmsStyle),
    editEnabled && "outline outline-2 outline-dashed outline-primary/60 outline-offset-2 relative",
  );

  const leftIcon = renderIcon(cmsStyle.icon, "left");
  const rightIcon = cmsStyle.iconPosition === "right" ? renderIcon(cmsStyle.icon, "right") : null;
  const labelWithIcon = (
    <>
      {cmsStyle.iconPosition !== "right" && leftIcon}
      {children}
      {rightIcon}
    </>
  );

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (editEnabled) {
      e.preventDefault();
      e.stopPropagation();
      setEditorOpen(true);
      return;
    }

    const label = typeof children === "string" ? children : "Lead capture";

    // Admin set a custom destination → navigate there instead of opening modal
    if (hasCustomDestination && target.value) {
      const anchor = targetToAnchor(target);
      // For internal links, automatically route to the current language
      // (e.g. /contact → /ar/contact when the visitor is on the Arabic site).
      const localizedInternal = !anchor ? localizeInternalPath(target.value, lang) : null;
      const destination = anchor?.href ?? localizedInternal ?? target.value;
      trackCtaClick({
        label,
        destination,
        kind: target.kind,
        source,
        page: source,
        registry: false,
      });
      if (anchor) {
        if (anchor.external || cmsStyle.newTab) {
          window.open(anchor.href, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = anchor.href;
        }
      } else if (cmsStyle.newTab) {
        window.open(localizedInternal ?? target.value, "_blank", "noopener,noreferrer");
      } else {
        navigate(localizedInternal ?? target.value);
      }
      return;
    }

    // Default: open the lead-capture modal
    trackCtaClick({
      label,
      destination: "modal:lead_capture",
      kind: "link",
      source,
      page: source,
      registry: false,
    });
    setOpen(true);
  };

  // In edit mode, render as a <div role="button"> (via Button asChild) so any
  // nested <EditableText> label can receive a caret. Browsers do not allow
  // contentEditable to receive focus inside a real <button> element.
  if (editEnabled) {
    return (
      <>
        <Button
          asChild
          variant={resolvedVariant}
          size={resolvedSize}
          className={resolvedClassName}
          {...buttonProps}
        >
          <div
            ref={ref as unknown as Ref<HTMLDivElement>}
            role="button"
            tabIndex={0}
            onClick={handleClick as unknown as MouseEventHandler<HTMLDivElement>}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick(e as unknown as MouseEvent<HTMLButtonElement>);
              }
            }}
            title="Click to edit this button — click the label to edit text"
          >
            {labelWithIcon}
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-md pointer-events-none">
              <Pencil size={10} />
            </span>
          </div>
        </Button>
        <LeadCaptureModal open={open} onOpenChange={setOpen} source={source} />
        <CtaStyleEditor
          ctaKey={ctaKey}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          fallbackStyle={defaultStyle}
          customLocation={`Lead capture button — ${source} (leave destination empty to open the lead capture form)`}
          labelEditor={extractLabelEditor(children)}
        />
      </>
    );
  }

  return (
    <>
      <Button
        ref={ref}
        type="button"
        onClick={handleClick}
        variant={resolvedVariant}
        size={resolvedSize}
        className={resolvedClassName}
        {...buttonProps}
      >
        {labelWithIcon}
      </Button>
      <LeadCaptureModal open={open} onOpenChange={setOpen} source={source} />
    </>
  );
});

LeadCaptureCTA.displayName = "LeadCaptureCTA";

export default LeadCaptureCTA;
