import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ClientLogo {
  id: string;
  company_name: string;
  logo_url: string;
  link_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type ClientLogoInput = Omit<ClientLogo, "id" | "created_at" | "updated_at"> & { id?: string };

export const useClientLogos = () =>
  useQuery({
    queryKey: ["client_logos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_logos")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ClientLogo[];
    },
    staleTime: 60_000,
  });

export const useAdminClientLogos = () =>
  useQuery({
    queryKey: ["client_logos", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_logos")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as ClientLogo[];
    },
  });

export const useSaveClientLogo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClientLogoInput) => {
      const payload = {
        company_name: input.company_name,
        logo_url: input.logo_url,
        link_url: input.link_url || null,
        sort_order: input.sort_order ?? 0,
        published: input.published ?? true,
      };
      if (input.id) {
        const { error } = await supabase.from("client_logos").update(payload).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("client_logos").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["client_logos"] }),
  });
};

export const useDeleteClientLogo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("client_logos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["client_logos"] }),
  });
};
