import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PricingHighlight {
  id: string;
  plan_key: string;
  most_popular: boolean;
  badge_label: string | null;
  badge_label_ar: string | null;
  cta_label_override: string | null;
  cta_label_override_ar: string | null;
  cta_link_override: string | null;
}

export const usePricingHighlights = () =>
  useQuery({
    queryKey: ["pricing_highlights"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing_highlights").select("*");
      if (error) throw error;
      return data as PricingHighlight[];
    },
    staleTime: 60_000,
  });

/** Map keyed by plan_key for easy lookup */
export const usePricingHighlightMap = () => {
  const q = usePricingHighlights();
  const map: Record<string, PricingHighlight> = {};
  (q.data ?? []).forEach((h) => {
    map[h.plan_key] = h;
  });
  return { ...q, map };
};

export type PricingHighlightInput = Omit<PricingHighlight, "id"> & { id?: string };

export const useSavePricingHighlight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PricingHighlightInput) => {
      const payload = {
        plan_key: input.plan_key,
        most_popular: input.most_popular,
        badge_label: input.badge_label || null,
        badge_label_ar: input.badge_label_ar || null,
        cta_label_override: input.cta_label_override || null,
        cta_label_override_ar: input.cta_label_override_ar || null,
        cta_link_override: input.cta_link_override || null,
      };
      // Upsert by plan_key
      const { error } = await supabase
        .from("pricing_highlights")
        .upsert(payload, { onConflict: "plan_key" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pricing_highlights"] }),
  });
};

export const useDeletePricingHighlight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pricing_highlights").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pricing_highlights"] }),
  });
};
