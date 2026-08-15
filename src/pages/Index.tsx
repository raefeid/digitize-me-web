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
// Locally bundled, optimized photos (real Vite assets → URL string).
import indLaw from "@/assets/industries/industry_law_firms.jpg";
import indRealEstate from "@/assets/industries/industry_real_estate.jpg";
import indHealthcare from "@/assets/industries/industry_healthcare.jpg";
import indGovernment from "@/assets/industries/industry_government.jpg";
import indAccounting from "@/assets/industries/industry_accounting.jpg";
import indBanking from "@/assets/industries/industry_banking.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  
  const { t, isRTL } = useLanguage();
  const { getContent } = useSiteContent("home");
  const { getContent: getFaq } = useSiteContent("home", "faqs");
  const { enabled: editMode } = useEditMode();
  const [heroScene, setHeroScene] = useState(0);

  const stats = [
    { editKey: "stat_retrieval", value: getContent("stat_retrieval_value", "5s"), label: getContent("stat_retrieval_label", t("stats.retrieval")) },
    { editKey: "stat_time", value: getContent("stat_time_value", "80%"), label: getContent("stat_time_label", t("stats.time")) },
    { editKey: "stat_experience", value: getContent("stat_experience_value", "30+"), label: getContent("stat_experience_label", t("stats.experience")) },
    { editKey: "stat_smes", value: getContent("stat_smes_value", "3M+"), label: getContent("stat_smes_label", t("stats.smes")) },
  ];


  const industries = [
    { icon: Scale, name: t("ind.law-firms"), slug: "law-firms", image: indLaw },
    { icon: DollarSign, name: t("ind.accounting"), slug: "accounting", image: indAccounting },
    { icon: Building2, name: t("ind.real-estate"), slug: "real-estate", image: indRealEstate },
    { icon: Stethoscope, name: t("ind.healthcare"), slug: "healthcare", image: indHealthcare },
    { icon: Landmark, name: t("ind.government"), slug: "government", image: indGovernment },
    { icon: Landmark, name: t("ind.banking-finance"), slug: "banking-finance", image: indBanking },
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
    getContent("hero_rotate4", t("hero.rotate4")),
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
      <section className="relative overflow-hidden -mt-20 md:-mt-24 min-h-[100svh] flex flex-col justify-center pt-32 pb-16 md:pt-36 md:pb-20">
        <HeroBackdrop activeScene={heroScene} />
        <div className="container-max relative w-full">
          <div className={`max-w-3xl section-stack ${isRTL ? "text-right ml-auto" : "text-left mr-auto"}`}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--hero-navy)/0.45)] text-[hsl(var(--hero-on-navy))] text-sm font-medium mb-2 md:mb-3 backdrop-blur-sm border border-[hsl(var(--hero-on-navy)/0.22)] drop-shadow-[0_2px_14px_hsl(var(--hero-navy)/0.65)]">
                <Languages size={16} />
                <EditableText page="home" section="home" contentKey="hero_badge" fallback={t("hero.badge")} />
              </span>
            </motion.div>
            <motion.h1 className={`text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[hsl(var(--hero-on-navy))] drop-shadow-[0_3px_24px_hsl(var(--hero-navy)/0.85)] mb-3 md:mb-5 ${isRTL ? "text-right leading-[1.4] pb-2" : "text-left leading-[1.05]"}`} initial="hidden" animate="visible" variants={fadeUp} custom={1}>
              <span className="inline drop-shadow-[0_3px_18px_hsl(var(--hero-navy)/0.9)]">
                <EditableText page="home" section="home" contentKey="hero_title" fallback={t("hero.title1")} rich />
              </span>{" "}
              <RotatingHeroWord words={rotatingWords} className="inline whitespace-nowrap" onIndexChange={setHeroScene} />
            </motion.h1>
            <div className={`h-[3px] w-14 rounded-full bg-accent mb-4 drop-shadow-[0_2px_10px_hsl(var(--accent)/0.6)] ${isRTL ? "ml-0 mr-auto" : "mr-auto"}`} />
            <EditableText
              as="p"
              page="home"
              section="home"
              contentKey="hero_desc"
              fallback={t("hero.desc")}
              multiline
              className="block text-base sm:text-lg md:text-xl text-[hsl(var(--hero-on-navy)/0.95)] max-w-2xl whitespace-normal sm:whitespace-pre-line drop-shadow-[0_2px_14px_hsl(var(--hero-navy)/0.75)]"
             rich />

            <motion.div className={`flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 ${isRTL ? "sm:justify-end" : "sm:justify-start"}`} initial="hidden" animate="visible" variants={fadeUp} custom={3}>
              <CtaButton ctaKey="hero_primary" size="lg" className="w-full sm:w-auto rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-7 sm:px-9 h-14 text-base shadow-[0_10px_40px_-12px_hsl(var(--accent)/0.7)]">
                <EditableText page="home" section="home" contentKey="hero_cta1" fallback={t("hero.cta1")} />
                <ArrowRight size={18} className={isRTL ? "mr-2 rotate-180" : "ml-2"} />
              </CtaButton>
              <CtaButton ctaKey="hero_secondary" defaultTo="/contact" size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-7 sm:px-9 h-14 text-base border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm">
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



      {/* 4. All-in-One */}
      <AllInOneSection />

      {/* 5. AI & OCR section removed — consolidated into the interactive BilingualOCRHero above. */}


      {/* 7. How It Works */}
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
              <EditableText as="h2" page="home" section="home" contentKey="industries_title" fallback={t("industries.title")} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2 mb-4 whitespace-pre-line" rich />
              <EditableText as="p" page="home" section="home" contentKey="industries_desc" fallback={t("industries.desc")} multiline className="text-muted-foreground text-base md:text-lg"  rich />
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

              {/* industry tile grid — 2 cols inside the half-width column, 3 on xl */}
              <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {industries.map((industry, index) => {
                  const href = localizeInternalPath(`/industries/${industry.slug}`, isRTL ? "ar" : "en");
                  const card = (
                    <motion.div
                      initial={{ opacity: 0, y: 28, scale: 0.96 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -6 }}
                      className="group relative rounded-2xl border border-border bg-card h-full overflow-hidden shadow-sm hover:shadow-xl hover:border-accent/50 transition-[box-shadow,border-color] duration-300"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={industry.image}
                          alt={`${industry.name} team managing documents in a UAE office`}
                          loading="lazy"
                          width={1024}
                          height={768}
                          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
                        />
                        {/* gradient scrim for title legibility */}
                        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                        {/* accent sheen sweep on hover */}
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                        <div className={`absolute bottom-0 inset-x-0 p-4 sm:p-5 md:p-6 ${isRTL ? "text-right" : "text-left"}`}>
                          <div className="text-sm sm:text-base md:text-lg font-semibold text-white leading-snug break-words hyphens-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                            {industry.name}
                          </div>

                          <div className="mt-2 h-[2px] w-8 rounded-full bg-accent transition-all duration-300 group-hover:w-16" />
                        </div>
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
