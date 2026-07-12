import type { AuthPageContent } from "@/hooks/useAuthPageContent";

/**
 * Renders one of the preset decorative SVG patterns on top of the brand-panel
 * background. All patterns use `currentColor` so they pick up the brand-panel
 * foreground color (primary-foreground on the auth shell).
 */
const PatternOverlay = ({ content }: { content: AuthPageContent | null | undefined }) => {
  const pattern = content?.pattern_overlay ?? "none";
  if (pattern === "none") return null;
  const opacity = Math.max(0, Math.min(1, content?.pattern_overlay_opacity ?? 0.15));

  if (pattern === "noise") {
    // SVG fractal noise via feTurbulence — cheap and self-contained.
    return (
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full mix-blend-overlay"
        style={{ opacity }}
      >
        <filter id="auth-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#auth-noise)" />
      </svg>
    );
  }

  // CSS-based patterns. We render the pattern in `currentColor` and inherit
  // text color from the parent so it picks up the brand-panel theme.
  let backgroundImage = "";
  let backgroundSize = "";
  if (pattern === "dots") {
    backgroundImage = "radial-gradient(currentColor 1px, transparent 1px)";
    backgroundSize = "16px 16px";
  } else if (pattern === "grid") {
    backgroundImage =
      "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)";
    backgroundSize = "32px 32px";
  } else if (pattern === "waves") {
    // Two diagonal lines repeated.
    backgroundImage =
      "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, currentColor 0 1px, transparent 1px 14px)";
    backgroundSize = "auto";
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ backgroundImage, backgroundSize, opacity }}
    />
  );
};

export default PatternOverlay;
