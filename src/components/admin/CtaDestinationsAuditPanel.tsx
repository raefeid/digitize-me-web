import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, RefreshCw, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  auditCtaDestination,
  CtaAuditFinding,
  ISSUE_LABELS,
} from "@/lib/auditCtaDestinations";

interface ScannedSource {
  /** Friendly label for the row table. */
  source: string;
  /** Kind ("link", "external", …). For tables that don't store a kind we infer it. */
  kind: string;
  value: string;
}

const inferKindFromValue = (value: string): string => {
  const v = (value ?? "").trim();
  if (!v) return "link";
  if (/^mailto:/i.test(v)) return "email";
  if (/^tel:/i.test(v)) return "phone";
  if (/^https?:/i.test(v)) return "external";
  return "link";
};

/**
 * Loads every CMS-stored CTA / link destination across the site and audits
 * them against the language-routing contract documented in
 * `src/lib/localizedRoutes.ts`.
 *
 * Scanned sources:
 *  - site_content (page=cta_actions)               — all registry CTAs
 *  - site_content (page=cta_styles)                — admin-overridden destinations
 *  - nav_items.target_route / external_url         — navbar & footer links
 *  - nav_auth_buttons.link                         — sign in / sign up buttons
 *  - (removed) integrations table
 *  - features.cta_primary_link / cta_secondary_link
 *  - industry_seo_landing.cta_link
 *  - pricing_highlights.cta_link_override
 *  - client_logos.link_url
 */
const useCtaAuditFindings = () =>
  useQuery({
    queryKey: ["cta-destination-audit"],
    queryFn: async (): Promise<CtaAuditFinding[]> => {
      const sources: ScannedSource[] = [];

      // 1. site_content (cta_actions + cta_styles)
      const { data: contentRows } = await supabase
        .from("site_content")
        .select("page, section, content_key, value")
        .in("page", ["cta_actions", "cta_styles"])
        .in("content_key", ["value", "kind", "destination", "destinationKind"]);

      // Group by (page, section) so we can pair kind + value rows.
      const grouped = new Map<string, { kind?: string; value?: string }>();
      for (const row of contentRows ?? []) {
        const id = `${row.page}::${row.section}`;
        const entry = grouped.get(id) ?? {};
        if (row.content_key === "kind" || row.content_key === "destinationKind") {
          entry.kind = row.value ?? undefined;
        } else if (row.content_key === "value" || row.content_key === "destination") {
          entry.value = row.value ?? undefined;
        }
        grouped.set(id, entry);
      }
      for (const [id, { kind, value }] of grouped) {
        if (value === undefined) continue;
        const [page, section] = id.split("::");
        sources.push({
          source: `${page} → ${section}`,
          kind: kind ?? inferKindFromValue(value),
          value,
        });
      }

      // 2. nav_items
      const { data: navItems } = await supabase
        .from("nav_items")
        .select("label, target_type, target_route, external_url");
      for (const n of navItems ?? []) {
        if (n.target_type === "external" && n.external_url) {
          sources.push({ source: `nav_items → ${n.label} (external)`, kind: "external", value: n.external_url });
        } else if (n.target_route) {
          sources.push({ source: `nav_items → ${n.label}`, kind: "link", value: n.target_route });
        }
      }

      // 3. nav_auth_buttons
      const { data: authBtns } = await supabase
        .from("nav_auth_buttons")
        .select("button_key, link");
      for (const b of authBtns ?? []) {
        if (b.link) sources.push({ source: `nav_auth_buttons → ${b.button_key}`, kind: inferKindFromValue(b.link), value: b.link });
      }

      // 4. features
      const { data: features } = await supabase
        .from("features")
        .select("slug, cta_primary_link, cta_secondary_link");
      for (const f of features ?? []) {
        if (f.cta_primary_link) sources.push({ source: `features → ${f.slug} (primary)`, kind: inferKindFromValue(f.cta_primary_link), value: f.cta_primary_link });
        if (f.cta_secondary_link) sources.push({ source: `features → ${f.slug} (secondary)`, kind: inferKindFromValue(f.cta_secondary_link), value: f.cta_secondary_link });
      }

      // 6. industry_seo_landing
      const { data: seoLanding } = await supabase
        .from("industry_seo_landing")
        .select("industry_slug, cta_link");
      for (const s of seoLanding ?? []) {
        if (s.cta_link) sources.push({ source: `industry_seo_landing → ${s.industry_slug}`, kind: inferKindFromValue(s.cta_link), value: s.cta_link });
      }

      // 7. pricing_highlights
      const { data: highlights } = await supabase
        .from("pricing_highlights")
        .select("plan_key, cta_link_override");
      for (const h of highlights ?? []) {
        if (h.cta_link_override) sources.push({ source: `pricing_highlights → ${h.plan_key}`, kind: inferKindFromValue(h.cta_link_override), value: h.cta_link_override });
      }

      // 8. client_logos
      const { data: logos } = await supabase
        .from("client_logos")
        .select("company_name, link_url");
      for (const l of logos ?? []) {
        if (l.link_url) sources.push({ source: `client_logos → ${l.company_name}`, kind: inferKindFromValue(l.link_url), value: l.link_url });
      }

      // Run the auditor on every gathered source.
      const findings: CtaAuditFinding[] = [];
      for (const s of sources) {
        const f = auditCtaDestination(s.source, s.kind, s.value);
        if (f) findings.push(f);
      }

      // Sort: error > warning > info, then alphabetical by source.
      const sevRank = { error: 0, warning: 1, info: 2 } as const;
      findings.sort((a, b) =>
        sevRank[a.severity] - sevRank[b.severity] || a.source.localeCompare(b.source),
      );
      return findings;
    },
  });

