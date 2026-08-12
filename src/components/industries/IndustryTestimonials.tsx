import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTestimonials, DEFAULT_TESTIMONIALS } from "@/hooks/useTestimonials";

interface Props {
  /** Industry name in English — used to filter testimonials by company/role keywords. */
  industryName: string;
  heading?: string;
}

/**
 * Industry-specific testimonial wall. Picks testimonials whose role/company
 * text mentions the industry keyword (case-insensitive). Falls back to the
 * top featured testimonials if no industry match is found, so the section
 * never appears empty.
 */
const IndustryTestimonials = ({ industryName, heading }: Props) => {
  const { lang, isRTL } = useLanguage();
  const isAr = lang === "ar";
  const { data: all } = useTestimonials();

  const dbPublished = (all ?? []).filter((t) => t.published);
  // Fall back to the real case-study testimonials when the DB has none.
  const published = dbPublished.length > 0 ? dbPublished : DEFAULT_TESTIMONIALS;
  const keyword = industryName.toLowerCase().split(/\s|&|\//)[0]; // first significant word

  const matched = published.filter((t) => {
    const haystack = `${t.role ?? ""} ${t.company ?? ""}`.toLowerCase();
    return haystack.includes(keyword);
  });

  // Use matched (up to 3); pad with featured if we have fewer than 2
  let display = matched.slice(0, 3);
  if (display.length < 2) {
    const featured = published
      .filter((t) => !display.find((d) => d.id === t.id))
      .filter((t) => t.featured)
      .slice(0, 3 - display.length);
    display = [...display, ...featured].slice(0, 3);
  }

  if (display.length === 0) return null;

  const fallbackHeading = isAr
    ? `ماذا يقول قادة ${industryName} عن Digitize me`
    : `Trusted by ${industryName} leaders`;

  return (
    <section
      className="section-padding bg-muted/30"
      aria-label={`${industryName} customer testimonials`}
    >
      <div className="container-max">
        <div className={`text-center max-w-2xl mx-auto mb-10 ${isRTL ? "text-right" : ""}`}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{heading ?? fallbackHeading}</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {display.map((t, i) => {
            const quote = (isAr && t.quote_ar) || t.quote;
            const author = (isAr && t.author_name_ar) || t.author_name;
            const role = (isAr && t.role_ar) || t.role;
            const company = (isAr && t.company_ar) || t.company;

            return (
              <motion.figure
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.3) }}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col h-full"
              >
                <Quote className="w-7 h-7 text-accent/30 mb-3" />
                <blockquote className="text-sm text-foreground leading-relaxed flex-1 mb-4">
                  {quote}
                </blockquote>
                <div className="flex gap-0.5 mb-3" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, n) => (
                    <Star
                      key={n}
                      size={14}
                      className={
                        n < t.rating
                          ? "text-accent fill-accent"
                          : "text-muted-foreground/30"
                      }
                    />
                  ))}
                </div>
                <figcaption className="flex items-center gap-3 pt-3 border-t border-border">
                  {t.avatar_url ? (
                    <img
                      src={t.avatar_url}
                      alt={author}
                      className="w-10 h-10 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm">
                      {author?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{author}</div>
                    {(role || company) && (
                      <div className="text-xs text-muted-foreground truncate">
                        {[role, company].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IndustryTestimonials;
