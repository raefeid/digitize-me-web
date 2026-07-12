import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type NavItemRow = {
  id: string;
  parent_id: string | null;
  target_type: "route" | "custom_page" | "external";
  target_route: string | null;
  custom_page_id: string | null;
  external_url: string | null;
  published: boolean;
  updated_at: string;
  sort_order: number;
};

type CustomPageRow = {
  id: string;
  slug: string;
  updated_at: string;
  status: string;
};

type FeatureRow = {
  id: string;
  slug: string;
  updated_at: string;
  published: boolean;
};

type BlogPostRow = {
  slug: string;
  updated_at: string | null;
  published_at: string | null;
};

type SiteContentRow = {
  content_key: string;
  value: string | null;
  updated_at: string;
};

type SitemapEntry = {
  /** Canonical English path, e.g. "/", "/contact", "/industries/law-firms". */
  path: string;
  lastmod: string;
  changefreq: string;
  priority: number;
  /** When true, the URL has localized counterparts (English + Arabic). */
  hreflang?: boolean;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STATIC_ROUTE_META: Record<string, { priority: number; changefreq: string; hreflang?: boolean }> = {
  "/": { priority: 1.0, changefreq: "weekly", hreflang: true },
  "/product": { priority: 0.9, changefreq: "monthly", hreflang: true },
  "/pricing": { priority: 0.9, changefreq: "monthly", hreflang: true },
  "/industries": { priority: 0.8, changefreq: "monthly", hreflang: true },
  "/contact": { priority: 0.7, changefreq: "monthly", hreflang: true },
  "/about": { priority: 0.7, changefreq: "monthly", hreflang: true },
  "/blog": { priority: 0.8, changefreq: "weekly", hreflang: true },
  "/privacy": { priority: 0.3, changefreq: "yearly" },
  "/terms": { priority: 0.3, changefreq: "yearly" },
  "/features": { priority: 0.8, changefreq: "monthly", hreflang: true },
  "/integrations": { priority: 0.7, changefreq: "monthly", hreflang: true },
};

const DEFAULT_ROUTE_META = { priority: 0.6, changefreq: "monthly", hreflang: true };

const INDUSTRY_SLUGS = [
  "law-firms", "accounting", "logistics", "real-estate", "healthcare",
  "education", "manufacturing", "construction", "government",
  "banking-finance", "import-export", "oil-gas", "insurance", "retail",
];

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");

const fmtDate = (d: string | Date) => new Date(d).toISOString().split("T")[0];

const normalizePath = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "#") return null;
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return null;

  try {
    const url = new URL(trimmed, "https://placeholder.local");
    const path = `${url.pathname}${url.search}`.replace(/\/$/, "") || "/";
    return path.startsWith("/") ? path : `/${path}`;
  } catch {
    return trimmed.startsWith("/") ? trimmed.replace(/\/$/, "") || "/" : `/${trimmed.replace(/^\/+/, "").replace(/\/$/, "")}`;
  }
};

const stripArPrefix = (path: string) => {
  if (path === "/ar") return "/";
  if (path.startsWith("/ar/")) return path.slice(3);
  return path;
};

const navItemPath = (item: NavItemRow, pagesById: Map<string, CustomPageRow>): string | null => {
  if (item.target_type === "external") return null;
  if (item.target_type === "custom_page") {
    const page = item.custom_page_id ? pagesById.get(item.custom_page_id) : null;
    return page ? `/${page.slug}` : null;
  }
  const raw = normalizePath(item.target_route);
  return raw ? stripArPrefix(raw) : null;
};

const addEntry = (entries: Map<string, SitemapEntry>, entry: SitemapEntry) => {
  const existing = entries.get(entry.path);
  if (!existing || entry.lastmod > existing.lastmod) {
    entries.set(entry.path, entry);
  }
};

const toArabicPath = (path: string) => (path === "/" ? "/ar" : `/ar${path}`);

const localizedHref = (baseUrl: string, path: string, lang: "en" | "ar") => {
  const localized = lang === "ar" ? toArabicPath(path) : path;
  return `${baseUrl}${localized === "/" ? "" : localized}` || baseUrl;
};