const SeverityIcon = ({ s }: { s: CtaAuditFinding["severity"] }) => {
  if (s === "error") return <AlertCircle className="text-destructive" size={16} />;
  if (s === "warning") return <AlertTriangle className="text-amber-500" size={16} />;
  return <Info className="text-muted-foreground" size={16} />;
};

const SEVERITY_FILTERS: Array<{ key: "all" | CtaAuditFinding["severity"]; label: string }> = [
  { key: "all", label: "All" },
  { key: "error", label: "Errors" },
  { key: "warning", label: "Warnings" },
  { key: "info", label: "Info" },
];

const CtaDestinationsAuditPanel = () => {
  const { data: findings = [], isLoading, isFetching, refetch } = useCtaAuditFindings();
  const [filter, setFilter] = useState<"all" | CtaAuditFinding["severity"]>("all");

  const counts = useMemo(() => {
    const c = { error: 0, warning: 0, info: 0 };
    for (const f of findings) c[f.severity]++;
    return c;
  }, [findings]);

  const filtered = useMemo(
    () => (filter === "all" ? findings : findings.filter((f) => f.severity === filter)),
    [filter, findings],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Link audit</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1">
            Scans every CMS-stored CTA, navigation entry, integration, feature and pricing link
            and reports paths that aren't language-canonical (e.g. saved as <code>/ar/...</code>),
            paths that have no Arabic counterpart, or destinations stored under the wrong kind.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={14} className={isFetching ? "animate-spin mr-2" : "mr-2"} />
          Re-scan
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Errors" value={counts.error} tone="error" />
        <SummaryCard label="Warnings" value={counts.warning} tone="warning" />
        <SummaryCard label="Info" value={counts.info} tone="info" />
        <SummaryCard label="Total flagged" value={findings.length} tone="muted" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {SEVERITY_FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "default" : "outline"}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Scanning CMS destinations…</p>
      ) : filtered.length === 0 ? (
        <div className="border border-border rounded-lg p-8 text-center bg-muted/30">
          <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={32} />
          <p className="font-medium">All scanned destinations look clean.</p>
          <p className="text-xs text-muted-foreground mt-1">
            No /ar prefixes, missing slashes, or wrong-kind values detected.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[44px]"></TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Stored value</TableHead>
                <TableHead>Suggested</TableHead>
                <TableHead>Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f, idx) => (
                <TableRow key={`${f.source}-${idx}`}>
                  <TableCell><SeverityIcon s={f.severity} /></TableCell>
                  <TableCell className="text-xs font-mono whitespace-nowrap">{f.source}</TableCell>
                  <TableCell className="text-xs">{f.kind}</TableCell>
                  <TableCell className="text-xs font-mono break-all">
                    {f.value || <span className="text-muted-foreground italic">(empty)</span>}
                  </TableCell>
                  <TableCell className="text-xs font-mono break-all">
                    {f.suggested && f.suggested !== f.value ? (
                      <span className="text-emerald-600">{f.suggested}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {f.issues.map((i) => (
                        <Badge
                          key={i}
                          variant={f.severity === "error" ? "destructive" : "secondary"}
                          className="text-[10px] font-normal"
                          title={ISSUE_LABELS[i]}
                        >
                          {i}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="text-xs text-muted-foreground border-t border-border pt-4">
        <p className="font-medium mb-1 flex items-center gap-1">
          <ExternalLink size={12} /> What each issue means
        </p>
        <ul className="space-y-1 list-disc pl-5">
          {Object.entries(ISSUE_LABELS).map(([key, label]) => (
            <li key={key}>
              <code className="text-foreground">{key}</code> — {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "error" | "warning" | "info" | "muted";
}) => {
  const toneClass =
    tone === "error"
      ? "text-destructive border-destructive/30 bg-destructive/5"
      : tone === "warning"
        ? "text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20"
        : tone === "info"
          ? "text-muted-foreground border-border bg-muted/30"
          : "text-foreground border-border bg-card";
  return (
    <div className={`rounded-lg border p-4 ${toneClass}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wide mt-1 opacity-80">{label}</div>
    </div>
  );
};

export default CtaDestinationsAuditPanel;
