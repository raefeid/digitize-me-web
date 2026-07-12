import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, AlertTriangle, XCircle, Info, Play, Loader2, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Issue = { severity: "error" | "warning" | "info"; rule: string; message: string };
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
type ValidationResult = {
  success: boolean;
  baseUrl: string;
  scannedAt: string;
  overallScore: number;
  totalErrors: number;
  totalWarnings: number;
  pageCount: number;
  reports: PageReport[];
  error?: string;
};

const grade = (score: number) => {
  if (score >= 90) return { label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-500" };
  if (score >= 75) return { label: "Good", color: "text-accent", bg: "bg-accent" };
  if (score >= 50) return { label: "Needs work", color: "text-amber-500", bg: "bg-amber-500" };
  return { label: "Critical", color: "text-destructive", bg: "bg-destructive" };
};

const SeverityIcon = ({ s }: { s: Issue["severity"] }) => {
  if (s === "error") return <XCircle size={14} className="text-destructive shrink-0" />;
  if (s === "warning") return <AlertTriangle size={14} className="text-amber-500 shrink-0" />;
  return <Info size={14} className="text-muted-foreground shrink-0" />;
};

const SeoValidationPanel = () => {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState("https://www.digitizeme.ae");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("validate-seo", {
        body: { baseUrl: baseUrl.trim() || undefined },
      });
      if (error) throw error;
      return data as ValidationResult;
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast({ title: "Validation failed", description: data.error, variant: "destructive" });
        return;
      }
      setResult(data);
      toast({
        title: "Scan complete",
        description: `${data.pageCount} pages scored ${data.overallScore}/100 — ${data.totalErrors} errors, ${data.totalWarnings} warnings.`,
      });
    },
    onError: (e: Error) => toast({ title: "Scan failed", description: e.message, variant: "destructive" }),
  });

  const toggle = (path: string) => setExpanded((p) => ({ ...p, [path]: !p[path] }));

  const overall = result ? grade(result.overallScore) : null;

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-base font-semibold text-foreground mb-1">Live SEO validation pass</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Fetches every published page from the URL below, parses the rendered HTML, and validates titles,
          descriptions, canonicals, H1/H2 structure, OG images, and duplicates.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://www.digitizeme.ae"
            className="flex-1"
          />
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-2">
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            {mutation.isPending ? "Scanning…" : "Run validation"}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Tip: scan the production domain to catch issues before publishing. Use the preview URL to test draft changes.
        </p>
      </div>

      {result && overall && (
        <>
          <div className="bg-gradient-to-br from-card to-muted/30 border border-border rounded-xl p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Overall live SEO score</div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${overall.color}`}>{result.overallScore}</span>
                  <span className="text-lg text-muted-foreground">/ 100</span>
                  <span className={`ml-2 text-sm font-medium ${overall.color}`}>{overall.label}</span>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{result.totalErrors}</div>
                  <div className="text-muted-foreground">errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-500">{result.totalWarnings}</div>
                  <div className="text-muted-foreground">warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{result.pageCount}</div>
                  <div className="text-muted-foreground">pages</div>
                </div>
              </div>
            </div>
            <Progress value={result.overallScore} className="mt-4 h-2" />
            <p className="text-[11px] text-muted-foreground mt-3">
              Scanned <span className="font-mono">{result.baseUrl}</span> at {new Date(result.scannedAt).toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Per-page results</h4>
            {result.reports
              .slice()
              .sort((a, b) => a.score - b.score)
              .map((r) => {
                const g = grade(r.score);
                const isOpen = expanded[r.path];
                const errCount = r.issues.filter((i) => i.severity === "error").length;
                const warnCount = r.issues.filter((i) => i.severity === "warning").length;
                return (
                  <div key={r.path} className="bg-card border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggle(r.path)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
                    >
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">{r.label}</span>
                          <span className="text-xs text-muted-foreground font-mono truncate">{r.path}</span>
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${g.bg}`} style={{ width: `${r.score}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {errCount > 0 && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">{errCount}E</Badge>}
                        {warnCount > 0 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-600 border-amber-500/30">{warnCount}W</Badge>}
                        {errCount === 0 && warnCount === 0 && <CheckCircle2 size={16} className="text-emerald-500" />}
                        <span className={`text-base font-bold ${g.color} w-10 text-right`}>{r.score}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-3 pb-3 border-t border-border bg-muted/10 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-xs">
                          <div className="space-y-1">
                            <div className="text-muted-foreground">Title <span className="font-mono">({r.titleLength})</span></div>
                            <div className="font-mono text-foreground bg-card border border-border rounded p-2 break-words">
                              {r.title || <span className="text-destructive italic">(empty)</span>}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground">Description <span className="font-mono">({r.descriptionLength})</span></div>
                            <div className="font-mono text-foreground bg-card border border-border rounded p-2 break-words">
                              {r.description || <span className="text-destructive italic">(empty)</span>}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground">Canonical</div>
                            <div className="font-mono text-foreground bg-card border border-border rounded p-2 break-all flex items-center gap-2">
                              <span className="flex-1">{r.canonical || <span className="text-destructive italic">(missing)</span>}</span>
                              {r.canonical && <a href={r.canonical} target="_blank" rel="noreferrer"><ExternalLink size={12} /></a>}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-muted-foreground">Headings & social</div>
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline" className={r.h1Count === 1 ? "" : "border-destructive text-destructive"}>
                                H1: {r.h1Count}
                              </Badge>
                              <Badge variant="outline" className={r.h2Count > 0 ? "" : "border-amber-500 text-amber-600"}>
                                H2: {r.h2Count}
                              </Badge>
                              <Badge variant="outline" className={r.hasOgImage ? "" : "border-amber-500 text-amber-600"}>
                                {r.hasOgImage ? "OG image ✓" : "No OG image"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {r.issues.length > 0 ? (
                          <div className="space-y-1.5">
                            {r.issues.map((iss, idx) => (
                              <div
                                key={`${iss.rule}-${idx}`}
                                className="flex items-start gap-2 text-xs bg-card border border-border/50 rounded p-2"
                              >
                                <SeverityIcon s={iss.severity} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-foreground">{iss.message}</div>
                                  <div className="text-[10px] text-muted-foreground font-mono">{iss.rule}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-emerald-600">
                            <CheckCircle2 size={14} /> No issues — page is publish-ready.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default SeoValidationPanel;