/**
 * Build a single language-scoped <urlset>. Each <url> emits:
 *   - <loc> for the requested language
 *   - hreflang alternates pointing to BOTH languages + x-default (English)
 * so the file works as both an "en sitemap" and an "ar sitemap" while still
 * giving Google the per-language signal for that variant.
 */
const renderUrlset = (
  baseUrl: string,
  entries: SitemapEntry[],
  lang: "en" | "ar",
): string => {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">');

  for (const entry of entries) {
    const loc = localizedHref(baseUrl, entry.path, lang);
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(loc)}</loc>`);
    lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
    if (entry.hreflang) {
      const enHref = localizedHref(baseUrl, entry.path, "en");
      const arHref = localizedHref(baseUrl, entry.path, "ar");
      lines.push(`    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enHref)}" />`);
      lines.push(`    <xhtml:link rel="alternate" hreflang="ar" href="${escapeXml(arHref)}" />`);
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(enHref)}" />`);
    }
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  return lines.join("\n");
};

/**
 * Sitemap index that points to the two per-language sitemaps.
 * Search engines fetch this first and follow into each language file.
 */
const renderIndex = (baseUrl: string, lastmod: string): string => {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for (const lang of ["en", "ar"] as const) {
    lines.push("  <sitemap>");
    lines.push(`    <loc>${escapeXml(`${baseUrl}/sitemap-${lang}.xml`)}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push("  </sitemap>");
  }
  lines.push("</sitemapindex>");
  return lines.join("\n");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);

    // --- Determine which output the caller wants -------------------------------
    // Priority order:
    //   1. ?lang=en|ar  → per-language <urlset>
    //   2. URL path ending in /sitemap-en.xml or /sitemap-ar.xml (when proxied)
    //   3. ?index=1     → explicit sitemap index
    //   4. default      → full combined urlset (back-compat with existing sitemap.xml consumers)
    const langParam = url.searchParams.get("lang");
    const pathLangMatch = url.pathname.match(/sitemap-(en|ar)\.xml$/i);
    const requestedLang: "en" | "ar" | null =
      langParam === "en" || langParam === "ar"
        ? langParam
        : pathLangMatch
          ? (pathLangMatch[1].toLowerCase() as "en" | "ar")
          : null;
    const wantsIndex = url.searchParams.get("index") === "1" || url.pathname.endsWith("/sitemap-index.xml");

    const { data: cfg } = await supabase
      .from("site_content")
      .select("value")
      .eq("page", "seo")
      .eq("section", "global")
      .eq("content_key", "site_url")
      .maybeSingle();

    const baseUrl = (cfg?.value?.trim() || `${url.protocol}//${url.host}`).replace(/\/$/, "");

    const [
      { data: navItems },
      { data: posts },
      { data: customIndustries },
      { data: features },
      { data: customPages },
    ] = await Promise.all([
      supabase
        .from("nav_items")
        .select("id, parent_id, target_type, target_route, custom_page_id, external_url, published, updated_at, sort_order")
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("blog_posts")
        .select("slug, updated_at, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false }),
      supabase
        .from("site_content")
        .select("content_key, value, updated_at")
        .eq("page", "industries")
        .eq("section", "registry")
        .eq("content_type", "industry_card"),
      supabase
        .from("features")
        .select("id, slug, updated_at, published")
        .eq("published", true),
      supabase
        .from("custom_pages")
        .select("id, slug, updated_at, status")
        .eq("status", "published"),
    ]);

    const pagesById = new Map((customPages ?? []).map((page) => [page.id, page as CustomPageRow]));
    const today = fmtDate(new Date());
    const entries = new Map<string, SitemapEntry>();
    const navPaths = new Set<string>();

    // --- Always include the core SEO landing pages requested by the user ------
    // (home, product, industries, pricing, contact). These are seeded first so
    // they're guaranteed to appear even if the CMS nav is empty.
    for (const path of ["/", "/product", "/industries", "/pricing", "/contact"]) {
      const meta = STATIC_ROUTE_META[path] ?? DEFAULT_ROUTE_META;
      addEntry(entries, {
        path,
        lastmod: today,
        changefreq: meta.changefreq,
        priority: meta.priority,
        hreflang: meta.hreflang,
      });
      navPaths.add(path);
    }

    for (const item of (navItems ?? []) as NavItemRow[]) {
      const path = navItemPath(item, pagesById);
      if (!path) continue;
      navPaths.add(path);
      const meta = STATIC_ROUTE_META[path] ?? DEFAULT_ROUTE_META;
      addEntry(entries, {
        path,
        lastmod: item.updated_at ? fmtDate(item.updated_at) : today,
        changefreq: meta.changefreq,
        priority: meta.priority,
        hreflang: meta.hreflang,
      });
    }

    // Also seed the remaining static routes (blog/privacy/terms/etc.) so the
    // sitemap is complete even before the CMS nav is configured.
    for (const [path, meta] of Object.entries(STATIC_ROUTE_META)) {
      if (entries.has(path)) continue;
      addEntry(entries, {
        path,
        lastmod: today,
        changefreq: meta.changefreq,
        priority: meta.priority,
        hreflang: meta.hreflang,
      });
      navPaths.add(path);
    }

    const publishedCustomSlugs = ((customIndustries ?? []) as SiteContentRow[])
      .filter((row) => {
        try {
          const parsed = JSON.parse(row.value || "{}");
          return parsed?.published === true;
        } catch {
          return false;
        }
      })
      .map((row) => ({ slug: row.content_key, updated_at: row.updated_at }));

    const allIndustryRows = Array.from(
      new Map(
        [
          ...INDUSTRY_SLUGS.map((slug) => [slug, { slug, updated_at: today }]),
          ...publishedCustomSlugs.map((row) => [row.slug, row]),
        ],
      ).values(),
    );

    if (navPaths.has("/industries")) {
      for (const industry of allIndustryRows) {
        addEntry(entries, {
          path: `/industries/${industry.slug}`,
          lastmod: industry.updated_at ? fmtDate(industry.updated_at) : today,
          changefreq: "monthly",
          priority: 0.8,
          hreflang: true,
        });
      }
    }

    if (navPaths.has("/features")) {
      for (const feature of (features ?? []) as FeatureRow[]) {
        addEntry(entries, {
          path: `/features/${feature.slug}`,
          lastmod: feature.updated_at ? fmtDate(feature.updated_at) : today,
          changefreq: "monthly",
          priority: 0.7,
          hreflang: true,
        });
      }
    }

    for (const post of (posts ?? []) as BlogPostRow[]) {
      addEntry(entries, {
        path: `/blog/${post.slug}`,
        lastmod: fmtDate(post.updated_at || post.published_at || today),
        changefreq: "monthly",
        priority: 0.6,
        hreflang: true,
      });
    }

    for (const page of (customPages ?? []) as CustomPageRow[]) {
      const path = `/${page.slug}`;
      if (!entries.has(path)) {
        addEntry(entries, {
          path,
          lastmod: page.updated_at ? fmtDate(page.updated_at) : today,
          changefreq: "monthly",
          priority: 0.6,
          hreflang: true,
        });
      }
    }

    const sortedEntries = [...entries.values()].sort((a, b) => a.path.localeCompare(b.path));

    // --- Sitemap index --------------------------------------------------------
    if (wantsIndex) {
      const lastmod = sortedEntries.reduce((acc, e) => (e.lastmod > acc ? e.lastmod : acc), today);
      const xml = renderIndex(baseUrl, lastmod);
      return new Response(xml, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    // --- Per-language urlset --------------------------------------------------
    if (requestedLang) {
      // Arabic sitemap should only list entries that actually have an Arabic
      // counterpart (i.e. hreflang=true). English sitemap lists everything.
      const filtered = requestedLang === "ar"
        ? sortedEntries.filter((e) => e.hreflang)
        : sortedEntries;
      const xml = renderUrlset(baseUrl, filtered, requestedLang);
      return new Response(xml, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    // --- Default: combined English urlset (back-compat) -----------------------
    const xml = renderUrlset(baseUrl, sortedEntries, "en");
    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(`<!-- sitemap error: ${escapeXml(message)} -->`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
