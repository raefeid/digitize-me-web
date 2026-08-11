import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle, Scale, DollarSign, Truck, Building2, Stethoscope, GraduationCap, Factory, HardHat, Landmark, ShoppingBag, Droplets, Briefcase, ShieldCheck, LucideIcon } from "lucide-react";
import IndustryHeroAnimation from "@/components/industries/IndustryHeroAnimation";
import { RollingText } from "@/components/ui/RollingText";

import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { industryTranslationsAr } from "@/i18n/industryTranslations";
import EditableText from "@/components/cms/EditableText";
import EditableIcon from "@/components/cms/EditableIcon";
import CtaButton from "@/components/cms/CtaButton";
import EditableCardGrid from "@/components/cms/EditableCardGrid";
import EditableList from "@/components/cms/EditableList";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import RevealAutoScanner from "@/components/cms/RevealAutoScanner";
import SortableGrid from "@/components/cms/SortableGrid";
import { useDynamicIndustries } from "@/hooks/useDynamicIndustries";
import { useSiteContent, useSaveContent } from "@/hooks/useSiteContent";
import AddIndustryButton from "@/components/industries/AddIndustryButton";
import DeleteIndustryButton from "@/components/industries/DeleteIndustryButton";
import PublishIndustryButton from "@/components/industries/PublishIndustryButton";
import ReorderIndustriesButton from "@/components/industries/ReorderIndustriesButton";
import IndustrySeoOverrideEditor from "@/components/industries/IndustrySeoOverrideEditor";
import IndustryFaqSection from "@/components/industries/IndustryFaqSection";
import IndustryFeaturesGrid from "@/components/industries/IndustryFeaturesGrid";
import IndustryTestimonials from "@/components/industries/IndustryTestimonials";
import RelatedIndustries from "@/components/industries/RelatedIndustries";
import SolutionZigZag from "@/components/industries/SolutionZigZag";

import { buildIndustrySeo, buildIndustryFaqs, buildIndustryLandingContent, buildIndustryStructuredData } from "@/lib/industrySeo";
import { useEditMode } from "@/components/cms/EditModeContext";
import { useAuth } from "@/hooks/useAuth";
import { localizeInternalPath } from "@/lib/localizedRoutes";
import { getIndustryCardImage, industryCardAlt } from "@/lib/industryCardImages";


const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};


