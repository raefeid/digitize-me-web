import { createElement, useEffect, useRef, useState } from "react";
import { useEditMode } from "./EditModeContext";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface EditableSectionTextProps {
  /** Stable identity for React/devtools */
  identity: string;
  /** Current value to render */
  value: string;
  /** Called with the new value when the user finishes editing */
  onSave: (next: string) => void;
  fallback?: string;
  as?: keyof JSX.IntrinsicElements;
  multiline?: boolean;
  rich?: boolean;
  className?: string;
}

const looksLikeHTML = (s: string) => /<\/?[a-z][\s\S]*>/i.test(s);

/**
 * Inline editable text bound to ANY string slot — used for nested feature
 * `sections` items where there's no fixed column on the row. The parent owns
 * the data and persistence (via useEditableFeature).
 */
const EditableSectionText = ({
  identity,
  value,
  onSave,
  fallback = "",
  as: Tag = "span",
  multiline = false,
  rich = false,
  className = "",
}: EditableSectionTextProps) => {
  const { enabled } = useEditMode();
  const display = value || fallback;

  const ref = useRef<HTMLElement>(null);
  const RenderTag = typeof Tag === "string" ? Tag : "span";
  const canAttachDomRef = typeof Tag === "string";
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (editing || !ref.current || !canAttachDomRef) return;
    if (rich || looksLikeHTML(display)) {
      const safe = sanitizeRichHtml(display);
      if (ref.current.innerHTML !== safe) ref.current.innerHTML = safe;
      return;
    }
    if (ref.current.innerText !== display) ref.current.innerText = display;
  }, [display, editing, canAttachDomRef, rich]);

  const stageFromDom = (finalize = false) => {
    if (!ref.current || !canAttachDomRef) return;
    const next = rich
      ? ref.current.innerHTML.trim()
      : multiline
        ? ref.current.innerText.replace(/\n{3,}/g, "\n\n").trim()
        : ref.current.innerText.replace(/\s+/g, " ").trim();
    if (finalize) setEditing(false);
    if (next === display) return;
    onSave(next);
  };

  const commit = () => stageFromDom(true);

  const editableProps =
    enabled && canAttachDomRef
      ? {
          contentEditable: true as const,
          suppressContentEditableWarning: true,
          onFocus: () => setEditing(true),
          onInput: () => stageFromDom(false),
          onBlur: commit,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (!multiline && e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLElement).blur();
            }
            if (e.key === "Escape") (e.target as HTMLElement).blur();
          },
          onClick: (e: React.MouseEvent) => {
            if (enabled) e.preventDefault();
          },
          "data-edit-section": identity,
          "data-rich-edit": rich ? "true" : undefined,
          title: "Click to edit",
        }
      : {};

  const editClass = enabled
    ? "outline-dashed outline-2 outline-offset-2 outline-accent/60 rounded-sm cursor-text hover:outline-accent focus-visible:outline-accent focus-visible:outline-solid focus-visible:bg-accent/5"
    : "";

  const initialChildren = rich || looksLikeHTML(display) ? undefined : display;

  return createElement(
    RenderTag,
    {
      ...(canAttachDomRef ? { ref } : {}),
      className: `${className} ${editClass}`.trim(),
      ...(initialChildren === undefined
        ? { dangerouslySetInnerHTML: { __html: sanitizeRichHtml(display) } }
        : {}),
      ...editableProps,
    },
    initialChildren
  );
};

export default EditableSectionText;
