import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Image as ImageIcon, FileText, Hash, Share2, type LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * SeoHealthPanel — analyses SEO content rows and computes a per-page score
 * + an aggregate score across the whole site. All checks run client-side
 * against the same site_content rows the editor already has, so there are
 * no extra DB calls or external API costs.
 */

type Row = {
  page: string;
  section: string;
  content_key: string;
  content_type: string;
  value: string;
  value_ar: string | null;
};

type Props = {
  allContent: Row[] | undefined;
  pages: { key: string; label: string }[];
  activePage: string;
  onSelectPage: (key: string) => void;
};

type Check = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  score: number; // 0-100 contribution
  weight: number;
  hint: string;
  icon: LucideIcon;
};

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;

function getRow(rows: Row[], page: string, section: string, key: string) {
  return rows.find((r) => r.page === page && r.section === section && r.content_key === key);
}

function scorePage(rows: Row[], page: string): { checks: Check[]; total: number } {
  const seoRows = rows.filter((r) => r.page === page && r.section === "seo");
  const title = getRow(seoRows, page, "seo", "meta_title")?.value ?? "";
  const desc = getRow(seoRows, page, "seo", "meta_description")?.value ?? "";
  const keywords = getRow(seoRows, page, "seo", "meta_keywords")?.value ?? "";
  const ogTitle = getRow(seoRows, page, "seo", "og_title")?.value ?? "";
  const ogDesc = getRow(seoRows, page, "seo", "og_description")?.value ?? "";
  const ogImage = getRow(seoRows, page, "seo", "og_image")?.value ?? "";

  // Image alt coverage on this page
  const imageRows = rows.filter((r) => r.page === page && r.content_type === "image_url");
  const altRows = rows.filter((r) => r.page === page && r.content_key.endsWith("__alt"));
  const imagesWithAlt = imageRows.filter((img) =>
    altRows.some((a) => a.content_key === `${img.content_key}__alt` && (a.value || a.value_ar))
  ).length;
  const imageCoverage = imageRows.length === 0 ? 1 : imagesWithAlt / imageRows.length;

  // Multilingual coverage on title/description (EN + AR)
  const titleI18n = [title, getRow(seoRows, page, "seo", "meta_title")?.value_ar];
  const filledTitleLangs = titleI18n.filter((v) => v && v.trim().length > 0).length;
  const descI18n = [desc, getRow(seoRows, page, "seo", "meta_description")?.value_ar];
  const filledDescLangs = descI18n.filter((v) => v && v.trim().length > 0).length;
  const i18nCoverage = (filledTitleLangs + filledDescLangs) / 4;

  const checks: Check[] = [
    {
      id: "title",
      label: "Meta title",
      icon: FileText,
      weight: 20,
      status: !title
        ? "fail"
        : title.length >= TITLE_MIN && title.length <= TITLE_MAX
          ? "pass"
          : "warn",
      score: !title ? 0 : title.length >= TITLE_MIN && title.length <= TITLE_MAX ? 100 : 50,
      hint: !title
        ? "Missing meta title."
        : title.length < TITLE_MIN
          ? `Too short (${title.length} chars). Aim for ${TITLE_MIN}-${TITLE_MAX}.`
          : title.length > TITLE_MAX
            ? `Too long (${title.length} chars). Google may truncate above ${TITLE_MAX}.`
            : `Optimal length (${title.length} chars).`,
    },
    {
      id: "desc",
      label: "Meta description",
      icon: FileText,
      weight: 20,
      status: !desc
        ? "fail"
        : desc.length >= DESC_MIN && desc.length <= DESC_MAX
          ? "pass"
          : "warn",
      score: !desc ? 0 : desc.length >= DESC_MIN && desc.length <= DESC_MAX ? 100 : 50,
      hint: !desc
        ? "Missing meta description."
        : desc.length < DESC_MIN
          ? `Too short (${desc.length} chars). Aim for ${DESC_MIN}-${DESC_MAX}.`
          : desc.length > DESC_MAX
            ? `Too long (${desc.length} chars). Google may truncate above ${DESC_MAX}.`
            : `Optimal length (${desc.length} chars).`,
    },
    {
      id: "keywords",
      label: "Keywords",
      icon: Hash,
      weight: 5,
      status: keywords ? "pass" : "warn",
      score: keywords ? 100 : 50,
      hint: keywords
        ? `${keywords.split(",").filter(Boolean).length} keyword(s) defined.`
        : "Optional but useful for internal tracking.",
    },
    {
      id: "og",
      label: "Social share tags",
      icon: Share2,
      weight: 15,
      status: ogTitle || ogDesc ? "pass" : "warn",
      score: (ogTitle ? 50 : 0) + (ogDesc ? 50 : 0),
      hint:
        ogTitle && ogDesc
          ? "OG title & description set."
          : ogTitle || ogDesc
            ? "Partial — fill both for best preview."
            : "Will fall back to meta tags. Custom OG copy converts better.",
    },
    {
      id: "ogimage",
      label: "Social preview image",
      icon: ImageIcon,
      weight: 15,
      status: ogImage ? "pass" : "fail",
      score: ogImage ? 100 : 0,
      hint: ogImage
        ? "Image set — verify it's 1200×630 for best results."
        : "No social preview image. Pages without one get poor engagement on LinkedIn / X.",
    },
    {
      id: "alt",
      label: "Image alt text",
      icon: ImageIcon,
      weight: 15,
      status:
        imageRows.length === 0
          ? "pass"
          : imageCoverage === 1
            ? "pass"
            : imageCoverage >= 0.5
              ? "warn"
              : "fail",
      score: Math.round(imageCoverage * 100),
      hint:
        imageRows.length === 0
          ? "No images on this page yet."
          : `${imagesWithAlt}/${imageRows.length} images have alt text.`,
    },
    {
      id: "i18n",
      label: "Multilingual coverage",
      icon: TrendingUp,
      weight: 10,
      status: i18nCoverage === 1 ? "pass" : i18nCoverage >= 0.5 ? "warn" : "fail",
      score: Math.round(i18nCoverage * 100),
      hint: `${filledTitleLangs}/2 title langs, ${filledDescLangs}/2 description langs filled.`,
    },
  ];

  const total = Math.round(
    checks.reduce((acc, c) => acc + (c.score * c.weight) / 100, 0)
  );
  return { checks, total };
}

