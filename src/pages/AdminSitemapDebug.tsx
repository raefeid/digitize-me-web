import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, RefreshCw, SearchCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SitemapXmlPanel from "@/components/admin/SitemapXmlPanel";
import SitemapIndustryHealthPanel from "@/components/admin/SitemapIndustryHealthPanel";

type SitemapDebugResult = {
  arabicIssues: SitemapUrlIssue[];
  arabicPaths: string[];
  contentType: string | null;
  englishIssues: SitemapUrlIssue[];
  englishPaths: string[];
  fetchedAt: string;
  isValidXml: boolean;
  parseError: string | null;
  rawXml: string;
  rootTag: string | null;
  totalUrlNodes: number;
  englishIndustryUrls: number;
  arabicIndustryUrls: number;
  sampleEnglish: string[];
  sampleArabic: string[];
};

type SitemapUrlIssue = {
  issueType: "not_found" | "redirect_loop" | "too_many_redirects" | "network_error" | "http_error";
  message: string | null;
  path: string;
  redirectChain: string[];
  statusCode: number | null;
};

const INDUSTRY_PATH_RE = /^\/industries\/[^/]+\/?$/;
const INDUSTRY_PATH_AR_RE = /^\/ar\/industries\/[^/]+\/?$/;
const MAX_REDIRECT_HOPS = 6;

const normalizePath = (value: string) => new URL(value, window.location.origin).pathname;

const inspectIndustryUrl = async (path: string): Promise<SitemapUrlIssue | null> => {
  let currentUrl = new URL(path, window.location.origin).toString();
  const visited = new Set<string>();
  const redirectChain: string[] = [];

  for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop += 1) {
    if (visited.has(currentUrl)) {
      return {
        issueType: "redirect_loop",
        message: "This URL redirects back to an earlier step in the chain.",
        path,
        redirectChain: [...redirectChain, normalizePath(currentUrl)],
        statusCode: null,
      };
    }

    visited.add(currentUrl);
    redirectChain.push(normalizePath(currentUrl));

    try {
      const response = await fetch(currentUrl, {
        cache: "no-store",
        headers: { Accept: "text/html,application/xhtml+xml" },
        redirect: "manual",
      });

      if (response.type === "opaqueredirect" || (response.status >= 300 && response.status < 400)) {
        const location = response.headers.get("location");
        if (!location) {
          return {
            issueType: "http_error",
            message: "Redirect response did not include a Location header.",
            path,
            redirectChain,
            statusCode: response.status || null,
          };
        }

        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      if (response.status === 404) {
        return {
          issueType: "not_found",
          message: "The sitemap URL returned 404.",
          path,
          redirectChain,
          statusCode: 404,
        };
      }

      if (!response.ok) {
        return {
          issueType: "http_error",
          message: `The URL returned HTTP ${response.status}.`,
          path,
          redirectChain,
          statusCode: response.status,
        };
      }

      return null;
    } catch (error) {
      return {
        issueType: "network_error",
        message: error instanceof Error ? error.message : "Request failed.",
        path,
        redirectChain,
        statusCode: null,
      };
    }
  }

  return {
    issueType: "too_many_redirects",
    message: `Exceeded ${MAX_REDIRECT_HOPS} redirect hops without reaching a final page.`,
    path,
    redirectChain,
    statusCode: null,
  };
};

const collectIndustryCounts = (doc: XMLDocument) => {
  const english = new Set<string>();
  const arabic = new Set<string>();

  const urlNodes = Array.from(doc.getElementsByTagName("url"));

  for (const urlNode of urlNodes) {
    const loc = urlNode.getElementsByTagName("loc")[0]?.textContent?.trim();
    if (loc) {
      const pathname = new URL(loc).pathname;
      if (INDUSTRY_PATH_RE.test(pathname)) english.add(pathname);
      if (INDUSTRY_PATH_AR_RE.test(pathname)) arabic.add(pathname);
    }

    // Collect xhtml:link alternates. Browsers can be inconsistent with namespace
    // lookups when the prefix is declared on the root <urlset>, so try both the
    // namespaced and the qualified-name forms and de-dupe.
    const nsLinks = Array.from(urlNode.getElementsByTagNameNS("http://www.w3.org/1999/xhtml", "link"));
    const prefixedLinks = Array.from(urlNode.getElementsByTagName("xhtml:link"));
    const wildcardLinks = Array.from(urlNode.getElementsByTagNameNS("*", "link"));
    const linkNodes = Array.from(new Set<Element>([...nsLinks, ...prefixedLinks, ...wildcardLinks]));
    for (const linkNode of linkNodes) {
      const href = linkNode.getAttribute("href")?.trim();
      const hreflang = linkNode.getAttribute("hreflang")?.trim();
      if (!href || !hreflang) continue;
      const pathname = new URL(href).pathname;
      if (hreflang === "en" && INDUSTRY_PATH_RE.test(pathname)) english.add(pathname);
      if (hreflang === "ar" && INDUSTRY_PATH_AR_RE.test(pathname)) arabic.add(pathname);
    }
  }

  return {
    totalUrlNodes: urlNodes.length,
    englishIndustryUrls: english.size,
    arabicIndustryUrls: arabic.size,
    englishPaths: Array.from(english).sort(),
    arabicPaths: Array.from(arabic).sort(),
    sampleEnglish: Array.from(english).sort().slice(0, 5),
    sampleArabic: Array.from(arabic).sort().slice(0, 5),
  };
};

