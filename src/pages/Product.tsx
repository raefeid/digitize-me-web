import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Shield, Zap, Globe, FileText, Brain, Scan, Languages, CheckCircle, ArrowRight, Cloud, Server, Smartphone, Lock, BarChart3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";

import ScrollFeatureShowcase from "@/components/product/ScrollFeatureShowcase";
import AnimatedWorkflow from "@/components/product/AnimatedWorkflow";

import AnimatedWhyDifferent from "@/components/product/AnimatedWhyDifferent";
import EditableText from "@/components/cms/EditableText";
import EditableImage from "@/components/cms/EditableImage";
import EditableIcon from "@/components/cms/EditableIcon";
import CtaButton from "@/components/cms/CtaButton";
import EditableCardGrid from "@/components/cms/EditableCardGrid";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import RevealAutoScanner from "@/components/cms/RevealAutoScanner";
import { useEditMode } from "@/components/cms/EditModeContext";
import { industryLinkItems } from "@/lib/industryLinks";
import { localizeInternalPath } from "@/lib/localizedRoutes";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Product = () => {
  const { t, isRTL } = useLanguage();
  const { getContent } = useSiteContent("product");
  const { enabled: editMode } = useEditMode();

  // NOTE: Card titles/descs are stored in site_content as
  //   page=product, section=ai_features|diffs,
  //   content_key=card_<seedKey>__title | card_<seedKey>__desc
  // EditableCardGrid wraps each in <EditableText>, which already handles
  // EN/AR overrides. The fallbacks below are English canonical strings —
  // the Arabic versions live in CMS rows seeded for every key.
  const aiFeatures = [
    { key: "ai_lang", icon: Languages, title: "Arabic & English OCR", desc: "Industry-leading bilingual OCR with 99%+ accuracy on printed and handwritten text." },
    { key: "ai_classify", icon: Brain, title: "AI Classification", desc: "Automatically classify documents by type, department, and priority without manual intervention." },
    { key: "ai_extract", icon: Scan, title: "Intelligent Data Extraction", desc: "Extract key fields, names, dates, amounts, reference numbers, from any document format." },
    { key: "ai_search", icon: Search, title: "Full-Text Search", desc: "Search across millions of pages instantly. Find any document by content, metadata, or tag." },
    { key: "ai_tag", icon: FileText, title: "Auto Tagging & Metadata", desc: "AI generates tags and metadata automatically, making every document instantly searchable." },
    { key: "ai_analytics", icon: BarChart3, title: "Analytics & Insights", desc: "Track document volumes, processing times, and team productivity with built-in analytics." },
  ];

  const steps = [
    { step: "01", titleKey: "product_how_step1", descKey: "product_how_step1_desc", titleFallback: t("product.how.step1"), descFallback: t("product.how.step1.desc") },
    { step: "02", titleKey: "product_how_step2", descKey: "product_how_step2_desc", titleFallback: t("product.how.step2"), descFallback: t("product.how.step2.desc") },
    { step: "03", titleKey: "product_how_step3", descKey: "product_how_step3_desc", titleFallback: t("product.how.step3"), descFallback: t("product.how.step3.desc") },
    { step: "04", titleKey: "product_how_step4", descKey: "product_how_step4_desc", titleFallback: t("product.how.step4"), descFallback: t("product.how.step4.desc") },
  ];

  // Feature lists for SaaS / On-Prem cards. The EN values are canonical
  // fallbacks; per-language overrides live in site_content rows
  // (page=product, section=delivery_saas|delivery_onprem,
  // content_key=saas_featN | onprem_featN), edited via the admin panel.
  const saasFeats = [
    "Self-managed digitization",
    "Unlimited page ingestion",
    "Cloud storage included",
    "No IT team needed",
    "Arabic & English OCR",
    "Local payment options",
  ];

  const onpremFeats = [
    "Document collection & scanning",
    "AI verification & quality assurance",
    "Content tagging & indexing",
    "Warehouse & archival management",
    "Deployed on your infrastructure",
    "Dedicated support team",
  ];

  const diffs = [
    { key: "diff_ai", icon: Brain, title: "AI-Powered", desc: "Advanced AI for automatic data extraction, classification, and intelligent search." },
    { key: "diff_secure", icon: Lock, title: "Locally Secured", desc: "Enterprise-grade security with local data infrastructure." },
    { key: "diff_mobile", icon: Smartphone, title: "Mobile Ready", desc: "Access documents from any device, anywhere, anytime." },
    { key: "diff_versions", icon: RefreshCw, title: "Version Control", desc: "Track every change with full audit trail and history." },
    { key: "diff_integrate", icon: Zap, title: "Enterprise Integration", desc: "Seamlessly integrates with various ERP, CRM, HIS, and HR enterprise systems." },
  ];
  const productIndustryLinks = industryLinkItems.slice(0, 6);

  return (
    <Layout>
      <RevealAutoScanner page="product" />
      <SEOHead
        title={getContent("meta_title", "AI OCR & Document Management Features | Digitize me")}
        description={getContent("meta_description", "Explore Digitize me product features: Arabic OCR, AI classification, secure search, workflow automation, and SaaS or on-premise deployment.")}
        titleAr="ميزات OCR العربي وإدارة المستندات | Digitize me"
        descriptionAr="استكشف ميزات Digitize me: OCR عربي، وتصنيف بالذكاء الاصطناعي، وبحث آمن، وأتمتة سير العمل، وخيارات نشر سحابية أو محلية."
        path="/product"
        pageKey="product"
        jsonLd={{
          "@type": "SoftwareApplication",
          name: "Digitize me",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web, Windows, Linux",
          description:
            "AI-powered document management platform with Arabic & English OCR, auto-classification, full-text search, and ERP/CRM integrations.",
          offers: [
            {
              "@type": "Offer",
              name: "Individuals Edition",
              price: "0",
              priceCurrency: "AED",
              availability: "https://schema.org/InStock",
            },
            {
              "@type": "Offer",
              name: "SMEs Edition",
              price: "299",
              priceCurrency: "AED",
              availability: "https://schema.org/InStock",
            },
          ],
          featureList: [
            "Arabic & English OCR with 99%+ accuracy",
            "AI-powered document classification",
            "Full-text search across millions of pages",
            "Workflow automation",
            "Cloud & On-Premise deployment",
            "ERP, CRM and cloud-storage integrations",
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "150",
          },
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-dm-navy-light via-accent/5 to-background px-4 py-14 md:py-20">
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative mx-auto w-full max-w-5xl text-center">
          <EditableText
            as="h1"
            page="product"
            section="hero"
            contentKey="product_title"
            fallback={t("product.title")}
            className="gradient-text block text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]"
            rich
          />
          <EditableText
            as="p"
            page="product"
            section="hero"
            contentKey="product_desc"
            fallback={t("product.desc")}
            multiline
            className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl"
            rich
          />
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <CtaButton ctaKey="product_cta_demo" size="lg" className="bg-accent px-8 text-accent-foreground hover:bg-accent/90">
              <EditableText page="product" section="hero" contentKey="hero_cta_demo_label" fallback={t("common.bookDemo")} />
              <ArrowRight size={16} className={isRTL ? "mr-2 rotate-180" : "ml-2"} />
            </CtaButton>
            <CtaButton ctaKey="product_cta_pricing" size="lg" variant="outline" className="px-8">
              <EditableText page="product" section="hero" contentKey="hero_cta_pricing_label" fallback={t("common.viewPricing")} />
            </CtaButton>
          </div>
        </div>
      </section>


      {/* AI OCR */}
      <section id="ai-ocr" className="section-padding bg-background">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <EditableText page="product" section="ai" contentKey="product_ai_badge" fallback={t("product.ai.badge")} className="text-accent font-semibold text-sm uppercase tracking-wider" />
            <EditableText as="h2" page="product" section="ai" contentKey="product_ai_title" fallback={t("product.ai.title")} className="text-3xl md:text-5xl font-bold text-foreground mt-3 mb-4 block" rich />
            <EditableText as="p" page="product" section="ai" contentKey="product_ai_desc" fallback={t("product.ai.desc")} multiline className="text-muted-foreground text-lg" rich />
          </div>
          <ScrollFeatureShowcase features={aiFeatures} />
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-muted/30">
        <div className="container-max">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <EditableText page="product" section="how" contentKey="product_how_badge" fallback={t("product.how.badge")} className="text-accent font-semibold text-sm uppercase tracking-wider" />
            <EditableText as="h2" page="product" section="how" contentKey="product_how_title" fallback={t("product.how.title")} className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4 block" rich />
          </div>
          <EditableImage page="product" slotKey="how_workflow" alt="Workflow">
            <AnimatedWorkflow />
          </EditableImage>
          <EditableCardGrid
            page="product"
            gridKey="workflow_steps"
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10"
            seeds={steps.map((step, index) => ({
              key: step.step,
              icon: [Cloud, Server, Smartphone, Lock][index % 4],
              title: getContent(step.titleKey, step.titleFallback),
              desc: getContent(step.descKey, step.descFallback),
            }))}
            renderCard={({ index, title, desc, animClass }) => (
              <motion.div className={`text-center h-full ${animClass}`} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}>
                <div className="icon-chip w-14 h-14 rounded-full mx-auto mb-4">
                  <span className="text-xl font-bold text-accent">{String(index + 1).padStart(2, "0")}</span>
                </div>
                {title}
                {desc}
              </motion.div>
            )}
          />
        </div>
      </section>

      {/* Delivery Models */}
      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <EditableText page="product" section="delivery" contentKey="product_delivery_badge" fallback={t("product.delivery.badge")} className="text-accent font-semibold text-sm uppercase tracking-wider" />
            <EditableText as="h2" page="product" section="delivery" contentKey="product_delivery_title" fallback={t("product.delivery.title")} className="text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4 block" rich />
          </div>
          <EditableCardGrid
            page="product"
            gridKey="delivery_models"
            className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"

            seeds={[
              { key: "saas", icon: Cloud, title: getContent("product_saas_title", t("product.saas.title")), desc: getContent("product_saas_desc", t("product.saas.desc")) },
              { key: "onpremise", icon: Server, title: getContent("product_onprem_title", t("product.onprem.title")), desc: getContent("product_onprem_desc", t("product.onprem.desc")) },
            ]}
            renderCard={({ id, index, icon, title, desc, animClass }) => {
              const feats = id === "saas" ? saasFeats : onpremFeats;
              const listSection = id === "saas" ? "delivery_saas" : "delivery_onprem";
              const ctaKey = id === "saas" ? "product_see_plans" : "product_contact_sales";
              const ctaLabel = id === "saas" ? t("product.seePlans") : t("product.contactSales");

              return (
                <motion.div id={id === "onpremise" ? "on-premise" : id} className={`rounded-2xl border border-border bg-card p-10 md:p-12 h-full flex flex-col ${animClass}`} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}>
                  <div className="mb-5 flex items-center">{icon}</div>
                  {title}
                  <div className="mb-8 text-base">{desc}</div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {feats.map((item, i) => (
                      <li key={`${id}-${i}`} className="flex items-center gap-2 text-base text-foreground">
                        <CheckCircle size={18} className="text-accent shrink-0" />
                        <EditableText page="product" section={listSection} contentKey={`${id === "saas" ? "saas" : "onprem"}_feat${i + 1}`} fallback={item} />
                      </li>
                    ))}
                  </ul>
                  <CtaButton ctaKey={ctaKey} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full">
                    <EditableText page="product" section="delivery" contentKey={`${id}_cta_label`} fallback={ctaLabel} />
                    <ArrowRight size={16} className={isRTL ? "mr-2 rotate-180" : "ml-2"} />
                  </CtaButton>

                </motion.div>
              );
            }}
          />
        </div>
      </section>

      {/* Why Different */}
      <section className="section-padding bg-muted/30">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-10 items-center mb-12">
            <EditableImage page="product" slotKey="diff_image" alt="Why different">
              <AnimatedWhyDifferent />
            </EditableImage>
            <div>
              <EditableText as="h2" page="product" section="diff" contentKey="product_diff_title" fallback={t("product.diff.title")} className="text-3xl md:text-4xl font-bold text-foreground mb-4 block" rich />
            </div>
          </div>
          <EditableCardGrid
            page="product"
            gridKey="diffs"
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            seeds={diffs.map((d) => ({ key: d.key, icon: d.icon, title: d.title, desc: d.desc }))}
            renderCard={({ index, icon, title, desc, animClass }) => (
              <motion.div className={`text-center p-6 h-full ${animClass}`} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}>
                <div className="icon-chip w-12 h-12 mx-auto mb-4">
                  {icon}
                </div>
                {title}
                {desc}
              </motion.div>
            )}
          />
        </div>
      </section>

      {/* Custom admin-added blocks */}
      <CustomBlocksRenderer page="product" />

      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="max-w-3xl">
            <EditableText
              page="product"
              section="industry_links"
              contentKey="industry_links_badge"
              fallback="Industry solutions"
              className="text-sm font-semibold uppercase tracking-wider text-accent"
            />
            <EditableText
              as="h2"
              page="product"
              section="industry_links"
              contentKey="industry_links_title"
              fallback="Jump to industry landing pages tied to your document workflows"
              className="mt-2 text-3xl md:text-4xl font-bold text-foreground block"
              rich
            />
            <EditableText
              as="p"
              page="product"
              section="industry_links"
              contentKey="industry_links_desc"
              fallback="Explore keyword-focused industry pages that show how OCR, document control, and workflow automation fit each business model."
              multiline
              className="mt-4 text-muted-foreground"
              rich
            />
          </div>
          <EditableCardGrid
            page="product"
            gridKey="industry_links"
            className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            seeds={productIndustryLinks.map((industry, index) => ({
              key: industry.slug,
              icon: [Cloud, Server, Smartphone, Lock, Brain, Zap][index % 6],
              title: isRTL ? industry.titleAr : industry.titleEn,
              desc: isRTL ? industry.descriptionAr : industry.descriptionEn,
            }))}
            renderCard={({ id, index, title, desc, animClass }) => {
              const href = localizeInternalPath(`/industries/${id}`, isRTL ? "ar" : "en");
              const content = (
                <motion.div className={`rounded-xl border border-border bg-card px-5 py-5 transition-all hover:border-accent/40 hover:shadow-md h-full ${animClass}`} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}>
                  <div className="text-base font-semibold text-foreground">{title}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{desc}</div>
                </motion.div>
              );

              return editMode ? content : <Link to={href}>{content}</Link>;
            }}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-max text-center">
          <EditableText as="h2" page="product" section="cta" contentKey="product_cta_title" fallback={t("product.cta.title")} className="text-3xl md:text-4xl font-bold mb-4 block" rich />
          <EditableText as="p" page="product" section="cta" contentKey="product_cta_desc" fallback={t("product.cta.desc")} multiline className="text-primary-foreground/70 max-w-xl mx-auto mb-8" rich />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CtaButton ctaKey="product_cta_demo" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
              <EditableText page="product" section="cta" contentKey="cta_demo_label" fallback={t("common.bookDemo")} />
            </CtaButton>
            <CtaButton ctaKey="product_cta_pricing" size="lg" variant="outline" className="bg-white border-white text-primary hover:bg-white/90 px-8">
              <EditableText page="product" section="cta" contentKey="cta_pricing_label" fallback={t("common.viewPricing")} />
            </CtaButton>
          </div>
        </div>
      </section>

      <AddBlockButton page="product" />
    </Layout>
  );
};

export default Product;
