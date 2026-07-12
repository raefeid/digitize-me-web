import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Database,
  Users as UsersIcon,
  Cloud,
  Zap,
  Code2,
  Upload,
  Cpu,
  FileJson,
  Send,
  ShieldCheck,
  KeyRound,
  ScrollText,
  Lock,
  PackageSearch,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useIntegrations, useSaveIntegration, IntegrationCategory } from "@/hooks/useIntegrations";
import { useEditMode } from "@/components/cms/EditModeContext";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import IntegrationCard from "@/components/integrations/IntegrationCard";
import IntegrationsLogoOrbit from "@/components/integrations/IntegrationsLogoOrbit";
import SortableGrid from "@/components/cms/SortableGrid";
import { useReorder, buildSortPayload } from "@/hooks/useReorder";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CtaButton from "@/components/cms/CtaButton";
import EditableText from "@/components/cms/EditableText";
import EditableCardGrid from "@/components/cms/EditableCardGrid";
import { CustomBlocksRenderer, AddBlockButton } from "@/components/cms/CustomBlocks";
import { cn } from "@/lib/utils";

const CATEGORY_META: Record<
  IntegrationCategory,
  { icon: typeof Database; defaultTitle: string; defaultDesc: string }
> = {
  erp: { icon: Database, defaultTitle: "ERP Systems", defaultDesc: "" },
  crm: { icon: UsersIcon, defaultTitle: "CRM Systems", defaultDesc: "" },
  cloud_storage: { icon: Cloud, defaultTitle: "Cloud Storage", defaultDesc: "" },
  productivity: { icon: Zap, defaultTitle: "Productivity Tools", defaultDesc: "" },
  custom_api: { icon: Code2, defaultTitle: "Custom API", defaultDesc: "" },
};

const ORDER: IntegrationCategory[] = ["erp", "crm", "cloud_storage", "productivity", "custom_api"];

