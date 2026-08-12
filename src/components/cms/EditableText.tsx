import { createElement, forwardRef, useEffect, useImperativeHandle, useRef, useState, ReactNode } from "react";
import { useEditMode, useEditLang } from "./EditModeContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { sanitizeRichHtml } from "@/lib/sanitizeHtml";

interface EditableTextProps {
  page: string;
  section?: string;
  contentKey: string;
  /** Default text shown when nothing is in CMS yet */
  fallback: string;
  /** Element tag to render — keeps existing typography intact */
  as?: keyof JSX.IntrinsicElements;
  /** Multi-line: allow line breaks, taller editing affordance */
  multiline?: boolean;
  className?: string;
  /** Optional: inline children rendered after the text (e.g. RotatingHeroWord) */
  children?: ReactNode;
  /**
   * If true, allow rich formatting (bold, italic, headings, links) and render
   * the saved value as HTML. If false (default), the value is plain text.
   * Inline buttons / nav links should stay non-rich. Headings, paragraphs and
   * descriptions should be rich.
   */
  rich?: boolean;
}

/** Detect HTML tags so we can decide between text vs html rendering */
const looksLikeHTML = (s: string) => /<\/?[a-z][\s\S]*>/i.test(s);

/**
 * In-place editable text. When admin is in Edit Mode, the element becomes a
 * contentEditable area with a dashed outline. Edits are staged in EditModeContext
 * and persisted on "Save all".
 *
 * If `rich` is true, a floating FormatToolbar (mounted globally in App) attaches
 * to the active selection.
 */
const EditableText = forwardRef<HTMLElement, EditableTextProps>(({
  page,
  section = "home",
  contentKey,
  fallback,
  as: Tag = "span",
  multiline = false,
  className = "",
  children,
  rich = false,
}, forwardedRef) => {
  const { enabled, stageChange, getStaged } = useEditMode();
  const lang = useEditLang();
  const { getContent } = useSiteContent(page, section);

  // What to display: staged > saved > fallback
  const saved = getContent(contentKey, fallback);
  const staged = getStaged(page, section, contentKey, lang);
  const display = staged ?? saved;

  const ref = useRef<HTMLElement>(null);
  const RenderTag = typeof Tag === "string" ? Tag : "span";
  const canAttachDomRef = typeof Tag === "string";

  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement | null, []);

  // Keep the DOM in sync with `display` whenever we are NOT actively editing
  // (avoids cursor-jump while typing).
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

  const stageFromDom = (finalize = false) => {
    if (!ref.current || !canAttachDomRef) return;
    let value: string;
    if (rich) {
      value = ref.current.innerHTML.trim();
    } else if (multiline) {
      value = ref.current.innerText.replace(/\n{3,}/g, "\n\n").trim();
    } else {
      value = ref.current.innerText.replace(/\s+/g, " ").trim();
    }
    if (finalize) setEditing(false);
    if (value === display) return;
    stageChange({
      page,
      section,
      content_key: contentKey,
      content_type: "text",
      lang,
      value,
      fallback,
    });
  };

  const commit = () => stageFromDom(true);

  const editableProps = enabled && canAttachDomRef
    ? {
        contentEditable: true as const,
        suppressContentEditableWarning: true,
        onFocus: () => setEditing(true),
        onInput: () => stageFromDom(false),
        onBlur: commit,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (!rich && !multiline && e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLElement).blur();
          }
          if (e.key === "Escape") {
            (e.target as HTMLElement).blur();
          }
        },
        // Prevent links inside the editable from being followed while editing.
        // Let CTA wrapper clicks bubble so the button editor dialog opens; direct
        // text editing still works because CtaButton/LeadCaptureCTA ignore clicks
        // that originate from contentEditable children.
        onClick: (e: React.MouseEvent) => {
          if (enabled) {
            e.preventDefault();
          }
        },
        "data-edit-key": `${page}/${section}/${contentKey}`,
        "data-rich-edit": rich ? "true" : undefined,
        title: "Click to edit",
      }
    : {};

  const editClass = enabled
    ? "outline-dashed outline-2 outline-offset-2 outline-accent/60 rounded-sm cursor-text hover:outline-accent focus-visible:outline-accent focus-visible:outline-solid focus-visible:bg-accent/5"
    : "";

  // When editing Arabic, force RTL direction so text flows correctly while typing
  const dirProps = enabled && canAttachDomRef
    ? { dir: lang === "ar" ? "rtl" as const : "ltr" as const }
    : {};

  // Initial children for SSR / first render — content effect above re-syncs.
  const initialChildren = rich || looksLikeHTML(display) ? undefined : display;

  // Render the tag with the right props. Fall back to <span> for non-DOM `as`
  // values so React never receives a ref on a function component.
  const element = createElement(
    RenderTag,
    {
      ...(canAttachDomRef ? { ref } : {}),
      className: `${className} ${editClass} ${enabled ? "transition-all" : ""}`.trim(),
      ...dirProps,
      ...(initialChildren === undefined
        ? { dangerouslySetInnerHTML: { __html: sanitizeRichHtml(display) } }
        : {}),
      ...editableProps,
    },
    initialChildren,
  );

  return (
    <>
      {element}
      {children}
    </>
  );
});

EditableText.displayName = "EditableText";

export default EditableText;
