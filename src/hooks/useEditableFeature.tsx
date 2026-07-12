import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFeatureBySlug, type FeatureRow, type FeatureSection, type FeatureSectionItem } from "./useFeatures";
import { useToast } from "./use-toast";

/**
 * Editable wrapper around a single feature row. Writes go directly to the
 * `features` table (not site_content) — keeping the source of truth single.
 *
 * - Optimistic local patch so the UI updates instantly
 * - Debounced background save (~600ms) so typing doesn't hammer the DB
 * - Coalesces multiple field updates into one PATCH per save window
 */
export const useEditableFeature = (slug?: string) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: serverFeature, isLoading } = useFeatureBySlug(slug);
  const [localFeature, setLocalFeature] = useState<FeatureRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Pending field patch + timer
  const pendingRef = useRef<Partial<FeatureRow>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local with server when it loads / changes
  useEffect(() => {
    if (!serverFeature) return;
    if (saving || dirty || Object.keys(pendingRef.current).length > 0) return;
    setLocalFeature(serverFeature);
  }, [serverFeature, saving, dirty]);

  const flush = useCallback(async () => {
    const id = localFeature?.id ?? serverFeature?.id;
    if (!id) return;
    const patch = pendingRef.current;
    if (Object.keys(patch).length === 0) return;
    pendingRef.current = {};
    setSaving(true);
    try {
      const { error } = await supabase.from("features").update(patch as any).eq("id", id);
      if (error) throw error;
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["features"] });
    } catch (e: any) {
      pendingRef.current = { ...patch, ...pendingRef.current };
      setDirty(true);
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [localFeature?.id, serverFeature?.id, qc, toast]);

  const scheduleFlush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      flush();
    }, 600);
  }, [flush]);

  const updateField = useCallback(
    <K extends keyof FeatureRow>(key: K, value: FeatureRow[K]) => {
      setLocalFeature((prev) => (prev ? { ...prev, [key]: value } : prev));
      pendingRef.current = { ...pendingRef.current, [key]: value };
      setDirty(true);
      scheduleFlush();
    },
    [scheduleFlush]
  );

  /** Replace one section (by index) in either `sections` or `sections_ar`. */
  const updateSection = useCallback(
    (
      arrField: "sections" | "sections_ar",
      idx: number,
      next: FeatureSection
    ) => {
      setLocalFeature((prev) => {
        if (!prev) return prev;
        const arr = [...(prev[arrField] ?? [])];
        arr[idx] = next;
        const updated = { ...prev, [arrField]: arr };
        pendingRef.current = { ...pendingRef.current, [arrField]: arr };
        scheduleFlush();
        return updated;
      });
    },
    [scheduleFlush]
  );

  /** Update a single field on a section item (e.g. items[j].title). */
  const updateSectionItem = useCallback(
    (
      arrField: "sections" | "sections_ar",
      sectionIdx: number,
      itemIdx: number,
      key: string,
      value: string
    ) => {
      setLocalFeature((prev) => {
        if (!prev) return prev;
        const arr = [...(prev[arrField] ?? [])];
        const section = { ...arr[sectionIdx] };
        const items = [...(section.items ?? [])];
        items[itemIdx] = { ...items[itemIdx], [key]: value };
        section.items = items;
        arr[sectionIdx] = section;
        const updated = { ...prev, [arrField]: arr };
        pendingRef.current = { ...pendingRef.current, [arrField]: arr };
        scheduleFlush();
        return updated;
      });
    },
    [scheduleFlush]
  );

  /** Add an item (card) to a section. */
  const addSectionItem = useCallback(
    (
      arrField: "sections" | "sections_ar",
      sectionIdx: number,
      item: FeatureSectionItem = { title: "New card", desc: "Describe this card…" },
    ) => {
      setLocalFeature((prev) => {
        if (!prev) return prev;
        const arr = [...(prev[arrField] ?? [])];
        const section = { ...arr[sectionIdx] };
        section.items = [...(section.items ?? []), item];
        arr[sectionIdx] = section;
        const updated = { ...prev, [arrField]: arr };
        pendingRef.current = { ...pendingRef.current, [arrField]: arr };
        scheduleFlush();
        return updated;
      });
    },
    [scheduleFlush]
  );

  /** Remove an item (card) from a section. */
  const removeSectionItem = useCallback(
    (arrField: "sections" | "sections_ar", sectionIdx: number, itemIdx: number) => {
      setLocalFeature((prev) => {
        if (!prev) return prev;
        const arr = [...(prev[arrField] ?? [])];
        const section = { ...arr[sectionIdx] };
        const items = [...(section.items ?? [])];
        items.splice(itemIdx, 1);
        section.items = items;
        arr[sectionIdx] = section;
        const updated = { ...prev, [arrField]: arr };
        pendingRef.current = { ...pendingRef.current, [arrField]: arr };
        scheduleFlush();
        return updated;
      });
    },
    [scheduleFlush]
  );

  /** Add a brand-new section block. */
  const addSection = useCallback(
    (arrField: "sections" | "sections_ar", section: FeatureSection) => {
      setLocalFeature((prev) => {
        if (!prev) return prev;
        const arr = [...(prev[arrField] ?? []), section];
        const updated = { ...prev, [arrField]: arr };
        pendingRef.current = { ...pendingRef.current, [arrField]: arr };
        scheduleFlush();
        return updated;
      });
    },
    [scheduleFlush]
  );

  /** Insert a section block at a specific position. */
  const insertSection = useCallback(
    (arrField: "sections" | "sections_ar", index: number, section: FeatureSection) => {
      setLocalFeature((prev) => {
        if (!prev) return prev;
        const arr = [...(prev[arrField] ?? [])];
        arr.splice(index, 0, section);
        const updated = { ...prev, [arrField]: arr };
        pendingRef.current = { ...pendingRef.current, [arrField]: arr };
        scheduleFlush();
        return updated;
      });
    },
    [scheduleFlush]
  );

  /** Remove an entire section. */
  const removeSection = useCallback(
    (arrField: "sections" | "sections_ar", sectionIdx: number) => {
      setLocalFeature((prev) => {
        if (!prev) return prev;
        const arr = [...(prev[arrField] ?? [])];
        arr.splice(sectionIdx, 1);
        const updated = { ...prev, [arrField]: arr };
        pendingRef.current = { ...pendingRef.current, [arrField]: arr };
        scheduleFlush();
        return updated;
      });
    },
    [scheduleFlush]
  );

  /** Move a section up/down. */
  const moveSection = useCallback(
    (arrField: "sections" | "sections_ar", sectionIdx: number, dir: -1 | 1) => {
      setLocalFeature((prev) => {
        if (!prev) return prev;
        const arr = [...(prev[arrField] ?? [])];
        const target = sectionIdx + dir;
        if (target < 0 || target >= arr.length) return prev;
        const [moved] = arr.splice(sectionIdx, 1);
        arr.splice(target, 0, moved);
        const updated = { ...prev, [arrField]: arr };
        pendingRef.current = { ...pendingRef.current, [arrField]: arr };
        scheduleFlush();
        return updated;
      });
    },
    [scheduleFlush]
  );

  /** Update a top-level section field (title, desc, image). */
  const updateSectionField = useCallback(
    (
      arrField: "sections" | "sections_ar",
      sectionIdx: number,
      key: keyof FeatureSection,
      value: any
    ) => {
      setLocalFeature((prev) => {
        if (!prev) return prev;
        const arr = [...(prev[arrField] ?? [])];
        arr[sectionIdx] = { ...arr[sectionIdx], [key]: value };
        const updated = { ...prev, [arrField]: arr };
        pendingRef.current = { ...pendingRef.current, [arrField]: arr };
        scheduleFlush();
        return updated;
      });
    },
    [scheduleFlush]
  );

  // Flush on unmount so we never lose the last edit
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (Object.keys(pendingRef.current).length > 0) flush();
    };
  }, [flush]);

  return {
    feature: localFeature ?? serverFeature ?? null,
    isLoading,
    saving,
    dirty,
    saveNow: flush,
    updateField,
    updateSection,
    updateSectionItem,
    updateSectionField,
    addSectionItem,
    removeSectionItem,
    addSection,
    insertSection,
    removeSection,
    moveSection,
  };
};
