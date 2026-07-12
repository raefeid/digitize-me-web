import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Per-CTA style override stored in CMS so admins can restyle any registry
 * button (e.g. "nav_demo") without code edits. Changes apply everywhere that
 * registry key is used — keeps the site consistent.
 *
 * Storage: one row per (key, content_key) in `site_content`
 *   page         = "cta_styles"
 *   section      = the CTA key (e.g. "nav_demo")
 *   content_key  = "variant" | "size" | "color" | "new_tab"
 *   value        = the chosen preset string ("primary"/"sm"/"accent"/"true")
 */

export type CtaStyleVariant =
  | "primary"   // bg-primary
  | "accent"    // bg-accent (brand orange)
  | "outline"   // outlined
  | "ghost"     // transparent + hover
  | "link"      // underline
  | "secondary"; // muted

export type CtaStyleSize = "sm" | "default" | "lg";

/** Theme tokens only — no free-form hex. Maps to design-system colors. */
export type CtaStyleColor = "default" | "primary" | "accent" | "destructive" | "muted";

export type CtaStyleBorderColor = "default" | "primary" | "accent" | "destructive" | "muted" | "foreground";

/** Font (text) color preset — applied via Tailwind text-* classes */
export type CtaStyleTextColor =
  | "default"
  | "white"
  | "foreground"
  | "primary"
  | "primary-foreground"
  | "accent"
  | "accent-foreground"
  | "muted-foreground"
  | "destructive";

/** Font weight preset — applied via Tailwind font-* classes */
export type CtaStyleFontWeight =
  | "default"
  | "normal"
  | "medium"
  | "semibold"
  | "bold";

/** Border radius preset — applied via Tailwind rounded-* classes */
export type CtaStyleRadius = "default" | "square" | "rounded" | "pill";

/** Icon position relative to the label */
export type CtaStyleIconPosition = "left" | "right";

export interface CtaStyle {
  variant: CtaStyleVariant;
  size: CtaStyleSize;
  color: CtaStyleColor;
  textColor: CtaStyleTextColor;
  hoverColor: CtaStyleColor;
  hoverTextColor: CtaStyleTextColor;
  hoverBorderColor: CtaStyleBorderColor;
  fontWeight: CtaStyleFontWeight;
  radius: CtaStyleRadius;
  /** Lucide icon name (e.g. "ArrowRight"). null/empty = no icon. */
  icon: string | null;
  iconPosition: CtaStyleIconPosition;
  newTab: boolean;
}

export const DEFAULT_CTA_STYLE: CtaStyle = {
  variant: "primary",
  size: "default",
  color: "default",
  textColor: "default",
  hoverColor: "default",
  hoverTextColor: "default",
  hoverBorderColor: "default",
  fontWeight: "default",
  radius: "default",
  icon: null,
  iconPosition: "left",
  newTab: false,
};

const CTA_STYLES_PAGE = "cta_styles";

interface StyleRow {
  section: string;
  content_key: string;
  value: string;
}

