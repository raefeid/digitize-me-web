// Build-time sitemap + robots generator.
//
// Replaces the previously hand-maintained (and wrong-domain) static files with a
// correct, comprehensive set derived from the app's real routes. Runs as part of
// `npm run build`, so lastmod stays fresh and the domain never drifts.
//
// Covers: static marketing pages + all 14 industry detail pages, with hreflang
// alternates for pages that have an Arabic (/ar) counterpart. Individual blog and
// feature-detail pages are DB-driven and are intentionally not enumerated here.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");
const ORIGIN = "https://www.digitizeme.ae";
const today = new Date().toISOString().slice(0, 10);

// Industry slugs, read from source so the sitemap stays in sync automatically.
const industriesSrc = readFileSync(resolve(__dirname, "../src/data/industries.ts"), "utf8");
const industrySlugs = [...industriesSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

// Pages that have an Arabic (/ar) counterpart in the router.
const localized = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/product", priority: "0.9", changefreq: "monthly" },
  { path: "/industries", priority: "0.9", changefreq: "monthly" },
  ...industrySlugs.map((s) => ({ path: `/industries/${s}`, priority: "0.8", changefreq: "monthly" })),
  { path: "/pricing", priority: "0.9", changefreq: "monthly" },
  { path: "/contact", priority: "0.7", changefreq: "monthly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
];

// English-only pages (no /ar route).
const enOnly = [
  { path: "/features", priority: "0.8", changefreq: "monthly" },
  { path: "/blog", priority: "0.7", changefreq: "weekly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
];

const arPath = (p) => (p === "/" ? "/ar" : `/ar${p}`);

const alternates = (enUrl, arUrl) =>
  [
    `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />`,
    `    <xhtml:link rel="alternate" hreflang="ar" href="${arUrl}" />`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />`,
  ].join("\n");

const urlEntry = ({ loc, priority, changefreq, links }) =>
  [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    links,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

const urlset = (entries) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;

// English sitemap: localized pages (with alternates) + English-only pages.
const enEntries = [
  ...localized.map((p) =>
    urlEntry({
      loc: `${ORIGIN}${p.path}`,
      priority: p.priority,
      changefreq: p.changefreq,
      links: alternates(`${ORIGIN}${p.path}`, `${ORIGIN}${arPath(p.path)}`),
    }),
  ),
  ...enOnly.map((p) =>
    urlEntry({ loc: `${ORIGIN}${p.path}`, priority: p.priority, changefreq: p.changefreq, links: "" }),
  ),
];

// Arabic sitemap: the localized pages only.
const arEntries = localized.map((p) =>
  urlEntry({
    loc: `${ORIGIN}${arPath(p.path)}`,
    priority: p.priority,
    changefreq: p.changefreq,
    links: alternates(`${ORIGIN}${p.path}`, `${ORIGIN}${arPath(p.path)}`),
  }),
);

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${ORIGIN}/sitemap-en.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${ORIGIN}/sitemap-ar.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

Sitemap: ${ORIGIN}/sitemap.xml
`;

writeFileSync(resolve(publicDir, "sitemap-en.xml"), urlset(enEntries));
writeFileSync(resolve(publicDir, "sitemap-ar.xml"), urlset(arEntries));
// /sitemap.xml is the conventional entry point; make it the index so crawlers
// probing that path get a valid index rather than a stale urlset.
writeFileSync(resolve(publicDir, "sitemap.xml"), sitemapIndex);
writeFileSync(resolve(publicDir, "sitemap-index.xml"), sitemapIndex);
writeFileSync(resolve(publicDir, "robots.txt"), robots);

console.log(
  `sitemap: ${enEntries.length} EN + ${arEntries.length} AR URLs (${industrySlugs.length} industries), domain ${ORIGIN}, lastmod ${today}`,
);
