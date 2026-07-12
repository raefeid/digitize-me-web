import { useEffect, useMemo } from "react";
import { Gauge, AlertTriangle, CheckCircle2, AlertCircle, Copy } from "lucide-react";

/**
 * Live SERP preview score — computes a 0–100 rating for the current page's
 * SEO based on three signals admins can act on without waiting for an API
 * round-trip:
 *   1. Length compliance (title 30–60 chars, description 70–160 chars)
 *   2. Keyword coverage (do the editor's chosen keywords actually appear in
 *      the title / description / OG fields?)
 *   3. Duplicate-title risk (does any other page in the editor already use
 *      the same meta title or description? — catches accidental copy/paste)
 *
 * Pure presentational: fed by the editor's pending state, so the score
 * updates on every keystroke just like the SERP/social preview.
 */

export type AllPageSeoSnapshot = {
  pageKey: string;
  pageLabel: string;
  metaTitle: string;
  metaDescription: string;
};

export type SerpScoreBreakdown = {
  score: number;
  titleLengthScore: number;
  descLengthScore: number;
  keywordCoverageScore: number;
  duplicateRiskScore: number;
};

type Props = {
  metaTitle: string;
  metaDescription: string;
  ogTitle?: string;
  ogDescription?: string;
  keywords?: string; // comma-separated
  /** Snapshot of every other page's saved title/description for duplicate detection. */
  otherPages: AllPageSeoSnapshot[];
  /** Current page key — excluded from duplicate check. */
  activePageKey: string;
  rtl?: boolean;
  /** Fires whenever the live score changes — lets the editor capture snapshots on save. */
  onScoreChange?: (breakdown: SerpScoreBreakdown) => void;
};

type Severity = "good" | "warn" | "bad";

type Check = {
  id: string;
  label: string;
  status: Severity;
  detail: string;
  /** 0–1 contribution to the overall score before weighting. */
  score: number;
  weight: number;
};

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const TITLE_HARD_MAX = 70;
const DESC_MIN = 70;
const DESC_MAX = 160;
const DESC_HARD_MAX = 170;

const sevColor: Record<Severity, string> = {
  good: "text-emerald-500",
  warn: "text-amber-500",
  bad: "text-destructive",
};
const sevBg: Record<Severity, string> = {
  good: "bg-emerald-500/10 border-emerald-500/30",
  warn: "bg-amber-500/10 border-amber-500/30",
  bad: "bg-destructive/10 border-destructive/30",
};
const sevIcon: Record<Severity, typeof CheckCircle2> = {
  good: CheckCircle2,
  warn: AlertTriangle,
  bad: AlertCircle,
};

/**
 * Aggressive normalization for fuzzy duplicate detection:
 *  - lowercase
 *  - strip punctuation (keep letters/digits/whitespace, incl. Arabic ranges)
 *  - collapse Arabic letter variants (أإآ→ا, ى→ي, ة→ه) and strip diacritics
 *  - collapse curly/smart quotes & dashes
 *  - drop common brand/site-name suffixes (anything after the LAST | – — separator)
 *  - collapse whitespace
 * Catches near-matches like "Pricing | Digitize me" vs "pricing — Digitize Me!"
 */
const norm = (s: string) => {
  let v = (s || "").toLowerCase().trim();
  // Drop trailing brand suffix after last separator (| – — • · :)
  const sepMatch = v.match(/^(.*?)[\s]*[|\u2013\u2014•·:][\s]*[^|\u2013\u2014•·:]+$/);
  if (sepMatch && sepMatch[1].trim().length >= 8) v = sepMatch[1];
  // Normalize unicode + strip Arabic diacritics (harakat U+064B–U+065F, tatweel U+0640)
  v = v.normalize("NFKD").replace(/[\u064B-\u065F\u0640\u0670]/g, "");
  // Arabic letter variants
  v = v
    .replace(/[\u0622\u0623\u0625]/g, "\u0627") // أإآ → ا
    .replace(/\u0649/g, "\u064A") // ى → ي
    .replace(/\u0629/g, "\u0647"); // ة → ه
  // Strip punctuation/symbols, keep letters (latin + arabic), digits, whitespace
  v = v.replace(/[^\p{L}\p{N}\s]/gu, " ");
  return v.replace(/\s+/g, " ").trim();
};

/** Token-based Jaccard similarity for catching reorderings & small additions. */
const similarity = (a: string, b: string): number => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const ta = new Set(a.split(" ").filter((t) => t.length >= 2));
  const tb = new Set(b.split(" ").filter((t) => t.length >= 2));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  ta.forEach((t) => {
    if (tb.has(t)) inter += 1;
  });
  const union = ta.size + tb.size - inter;
  return inter / union;
};

const FUZZY_THRESHOLD = 0.85;

