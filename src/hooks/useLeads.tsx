import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Lead {
  id: string;
  use_case: string | null;
  industry: string | null;
  company_size: string | null;
  full_name: string;
  work_email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  cta_source: string | null;
  page_path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type LeadInput = {
  use_case?: string;
  industry?: string;
  company_size?: string;
  full_name: string;
  work_email: string;
  phone?: string;
  company?: string;
  message?: string;
  cta_source?: string;
};

const readUtm = () => {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get("utm_source") ?? undefined,
    utm_medium: p.get("utm_medium") ?? undefined,
    utm_campaign: p.get("utm_campaign") ?? undefined,
    page_path: window.location.pathname,
  };
};

export const useSubmitLead = () => {
  return useMutation({
    mutationFn: async (input: LeadInput) => {
      const payload = {
        use_case: input.use_case || null,
        industry: input.industry || null,
        company_size: input.company_size || null,
        full_name: input.full_name.trim(),
        work_email: input.work_email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
        company: input.company?.trim() || null,
        message: input.message?.trim() || null,
        cta_source: input.cta_source || null,
        ...readUtm(),
      };
      const { error } = await supabase.from("leads").insert(payload);
      if (error) throw error;
    },
  });
};

export const useAdminLeads = () =>
  useQuery({
    queryKey: ["leads", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as Lead[];
    },
  });

export const useUpdateLeadStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
};

export const useDeleteLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
};
