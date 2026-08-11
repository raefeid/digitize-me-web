import DOMPurify from "dompurify";

/**
 * HTML sanitizer for CMS-authored rich content (marketing copy, blog posts,
 * custom_pages blocks). These fields are editable by admin/editor/seo_manager/
 * blog_author roles and are rendered via dangerouslySetInnerHTML / innerHTML, so
 * without sanitization a lower-privileged editor could plant a <script> that runs
 * for every visitor (stored XSS → session/JWT theft).
 *
 * DOMPurify strips <script>, inline event handlers (onclick=...), javascript:
 * URLs, and other active content while preserving standard formatting, links,
 * images and tables. Video embeds are permitted only from an allowlist of known
 * hosts so legitimate YouTube/Vimeo/Maps embeds keep working.
 *
 * NOTE: this must NOT be used for the tracking `custom_head` / `custom_body`
 * fields — those legitimately inject <script> and are instead locked down to the
 * super_admin role at the database layer (see the site_content RLS migration).
 */

// Hosts whose <iframe> embeds are allowed to survive sanitization.
const IFRAME_ALLOWED_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "www.google.com",
  "maps.google.com",
]);

let hooksInstalled = false;

function ensureHooks() {
  if (hooksInstalled) return;

  // Drop iframes pointing at anything not on the allowlist.
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName !== "iframe") return;
    const el = node as Element;
    const src = el.getAttribute("src") || "";
    let host = "";
    try {
      host = new URL(src, "https://invalid.example").hostname;
    } catch {
      host = "";
    }
    if (!IFRAME_ALLOWED_HOSTS.has(host)) {
      el.remove();
    }
  });

  // Harden any target="_blank" links against reverse-tabnabbing.
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    const el = node as Element;
    if (el.tagName === "A" && el.getAttribute("target") === "_blank") {
      el.setAttribute("rel", "noopener noreferrer");
    }
  });

  hooksInstalled = true;
}

/**
 * Sanitize CMS rich-text/HTML before rendering. Returns "" for empty input.
 */
export function sanitizeRichHtml(dirty: string | null | undefined): string {
  if (!dirty) return "";
  ensureHooks();
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["target", "allow", "allowfullscreen", "frameborder", "scrolling"],
  });
}
