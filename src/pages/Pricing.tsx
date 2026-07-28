import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, X, Sparkles, Globe } from "lucide-react";

import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSaveContent, useSiteContent } from "@/hooks/useSiteContent";
import { useGeo, Region } from "@/hooks/useGeoLocation";
import { formatRegionPrice, paymentGateways } from "@/config/regionPricing";
import { useCmsPricing } from "@/hooks/useCmsPricing";
import EditableText from "@/components/cms/EditableText";
import CtaButton from "@/components/cms/CtaButton";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import RevealAutoScanner from "@/components/cms/RevealAutoScanner";
import RoiCalculator from "@/components/pricing/RoiCalculator";
import { usePricingHighlightMap } from "@/hooks/usePricingHighlights";
import SortableGrid from "@/components/cms/SortableGrid";
import { useEditMode } from "@/components/cms/EditModeContext";
import { useTeamAccess } from "@/hooks/useTeamAccess";
import { industryLinkItems } from "@/lib/industryLinks";
import { localizeInternalPath } from "@/lib/localizedRoutes";
import UAEHostingBadge from "@/components/common/UAEHostingBadge";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const GEO_PREVIEW_OPTIONS: { key: Region; label: string }[] = [
  { key: "EG", label: "EGY" },
  { key: "SA", label: "SA" },
  { key: "AE", label: "UAE" },
  { key: "DEFAULT", label: "Globally" },
];

const isRegion = (value: string | null): value is Region =>
  value === "EG" || value === "SA" || value === "AE" || value === "DEFAULT";

