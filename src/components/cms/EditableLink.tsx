import { ReactNode, MouseEvent, useState, AnchorHTMLAttributes, forwardRef } from "react";
import { Link } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useCtaTargets, targetToAnchor } from "@/hooks/useCtaTargets";
import { useCtaStyles } from "@/hooks/useCtaStyles";
import { useEditMode } from "@/components/cms/EditModeContext";
import CtaStyleEditor from "@/components/cms/CtaStyleEditor";
import { trackCtaClick } from "@/lib/trackCtaClick";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";
import { extractLabelEditor } from "@/components/cms/extractLabelEditor";

interface EditableLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Registry key — must exist in CTA_REGISTRY */
  ctaKey: string;
  children: ReactNode;
  /** Optional fallback href if registry lookup fails */
  defaultTo?: string;
  /** Analytics context (e.g. "footer_nav") */
  trackingPage?: string;
}

/**
 * Lightweight CMS-controlled link wrapper for inline navigation links and
 * social icons that should NOT look like buttons. Preserves the parent's
 * styling completely; only swaps the destination from CMS and intercepts
 * clicks in edit mode to open the unified editor.
 */
const EditableLink = forwardRef<HTMLAnchorElement, EditableLinkProps>(({ 
  ctaKey,
  children,
  defaultTo,
  trackingPage,
  className,
  onClick,
  ...rest
}, ref) => {
  const { get: getTarget } = useCtaTargets();
  const { get: getStyle } = useCtaStyles();
  const { enabled: editEnabled } = useEditMode();
  const { lang } = useLanguage();
  const [editorOpen, setEditorOpen] = useState(false);

  const target = getTarget(ctaKey);
  const style = getStyle(ctaKey);
  const anchor = targetToAnchor(target);
  const isHidden = !!target.hidden;

  if (isHidden && !editEnabled) {
    return null;
  }

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (editEnabled) {
      e.preventDefault();
      e.stopPropagation();
      setEditorOpen(true);
      return;
    }
    const destination = anchor?.href ?? target.value ?? defaultTo ?? "/";
    trackCtaClick({
      label: typeof children === "string" ? children : ctaKey,
      destination,
      kind: anchor ? target.kind : "link",
      page: trackingPage,
      source: ctaKey,
      registry: true,
    });
    onClick?.(e);
  };

  const editClasses = cn(
    className,
    editEnabled &&
      "outline outline-1 outline-dashed outline-primary/60 outline-offset-2 relative",
    editEnabled && isHidden && "opacity-45",
  );

  const inner = (
    <>
      {children}
      {editEnabled && (
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center shadow-md pointer-events-none">
          <Pencil size={8} />
        </span>
      )}
    </>
  );

  // Edit mode → render plain anchor so we can preventDefault reliably
  if (editEnabled) {
    return (
      <>
        <a
          ref={ref}
          {...rest}
          href="#"
          className={editClasses}
          onClick={handleClick}
          title="Click to edit this link"
        >
          {inner}
        </a>
        <CtaStyleEditor
          ctaKey={ctaKey}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          labelEditor={extractLabelEditor(children)}
        />
      </>
    );
  }

  // External / mailto / tel / whatsapp
  if (anchor) {
    return (
      <a
        ref={ref}
        {...rest}
        href={anchor.href}
        className={className}
        onClick={handleClick}
        {...(anchor.external || style.newTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  }

  // Internal route
  const to = localizeInternalPath(target.value || defaultTo || "/", lang);
  if (style.newTab) {
    return (
      <a
        ref={ref}
        {...rest}
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }
  return (
    <Link ref={ref} to={to} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
});

EditableLink.displayName = "EditableLink";

export default EditableLink;
