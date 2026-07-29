import { motion } from "framer-motion";
import { ShieldCheck, HeartHandshake, Hammer, Zap, Users } from "lucide-react";
import EditableText from "@/components/cms/EditableText";
import { useLanguage } from "@/i18n/LanguageContext";

const VALUES = [
  {
    slot: "v1",
    Icon: ShieldCheck,
    titleEn: "Trust",
    titleAr: "الثقة",
    descEn:
      "Your documents are your business. UAE data residency, strict access control and full audit trails are the baseline, not an upgrade.",
    descAr:
      "مستنداتك هي عملك. إقامة البيانات في الإمارات والتحكم الصارم بالوصول وسجلات التدقيق الكاملة هي الأساس وليست إضافة.",
  },
  {
    slot: "v2",
    Icon: HeartHandshake,
    titleEn: "Customer Obsession",
    titleAr: "هوس العميل",
    descEn:
      "We sit with your team, learn how your files actually move, and shape the platform around that reality — not the other way around.",
    descAr:
      "نجلس مع فريقك ونتعلم كيف تتحرك ملفاتك فعليًا، ثم نشكّل المنصة حول هذا الواقع — لا العكس.",
  },
  {
    slot: "v3",
    Icon: Hammer,
    titleEn: "Craftsmanship",
    titleAr: "الإتقان",
    descEn:
      "Arabic-first OCR, bilingual interfaces and RTL layouts done properly. Details others skip are the ones we obsess over.",
    descAr:
      "تعرّف ضوئي يضع العربية أولًا وواجهات ثنائية اللغة وتخطيطات RTL بإتقان. التفاصيل التي يتجاهلها الآخرون هي ما نهتم به.",
  },
  {
    slot: "v4",
    Icon: Zap,
    titleEn: "Intensity",
    titleAr: "الاندفاع",
    descEn:
      "Two-minute setup, same-week rollouts, answers in hours. Momentum is a feature of how we work.",
    descAr:
      "إعداد في دقيقتين، وإطلاق خلال الأسبوع نفسه، وردود خلال ساعات. السرعة جزء من طريقة عملنا.",
  },
  {
    slot: "v5",
    Icon: Users,
    titleEn: "Family",
    titleAr: "العائلة",
    descEn:
      "Three decades, one regional team. Clients stay with us for years because the people behind the platform stay too.",
    descAr:
      "ثلاثة عقود وفريق إقليمي واحد. يبقى عملاؤنا معنا لسنوات لأن الأشخاص خلف المنصة يبقون أيضًا.",
  },
];

const AboutValues = () => {
  const { isRTL } = useLanguage();

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="max-w-3xl mb-12">
          <EditableText
            as="span"
            page="about"
            section="values"
            contentKey="eyebrow"
            fallback={isRTL ? "قيمنا" : "Our values"}
            className="text-accent font-semibold text-sm uppercase tracking-wider"
          />
          <EditableText
            as="h2"
            page="about"
            section="values"
            contentKey="title"
            fallback={isRTL ? "ما الذي يوجّه كل قرار نتخذه" : "What guides every decision we make"}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 block leading-tight"
            rich
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.slot}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="group rounded-2xl border border-border bg-card p-6 hover:border-accent/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                <v.Icon className="w-5 h-5" />
              </div>
              <EditableText
                as="h3"
                page="about"
                section="values"
                contentKey={`${v.slot}_title`}
                fallback={isRTL ? v.titleAr : v.titleEn}
                className="text-xl font-bold text-foreground mb-2 block"
              />
              <EditableText
                as="p"
                page="about"
                section="values"
                contentKey={`${v.slot}_desc`}
                fallback={isRTL ? v.descAr : v.descEn}
                className="text-muted-foreground leading-relaxed"
                rich
                multiline
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutValues;
