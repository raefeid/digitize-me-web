import fs from "node:fs";
import path from "node:path";

/**
 * Statically parse src/App.tsx and pull every <Route path="..."> declaration.
 * We treat any route NOT under /admin and NOT containing :params or wildcards
 * as a public, navigable URL.
 *
 * Routes with :slug params are kept and given a deterministic sample slug so
 * we still exercise the dynamic page (CustomPage / IndustryDetail / etc.).
 */
export type DiscoveredRoute = {
  /** URL to navigate to (with sample slug substituted). */
  url: string;
  /** Original route path for labeling. */
  pattern: string;
  /** Inferred locale based on /ar prefix. */
  locale: "en" | "ar";
};

const SAMPLE_SLUGS: Record<string, string> = {
  // Provide deterministic placeholders. Pages should render gracefully (or 404
  // via their own loader) without console errors.
  ":slug": "sample",
};

function substituteParams(routePath: string): string | null {
  if (routePath.includes("*")) return null;
  let out = routePath;
  for (const [param, value] of Object.entries(SAMPLE_SLUGS)) {
    out = out.split(param).join(value);
  }
  // Reject any route that still has an unresolved param.
  if (/:[A-Za-z_]+/.test(out)) return null;
  return out;
}

export function discoverPublicRoutes(appTsxPath?: string): DiscoveredRoute[] {
  const file = appTsxPath ?? path.resolve(process.cwd(), "src/App.tsx");
  const src = fs.readFileSync(file, "utf8");

  // Match <Route path="..."> — quotes can be single or double.
  const re = /<Route\s+path=(?:"([^"]+)"|'([^']+)')/g;
  const seen = new Set<string>();
  const routes: DiscoveredRoute[] = [];

  let match: RegExpExecArray | null;
  while ((match = re.exec(src)) !== null) {
    const pattern = match[1] ?? match[2];
    if (!pattern) continue;

    // Skip catch-all and admin routes.
    if (pattern === "*") continue;
    if (pattern.startsWith("/admin")) continue;

    // Skip the bare /:slug catch-all because it would shadow real assets and
    // collide with sitemap entries; the explicit routes already cover the
    // rendering path.
    if (pattern === "/:slug") continue;

    const url = substituteParams(pattern);
    if (!url) continue;
    if (seen.has(url)) continue;
    seen.add(url);

    routes.push({
      url,
      pattern,
      locale: url.startsWith("/ar") ? "ar" : "en",
    });
  }

  return routes;
}
