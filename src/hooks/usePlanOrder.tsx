import { useMemo } from "react";
import { useSiteContent, useSaveContent } from "./useSiteContent";

/**
 * Persistent plan-card ordering for the Pricing page.
 *
 * Each pricing group (individual / business) stores its own array of plan
 * identifiers as JSON in site_content under page=`pricing`, section=`order`,
 * content_key=`plan_order_<group>`, content_type=`plan_order`.
 *
 * Identifiers are the human plan name (matches what we already use as React
 * key for the existing cards), so the same hook works for plans that don't
 * have a `planKey`.
 *
 * Returns:
 *   - `sort(plans)` — orders the given array by saved order (stable for new plans)
 *   - `save(orderedNames)` — persists the new array
 */
export const usePlanOrder = (group: "individual" | "business") => {
  const contentKey = `plan_order_${group}`;
  const { items } = useSiteContent("pricing", "order");
  const save = useSaveContent();

  const row = useMemo(
    () => items.find((i) => i.content_key === contentKey && i.content_type === "plan_order"),
    [items, contentKey],
  );

  const order = useMemo<string[]>(() => {
    if (!row?.value) return [];
    try {
      const parsed = JSON.parse(row.value);
      return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
    } catch {
      return [];
    }
  }, [row?.value]);

  const sort = <T extends { name: string }>(plans: T[]): T[] => {
    if (order.length === 0) return plans;
    const rank = new Map(order.map((n, i) => [n, i]));
    return [...plans].sort((a, b) => {
      const ra = rank.has(a.name) ? (rank.get(a.name) as number) : Number.POSITIVE_INFINITY;
      const rb = rank.has(b.name) ? (rank.get(b.name) as number) : Number.POSITIVE_INFINITY;
      return ra - rb;
    });
  };

  const persist = async (orderedNames: string[]) => {
    await save.mutateAsync({
      id: row?.id,
      page: "pricing",
      section: "order",
      content_key: contentKey,
      content_type: "plan_order",
      value: JSON.stringify(orderedNames),
      value_ar: row?.value_ar ?? null,
      sort_order: 0,
    });
  };

  return { order, sort, persist, isSaving: save.isPending };
};
