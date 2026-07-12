import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type IntegrationCategory = "erp" | "crm" | "cloud_storage" | "productivity" | "custom_api";
export type IntegrationStatus = "available" | "coming_soon" | "custom";

export interface Integration {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  category: IntegrationCategory;
  description: string | null;
  description_ar: string | null;
  logo_url: string | null;
  status: IntegrationStatus;
  cta_label: string | null;
  cta_label_ar: string | null;
  cta_link: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  "erp",
  "crm",
  "cloud_storage",
  "productivity",
  "custom_api",
];

export const INTEGRATION_STATUSES: IntegrationStatus[] = ["available", "coming_soon", "custom"];

/** Public hook — visitors only see published rows (RLS-enforced). */
export const useIntegrations = () => {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Integration[];
    },
    staleTime: 60_000,
  });
};

/** Admin hook — returns ALL rows including unpublished (RLS lets editors see them). */
export const useAdminIntegrations = () => {
  return useQuery({
    queryKey: ["integrations", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Integration[];
    },
  });
};

export type IntegrationInput = Omit<Integration, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

export const useSaveIntegration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: IntegrationInput) => {
      const payload = {
        name: input.name,
        name_ar: input.name_ar || null,
        slug: input.slug,
        category: input.category,
        description: input.description || null,
        description_ar: input.description_ar || null,
        logo_url: input.logo_url || null,
        status: input.status,
        cta_label: input.cta_label || null,
        cta_label_ar: input.cta_label_ar || null,
        cta_link: input.cta_link || null,
        sort_order: input.sort_order ?? 0,
        published: input.published,
      };
      if (input.id) {
        const { error } = await supabase.from("integrations").update(payload).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("integrations").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
};

export const useDeleteIntegration = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("integrations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations"] });
    },
  });
};
