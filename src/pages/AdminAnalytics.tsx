import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, MousePointerClick, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface CtaRow {
  label: string;
  destination: string;
  source: string;
  clicks: number;
}

interface StatsResponse {
  rows: CtaRow[];
  range: string;
  property: string;
  error?: string;
  detail?: string;
  hint?: string;
}

const AdminAnalytics = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  const { data, isLoading, isFetching, error, refetch } = useQuery<StatsResponse>({
    queryKey: ["ga4-cta-stats"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ga4-cta-stats");
      if (error) throw error;
      return data as StatsResponse;
    },
  });

  const totalClicks = data?.rows?.reduce((sum, r) => sum + r.clicks, 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin" aria-label="Back to admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MousePointerClick className="h-6 w-6 text-primary" />
                CTA Performance
              </h1>
              <p className="text-sm text-muted-foreground">
                Top button clicks from Google Analytics 4 — last 30 days
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats summary */}
        {data?.rows && data.rows.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Total tracked clicks</div>
              <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Unique CTAs</div>
              <div className="text-2xl font-bold">{data.rows.length}</div>
            </div>
          </div>
        )}

        {/* Error states */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Couldn't load analytics</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Unknown error"}
            </AlertDescription>
          </Alert>
        )}
        {data?.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{data.error}</AlertTitle>
            <AlertDescription className="space-y-1">
              {data.detail && <p>{data.detail}</p>}
              {data.hint && <p className="text-xs opacity-90">{data.hint}</p>}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && data?.rows && data.rows.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-muted/30">
            <MousePointerClick className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">No CTA clicks yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Once visitors start clicking buttons, they'll show up here.
            </p>
          </div>
        )}

        {/* Results table */}
        {!isLoading && data?.rows && data.rows.length > 0 && (
          <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Button label</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((row, i) => (
                  <TableRow key={`${row.label}-${row.destination}-${i}`}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {row.destination.startsWith("http") ? (
                        <a
                          href={row.destination}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {row.destination}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">{row.destination}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.source !== "(not set)" && (
                        <Badge variant="secondary" className="font-mono text-xs">
                          {row.source}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {row.clicks.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          Data refreshes from GA4 each time you load this page. GA4 may take up to 24h to
          process new events.
        </p>
      </div>
    </div>
  );
};

export default AdminAnalytics;