const AdminSitemapDebug = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const { data, isLoading, isFetching, error, refetch } = useQuery<SitemapDebugResult>({
    queryKey: ["admin-sitemap-debug"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const response = await fetch("/sitemap.xml", {
        headers: { Accept: "application/xml,text/xml" },
        cache: "no-store",
      });

      const xmlText = await response.text();
      const doc = new DOMParser().parseFromString(xmlText, "application/xml");
      const parserError = doc.querySelector("parsererror");
      const parseError = parserError?.textContent?.trim() || null;
      const contentType = response.headers.get("content-type");
      const rootTag = doc.documentElement?.tagName || null;
      const counts = parseError
        ? {
            arabicPaths: [],
            totalUrlNodes: 0,
            englishPaths: [],
            englishIndustryUrls: 0,
            arabicIndustryUrls: 0,
            sampleEnglish: [],
            sampleArabic: [],
          }
        : collectIndustryCounts(doc);

      const [englishIssues, arabicIssues] = parseError
        ? [[], []]
        : await Promise.all([
            Promise.all(counts.englishPaths.map((path) => inspectIndustryUrl(path))),
            Promise.all(counts.arabicPaths.map((path) => inspectIndustryUrl(path))),
          ]);

      return {
        arabicIssues: arabicIssues.filter((issue): issue is SitemapUrlIssue => issue !== null),
        arabicPaths: counts.arabicPaths,
        contentType,
        englishIssues: englishIssues.filter((issue): issue is SitemapUrlIssue => issue !== null),
        englishPaths: counts.englishPaths,
        fetchedAt: new Date().toISOString(),
        isValidXml: response.ok && !parseError && rootTag === "urlset",
        parseError,
        rawXml: xmlText,
        rootTag,
        ...counts,
      };
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin" aria-label="Back to admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <SearchCheck className="h-6 w-6 text-primary" />
                Sitemap Debug
              </h1>
              <p className="text-sm text-muted-foreground">
                Fetches <code>/sitemap.xml</code>, validates XML parsing, and counts industry URLs by language.
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Couldn&apos;t load sitemap</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Unknown error"}
            </AlertDescription>
          </Alert>
        )}

        {data?.parseError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>XML parse error</AlertTitle>
            <AlertDescription>{data.parseError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>XML status</CardDescription>
              <CardTitle className="text-lg">
                <Badge variant={data?.isValidXml ? "default" : "destructive"}>
                  {data?.isValidXml ? "Valid" : isLoading ? "Checking" : "Invalid"}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Root tag</CardDescription>
              <CardTitle className="text-lg">{data?.rootTag ?? "—"}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Industry URLs (EN)</CardDescription>
              <CardTitle>{data?.englishIndustryUrls ?? 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Industry URLs (AR)</CardDescription>
              <CardTitle>{data?.arabicIndustryUrls ?? 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
            <CardDescription>
              {data?.fetchedAt ? `Last checked ${new Date(data.fetchedAt).toLocaleString()}` : "Waiting for sitemap response"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-background p-4">
              <div className="text-sm text-muted-foreground mb-2">Total &lt;url&gt; entries</div>
              <div className="text-2xl font-bold text-foreground">{data?.totalUrlNodes ?? 0}</div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <div className="text-sm text-muted-foreground mb-2">Industry coverage check</div>
              <div className="text-sm text-foreground">
                EN: {data?.englishIndustryUrls ?? 0} · AR: {data?.arabicIndustryUrls ?? 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <SitemapXmlPanel
          contentType={data?.contentType ?? null}
          fetchedAt={data?.fetchedAt ?? null}
          rawXml={data?.rawXml ?? ""}
        />

        <SitemapIndustryHealthPanel
          arabicChecked={data?.arabicPaths.length ?? 0}
          arabicIssues={data?.arabicIssues ?? []}
          englishChecked={data?.englishPaths.length ?? 0}
          englishIssues={data?.englishIssues ?? []}
          isChecking={isFetching}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">English industry URLs</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(data?.sampleEnglish ?? []).map((url) => (
                  <li key={url} className="font-mono break-all text-foreground">{url}</li>
                ))}
                {!isLoading && (data?.sampleEnglish?.length ?? 0) === 0 && <li>None found.</li>}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Arabic industry URLs</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(data?.sampleArabic ?? []).map((url) => (
                  <li key={url} className="font-mono break-all text-foreground">{url}</li>
                ))}
                {!isLoading && (data?.sampleArabic?.length ?? 0) === 0 && <li>None found.</li>}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSitemapDebug;