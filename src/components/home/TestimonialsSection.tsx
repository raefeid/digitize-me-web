import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useSiteContent } from "@/hooks/useSiteContent";
import EditableText from "@/components/cms/EditableText";

const TestimonialsSection = () => {
  const { lang, isRTL } = useLanguage();
  const { data: testimonials = [], isLoading } = useTestimonials();
  const published = testimonials.filter((t) => t.published);

  // Hide section entirely if nothing to show (admin hasn't added testimonials yet)
  if (!isLoading && published.length === 0) return null;

  const l = (en: string | null, ar: string | null) =>
    (lang === "ar" ? ar : en) ?? en ?? "";

  return (
    <section className="section-padding bg-gradient-to-b from-background to-muted/20">
      <div className="container-max">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <EditableText
            page="home"
            section="testimonials"
            contentKey="badge"
            fallback={isRTL ? "آراء عملائنا" : "What our customers say"}
            className="text-accent font-semibold text-sm uppercase tracking-wider"
          />
          <EditableText
            as="h2"
            page="home"
            section="testimonials"
            contentKey="title"
            fallback={isRTL ? "موثوق به من قبل فرق العمل في المنطقة" : "Trusted by teams across the region"}
            className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4 block"
            rich
          />
          <EditableText
            as="p"
            page="home"
            section="testimonials"
            contentKey="description"
            fallback={
              isRTL
                ? "اقرأ كيف تستخدم الفرق Digitize me لتحويل عمليات المستندات."
                : "Hear how teams use Digitize me to transform their document operations."
            }
            multiline
            className="text-muted-foreground"
            rich
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {published.slice(0, 6).map((t, i) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={`relative bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-accent/30 transition-all flex flex-col ${
                t.featured ? "lg:col-span-1 ring-1 ring-accent/20" : ""
              }`}
            >
              <Quote
                className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} text-accent/20`}
                size={28}
              />

              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={14}
                    className={
                      idx < t.rating
                        ? "fill-accent text-accent"
                        : "text-muted-foreground/30"
                    }
                  />
                ))}
              </div>

              <blockquote className="text-foreground/90 text-sm leading-relaxed flex-1 mb-5">
                "{l(t.quote, t.quote_ar)}"
              </blockquote>

              <figcaption className="flex items-center gap-3 pt-4 border-t border-border/60">
                {t.avatar_url ? (
                  <img
                    src={t.avatar_url}
                    alt={l(t.author_name, t.author_name_ar)}
                    className="w-10 h-10 rounded-full object-cover bg-muted shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold shrink-0">
                    {l(t.author_name, t.author_name_ar).charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {l(t.author_name, t.author_name_ar)}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {[l(t.role, t.role_ar), l(t.company, t.company_ar)]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                {t.company_logo_url && (
                  <img
                    src={t.company_logo_url}
                    alt=""
                    className="h-6 w-auto object-contain opacity-60 grayscale shrink-0"
                    loading="lazy"
                  />
                )}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