const Integrations = () => {
  const { isRTL, lang } = useLanguage();
  const { getContent: getHero } = useSiteContent("integrations", "hero");
  const { getContent: getCats } = useSiteContent("integrations", "categories");
  const { getContent: getApi } = useSiteContent("integrations", "api");
  const { getContent: getWf } = useSiteContent("integrations", "workflow");
  const { getContent: getSec } = useSiteContent("integrations", "security");
  const { getContent: getCta } = useSiteContent("integrations", "cta");
  const { getContent: getUi } = useSiteContent("integrations", "ui");
  const { getContent: getFaqs } = useSiteContent("integrations", "faqs");
  const { data: integrations = [], isLoading } = useIntegrations();
  const { enabled: editMode } = useEditMode();
  const saveIntegration = useSaveIntegration();
  const reorderIntegrations = useReorder({ table: "integrations" });
  const { toast } = useToast();

  const handleAddIntegration = () => {
    const slug = `new-integration-${Math.random().toString(36).slice(2, 6)}`;
    const targetCat = activeCategory === "all" ? "productivity" : activeCategory;
    saveIntegration.mutate(
      {
        name: "New integration",
        name_ar: "تكامل جديد",
        slug,
        category: targetCat,
        description: "Click to edit this description.",
        description_ar: "انقر لتعديل هذا الوصف.",
        logo_url: "",
        status: "available",
        cta_label: "",
        cta_label_ar: "",
        cta_link: "/contact",
        sort_order: (integrations[integrations.length - 1]?.sort_order ?? 0) + 10,
        published: true,
      },
      {
        onSuccess: () => toast({ title: "Integration added — pick a logo to personalize it" }),
        onError: (e: Error) =>
          toast({ title: "Failed", description: e.message, variant: "destructive" }),
      },
    );
  };

  const [activeCategory, setActiveCategory] = useState<IntegrationCategory | "all">("all");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return integrations
      .filter((i) => i.published)
      .filter((i) => activeCategory === "all" || i.category === activeCategory)
      .filter((i) => {
        if (!q) return true;
        const haystack = [i.name, i.name_ar, i.description, i.description_ar]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [integrations, activeCategory, search]);

  const categoryButtons = [
    { key: "all" as const, label: getUi("filter_all", "All"), icon: PackageSearch },
    ...ORDER.map((c) => ({
      key: c,
      label: getCats(`cat_${c}_title`, CATEGORY_META[c].defaultTitle),
      icon: CATEGORY_META[c].icon,
    })),
  ];

  const workflowSteps = [1, 2, 3, 4].map((n) => ({
    title: getWf(`step${n}_title`, ""),
    desc: getWf(`step${n}_desc`, ""),
    icon: [Upload, Cpu, FileJson, Send][n - 1],
  }));

  const apiFeatures = [1, 2, 3].map((n) => ({
    title: getApi(`feat${n}_title`, ""),
    desc: getApi(`feat${n}_desc`, ""),
  }));

  const securityPillars = [1, 2, 3].map((n) => ({
    title: getSec(`pillar${n}_title`, ""),
    desc: getSec(`pillar${n}_desc`, ""),
    icon: [Lock, KeyRound, ScrollText][n - 1],
  }));

  const seoTitle =
    lang === "ar"
      ? "تكاملات OCR وقراءة المستندات بالذكاء الاصطناعي | Digitize me"
      : "OCR & AI Document Processing Integrations | Digitize me";
  const seoDesc =
    lang === "ar"
      ? "اربط محرك OCR وقراءة المستندات بالذكاء الاصطناعي من Digitize me بأنظمة ERP وCRM والتخزين السحابي وأدوات الإنتاجية وواجهات API الخاصة بك — أتمتة استخراج البيانات من الفواتير والعقود وبطاقات الهوية."
      : "Connect Digitize me's OCR and AI document processing engine with your ERP, CRM, cloud storage, productivity tools and custom APIs. Automate data extraction from invoices, contracts, IDs and forms.";

  // Keyword-rich JSON-LD: ItemList of published integrations
  const publishedForSchema = integrations.filter((i) => i.published).slice(0, 24);
  const integrationsItemList: Record<string, unknown> = {
    "@type": "ItemList",
    name:
      lang === "ar"
        ? "تكاملات Digitize me لقراءة المستندات وOCR"
        : "Digitize me integrations for OCR and AI document processing",
    itemListElement: publishedForSchema.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: lang === "ar" ? i.name_ar || i.name : i.name,
      url: i.cta_link || `https://www.digitizeme.ae/integrations#${i.slug}`,
    })),
  };

  // FAQ entries are CMS-driven (page=integrations, section=faqs).
  // Keys: faq_{n}_q / faq_{n}_a. We support up to 8 FAQs and only emit
  // entries that have both a question AND an answer in the active language.
  // Hardcoded values below are used purely as fallbacks if a row is missing.
  const FAQ_FALLBACK_EN: Array<{ q: string; a: string }> = [
    {
      q: "Which systems does Digitize me integrate with for AI document processing?",
      a: "Digitize me connects with major ERP and CRM platforms, cloud storage providers (Google Drive, OneDrive, SharePoint, Dropbox), productivity tools, and any custom backend through our REST API — so OCR results flow straight into your existing workflows.",
    },
    {
      q: "Can I use the Digitize me API to extract data from invoices, contracts and IDs?",
      a: "Yes. Our developer API exposes endpoints for uploading documents, running OCR and AI document understanding, and returning structured JSON ready to drop into invoice automation, contract review, and ID verification pipelines.",
    },
    {
      q: "Is the OCR and document data exchange secure?",
      a: "All integrations use encrypted transport (TLS), scoped API keys, and audit logging. Data residency, role-based access, and SSO are available for enterprise deployments.",
    },
  ];
  const FAQ_FALLBACK_AR: Array<{ q: string; a: string }> = [
    {
      q: "ما هي التكاملات التي تدعمها Digitize me لقراءة المستندات بالذكاء الاصطناعي؟",
      a: "تتكامل Digitize me مع أنظمة ERP وCRM والتخزين السحابي (Google Drive وOneDrive وSharePoint) وأدوات الإنتاجية، بالإضافة إلى REST API لربط استخراج بيانات OCR بأي نظام داخلي.",
    },
    {
      q: "هل يمكنني استخدام واجهة API الخاصة بـ Digitize me لاستخراج البيانات من الفواتير والعقود؟",
      a: "نعم. توفر واجهة Digitize me REST API نقاط نهاية لتحميل المستندات وتشغيل OCR وإرجاع JSON منظم لاستخدامه في أتمتة الفواتير والعقود وبطاقات الهوية.",
    },
    {
      q: "هل تبادل بيانات OCR والمستندات آمن؟",
      a: "تستخدم جميع التكاملات النقل المشفر (TLS) ومفاتيح API محدودة الصلاحيات وسجلات التدقيق. تتوفر إقامة البيانات والوصول القائم على الأدوار وتسجيل الدخول الموحد (SSO) لعمليات النشر المؤسسية.",
    },
  ];
  const FAQ_MAX = 8;
  const seoFaqs = Array.from({ length: FAQ_MAX }, (_, i) => {
    const n = i + 1;
    const fallback = (lang === "ar" ? FAQ_FALLBACK_AR : FAQ_FALLBACK_EN)[i];
    const question = getFaqs(`faq_${n}_q`, fallback?.q ?? "");
    const answer = getFaqs(`faq_${n}_a`, fallback?.a ?? "");
    return question && answer ? { question, answer } : null;
  }).filter((f): f is { question: string; answer: string } => f !== null);

  return (
    <Layout>
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        path="/integrations"
        pageKey="integrations"
        jsonLd={integrationsItemList}
        faqs={seoFaqs}
      />

      {/* Visually-hidden SEO intro — keeps page design intact while giving
          crawlers keyword-rich, descriptive context for OCR, document reading
          and AI document processing integrations. */}
      <h2 className="sr-only">
        {lang === "ar"
          ? "تكاملات OCR وقراءة المستندات والذكاء الاصطناعي للمستندات"
          : "OCR, document reading and AI document processing integrations"}
      </h2>
      <p className="sr-only">
        {lang === "ar"
          ? "تتكامل Digitize me مع أنظمة ERP وCRM والتخزين السحابي وأدوات الإنتاجية وواجهات API المخصصة لتقديم استخراج بيانات OCR وقراءة المستندات بالذكاء الاصطناعي بشكل آلي للفواتير والعقود وبطاقات الهوية والنماذج."
          : "Digitize me integrates with leading ERP, CRM, cloud storage and productivity platforms, plus a developer REST API, to deliver automated OCR, intelligent document reading and AI document processing for invoices, contracts, IDs, and structured business forms."}
      </p>

      {/* Hero */}
      <section className="pt-28 md:pt-36 pb-16 bg-gradient-to-b from-muted/40 to-background overflow-hidden">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
            <div className={cn(isRTL ? "text-right" : "text-left")}>
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold uppercase tracking-wider"
              >
                <Code2 size={12} />
                <EditableText page="integrations" section="hero" contentKey="badge" fallback="Integrations" />
              </motion.span>
              <h1 className="mt-4 text-3xl md:text-5xl font-bold text-foreground leading-tight">
                <EditableText
                  page="integrations"
                  section="hero"
                  contentKey="title"
                  fallback="Connect Digitize me with your existing tools"
                />
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl">
                <EditableText
                  page="integrations"
                  section="hero"
                  contentKey="subtitle"
                  fallback=""
                  multiline
                />
              </p>
              <div className={cn("mt-7 flex flex-wrap items-center gap-3", isRTL ? "justify-end" : "justify-start")}>
                <CtaButton ctaKey="integrations_demo" size="lg">
                  <EditableText page="integrations" section="cta" contentKey="btn_demo" as="span" fallback="Book a Demo" />
                </CtaButton>
                <CtaButton ctaKey="integrations_api" variant="outline" size="lg">
                  <EditableText page="integrations" section="api" contentKey="cta_access" as="span" fallback="Request API access" />
                </CtaButton>
              </div>
            </div>

            <div className="order-first lg:order-last">
              <IntegrationsLogoOrbit />
            </div>
          </div>
        </div>
      </section>

      {/* Categories grid + filters + cards */}
      <section className="py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
              <EditableText page="integrations" section="categories" contentKey="badge" fallback="Ecosystem" />
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              <EditableText page="integrations" section="categories" contentKey="title" fallback="Built to fit your stack" />
            </h2>
            <p className="mt-3 text-muted-foreground">
              <EditableText
                page="integrations"
                section="categories"
                contentKey="subtitle"
                fallback=""
                multiline
              />
            </p>
          </div>

          {/* Category quick-cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
            {ORDER.map((cat) => {
              const Icon = CATEGORY_META[cat].icon;
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(active ? "all" : cat)}
                  className={cn(
                    "text-start bg-card border rounded-xl p-4 transition-all",
                    active
                      ? "border-accent/60 shadow-md shadow-accent/10"
                      : "border-border hover:border-accent/30",
                  )}
                >
                  <Icon
                    size={20}
                    className={cn("mb-2", active ? "text-accent" : "text-muted-foreground")}
                  />
                  <div className="font-semibold text-sm text-foreground">
                    {getCats(`cat_${cat}_title`, CATEGORY_META[cat].defaultTitle)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {getCats(`cat_${cat}_desc`, "")}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Filter bar + search */}
          <div
            className={cn(
              "flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-8",
              isRTL && "md:flex-row-reverse",
            )}
          >
            <div className={cn("flex flex-wrap gap-2", isRTL && "flex-row-reverse")}>
              {categoryButtons.map((b) => {
                const Icon = b.icon;
                const active = activeCategory === b.key;
                return (
                  <button
                    key={b.key}
                    onClick={() => setActiveCategory(b.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      active
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card text-foreground/70 border-border hover:text-foreground hover:border-accent/40",
                    )}
                  >
                    <Icon size={13} />
                    {b.label}
                  </button>
                );
              })}
            </div>
            <div className="relative md:w-72">
              <Search
                size={15}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none",
                  isRTL ? "right-3" : "left-3",
                )}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={getUi("search_placeholder", "Search integrations...")}
                className={cn("h-9", isRTL ? "pr-9" : "pl-9")}
                aria-label={getUi("search_placeholder", "Search integrations...")}
              />
            </div>
          </div>

          {/* Cards grid */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-5 h-44 animate-pulse" />
              ))}
            </div>
          ) : visible.length > 0 ? (
            <SortableGrid
              items={visible}
              editMode={editMode}
              onReorder={(next) =>
                reorderIntegrations.mutate(buildSortPayload(next))
              }
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              renderItem={(integ, dragHandle) => (
                <IntegrationCard
                  key={integ.id}
                  integration={integ}
                  index={visible.indexOf(integ)}
                  dragHandle={dragHandle}
                />
              )}
              trailing={
                editMode ? (
                  <button
                    onClick={handleAddIntegration}
                    disabled={saveIntegration.isPending}
                    className="rounded-2xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-colors p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent min-h-[180px] disabled:opacity-50"
                    title="Add a new integration card"
                  >
                    <Plus size={28} />
                    <span className="text-sm font-medium">
                      {saveIntegration.isPending ? "Adding…" : "Add integration"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Logo, name & link editable inline
                    </span>
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="text-center py-14 border border-dashed border-border rounded-2xl">
              <PackageSearch size={36} className="mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold text-foreground">
                {getUi("empty_title", "No integrations match your search")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                {getUi("empty_desc", "Try a different keyword or category — or request a custom integration.")}
              </p>
              <div className="mt-5 flex items-center justify-center gap-2 flex-wrap">
                <CtaButton ctaKey="integrations_api" variant="outline" size="sm">
                  <EditableText page="integrations" section="api" contentKey="cta_access" as="span" fallback="Request API access" />
                </CtaButton>
                {editMode && (
                  <Button
                    onClick={handleAddIntegration}
                    disabled={saveIntegration.isPending}
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
                  >
                    <Plus size={14} /> Add integration
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* API & Developer */}
      <section className="py-20 bg-muted/30">
        <div className="container-max px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
              <EditableText page="integrations" section="api" contentKey="badge" fallback="For Developers" />
            </p>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">
              <EditableText page="integrations" section="api" contentKey="title" fallback="A REST API built for document workflows" />
            </h2>
            <p className="mt-4 text-muted-foreground">
              <EditableText page="integrations" section="api" contentKey="subtitle" fallback="" multiline />
            </p>
            <div className={cn("mt-6 flex flex-wrap gap-3", isRTL && "flex-row-reverse")}>
              <CtaButton ctaKey="integrations_api_docs">
                <EditableText page="integrations" section="api" contentKey="cta_docs" as="span" fallback="View API docs" />
              </CtaButton>
              <CtaButton ctaKey="integrations_api" variant="outline">
                <EditableText page="integrations" section="api" contentKey="cta_access" as="span" fallback="Request API access" />
              </CtaButton>
            </div>
          </div>
          <EditableCardGrid
            page="integrations"
            gridKey="api_features"
            className="space-y-3"
            seeds={apiFeatures.map((f, i) => ({
              key: `feat${i + 1}`,
              icon: FileJson,
              title: f.title,
              desc: f.desc,
              anim: "lift",
            }))}
            renderCard={({ index, title, desc, animClass }) => (
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -16 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className={cn("bg-card border border-border rounded-xl p-5", animClass)}
              >
                <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                  <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {title}
                    {desc}
                  </div>
                </div>
              </motion.div>
            )}
          />
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
              <EditableText page="integrations" section="workflow" contentKey="badge" fallback="Automation" />
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              <EditableText page="integrations" section="workflow" contentKey="title" fallback="" />
            </h2>
            <p className="mt-3 text-muted-foreground">
              <EditableText page="integrations" section="workflow" contentKey="subtitle" fallback="" multiline />
            </p>
          </div>
          <EditableCardGrid
            page="integrations"
            gridKey="workflow_steps"
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            seeds={workflowSteps.map((s, i) => ({
              key: `step${i + 1}`,
              icon: s.icon,
              title: s.title,
              desc: s.desc,
              anim: "lift",
            }))}
            renderCard={({ index, icon, title, desc, animClass }) => (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className={cn("relative bg-card border border-border rounded-2xl p-5", animClass)}
              >
                <div
                  className="absolute -top-3 inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow"
                  style={{ [isRTL ? "right" : "left"]: "1.25rem" } as React.CSSProperties}
                >
                  {index + 1}
                </div>
                <div className="mb-3 mt-2">{icon}</div>
                {title}
                {desc}
              </motion.div>
            )}
          />
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-muted/30">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 inline-flex items-center gap-1.5">
              <ShieldCheck size={12} />
              <EditableText page="integrations" section="security" contentKey="badge" fallback="Enterprise-Ready" />
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              <EditableText page="integrations" section="security" contentKey="title" fallback="" />
            </h2>
            <p className="mt-3 text-muted-foreground">
              <EditableText page="integrations" section="security" contentKey="subtitle" fallback="" multiline />
            </p>
          </div>
          <EditableCardGrid
            page="integrations"
            gridKey="security_pillars"
            className="grid md:grid-cols-3 gap-4"
            seeds={securityPillars.map((p, i) => ({
              key: `pillar${i + 1}`,
              icon: p.icon,
              title: p.title,
              desc: p.desc,
              anim: "lift",
            }))}
            renderCard={({ index, icon, title, desc, animClass }) => (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className={cn("bg-card border border-border rounded-2xl p-6", animClass)}
              >
                <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                  {icon}
                </div>
                {title}
                {desc}
              </motion.div>
            )}
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-accent to-accent/70 text-accent-foreground rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-56 h-56 bg-accent-foreground/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-56 h-56 bg-accent-foreground/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl md:text-4xl font-bold leading-tight max-w-2xl mx-auto">
                <EditableText page="integrations" section="cta" contentKey="title" fallback="" />
              </h2>
              <p className="mt-3 opacity-90 max-w-xl mx-auto">
                <EditableText page="integrations" section="cta" contentKey="subtitle" fallback="" multiline />
              </p>
              <div className={cn("mt-7 flex flex-wrap items-center justify-center gap-3", isRTL && "flex-row-reverse")}>
                <CtaButton
                  ctaKey="integrations_cta_trial"
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90"
                >
                  <EditableText page="integrations" section="cta" contentKey="btn_trial" as="span" fallback="Start Free Trial" />
                </CtaButton>
                <CtaButton
                  ctaKey="integrations_cta_demo"
                  size="lg"
                  variant="outline"
                  className="border-accent-foreground/40 text-accent-foreground hover:bg-accent-foreground/10"
                >
                  <EditableText page="integrations" section="cta" contentKey="btn_demo" as="span" fallback="Book a Demo" />
                </CtaButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CustomBlocksRenderer page="integrations" />
      <AddBlockButton page="integrations" />
    </Layout>
  );
};

export default Integrations;
