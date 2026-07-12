import { AlertCircle, CheckCircle2, Languages, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SitemapUrlIssue = {
  issueType: "not_found" | "redirect_loop" | "too_many_redirects" | "network_error" | "http_error";
  message: string | null;
  path: string;
  redirectChain: string[];
  statusCode: number | null;
};

type SitemapIndustryHealthPanelProps = {
  arabicChecked: number;
  arabicIssues: SitemapUrlIssue[];
  englishChecked: number;
  englishIssues: SitemapUrlIssue[];
  isChecking: boolean;
};

const ISSUE_LABELS: Record<SitemapUrlIssue["issueType"], string> = {
  not_found: "404",
  redirect_loop: "Redirect loop",
  too_many_redirects: "Too many redirects",
  network_error: "Network error",
  http_error: "HTTP error",
};

const LanguageColumn = ({
  checked,
  issues,
  label,
}: {
  checked: number;
  issues: SitemapUrlIssue[];
  label: string;
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg">{label}</CardTitle>
          <CardDescription>
            Checked {checked} sitemap URLs · {issues.length} flagged
          </CardDescription>
        </div>
        <Badge variant={issues.length ? "destructive" : "secondary"}>
          {issues.length ? `${issues.length} issues` : "Clean"}
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      {issues.length === 0 ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          No 404s or redirect loop issues found.
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={`${label}-${issue.path}-${issue.issueType}`} className="rounded-md border p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-mono text-sm break-all text-foreground">{issue.path}</div>
                  <div className="text-xs text-muted-foreground">
                    {issue.statusCode ? `HTTP ${issue.statusCode}` : issue.message || "Issue detected"}
                  </div>
                </div>
                <Badge variant="destructive">{ISSUE_LABELS[issue.issueType]}</Badge>
              </div>

              {issue.message && <div className="text-sm text-muted-foreground">{issue.message}</div>}

              {issue.redirectChain.length > 1 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Redirect chain
                  </div>
                  <ol className="space-y-1 text-xs text-foreground font-mono">
                    {issue.redirectChain.map((step, index) => (
                      <li key={`${issue.path}-${step}-${index}`} className="break-all">
                        {index + 1}. {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const SitemapIndustryHealthPanel = ({
  arabicChecked,
  arabicIssues,
  englishChecked,
  englishIssues,
  isChecking,
}: SitemapIndustryHealthPanelProps) => {
  const totalFlagged = englishIssues.length + arabicIssues.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              Industry URL health
            </CardTitle>
            <CardDescription>
              Flags sitemap industry URLs that resolve to 404s, redirect loops, or transport failures.
            </CardDescription>
          </div>

          <Badge variant={totalFlagged ? "destructive" : "secondary"} className="gap-1">
            {isChecking ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <AlertCircle className="h-3.5 w-3.5" />}
            {isChecking ? "Checking URLs" : `${totalFlagged} flagged`}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 lg:grid-cols-2">
        <LanguageColumn label="English" checked={englishChecked} issues={englishIssues} />
        <LanguageColumn label="Arabic" checked={arabicChecked} issues={arabicIssues} />
      </CardContent>
    </Card>
  );
};

export default SitemapIndustryHealthPanel;