import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Generic sort_order persistence hook.
 *
 * Works for any table that has an integer `sort_order` column and an `id`
 * primary key — currently: features, testimonials, client_logos,
 * personas, pricing_highlights, blog_posts, etc.
 *
 * Pass an array of `{ id, sort_order }` and the hook updates each row,
 * then invalidates the matching React-Query keys so any list re-fetches.
 *
 * NOTE: Supabase has no native bulk-update by id, so we issue one update per
 * row in parallel. For typical card lists (<50 items) this is fine.
 */
type ReorderableTable =
  | "features"
  | "testimonials"
  | "client_logos"
  | "personas"
  | "pricing_highlights"
  | "blog_posts"
  | "nav_items";

interface UseReorderOptions {
  table: ReorderableTable;
  /** React-Query keys to invalidate after reorder. Defaults to [[table]]. */
  invalidateKeys?: unknown[][];
}

export const useReorder = ({ table, invalidateKeys }: UseReorderOptions) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Array<{ id: string; sort_order: number }>) => {
      // Run updates in parallel — small N, RLS-checked per row.
      // Cast required because the table name is dynamic across the union type.
      const client = supabase as unknown as {
        from: (t: string) => {
          update: (v: { sort_order: number }) => {
            eq: (col: string, val: string) => Promise<{ error: unknown }>;
          };
        };
      };
      const results = await Promise.all(
        updates.map(({ id, sort_order }) =>
          client.from(table).update({ sort_order }).eq("id", id),
        ),
      );
      const firstError = results.find((r) => r.error)?.error;
      if (firstError) throw firstError;
    },
    onSuccess: () => {
      const keys = invalidateKeys ?? [[table]];
      keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
    },
  });
};

/**
 * Helper: given an array of items in the new desired order, produce the
 * `{ id, sort_order }` payload — using stable, non-conflicting integer steps.
 */
export const buildSortPayload = <T extends { id: string }>(
  ordered: T[],
  step = 10,
): Array<{ id: string; sort_order: number }> =>
  ordered.map((item, idx) => ({ id: item.id, sort_order: (idx + 1) * step }));