const Pricing = () => {
  const { t, isRTL, lang } = useLanguage();
  const { can } = useTeamAccess();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getContent: getHero } = useSiteContent("pricing", "hero");
  const { getContent: getOnprem } = useSiteContent("pricing", "onprem");
  const { getContent: getFaq } = useSiteContent("pricing", "faq");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [previewRegion, setPreviewRegion] = useState<Region | null>(() => {
    const geoParam = searchParams.get("geo");
    return isRegion(geoParam) ? geoParam : null;
  });
  const { region, currency, currencySymbol, loading: geoLoading } = useGeo();
  const { items: planItems } = useSiteContent("pricing", "plans");
  const saveContent = useSaveContent();
  const canPreviewGeoComparison = can("pricing");
  const effectiveRegion = canPreviewGeoComparison ? previewRegion ?? region : region;
  const { catalog, planCards, plans: cmPlans, promos: cmPromos } = useCmsPricing(effectiveRegion);
  const { map: highlightMap } = usePricingHighlightMap();
  const { enabled: editEnabled } = useEditMode();

  const previewMeta: Record<Region, { currency: string; label: string }> = {
    EG: { currency: "EGP", label: "EGY" },
    SA: { currency: "SAR", label: "SA" },
    AE: { currency: "AED", label: "UAE" },
    DEFAULT: { currency: "USD", label: "Globally" },
  };
  const pricingIndustryLinks = industryLinkItems.slice(0, 8);

  useEffect(() => {
    if (!canPreviewGeoComparison) {
      setPreviewRegion(null);
      return;
    }
    const geoParam = searchParams.get("geo");
    const nextRegion = isRegion(geoParam) ? geoParam : null;
    setPreviewRegion((current) => (current === nextRegion ? current : nextRegion));
  }, [canPreviewGeoComparison, searchParams]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    if (canPreviewGeoComparison && previewRegion) {
      next.set("geo", previewRegion);
    } else {
      next.delete("geo");
    }

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [canPreviewGeoComparison, previewRegion, searchParams, setSearchParams]);

  // Helper: pick string by language (third arg kept for backwards-compat, ignored)
  const l = (en: string, ar: string, _fr?: string) =>
    lang === "ar" ? ar : en;

  const freeLabel = l("Free", "مجاني", "Gratuit");
  const period = l("/mo", "/شهر", "/mois");

  // Resolve the effective region price for a plan, honoring per-region
  // visibility flags. If a region is "hidden", we fall back to DEFAULT
  // (global) pricing. Returns the price entry plus the resolved region.
  const resolveRegionPrice = (planKey: string, source: Record<string, any>) => {
    const planPricing = source[planKey];
    const direct = planPricing?.[effectiveRegion];
    if (direct?.hidden && effectiveRegion !== "DEFAULT") {
      return { entry: planPricing?.DEFAULT, region: "DEFAULT" as Region, contactOnly: !!planPricing?.DEFAULT?.contactOnly };
    }
    return { entry: direct, region: effectiveRegion, contactOnly: !!direct?.contactOnly };
  };

  const rp = (planKey: string, source: Record<string, any>) => {
    const { entry, region: r } = resolveRegionPrice(planKey, source);
    if (!entry) return freeLabel;
    return formatRegionPrice(entry[billingCycle], r, period, freeLabel, isRTL);
  };

  // Returns a price object with optional discount info for rendering.
  const rpWithPromo = (planKey: string, source: Record<string, any>) => {
    const { entry: p, region: r, contactOnly } = resolveRegionPrice(planKey, source);
    const original = p?.[billingCycle] ?? null;
    const promo = (cmPromos as any)?.[planKey];
    const hasPromo =
      promo && original !== null && original > 0 && promo.discountPercent > 0;
    // Per-region override wins over % calculation when set.
    const override = promo?.overrides?.[r]?.[billingCycle];
    const discounted = hasPromo
      ? override != null && override >= 0
        ? override
        : Math.round(original * (1 - promo.discountPercent / 100))
      : original;
    const priceStr = formatRegionPrice(discounted, r, period, freeLabel, isRTL);
    const originalStr = hasPromo ? formatRegionPrice(original, r, period, freeLabel, isRTL) : null;
    const tpl: string = hasPromo ? (promo.saveLine ?? "") : "";
    const saveLine = tpl
      ? tpl.replace(/\{price\}/g, priceStr).replace(/\{original\}/g, originalStr ?? "")
      : null;
    return {
      price: priceStr,
      original: originalStr,
      label: hasPromo ? promo.label : null,
      discountPercent: hasPromo ? promo.discountPercent : 0,
      saveLine,
      contactOnly,
    };
  };

  const persistPlanOrder = async (next: Array<{ key: string }>) => {
    for (const [index, plan] of next.entries()) {
      const meta = catalog.find((item) => item.key === plan.key);
      if (!meta) continue;
      const row = planItems.find((item) => item.content_key === `individual_${plan.key}`);
      await saveContent.mutateAsync({
        id: row?.id,
        page: "pricing",
        section: "plans",
        content_key: `individual_${plan.key}`,
        value: JSON.stringify(meta),
        content_type: "pricing_plan",
        sort_order: index + 1,
      });
    }
  };

  const plans = planCards;

  const faqKeys = [1, 2, 3, 4, 5, 6];
  const faqs = faqKeys.map(i => ({
    q: getFaq(`faq${i}_q`),
    a: getFaq(`faq${i}_a`),
  })).filter(f => f.q);

  return (
    <Layout>
      <RevealAutoScanner page="pricing" />
      <SEOHead
        title={getHero("meta_title", "Digitize me Pricing | OCR Plans for Teams & Enterprise")}
        description={getHero("meta_description", "Compare Digitize me pricing for individuals, teams, and enterprise deployments with Arabic OCR, AI automation, and secure document management.")}
        titleAr="أسعار Digitize me | خطط OCR للفرق والمؤسسات"
        descriptionAr="قارن أسعار Digitize me للأفراد والفرق والمؤسسات مع OCR عربي، وأتمتة بالذكاء الاصطناعي، وإدارة آمنة للمستندات."
        path="/pricing"
        pageKey="pricing"
        faqs={faqs.map((f) => ({ question: f.q, answer: f.a }))}
        product={{
          name: "Digitize me — AI Document Management Platform",
          description:
            "AI-powered document management with Arabic & English OCR (99%+ accuracy). Free, SMEs, and Enterprise editions. SaaS or On-Premise.",
          offers: [
            { name: "Individuals Edition", price: "0", priceCurrency: "AED" },
            { name: "SMEs Edition", price: "299", priceCurrency: "AED" },
            { name: "Enterprise Edition", price: "0", priceCurrency: "AED" },
          ],
        }}
      />

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-20 pb-4 md:pb-6 lg:pb-8 bg-gradient-to-b from-dm-navy-light to-background">
        <div className="container-max text-center max-w-5xl mx-auto section-stack">
          <EditableText page="pricing" section="hero" contentKey="badge" fallback={t("pricing.badge")} className="text-accent font-semibold text-sm uppercase tracking-wider" />
          <EditableText as="h1" page="pricing" section="hero" contentKey="title" fallback={t("pricing.title")} className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-3 mb-2 block md:whitespace-nowrap" rich />
          <EditableText as="p" page="pricing" section="hero" contentKey="description" fallback={t("pricing.desc")} multiline className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto whitespace-pre-line" rich />

          <div className="flex justify-center pt-2"><UAEHostingBadge className="text-sm md:text-base px-4 py-2 gap-2.5 [&_svg]:w-[18px] [&_svg]:h-[18px]" /></div>



          {/* Billing Cycle Toggle */}
          <motion.div className="flex flex-col items-center gap-3" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <div className="inline-flex flex-wrap items-center justify-center bg-primary/80 rounded-full p-1 gap-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-background text-foreground shadow-md"
                    : "text-primary-foreground/60 hover:text-primary-foreground/80"
                }`}
              >
                <EditableText page="pricing" section="hero" contentKey="monthly_label" fallback={l("Monthly", "شهري", "Mensuel")} />
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingCycle === "yearly"
                    ? "bg-background text-foreground shadow-md"
                    : "text-primary-foreground/60 hover:text-primary-foreground/80"
                }`}
              >
                <EditableText page="pricing" section="hero" contentKey="yearly_label" fallback={l("Yearly", "سنوي", "Annuel")} />
                <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">-30%</span>
              </button>
            </div>
            {canPreviewGeoComparison && (
            <div className="flex flex-col items-center gap-2 mt-2">
              <div className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full border border-border bg-card p-1">
                {GEO_PREVIEW_OPTIONS.map((option) => {
                  const active = effectiveRegion === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setPreviewRegion(option.key)}
                      className={`min-w-[72px] rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-start justify-center gap-2 text-xs text-muted-foreground max-w-md text-center">
                <Globe size={14} className="text-accent" />
                <span>
                  {l(
                    `Previewing ${previewMeta[effectiveRegion].label} plans in ${previewMeta[effectiveRegion].currency}`,
                    `تتم معاينة خطط ${previewMeta[effectiveRegion].label} بعملة ${previewMeta[effectiveRegion].currency}`,
                    `Aperçu des offres ${previewMeta[effectiveRegion].label} en ${previewMeta[effectiveRegion].currency}`
                  )}
                </span>
              </div>
            </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 lg:px-8 pt-2 md:pt-4 lg:pt-6 pb-12 md:pb-16 lg:pb-20 bg-background">
        <div className="container-max">
          <SortableGrid
            items={plans.map((plan) => ({ ...plan, id: plan.key }))}
            editMode={editEnabled}
            onReorder={(next) => {
              void persistPlanOrder(next);
            }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 justify-center gap-5 xl:gap-4 max-w-[90rem] mx-auto items-start"
            renderItem={(plan, dragHandle) => {
              const highlight = highlightMap[plan.key];
              const isPopular = highlight?.most_popular ?? plan.highlighted;
              const badgeLabel =
                (lang === "ar" ? highlight?.badge_label_ar : highlight?.badge_label) ||
                t("pricing.popular");
              const ctaLabelOverride =
                (lang === "ar"
                  ? highlight?.cta_label_override_ar
                  : highlight?.cta_label_override) || null;
              const ctaLinkOverride = highlight?.cta_link_override || null;

              return (
              <motion.div
                className={`relative w-full min-w-0 rounded-2xl flex flex-col overflow-visible ${
                  isPopular ? "mt-0 md:-mt-4" : ""
                }`}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={0}
              >
                {dragHandle}
                {isPopular && (
                  <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-b from-accent to-accent/50 z-0" />
                )}

                {isPopular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                    <span className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider shadow-lg">
                      <Sparkles size={14} />
                      {badgeLabel}
                    </span>
                  </div>
                )}

                <div className={`relative z-10 h-full rounded-2xl border p-5 md:p-6 xl:p-5 flex flex-col flex-1 transition-all duration-300 ${
                  isPopular
                    ? "bg-card border-accent shadow-xl shadow-accent/10"
                    : "bg-card border-border shadow-md hover:-translate-y-1 hover:shadow-xl"
                }`}>
                  <div className="mb-5 min-h-[180px] md:min-h-[200px] xl:min-h-[220px] flex flex-col">
                    <h3 className="text-xl xl:text-[1.35rem] font-bold text-foreground leading-tight">{plan.name}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2.5 mb-3">
                      {plan.description
                        .split(/[·.]/)
                        .map((part) => part.trim())
                        .filter(Boolean)
                        .map((part, i) => (
                          <span
                            key={i}
                            className="inline-block text-[11px] md:text-xs font-medium text-muted-foreground bg-muted/60 border border-border/60 rounded-md px-2 py-1 leading-tight"
                          >
                            {part}
                          </span>
                        ))}
                    </div>
                    {(() => {
                      const promo = rpWithPromo(plan.key, cmPlans);
                      const showPromo = promo && promo.original && promo.label && !promo.contactOnly;
                      if (promo.contactOnly) {
                        return (
                          <div className="mt-4 flex-1 flex flex-col justify-end">
                            <div className="text-[1.5rem] xl:text-[1.65rem] font-bold text-foreground leading-tight">
                              {l("Contact us for pricing", "تواصل معنا للأسعار", "Nous contacter")}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="mt-4 flex-1 flex flex-col justify-end">
                          {showPromo && (
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 bg-accent/15 text-accent text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                                –{promo!.discountPercent}%
                              </span>
                              <span className="text-xs font-semibold text-accent">
                                {promo!.label}
                              </span>
                            </div>
                          )}
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <div className="text-[2rem] xl:text-[2.2rem] font-extrabold text-foreground leading-none break-words">{promo ? promo.price : rp(plan.key, cmPlans)}</div>
                            {showPromo && (
                              <div className="text-base text-muted-foreground line-through decoration-accent/70 decoration-2">
                                {promo!.original}
                              </div>
                            )}
                          </div>
                          {showPromo && promo!.saveLine && (
                            <div className="text-xs text-accent font-semibold mt-2">
                              {promo!.saveLine}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mb-8 mt-auto">
                  {(() => {
                    const planCtaKey = `pricing_plan_cta_${plan.key}`;
                    const planCtaLocation = `Pricing — ${plan.name} plan button`;
                    const fallbackLabel = ctaLabelOverride ?? t("pricing.contactSales");
                    return (
                      <CtaButton
                        ctaKey={planCtaKey}
                        customLocation={planCtaLocation}
                        defaultTo={ctaLinkOverride ?? "/contact"}
                        labelEditor={{
                          page: "pricing",
                          section: `plans_${plan.key}`,
                          contentKey: "cta_label",
                          fallback: fallbackLabel,
                        }}
                        className={`w-full h-12 rounded-xl font-semibold text-base ${
                          isPopular
                            ? "bg-accent text-accent-foreground hover:bg-accent/90"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        <EditableText
                          page="pricing"
                          section={`plans_${plan.key}`}
                          contentKey="cta_label"
                          fallback={fallbackLabel}
                        />
                        <ArrowRight size={16} className={isRTL ? "mr-2 rotate-180" : "ml-2"} />
                      </CtaButton>
                    );
                  })()}
                  </div>

                  <div className="border-t border-border mb-6" />

                  <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
                    {l("Included in plan", "يشمل الخطة", "Inclus dans le plan")}
                  </p>
                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((feature, fi) => (
                      <li key={`${feature.name}-${fi}`} className="flex items-start gap-2 text-sm leading-snug">
                        {feature.included ? (
                          <CheckCircle size={14} className="text-accent mt-0.5 shrink-0" />
                        ) : (
                          <X size={14} className="text-muted-foreground/30 mt-0.5 shrink-0" />
                        )}
                        <span className={feature.included ? "text-foreground/80" : "text-muted-foreground/40"}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
              );
            }}
          />
        </div>
      </section>

      {/* ROI calculator — Phase 1 conversion booster */}
      <RoiCalculator activeRegion={effectiveRegion} />

      {/* Custom admin-added blocks before on-prem */}
      <CustomBlocksRenderer page="pricing" />

      {/* On-Premise */}
      <section className="section-padding bg-muted/30">
        <div className="container-max text-center max-w-2xl mx-auto">
          <EditableText as="h2" page="pricing" section="onprem" contentKey="title" fallback={t("pricing.onprem.title")} className="text-3xl font-bold text-foreground mb-4 block" rich />
          <EditableText as="p" page="pricing" section="onprem" contentKey="description" fallback={t("pricing.onprem.desc")} multiline className="text-muted-foreground mb-8" rich />
          <CtaButton ctaKey="pricing_onprem_cta" size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <EditableText page="pricing" section="onprem" contentKey="cta" fallback={t("pricing.onprem.cta")} />
            <ArrowRight size={16} className={isRTL ? "mr-2 rotate-180" : "ml-2"} />
          </CtaButton>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              {l("Industry pricing paths", "مسارات الأسعار حسب القطاع")}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-foreground">
              {l("Compare pricing after reviewing your industry workflow", "قارن الأسعار بعد مراجعة سير العمل الخاص بقطاعك")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {l("Visit the relevant industry landing page first to see OCR, automation, and compliance use cases before choosing a plan.", "انتقل أولاً إلى صفحة القطاع المناسبة لمراجعة حالات استخدام OCR والأتمتة والامتثال قبل اختيار الخطة المناسبة.")}
            </p>
          </div>
           <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pricingIndustryLinks.map((industry) => (
              <Link
                key={industry.slug}
                to={localizeInternalPath(`/industries/${industry.slug}`, lang)}
                 className="rounded-xl border border-border bg-card px-5 py-5 transition-all hover:border-accent/40 hover:shadow-md h-full"
              >
                <div className="text-base font-semibold text-foreground">
                  {lang === "ar" ? industry.titleAr : industry.titleEn}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lang === "ar" ? industry.descriptionAr : industry.descriptionEn}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-background">
        <div className="container-max max-w-3xl mx-auto">
          <EditableText as="h2" page="pricing" section="faq" contentKey="title" fallback={t("pricing.faq")} className="text-2xl font-bold text-foreground mb-8 text-center block" rich />
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <motion.div key={i} className="border border-border rounded-xl p-6 bg-card" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <EditableText as="h3" page="pricing" section="faq" contentKey={`faq${i + 1}_q`} fallback={faq.q} className="font-semibold text-foreground mb-2 block" />
                <EditableText as="p" page="pricing" section="faq" contentKey={`faq${i + 1}_a`} fallback={faq.a} multiline className="text-sm text-muted-foreground" rich />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AddBlockButton page="pricing" />
    </Layout>
  );
};

export default Pricing;
