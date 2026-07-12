import { useEffect, useState } from "react";
import { History, Loader2, Sparkles, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Read-only audit trail of AI-driven SEO field changes for a page.
 *
 * Reads from `seo_audit_log` and refreshes whenever the
 * `seo-audit-log-updated` window event fires (dispatched by the AI generator
 * after a successful run).
 */

type AuditRow = {
  id: string;
  created_at: string;
  actor_email: string | null;
  source: string;
  mode: string;
  fields_changed: string[];
  before_values: Record<string, string | null>;
  after_values: Record<string, string | null>;
};

const FIELD_LABELS: Record<string, string> = {
  seo_title: "Meta title",
  seo_description: "Meta description",
  slug: "Canonical slug",
};

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
};

const truncate = (v: string | null, max = 80) => {
  if (!v) return "—";
  return v.length > max ? `${v.slice(0, max)}…` : v;
};

interface Props {
  pageId: string | null;
}

const SeoAuditTrail = ({ pageId }: Props) => {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!pageId) {
      setRows([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("seo_audit_log")
        .select("id, created_at, actor_email, source, mode, fields_changed, before_values, after_values")
        .eq("page_id", pageId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled) {
        if (!error && data) setRows(data as unknown as AuditRow[]);
        setLoading(false);
      }
    };
    load();
    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail as { pageId?: string } | undefined;
      if (!detail?.pageId || detail.pageId === pageId) load();
    };
    window.addEventListener("seo-audit-log-updated", onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("seo-audit-log-updated", onUpdated);
    };
  }, [pageId]);

  if (!pageId) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <History className="w-3 h-3" /> AI changes audit
        </p>
        <span className="text-[10px] text-muted-foreground">{rows.length} entr{rows.length === 1 ? "y" : "ies"}</span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground py-3">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading history…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic py-2">
          No AI-generated changes recorded yet. Use the AI generator to populate SEO fields and an entry will appear here.
        </p>
      ) : (
        <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {rows.map((r) => {
            const isOpen = expanded === r.id;
            return (
              <li
                key={r.id}
                className="rounded-md border border-border bg-muted/30 hover:bg-muted/50 transition"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="w-full text-left p-2 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Sparkles className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-[11px] font-medium truncate">
                        {r.mode === "fill_missing" ? "Filled missing fields" : "Regenerated SEO"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatRelative(r.created_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.fields_changed.map((f) => (
                      <span
                        key={f}
                        className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary"
                      >
                        {FIELD_LABELS[f] ?? f}
                      </span>
                    ))}
                  </div>
                  {r.actor_email && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <User className="w-2.5 h-2.5" />
                      <span className="truncate">{r.actor_email}</span>
                    </div>
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-border p-2 space-y-2 text-[11px]">
                    {r.fields_changed.map((f) => (
                      <div key={f} className="space-y-0.5">
                        <p className="font-medium text-foreground">{FIELD_LABELS[f] ?? f}</p>
                        <p className="text-muted-foreground">
                          <span className="text-destructive/80">−</span> {truncate(r.before_values?.[f] ?? null)}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="text-emerald-600 dark:text-emerald-400">+</span> {truncate(r.after_values?.[f] ?? null)}
                        </p>
                      </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SeoAuditTrail;
