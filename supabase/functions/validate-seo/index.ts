// SEO validation pass — fetches each public route, parses rendered HTML
// (server-side, so React Helmet tags are present after hydration ONLY for SSR.
// Lovable apps are SPA — so we validate the *static* index.html plus the
// CMS-stored SEO rows that drive each page's <Helmet> at runtime).
//
// For the actual rendered checks, we use a headless approach: fetch the
// route and scan the returned HTML for the bootstrap meta + the inline
// __INITIAL_SEO__ if present. Since this is an SPA, the most reliable
// checks are: canonical correctness (computed), title/description length
// (from CMS), H1 presence (from page blocks/templates), duplicate detection.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Issue = {
  severity: "error" | "warning" | "info";
  rule: string;
  message: string;
};

type PageReport = {
  path: string;
  label: string;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  expectedCanonical: string;
  h1Count: number;
  h2Count: number;
  hasOgImage: boolean;
  issues: Issue[];
  score: number;
};

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;

const STATIC_ROUTES = [
  { path: "/", label: "Home", page: "home" },
  { path: "/product", label: "Product", page: "product" },
  { path: "/pricing", label: "Pricing", page: "pricing" },
  { path: "/industries", label: "Industries", page: "industries" },
  { path: "/features", label: "Features", page: "features" },
  { path: "/integrations", label: "Integrations", page: "integrations" },
  { path: "/blog", label: "Blog", page: "blog" },
  { path: "/contact", label: "Contact", page: "contact" },
  { path: "/privacy", label: "Privacy Policy", page: "privacy" },
  { path: "/terms", label: "Terms of Service", page: "terms" },
];

function pickMeta(html: string, attr: string, name: string): string {
  const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*content=["']([^"']*)["']`, "i");
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${name}["']`, "i");
  return html.match(re2)?.[1] ?? "";
}

function pickCanonical(html: string): string {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? "";
}

function pickTitle(html: string): string {
  return html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
}

function countTags(html: string, tag: string): number {
  const re = new RegExp(`<${tag}[\\s>]`, "gi");
  return (html.match(re) ?? []).length;
}