const Industries = () => {
  const { t, lang, isRTL } = useLanguage();
  const { publishedList: dynamicIndustries, getName: getCustomName } = useDynamicIndustries();
  const { enabled: editEnabled } = useEditMode();
  const { getContent } = useSiteContent("industries");
  const { items: orderItems } = useSiteContent("industries", "order");
  const saveContent = useSaveContent();

  // Persist new industry order — same shape as ReorderIndustriesButton uses,
  // so the modal and inline drag-handle stay in sync.
  const persistIndustryOrder = (next: typeof dynamicIndustries) => {
    const existing = orderItems.find(
      (i) => i.content_key === "slug_order" && i.content_type === "industry_order",
    );
    saveContent.mutate({
      id: existing?.id,
      page: "industries",
      section: "order",
      content_key: "slug_order",
      content_type: "industry_order",
      value: JSON.stringify(next.map((i) => i.slug)),
      value_ar: existing?.value_ar ?? null,
      sort_order: 0,
    });
  };

  return (
    <Layout>
      <RevealAutoScanner page="industries" />
      <SEOHead
        title={getContent("meta_title", "Industries for AI Document Management | Digitize me")}
        description={getContent("meta_description", "Explore industry-specific AI document management and Arabic OCR solutions for law, healthcare, finance, logistics, construction, and more.")}
        titleAr="حلول القطاعات لإدارة المستندات بالذكاء الاصطناعي | Digitize me"
        descriptionAr="استكشف حلولًا متخصصة حسب القطاع لإدارة المستندات بالذكاء الاصطناعي وOCR العربي لقطاعات القانون والصحة والمالية واللوجستيات والإنشاءات وغيرها."
        path="/industries"
        pageKey="industries"
      />
      <section className="section-padding bg-gradient-to-b from-dm-navy-light to-background">
        <div className="container-max text-center max-w-3xl mx-auto">
          <EditableText page="industries" section="hero" contentKey="badge" fallback={t("industries.badge")} className="text-accent font-semibold text-sm uppercase tracking-wider" />
          <EditableText as="h1" page="industries" section="hero" contentKey="title" fallback={t("industries.pageTitle")} className="text-4xl md:text-5xl font-bold text-foreground mt-3 mb-6 block" rich />
          <EditableText as="p" page="industries" section="hero" contentKey="desc" fallback={t("industries.pageDesc")} multiline className="text-lg text-muted-foreground" rich />
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-max">
          {editEnabled && (
            <div className="mb-6 flex justify-end">
              <ReorderIndustriesButton />
            </div>
          )}
          <SortableGrid
            items={dynamicIndustries.map((i) => ({ ...i, id: i.slug }))}
            editMode={editEnabled}
            onReorder={(next) => persistIndustryOrder(next)}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            trailing={<AddIndustryButton existingSlugs={dynamicIndustries.map((i) => i.slug)} />}
            renderItem={(industry, dragHandle) => {
              const Icon = industry.icon;
              const displayName = industry.isCustom
                ? getCustomName(industry.slug, lang === "ar" ? "ar" : "en") || industry.name
                : t(`ind.${industry.slug}`);
              const description = industry.isCustom
                ? null
                : `${(lang === "ar"
                    ? industryTranslationsAr[industry.slug]?.description.slice(0, 120) || industry.description.slice(0, 120)
                    : industry.description.slice(0, 120))}...`;
              const isDraft = !!industry.isCustom && !industry.published;

              const photo = getIndustryCardImage(industry.slug);

              return (
                <div className="h-full relative group">
                  {dragHandle}
                  {industry.isCustom && (
                    <DeleteIndustryButton slug={industry.slug} name={displayName} />
                  )}
                  <Link
                    to={`/industries/${industry.slug}`}
                    className={`flex flex-col rounded-xl border bg-card h-full overflow-hidden transition-all duration-[250ms] will-change-transform hover:-translate-y-1 ${
                      photo ? "" : "p-6"
                    } ${
                      isDraft
                        ? "border-accent/50 border-dashed hover:border-accent"
                        : "border-border hover:border-accent/30 hover:shadow-lg"
                    }`}
                  >
                    {photo ? (
                      <div className="relative">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={photo}
                            alt={industryCardAlt(displayName)}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-[250ms] ease-out group-hover:scale-[1.04]"
                          />
                        </div>
                        <span className="absolute -bottom-5 start-4 h-11 w-11 rounded-xl bg-background shadow-[0_6px_18px_-4px_hsl(220_25%_20%/0.28)] border border-border/60 flex items-center justify-center">
                          <Icon size={22} className="text-accent" />
                        </span>
                        {isDraft && editEnabled && (
                          <span className="absolute top-3 end-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 backdrop-blur">
                            Draft
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-start justify-between mb-4 gap-2">
                        <Icon size={28} className="text-accent" />
                        {isDraft && editEnabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
                            Draft
                          </span>
                        )}
                      </div>
                    )}
                    <div className={photo ? "p-6 pt-9 flex flex-col flex-1" : "flex flex-col flex-1"}>
                      <h2 className="text-lg font-bold text-foreground mb-2">{displayName}</h2>
                      {description ? (
                        <p className="text-sm text-muted-foreground">{description}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {editEnabled
                            ? isDraft
                              ? "Draft — only admins can see this. Click to edit, then publish."
                              : "Click to open and edit this industry's page."
                            : ""}
                        </p>
                      )}
                      <span className="text-sm font-medium text-accent flex items-center gap-1 mt-3">
                        {t("industries.learnMore")} {displayName} <ArrowRight size={14} className={isRTL ? "rotate-180" : ""} />
                      </span>
                    </div>
                  </Link>
                  {industry.isCustom && editEnabled && (
                    <div className="absolute bottom-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                      <PublishIndustryButton
                        slug={industry.slug}
                        name={displayName}
                        published={industry.published}
                      />
                    </div>
                  )}
                </div>
              );

            }}
          />
        </div>
      </section>


      <CustomBlocksRenderer page="industries" />

      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-max text-center">
          <EditableText as="h2" page="industries" section="cta" contentKey="dontSee_title" fallback={t("industries.dontSee")} className="text-3xl md:text-4xl font-bold mb-4 block" rich />
          <EditableText as="p" page="industries" section="cta" contentKey="dontSee_desc" fallback={t("industries.dontSeeDesc")} multiline className="text-primary-foreground/70 max-w-xl mx-auto mb-8" rich />
          <CtaButton ctaKey="industries_dontsee_cta" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
            <EditableText page="industries" section="cta" contentKey="dontSee_cta" fallback={t("common.contactUs")} />
          </CtaButton>
        </div>
      </section>

      <AddBlockButton page="industries" />
    </Layout>
  );
};

export default Industries;

export const IndustryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, isRTL, lang } = useLanguage();
  const { list, getName, isLoading } = useDynamicIndustries();
  const { isAdmin } = useAuth();
  const industryEn = list.find((i) => i.slug === slug);

  // While the dynamic list is loading, avoid prematurely showing "not found"
  // for a freshly-created custom industry.
  const showNotFound = (
    <Layout>
      <section className="section-padding">
        <div className="container-max text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">{t("industries.notFound")}</h1>
          <CtaButton ctaKey="industries_notfound_viewall">{t("industries.viewAll")}</CtaButton>
        </div>
      </section>
    </Layout>
  );

  if (!industryEn) {
    if (isLoading) {
      return (
        <Layout>
          <section className="section-padding">
            <div className="container-max text-center text-muted-foreground">Loading…</div>
          </section>
        </Layout>
      );
    }
    return showNotFound;
  }

  // Drafts (custom + unpublished) are admin-only — visitors get a 404-style page.
  const isDraft = !!industryEn.isCustom && !industryEn.published;
  if (isDraft && !isAdmin) {
    return showNotFound;
  }

  // Phase 3: Prefer Arabic content stored on the `industries` table row.
  // Fall back to the static `industryTranslationsAr` map for resilience and
  // for any industries not yet migrated.
  const dbArData = lang === "ar" && (industryEn.headlineAr || industryEn.descriptionAr || (industryEn.painPointsAr?.length ?? 0) > 0)
    ? {
        headline: industryEn.headlineAr || industryEn.headline,
        description: industryEn.descriptionAr || industryEn.description,
        painPoints: industryEn.painPointsAr?.length ? industryEn.painPointsAr : industryEn.painPoints,
        solutions: industryEn.solutionsAr?.length ? industryEn.solutionsAr : industryEn.solutions,
        useCases: industryEn.useCasesAr?.length ? industryEn.useCasesAr : industryEn.useCases,
        beforeAfter: industryEn.beforeAfterAr ?? industryEn.beforeAfter,
        cta: industryEn.ctaAr || industryEn.cta,
      }
    : undefined;
  const staticArData = !industryEn.isCustom ? industryTranslationsAr[slug || ""] : undefined;
  const arData = dbArData ?? (lang === "ar" ? staticArData : undefined);
  const localizedName = industryEn.isCustom
    ? getName(industryEn.slug, lang === "ar" ? "ar" : "en") || industryEn.name
    : (lang === "ar" && industryEn.nameAr) || t(`ind.${industryEn.slug}`);
  const industry = arData
    ? { ...industryEn, ...arData, name: localizedName }
    : { ...industryEn, name: localizedName };
  const landing = buildIndustryLandingContent(
    industry.name,
    {
      headline: industry.headline,
      description: industry.description,
      painPoints: industry.painPoints,
      solutions: industry.solutions,
      useCases: industry.useCases,
    },
    lang === "ar" ? "ar" : "en",
  );
  const semanticIndustryH1 = lang === "ar"
    ? `نظام إدارة المستندات لقطاع ${industry.name}`
    : `Document Management System for ${industry.name}`;
  const isLawFirms = slug === "law-firms";


  return (
    <Layout>
      <RevealAutoScanner page={`industry_${industry.slug}`} />
      {(() => {
        const seoEn = buildIndustrySeo(industryEn.name, industryEn.headline, "en");
        const seoAr = buildIndustrySeo(industryEn.name, industryEn.headline, "ar");
        const faqs = buildIndustryFaqs(
          industry.name,
          industry.painPoints,
          industry.solutions,
          lang === "ar" ? "ar" : "en",
        );
        const activeSeo = lang === "ar" ? seoAr : seoEn;
        return (
          <SEOHead
            title={seoEn.title}
            description={seoEn.description}
            titleAr={seoAr.title}
            descriptionAr={seoAr.description}
            path={`/industries/${slug}`}
            pageKey={`industry_${slug}`}
            robotsOverride={isDraft ? "noindex, nofollow" : "index, follow"}
            faqs={faqs}
            jsonLd={buildIndustryStructuredData({
              baseUrl: "https://www.digitizeme.ae",
              path: localizeInternalPath(`/industries/${slug}`, lang === "ar" ? "ar" : "en"),
              industryName: industry.name,
              industryDescription: industry.description,
              keywords: activeSeo.keywords,
              solutions: industry.solutions,
              useCases: industry.useCases,
              lang: lang === "ar" ? "ar" : "en",
            })}
          />
        );
      })()}
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="container-max pt-4 px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground" itemScope itemType="https://schema.org/BreadcrumbList">
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to={localizeInternalPath("/", lang === "ar" ? "ar" : "en")} itemProp="item" className="hover:text-foreground transition-colors"><span itemProp="name">{t("nav.home")}</span></Link>
            <meta itemProp="position" content="1" />
          </li>
          <li className="text-muted-foreground/50">/</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Link to={localizeInternalPath("/industries", lang === "ar" ? "ar" : "en")} itemProp="item" className="hover:text-foreground transition-colors"><span itemProp="name">{t("nav.industries")}</span></Link>
            <meta itemProp="position" content="2" />
          </li>
          <li className="text-muted-foreground/50">/</li>
          <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <span itemProp="name" className="text-foreground font-medium">{industry.name}</span>
            <meta itemProp="position" content="3" />
          </li>
        </ol>
      </nav>

      {/* Draft banner — admin sees this on unpublished custom industry pages */}
      {isDraft && (
        <div className="container-max px-4 sm:px-6 lg:px-8 mt-3">
          <div className="rounded-xl border border-accent/40 border-dashed bg-accent/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 shrink-0">
                Draft
              </span>
              <p className="text-sm text-muted-foreground">
                This page is only visible to admins. Finish editing the content, then publish it
                so it appears in the navbar and on /industries.
              </p>
            </div>
            <PublishIndustryButton slug={industry.slug} name={industry.name} published={false} />
          </div>
        </div>
      )}
      {/* Inline SEO override editor — admin + edit mode only */}
      {(() => {
        const seo = buildIndustrySeo(industry.name, industry.headline, "en");
        return (
          <IndustrySeoOverrideEditor
            slug={industry.slug}
            industryName={industry.name}
            headline={industry.headline}
            description={industry.description}
            painPoints={industry.painPoints}
            solutions={industry.solutions}
            useCases={industry.useCases}
            fallbackTitle={seo.title}
            fallbackDescription={seo.description}
          />
        );
      })()}
      <section className="section-padding bg-gradient-to-b from-dm-navy-light to-background">
        <div className="container-max max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:order-1"
          >
            {getIndustryCardImage(slug) ? (
              <div className="relative overflow-hidden rounded-3xl border border-border/60 shadow-xl bg-muted">
                <img
                  src={getIndustryCardImage(slug)}
                  alt={`${industry.name} document management with DigitizeMe`}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="w-full aspect-[16/9] md:aspect-[4/3] object-cover"
                />
                <div
                  className={`pointer-events-none absolute inset-0 ${isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-transparent via-dm-navy/5 to-dm-navy/35`}
                />
              </div>
            ) : (
              <div className="hidden md:block">
                <IndustryHeroAnimation icon={industryEn.icon} useLottie={isLawFirms} lottie={slug === "accounting" ? "calculator" : slug === "logistics" ? "delivery" : undefined} />
              </div>
            )}
          </motion.div>
          <div className="md:order-2">
            <h1 className="sr-only">{semanticIndustryH1}</h1>
            <motion.div className="flex items-center gap-3 mb-4" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <EditableIcon page="industries" slotKey={`detail_${slug}_icon`} size={32}>
                <industryEn.icon size={32} className="text-accent" />
              </EditableIcon>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">{landing.heroEyebrow}</span>
            </motion.div>
            <EditableText as="h2" page={`industry_${slug}`} section="hero" contentKey="headline" fallback={industry.headline} className="font-bold text-foreground mb-5 block text-balance text-4xl md:text-6xl leading-[1.12] pb-1" rich />
            <EditableText as="p" page={`industry_${slug}`} section="hero" contentKey="description" fallback={industry.description} multiline className="text-muted-foreground mb-8 text-base md:text-lg max-w-xl line-clamp-3" rich />
            <div className="flex flex-wrap gap-2 mb-8">
              {landing.keywordPillars.map((keyword) => (
                <span key={keyword} className="inline-flex px-3 py-1 rounded-full border border-accent/20 bg-accent/10 text-accent text-xs font-medium">
                  {keyword}
                </span>
              ))}
            </div>
            <motion.div className="flex gap-4" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
              <CtaButton ctaKey="industries_detail_demo" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <EditableText page={`industry_${slug}`} section="hero" contentKey="cta_demo_label" fallback={t("common.bookDemo")} />
                <ArrowRight size={16} className={isRTL ? "mr-2 rotate-180" : "ml-2"} />
              </CtaButton>
            </motion.div>

          </div>
        </div>
      </section>


      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">{`${industry.name}: ${t("industries.before")} / ${t("industries.after")}`}</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">

            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <span className="text-sm font-semibold text-destructive uppercase tracking-wider">{t("industries.before")}</span>
              <p className="text-lg font-bold text-foreground mt-2 block">
                <RollingText
                  text={industry.beforeAfter.before}
                  className="text-lg font-bold text-foreground"
                  numberClassName="text-3xl font-extrabold text-destructive mx-1"
                  duration={2.2}
                />
              </p>
            </div>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">{t("industries.after")}</span>
              <p className="text-lg font-bold text-foreground mt-2 block">
                <RollingText
                  text={industry.beforeAfter.after}
                  className="text-lg font-bold text-foreground"
                  numberClassName="text-3xl font-extrabold text-accent mx-1"
                  duration={2.2}
                />
              </p>
            </div>
          </div>
        </div>
      </section>

      <SolutionZigZag
        heading={landing.solutionHeading}
        intro={landing.solutionIntro}
        industryName={industry.name}
        items={industry.solutions.map((solution, i) => ({
          solution,
          problem: industry.painPoints[i],
        }))}
      />


      <section className="section-padding bg-muted/30">
        <div className="container-max">
          <h2 className="text-2xl font-bold text-foreground mb-3 text-center">{landing.useCasesHeading}</h2>
          <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto mb-8">{landing.useCasesIntro}</p>
          <EditableList
            page={`industry_${slug}`}
            listKey="use_cases"
            seeds={industry.useCases.map((uc, i) => ({ key: `uc_${i}`, text: uc }))}
            className="flex flex-wrap justify-center gap-3"
            renderItem={({ text }) => (
              <span className="inline-flex px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-foreground">
                {text}
              </span>
            )}
          />
        </div>
      </section>

      {/* Use cases → Features grid (internal links to /features/<slug>) */}
      <IndustryFeaturesGrid
        industryName={industry.name}
        useCases={industry.useCases}
        heading={landing.featuresHeading}
        intro={landing.featuresIntro}
      />

      {/* Industry-filtered testimonials */}
      <IndustryTestimonials industryName={industryEn.name} heading={landing.testimonialsHeading} />

      {/* FAQ — visible accordion + JSON-LD FAQPage emitted via SEOHead */}
      <IndustryFaqSection
        industryName={industry.name}
        heading={landing.faqHeading}
        intro={landing.faqIntro}
        faqs={buildIndustryFaqs(
          industry.name,
          industry.painPoints,
          industry.solutions,
          lang === "ar" ? "ar" : "en",
        )}
      />

      <CustomBlocksRenderer page={`industry_${slug}`} />

      {/* Related industries — internal cross-links */}
      <RelatedIndustries currentSlug={industry.slug} />

      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-max text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{landing.ctaHeading}</h2>
          <EditableText as="p" page={`industry_${slug}`} section="cta" contentKey="cta_quote" fallback={`"${industry.cta}"`} multiline className="text-xl md:text-2xl font-semibold italic mb-8 text-primary-foreground/90 block" rich />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CtaButton ctaKey="industries_detail_cta" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
              <EditableText
                page={`industry_${slug}`}
                section="cta"
                contentKey="cta_demo_label"
                as="span"
                fallback={`${t("industries.demoFor")} ${industry.name}`}
              />
            </CtaButton>
            <CtaButton
              ctaKey={`industries_detail_cta_pricing_${slug}`}
              customLocation={`Industry detail (${slug}) — Final CTA View pricing`}
              size="lg"
              variant="outline"
              defaultStyle={{ variant: "outline", size: "lg" }}
              className="bg-white border-white text-primary hover:bg-white/90 px-8"
              defaultTo="/pricing"
            >
              <EditableText page={`industry_${slug}`} section="cta" contentKey="cta_pricing_label" fallback={t("common.viewPricing")} />
            </CtaButton>
          </div>
        </div>
      </section>

      <AddBlockButton page={`industry_${slug}`} />
    </Layout>
  );
};
