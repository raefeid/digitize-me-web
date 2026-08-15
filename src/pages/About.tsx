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
import AboutValues from "@/components/about/AboutValues";
import AboutOffices from "@/components/about/AboutOffices";

import ClientLogosCarousel from "@/components/home/ClientLogosCarousel";

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

      {/* Hero — statement led */}
      <section className="section-padding bg-gradient-to-b from-dm-navy-light to-background">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <EditableText
              as="span"
              page="about"
              section="hero"
              contentKey="eyebrow"
              fallback={isRTL ? "من نحن ولماذا نحن هنا." : "Who we are and why we're here."}
              className="text-accent font-semibold text-sm uppercase tracking-wider"
            />
            <EditableText
              as="h1"
              page="about"
              section="hero"
              contentKey="title"
              fallback={
                isRTL
                  ? "ثلاثة عقود من ذكاء المستندات."
                  : "Three Decades of Document Intelligence."
              }
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mt-4 mb-6 block leading-[1.05]"
              rich
            />
            <EditableText
              as="p"
              page="about"
              section="hero"
              contentKey="desc"
              fallback={
                isRTL
                  ? "لأكثر من ثلاثة عقود، ساعدنا الجهات الحكومية والمؤسسات والقطاعات الخاضعة للتنظيم على إدارة المعلومات على نطاق واسع. تنقل Digitize me هذه الخبرة إلى منصة سحابية مبنية لأعمالكم اليوم."
                  : "For over three decades, we've helped governments, enterprises and regulated industries manage information at scale. Digitize me brings that expertise into a cloud platform built for your business today."
              }
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-8"
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

      {/* Values */}
      <AboutValues />

      {/* Our story */}
      <StoryTimeline />

      {/* Our founders */}
      <FoundersMessage />

      {/* Our customers */}
      <ClientLogosCarousel />

      {/* Our offices */}
      <AboutOffices />
      <UAETrustBlock />

      {/* CTA footer */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-max text-center max-w-2xl mx-auto">
          <EditableText
            as="h2"
            page="about"
            section="cta"
            contentKey="title"
            fallback={isRTL ? "اكتشف ما يمكن أن تقدّمه Digitize me لك" : "Discover what Digitize me can do for you"}
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
