import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useSiteContent, useSaveContent } from "./useSiteContent";

/**
 * Section reveal animation system.
 *
 * Each page can have N top-level sections. We auto-detect them at runtime
 * (see RevealAutoScanner) and assign stable, position-based keys
 * ("section_1", "section_2"...). Admins choose an animation, duration, and
 * stagger from a popover; settings persist to site_content.
 *
 * Storage convention:
 *   page=<page>, section="reveals"
 *   content_key=`${sectionKey}__anim`     value: REVEAL_TYPE
 *   content_key=`${sectionKey}__duration` value: number ms (200-1500)
 *   content_key=`${sectionKey}__stagger`  value: number ms (0-300) — applied
 *                                          to direct children when > 0.
 */

export type RevealType =
  | "none"
  | "fade-up"
  | "fade-down"
  | "slide-in-left"
  | "slide-in-right"
  | "zoom-in"
  | "blur-in";

export const REVEAL_OPTIONS: { value: RevealType; label: string; hint: string }[] = [
  { value: "none", label: "None", hint: "No entrance animation" },
  { value: "fade-up", label: "Fade up", hint: "Slides up + fades in" },
  { value: "fade-down", label: "Fade down", hint: "Slides down + fades in" },
  { value: "slide-in-left", label: "Slide left", hint: "Enters from the left" },
  { value: "slide-in-right", label: "Slide right", hint: "Enters from the right" },
  { value: "zoom-in", label: "Zoom in", hint: "Scales up gently" },
  { value: "blur-in", label: "Blur in", hint: "Defocuses into view" },
];

export const DEFAULT_REVEAL: RevealType = "fade-up";
export const DEFAULT_DURATION = 600;
export const DEFAULT_STAGGER = 0;

export interface RevealConfig {
  anim: RevealType;
  duration: number;
  stagger: number;
  /** When true, the section is hidden on the public site. */
  hidden: boolean;
}

/** Map a reveal type to the Tailwind-defined keyframes name. */
export const animationName = (type: RevealType): string | null => {
  switch (type) {
    case "fade-up":
      return "reveal-fade-up";
    case "fade-down":
      return "reveal-fade-down";
    case "slide-in-left":
      return "reveal-slide-left";
    case "slide-in-right":
      return "reveal-slide-right";
    case "zoom-in":
      return "reveal-zoom-in";
    case "blur-in":
      return "reveal-blur-in";
    case "none":
    default:
      return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Per-page reveal context: lets the auto-scanner publish the list of detected
// sections so the centralized admin panel and floating chips know what exists.
// ─────────────────────────────────────────────────────────────────────────────

interface DetectedSection {
  key: string;        // e.g. "section_1"
  label: string;      // e.g. "Section 1"
  element: HTMLElement;
}

interface RevealRegistryContextType {
  page: string | null;
  sections: DetectedSection[];
  register: (page: string, sections: DetectedSection[]) => void;
}

const RevealRegistryContext = createContext<RevealRegistryContextType>({
  page: null,
  sections: [],
  register: () => {},
});

export const RevealRegistryProvider = forwardRef<HTMLDivElement, { children: ReactNode }>(({ children }, ref) => {
  const [page, setPage] = useState<string | null>(null);
  const [sections, setSections] = useState<DetectedSection[]>([]);

  const register = useCallback((p: string, s: DetectedSection[]) => {
    setPage(p);
    setSections(s);
  }, []);

  const value = useMemo(() => ({ page, sections, register }), [page, sections, register]);
  return (
    <RevealRegistryContext.Provider value={value}>
      <div ref={ref} className="contents">{children}</div>
    </RevealRegistryContext.Provider>
  );
});

RevealRegistryProvider.displayName = "RevealRegistryProvider";

export const useRevealRegistry = () => useContext(RevealRegistryContext);

// ─────────────────────────────────────────────────────────────────────────────
// Hook: read & save reveal config for a single (page, sectionKey) pair.
// ─────────────────────────────────────────────────────────────────────────────

export const useSectionReveals = (page: string) => {
  const { items } = useSiteContent(page, "reveals");
  const saveContent = useSaveContent();

  const getConfig = useCallback(
    (sectionKey: string): RevealConfig => {
      const animRow = items.find((i) => i.content_key === `${sectionKey}__anim`);
      const durRow = items.find((i) => i.content_key === `${sectionKey}__duration`);
      const stagRow = items.find((i) => i.content_key === `${sectionKey}__stagger`);
      const hideRow = items.find((i) => i.content_key === `${sectionKey}__hidden`);
      return {
        anim: ((animRow?.value as RevealType) || DEFAULT_REVEAL) as RevealType,
        duration: Number(durRow?.value) || DEFAULT_DURATION,
        stagger: Number(stagRow?.value) || DEFAULT_STAGGER,
        hidden: hideRow?.value === "1",
      };
    },
    [items]
  );

  const setConfig = useCallback(
    async (sectionKey: string, partial: Partial<RevealConfig>) => {
      const current = getConfig(sectionKey);
      const next = { ...current, ...partial };

      const animRow = items.find((i) => i.content_key === `${sectionKey}__anim`);
      const durRow = items.find((i) => i.content_key === `${sectionKey}__duration`);
      const stagRow = items.find((i) => i.content_key === `${sectionKey}__stagger`);
      const hideRow = items.find((i) => i.content_key === `${sectionKey}__hidden`);

      await Promise.all([
        saveContent.mutateAsync({
          id: animRow?.id,
          page,
          section: "reveals",
          content_key: `${sectionKey}__anim`,
          value: next.anim,
          content_type: "text",
          sort_order: 0,
        }),
        saveContent.mutateAsync({
          id: durRow?.id,
          page,
          section: "reveals",
          content_key: `${sectionKey}__duration`,
          value: String(next.duration),
          content_type: "text",
          sort_order: 0,
        }),
        saveContent.mutateAsync({
          id: stagRow?.id,
          page,
          section: "reveals",
          content_key: `${sectionKey}__stagger`,
          value: String(next.stagger),
          content_type: "text",
          sort_order: 0,
        }),
        saveContent.mutateAsync({
          id: hideRow?.id,
          page,
          section: "reveals",
          content_key: `${sectionKey}__hidden`,
          value: next.hidden ? "1" : "0",
          content_type: "text",
          sort_order: 0,
        }),
      ]);
    },
    [items, getConfig, saveContent, page]
  );

  return { getConfig, setConfig, items };
};
