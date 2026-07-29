import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Newspaper } from "lucide-react";
import EditableText from "@/components/cms/EditableText";
import { useLanguage } from "@/i18n/LanguageContext";

const ITEMS = [
  {
    slot: "n1",
    sourceEn: "Gulf Business",
    sourceAr: "غلف بزنس",
    titleEn: "How UAE enterprises are retiring the filing room",
    titleAr: "كيف تتخلى الشركات الإماراتية عن غرفة الملفات",
    date: "2025",
  },
  {
    slot: "n2",
    sourceEn: "Khaleej Times",
    sourceAr: "خليج تايمز",
    titleEn: "Arabic-first AI OCR reaches enterprise accuracy",
    titleAr: "الذكاء الاصطناعي للتعرف الضوئي بالعربية يبلغ دقة المؤسسات",
    date: "2025",
  },
  {
    slot: "n3",
    sourceEn: "Zawya",
    sourceAr: "زاوية",
    titleEn: "Data residency becomes the deciding factor in GCC SaaS",
    titleAr: "إقامة البيانات تصبح العامل الحاسم في SaaS الخليج",
    date: "2024",
  },
];

const AboutNews = () => {
  const { isRTL } = useLanguage();

  return (
    <section className="section-padding bg-dm-navy-light">
      <div className="container-max">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <EditableText
              as="span"
              page="about"
              section="news"
              contentKey="eyebrow"
              fallback={isRTL ? "في الأخبار" : "In the news"}
              className="text-accent font-semibold text-sm uppercase tracking-wider"
            />
            <EditableText
              as="h2"
              page="about"
              section="news"
              contentKey="title"
              fallback={isRTL ? "ما يُقال عنّا" : "What people are saying about us"}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 block leading-tight"
              rich
            />
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
          >
            {isRTL ? "كل الأخبار" : "Read the blog"}
            <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {ITEMS.map((n, i) => (
            <motion.article
              key={n.slot}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between min-h-[190px]"
            >
              <Newspaper className="w-5 h-5 text-accent mb-4" />
              <EditableText
                as="h3"
                page="about"
                section="news"
                contentKey={`${n.slot}_title`}
                fallback={isRTL ? n.titleAr : n.titleEn}
                className="text-lg font-semibold text-foreground leading-snug block"
                rich
              />
              <div className="mt-4 text-sm text-muted-foreground font-medium">
                <EditableText
                  as="span"
                  page="about"
                  section="news"
                  contentKey={`${n.slot}_source`}
                  fallback={isRTL ? n.sourceAr : n.sourceEn}
                />
                <span className="mx-2">·</span>
                <span>{n.date}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutNews;