const BUTTON_TEXT_SIZE_TOKENS = new Set(["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "text-5xl", "text-6xl"]);

const BORDER_WIDTH_OR_STYLE = /^(border|border-(0|2|4|8|x|y|t|r|b|l|solid|dashed|dotted|double|hidden|none))$/;

const getBaseUtilityToken = (token: string) => token.split(":").pop() ?? token;

const isSizeToken = (token: string) => {
  const baseToken = getBaseUtilityToken(token);
  return /^(h-|min-h-|max-h-|px-|py-)/.test(baseToken) || BUTTON_TEXT_SIZE_TOKENS.has(baseToken);
};

const isColorToken = (token: string) => {
  const baseToken = getBaseUtilityToken(token);
  if (baseToken.startsWith("bg-")) return true;
  if (baseToken.startsWith("text-") && !BUTTON_TEXT_SIZE_TOKENS.has(baseToken)) return true;
  if (baseToken.startsWith("border-") && !BORDER_WIDTH_OR_STYLE.test(baseToken)) return true;
  return false;
};

const stripClassTokens = (className: string | undefined, shouldStrip: (token: string) => boolean) =>
  (className ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !shouldStrip(token))
    .join(" ");

export const stripCtaColorClasses = (className?: string) => stripClassTokens(className, isColorToken);

export const stripCtaSizeClasses = (className?: string) =>
  stripClassTokens(className, isSizeToken);

export const hasCtaSizeClasses = (className?: string) =>
  (className ?? "").split(/\s+/).filter(Boolean).some(isSizeToken);

export const stripCtaRadiusClasses = (className?: string) =>
  stripClassTokens(className, (token) => /^rounded(?:-|$)/.test(token));

export const stripCtaFontWeightClasses = (className?: string) =>
  stripClassTokens(className, (token) => /^font-/.test(token));

const fetchCtaStyles = async (): Promise<StyleRow[]> => {
  const { data, error } = await supabase
    .from("site_content")
    .select("section, content_key, value")
    .eq("page", CTA_STYLES_PAGE);
  if (error) throw error;
  return (data ?? []) as StyleRow[];
};

/**
 * Read the saved style for a given CTA registry key, falling back to the
 * defaults supplied by the calling component (e.g. hero passes `accent`,
 * navbar passes `outline`).
 */
export const useCtaStyles = () => {
  const query = useQuery({
    queryKey: ["cta-styles"],
    queryFn: fetchCtaStyles,
    staleTime: 60_000,
  });

  const get = (key: string, fallback: Partial<CtaStyle> = {}): CtaStyle => {
    const base = { ...DEFAULT_CTA_STYLE, ...fallback };
    if (!query.data) return base;
    const rows = query.data.filter((r) => r.section === key);
    if (!rows.length) return base;
    const find = (k: string) => rows.find((r) => r.content_key === k)?.value;
    return {
      variant: (find("variant") as CtaStyleVariant) || base.variant,
      size: (find("size") as CtaStyleSize) || base.size,
      color: (find("color") as CtaStyleColor) || base.color,
      textColor: (find("text_color") as CtaStyleTextColor) || base.textColor,
      hoverColor: (find("hover_color") as CtaStyleColor) || base.hoverColor,
      hoverTextColor: (find("hover_text_color") as CtaStyleTextColor) || base.hoverTextColor,
      hoverBorderColor: (find("hover_border_color") as CtaStyleBorderColor) || base.hoverBorderColor,
      fontWeight: (find("font_weight") as CtaStyleFontWeight) || base.fontWeight,
      radius: (find("radius") as CtaStyleRadius) || base.radius,
      icon: (find("icon") ?? base.icon) || null,
      iconPosition: (find("icon_position") as CtaStyleIconPosition) || base.iconPosition,
      newTab: find("new_tab") === "true" ? true : base.newTab,
    };
  };

  const hasOverride = (key: string, contentKeys?: string[]) => {
    if (!query.data?.length) return false;
    return query.data.some((row) => {
      if (row.section !== key) return false;
      if (!contentKeys?.length) return true;
      return contentKeys.includes(row.content_key);
    });
  };

  return { get, hasOverride, isLoading: query.isLoading, rows: query.data ?? [] };
};

/** Save (upsert) one or more style fields for a CTA key. */
export const useSaveCtaStyle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, style }: { key: string; style: CtaStyle }) => {
      const fields: Array<[string, string]> = [
        ["variant", style.variant],
        ["size", style.size],
        ["color", style.color],
        ["text_color", style.textColor],
        ["hover_color", style.hoverColor],
        ["hover_text_color", style.hoverTextColor],
        ["hover_border_color", style.hoverBorderColor],
        ["font_weight", style.fontWeight],
        ["radius", style.radius],
        ["icon", style.icon ?? ""],
        ["icon_position", style.iconPosition],
        ["new_tab", style.newTab ? "true" : "false"],
      ];
      for (const [contentKey, value] of fields) {
        const { data: existing } = await supabase
          .from("site_content")
          .select("id")
          .eq("page", CTA_STYLES_PAGE)
          .eq("section", key)
          .eq("content_key", contentKey)
          .maybeSingle();
        if (existing) {
          const { error } = await supabase
            .from("site_content")
            .update({ value, content_type: "text" })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("site_content").insert({
            page: CTA_STYLES_PAGE,
            section: key,
            content_key: contentKey,
            value,
            content_type: "text",
            sort_order: 0,
          });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cta-styles"] });
    },
  });
};

