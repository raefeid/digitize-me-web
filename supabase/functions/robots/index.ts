import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Per-language XML sitemaps (English + Arabic) plus the index.
Sitemap: {{SITEMAP_URL}}
Sitemap: {{SITEMAP_EN_URL}}
Sitemap: {{SITEMAP_AR_URL}}
Sitemap: {{SITEMAP_INDEX_URL}}
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);

    const { data: cfg } = await supabase
      .from("site_content")
      .select("value")
      .eq("page", "seo")
      .eq("section", "global")
      .eq("content_key", "site_url")
      .maybeSingle();

    const baseUrl = (cfg?.value?.trim() || `${url.protocol}//${url.host}`).replace(/\/$/, "");
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    const sitemapEnUrl = `${baseUrl}/sitemap-en.xml`;
    const sitemapArUrl = `${baseUrl}/sitemap-ar.xml`;
    const sitemapIndexUrl = `${baseUrl}/sitemap-index.xml`;

    const { data: custom } = await supabase
      .from("site_content")
      .select("value")
      .eq("page", "seo")
      .eq("section", "global")
      .eq("content_key", "robots_txt")
      .maybeSingle();

    let body = (custom?.value?.trim() || DEFAULT_ROBOTS).trim();
    body = body
      .replace(/\{\{\s*SITEMAP_URL\s*\}\}/g, sitemapUrl)
      .replace(/\{\{\s*SITEMAP_EN_URL\s*\}\}/g, sitemapEnUrl)
      .replace(/\{\{\s*SITEMAP_AR_URL\s*\}\}/g, sitemapArUrl)
      .replace(/\{\{\s*SITEMAP_INDEX_URL\s*\}\}/g, sitemapIndexUrl);

    // Ensure every per-language sitemap reference exists exactly once.
    for (const ref of [sitemapUrl, sitemapEnUrl, sitemapArUrl, sitemapIndexUrl]) {
      const escaped = ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp(`^Sitemap:\\s*${escaped}\\s*$`, "im").test(body)) {
        body += `\nSitemap: ${ref}`;
      }
    }

    return new Response(body + "\n", {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(`# robots error: ${message}\nUser-agent: *\nAllow: /\n`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
