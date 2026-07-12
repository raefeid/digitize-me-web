import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type NavAuthButton = {
  id: string;
  button_key: string;
  label: string;
  label_ar: string | null;
  link: string;
  variant: string;
  custom_bg_color: string | null;
  custom_text_color: string | null;
  visible: boolean;
  sort_order: number;
  helper_caption: string | null;
  helper_caption_ar: string | null;
};

export const useNavAuthButtons = () => {
  return useQuery({
    queryKey: ["nav-auth-buttons"],
    queryFn: async (): Promise<NavAuthButton[]> => {
      const { data, error } = await supabase
        .from("nav_auth_buttons")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as NavAuthButton[];
    },
    staleTime: 60_000,
  });
};

export const findAuthButton = (
  buttons: NavAuthButton[] | undefined,
  key: string,
): NavAuthButton | undefined =>
  (buttons ?? []).find((b) => b.button_key === key);
