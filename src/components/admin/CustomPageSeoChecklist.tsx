import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle, type LucideIcon, FileText, Link2, Share2, Image as ImageIcon, Globe } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { CustomPageRow } from "@/hooks/useCustomPages";

/**
 * CustomPageSeoChecklist — validates a single custom page's SEO readiness
 * before publish. Pure client-side, no extra DB calls. Designed to live in
 * the right-hand inspector of PagesManager.
 */

type Props = {
  page: Pick<CustomPageRow, "title" | "slug" | "seo_title" | "seo_description" | "seo_og_image" | "status">;
  siteOrigin?: string;
};

type Status = "pass" | "warn" | "fail";
type Check = {
  id: string;
  label: string;
  status: Status;
  score: number; // 0..100
  weight: number;
  hint: string;
  icon: LucideIcon;
};

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_MAX = 160;

const grade = (score: number) => {
  if (score >= 85) return { label: "Ready to publish", color: "text-emerald-500", bg: "bg-emerald-500" };
  if (score >= 70) return { label: "Good", color: "text-accent", bg: "bg-accent" };
  if (score >= 50) return { label: "Needs work", color: "text-amber-500", bg: "bg-amber-500" };
  return { label: "Not ready", color: "text-destructive", bg: "bg-destructive" };
};

const StatusIcon = ({ status }: { status: Status }) => {
  if (status === "pass") return <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />;
  if (status === "warn") return <AlertTriangle size={14} className="text-amber-500 shrink-0" />;
  return <XCircle size={14} className="text-destructive shrink-0" />;
};

const isAbsoluteUrl = (s: string) => /^https?:\/\//i.test(s.trim());

const CustomPageSeoChecklist = ({ page, siteOrigin }: Props) => {
  const origin = siteOrigin ?? (typeof window !== "undefined" ? window.location.origin : "");

  const { checks, total } = useMemo(() => {
    const title = (page.seo_title ?? "").trim();
    const desc = (page.seo_description ?? "").trim();
    const slug = (page.slug ?? "").trim();
    const ogImage = (page.seo_og_image ?? "").trim();
    const canonical = slug ? `${origin}/${slug}` : "";

    const list: Check[] = [
      {
        id: "title",
        label: "Meta title",
        icon: FileText,
        weight: 25,
        status: !title ? "fail" : title.length >= TITLE_MIN && title.length <= TITLE_MAX ? "pass" : "warn",
        score: !title ? 0 : title.length >= TITLE_MIN && title.length <= TITLE_MAX ? 100 : 50,
        hint: !title
          ? `Missing — falls back to page title "${page.title}".`
          : title.length < TITLE_MIN
            ? `Too short (${title.length}). Aim for ${TITLE_MIN}-${TITLE_MAX} chars.`
            : title.length > TITLE_MAX
              ? `Too long (${title.length}). Google truncates above ${TITLE_MAX}.`
              : `Optimal (${title.length} chars).`,
      },
      {
        id: "desc",
        label: "Meta description",
        icon: FileText,
        weight: 25,
        status: !desc ? "fail" : desc.length >= DESC_MIN && desc.length <= DESC_MAX ? "pass" : "warn",
        score: !desc ? 0 : desc.length >= DESC_MIN && desc.length <= DESC_MAX ? 100 : 50,
        hint: !desc
          ? "Missing — search engines will auto-generate one."
          : desc.length < DESC_MIN
            ? `Too short (${desc.length}). Aim for ${DESC_MIN}-${DESC_MAX} chars.`
            : desc.length > DESC_MAX
              ? `Too long (${desc.length}). Google truncates above ${DESC_MAX}.`
              : `Optimal (${desc.length} chars).`,
      },
      {
        id: "canonical",
        label: "Canonical URL",
        icon: Link2,
        weight: 15,
        status: canonical ? "pass" : "fail",
        score: canonical ? 100 : 0,
        hint: canonical ? canonical : "Set a slug to generate a canonical URL.",
      },
      {
        id: "slug",
        label: "URL slug shape",
        icon: Globe,
        weight: 10,
        status: !slug
          ? "fail"
          : /^[a-z0-9-]+$/.test(slug) && slug.length <= 60
            ? "pass"
            : "warn",
        score: !slug ? 0 : /^[a-z0-9-]+$/.test(slug) && slug.length <= 60 ? 100 : 60,
        hint: !slug
          ? "URL slug missing."
          : !/^[a-z0-9-]+$/.test(slug)
            ? "Use lowercase letters, numbers, and dashes only."
            : slug.length > 60
              ? `Long slug (${slug.length}). Keep under 60 chars for shareability.`
              : "Clean, search-friendly slug.",
      },
      {
        id: "ogimage",
        label: "OG image (social preview)",
        icon: ImageIcon,
        weight: 15,
        status: !ogImage ? "fail" : isAbsoluteUrl(ogImage) ? "pass" : "warn",
        score: !ogImage ? 0 : isAbsoluteUrl(ogImage) ? 100 : 60,
        hint: !ogImage
          ? "No social preview image. LinkedIn / X / Slack will show a blank card."
          : !isAbsoluteUrl(ogImage)
            ? "Use an absolute https:// URL — relative paths break on social platforms."
            : "Verify it's 1200×630 for best results.",
      },
      {
        id: "ogfallback",
        label: "OG title & description",
        icon: Share2,
        weight: 10,
        status: title && desc ? "pass" : title || desc ? "warn" : "fail",
        score: title && desc ? 100 : title || desc ? 50 : 0,
        hint:
          title && desc
            ? "Will reuse meta title & description for social cards."
            : "OG tags fall back to meta — fill both meta fields above.",
      },
    ];

    const total = Math.round(list.reduce((a, c) => a + (c.score * c.weight) / 100, 0));
    return { checks: list, total };
  }, [page, origin]);

  const g = grade(total);
  const blockingIssues = checks.filter((c) => c.status === "fail").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">SEO checklist</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {blockingIssues > 0
              ? `${blockingIssues} blocking issue${blockingIssues === 1 ? "" : "s"} before publish`
              : "All critical checks pass"}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold ${g.color} leading-none`}>{total}</div>
          <div className="text-[10px] text-muted-foreground">/ 100</div>
        </div>
      </div>

      <Progress value={total} className="h-1.5" />
      <div className={`text-[10px] font-medium ${g.color}`}>{g.label}</div>

      <div className="space-y-1.5 pt-1">
        {checks.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              className="flex items-start gap-2 p-2 rounded-md bg-muted/40 border border-border/50"
            >
              <StatusIcon status={c.status} />
              <Icon size={12} className="text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground">{c.label}</div>
                <p className="text-[10px] text-muted-foreground mt-0.5 break-words">{c.hint}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomPageSeoChecklist;
