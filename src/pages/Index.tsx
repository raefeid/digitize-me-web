import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Clock, CheckCircle, ArrowRight, Scan, Languages, Building2, Scale, Stethoscope, Landmark, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import HeroVideoModal from "@/components/home/HeroVideoModal";
import AnimatedHeroVisual from "@/components/home/AnimatedHeroVisual";
import AnimatedOCRVisual from "@/components/home/AnimatedOCRVisual";
import AnimatedCounter from "@/components/home/AnimatedStatsCounter";
import ScrollDocFlow from "@/components/home/ScrollDocFlow";
import AnimatedSearchPreview from "@/components/home/AnimatedSearchPreview";
import BilingualOCRHero from "@/components/home/BilingualOCRHero";

import RotatingHeroWord from "@/components/home/RotatingHeroWord";
import HeroBackdrop from "@/components/home/HeroBackdrop";

import UAEHostingBadge from "@/components/common/UAEHostingBadge";
import ClientLogosCarousel from "@/components/home/ClientLogosCarousel";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BeforeAfterSection from "@/components/home/BeforeAfterSection";
import SecuritySection from "@/components/home/SecuritySection";
import AllInOneSection from "@/components/home/AllInOneSection";
import MadeByInfasme from "@/components/home/MadeByInfasme";
import TestimonialsProofSection from "@/components/home/TestimonialsProofSection";
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
  const [heroWordIndex, setHeroWordIndex] = useState(0);
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


  const industries = [
    { icon: Scale, name: t("ind.law-firms"), slug: "law-firms" },
    { icon: DollarSign, name: t("ind.accounting"), slug: "accounting" },
    { icon: Building2, name: t("ind.real-estate"), slug: "real-estate" },
    { icon: Stethoscope, name: t("ind.healthcare"), slug: "healthcare" },
    { icon: Landmark, name: t("ind.government"), slug: "government" },
    { icon: Landmark, name: t("ind.banking-finance"), slug: "banking-finance" },
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
  const featuredIndustryLinks = industryLinkItems.filter((i) =>
    ["law-firms", "accounting", "healthcare"].includes(i.slug)
  );

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
      <section className="relative overflow-hidden min-h-[100svh] flex flex-col justify-center pt-24 pb-10 md:pt-28 md:pb-14">
        <HeroBackdrop index={heroWordIndex} />
        <div className="container-max relative w-full">
          <div className={`max-w-2xl section-stack ${isRTL ? "text-right ml-auto" : "text-left mr-auto"}`}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-2 md:mb-3">
                <Languages size={16} />
                <EditableText page="home" section="home" contentKey="hero_badge" fallback={t("hero.badge")} />
              </span>
            </motion.div>
            <motion.h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-4 ${isRTL ? "text-right leading-[1.5] pb-2" : "text-left leading-[1.15]"}`} initial="hidden" animate="visible" variants={fadeUp} custom={1}>
              <span className="inline">
                <EditableText page="home" section="home" contentKey="hero_title" fallback={t("hero.title1")} rich />
              </span>{" "}
              <RotatingHeroWord words={rotatingWords} className="inline" onIndexChange={setHeroWordIndex} />
            </motion.h1>
            <EditableText
              as="p"
              page="home"
              section="home"
              contentKey="hero_desc"
              fallback={t("hero.desc")}
              multiline
              className="block text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl whitespace-pre-line"
             rich />
            <motion.div className={`flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 ${isRTL ? "sm:justify-end" : "sm:justify-start"}`} initial="hidden" animate="visible" variants={fadeUp} custom={3}>
              <CtaButton ctaKey="hero_primary" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
                <EditableText page="home" section="home" contentKey="hero_cta1" fallback={t("hero.cta1")} />
                <ArrowRight size={18} className={isRTL ? "mr-2 rotate-180" : "ml-2"} />
              </CtaButton>
              <CtaButton ctaKey="hero_secondary" size="lg" variant="outline" className="px-8">
                <EditableText page="home" section="home" contentKey="hero_cta2" fallback={t("hero.cta2")} />
              </CtaButton>
            </motion.div>
          </div>
        </div>
      </section>


      {/* 1b. Bilingual OCR interactive feature */}
      <BilingualOCRHero />

      {/* 1c. Hero video */}
      <section className="pb-12 md:pb-16">
        <div className="container-max">
          <motion.div className="max-w-6xl mx-auto" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <HeroVideoModal />
          </motion.div>
        </div>
      </section>

      {/* 2. Trusted By */}
      <ClientLogosCarousel />
      <div className="container-max flex justify-center -mt-4 mb-2"><UAEHostingBadge /></div>

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
          <div className="text-center max-w-3xl mx-auto mb-10">
            <EditableText page="home" section="home" contentKey="workflow_badge" fallback={t("workflow.badge")} className="text-accent font-semibold text-sm uppercase tracking-wider" />
            <EditableText as="h2" page="home" section="home" contentKey="workflow_title" fallback={t("workflow.title")} className="text-2xl md:text-3xl font-bold text-foreground mt-2 mb-3"  rich />
            <EditableText as="p" page="home" section="home" contentKey="workflow_desc" fallback={t("workflow.desc")} multiline className="text-muted-foreground"  rich />
          </div>
          <EditableImage page="home" slotKey="workflow_image" alt="Document workflow">
            <ScrollDocFlow />
          </EditableImage>
        </div>
      </section>

      {/* 5. AI & OCR section removed — consolidated into the interactive BilingualOCRHero above. */}


      {/* 7. All-in-One */}
      <AllInOneSection />

      {/* 8. Before/After */}
      <BeforeAfterSection />

      {/* 8b. Testimonials + proof stats */}
      <TestimonialsProofSection />
      <TestimonialsSection />

      {/* 9. Security */}
      <SecuritySection />

      {/* 10. Industries */}
      <section aria-label="Industries We Serve" className="section-padding bg-muted/20">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* LEFT half — copy */}
            <div className="text-center lg:text-start">
              <EditableText page="home" section="home" contentKey="industries_badge" fallback={t("industries.badge")} className="text-accent font-semibold text-sm uppercase tracking-wider" />
              <EditableText as="h2" page="home" section="home" contentKey="industries_title" fallback={t("industries.title")} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4"  rich />
              <EditableText as="p" page="home" section="home" contentKey="industries_desc" fallback={t("industries.desc")} multiline className="text-muted-foreground text-base md:text-lg"  rich />
              <div className="mt-6 flex justify-center lg:justify-start">
                <CtaButton ctaKey="home_industries_viewall" variant="outline" defaultStyle={{ variant: "outline" }}>
                  {t("industries.viewAll")} <ArrowRight size={16} className={isRTL ? "mr-2 rotate-180" : "ml-2"} />
                </CtaButton>
              </div>
            </div>

            {/* RIGHT half — orbit background + 3x2 industry tile grid */}
            <div className="relative w-full">
              {/* Decorative orbit behind tiles */}
              <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="relative w-full max-w-[520px] aspect-square opacity-60">

                  <motion.div
                    className="absolute inset-0 rounded-full border border-accent/15"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "50% 50%" }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const angle = (i / 6) * 360;
                      const rad = (angle * Math.PI) / 180;
                      // Position on a circle of radius 45% around center — no CSS transforms on the tile,
                      // so motion's rotate cleanly counter-rotates and the icons stay level.
                      const size = 40;
                      return (
                        <motion.div
                          key={i}
                          className="absolute w-10 h-10 rounded-xl bg-card/80 backdrop-blur border border-border shadow-sm flex items-center justify-center"
                          style={{
                            top: `${50 - 45 * Math.cos(rad)}%`,
                            left: `${50 + 45 * Math.sin(rad)}%`,
                            marginLeft: -size / 2,
                            marginTop: -size / 2,
                          }}
                          animate={{ rotate: -360 }}
                          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                        >
                          <Globe size={16} className="text-accent/60" />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>

              {/* 3x2 industry tile grid */}
              <div className="relative grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {industries.map((industry, index) => {
                  const Icon = industry.icon;
                  const href = localizeInternalPath(`/industries/${industry.slug}`, isRTL ? "ar" : "en");
                  const card = (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.07, duration: 0.45 }}
                      className="rounded-2xl border border-border bg-card p-5 md:p-6 h-full min-h-[130px] flex flex-col justify-between shadow-sm hover:shadow-md hover:border-accent/40 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-3">
                        <Icon size={22} />
                      </div>
                      <div className="text-base md:text-lg font-semibold text-foreground leading-snug">
                        {industry.name}
                      </div>
                    </motion.div>
                  );
                  return editMode ? (
                    <div key={industry.slug}>{card}</div>
                  ) : (
                    <Link key={industry.slug} to={href} aria-label={industry.name}>
                      {card}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

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
                icon: [Scale, DollarSign, Stethoscope][index % 3],
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
      <section className="section-padding">
        <div className="container-max">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white px-6 py-16 md:px-16 md:py-24 shadow-2xl border border-white/5">
            {/* decorative glows */}
            <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="relative text-center max-w-3xl mx-auto">
              <EditableText as="h2" page="home" section="home" contentKey="cta_title" fallback={t("cta.title")} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight"  rich />
              <EditableText as="p" page="home" section="home" contentKey="cta_desc" fallback={t("cta.desc")} multiline className="text-white/75 max-w-2xl mx-auto mb-10 text-lg md:text-xl leading-relaxed"  rich />
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CtaButton ctaKey="home_cta_start" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-10 py-6 text-base md:text-lg font-semibold">
                  <EditableText page="home" section="home" contentKey="cta_start" fallback={t("cta.start")} />
                </CtaButton>
                <CtaButton ctaKey="home_cta_sales" size="lg" variant="outline" className="px-10 py-6 text-base md:text-lg font-semibold border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  <EditableText page="home" section="home" contentKey="cta_sales" fallback={t("cta.sales")} />
                </CtaButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AddBlockButton page="home" />
    </Layout>
  );
};

export default Index;
