import { useSiteContent } from "@/hooks/useSiteContent";

/**
 * Returns the CMS-managed branding asset for the given key, or the
 * provided bundled fallback if no override has been uploaded.
 *
 * Storage: site_content rows where page="branding", section="logos",
 * content_type="image_url", content_key in:
 *   - logo_navbar
 *   - logo_footer
 *   - logo_powered_by
 *   - favicon
 *   - og_image
 */
export const useBrandingAsset = (key: string, fallback: string): string => {
  const { items } = useSiteContent("branding", "logos");
  const item = items.find((i) => i.content_key === key && i.content_type === "image_url");
  return item?.value || fallback;
};
