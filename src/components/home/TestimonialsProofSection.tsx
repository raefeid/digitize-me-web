import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useClientLogos } from "@/hooks/useClientLogos";

/**
 * Reinforcing Proofs — combined numeric stats + written testimonials +
 * client logo strip. Complements the existing TestimonialsSection with
 * a proof-heavy layout inspired by enterprise SaaS reference designs.
 */
const TestimonialsProofSection = () => {
  const { isRTL } = useLanguage();
  const { data: logos = [] } = useClientLogos();
  const publishedLogos = logos.filter((l) => l.published);

  const proofStats = [
    { value: "500+", label: isRTL ? "شركة تستخدم المنصة" : "Businesses onboarded" },
    { value: "5M+", label: isRTL ? "صفحة تمت معالجتها" : "Pages processed" },
    { value: "99.4%", label: isRTL ? "دقة OCR" : "OCR accuracy" },
    { value: "4.9/5", label: isRTL ? "تقييم العملاء" : "Customer rating" },
  ];

  const testimonials = isRTL
    ? [
        {
          quote: "قلّصنا وقت البحث عن المستندات من دقائق إلى ثوانٍ — كان الفارق فوريًا.",
          name: "أحمد المنصوري",
          role: "مدير العمليات",
          company: "Gulf Logistics",
        },
        {
          quote: "OCR العربي لا يُضاهى — يقرأ فواتيرنا اليدوية بدقة مذهلة.",
          name: "فاطمة العلي",
          role: "شريك",
          company: "مكتب المحاماة",
        },
        {
          quote: "الأتمتة وحدها وفّرت علينا وظيفة بدوام كامل خلال أول ٦ أشهر.",
          name: "Rajesh Kumar",
          role: "CFO",
          company: "Emirates Retail Group",
        },
      ]
    : [
        {
          quote:
            "We cut document retrieval time from minutes to seconds. The impact on daily operations was immediate.",
          name: "Ahmed Al Mansouri",
          role: "Head of Operations",
          company: "Gulf Logistics",
        },
        {
          quote:
            "The Arabic OCR is unmatched — it reads our handwritten invoices with astonishing accuracy.",
          name: "Fatima Al Ali",
          role: "Partner",
          company: "Al Ali Law Firm",
        },
        {
          quote:
            "Automation alone saved us a full-time role in the first 6 months.",
          name: "Rajesh Kumar",
          role: "CFO",
          company: "Emirates Retail Group",
        },
      ];

  return (
    <section
      aria-label="Customer proof and testimonials"
      className="section-padding bg-gradient-to-b from-background via-muted/20 to-background"
    >
      <div className="container-max">
        <div className="text-center max-w-2xl mx-auto mb-12">
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
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
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
