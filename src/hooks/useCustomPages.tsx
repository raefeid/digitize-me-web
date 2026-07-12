import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** A single block in the page builder. */
export type PageBlock =
  | {
      id: string;
      type: "hero";
      eyebrow?: string;
      title?: string;
      desc?: string;
      cta_label?: string;
      cta_link?: string;
      image?: string;
    }
  | {
      id: string;
      type: "rich_text";
      html?: string;
    }
  | {
      id: string;
      type: "cards";
      title?: string;
      cards?: { icon?: string; title?: string; desc?: string }[];
    }
  | {
      id: string;
      type: "image";
      url?: string;
      alt?: string;
      caption?: string;
    }
  | {
      id: string;
      type: "cta";
      title?: string;
      desc?: string;
      cta_label?: string;
      cta_link?: string;
    }
  | {
      id: string;
      type: "faq";
      title?: string;
      items?: { q?: string; a?: string }[];
    }
  | {
      id: string;
      type: "testimonial";
      quote?: string;
      author?: string;
      role?: string;
      company?: string;
      avatar?: string;
    }
  | {
      id: string;
      type: "stats";
      title?: string;
      stats?: { value?: string; label?: string }[];
    }
  | {
      id: string;
      type: "logo_strip";
      title?: string;
      logos?: { url?: string; alt?: string; href?: string }[];
    }
  | {
      id: string;
      type: "two_column";
      title?: string;
      desc?: string;
      image?: string;
      image_alt?: string;
      image_side?: "left" | "right";
      cta_label?: string;
      cta_link?: string;
    }
  | {
      id: string;
      type: "video";
      url?: string;
      title?: string;
      caption?: string;
    }
  | {
      id: string;
      type: "pricing_teaser";
      title?: string;
      desc?: string;
      tiers?: { name?: string; price?: string; features?: string }[];
      cta_label?: string;
      cta_link?: string;
    }
  | {
      id: string;
      type: "divider";
      style?: "line" | "space";
      size?: "sm" | "md" | "lg";
    }
  | {
      id: string;
      type: "button";
      label?: string;
      link?: string;
      variant?: "default" | "outline" | "ghost";
      size?: "sm" | "default" | "lg";
      align?: "left" | "center" | "right";
    }
  | {
      id: string;
      type: "container";
      title?: string;
      desc?: string;
      image?: string;
      image_alt?: string;
      align?: "left" | "center" | "right";
      background?: "none" | "muted" | "accent";
    };

export type CustomPageStatus = "draft" | "published";

export type CustomPageRow = {
  id: string;
  slug: string;
  title: string;
  title_ar: string | null;
  blocks: PageBlock[];
  blocks_ar: PageBlock[];
  status: CustomPageStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_title_ar: string | null;
  seo_description: string | null;
  seo_description_ar: string | null;
  seo_og_image: string | null;
  created_at: string;
  updated_at: string;
};

const normalize = (r: any): CustomPageRow => ({
  ...r,
  blocks: Array.isArray(r.blocks) ? r.blocks : [],
  blocks_ar: Array.isArray(r.blocks_ar) ? r.blocks_ar : [],
});

export const useCustomPages = (opts?: { includeDrafts?: boolean }) =>
  useQuery({
    queryKey: ["custom_pages", opts?.includeDrafts ? "all" : "published"],
    queryFn: async () => {
      let q = supabase.from("custom_pages").select("*").order("updated_at", { ascending: false });
      if (!opts?.includeDrafts) q = q.eq("status", "published");
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(normalize);
    },
  });

export const useCustomPageBySlug = (slug?: string) =>
  useQuery({
    queryKey: ["custom_pages", "slug", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_pages")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data ? normalize(data) : null;
    },
  });

export const useSaveCustomPage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Partial<CustomPageRow> & { slug: string; title: string }) => {
      const payload: any = {
        slug: p.slug,
        title: p.title,
        title_ar: p.title_ar ?? null,
        blocks: p.blocks ?? [],
        blocks_ar: p.blocks_ar ?? [],
        status: p.status ?? "draft",
        published_at:
          p.status === "published" ? p.published_at ?? new Date().toISOString() : p.published_at ?? null,
        seo_title: p.seo_title ?? null,
        seo_title_ar: p.seo_title_ar ?? null,
        seo_description: p.seo_description ?? null,
        seo_description_ar: p.seo_description_ar ?? null,
        seo_og_image: p.seo_og_image ?? null,
      };
      if (p.id) {
        const { error } = await supabase.from("custom_pages").update(payload).eq("id", p.id);
        if (error) throw error;
        return p.id;
      } else {
        const { data, error } = await supabase
          .from("custom_pages")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        return data.id as string;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["custom_pages"] });
    },
  });
};

export const useDeleteCustomPage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["custom_pages"] }),
  });
};
