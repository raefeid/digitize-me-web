import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import EditableText from "@/components/cms/EditableText";
import CtaButton from "@/components/cms/CtaButton";
import RevealAutoScanner from "@/components/cms/RevealAutoScanner";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import StoryTimeline from "@/components/about/StoryTimeline";
import FoundersMessage from "@/components/about/FoundersMessage";
import UAETrustBlock from "@/components/about/UAETrustBlock";
import UAEHostingBadge from "@/components/common/UAEHostingBadge";

const About = () => {
  const { isRTL } = useLanguage();
  const { getContent } = useSiteContent("about");

  return (
    <Layout>
      <RevealAutoScanner page="about" />
      <SEOHead
        title={getContent(
          "meta_title",
          "About Digitize me | 30+ Years of UAE Digital Transformation",
        )}
        description={getContent(
          "meta_description",
          "Meet the team behind Digitize me. 30+ years of regional expertise in document management, AI OCR and digital transformation — hosted in the UAE.",
        )}
        titleAr="من نحن — Digitize me | أكثر من ٣٠ عامًا من التحول الرقمي في الإمارات"
        descriptionAr="تعرّف على الفريق وراء Digitize me. أكثر من ٣٠ عامًا من الخبرة الإقليمية في إدارة المستندات وOCR بالذكاء الاصطناعي والتحول الرقمي — مستضاف في الإمارات."
        path="/about"
        pageKey="about"
      />

      {/* Hero */}
      <section className="section-padding bg-gradient-to-b from-dm-navy-light to-background">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <EditableText
              as="span"
              page="about"
              section="hero"
              contentKey="eyebrow"
              fallback={isRTL ? "من نحن" : "About Digitize me"}
              className="text-accent font-semibold text-sm uppercase tracking-wider"
            />
            <EditableText
              as="h1"
              page="about"
              section="hero"
              contentKey="title"
              fallback={
                isRTL
                  ? "نحوّل الورق إلى ذكاء — منذ أكثر من ٣٠ عامًا"
                  : "Turning paper into intelligence — for 30+ years"
              }
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-3 mb-6 block leading-tight"
              rich
            />
            <EditableText
              as="p"
              page="about"
              section="hero"
              contentKey="desc"
              fallback={
                isRTL
                  ? "Digitize me هو ثمرة عقود من خبرة مجموعتنا في إدارة المستندات المؤسسية والتحول الرقمي عبر الشرق الأوسط — مغلّفة الآن في منصة SaaS مدعومة بالذكاء الاصطناعي ومستضافة في الإمارات."
                  : "Digitize me is the product of decades of regional expertise in enterprise document management and digital transformation — now packaged into an AI-powered SaaS platform, hosted in the UAE."
              }
              className="text-lg md:text-xl text-muted-foreground mb-8"
              rich
              multiline
            />
            <div className="flex flex-wrap items-center gap-4">
              <CtaButton
                ctaKey="about_hero_primary"
                defaultTo="/contact"
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <EditableText
                  page="about"
                  section="hero"
                  contentKey="cta_primary"
                  fallback={isRTL ? "تواصل مع الفريق" : "Talk to our team"}
                />
              </CtaButton>
              <UAEHostingBadge />
            </div>
          </motion.div>
        </div>
      </section>

      <StoryTimeline />
      <FoundersMessage />
      <UAETrustBlock />

      {/* CTA footer */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-max text-center max-w-2xl mx-auto">
          <EditableText
            as="h2"
            page="about"
            section="cta"
            contentKey="title"
            fallback={isRTL ? "هل أنت جاهز لرؤية Digitize me يعمل؟" : "Ready to see Digitize me in action?"}
            className="text-3xl md:text-4xl font-bold mb-4 block"
            rich
          />
          <EditableText
            as="p"
            page="about"
            section="cta"
            contentKey="desc"
            fallback={
              isRTL
                ? "احجز عرضًا مع فريقنا الإماراتي واكتشف كيف يمكن لمنصتنا تسريع عمل مؤسستك."
                : "Book a demo with our UAE-based team and discover how our platform can accelerate your organization."
            }
            className="text-lg text-primary-foreground/80 mb-8"
            rich
            multiline
          />
          <CtaButton
            ctaKey="about_footer_cta"
            defaultTo="/contact"
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <EditableText
              page="about"
              section="cta"
              contentKey="cta_label"
              fallback={isRTL ? "تواصل معنا" : "Contact us"}
            />
          </CtaButton>
        </div>
      </section>
    </Layout>
  );
};

export default About;
