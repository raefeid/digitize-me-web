import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Shield, Zap, Globe, FileText, Brain, Clock, CheckCircle, ArrowRight, Scan, Languages, Building2, Scale, Stethoscope, Truck, GraduationCap, Factory, HardHat, Landmark, DollarSign, ShoppingBag, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import AnimatedHeroVisual from "@/components/home/AnimatedHeroVisual";
import AnimatedOCRVisual from "@/components/home/AnimatedOCRVisual";
import AnimatedCounter from "@/components/home/AnimatedStatsCounter";
import ScrollDocFlow from "@/components/home/ScrollDocFlow";
import AnimatedSearchPreview from "@/components/home/AnimatedSearchPreview";
import BilingualOCRHero from "@/components/home/BilingualOCRHero";

import RotatingHeroWord from "@/components/home/RotatingHeroWord";
import TrustedBySection from "@/components/home/TrustedBySection";
import UAEHostingBadge from "@/components/common/UAEHostingBadge";
import ClientLogosCarousel from "@/components/home/ClientLogosCarousel";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BeforeAfterSection from "@/components/home/BeforeAfterSection";
import SecuritySection from "@/components/home/SecuritySection";
import AllInOneSection from "@/components/home/AllInOneSection";
import MadeByInfasme from "@/components/home/MadeByInfasme";
import VisualSlot from "@/components/cms/VisualSlot";
import EditableText from "@/components/cms/EditableText";
import EditableImage from "@/components/cms/EditableImage";
import EditableIcon from "@/components/cms/EditableIcon";
import CtaButton from "@/components/cms/CtaButton";
import EditableCardGrid from "@/components/cms/EditableCardGrid";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import { InlinePromotions } from "@/components/promotions/PromotionsHost";
import RevealAutoScanner from "@/components/cms/RevealAutoScanner";
import LeadCaptureCTA from "@/components/conversion/LeadCaptureCTA";
import { useEditMode } from "@/components/cms/EditModeContext";
import { industryLinkItems } from "@/lib/industryLinks";
import { localizeInternalPath } from "@/lib/localizedRoutes";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  const { t, isRTL } = useLanguage();
  const { getContent } = useSiteContent("home");
  const { getContent: getFaq } = useSiteContent("home", "faqs");
  const { enabled: editMode } = useEditMode();

  const stats = [
    { editKey: "stat_retrieval", value: getContent("stat_retrieval_value", "5s"), label: getContent("stat_retrieval_label", t("stats.retrieval")) },
    { editKey: "stat_time", value: getContent("stat_time_value", "80%"), label: getContent("stat_time_label", t("stats.time")) },
    { editKey: "stat_experience", value: getContent("stat_experience_value", "30+"), label: getContent("stat_experience_label", t("stats.experience")) },
    { editKey: "stat_smes", value: getContent("stat_smes_value", "3M+"), label: getContent("stat_smes_label", t("stats.smes")) },
  ];

  const features = [
    { key: "ocr", icon: Brain, title: getContent("feat_ocr_title", t("feat.ocr.title")), desc: getContent("feat_ocr_desc", t("feat.ocr.desc")) },
    { key: "search", icon: Search, title: getContent("feat_search_title", t("feat.search.title")), desc: getContent("feat_search_desc", t("feat.search.desc")) },
    { key: "security", icon: Shield, title: getContent("feat_security_title", t("feat.security.title")), desc: getContent("feat_security_desc", t("feat.security.desc")) },
    { key: "workflow", icon: Zap, title: getContent("feat_workflow_title", t("feat.workflow.title")), desc: getContent("feat_workflow_desc", t("feat.workflow.desc")) },
    { key: "access", icon: Globe, title: getContent("feat_access_title", t("feat.access.title")), desc: getContent("feat_access_desc", t("feat.access.desc")) },
    { key: "classify", icon: FileText, title: getContent("feat_classify_title", t("feat.classify.title")), desc: getContent("feat_classify_desc", t("feat.classify.desc")) },
  ];

  const industries = [
    { icon: Scale, name: t("ind.law-firms"), slug: "law-firms" },
    { icon: DollarSign, name: t("ind.accounting"), slug: "accounting" },
    { icon: Truck, name: t("ind.logistics"), slug: "logistics" },
    { icon: Building2, name: t("ind.real-estate"), slug: "real-estate" },
    { icon: Stethoscope, name: t("ind.healthcare"), slug: "healthcare" },
    { icon: GraduationCap, name: t("ind.education"), slug: "education" },
    { icon: Factory, name: t("ind.manufacturing"), slug: "manufacturing" },
    { icon: HardHat, name: t("ind.construction"), slug: "construction" },
    { icon: Landmark, name: t("ind.government"), slug: "government" },
    { icon: ShoppingBag, name: t("ind.import-export"), slug: "import-export" },
    { icon: Landmark, name: t("ind.banking-finance"), slug: "banking-finance" },
    { icon: Droplets, name: t("ind.oil-gas"), slug: "oil-gas" },
  ];

  const aiFeats = [
    getContent("ai_feat1", t("ai.feat1")),
    getContent("ai_feat2", t("ai.feat2")),
    getContent("ai_feat3", t("ai.feat3")),
    getContent("ai_feat4", t("ai.feat4")),
    getContent("ai_feat5", t("ai.feat5")),
  ];
  const rotatingWords = [
    getContent("hero_rotate1", t("hero.rotate1")),
    getContent("hero_rotate2", t("hero.rotate2")),
    getContent("hero_rotate3", t("hero.rotate3")),
  ];
  const featuredIndustryLinks = industryLinkItems.slice(0, 6);

  // Bilingual homepage FAQs (page=home, section=faqs). EN strings below
  // are canonical fallbacks; Arabic comes from CMS rows. SEOHead emits
  // these as JSON-LD in the active language so Arabic rich-results work.
  const FAQ_FALLBACK_EN: Array<{ q: string; a: string }> = [
    { q: "What is Digitize me?", a: "Digitize me is an AI-powered document management platform with industry-leading Arabic & English OCR (99%+ accuracy). It lets UAE businesses scan, classify, search and retrieve any document in seconds — available as SaaS or On-Premise." },
    { q: "Does Digitize me support Arabic OCR?", a: "Yes. Digitize me has native bilingual OCR for Arabic and English, including handwritten text and right-to-left layouts. It's used by banks, law firms, government and healthcare providers across the UAE and GCC." },
    { q: "Is there a free plan?", a: "Yes. The Individuals Edition is free forever for personal use, with cloud storage and access to the core OCR engine. Paid SMEs and Enterprise editions add automation, integrations and on-premise deployment." },
    { q: "Can Digitize me integrate with our ERP or CRM?", a: "Yes. Digitize me integrates with major ERPs (SAP, Oracle, Microsoft Dynamics), CRMs (Salesforce, HubSpot), and cloud storage (Google Drive, OneDrive, SharePoint) via pre-built connectors and a custom REST API." },
    { q: "Where is my data stored?", a: "On the SaaS plan, data is stored in encrypted UAE/GCC data centres. On the On-Premise plan, data stays entirely on your own infrastructure — Digitize me ships as a self-contained appliance with no outbound data transfer." },
  ];
  const HOME_FAQ_MAX = 8;
  const homeFaqs = Array.from({ length: HOME_FAQ_MAX }, (_, i) => {
    const n = i + 1;
    const fallback = FAQ_FALLBACK_EN[i];
    const question = getFaq(`faq_${n}_q`, fallback?.q ?? "");
    const answer = getFaq(`faq_${n}_a`, fallback?.a ?? "");
    return question && answer ? { question, answer } : null;
  }).filter((f): f is { question: string; answer: string } => f !== null);

  return (
    <Layout>
      <RevealAutoScanner page="home" />
      <SEOHead
        title={getContent("meta_title", "AI Document Management & Arabic OCR | Digitize me UAE")}
        description={getContent("meta_description", "AI document management platform with Arabic and English OCR, instant document search, and secure workflow automation for UAE teams.")}
        titleAr="إدارة المستندات بالذكاء الاصطناعي وOCR عربي | Digitize me الإمارات"
        descriptionAr="منصة لإدارة المستندات بالذكاء الاصطناعي مع OCR عربي وإنجليزي، وبحث فوري، وأتمتة آمنة لسير العمل لفرق العمل في الإمارات."
        path="/"
        pageKey="home"
        faqs={homeFaqs}
      />

      {/* 1. Hero */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dm-navy-light via-background to-dm-coral-light opacity-50" />
        <div className="container-max relative">
          <div className="max-w-3xl mx-auto text-center section-stack">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-2 md:mb-3">
                <Languages size={16} />
                <EditableText page="home" section="home" contentKey="hero_badge" fallback={t("hero.badge")} />
              </span>
            </motion.div>
            <motion.h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2 md:mb-3 ${isRTL ? "leading-[1.5] pb-2" : "leading-[1.05]"}`} initial="hidden" animate="visible" variants={fadeUp} custom={1}>
              <EditableText page="home" section="home" contentKey="hero_title" fallback={t("hero.title1")}  rich />{" "}
              <RotatingHeroWord words={rotatingWords} />
            </motion.h1>
            <EditableText
              as="p"
              page="home"
              section="home"
              contentKey="hero_desc"
              fallback={t("hero.desc")}
              multiline
              className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto"
             rich />
            <motion.div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-2" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
              <CtaButton ctaKey="hero_primary" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
                <EditableText page="home" section="home" contentKey="hero_cta1" fallback={t("hero.cta1")} />
                <ArrowRight size={18} className={isRTL ? "mr-2 rotate-180" : "ml-2"} />
              </CtaButton>
              <CtaButton ctaKey="hero_secondary" size="lg" variant="outline" className="px-8">
                <EditableText page="home" section="home" contentKey="hero_cta2" fallback={t("hero.cta2")} />
              </CtaButton>
              <LeadCaptureCTA source="home_hero" size="lg" variant="outline" className="px-8 bg-transparent border border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <EditableText page="home" section="home" contentKey="hero_talk_to_sales" fallback={isRTL ? "تحدث مع المبيعات" : "Talk to sales"} />
              </LeadCaptureCTA>
            </motion.div>
          </div>
          <motion.div className="mt-12 grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}>
            <EditableImage page="home" slotKey="hero_search_image" alt="Search preview">
              <AnimatedSearchPreview />
            </EditableImage>
            <EditableImage page="home" slotKey="hero_visual_image" alt="Hero visual">
              <AnimatedHeroVisual />
            </EditableImage>
          </motion.div>
        </div>
      </section>

      {/* 1b. Bilingual OCR interactive feature */}
      <BilingualOCRHero />

      {/* 2. Trusted By */}
      <TrustedBySection />
      <div className="container-max flex justify-center -mt-4 mb-2"><UAEHostingBadge /></div>
      <ClientLogosCarousel />

      {/* 3. Made by Infasme */}
      <MadeByInfasme />

      {/* 3b. Stats */}
      <section className="py-16 md:py-20 relative overflow-hidden border-y border-border/60 bg-background">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-48 bg-gradient-to-r from-transparent via-accent/5 to-transparent pointer-events-none"
        />
        <div className="container-max relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/60 rounded-2xl overflow-hidden border border-border/60 bg-card/40 backdrop-blur-sm">
            {stats.map((stat) => (
              <div
                key={stat.editKey}
                className="bg-card group relative px-4 py-8 md:py-10 text-center transition-colors hover:bg-accent/[0.03]"
              >
                <div className="mx-auto mb-3 h-px w-8 bg-accent/40 group-hover:w-12 group-hover:bg-accent transition-all duration-300" />
                <AnimatedCounter editKey={stat.editKey} value={stat.value} label={stat.label} />
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 4. How It Works */}
      <section className="section-padding bg-background" aria-label="Document Processing Workflow">
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <EditableText page="home" section="home" contentKey="workflow_badge" fallback={t("workflow.badge")} className="text-accent font-semibold text-sm uppercase tracking-wider" />
            <EditableText as="h2" page="home" section="home" contentKey="workflow_title" fallback={t("workflow.title")} className="text-2xl md:text-3xl font-bold text-foreground mt-2 mb-3"  rich />
            <EditableText as="p" page="home" section="home" contentKey="workflow_desc" fallback={t("workflow.desc")} multiline className="text-muted-foreground"  rich />
          </div>
          <EditableImage page="home" slotKey="workflow_image" alt="Document workflow">
            <ScrollDocFlow />
          </EditableImage>
        </div>
      </section>

      {/* 5. AI & OCR */}
      <section aria-label="AI and OCR Technology" className="section-padding bg-muted/20">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className={isRTL ? "md:order-2" : ""}>
              <EditableText page="home" section="home" contentKey="ai_badge" fallback={t("ai.badge")} className="text-accent font-semibold text-sm uppercase tracking-wider" />
              <EditableText as="h2" page="home" section="home" contentKey="ai_title" fallback={t("ai.title")} className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4"  rich />
              <EditableText as="p" page="home" section="home" contentKey="ai_desc" fallback={t("ai.desc")} multiline className="text-muted-foreground mb-6"  rich />
              <ul className="space-y-3">
                {aiFeats.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={18} className="text-accent mt-0.5 shrink-0" />
                    <EditableText page="home" section="home" contentKey={`ai_feat${i + 1}`} fallback={item} className="text-foreground" />
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className={isRTL ? "md:order-1" : ""}>
              <EditableImage page="home" slotKey="ai_ocr_image" alt="OCR illustration">
                <AnimatedOCRVisual />
              </EditableImage>
            </motion.div>
          </div>
        </div>
      </section>


      {/* 7. All-in-One */}
      <AllInOneSection />

      {/* 8. Before/After */}
      <BeforeAfterSection />

      {/* 8b. Testimonials */}
      <TestimonialsSection />

      {/* 9. Security */}
      <SecuritySection />

      {/* 10. Industries */}
      <section aria-label="Industries We Serve" className="section-padding bg-muted/20">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center mb-10 md:mb-12">
            <div className="text-center md:text-start max-w-2xl">
              <EditableText page="home" section="home" contentKey="industries_badge" fallback={t("industries.badge")} className="text-accent font-semibold text-sm uppercase tracking-wider" />
              <EditableText as="h2" page="home" section="home" contentKey="industries_title" fallback={t("industries.title")} className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4"  rich />
              <EditableText as="p" page="home" section="home" contentKey="industries_desc" fallback={t("industries.desc")} multiline className="text-muted-foreground"  rich />
            </div>
            <div className="relative w-full max-w-[15rem] md:max-w-xs mx-auto aspect-square">
              <motion.div
                className="absolute inset-0 rounded-full border border-accent/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const angle = (i / 6) * 360;
                  const icons = [Scale, Stethoscope, Factory, GraduationCap, Building2, Truck];
                  const Icon = icons[i];
                  return (
                    <motion.div key={i} className="absolute w-10 h-10 md:w-11 md:h-11 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center"
                      style={{ top: `${50 - 45 * Math.cos((angle * Math.PI) / 180)}%`, left: `${50 + 45 * Math.sin((angle * Math.PI) / 180)}%`, transform: "translate(-50%, -50%)" }}
                      animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    >
                      <Icon size={18} className="text-accent shrink-0" />
                    </motion.div>
                  );
                })}
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" as const }}
                >
                  <Globe size={28} className="text-accent" />
                </motion.div>
              </div>
            </div>
          </div>
          <EditableCardGrid
            page="home"
            gridKey="industry_tiles"
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            seeds={industries.map((industry) => ({
              key: industry.slug,
              icon: industry.icon,
              title: industry.name,
              desc: "",
            }))}
            renderCard={({ id, index, icon, title, animClass }) => {
              const href = localizeInternalPath(`/industries/${id}`, isRTL ? "ar" : "en");
              const content = (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={index * 0.5}
                  className={`block rounded-xl border border-border bg-card p-5 transition-all group h-full ${animClass}`}
                >
                  <div className="mb-3 flex items-center">{icon}</div>
                  <div className="text-base font-semibold text-foreground group-hover:text-accent transition-colors leading-snug">
                    {title}
                  </div>
                </motion.div>
              );

              return editMode ? content : <Link to={href}>{content}</Link>;
            }}
          />
          <div className="text-center mt-8">
            <CtaButton ctaKey="home_industries_viewall" variant="outline" defaultStyle={{ variant: "outline" }}>
              {t("industries.viewAll")} <ArrowRight size={16} className={isRTL ? "mr-2 rotate-180" : "ml-2"} />
            </CtaButton>
          </div>
          <div className="mt-10 rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                  {isRTL ? "روابط صناعية موجهة" : "Industry landing pages"}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">
                  {isRTL ? "استكشف حلول إدارة المستندات حسب القطاع" : "Explore document management solutions by industry"}
                </h3>
              </div>
              <Link to={localizeInternalPath("/industries", isRTL ? "ar" : "en")} className="text-sm font-semibold text-accent hover:text-accent/80">
                {isRTL ? "عرض جميع صفحات القطاعات" : "Browse all industry pages"}
              </Link>
            </div>
            <EditableCardGrid
              page="home"
              gridKey="industry_links"
              className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              seeds={featuredIndustryLinks.map((industry, index) => ({
                key: industry.slug,
                icon: [Scale, Stethoscope, Factory, GraduationCap, Building2, Truck][index % 6],
                title: isRTL ? industry.titleAr : industry.titleEn,
                desc: isRTL ? industry.descriptionAr : industry.descriptionEn,
              }))}
              renderCard={({ id, index, title, desc, animClass }) => {
                const href = localizeInternalPath(`/industries/${id}`, isRTL ? "ar" : "en");
                const content = (
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={index}
                    className={`rounded-xl border border-border bg-background px-4 py-4 transition-all hover:border-accent/40 hover:shadow-md h-full ${animClass}`}
                  >
                    <div className="text-sm font-semibold text-foreground">{title}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{desc}</div>
                  </motion.div>
                );

                return editMode ? content : <Link to={href}>{content}</Link>;
              }}
            />
          </div>
        </div>
      </section>

      {/* Inline promotions managed from Admin → Promotions */}
      <InlinePromotions />

      {/* Custom admin-added blocks render before the final CTA */}
      <CustomBlocksRenderer page="home" />

      {/* 11. Final CTA */}
      <section className="section-padding bg-accent/10">
        <div className="container-max text-center">
          <EditableText as="h2" page="home" section="home" contentKey="cta_title" fallback={t("cta.title")} className="text-3xl md:text-4xl font-bold text-foreground mb-4"  rich />
          <EditableText as="p" page="home" section="home" contentKey="cta_desc" fallback={t("cta.desc")} multiline className="text-muted-foreground max-w-xl mx-auto mb-8 text-lg"  rich />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CtaButton ctaKey="home_cta_start" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
              <EditableText page="home" section="home" contentKey="cta_start" fallback={t("cta.start")} />
            </CtaButton>
            <CtaButton ctaKey="home_cta_sales" size="lg" variant="outline" className="px-8">
              <EditableText page="home" section="home" contentKey="cta_sales" fallback={t("cta.sales")} />
            </CtaButton>
          </div>
        </div>
      </section>

      <AddBlockButton page="home" />
    </Layout>
  );
};

export default Index;