/**
 * Map our CTA style preset to the underlying shadcn Button `variant` prop.
 * Color preset modulates the accent — for now `accent` and `primary` map
 * to dedicated variants; others fall back to the chosen variant unchanged.
 */
export const ctaStyleToVariant = (
  style: CtaStyle,
): "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" => {
  // Color presets that have a dedicated variant override the variant choice
  if (style.color === "destructive") return "destructive";
  switch (style.variant) {
    case "primary":
      return "default";
    case "accent":
      return "default"; // styled with extra className below
    case "outline":
      return "outline";
    case "ghost":
      return "ghost";
    case "link":
      return "link";
    case "secondary":
      return "secondary";
    default:
      return "default";
  }
};

/** Extra Tailwind classes to apply on top of the variant for color presets. */
export const ctaStyleToClassName = (style: CtaStyle): string => {
  const parts: string[] = [];
  // Background / variant overrides
  if (style.variant === "accent" && style.color === "default") {
    parts.push("bg-accent text-accent-foreground");
    if (style.hoverColor === "default") parts.push("hover:bg-accent/90");
  } else if (style.color === "accent") {
    parts.push("bg-accent text-accent-foreground");
    if (style.hoverColor === "default") parts.push("hover:bg-accent/90");
  } else if (style.color === "primary" && style.variant !== "primary") {
    parts.push("bg-primary text-primary-foreground");
    if (style.hoverColor === "default") parts.push("hover:bg-primary/90");
  } else if (style.color === "muted") {
    parts.push("bg-muted text-muted-foreground");
    if (style.hoverColor === "default") parts.push("hover:bg-muted/80");
  }

  // Font color override (wins over variant defaults)
  const textMap: Record<CtaStyleTextColor, string> = {
    default: "",
    white: "!text-white",
    foreground: "!text-foreground",
    primary: "!text-primary",
    "primary-foreground": "!text-primary-foreground",
    accent: "!text-accent",
    "accent-foreground": "!text-accent-foreground",
    "muted-foreground": "!text-muted-foreground",
    destructive: "!text-destructive",
  };
  if (style.textColor && textMap[style.textColor]) parts.push(textMap[style.textColor]);

  const hoverBgMap: Record<CtaStyleColor, string> = {
    default: "",
    primary: "hover:bg-primary/90",
    accent: "hover:bg-accent/90",
    destructive: "hover:bg-destructive/90",
    muted: "hover:bg-muted/80",
  };
  if (style.hoverColor && hoverBgMap[style.hoverColor]) parts.push(hoverBgMap[style.hoverColor]);

  const hoverTextMap: Record<CtaStyleTextColor, string> = {
    default: "",
    white: "hover:text-white",
    foreground: "hover:text-foreground",
    primary: "hover:text-primary",
    "primary-foreground": "hover:text-primary-foreground",
    accent: "hover:text-accent",
    "accent-foreground": "hover:text-accent-foreground",
    "muted-foreground": "hover:text-muted-foreground",
    destructive: "hover:text-destructive",
  };
  if (style.hoverTextColor && hoverTextMap[style.hoverTextColor]) parts.push(hoverTextMap[style.hoverTextColor]);

  const hoverBorderMap: Record<CtaStyleBorderColor, string> = {
    default: "",
    primary: "hover:border-primary",
    accent: "hover:border-accent",
    destructive: "hover:border-destructive",
    muted: "hover:border-muted-foreground",
    foreground: "hover:border-foreground",
  };
  if (style.hoverBorderColor && hoverBorderMap[style.hoverBorderColor]) parts.push(hoverBorderMap[style.hoverBorderColor]);

  // Font weight override
  const weightMap: Record<CtaStyleFontWeight, string> = {
    default: "",
    normal: "!font-normal",
    medium: "!font-medium",
    semibold: "!font-semibold",
    bold: "!font-bold",
  };
  if (style.fontWeight && weightMap[style.fontWeight]) parts.push(weightMap[style.fontWeight]);

  // Border radius override
  const radiusMap: Record<CtaStyleRadius, string> = {
    default: "",
    square: "!rounded-none",
    rounded: "!rounded-lg",
    pill: "!rounded-full",
  };
  if (style.radius && radiusMap[style.radius]) parts.push(radiusMap[style.radius]);

  return parts.join(" ");
};
