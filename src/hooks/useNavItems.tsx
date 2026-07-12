import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type NavLocation = "navbar" | "footer";
export type NavTargetType = "route" | "custom_page" | "external";

export type NavItemRow = {
  id: string;
  parent_id: string | null;
  location: NavLocation;
  footer_column: string | null;
  label: string;
  label_ar: string | null;
  target_type: NavTargetType;
  target_route: string | null;
  custom_page_id: string | null;
  external_url: string | null;
  open_in_new_tab: boolean;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export const useNavItems = (location?: NavLocation) =>
  useQuery({
    queryKey: ["nav_items", location ?? "all"],
    queryFn: async () => {
      let q = supabase.from("nav_items").select("*").order("sort_order", { ascending: true });
      if (location) q = q.eq("location", location);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as NavItemRow[];
    },
  });

export const useSaveNavItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (n: Partial<NavItemRow> & { label: string; location: NavLocation }) => {
      const payload: any = {
        parent_id: n.parent_id ?? null,
        location: n.location,
        footer_column: n.footer_column ?? null,
        label: n.label,
        label_ar: n.label_ar ?? null,
        target_type: n.target_type ?? "route",
        target_route: n.target_route ?? null,
        custom_page_id: n.custom_page_id ?? null,
        external_url: n.external_url ?? null,
        open_in_new_tab: n.open_in_new_tab ?? false,
        sort_order: n.sort_order ?? 0,
        published: n.published ?? true,
      };
      if (n.id) {
        const { error } = await supabase.from("nav_items").update(payload).eq("id", n.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("nav_items").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nav_items"] }),
  });
};

export const useDeleteNavItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("nav_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nav_items"] }),
  });
};

/** Resolve a nav item's `to` URL based on its target_type. */
export const navItemHref = (
  n: NavItemRow,
  customPagesById: Record<string, { slug: string }>,
): string => {
  if (n.target_type === "external") return n.external_url || "#";
  if (n.target_type === "custom_page") {
    const p = n.custom_page_id ? customPagesById[n.custom_page_id] : null;
    return p ? `/${p.slug}` : "#";
  }
  return n.target_route || "#";
};