const SerpScorePanel = ({
  metaTitle,
  metaDescription,
  ogTitle,
  ogDescription,
  keywords,
  otherPages,
  activePageKey,
  rtl,
  onScoreChange,
}: Props) => {
  const checks = useMemo<Check[]>(() => {
    const list: Check[] = [];
    const title = (metaTitle || "").trim();
    const desc = (metaDescription || "").trim();
    const titleLen = title.length;
    const descLen = desc.length;

    // --- Title length ---------------------------------------------------
    let titleStatus: Severity = "good";
    let titleDetail = `${titleLen} chars — within the recommended ${TITLE_MIN}–${TITLE_MAX} range.`;
    let titleScore = 1;
    if (titleLen === 0) {
      titleStatus = "bad";
      titleDetail = "Missing meta title — Google will fall back to the H1.";
      titleScore = 0;
    } else if (titleLen < TITLE_MIN) {
      titleStatus = "warn";
      titleDetail = `${titleLen} chars — too short. Aim for ${TITLE_MIN}–${TITLE_MAX}.`;
      titleScore = 0.5;
    } else if (titleLen > TITLE_HARD_MAX) {
      titleStatus = "bad";
      titleDetail = `${titleLen} chars — Google will truncate beyond ${TITLE_MAX}.`;
      titleScore = 0.2;
    } else if (titleLen > TITLE_MAX) {
      titleStatus = "warn";
      titleDetail = `${titleLen} chars — slightly long, may be truncated on mobile.`;
      titleScore = 0.7;
    }
    list.push({
      id: "title-length",
      label: "Title length",
      status: titleStatus,
      detail: titleDetail,
      score: titleScore,
      weight: 25,
    });

    // --- Description length --------------------------------------------
    let descStatus: Severity = "good";
    let descDetail = `${descLen} chars — within the recommended ${DESC_MIN}–${DESC_MAX} range.`;
    let descScore = 1;
    if (descLen === 0) {
      descStatus = "bad";
      descDetail = "Missing meta description — Google will pick a snippet from page content.";
      descScore = 0;
    } else if (descLen < DESC_MIN) {
      descStatus = "warn";
      descDetail = `${descLen} chars — too short. Aim for ${DESC_MIN}–${DESC_MAX}.`;
      descScore = 0.5;
    } else if (descLen > DESC_HARD_MAX) {
      descStatus = "bad";
      descDetail = `${descLen} chars — Google will cut off after ${DESC_MAX}.`;
      descScore = 0.3;
    } else if (descLen > DESC_MAX) {
      descStatus = "warn";
      descDetail = `${descLen} chars — slightly long, may be truncated.`;
      descScore = 0.75;
    }
    list.push({
      id: "desc-length",
      label: "Description length",
      status: descStatus,
      detail: descDetail,
      score: descScore,
      weight: 25,
    });

    // --- Keyword coverage ----------------------------------------------
    const kwList = (keywords || "")
      .split(",")
      .map((k) => norm(k))
      .filter((k) => k.length >= 2);
    const haystack = norm(`${title} ${desc} ${ogTitle ?? ""} ${ogDescription ?? ""}`);

    if (kwList.length === 0) {
      list.push({
        id: "keyword-coverage",
        label: "Keyword coverage",
        status: "warn",
        detail: "No keywords entered — add 2–5 target terms to track coverage.",
        score: 0.5,
        weight: 20,
      });
    } else {
      const matched = kwList.filter((k) => haystack.includes(k));
      const ratio = matched.length / kwList.length;
      let s: Severity = "good";
      let d = `${matched.length}/${kwList.length} keywords found in title or description.`;
      let sc = ratio;
      if (ratio === 0) {
        s = "bad";
        d = `None of your ${kwList.length} keywords appear in the title or description.`;
      } else if (ratio < 0.5) {
        s = "warn";
        d = `Only ${matched.length}/${kwList.length} keywords appear — consider weaving more in.`;
      } else if (ratio < 1) {
        s = "warn";
        d = `${matched.length}/${kwList.length} keywords found. Missing: ${kwList
          .filter((k) => !matched.includes(k))
          .slice(0, 3)
          .join(", ")}.`;
        sc = 0.7;
      }
      list.push({
        id: "keyword-coverage",
        label: "Keyword coverage",
        status: s,
        detail: d,
        score: sc,
        weight: 20,
      });
    }

    // --- Duplicate risk (fuzzy) -----------------------------------------
    // Classify each other page as exact / near match using normalized strings
    // + Jaccard similarity on tokens. Catches case differences, punctuation,
    // brand-suffix variations, Arabic letter variants, and minor reorderings.
    const tNorm = norm(title);
    const dNorm = norm(desc);

    type DupHit = { page: AllPageSeoSnapshot; kind: "exact" | "near"; score: number };
    const classify = (
      target: string,
      getter: (p: AllPageSeoSnapshot) => string,
    ): DupHit[] => {
      if (!target) return [];
      const hits: DupHit[] = [];
      for (const p of otherPages) {
        if (p.pageKey === activePageKey) continue;
        const other = norm(getter(p));
        if (!other || other.length < 3) continue;
        if (other === target) {
          hits.push({ page: p, kind: "exact", score: 1 });
        } else {
          const sim = similarity(target, other);
          if (sim >= FUZZY_THRESHOLD) hits.push({ page: p, kind: "near", score: sim });
        }
      }
      return hits;
    };

    const dupTitleHits = classify(tNorm, (p) => p.metaTitle);
    const dupDescHits = classify(dNorm, (p) => p.metaDescription);

    const titleExact = dupTitleHits.some((h) => h.kind === "exact");
    const descExact = dupDescHits.some((h) => h.kind === "exact");
    const fmtHit = (h: DupHit) =>
      h.kind === "exact" ? h.page.pageLabel : `${h.page.pageLabel} (~${Math.round(h.score * 100)}%)`;

    let dupStatus: Severity = "good";
    let dupDetail = "Title and description are unique across your site.";
    let dupScore = 1;

    if (dupTitleHits.length > 0 && dupDescHits.length > 0) {
      dupStatus = "bad";
      const labels = [...new Set([...dupTitleHits, ...dupDescHits].map(fmtHit))].slice(0, 3);
      dupDetail = `${titleExact && descExact ? "Duplicate" : "Near-duplicate"} title AND description on: ${labels.join(", ")}.`;
      dupScore = titleExact && descExact ? 0 : 0.15;
    } else if (dupTitleHits.length > 0) {
      dupStatus = titleExact ? "bad" : "warn";
      dupDetail = `${titleExact ? "Title also used on" : "Near-duplicate title with"}: ${dupTitleHits.map(fmtHit).slice(0, 3).join(", ")}.`;
      dupScore = titleExact ? 0.3 : 0.55;
    } else if (dupDescHits.length > 0) {
      dupStatus = "warn";
      dupDetail = `${descExact ? "Description also used on" : "Near-duplicate description with"}: ${dupDescHits.map(fmtHit).slice(0, 3).join(", ")}.`;
      dupScore = descExact ? 0.6 : 0.75;
    }
    list.push({
      id: "duplicate-risk",
      label: "Duplicate risk",
      status: dupStatus,
      detail: dupDetail,
      score: dupScore,
      weight: 30,
    });

    return list;
  }, [metaTitle, metaDescription, ogTitle, ogDescription, keywords, otherPages, activePageKey]);

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const weightedScore = checks.reduce((s, c) => s + c.score * c.weight, 0);
  const score = Math.round((weightedScore / totalWeight) * 100);

  // Push the latest breakdown up to the editor so it can snapshot on save.
  const findCheck = (id: string) => checks.find((c) => c.id === id);
  useEffect(() => {
    if (!onScoreChange) return;
    onScoreChange({
      score,
      titleLengthScore: Math.round((findCheck("title-length")?.score ?? 0) * 100),
      descLengthScore: Math.round((findCheck("desc-length")?.score ?? 0) * 100),
      keywordCoverageScore: Math.round((findCheck("keyword-coverage")?.score ?? 0) * 100),
      duplicateRiskScore: Math.round((findCheck("duplicate-risk")?.score ?? 0) * 100),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, checks, onScoreChange]);

  const grade: Severity = score >= 80 ? "good" : score >= 55 ? "warn" : "bad";
  const ringColor = grade === "good" ? "stroke-emerald-500" : grade === "warn" ? "stroke-amber-500" : "stroke-destructive";
  const gradeLabel = grade === "good" ? "Strong" : grade === "warn" ? "Needs work" : "Poor";

  // SVG ring math
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden" dir={rtl ? "rtl" : "ltr"}>
      <div className="px-4 pt-3 pb-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-accent" />
          <h4 className="text-sm font-semibold text-foreground">SERP score</h4>
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          updates as you type
        </span>
      </div>

      <div className="p-5 grid sm:grid-cols-[auto_1fr] gap-5 items-start">
        {/* Score ring */}
        <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r={radius} className="stroke-muted" strokeWidth="6" fill="none" />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className={`${ringColor} transition-all duration-300`}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-xl font-bold text-foreground leading-none">{score}</div>
            </div>
          </div>
          <div className="text-center sm:text-center">
            <div className={`text-xs font-semibold uppercase tracking-wider ${sevColor[grade]}`}>{gradeLabel}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">out of 100</div>
          </div>
        </div>

        {/* Check list */}
        <ul className="space-y-2">
          {checks.map((c) => {
            const Icon = c.id === "duplicate-risk" ? Copy : sevIcon[c.status];
            return (
              <li
                key={c.id}
                className={`flex items-start gap-3 text-xs rounded-lg border px-3 py-2 ${sevBg[c.status]}`}
              >
                <Icon size={14} className={`shrink-0 mt-0.5 ${sevColor[c.status]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{c.label}</span>
                    <span className={`text-[10px] uppercase tracking-wider ${sevColor[c.status]}`}>
                      {c.status === "good" ? "Pass" : c.status === "warn" ? "Improve" : "Fix"}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 leading-snug">{c.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default SerpScorePanel;
