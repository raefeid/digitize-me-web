import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FeatureSectionItem = {
  icon?: string;
  title?: string;
  desc?: string;
  value?: string;
  label?: string;
};

export type FeatureSection = {
  type: "feature_list" | "stats" | "cta" | "image_text" | string;
  title?: string;
  desc?: string;
  image?: string;
  items?: FeatureSectionItem[];
};

export type FeatureRow = {
  id: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  published: boolean;
  hero_badge: string | null;
  hero_badge_ar: string | null;
  hero_title: string;
  hero_title_ar: string | null;
  hero_desc: string | null;
  hero_desc_ar: string | null;
  hero_image_url: string | null;
  cta_primary_label: string | null;
  cta_primary_label_ar: string | null;
  cta_primary_link: string | null;
  cta_secondary_label: string | null;
  cta_secondary_label_ar: string | null;
  cta_secondary_link: string | null;
  sections: FeatureSection[];
  sections_ar: FeatureSection[];
  seo_title: string | null;
  seo_title_ar: string | null;
  seo_description: string | null;
  seo_description_ar: string | null;
  seo_og_image: string | null;
  created_at: string;
  updated_at: string;
};

const normalize = (r: any): FeatureRow => ({
  ...r,
  sections: Array.isArray(r.sections) ? r.sections : [],
  sections_ar: Array.isArray(r.sections_ar) ? r.sections_ar : [],
});

export const useFeatures = () =>
  useQuery({
    queryKey: ["features"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(normalize);
    },
  });

export const useFeatureBySlug = (slug?: string) =>
  useQuery({
    queryKey: ["features", "slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data ? normalize(data) : null;
    },
  });

export const useSaveFeature = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (f: Partial<FeatureRow> & { slug: string; hero_title: string }) => {
      const payload: any = {
        slug: f.slug,
        icon: f.icon ?? null,
        sort_order: f.sort_order ?? 0,
        published: f.published ?? true,
        hero_badge: f.hero_badge ?? null,
        hero_badge_ar: f.hero_badge_ar ?? null,
        hero_title: f.hero_title,
        hero_title_ar: f.hero_title_ar ?? null,
        hero_desc: f.hero_desc ?? null,
        hero_desc_ar: f.hero_desc_ar ?? null,
        hero_image_url: f.hero_image_url ?? null,
        cta_primary_label: f.cta_primary_label ?? null,
        cta_primary_label_ar: f.cta_primary_label_ar ?? null,
        cta_primary_link: f.cta_primary_link ?? null,
        cta_secondary_label: f.cta_secondary_label ?? null,
        cta_secondary_label_ar: f.cta_secondary_label_ar ?? null,
        cta_secondary_link: f.cta_secondary_link ?? null,
        sections: f.sections ?? [],
        sections_ar: f.sections_ar ?? [],
        seo_title: f.seo_title ?? null,
        seo_title_ar: f.seo_title_ar ?? null,
        seo_description: f.seo_description ?? null,
        seo_description_ar: f.seo_description_ar ?? null,
        seo_og_image: f.seo_og_image ?? null,
      };
      if (f.id) {
        const { error } = await supabase.from("features").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("features").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["features"] }),
  });
};

export const useDeleteFeature = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("features").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["features"] }),
  });
};
