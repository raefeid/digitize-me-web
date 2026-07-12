import { stripArabicPrefix } from "@/lib/localizedRoutes";

/**
 * Canonicalize a CMS-stored CTA destination so it routes correctly through
 * `localizeInternalPath` for both languages.
 *
 * Rules (only applied to `kind === "link"`):
 *  - Strip a leading `/ar` or `/ar/...` prefix so the value stays language-agnostic.
 *  - Ensure the path starts with `/` (CMS users sometimes type `contact`).
 *  - Leave anchors (`#section`), query-only paths, and the empty string alone.
 *
 * For non-link kinds (email, phone, whatsapp, external) the value is returned
 * unchanged — language is irrelevant there.
 */
export const normalizeCtaDestination = (
  kind: string,
  rawValue: string,
): string => {
  if (kind !== "link") return rawValue;
  const trimmed = (rawValue ?? "").trim();
  if (!trimmed) return "";
  // Don't touch hash-only or query-only values.
  if (trimmed.startsWith("#") || trimmed.startsWith("?")) return trimmed;
  // Don't touch absolute / protocol URLs even if mistakenly used here.
  if (/^(https?:|mailto:|tel:|sms:)/i.test(trimmed)) return trimmed;

  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const stripped = stripArabicPrefix(withSlash);
  // Preserve query/hash that stripArabicPrefix passes through naturally.
  return stripped || "/";
};

/**
 * Returns true when the value, as currently typed, would be normalized
 * (i.e. the editor should show a hint that we'll save it differently).
 */
export const ctaDestinationNeedsNormalization = (
  kind: string,
  rawValue: string,
): boolean => {
  if (kind !== "link") return false;
  const trimmed = (rawValue ?? "").trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/ar/") || trimmed === "/ar") return true;
  return false;
};
