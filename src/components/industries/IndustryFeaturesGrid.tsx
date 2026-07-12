import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useFeatures } from "@/hooks/useFeatures";

interface Props {
  industryName: string;
  /** Industry use cases (English text). Used to build readable card titles. */
  useCases: string[];
  heading?: string;
  intro?: string;
}

const Icon = ({ name, className }: { name?: string | null; className?: string }) => {
  if (!name) return <Sparkles className={className} />;
  const Cmp = (LucideIcons as Record<string, unknown>)[name] as
    | React.ComponentType<{ className?: string }>
    | undefined;
  if (!Cmp) return <Sparkles className={className} />;
  return <Cmp className={className} />;
};

/**
 * "Solve every {industry} workflow with our features" section.
 *
 * - Renders the industry's specific use cases
 * - Then a grid of clickable feature cards linking to /features/<slug>
 *
 * Internal links here boost SEO by linking the high-intent industry page to
 * supporting feature pages, distributing link equity and helping crawlers
 * understand topical relationships.
 */
const IndustryFeaturesGrid = ({ industryName, useCases, heading, intro }: Props) => {
  const { lang, isRTL } = useLanguage();
  const isAr = lang === "ar";
  const { data: features } = useFeatures();
  const published = (features ?? []).filter((f) => f.published).slice(0, 6);

  if (published.length === 0) return null;

  const fallbackHeading = isAr
    ? `كل أدواتنا تخدم ${industryName}`
    : `Every Digitize me capability, applied to ${industryName}`;
  const fallbackSub = isAr
    ? "اربط حالات استخدامك بميزات المنصة وانتقل مباشرة لمعرفة المزيد."
    : "From OCR to AI classification — explore the platform features that power your industry workflows.";

  return (
    <section
      className="section-padding bg-background"
      aria-label={`${industryName} platform capabilities`}
    >
      <div className="container-max">
        <div className={`text-center max-w-2xl mx-auto mb-10 ${isRTL ? "text-right" : ""}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{heading ?? fallbackHeading}</h2>
          <p className="text-muted-foreground text-sm">{intro ?? fallbackSub}</p>
        </div>

        {/* Use case chips for SEO + visual context */}
        {useCases?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {useCases.slice(0, 8).map((uc, i) => (
              <span
                key={i}
                className="inline-flex px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20"
              >
                {uc}
              </span>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {published.map((f, i) => {
            const title = (isAr && f.hero_title_ar) || f.hero_title;
            const desc = (isAr && f.hero_desc_ar) || f.hero_desc;
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
              >
                <Link
                  to={`/features/${f.slug}`}
                  className="group block h-full bg-card border border-border rounded-2xl p-5 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                    <Icon name={f.icon} className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5 group-hover:text-accent transition-colors">
                    {title}
                  </h3>
                  {desc && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {desc}
                    </p>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-medium text-accent group-hover:gap-2 transition-all ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    {isAr ? "اعرف أكثر" : "Learn more"}
                    <ArrowRight size={14} className={isRTL ? "rotate-180" : ""} />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IndustryFeaturesGrid;
