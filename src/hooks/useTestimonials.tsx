import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  author_name: string;
  author_name_ar: string | null;
  role: string | null;
  role_ar: string | null;
  company: string | null;
  company_ar: string | null;
  quote: string;
  quote_ar: string | null;
  avatar_url: string | null;
  company_logo_url: string | null;
  rating: number;
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type TestimonialInput = Omit<Testimonial, "id" | "created_at" | "updated_at"> & { id?: string };

export const useTestimonials = () =>
  useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Testimonial[];
    },
    staleTime: 60_000,
  });

export const useAdminTestimonials = () =>
  useQuery({
    queryKey: ["testimonials", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Testimonial[];
    },
  });

export const useSaveTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TestimonialInput) => {
      const payload = {
        author_name: input.author_name,
        author_name_ar: input.author_name_ar || null,
        role: input.role || null,
        role_ar: input.role_ar || null,
        company: input.company || null,
        company_ar: input.company_ar || null,
        quote: input.quote,
        quote_ar: input.quote_ar || null,
        avatar_url: input.avatar_url || null,
        company_logo_url: input.company_logo_url || null,
        rating: input.rating ?? 5,
        featured: input.featured ?? false,
        sort_order: input.sort_order ?? 0,
        published: input.published ?? true,
      };
      if (input.id) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};

export const useDeleteTestimonial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["testimonials"] }),
  });
};
