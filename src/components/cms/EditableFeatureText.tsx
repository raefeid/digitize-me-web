import { createElement, useEffect, useRef, useState, ReactNode } from "react";
import { useEditMode, useEditLang } from "./EditModeContext";
import type { FeatureRow } from "@/hooks/useFeatures";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface EditableFeatureTextProps {
  feature: FeatureRow;
  /**
   * Base field name on the features row — e.g. "hero_title".
   * When the user is editing in Arabic, the component automatically writes
   * to `${field}_ar` (and falls back to the EN value when AR is empty).
   */
  field:
    | "hero_badge"
    | "hero_title"
    | "hero_desc"
    | "cta_primary_label"
    | "cta_secondary_label";
  onSave: (key: keyof FeatureRow, value: string) => void;
  fallback?: string;
  as?: keyof JSX.IntrinsicElements;
  multiline?: boolean;
  rich?: boolean;
  className?: string;
  children?: ReactNode;
}

const looksLikeHTML = (s: string) => /<\/?[a-z][\s\S]*>/i.test(s);

/**
 * In-place editable text bound to a single column on a `features` row.
 * Mirrors EditableText's UX (dashed outline, click-to-edit, Esc/Enter to blur)
 * but writes directly back to the feature row via `onSave`.
 */
const EditableFeatureText = ({
  feature,
  field,
  onSave,
  fallback = "",
  as: Tag = "span",
  multiline = false,
  rich = false,
  className = "",
  children,
}: EditableFeatureTextProps) => {
  const { enabled } = useEditMode();
  const lang = useEditLang();

  const arField = `${field}_ar` as keyof FeatureRow;
  const enValue = (feature[field] as string | null) ?? "";
  const arValue = (feature[arField] as string | null) ?? "";
  const activeKey: keyof FeatureRow = lang === "ar" ? arField : field;
  const display =
    lang === "ar" ? (arValue || enValue || fallback) : (enValue || fallback);

  const ref = useRef<HTMLElement>(null);
  const RenderTag = typeof Tag === "string" ? Tag : "span";
  const canAttachDomRef = typeof Tag === "string";

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (editing || !ref.current || !canAttachDomRef) return;
    if (rich || looksLikeHTML(display)) {
      const safe = sanitizeRichHtml(display);
      if (ref.current.innerHTML !== safe) ref.current.innerHTML = safe;
    } else {
      if (ref.current.innerText !== display) ref.current.innerText = display;
    }
  }, [display, editing, rich, canAttachDomRef]);

  const commit = () => {
    if (!ref.current || !canAttachDomRef) return;
    let value: string;
    if (rich) value = ref.current.innerHTML.trim();
    else if (multiline) value = ref.current.innerText.replace(/\n{3,}/g, "\n\n").trim();
    else value = ref.current.innerText.replace(/\s+/g, " ").trim();
    setEditing(false);
    if (value === display) return;
    onSave(activeKey, value);
  };

  const editableProps =
    enabled && canAttachDomRef
      ? {
          contentEditable: true as const,
          suppressContentEditableWarning: true,
          onFocus: () => setEditing(true),
          onBlur: commit,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (!rich && !multiline && e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLElement).blur();
            }
            if (e.key === "Escape") (e.target as HTMLElement).blur();
          },
          onClick: (e: React.MouseEvent) => {
            if (enabled) e.preventDefault();
          },
          "data-edit-feature-key": `${feature.slug}/${String(activeKey)}`,
          "data-rich-edit": rich ? "true" : undefined,
          title: "Click to edit",
        }
      : {};

  const editClass = enabled
    ? "outline-dashed outline-2 outline-offset-2 outline-accent/60 rounded-sm cursor-text hover:outline-accent focus-visible:outline-accent focus-visible:outline-solid focus-visible:bg-accent/5"
    : "";

  const initialChildren = rich || looksLikeHTML(display) ? undefined : display;

  const element = createElement(
    RenderTag,
    {
      ...(canAttachDomRef ? { ref } : {}),
      className: `${className} ${editClass} ${enabled ? "transition-all" : ""}`.trim(),
      ...(initialChildren === undefined
        ? { dangerouslySetInnerHTML: { __html: sanitizeRichHtml(display) } }
        : {}),
      ...editableProps,
    },
    initialChildren
  );

  return (
    <>
      {element}
      {children}
    </>
  );
};

export default EditableFeatureText;
