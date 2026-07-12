import { forwardRef, useCallback, useEffect, useState, useRef } from "react";
import { Bold, Italic, Underline, Link2, Heading1, Heading2, Heading3, Heading4, Heading5, RemoveFormatting, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Type, Highlighter, Ban, ChevronDown, ExternalLink, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * Floating formatting toolbar for the active contentEditable element.
 *
 * Features:
 * - Bold / Italic / Underline
 * - Headings (H1/H2/H3) and Paragraph
 * - Font size dropdown (Small … 2XL) — applied as inline `font-size` on a span
 * - Text color & highlight color popovers
 * - Bullet list, alignment
 * - Smart link editor: detects current selection's link, supports http(s)/mailto/tel,
 *   lets the admin pick "open in new tab" or "same tab"
 * - Clear formatting
 */
const exec = (command: string, value?: string) => {
  try { document.execCommand("styleWithCSS", false, "true"); } catch {}
  document.execCommand(command, false, value);
};

const TEXT_COLORS = [
  { name: "Default", value: "inherit" },
  { name: "Brand", value: "hsl(var(--accent))" },
  { name: "Primary", value: "hsl(var(--primary))" },
  { name: "Muted", value: "hsl(var(--muted-foreground))" },
  { name: "Black", value: "#0f172a" },
  { name: "White", value: "#ffffff" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Green", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", value: "transparent" },
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Purple", value: "#e9d5ff" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Red", value: "#fecaca" },
  { name: "Orange", value: "#fed7aa" },
  { name: "Brand", value: "hsl(var(--accent) / 0.2)" },
];

/** Font sizes mapped to friendly labels — applied via inline CSS, not legacy <font size>. */
const FONT_SIZES = [
  { label: "XS", value: "0.75rem" },
  { label: "Small", value: "0.875rem" },
  { label: "Normal", value: "1rem" },
  { label: "Large", value: "1.25rem" },
  { label: "XL", value: "1.5rem" },
  { label: "2XL", value: "2rem" },
  { label: "3XL", value: "2.5rem" },
  { label: "4XL", value: "3rem" },
];

const FONT_FAMILIES = [
  { label: "Sans", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "Arabic Sans", value: "'Noto Sans Arabic', sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
];

const BLOCK_OPTIONS = [
  { label: "Paragraph", value: "p", icon: "P" },
  { label: "Heading 1", value: "h1", icon: Heading1 },
  { label: "Heading 2", value: "h2", icon: Heading2 },
  { label: "Heading 3", value: "h3", icon: Heading3 },
  { label: "Heading 4", value: "h4", icon: Heading4 },
  { label: "Heading 5", value: "h5", icon: Heading5 },
];

const applyInlineStyle = (styles: Partial<CSSStyleDeclaration>) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  const span = document.createElement("span");
  Object.assign(span.style, styles);

  if (sel.isCollapsed) {
    span.textContent = "\u200B";
    range.insertNode(span);
    const nextRange = document.createRange();
    nextRange.setStart(span.firstChild ?? span, 1);
    nextRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(nextRange);
    return;
  }

  try {
    span.appendChild(range.extractContents());
    range.insertNode(span);
    sel.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    sel.addRange(nextRange);
  } catch {
    /* selection across non-editable boundaries — ignore */
  }
};

/** Wrap selection in a span with the chosen inline font-size. */
const applyFontSize = (size: string) => {
  applyInlineStyle({ fontSize: size });
};

const applyFontFamily = (fontFamily: string) => {
  applyInlineStyle({ fontFamily });
};

const findRichHost = (node: Node | null) => {
  let current = node;
  while (current) {
    if (current instanceof HTMLElement && current.dataset.richEdit === "true") {
      return current;
    }
    current = current.parentNode;
  }
  return null;
};

const FormatToolbar = () => {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const toolbarRef = useRef<HTMLDivElement>(null);
  const activeHostRef = useRef<HTMLElement | null>(null);
  const updateToolbar = useCallback(() => {
    const sel = window.getSelection();
    const selectionHost = sel && sel.rangeCount > 0
      ? findRichHost(sel.getRangeAt(0).commonAncestorContainer) ?? findRichHost(sel.anchorNode)
      : null;
    const focusedHost = document.activeElement instanceof HTMLElement && document.activeElement.dataset.richEdit === "true"
      ? document.activeElement
      : null;
    const host = selectionHost ?? focusedHost ?? activeHostRef.current;

    if (!host) {
      setPos(null);
      return;
    }

    activeHostRef.current = host;

    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    const hasExpandedSelection = !!range && !sel?.isCollapsed;
    const rect = hasExpandedSelection ? range.getBoundingClientRect() : host.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      setPos(null);
      return;
    }

    setPos({
      top: Math.max(12, rect.top - 48),
      left: rect.left + rect.width / 2,
    });
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  }, []);

  // ---- Selection tracking ----
  useEffect(() => {
    const scheduleUpdate = () => window.requestAnimationFrame(updateToolbar);
    const syncHostFromEvent = (event: Event) => {
      const target = event.target instanceof Node ? event.target : null;
      const host = findRichHost(target);
      if (host) {
        activeHostRef.current = host;
      } else if (
        toolbarRef.current &&
        target instanceof Node &&
        !toolbarRef.current.contains(target)
      ) {
        activeHostRef.current = null;
      }
      scheduleUpdate();
    };

    document.addEventListener("selectionchange", scheduleUpdate);
    document.addEventListener("focusin", syncHostFromEvent);
    document.addEventListener("mousedown", syncHostFromEvent, true);
    document.addEventListener("keyup", scheduleUpdate, true);
    document.addEventListener("mouseup", syncHostFromEvent, true);
    window.addEventListener("scroll", scheduleUpdate, true);
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      document.removeEventListener("selectionchange", scheduleUpdate);
      document.removeEventListener("focusin", syncHostFromEvent);
      document.removeEventListener("mousedown", syncHostFromEvent, true);
      document.removeEventListener("keyup", scheduleUpdate, true);
      document.removeEventListener("mouseup", syncHostFromEvent, true);
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [updateToolbar]);

  const savedRangeRef = useRef<Range | null>(null);
  const [openPopover, setOpenPopover] = useState<null | "color" | "highlight" | "size" | "font" | "block">(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const range = savedRangeRef.current;
    if (!range) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  // Close popovers on outside click
  useEffect(() => {
    if (!openPopover) return;
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPopover]);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // ---- Link dialog state ----
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; url: string; target: "_blank" | "_self"; isEdit: boolean }>({
    open: false,
    url: "",
    target: "_blank",
    isEdit: false,
  });

  /** Find an <a> ancestor of the current selection, if any */
  const findLinkInSelection = (): HTMLAnchorElement | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
    while (node) {
      if (node instanceof HTMLAnchorElement) return node;
      node = node.parentNode;
    }
    return null;
  };

  const openLinkDialog = () => {
    saveSelection();
    const existing = findLinkInSelection();
    setLinkDialog({
      open: true,
      url: existing?.getAttribute("href") || "",
      target: (existing?.getAttribute("target") as "_blank" | "_self") || "_blank",
      isEdit: !!existing,
    });
  };

  /** Normalize a user-entered URL/email/phone into a proper href */
  const normalizeHref = (raw: string): string => {
    const v = raw.trim();
    if (!v) return "";
    if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(v)) return v;
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(v)) return `mailto:${v}`;
    if (/^\+?[\d\s().-]{6,}$/.test(v)) return `tel:${v.replace(/\s/g, "")}`;
    return `https://${v}`;
  };

  const applyLink = () => {
    restoreSelection();
    const href = normalizeHref(linkDialog.url);
    if (!href) {
      setLinkDialog((p) => ({ ...p, open: false }));
      return;
    }
    // Replace existing link if present
    const existing = findLinkInSelection();
    if (existing) {
      existing.setAttribute("href", href);
      if (linkDialog.target === "_blank") {
        existing.setAttribute("target", "_blank");
        existing.setAttribute("rel", "noopener noreferrer");
      } else {
        existing.removeAttribute("target");
        existing.removeAttribute("rel");
      }
    } else {
      exec("createLink", href);
      // Find the link we just created and apply target
      const created = findLinkInSelection();
      if (created) {
        if (linkDialog.target === "_blank") {
          created.setAttribute("target", "_blank");
          created.setAttribute("rel", "noopener noreferrer");
        }
      }
    }
    // Trigger an input event so EditableText sees the change on blur
    const host = (window.getSelection()?.getRangeAt(0).commonAncestorContainer as Node | null);
    let p: Node | null = host;
    while (p) {
      if (p instanceof HTMLElement && p.dataset.richEdit === "true") {
        p.dispatchEvent(new Event("input", { bubbles: true }));
        break;
      }
      p = p.parentNode;
    }
    setLinkDialog((p) => ({ ...p, open: false }));
  };

  const removeLink = () => {
    restoreSelection();
    exec("unlink");
    setLinkDialog((p) => ({ ...p, open: false }));
  };

  const applyColor = (cmd: "foreColor" | "hiliteColor", value: string) => {
    restoreSelection();
    if (cmd === "foreColor" && value === "inherit") {
      exec("foreColor", "currentColor");
      return;
    }
    if (cmd === "hiliteColor" && value === "transparent") {
      exec("hiliteColor", "transparent");
      return;
    }
    exec(cmd, value);
  };

  const ColorSwatch = ({
    color,
    name,
    onPick,
  }: {
    color: string;
    name: string;
    onPick: () => void;
  }) => (
    <button
      type="button"
      onMouseDown={stop}
      onClick={onPick}
      title={name}
      className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform relative overflow-hidden"
      style={{ background: color === "inherit" ? undefined : color }}
    >
      {(color === "inherit" || color === "transparent") && (
        <Ban size={14} className="absolute inset-0 m-auto text-muted-foreground" />
      )}
    </button>
  );

  const Btn = forwardRef<HTMLButtonElement, {
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    isActive?: boolean;
  }>(({ onClick, children, title, isActive }, ref) => (
    <button
      ref={ref}
      type="button"
      onMouseDown={stop}
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-muted transition-colors ${
        isActive ? "bg-accent/15 text-accent" : "text-foreground"
      }`}
    >
      {children}
    </button>
  ));
  Btn.displayName = "FormatToolbarButton";

  return (
    <>
      {pos && (
        <div
          ref={toolbarRef}
          style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
          className="fixed z-[110] bg-card/95 backdrop-blur border border-border shadow-xl rounded-lg px-1 py-1 flex items-center gap-0.5 max-w-[95vw] flex-wrap"
          onMouseDown={stop}
        >
          <Btn onClick={() => exec("bold")} title="Bold (Ctrl+B)" isActive={active.bold}>
            <Bold size={14} />
          </Btn>
          <Btn onClick={() => exec("italic")} title="Italic (Ctrl+I)" isActive={active.italic}>
            <Italic size={14} />
          </Btn>
          <Btn onClick={() => exec("underline")} title="Underline (Ctrl+U)" isActive={active.underline}>
            <Underline size={14} />
          </Btn>

          <div className="w-px h-5 bg-border mx-0.5" />

          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => { stop(e); saveSelection(); }}
              onClick={() => setOpenPopover((p) => (p === "block" ? null : "block"))}
              title="Paragraph and headings"
              className="px-1.5 py-1.5 rounded hover:bg-muted transition-colors text-foreground flex items-center gap-1 text-[11px] font-semibold"
            >
              <Heading2 size={14} />
              <ChevronDown size={11} />
            </button>
            {openPopover === "block" && (
              <div className="absolute top-full left-0 mt-1 p-1 bg-card border border-border rounded-lg shadow-xl z-10 min-w-[140px]">
                {BLOCK_OPTIONS.map((option) => {
                  const Icon = typeof option.icon === "string" ? null : option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onMouseDown={stop}
                      onClick={() => {
                        restoreSelection();
                        exec("formatBlock", `<${option.value}>`);
                        setOpenPopover(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-muted rounded text-foreground flex items-center gap-2"
                    >
                      {Icon ? <Icon size={14} /> : <span className="text-[10px] font-semibold">P</span>}
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-border mx-0.5" />

          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => { stop(e); saveSelection(); }}
              onClick={() => setOpenPopover((p) => (p === "font" ? null : "font"))}
              title="Font family"
              className="px-1.5 py-1.5 rounded hover:bg-muted transition-colors text-foreground flex items-center gap-1 text-[11px] font-semibold"
            >
              <Type size={14} />
              <ChevronDown size={11} />
            </button>
            {openPopover === "font" && (
              <div className="absolute top-full left-0 mt-1 p-1 bg-card border border-border rounded-lg shadow-xl z-10 min-w-[168px]">
                {FONT_FAMILIES.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onMouseDown={stop}
                    onClick={() => {
                      restoreSelection();
                      applyFontFamily(font.value);
                      setOpenPopover(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-muted rounded text-foreground"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font size */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => { stop(e); saveSelection(); }}
              onClick={() => setOpenPopover((p) => (p === "size" ? null : "size"))}
              title="Font size"
              className="px-1.5 py-1.5 rounded hover:bg-muted transition-colors text-foreground flex items-center gap-0.5 text-[11px] font-semibold"
            >
              <span>Aa</span>
              <ChevronDown size={11} />
            </button>
            {openPopover === "size" && (
              <div className="absolute top-full left-0 mt-1 p-1 bg-card border border-border rounded-lg shadow-xl z-10 min-w-[120px]">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onMouseDown={stop}
                    onClick={() => {
                      restoreSelection();
                      applyFontSize(s.value);
                      setOpenPopover(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-muted rounded text-foreground flex items-center justify-between"
                    style={{ fontSize: s.value }}
                  >
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text color */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => { stop(e); saveSelection(); }}
              onClick={() => setOpenPopover((p) => (p === "color" ? null : "color"))}
              title="Text color"
              className="p-1.5 rounded hover:bg-muted transition-colors text-foreground flex items-center gap-0.5"
            >
              <div className="relative">
                <Type size={14} />
                <div className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-sm bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
              </div>
            </button>
            {openPopover === "color" && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 p-2 bg-card border border-border rounded-lg shadow-xl grid grid-cols-5 gap-1.5 w-48 z-10">
                {TEXT_COLORS.map((c) => (
                  <ColorSwatch
                    key={c.value}
                    color={c.value}
                    name={c.name}
                    onPick={() => {
                      applyColor("foreColor", c.value);
                      setOpenPopover(null);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => { stop(e); saveSelection(); }}
              onClick={() => setOpenPopover((p) => (p === "highlight" ? null : "highlight"))}
              title="Highlight color"
              className="p-1.5 rounded hover:bg-muted transition-colors text-foreground"
            >
              <Highlighter size={14} />
            </button>
            {openPopover === "highlight" && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 p-2 bg-card border border-border rounded-lg shadow-xl grid grid-cols-5 gap-1.5 w-48 z-10">
                {HIGHLIGHT_COLORS.map((c) => (
                  <ColorSwatch
                    key={c.value}
                    color={c.value}
                    name={c.name}
                    onPick={() => {
                      applyColor("hiliteColor", c.value);
                      setOpenPopover(null);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-border mx-0.5" />

          <Btn onClick={() => exec("insertUnorderedList")} title="Bulleted list">
            <List size={14} />
          </Btn>
          <Btn onClick={() => exec("insertOrderedList")} title="Numbered list">
            <ListOrdered size={14} />
          </Btn>

          <div className="w-px h-5 bg-border mx-0.5" />

          <Btn onClick={() => exec("justifyLeft")} title="Align left">
            <AlignLeft size={14} />
          </Btn>
          <Btn onClick={() => exec("justifyCenter")} title="Align center">
            <AlignCenter size={14} />
          </Btn>
          <Btn onClick={() => exec("justifyRight")} title="Align right">
            <AlignRight size={14} />
          </Btn>

          <div className="w-px h-5 bg-border mx-0.5" />

          <Btn onClick={openLinkDialog} title="Add or edit link">
            <Link2 size={14} />
          </Btn>
          <Btn onClick={() => exec("removeFormat")} title="Clear formatting">
            <RemoveFormatting size={14} />
          </Btn>
        </div>
      )}

      {/* Link editor dialog */}
      <Dialog
        open={linkDialog.open}
        onOpenChange={(o) => setLinkDialog((p) => ({ ...p, open: o }))}
      >
        <DialogContent className="sm:max-w-md" onMouseDown={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 size={16} /> {linkDialog.isEdit ? "Edit link" : "Add link"}
            </DialogTitle>
            <DialogDescription>
              Paste a website URL, email address, or phone number. We'll format it automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="link-url" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Destination
              </Label>
              <Input
                id="link-url"
                placeholder="example.com  ·  hello@you.com  ·  +971…"
                value={linkDialog.url}
                onChange={(e) => setLinkDialog((p) => ({ ...p, url: e.target.value }))}
                autoFocus
              />
              <div className="flex gap-3 text-[11px] text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1"><ExternalLink size={11} /> Website</span>
                <span className="flex items-center gap-1"><Mail size={11} /> Email</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Open in
              </Label>
              <RadioGroup
                value={linkDialog.target}
                onValueChange={(v) => setLinkDialog((p) => ({ ...p, target: v as "_blank" | "_self" }))}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="_blank" id="t-blank" />
                  <span className="text-sm">New tab</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="_self" id="t-self" />
                  <span className="text-sm">Same tab</span>
                </label>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            {linkDialog.isEdit && (
              <Button variant="ghost" onClick={removeLink} className="text-destructive hover:text-destructive">
                Remove link
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="ghost" onClick={() => setLinkDialog((p) => ({ ...p, open: false }))}>
              Cancel
            </Button>
            <Button onClick={applyLink} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {linkDialog.isEdit ? "Update link" : "Add link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormatToolbar;
