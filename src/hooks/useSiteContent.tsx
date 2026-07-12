import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

export type SiteContentItem = {
  id: string;
  page: string;
  section: string;
  content_key: string;
  value: string;
  value_ar: string | null;
  content_type: string;
  sort_order: number;
};

export const useSiteContent = (page?: string, section?: string) => {
  const { lang } = useLanguage();

  const query = useQuery({
    queryKey: ["site-content", page, section],
    queryFn: async () => {
      let q = supabase.from("site_content").select("*").order("sort_order");
      if (page) q = q.eq("page", page);
      if (section) q = q.eq("section", section);
      const { data, error } = await q;
      if (error) throw error;
      return data as SiteContentItem[];
    },
  });

  const getContent = (key: string, fallback = ""): string => {
    const item = query.data?.find((c) => c.content_key === key);
    if (!item) return fallback;
    if (lang === "ar" && item.value_ar) return item.value_ar;
    return item.value || fallback;
  };

  const getImage = (key: string, fallback = ""): string => {
    const item = query.data?.find((c) => c.content_key === key && c.content_type === "image_url");
    return item?.value || fallback;
  };

  return { ...query, getContent, getImage, items: query.data ?? [] };
};

export const useAllSiteContent = () => {
  return useQuery({
    queryKey: ["site-content-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("page")
        .order("section")
        .order("sort_order");
      if (error) throw error;
      return data as SiteContentItem[];
    },
  });
};

export const useSaveContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Partial<SiteContentItem> & { page: string; section: string; content_key: string; value: string }) => {
      if (item.id) {
        const { error } = await supabase.from("site_content").update({
          value: item.value,
          value_ar: item.value_ar ?? null,
          content_type: item.content_type ?? "text",
          sort_order: item.sort_order ?? 0,
        }).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("site_content").insert({
          page: item.page,
          section: item.section,
          content_key: item.content_key,
          value: item.value,
          value_ar: item.value_ar ?? null,
          content_type: item.content_type ?? "text",
          sort_order: item.sort_order ?? 0,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      queryClient.invalidateQueries({ queryKey: ["site-content-all"] });
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      queryClient.invalidateQueries({ queryKey: ["site-content-all"] });
    },
  });
};

export const useUploadCmsImage = () => {
  return useMutation({
    mutationFn: async ({ file, path }: { file: File; path: string }) => {
      const { error } = await supabase.storage
        .from("cms-images")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("cms-images").getPublicUrl(path);
      return data.publicUrl;
    },
  });
};
