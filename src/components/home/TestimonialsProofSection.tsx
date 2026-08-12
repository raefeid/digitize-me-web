import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTestimonials, DEFAULT_TESTIMONIALS } from "@/hooks/useTestimonials";

/**
 * Reinforcing Proofs — combined numeric stats + written testimonials +
 * client logo strip. Complements the existing TestimonialsSection with
 * a proof-heavy layout inspired by enterprise SaaS reference designs.
 */
const TestimonialsProofSection = () => {
  const { lang, isRTL } = useLanguage();
  const { data: dbTestimonials = [] } = useTestimonials();
  const publishedDb = dbTestimonials.filter((t) => t.published);
  // Real customer case studies; admin-added DB testimonials take precedence.
  const source = publishedDb.length > 0 ? publishedDb : DEFAULT_TESTIMONIALS;
  const l = (en: string | null, ar: string | null) => (lang === "ar" ? ar : en) ?? en ?? "";

  const proofStats = [
    { value: "1.7M+", label: isRTL ? "مستند تمت رقمنته" : "Documents digitized" },
    { value: "50%", label: isRTL ? "خفض في التكاليف" : "Cost reduction" },
    { value: "50,000", label: isRTL ? "صفحة يوميًا" : "Pages captured daily" },
    { value: "8 mo", label: isRTL ? "لرقمنة كاملة" : "To fully digitize" },
  ];

  const testimonials = source.slice(0, 4).map((t) => ({
    quote: l(t.quote, t.quote_ar),
    name: l(t.author_name, t.author_name_ar),
    role: l(t.role, t.role_ar),
    company: l(t.company, t.company_ar),
  }));

  return (
    <section
      aria-label="Customer proof and testimonials"
      className="section-padding bg-gradient-to-b from-background via-muted/20 to-background"
    >
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">
            {isRTL ? "دليل من العملاء" : "Proof from our customers"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-3">
            {isRTL ? "أرقام حقيقية. كلمات حقيقية." : "Real numbers. Real words."}
          </h2>
          <p className="text-muted-foreground">
            {isRTL
              ? "المؤسسات في جميع أنحاء الإمارات ومنطقة الخليج تعتمد على DigitizeMe كل يوم."
              : "Enterprises across the UAE and GCC rely on DigitizeMe every day."}
          </p>
        </div>

        {/* Proof stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {proofStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-accent tracking-tight">
                {s.value}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground mt-2 font-medium">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonial cards */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-6 md:p-7 shadow-sm hover:shadow-lg hover:border-accent/30 transition-all flex flex-col"
            >
              <Quote size={28} className="text-accent/40 mb-3" />
              <p className="text-base md:text-lg text-foreground leading-relaxed flex-1">
                “{t.quote}”
              </p>
              <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {t.role} · {t.company}
                  </div>
                </div>
                <div className="ms-auto flex items-center gap-0.5 text-accent">
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} size={13} fill="currentColor" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsProofSection;