const grade = (score: number) => {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-500", bg: "bg-emerald-500" };
  if (score >= 70) return { label: "Good", color: "text-accent", bg: "bg-accent" };
  if (score >= 50) return { label: "Needs work", color: "text-amber-500", bg: "bg-amber-500" };
  return { label: "Poor", color: "text-destructive", bg: "bg-destructive" };
};

const StatusIcon = ({ status }: { status: Check["status"] }) => {
  if (status === "pass") return <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />;
  if (status === "warn") return <AlertTriangle size={16} className="text-amber-500 shrink-0" />;
  return <XCircle size={16} className="text-destructive shrink-0" />;
};

const SeoHealthPanel = ({ allContent, pages, activePage, onSelectPage }: Props) => {
  const rows = allContent ?? [];

  const perPage = useMemo(
    () => pages.map((p) => ({ ...p, ...scorePage(rows, p.key) })),
    [rows, pages]
  );

  const overall = useMemo(() => {
    if (perPage.length === 0) return 0;
    return Math.round(perPage.reduce((acc, p) => acc + p.total, 0) / perPage.length);
  }, [perPage]);

  const active = perPage.find((p) => p.key === activePage);
  const overallGrade = grade(overall);

  return (
    <div className="space-y-5">
      {/* Overall score card */}
      <div className="bg-gradient-to-br from-card to-muted/30 border border-border rounded-xl p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Overall site SEO score</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${overallGrade.color}`}>{overall}</span>
              <span className="text-lg text-muted-foreground">/ 100</span>
              <span className={`ml-2 text-sm font-medium ${overallGrade.color}`}>{overallGrade.label}</span>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>{perPage.filter((p) => p.total >= 85).length} of {perPage.length} pages</div>
            <div>scoring 85+</div>
          </div>
        </div>
        <Progress value={overall} className="mt-4 h-2" />
      </div>

      {/* Per-page scores */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Per-page health</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {perPage.map((p) => {
            const g = grade(p.total);
            const isActive = p.key === activePage;
            return (
              <button
                key={p.key}
                onClick={() => onSelectPage(p.key)}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition-all text-left ${
                  isActive
                    ? "border-accent bg-accent/5"
                    : "border-border bg-card hover:border-accent/50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground truncate">{p.label}</div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${g.bg} transition-all`} style={{ width: `${p.total}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold ${g.color}`}>{p.total}</div>
                  <div className="text-[10px] text-muted-foreground -mt-0.5">{g.label}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active page checklist */}
      {active && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground">
              Checklist — {active.label}
            </h4>
            <span className={`text-xs font-semibold ${grade(active.total).color}`}>
              {active.total}/100
            </span>
          </div>
          <div className="space-y-2">
            {active.checks.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/50"
                >
                  <StatusIcon status={c.status} />
                  <Icon size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{c.label}</span>
                      <span className="text-[10px] text-muted-foreground">weight {c.weight}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.hint}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SERP info note */}
      <div className="flex items-start gap-3 bg-muted/30 border border-border rounded-lg p-3">
        <TrendingUp size={16} className="text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          <strong className="text-foreground">Want real Google rankings?</strong> Live SERP positions require
          connecting Google Search Console (free, your real impressions/clicks/CTR/position) or a paid SERP API.
          Ask to add it as a follow-up.
        </div>
      </div>
    </div>
  );
};

export default SeoHealthPanel;
