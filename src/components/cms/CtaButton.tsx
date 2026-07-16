import { ReactNode, forwardRef, MouseEvent, useMemo, useState, type Ref, type MouseEventHandler, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Pencil, icons as lucideIcons } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useCtaTargets, targetToAnchor } from "@/hooks/useCtaTargets";
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
import { useEditMode } from "@/components/cms/EditModeContext";
import CtaStyleEditor from "@/components/cms/CtaStyleEditor";
import { trackCtaClick } from "@/lib/trackCtaClick";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";
import type { CtaLabelEditorConfig } from "@/components/cms/CtaStyleEditor";
import { extractLabelEditor } from "@/components/cms/extractLabelEditor";
import { launchExternal } from "@/components/transitions/LaunchOverlay";

/** Render a Lucide icon by name, or null if not found. */
const renderIcon = (name: string | null | undefined, position: "left" | "right") => {
  if (!name) return null;
  const Icon = lucideIcons[name as keyof typeof lucideIcons];
  if (!Icon) return null;
  return <Icon size={16} className={position === "left" ? "mr-2 shrink-0" : "ml-2 shrink-0"} />;
};

interface CtaButtonProps extends Omit<ButtonProps, "asChild"> {
  /** Registry key — see CTA_REGISTRY in useCtaTargets.tsx */
  ctaKey: string;
  /** Button label (children) */
  children: ReactNode;
  /**
   * Optional fallback href used only when the CMS lookup hasn't resolved yet.
   * Defaults come from the registry so this is rarely needed.
   */
  defaultTo?: string;
  /**
   * Optional analytics context (e.g. "navbar", "hero", "pricing_table") so
   * dashboards can break down CTA performance by where the button lives.
   */
  trackingPage?: string;
  /**
   * Default style preset used when nothing is saved in the CMS yet.
   * Lets each placement (hero/navbar/pricing) ship with sensible defaults.
   */
  defaultStyle?: Partial<CtaStyle>;
  /** Optional CMS text row so the button label can be renamed from the CTA editor dialog. */
  labelEditor?: CtaLabelEditorConfig;
  /**
   * Human-readable location label shown in the editor when ctaKey is dynamic
   * (i.e. not statically present in CTA_REGISTRY — e.g. per-plan pricing buttons).
   */
  customLocation?: string;
}

/** Plain-text fallback used as the analytics label when children is JSX. */
const labelFromChildren = (children: ReactNode, fallback: string): string => {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) {
    const text = children.find((c) => typeof c === "string" || typeof c === "number");
    if (text != null) return String(text);
  }
  return fallback;
};

/**
 * Smart CTA button. Resolves its destination AND visual style from the CMS
 * so admins can change everything (where it goes + how it looks) per
 * registry key without touching code.
 *
 * Edit mode behavior: clicking the button opens an in-place editor dialog
 * instead of navigating. Outside edit mode, behaves exactly as before
 * (navigates + fires analytics).
 */
const CtaButton = forwardRef<HTMLButtonElement, CtaButtonProps>(
  (
    { ctaKey, children, defaultTo, trackingPage, onClick, className, variant, size, defaultStyle, labelEditor, customLocation, ...buttonProps },
    ref,
  ) => {
    const { get: getTarget } = useCtaTargets();
    const { get: getStyle, hasOverride } = useCtaStyles();
    const { enabled: editEnabled } = useEditMode();
    const { lang } = useLanguage();
    const [editorOpen, setEditorOpen] = useState(false);

    const target = getTarget(ctaKey);
    const anchor = targetToAnchor(target);
    const isHidden = !!target.hidden;

    // Resolve style: CMS overrides > defaultStyle > component variant/size props
    const cmsStyle = getStyle(ctaKey, {
      ...defaultStyle,
      // Fall back to whatever the component passed via variant/size if no CMS value
      variant: defaultStyle?.variant ?? (variant === "outline" ? "outline" : variant === "ghost" ? "ghost" : "primary"),
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
      sanitizedClassName,
      ctaStyleToClassName(cmsStyle),
      editEnabled && "outline outline-2 outline-dashed outline-primary/60 outline-offset-2 relative",
      editEnabled && isHidden && "opacity-45",
    );

    if (isHidden && !editEnabled) {
      return null;
    }

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      // Edit mode: intercept and open editor instead of navigating
      if (editEnabled) {
        e.preventDefault();
        e.stopPropagation();
        setEditorOpen(true);
        return;
      }

      const destination = anchor?.href ?? target.value ?? defaultTo ?? "/contact";
      const kind = anchor ? target.kind : "link";
      trackCtaClick({
        label: labelFromChildren(children, ctaKey),
        destination,
        kind,
        page: trackingPage,
        source: ctaKey,
        registry: true,
      });
      // Cool launch animation for the DigitizeMe app URL.
      if (typeof destination === "string" && /fotofind\.digitizeme\.ae/i.test(destination)) {
        e.preventDefault();
        e.stopPropagation();
        launchExternal(destination);
        onClick?.(e);
        return;
      }
      onClick?.(e);
    };

    const leftIcon = renderIcon(cmsStyle.icon, "left");
    const rightIcon = cmsStyle.iconPosition === "right" ? renderIcon(cmsStyle.icon, "right") : null;
    const labelWithIcon = (
      <>
        {cmsStyle.iconPosition !== "right" && leftIcon}
        {children}
        {rightIcon}
      </>
    );

    // Inner content with edit-mode badge
    const inner = (
      <>
        {labelWithIcon}
        {editEnabled && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-md pointer-events-none">
            <Pencil size={10} />
          </span>
        )}
      </>
    );

    // In edit mode, render as a <div role="button"> (via Button asChild) so
    // that any nested contentEditable label (EditableText) can actually receive
    // a caret. Real <button> elements do not allow text selection/caret on
    // their children, which would block in-place text editing.
    if (editEnabled) {
      return (
        <>
          <Button
            {...buttonProps}
            asChild
            variant={resolvedVariant}
            size={resolvedSize}
            className={resolvedClassName}
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
              {inner}
            </div>
          </Button>
          <CtaStyleEditor
            ctaKey={ctaKey}
            open={editorOpen}
            onOpenChange={setEditorOpen}
            fallbackStyle={defaultStyle}
            customLocation={customLocation}
            labelEditor={labelEditor ?? extractLabelEditor(children)}
          />
        </>
      );
    }

    // Normal (non-edit) rendering — anchor for mailto/tel/etc, Link for internal
    if (anchor) {
      return (
        <Button
          {...buttonProps}
          ref={ref}
          asChild
          variant={resolvedVariant}
          size={resolvedSize}
          className={resolvedClassName}
          onClick={handleClick}
        >
          <a
            href={anchor.href}
            {...(anchor.external || cmsStyle.newTab
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {labelWithIcon}
          </a>
        </Button>
      );
    }

    const to = localizeInternalPath(target.value || defaultTo || "/contact", lang);
    return (
      <Button
        {...buttonProps}
        ref={ref}
        asChild
        variant={resolvedVariant}
        size={resolvedSize}
        className={resolvedClassName}
        onClick={handleClick}
      >
        {cmsStyle.newTab ? (
          <a href={to} target="_blank" rel="noopener noreferrer">
            {labelWithIcon}
          </a>
        ) : (
          <Link to={to}>{labelWithIcon}</Link>
        )}
      </Button>
    );
  },
);

CtaButton.displayName = "CtaButton";

export default CtaButton;
