import type { CSSProperties } from "react";
import type { AuthPageContent } from "@/hooks/useAuthPageContent";

/**
 * Tailwind classes derived from CMS-driven submit button settings.
 * Style overrides (bg/text/hover colors) are returned as inline CSS to avoid
 * fighting Tailwind specificity — see `submitStyle` for the matching style obj.
 */
export const submitClasses = (content: AuthPageContent | null | undefined): string => {
  const size = content?.submit_size ?? "md";
  const radius = content?.submit_radius ?? "md";
  const shadow = content?.submit_shadow ?? "none";
  const fullWidth = content?.submit_full_width !== false;

  const sizeClass = size === "sm" ? "h-9 text-sm px-4" : size === "lg" ? "h-12 text-base px-8" : "h-11 text-sm px-6";
  const radiusClass = radius === "none" ? "rounded-none" : radius === "full" ? "rounded-full" : "rounded-xl";
  const shadowClass =
    shadow === "sm" ? "shadow-sm"
      : shadow === "md" ? "shadow-md"
      : shadow === "lg" ? "shadow-lg"
      : shadow === "glow" ? "shadow-[0_8px_30px_-8px_hsl(var(--accent)/0.6)]"
      : "";
  const widthClass = fullWidth ? "w-full" : "";

  const variant = content?.submit_variant ?? "accent";
  const variantClass = (() => {
    switch (variant) {
      case "outline":
        return "border border-border bg-transparent text-foreground hover:bg-muted";
      case "ghost":
        return "bg-transparent text-foreground hover:bg-muted";
      case "secondary":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/90";
      case "default":
        return "bg-primary text-primary-foreground hover:bg-primary/90";
      case "accent":
      default:
        return "bg-accent text-accent-foreground hover:bg-accent/90";
    }
  })();

  return ["font-semibold mt-2 transition-all", widthClass, sizeClass, radiusClass, shadowClass, variantClass]
    .filter(Boolean)
    .join(" ");
};

/**
 * Inline-style overrides for the submit button. Returned with a CSS variable
 * for hover bg so we can wire it via a tiny inline `onMouseEnter/Leave` swap.
 */
export const submitStyle = (content: AuthPageContent | null | undefined): CSSProperties => {
  const style: CSSProperties = {};
  if (content?.submit_bg_color) style.backgroundColor = content.submit_bg_color;
  if (content?.submit_text_color) style.color = content.submit_text_color;
  return style;
};

/**
 * Hover handlers that swap to `submit_hover_bg_color` when set. We only attach
 * them when a custom hover bg is configured; otherwise the variant's Tailwind
 * `hover:` classes win as before.
 */
export const submitHoverHandlers = (content: AuthPageContent | null | undefined) => {
  const hoverBg = content?.submit_hover_bg_color;
  const baseBg = content?.submit_bg_color;
  if (!hoverBg) return {};
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.backgroundColor = hoverBg;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      (e.currentTarget as HTMLElement).style.backgroundColor = baseBg ?? "";
    },
  };
};
