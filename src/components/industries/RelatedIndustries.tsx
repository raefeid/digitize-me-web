import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useDynamicIndustries } from "@/hooks/useDynamicIndustries";

interface Props {
  /** Slug of the current industry — excluded from the related list. */
  currentSlug: string;
}

/**
 * "Related industries" cross-link block. Picks the 3 published industries
 * adjacent to the current one in the saved order (with wrap-around) so
 * visitors keep exploring + crawlers spread internal link equity.
 */
const RelatedIndustries = ({ currentSlug }: Props) => {
  const { t, lang, isRTL } = useLanguage();
  const { publishedList, getName } = useDynamicIndustries();

  const list = publishedList.filter((i) => i.slug !== currentSlug);
  if (list.length === 0) return null;

  const currentIdx = publishedList.findIndex((i) => i.slug === currentSlug);
  // Pick neighbours with wrap-around so position 0 still gets relevant siblings
  const pickIndexes = [currentIdx + 1, currentIdx + 2, currentIdx + 3].map(
    (n) => ((n % publishedList.length) + publishedList.length) % publishedList.length,
  );
  const picked = pickIndexes
    .map((idx) => publishedList[idx])
    .filter((i) => i && i.slug !== currentSlug)
    .slice(0, 3);

  if (picked.length === 0) return null;

  const heading = lang === "ar" ? "قطاعات أخرى نخدمها" : "Explore related industries";

  return (
    <section
      className="section-padding bg-background border-t border-border"
      aria-label="Related industries"
    >
      <div className="container-max">
        <div className={`mb-8 ${isRTL ? "text-right" : ""}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{heading}</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {picked.map((industry, i) => {
            const Icon = industry.icon;
            const displayName = industry.isCustom
              ? getName(industry.slug, lang === "ar" ? "ar" : "en") || industry.name
              : t(`ind.${industry.slug}`);
            return (
              <motion.div
                key={industry.slug}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link
                  to={`/industries/${industry.slug}`}
                  className="group flex items-center gap-4 bg-card border border-border rounded-xl p-5 hover:border-accent/40 hover:shadow-md transition-all h-full"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Icon size={22} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                      {displayName}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-accent group-hover:gap-2 transition-all mt-1 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      {lang === "ar" ? "افتح الصفحة" : "View industry page"}
                      <ArrowRight size={12} className={isRTL ? "rotate-180" : ""} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RelatedIndustries;
