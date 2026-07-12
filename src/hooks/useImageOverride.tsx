import { useSiteContent } from "@/hooks/useSiteContent";

/**
 * Returns a CMS-uploaded image URL for the given key, or null if none.
 * Used to let admins replace animated illustrations with a static image.
 *
 * Storage convention:
 *   site_content row where page=<page>, section="overrides",
 *   content_key=<key>, content_type="image_url", value=<public URL>
 */
export const useImageOverride = (page: string, key: string): string | null => {
  const { items } = useSiteContent(page, "overrides");
  const item = items.find((i) => i.content_key === key && i.content_type === "image_url");
  return item?.value || null;
};
