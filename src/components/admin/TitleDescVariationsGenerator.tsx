import { useMemo, useState } from "react";
import { Sparkles, Wand2, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Auto-generates 5 meta title/description variations for the active page,
 * combining the page identity (name, hero copy) with the editor's keywords
 * + brand/location globals. Each variation has a distinct angle (benefit,
 * keyword-led, question, location, action) so editors can pick one that
 * matches the page's intent and apply it with a single click.
 *
 * Pure client-side — no LLM call, no extra cost. Updates instantly when
 * keywords or page context change.
 */

export type VariationContext = {
  /** Page identity */
  name: string;
  hero_title?: string;
  hero_desc?: string;
  /** Comma-separated keywords from the SEO editor (active language). */
  keywords: string;
  /** Globals */
  brand: string;
  tagline: string;
  location: string;
  /** "en" | "ar" — drives templates & punctuation. */
  lang: "en" | "ar";
};

type Variation = {
  id: string;
  angle: string;
  title: string;
  description: string;
};

type Props = {
  context: VariationContext;
  onApply: (v: { title: string; description: string }) => void;
  rtl?: boolean;
};

const SEP = " | ";
const SEP_AR = " — ";

const trimTo = (s: string, n: number): string => {
  s = s.trim().replace(/\s+/g, " ");
  if (s.length <= n) return s;
  // Cut on a word boundary
  const slice = s.slice(0, n - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > n * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd() + "…";
};

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const buildVariations = (ctx: VariationContext): Variation[] => {
  const isAr = ctx.lang === "ar";
  const sep = isAr ? SEP_AR : SEP;

  const kws = ctx.keywords
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length >= 2);
  const primary = kws[0] || "";
  const secondary = kws[1] || "";
  const tertiary = kws[2] || "";

  const name = (ctx.name || "").trim();
  const heroDesc = (ctx.hero_desc || "").trim();
  const brand = (ctx.brand || "").trim();
  const location = (ctx.location || "").trim();
  const tagline = (ctx.tagline || "").trim();

  // Fallbacks so variations stay coherent even with sparse data
  const subject = name || primary || (isAr ? "هذه الصفحة" : "this page");
  const benefitDesc =
    heroDesc ||
    (isAr
      ? `${tagline} اكتشف كيف يساعدك ${brand} في ${primary || subject}.`
      : `${tagline} See how ${brand} helps teams with ${primary || subject}.`);

  const v: Variation[] = [];

  // 1. Benefit-led
  v.push({
    id: "benefit",
    angle: isAr ? "زاوية المنفعة" : "Benefit-led",
    title: trimTo(
      isAr
        ? `${subject}${primary ? ` لـ ${primary}` : ""}${sep}${brand}`
        : `${cap(subject)}${primary ? ` for ${primary}` : ""}${sep}${brand}`,
      60,
    ),
    description: trimTo(
      isAr
        ? `${benefitDesc}${secondary ? ` ادعم فريقك بـ ${secondary}.` : ""}`
        : `${benefitDesc}${secondary ? ` Power your team with ${secondary}.` : ""}`,
      160,
    ),
  });

  // 2. Keyword-led (primary + secondary up front)
  v.push({
    id: "keyword",
    angle: isAr ? "ابتداء بالكلمة المفتاحية" : "Keyword-led",
    title: trimTo(
      primary
        ? isAr
          ? `${cap(primary)}${secondary ? ` و${secondary}` : ""}${sep}${subject}`
          : `${cap(primary)}${secondary ? ` & ${cap(secondary)}` : ""}${sep}${cap(subject)}`
        : `${cap(subject)}${sep}${brand}`,
      60,
    ),
    description: trimTo(
      isAr
        ? `${cap(primary || subject)}${secondary ? `، ${secondary}` : ""}${tertiary ? `، ${tertiary}` : ""} — حلول ${brand} الموثوقة في ${location}.`
        : `${cap(primary || subject)}${secondary ? `, ${secondary}` : ""}${tertiary ? `, ${tertiary}` : ""} — trusted ${brand} solutions across ${location}.`,
      160,
    ),
  });

  // 3. Question hook
  v.push({
    id: "question",
    angle: isAr ? "سؤال جذاب" : "Question hook",
    title: trimTo(
      isAr
        ? `هل تبحث عن ${primary || subject}؟${sep}${brand}`
        : `Looking for ${primary || subject}?${sep}${brand}`,
      60,
    ),
    description: trimTo(
      isAr
        ? `اكتشف كيف يساعد ${brand} الفرق في ${location} على ${primary || subject} بسرعة وأمان. ${tagline}`
        : `Discover how ${brand} helps teams across ${location} master ${primary || subject} — fast, secure, and built for scale. ${tagline}`,
      160,
    ),
  });

  // 4. Location-led (local SEO)
  v.push({
    id: "location",
    angle: isAr ? "محلي" : "Location-led",
    title: trimTo(
      isAr
        ? `${cap(primary || subject)} في ${location}${sep}${brand}`
        : `${cap(primary || subject)} in ${location}${sep}${brand}`,
      60,
    ),
    description: trimTo(
      isAr
        ? `${brand} هو شريك ${location} الموثوق لـ ${primary || subject}${secondary ? ` و${secondary}` : ""}. ${tagline}`
        : `${brand} is the trusted ${location} partner for ${primary || subject}${secondary ? ` and ${secondary}` : ""}. ${tagline}`,
      160,
    ),
  });

  // 5. Action / CTA
  v.push({
    id: "action",
    angle: isAr ? "دعوة للعمل" : "Action / CTA",
    title: trimTo(
      isAr
        ? `ابدأ مع ${primary || subject} اليوم${sep}${brand}`
        : `Get started with ${primary || subject} today${sep}${brand}`,
      60,
    ),
    description: trimTo(
      isAr
        ? `حوّل ${primary || subject} إلى ميزة تنافسية. جرّب ${brand} مجاناً وانضم إلى الفرق الرائدة في ${location}.`
        : `Turn ${primary || subject} into a competitive edge. Try ${brand} free and join leading teams across ${location}.`,
      160,
    ),
  });

  return v;
};

const TitleDescVariationsGenerator = ({ context, onApply, rtl }: Props) => {
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [seed, setSeed] = useState(0); // bumped to force a re-build

  const variations = useMemo(() => buildVariations(context), [context, seed]);

  const hasPrimary = (context.keywords || "").trim().length > 0;
  const hasName = (context.name || "").trim().length > 0;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden" dir={rtl ? "rtl" : "ltr"}>
      <div className="px-4 pt-3 pb-2 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles size={16} className="text-accent shrink-0" />
          <h4 className="text-sm font-semibold text-foreground truncate">
            Title & description variations
          </h4>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono shrink-0">
            {context.lang.toUpperCase()}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSeed((s) => s + 1)}
          className="shrink-0 h-7 px-2 text-xs"
          title="Regenerate"
        >
          <RefreshCw size={12} className="mr-1" />
          Refresh
        </Button>
      </div>

      {!hasPrimary && !hasName ? (
        <div className="p-5 text-xs text-muted-foreground">
          Add at least one <span className="font-medium text-foreground">keyword</span>{" "}
          (or fill the page name / hero) below to generate suggestions.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {variations.map((v) => {
            const applied = appliedId === v.id;
            return (
              <li key={v.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-accent font-semibold">
                    {v.angle}
                  </span>
                  <Button
                    size="sm"
                    variant={applied ? "default" : "outline"}
                    onClick={() => {
                      onApply({ title: v.title, description: v.description });
                      setAppliedId(v.id);
                    }}
                    className="h-7 px-2.5 text-xs shrink-0"
                  >
                    {applied ? (
                      <>
                        <Check size={12} className="mr-1" />
                        Applied
                      </>
                    ) : (
                      <>
                        <Wand2 size={12} className="mr-1" />
                        Apply
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Title <span className="font-mono">({v.title.length}/60)</span>
                    </div>
                    <p className="text-sm text-foreground leading-snug">{v.title}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Description <span className="font-mono">({v.description.length}/160)</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {v.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TitleDescVariationsGenerator;
