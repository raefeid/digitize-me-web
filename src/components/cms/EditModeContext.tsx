import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAllSiteContent, useSaveContent, SiteContentItem } from "@/hooks/useSiteContent";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

/**
 * Single pending change to a CMS field.
 * Each editable element targets a unique (page, section, content_key, content_type, lang) tuple.
 */
export interface PendingChange {
  page: string;
  section: string;
  content_key: string;
  content_type: "text" | "image_url";
  lang: "en" | "ar"; // which value column we're editing
  value: string;
  fallback?: string; // original default, used when nothing exists in CMS yet
}

interface EditModeContextType {
  /** Is the admin actively editing in-place? */
  enabled: boolean;
  /** Toggle edit mode on/off (admin only) */
  toggle: () => void;
  /** Is the current user an admin? Decides whether to show the floating bar */
  canEdit: boolean;
  /** Map of "page::section::key::lang" -> change */
  pending: Record<string, PendingChange>;
  /** Stage a change (does not save until "Save all") */
  stageChange: (c: PendingChange) => void;
  /** Look up an already staged value for an editable */
  getStaged: (page: string, section: string, key: string, lang: "en" | "ar") => string | undefined;
  /** Save all pending changes */
  saveAll: () => Promise<void>;
  /** Discard all pending changes */
  discardAll: () => void;
  saving: boolean;
  /** Existing items, used by editables to know if a row exists */
  items: SiteContentItem[] | undefined;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export const useEditMode = () => {
  const ctx = useContext(EditModeContext);
  if (!ctx) throw new Error("useEditMode must be used inside EditModeProvider");
  return ctx;
};

const keyOf = (page: string, section: string, key: string, lang: "en" | "ar") =>
  `${page}::${section}::${key}::${lang}`;

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useAuth();
  const { lang } = useLanguage();
  const { data: items } = useAllSiteContent();
  const saveContent = useSaveContent();
  const { toast } = useToast();

  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState<Record<string, PendingChange>>({});
  const [saving, setSaving] = useState(false);

  // If the user is no longer admin, force edit mode off and drop pending changes
  useEffect(() => {
    if (!isAdmin && enabled) {
      setEnabled(false);
      setPending({});
    }
  }, [isAdmin, enabled]);

  // Auto-enable edit mode when admin lands with ?edit=1
  useEffect(() => {
    if (!isAdmin) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") === "1") {
      setEnabled(true);
      params.delete("edit");
      const newSearch = params.toString();
      const url = window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
      window.history.replaceState({}, "", url);
    }
  }, [isAdmin]);

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    if (Object.keys(pending).length === 0) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [pending]);

  const toggle = useCallback(() => {
    if (!isAdmin) return;
    setEnabled((prev) => {
      // Leaving edit mode with unsaved changes? Ask first.
      if (prev && Object.keys(pending).length > 0) {
        const ok = window.confirm("You have unsaved changes. Leave edit mode and discard them?");
        if (!ok) return prev;
        setPending({});
      }
      return !prev;
    });
  }, [isAdmin, pending]);

  const stageChange = useCallback((c: PendingChange) => {
    setPending((prev) => {
      const k = keyOf(c.page, c.section, c.content_key, c.lang);
      // If the new value matches the original (fallback or persisted), drop it
      const existing = items?.find(
        (i) => i.page === c.page && i.section === c.section && i.content_key === c.content_key
      );
      const original = c.lang === "ar" ? existing?.value_ar ?? "" : existing?.value ?? c.fallback ?? "";
      if (c.value === original) {
        const { [k]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [k]: c };
    });
  }, [items]);

  const getStaged = useCallback((page: string, section: string, key: string, l: "en" | "ar") => {
    return pending[keyOf(page, section, key, l)]?.value;
  }, [pending]);

  const saveAll = useCallback(async () => {
    const changes = Object.values(pending);
    if (changes.length === 0) return;
    setSaving(true);
    try {
      // Group by content row so we send a single update per row even if both EN+AR were edited
      const grouped = new Map<string, { page: string; section: string; key: string; type: "text" | "image_url"; en?: string; ar?: string; existing?: SiteContentItem }>();
      for (const c of changes) {
        const k = `${c.page}::${c.section}::${c.content_key}`;
        const existing = items?.find(
          (i) => i.page === c.page && i.section === c.section && i.content_key === c.content_key
        );
        const row = grouped.get(k) ?? {
          page: c.page,
          section: c.section,
          key: c.content_key,
          type: c.content_type,
          en: existing?.value ?? "",
          ar: existing?.value_ar ?? "",
          existing,
        };
        if (c.lang === "ar") row.ar = c.value;
        else row.en = c.value;
        grouped.set(k, row);
      }

      for (const row of grouped.values()) {
        await saveContent.mutateAsync({
          id: row.existing?.id,
          page: row.page,
          section: row.section,
          content_key: row.key,
          value: row.en ?? "",
          value_ar: row.ar ?? "",
          content_type: row.type,
          sort_order: row.existing?.sort_order ?? 0,
        });
      }
      setPending({});
      toast({ title: "Changes saved", description: `${grouped.size} item${grouped.size === 1 ? "" : "s"} updated.` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [pending, items, saveContent, toast]);

  const discardAll = useCallback(() => {
    if (Object.keys(pending).length === 0) return;
    const ok = window.confirm("Discard all unsaved changes?");
    if (ok) setPending({});
  }, [pending]);

  const value = useMemo<EditModeContextType>(
    () => ({
      enabled,
      toggle,
      canEdit: isAdmin,
      pending,
      stageChange,
      getStaged,
      saveAll,
      discardAll,
      saving,
      items,
    }),
    [enabled, toggle, isAdmin, pending, stageChange, getStaged, saveAll, discardAll, saving, items]
  );

  return <EditModeContext.Provider value={value}><div className="contents">{children}</div></EditModeContext.Provider>;
};

/** Helper for components: returns the right lang code for the editor (we never edit French inline yet) */
export const useEditLang = (): "en" | "ar" => {
  const { lang } = useLanguage();
  return lang === "ar" ? "ar" : "en";
};