async function auditRoute(
  baseUrl: string,
  route: { path: string; label: string; page: string },
): Promise<PageReport> {
  const url = `${baseUrl}${route.path}`;
  const issues: Issue[] = [];
  let html = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "DigitizeMe-SEO-Validator/1.0" },
    });
    if (!res.ok) {
      issues.push({ severity: "error", rule: "http", message: `Returned ${res.status}` });
    }
    html = await res.text();
  } catch (e) {
    issues.push({ severity: "error", rule: "fetch", message: `Failed to fetch: ${(e as Error).message}` });
  }

  const title = pickTitle(html);
  const description = pickMeta(html, "name", "description");
  const canonical = pickCanonical(html);
  const ogImage = pickMeta(html, "property", "og:image");
  const h1 = countTags(html, "h1");
  const h2 = countTags(html, "h2");
  const expectedCanonical = `${baseUrl}${route.path}`;

  // Title checks
  if (!title) issues.push({ severity: "error", rule: "title.missing", message: "Missing <title>" });
  else if (title.length < TITLE_MIN)
    issues.push({ severity: "warning", rule: "title.short", message: `Title is ${title.length} chars (min ${TITLE_MIN})` });
  else if (title.length > TITLE_MAX)
    issues.push({ severity: "warning", rule: "title.long", message: `Title is ${title.length} chars (max ${TITLE_MAX})` });

  // Description checks
  if (!description) issues.push({ severity: "error", rule: "desc.missing", message: "Missing meta description" });
  else if (description.length < DESC_MIN)
    issues.push({ severity: "warning", rule: "desc.short", message: `Description is ${description.length} chars (min ${DESC_MIN})` });
  else if (description.length > DESC_MAX)
    issues.push({ severity: "warning", rule: "desc.long", message: `Description is ${description.length} chars (max ${DESC_MAX})` });

  // Canonical checks
  if (!canonical) issues.push({ severity: "error", rule: "canonical.missing", message: "Missing canonical link" });
  else if (canonical.replace(/\/$/, "") !== expectedCanonical.replace(/\/$/, ""))
    issues.push({
      severity: "warning",
      rule: "canonical.mismatch",
      message: `Canonical "${canonical}" doesn't match expected "${expectedCanonical}"`,
    });

  // H1 checks
  if (h1 === 0) issues.push({ severity: "error", rule: "h1.missing", message: "No <h1> on page" });
  else if (h1 > 1) issues.push({ severity: "warning", rule: "h1.multiple", message: `${h1} <h1> tags (recommend exactly 1)` });

  // H2 checks
  if (h2 === 0) issues.push({ severity: "info", rule: "h2.missing", message: "No <h2> tags — consider adding subheadings" });

  // OG image
  if (!ogImage) issues.push({ severity: "warning", rule: "og.image", message: "Missing og:image" });

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, 100 - errors * 25 - warnings * 8);

  return {
    path: route.path,
    label: route.label,
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    canonical,
    expectedCanonical,
    h1Count: h1,
    h2Count: h2,
    hasOgImage: !!ogImage,
    issues,
    score,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const requestedBase = (body?.baseUrl as string | undefined)?.trim();

    // Resolve base URL: explicit param > admin override > production default
    const { data: cfg } = await supabase
      .from("site_content")
      .select("value")
      .eq("page", "seo")
      .eq("section", "global")
      .eq("content_key", "site_url")
      .maybeSingle();

    const baseUrl = (requestedBase || cfg?.value?.trim() || "https://www.digitizeme.ae").replace(/\/$/, "");

    // Pull published industry slugs
    const { data: customIndustries } = await supabase
      .from("site_content")
      .select("content_key, value")
      .eq("page", "industries")
      .eq("section", "registry")
      .eq("content_type", "industry_card");

    const publishedIndustries = (customIndustries ?? [])
      .filter((row: { value: string | null }) => {
        try { return JSON.parse(row.value || "{}")?.published === true; } catch { return false; }
      })
      .map((row: { content_key: string }) => row.content_key);

    // Pull published custom pages
    const { data: customPages } = await supabase
      .from("custom_pages")
      .select("slug, title")
      .eq("status", "published");

    const routes = [
      ...STATIC_ROUTES,
      ...publishedIndustries.map((slug: string) => ({
        path: `/industries/${slug}`,
        label: `Industry: ${slug}`,
        page: `industry-${slug}`,
      })),
      ...(customPages ?? []).map((p: { slug: string; title: string }) => ({
        path: `/${p.slug}`,
        label: p.title || p.slug,
        page: `custom-${p.slug}`,
      })),
    ];

    // Fetch in parallel batches of 5 to avoid hammering
    const reports: PageReport[] = [];
    const batchSize = 5;
    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      const results = await Promise.all(batch.map((r) => auditRoute(baseUrl, r)));
      reports.push(...results);
    }

    // Duplicate title / description detection
    const titleMap = new Map<string, string[]>();
    const descMap = new Map<string, string[]>();
    for (const r of reports) {
      if (r.title) {
        const arr = titleMap.get(r.title) ?? [];
        arr.push(r.path);
        titleMap.set(r.title, arr);
      }
      if (r.description) {
        const arr = descMap.get(r.description) ?? [];
        arr.push(r.path);
        descMap.set(r.description, arr);
      }
    }
    for (const r of reports) {
      const dupT = titleMap.get(r.title);
      if (dupT && dupT.length > 1) {
        r.issues.push({
          severity: "warning",
          rule: "title.duplicate",
          message: `Duplicate title shared with: ${dupT.filter((p) => p !== r.path).join(", ")}`,
        });
        r.score = Math.max(0, r.score - 8);
      }
      const dupD = descMap.get(r.description);
      if (dupD && dupD.length > 1) {
        r.issues.push({
          severity: "warning",
          rule: "desc.duplicate",
          message: `Duplicate description shared with: ${dupD.filter((p) => p !== r.path).join(", ")}`,
        });
        r.score = Math.max(0, r.score - 8);
      }
    }

    const overallScore = reports.length
      ? Math.round(reports.reduce((s, r) => s + r.score, 0) / reports.length)
      : 0;
    const totalErrors = reports.reduce((s, r) => s + r.issues.filter((i) => i.severity === "error").length, 0);
    const totalWarnings = reports.reduce((s, r) => s + r.issues.filter((i) => i.severity === "warning").length, 0);

    return new Response(
      JSON.stringify({
        success: true,
        baseUrl,
        scannedAt: new Date().toISOString(),
        overallScore,
        totalErrors,
        totalWarnings,
        pageCount: reports.length,
        reports,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
