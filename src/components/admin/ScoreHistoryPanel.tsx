import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, History } from "lucide-react";
import { useScoreSnapshots, type ScoreSnapshot } from "@/hooks/useScoreSnapshots";

/**
 * Trend chart of saved SERP score snapshots for the active page + language.
 * Shows overall score sparkline plus the four sub-score trend bars (title
 * length, description length, keyword coverage, duplicate risk) so editors
 * can see exactly which lever they moved with their last save.
 */

type Props = {
  pageKey: string;
  pageLabel: string;
  lang: "en" | "ar";
  rtl?: boolean;
};

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

const SCORE_COLOR = (s: number) =>
  s >= 80 ? "stroke-emerald-500" : s >= 55 ? "stroke-amber-500" : "stroke-destructive";

const BAR_COLOR = (s: number) =>
  s >= 80 ? "bg-emerald-500" : s >= 55 ? "bg-amber-500" : "bg-destructive";

const SUB_CHECKS: { key: keyof ScoreSnapshot; label: string }[] = [
  { key: "title_length_score", label: "Title length" },
  { key: "desc_length_score", label: "Description length" },
  { key: "keyword_coverage_score", label: "Keyword coverage" },
  { key: "duplicate_risk_score", label: "Duplicate risk" },
];

const Sparkline = ({ values }: { values: number[] }) => {
  if (values.length < 2) {
    return (
      <div className="text-[11px] text-muted-foreground italic">
        Save SEO at least twice to see a trend line.
      </div>
    );
  }
  const w = 280;
  const h = 60;
  const min = 0;
  const max = 100;
  const stepX = w / (values.length - 1);
  const pts = values
    .map((v, i) => {
      const y = h - ((v - min) / (max - min)) * h;
      return `${i * stepX},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = values[values.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14" preserveAspectRatio="none">
      {/* Threshold lines */}
      <line x1="0" y1={h - (80 / 100) * h} x2={w} y2={h - (80 / 100) * h}
        className="stroke-emerald-500/30" strokeDasharray="2 3" strokeWidth="0.5" />
      <line x1="0" y1={h - (55 / 100) * h} x2={w} y2={h - (55 / 100) * h}
        className="stroke-amber-500/30" strokeDasharray="2 3" strokeWidth="0.5" />
      <polyline
        fill="none"
        className={`${SCORE_COLOR(last)} transition-colors`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
      {values.map((v, i) => (
        <circle key={i} cx={i * stepX} cy={h - (v / 100) * h} r="2"
          className={`${SCORE_COLOR(v).replace("stroke-", "fill-")} `} />
      ))}
    </svg>
  );
};

const ScoreHistoryPanel = ({ pageKey, pageLabel, lang, rtl }: Props) => {
  const { data: snapshots, isLoading } = useScoreSnapshots(pageKey, lang);

  const overall = useMemo(() => (snapshots ?? []).map((s) => s.score), [snapshots]);
  const latest = snapshots?.[snapshots.length - 1];
  const previous = snapshots && snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;
  const delta = latest && previous ? latest.score - previous.score : 0;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor =
    delta > 0 ? "text-emerald-500" : delta < 0 ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden" dir={rtl ? "rtl" : "ltr"}>
      <div className="px-4 pt-3 pb-2 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <History size={16} className="text-accent shrink-0" />
          <h4 className="text-sm font-semibold text-foreground truncate">SERP score history</h4>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono shrink-0">
            {lang.toUpperCase()}
          </span>
        </div>
        {latest && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={14} />
            {delta > 0 ? "+" : ""}
            {delta}
            <span className="text-muted-foreground font-normal">vs previous</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {isLoading ? (
          <div className="text-xs text-muted-foreground">Loading history…</div>
        ) : !snapshots || snapshots.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            No snapshots yet. Click <span className="font-medium text-foreground">
            Save SEO for this page</span> to record the first snapshot.
          </div>
        ) : (
          <>
            {/* Overall trend */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Overall score
                </span>
                <span className="text-xs text-muted-foreground">
                  {snapshots.length} snapshot{snapshots.length === 1 ? "" : "s"}
                </span>
              </div>
              <Sparkline values={overall} />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                <span>{fmtDate(snapshots[0].created_at)}</span>
                <span>{fmtDate(snapshots[snapshots.length - 1].created_at)}</span>
              </div>
            </div>

            {/* Per-check trend bars */}
            <div className="grid sm:grid-cols-2 gap-3">
              {SUB_CHECKS.map((c) => {
                const series = snapshots.map((s) => s[c.key] as number);
                const last = series[series.length - 1] ?? 0;
                const prev = series.length > 1 ? series[series.length - 2] : last;
                const subDelta = last - prev;
                return (
                  <div key={c.key as string} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground">{c.label}</span>
                      <span className={`text-[10px] font-semibold ${
                        subDelta > 0 ? "text-emerald-500" : subDelta < 0 ? "text-destructive" : "text-muted-foreground"
                      }`}>
                        {subDelta > 0 ? "+" : ""}{subDelta}
                      </span>
                    </div>
                    {/* Mini bar chart of the last 12 snapshots */}
                    <div className="flex items-end gap-0.5 h-8">
                      {series.slice(-12).map((v, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm ${BAR_COLOR(v)} opacity-80`}
                          style={{ height: `${Math.max(4, v)}%` }}
                          title={`${v}/100`}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      Latest: <span className="text-foreground font-medium">{last}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Latest snapshot meta */}
            {latest && (
              <div className="text-[11px] text-muted-foreground border-t border-border pt-3">
                Last saved {fmtDate(latest.created_at)}
                {latest.actor_email && <> by <span className="text-foreground">{latest.actor_email}</span></>}
                {" · "}
                Title {latest.meta_title_length} chars · Desc {latest.meta_description_length} chars · {latest.keyword_count} keywords
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScoreHistoryPanel;
