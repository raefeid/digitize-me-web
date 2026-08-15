import { motion } from "framer-motion";
import EditableText from "@/components/cms/EditableText";
import { useLanguage } from "@/i18n/LanguageContext";

type Milestone = {
  key: string;
  year: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
};

const MILESTONES: Milestone[] = [
  {
    key: "m1",
    year: "1993",
    titleEn: "Establishing the Foundation",
    titleAr: "إرساء الأساس",
    descEn:
      "Our parent group begins operations in the Middle East with a focus on imaging, digital capture and enterprise content management.",
    descAr:
      "تبدأ المجموعة الأم أعمالها في الشرق الأوسط بالتركيز على التصوير والمسح الرقمي وإدارة محتوى المؤسسات.",
  },
  {
    key: "m2",
    year: "2002",
    titleEn: "Expanding Across the GCC",
    titleAr: "التوسع في دول الخليج",
    descEn:
      "Offices open across the GCC. We start delivering ECM, archiving and workflow projects for banks, government and enterprise clients.",
    descAr:
      "افتتاح مكاتب في دول الخليج وبدء تنفيذ مشاريع إدارة المحتوى والأرشفة وسير العمل للبنوك والجهات الحكومية والشركات الكبرى.",
  },
  {
    key: "m3",
    year: "2012",
    titleEn: "Advancing Enterprise Information Management",
    titleAr: "تطوير إدارة معلومات المؤسسات",
    descEn:
      "We formalize a dedicated digital transformation practice — combining bilingual OCR, BPM and consulting for document-heavy industries.",
    descAr:
      "إطلاق ممارسة مخصصة للتحول الرقمي تجمع بين التعرف الضوئي ثنائي اللغة وإدارة العمليات والاستشارات للقطاعات كثيفة المستندات.",
  },
  {
    key: "m4",
    year: "2020",
    titleEn: "From Enterprise Expertise to SaaS Innovation",
    titleAr: "من خبرة المؤسسات إلى ابتكار SaaS",
    descEn:
      "After 25+ years of enterprise projects, we package the platform as a SaaS product: Digitize me — purpose-built for Arabic & English document workflows.",
    descAr:
      "بعد أكثر من ٢٥ عامًا من المشاريع المؤسسية، نطلق المنصة كمنتج SaaS باسم Digitize me، مصممًا خصيصًا لسير عمل المستندات بالعربية والإنجليزية.",
  },
  {
    key: "m5",
    year: "2023",
    titleEn: "Strengthening Regional Trust",
    titleAr: "تعزيز الثقة الإقليمية",
    descEn:
      "We move the SaaS infrastructure to UAE & KSA-hosted cloud regions — ensuring data residency, low latency and full regional compliance.",
    descAr:
      "نقل البنية التحتية لخدمة SaaS إلى مناطق سحابية مستضافة في الإمارات والسعودية — لضمان إقامة البيانات وزمن استجابة منخفض والامتثال الإقليمي الكامل.",
  },
  {
    key: "m6",
    year: "Today",
    titleEn: "Built on Experience. Focused on the Future.",
    titleAr: "مبنيّ على الخبرة. موجّه نحو المستقبل.",
    descEn:
      "30+ years of group expertise, hundreds of customers across the GCC, and a roadmap that keeps pushing AI-powered document automation forward.",
    descAr:
      "أكثر من ٣٠ عامًا من خبرة المجموعة، ومئات العملاء في دول الخليج، وخارطة طريق تواصل دفع أتمتة المستندات بالذكاء الاصطناعي إلى الأمام.",
  },
];

const StoryTimeline = () => {
  const { isRTL } = useLanguage();
  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="max-w-3xl mb-12 md:mb-16">
          <EditableText
            as="span"
            page="about"
            section="story"
            contentKey="eyebrow"
            fallback={isRTL ? "قصتنا" : "Our story"}
            className="text-accent font-semibold text-sm uppercase tracking-wider"
          />
          <EditableText
            as="h2"
            page="about"
            section="story"
            contentKey="title"
            fallback={isRTL ? "ثلاثة عقود من الريادة في إدارة المستندات" : "Three Decades of Regional Document Expertise"}
            className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4 block"
            rich
          />
          <EditableText
            as="p"
            page="about"
            section="story"
            contentKey="desc"
            fallback={
              isRTL
                ? "من مشاريع المسح الضوئي والأرشفة المؤسسية إلى منصة SaaS مدعومة بالذكاء الاصطناعي — تستفيد Digitize me من عقود من الخبرة الإقليمية في إدارة المستندات."
                : "From scanning and enterprise archiving projects to an AI-powered SaaS platform — Digitize me builds on decades of regional document management expertise."
            }
            className="text-lg text-muted-foreground"
            rich
            multiline
          />
        </div>

        <ol className="relative border-s-2 border-accent/20 ms-3 space-y-10">
          {MILESTONES.map((m, i) => (
            <motion.li
              key={m.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="relative ms-6"
            >
              <span className="absolute -start-[34px] top-1 w-5 h-5 rounded-full bg-accent ring-4 ring-background" />
              <EditableText
                as="div"
                page="about"
                section="story"
                contentKey={`${m.key}_year`}
                fallback={m.year}
                className="text-sm font-semibold text-accent"
              />
              <EditableText
                as="h3"
                page="about"
                section="story"
                contentKey={`${m.key}_title`}
                fallback={isRTL ? m.titleAr : m.titleEn}
                className="text-xl md:text-2xl font-bold text-foreground mt-1 mb-2 block"
              />
              <EditableText
                as="p"
                page="about"
                section="story"
                contentKey={`${m.key}_desc`}
                fallback={isRTL ? m.descAr : m.descEn}
                className="text-muted-foreground"
                rich
                multiline
              />
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default StoryTimeline;
