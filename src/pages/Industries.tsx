import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle, Scale, DollarSign, Truck, Building2, Stethoscope, GraduationCap, Factory, HardHat, Landmark, ShoppingBag, Droplets, Briefcase, ShieldCheck, LucideIcon } from "lucide-react";
import IndustryIllustration from "@/components/industries/IndustryIllustration";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/i18n/LanguageContext";
import { industryTranslationsAr } from "@/i18n/industryTranslations";
import EditableText from "@/components/cms/EditableText";
import EditableImage from "@/components/cms/EditableImage";
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
import { buildIndustrySeo, buildIndustryFaqs, buildIndustryLandingContent, buildIndustryStructuredData } from "@/lib/industrySeo";
import { useEditMode } from "@/components/cms/EditModeContext";
import { useAuth } from "@/hooks/useAuth";
import { localizeInternalPath } from "@/lib/localizedRoutes";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export interface IndustryData {
  slug: string;
  name: string;
  icon: LucideIcon;
  headline: string;
  description: string;
  painPoints: string[];
  solutions: string[];
  useCases: string[];
  beforeAfter: { before: string; after: string };
  cta: string;
}

export const industriesData: IndustryData[] = [
  { slug: "law-firms", name: "Law Firms", icon: Scale, headline: "Find Any Case File in Seconds, Not Hours", description: "Law firms handle hundreds of case files simultaneously, each generating contracts, court filings, evidence files, and correspondence. Digitize me creates a fully searchable digital archive accessible by authorized personnel only.", painPoints: ["Physical folders across multiple filing cabinets with no searchable index", "Paralegals spending 20-30 minutes per document search", "Client confidentiality at risk: any staff can access any file", "Court deadlines missed due to misfiled documents", "No version control on contracts and legal agreements"], solutions: ["Full searchable case file archive by client name, case number, document type", "Access control per lawyer. Junior staff see only assigned cases", "Document retrieval in under 5 seconds", "Court deadline alerts linked to document status", "Arabic & English OCR for bilingual legal documents", "Secure document sharing with clients and courts"], useCases: ["Case file management", "Contract versioning", "Court filing archives", "Client document portals", "Compliance documentation"], beforeAfter: { before: "20 minutes to find a case file", after: "5 seconds with Digitize me" }, cta: "Your case files should never take longer to find than it takes to greet a client." },
  { slug: "accounting", name: "Accounting Firms", icon: DollarSign, headline: "Audit Season Shouldn't Mean Document Hunting Season", description: "Accounting firms manage thousands of invoices, financial statements, and tax documents across multiple clients. Digitize me creates an organized, audit-ready digital archive with version control.", painPoints: ["Invoices and records across folders, USB drives, and email chains", "No consistent naming conventions across documents", "Multiple versions of the same financial statement with no clarity on which is final", "Audit preparation taking 3-4 days of manual document retrieval", "Client documents shared via WhatsApp with no access log"], solutions: ["Tax document archive by client, tax year, and document category", "Audit-ready folder export in one click", "Version control: one authoritative version per client", "All documents secured on local data infrastructure", "Arabic & English OCR for bilingual financial documents", "Complete audit trail with access logs"], useCases: ["Tax file management", "Audit preparation", "Invoice archiving", "Client document portals", "Financial statement versioning"], beforeAfter: { before: "3-day audit preparation", after: "4 hours with Digitize me" }, cta: "Audit season shouldn't take a week of document hunting." },
  { slug: "logistics", name: "Logistics & Transportation", icon: Truck, headline: "Your Customs Documents: Findable in 5 Seconds, Not 5 Hours", description: "Logistics companies manage thousands of documents monthly: waybills, customs clearances, delivery confirmations, insurance certificates. Digitize me provides mobile-accessible document management for office and field teams.", painPoints: ["Physical archive rooms overflowing every quarter", "Finding a waybill takes 2-3 hours during client disputes", "Customs clearance documents missing during port inspections", "Drivers can't access updated insurance certificates on the road", "No tracking of document status across shipments"], solutions: ["Full logistics document archive: waybills, customs, permits, insurance", "Search by client, route, date, or document type", "Mobile access for drivers and field teams", "Automatic alerts for expiring certificates", "Arabic & English OCR for regional documents", "Secure on local infrastructure"], useCases: ["Waybill management", "Customs documentation", "Fleet document access", "Insurance certificate tracking", "Delivery confirmation archives"], beforeAfter: { before: "6-hour customs delay finding a certificate", after: "Instant mobile retrieval with Digitize me" }, cta: "Your customs documents should be findable in 5 seconds, not 5 hours." },
  { slug: "real-estate", name: "Real Estate", icon: Building2, headline: "Every Property Document, Organized, Secure, Accessible", description: "Real estate firms manage property listings, contracts, KYC documents, and multi-party transactions. Digitize me centralizes everything with role-based access for agents, buyers, sellers, and banks.", painPoints: ["Property documents scattered across email, WhatsApp, and physical folders", "KYC documents expiring without notice", "No controlled access, agents can see all client documents", "Transaction documents lost between parties", "Time wasted recreating lost property files"], solutions: ["Property archive by listing, client, and transaction stage", "Multi-party secure access, buyer, seller, bank, notary see only what they need", "KYC expiry alerts", "All documentation centralized and searchable from any device", "Arabic & English document support", "Complete transaction audit trail"], useCases: ["Property listing archives", "KYC management", "Transaction document sharing", "Contract management", "Ownership documentation"], beforeAfter: { before: "Hours recreating lost property files", after: "Everything searchable in seconds" }, cta: "Every property deal deserves organized, accessible documents." },
  { slug: "healthcare", name: "Healthcare & Medical", icon: Stethoscope, headline: "Patient Records, Complete, Compliant, Instantly Retrievable", description: "Healthcare providers manage sensitive patient records, insurance claims, and regulatory documents. Digitize me ensures every file is complete, compliant, and instantly retrievable during inspections.", painPoints: ["Patient files incomplete or misfiled across departments", "Insurance claim delays due to missing documentation", "Regulatory inspections causing panic over missing records", "No centralized access to patient history", "Paper records vulnerable to damage and loss"], solutions: ["Complete patient file archive searchable by name, ID, or condition", "Insurance claim document packaging in one click", "Compliance-ready filing with full audit trails", "Secure sharing with referring doctors and insurance companies", "Arabic & English medical record OCR", "Role-based access control for clinical staff"], useCases: ["Patient record management", "Insurance claim processing", "Regulatory compliance", "Medical imaging archives", "Prescription tracking"], beforeAfter: { before: "Panicked scramble during inspections", after: "Calm, instant retrieval of every record" }, cta: "Patient records should be complete and accessible, always." },
  { slug: "education", name: "Education & Training", icon: GraduationCap, headline: "Student Records, Organized, Searchable, Audit-Ready", description: "Educational institutions manage thousands of student records, certifications, and accreditation documents. Digitize me creates a searchable archive with renewal alerts for accreditation compliance.", painPoints: ["Student records scattered across filing cabinets and spreadsheets", "Certificate retrieval taking days for alumni requests", "Accreditation documents disorganized before inspections", "No version control on curriculum documents", "HR documents mixed with student records"], solutions: ["Student record archive searchable by name, ID, course, or completion date", "Bulk certificate retrieval, 80 records in under 30 seconds", "Accreditation document management with renewal alerts", "Separate archives for academic and HR documents", "Arabic & English document support", "Secure access control for different departments"], useCases: ["Student record management", "Certificate issuance", "Accreditation compliance", "HR document management", "Curriculum version control"], beforeAfter: { before: "Days to retrieve alumni certificates", after: "30 seconds with Digitize me" }, cta: "Every student record should be findable in seconds." },
  { slug: "manufacturing", name: "Manufacturing", icon: Factory, headline: "ISO Compliance, Every Document Tracked, Every Audit Passed", description: "Manufacturing companies manage quality inspection reports, ISO documentation, supplier certificates, and equipment maintenance logs. Digitize me keeps everything organized for audits and compliance.", painPoints: ["Quality inspection reports filed in paper folders across departments", "ISO audit preparation taking weeks of document gathering", "Supplier certificates expiring without notice", "No traceability from finished product to raw material batch", "Equipment maintenance logs incomplete or missing"], solutions: ["Batch records, quality docs, and equipment logs in one searchable archive", "Production lot traceability, from raw material to finished product", "Supplier certificate expiry alerts", "ISO audit-ready document exports", "Arabic & English OCR for regional documents", "Integration with ERP and quality management systems"], useCases: ["Quality management", "ISO compliance", "Supplier document tracking", "Equipment maintenance logs", "Production batch tracing"], beforeAfter: { before: "Weeks of ISO audit preparation", after: "Ready in hours with Digitize me" }, cta: "Every quality record should be traceable, instantly." },
  { slug: "construction", name: "Construction", icon: HardHat, headline: "Engineering Drawings & Permits, Version-Controlled, Always Current", description: "Construction firms manage engineering drawings, building permits, inspection reports, and sub-contractor agreements across multiple sites. Digitize me provides multi-site access with full version control.", painPoints: ["Outdated drawing versions used on site causing rework", "Building permits missing during government inspections", "Sub-contractor documents scattered across email and WhatsApp", "No centralized access between head office and site offices", "Stop-work notices due to document retrieval failures"], solutions: ["Multi-site document access, head office, site office, ministry simultaneously", "Engineering drawing version control with revision tracking", "Building permit archive with expiry alerts", "Sub-contractor document management", "Arabic & English document support", "Mobile access for site managers and inspectors"], useCases: ["Drawing management", "Permit tracking", "Inspection documentation", "Sub-contractor compliance", "Project handover packages"], beforeAfter: { before: "Stop-work notices from missing permits", after: "Instant permit retrieval from any site" }, cta: "Every drawing should be the latest version, everywhere." },
  { slug: "government", name: "Government & Public Sector", icon: Landmark, headline: "Citizen Records & Government Archives, Digitized, Secure, Accessible", description: "Government agencies manage vast archives of citizen records, regulatory documents, and internal correspondence. Digitize me enables full digital transformation with enterprise-grade security and compliance.", painPoints: ["Decades of paper archives consuming physical space", "Citizen record retrieval taking days instead of minutes", "No digital workflow for approvals and inter-department communication", "Compliance risks from missing or damaged records", "Difficulty meeting e-government mandates"], solutions: ["Large-scale archive digitization with barcode tracking", "Citizen record search by name, ID, date, or department", "Digital workflow for approvals and routing", "Enterprise-grade security with role-based access", "Arabic & English OCR for all government documents", "Compliance with national digital transformation mandates"], useCases: ["Archive digitization", "Citizen services", "Inter-department workflows", "Regulatory compliance", "E-government initiatives"], beforeAfter: { before: "Days to retrieve citizen records", after: "Seconds with Digitize me" }, cta: "Government services should be fast, digital, and accessible." },
  { slug: "banking-finance", name: "Banking & Finance", icon: Landmark, headline: "KYC, Compliance & Audit, Always Ready, Always Secure", description: "Banks and financial institutions manage KYC documents, compliance files, and regulatory reports with strict retention requirements. Digitize me ensures every document is audit-ready and compliant.", painPoints: ["KYC document gaps discovered during regulatory audits", "Manual compliance checks consuming staff time", "Document retention periods not tracked automatically", "Sensitive financial data shared insecurely", "No centralized client document view across branches"], solutions: ["KYC document completeness indicators, identify gaps instantly", "Automatic document retention policy enforcement", "FRA-compliant filing with full audit trails", "Secure, encrypted document storage", "Arabic & English OCR for financial documents", "Cross-branch document access with role-based security"], useCases: ["KYC management", "Regulatory compliance", "Audit preparation", "Loan documentation", "Account opening archives"], beforeAfter: { before: "KYC gaps discovered during audits", after: "Real-time completeness tracking" }, cta: "Compliance should never be a surprise, it should be automatic." },
  { slug: "import-export", name: "Import / Export & Trade", icon: ShoppingBag, headline: "Trade Documents, Organized by Shipment, Supplier, and Date", description: "Trade and import-export businesses manage letters of credit, customs declarations, bills of lading, and supplier contracts. Digitize me organizes everything by shipment, supplier, and date.", painPoints: ["Trade documents scattered across email, courier, and physical files", "Letters of credit expiring without timely document submission", "Disputes with suppliers over undocumented agreements", "Customs delays due to missing or wrong documentation", "No secure way to share documents with banks and customs"], solutions: ["Trade document archive by shipment, origin country, supplier, LC reference", "Secure document sharing with banks, customs, and suppliers", "LC document deadline tracking and alerts", "Customs compliance document packaging", "Arabic & English OCR for regional trade documents", "Complete audit trail for every document interaction"], useCases: ["LC document management", "Customs compliance", "Supplier document tracking", "Shipment documentation", "Trade dispute resolution"], beforeAfter: { before: "Customs delays from missing documents", after: "Instant document access at any port" }, cta: "Every shipment document should be one search away." },
  { slug: "oil-gas", name: "Oil & Gas", icon: Droplets, headline: "Safety & Compliance Documents, Tracked, Current, Auditable", description: "Oil and gas companies manage safety documents, equipment certifications, environmental reports, and regulatory filings with strict compliance requirements.", painPoints: ["Safety certifications expiring without notice", "Equipment maintenance records incomplete across multiple sites", "Regulatory filings delayed due to missing documentation", "No centralized access to safety protocols during emergencies", "Environmental compliance documents scattered across departments"], solutions: ["Equipment certification tracking with expiry alerts", "Safety document archive accessible from any site or rig", "Environmental compliance filing with audit trails", "Multi-site document synchronization", "Arabic & English OCR for regional regulatory documents", "Emergency protocol instant retrieval"], useCases: ["Safety compliance", "Equipment certification", "Environmental reporting", "Regulatory filings", "Emergency documentation"], beforeAfter: { before: "Expired safety certifications discovered during inspections", after: "Automatic alerts 90 days before expiry" }, cta: "Safety compliance should be proactive, not reactive." },
  { slug: "insurance", name: "Insurance", icon: ShieldCheck, headline: "Policy Documents & Claims, Processed Faster, Organized Better", description: "Insurance companies handle policy documents, claims files, underwriting records, and regulatory submissions.", painPoints: ["Claims processing delayed by missing supporting documents", "Policy documents scattered across multiple systems", "No centralized view of client documents across products", "Regulatory submissions assembled manually each quarter", "Historical claims data difficult to access for underwriting"], solutions: ["Unified client document view across all products and policies", "Claims document packaging with automated checklist", "Regulatory submission automation", "Historical claims search for underwriting decisions", "Arabic & English OCR for policy and claims documents", "Secure document sharing with assessors and clients"], useCases: ["Claims processing", "Policy management", "Regulatory submissions", "Underwriting support", "Client onboarding"], beforeAfter: { before: "Weeks to assemble claims documentation", after: "Complete claims package in minutes" }, cta: "Every claim deserves fast, organized processing." },
  { slug: "retail", name: "Retail & E-Commerce", icon: Briefcase, headline: "Invoices, Receipts & Supplier Contracts, All in One Place", description: "Retail businesses manage supplier invoices, purchase orders, receipts, and employee documents.", painPoints: ["Invoices and receipts piling up with no organized filing system", "Supplier contracts scattered across email and physical folders", "Tax reporting delayed by missing financial documents", "Employee documents not centrally managed", "No audit trail for purchase orders and approvals"], solutions: ["Invoice and receipt archive searchable by supplier, date, or amount", "Supplier contract management with renewal alerts", "Tax-ready document exports", "Employee document management", "Arabic & English OCR for receipts and invoices", "Purchase order approval workflows"], useCases: ["Invoice management", "Supplier contracts", "Employee records", "Tax reporting", "Purchase order tracking"], beforeAfter: { before: "Days of invoice hunting at tax time", after: "One-click tax-ready exports" }, cta: "Every receipt and invoice should be instantly findable." },
];

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

              return (
                <div className="h-full relative group">
                  {dragHandle}
                  {industry.isCustom && (
                    <DeleteIndustryButton slug={industry.slug} name={displayName} />
                  )}
                  <Link
                    to={`/industries/${industry.slug}`}
                    className={`block rounded-xl border bg-card p-6 h-full transition-all ${
                      isDraft
                        ? "border-accent/50 border-dashed hover:border-accent"
                        : "border-border hover:border-accent/30 hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <Icon size={28} className="text-accent" />
                      {isDraft && editEnabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
                          Draft
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{displayName}</h3>
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
                      {t("industries.learnMore")} <ArrowRight size={14} className={isRTL ? "rotate-180" : ""} />
                    </span>
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
        <div className="container-max max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="sr-only">{semanticIndustryH1}</h1>
            <motion.div className="flex items-center gap-3 mb-4" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <EditableIcon page="industries" slotKey={`detail_${slug}_icon`} size={32}>
                <industryEn.icon size={32} className="text-accent" />
              </EditableIcon>
              <span className="text-accent font-semibold text-sm uppercase tracking-wider">{landing.heroEyebrow}</span>
            </motion.div>
            <EditableText as="h2" page={`industry_${slug}`} section="hero" contentKey="headline" fallback={industry.headline} className="text-3xl md:text-5xl font-bold text-foreground mb-6 block" rich />
            <EditableText as="p" page={`industry_${slug}`} section="hero" contentKey="description" fallback={industry.description} multiline className="text-lg text-muted-foreground mb-8" rich />
            <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-2xl">
              {landing.heroSupporting}
            </p>
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
              <CtaButton
                ctaKey={`industries_detail_hero_pricing_${slug}`}
                customLocation={`Industry detail (${slug}) — Hero View pricing`}
                variant="outline"
                defaultStyle={{ variant: "outline" }}
                defaultTo="/pricing"
              >
                <EditableText page={`industry_${slug}`} section="hero" contentKey="cta_pricing_label" fallback={t("common.viewPricing")} />
              </CtaButton>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden md:block">
            <EditableImage page={`industry_${slug}`} slotKey="hero_illustration" alt={industry.name}>
              <IndustryIllustration slug={slug || ""} />
            </EditableImage>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <span className="text-sm font-semibold text-destructive uppercase tracking-wider">{t("industries.before")}</span>
              <EditableText as="p" page={`industry_${slug}`} section="ba" contentKey="before" fallback={industry.beforeAfter.before} className="text-lg font-bold text-foreground mt-2 block" rich />
            </div>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
              <span className="text-sm font-semibold text-accent uppercase tracking-wider">{t("industries.after")}</span>
              <EditableText as="p" page={`industry_${slug}`} section="ba" contentKey="after" fallback={industry.beforeAfter.after} className="text-lg font-bold text-foreground mt-2 block" rich />
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-max">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">{landing.challengeHeading}</h2>
              <p className="text-sm text-muted-foreground mb-6">{landing.challengeIntro}</p>
              <EditableList
                page={`industry_${slug}`}
                listKey="pain_points"
                seeds={industry.painPoints.map((pain, i) => ({ key: `pain_${i}`, text: pain }))}
                renderItem={({ index, text }) => (
                  <motion.div
                    className="flex items-start gap-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={index}
                  >
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5 shrink-0">
                      <span className="text-xs font-bold text-destructive">{index + 1}</span>
                    </div>
                    <div className="text-sm text-muted-foreground flex-1 min-w-0">{text}</div>
                  </motion.div>
                )}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">{landing.solutionHeading}</h2>
              <p className="text-sm text-muted-foreground mb-6">{landing.solutionIntro}</p>
              <EditableList
                page={`industry_${slug}`}
                listKey="solutions"
                seeds={industry.solutions.map((solution, i) => ({ key: `sol_${i}`, text: solution }))}
                renderItem={({ index, text }) => (
                  <motion.div
                    className="flex items-start gap-3"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={index}
                  >
                    <CheckCircle size={18} className="text-accent mt-0.5 shrink-0" />
                    <div className="text-sm text-foreground flex-1 min-w-0">{text}</div>
                  </motion.div>
                )}
              />
            </div>
          </div>
        </div>
      </section>

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
