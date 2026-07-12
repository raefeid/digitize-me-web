import { ReactNode, MouseEvent, useMemo, useState, forwardRef } from "react";
import { Pencil } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
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
import { extractLabelEditor } from "@/components/cms/extractLabelEditor";
import { cn } from "@/lib/utils";

interface StyleEditableButtonProps extends Omit<ButtonProps, "asChild"> {
  /**
   * Style-only key (e.g. "form_contact_submit") — stored under cta_styles.
   * Independent from CTA_REGISTRY so non-link buttons (form submits) can be
   * restyled without polluting the destination registry.
   */
  styleKey: string;
  /** Friendly label shown in the editor dialog */
  location: string;
  children: ReactNode;
  /** Default style preset when nothing saved */
  defaultStyle?: Partial<CtaStyle>;
}

/**
 * Wraps a real shadcn Button with CMS-controlled styling. Unlike CtaButton,
 * this preserves the underlying `type` (incl. "submit") and the original
 * `onClick` business logic — clicking outside edit mode submits the form
 * normally. In edit mode, it intercepts the click to open the style editor.
 */
const StyleEditableButton = forwardRef<HTMLButtonElement, StyleEditableButtonProps>(
  ({ styleKey, location, children, defaultStyle, className, variant, size, onClick, type, ...rest }, ref) => {
    const { get: getStyle, hasOverride } = useCtaStyles();
    const { enabled: editEnabled } = useEditMode();
    const [editorOpen, setEditorOpen] = useState(false);

    const cmsStyle = getStyle(styleKey, {
      variant: defaultStyle?.variant ?? "primary",
      size: defaultStyle?.size ?? (size as "sm" | "default" | "lg" | undefined) ?? "default",
      color: defaultStyle?.color ?? "default",
      newTab: false,
    });

    const resolvedVariant = ctaStyleToVariant(cmsStyle);
    const hasColorOverride = hasOverride(styleKey, ["variant", "color", "text_color", "hover_color", "hover_text_color", "hover_border_color"]);
    const hasSizeOverride = hasOverride(styleKey, ["size"]);
    const hasRadiusOverride = hasOverride(styleKey, ["radius"]);
    const hasFontWeightOverride = hasOverride(styleKey, ["font_weight"]);

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
      ctaStyleToClassName(cmsStyle),
      editEnabled && "outline outline-2 outline-dashed outline-primary/60 outline-offset-2 relative",
      sanitizedClassName,
    );

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (editEnabled) {
        e.preventDefault();
        e.stopPropagation();
        setEditorOpen(true);
        return;
      }
      onClick?.(e);
    };

    return (
      <>
        <Button
          {...rest}
          ref={ref}
          // In edit mode force type="button" so it won't accidentally submit
          type={editEnabled ? "button" : type}
          variant={resolvedVariant}
          size={resolvedSize}
          className={resolvedClassName}
          onClick={handleClick}
          title={editEnabled ? "Click to edit this button's style" : undefined}
        >
          {children}
          {editEnabled && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center shadow-md pointer-events-none">
              <Pencil size={10} />
            </span>
          )}
        </Button>
        <CtaStyleEditor
          ctaKey={styleKey}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          fallbackStyle={defaultStyle}
          styleOnly
          customLocation={location}
          labelEditor={extractLabelEditor(children)}
        />
      </>
    );
  },
);

StyleEditableButton.displayName = "StyleEditableButton";

export default StyleEditableButton;
