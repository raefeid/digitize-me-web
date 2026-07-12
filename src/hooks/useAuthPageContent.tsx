import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AuthBenefit = { icon?: string; title?: string; desc?: string };

export type AuthPageContent = {
  id: string;
  page_key: "signin" | "signup";

  title: string;
  title_ar: string | null;
  subtitle: string | null;
  subtitle_ar: string | null;

  email_label: string | null;
  email_label_ar: string | null;
  email_placeholder: string | null;
  email_placeholder_ar: string | null;
  password_label: string | null;
  password_label_ar: string | null;
  password_placeholder: string | null;
  password_placeholder_ar: string | null;
  full_name_label: string | null;
  full_name_label_ar: string | null;
  full_name_placeholder: string | null;
  full_name_placeholder_ar: string | null;
  forgot_link_label: string | null;
  forgot_link_label_ar: string | null;
  terms_text: string | null;
  terms_text_ar: string | null;
  divider_text: string | null;
  divider_text_ar: string | null;

  footer_prefix: string | null;
  footer_prefix_ar: string | null;
  footer_link_label: string | null;
  footer_link_label_ar: string | null;
  footer_link_url: string | null;

  submit_label: string;
  submit_label_ar: string | null;
  submit_loading_label: string | null;
  submit_loading_label_ar: string | null;
  submit_bg_color: string | null;
  submit_text_color: string | null;
  submit_variant: string;

  google_enabled: boolean;
  google_label: string | null;
  google_label_ar: string | null;

  forgot_link_enabled: boolean;
  footer_link_enabled: boolean;
  show_terms_checkbox: boolean;
  show_brand_panel: boolean;

  brand_badge: string | null;
  brand_badge_ar: string | null;
  brand_headline: string | null;
  brand_headline_ar: string | null;
  brand_benefits: AuthBenefit[];
  brand_benefits_ar: AuthBenefit[];
  brand_footer_text: string | null;
  brand_footer_text_ar: string | null;

  background_image_url: string | null;
  background_gradient_from: string | null;
  background_gradient_to: string | null;
  background_overlay_opacity: number;

  // Foreground illustration (sits on top of background, inside the brand panel)
  illustration_url: string | null;
  illustration_alignment: "top" | "center" | "bottom";
  illustration_max_width: number;

  // Decorative pattern overlay above the background
  pattern_overlay: "none" | "dots" | "grid" | "waves" | "noise";
  pattern_overlay_opacity: number;

  // Brand-panel logo
  logo_visible: boolean;
  logo_url: string | null;
  logo_position: "top-left" | "top-center" | "above-headline";

  // Submit button extended styling
  submit_size: "sm" | "md" | "lg";
  submit_radius: "none" | "md" | "full";
  submit_full_width: boolean;
  submit_hover_bg_color: string | null;
  submit_shadow: "none" | "sm" | "md" | "lg" | "glow";
};

export const useAuthPageContent = (pageKey: "signin" | "signup") => {
  return useQuery({
    queryKey: ["auth-page-content", pageKey],
    queryFn: async (): Promise<AuthPageContent | null> => {
      const { data, error } = await supabase
        .from("auth_pages")
        .select("*")
        .eq("page_key", pageKey)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        brand_benefits: Array.isArray(data.brand_benefits)
          ? (data.brand_benefits as AuthBenefit[])
          : [],
        brand_benefits_ar: Array.isArray(data.brand_benefits_ar)
          ? (data.brand_benefits_ar as AuthBenefit[])
          : [],
      } as AuthPageContent;
    },
    staleTime: 60_000,
  });
};
