import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * SERP score snapshots — one row per save per page+lang. Lets editors see
 * how their changes improved length / keyword coverage / duplicate risk
 * over time. Backed by the seo_score_snapshots table with editor RLS.
 */

export type ScoreSnapshot = {
  id: string;
  page_key: string;
  page_label: string;
  lang: "en" | "ar";
  score: number;
  title_length_score: number;
  desc_length_score: number;
  keyword_coverage_score: number;
  duplicate_risk_score: number;
  meta_title_length: number;
  meta_description_length: number;
  keyword_count: number;
  actor_id: string | null;
  actor_email: string | null;
  created_at: string;
};

export type CreateSnapshotInput = {
  page_key: string;
  page_label: string;
  lang: "en" | "ar";
  score: number;
  title_length_score: number;
  desc_length_score: number;
  keyword_coverage_score: number;
  duplicate_risk_score: number;
  meta_title_length: number;
  meta_description_length: number;
  keyword_count: number;
};

export const useScoreSnapshots = (pageKey: string, lang: "en" | "ar") => {
  return useQuery({
    queryKey: ["seo-score-snapshots", pageKey, lang],
    queryFn: async (): Promise<ScoreSnapshot[]> => {
      const { data, error } = await supabase
        .from("seo_score_snapshots")
        .select("*")
        .eq("page_key", pageKey)
        .eq("lang", lang)
        .order("created_at", { ascending: true })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as ScoreSnapshot[];
    },
    enabled: !!pageKey,
    staleTime: 30_000,
  });
};

export const useCreateScoreSnapshot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSnapshotInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("seo_score_snapshots").insert({
        ...input,
        actor_id: user?.id ?? null,
        actor_email: user?.email ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["seo-score-snapshots", vars.page_key, vars.lang] });
    },
  });
};
