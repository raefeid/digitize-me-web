import { individualPricing, type PlanPricing } from "@/config/regionPricing";
import type { Region } from "@/hooks/useGeoLocation";

export interface PricingPlanFeature {
  name: string;
  name_ar?: string;
  included: boolean;
  geoTargets?: Region[];
}

export interface PricingPlanCatalogItem {
  key: string;
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  visible: boolean;
  highlighted?: boolean;
}

export interface DefaultPricingPlan extends PricingPlanCatalogItem {
  prices: PlanPricing;
  features: PricingPlanFeature[];
}

export const EMPTY_PLAN_PRICING: PlanPricing = {
  EG: { monthly: 0, yearly: 0 },
  AE: { monthly: 0, yearly: 0 },
  SA: { monthly: 0, yearly: 0 },
  DEFAULT: { monthly: 0, yearly: 0 },
};

export const DEFAULT_PRICING_PLANS: DefaultPricingPlan[] = [
  {
    key: "free",
    name: "Start Free — Try now, pay later",
    name_ar: "ابدأ مجانًا — جرّب الآن وادفع لاحقًا",
    description: "No credit card. Connect Google Drive or OneDrive and be up in 2 minutes.",
    description_ar: "بدون بطاقة ائتمان. اربط Google Drive أو OneDrive وابدأ خلال دقيقتين.",
    visible: true,
    highlighted: true,
    prices: individualPricing.free,
    features: [
      { name: "Try now, pay later — no credit card required", name_ar: "جرّب الآن وادفع لاحقًا — بدون بطاقة ائتمان", included: true },
      { name: "Google Drive integration — 2-minute setup", name_ar: "تكامل Google Drive — إعداد خلال دقيقتين", included: true },
      { name: "Microsoft OneDrive integration — 2-minute setup", name_ar: "تكامل Microsoft OneDrive — إعداد خلال دقيقتين", included: true },
      { name: "Single User", name_ar: "مستخدم واحد", included: true },
      { name: "5 GB Storage", name_ar: "٥ جيجا تخزين", included: true },
      { name: "Standard Search & Retrieval", name_ar: "بحث واسترجاع قياسي", included: true },
      { name: "Manual Document Tagging & Metadata", name_ar: "وسم يدوي وبيانات وصفية", included: true },
      { name: "Email Support", name_ar: "دعم بالبريد الإلكتروني", included: true },
      { name: "AI-Powered OCR", name_ar: "التعرف الضوئي بالذكاء الاصطناعي", included: false },
      { name: "Automatic Classification", name_ar: "تصنيف تلقائي", included: false },
      { name: "Document Chat", name_ar: "محادثة المستندات", included: false },
    ],
  },
  {
    key: "starter",
    name: "Starter Edition",
    name_ar: "إصدار البداية",
    description: "15 users · 15,000 docs/year · AED 15,000/year (AED 20,000 Year 1 incl. onboarding)",
    description_ar: "١٥ مستخدم · ١٥٬٠٠٠ مستند/سنة · ١٥٬٠٠٠ درهم/سنة (٢٠٬٠٠٠ درهم للسنة الأولى شامل التأهيل)",
    visible: true,
    highlighted: false,
    prices: individualPricing.starter,
    features: [
      { name: "15 users included (AED 1,000 / extra user/year)", name_ar: "١٥ مستخدم (١٬٠٠٠ درهم لكل مستخدم إضافي/سنة)", included: true },
      { name: "15,000 documents / year", name_ar: "١٥٬٠٠٠ مستند / سنة", included: true },
      { name: "Doc Workspace", name_ar: "مساحة عمل المستندات", included: true },
      { name: "Auto Classification", name_ar: "تصنيف تلقائي", included: true },
      { name: "Auto Indexing", name_ar: "فهرسة تلقائية", included: true },
      { name: "Summarization", name_ar: "تلخيص", included: true },
      { name: "Chat usage: Limited", name_ar: "استخدام المحادثة: محدود", included: true },
      { name: "Onboarding (Year 1): AED 5,000", name_ar: "التأهيل (السنة الأولى): ٥٬٠٠٠ درهم", included: true },
      { name: "Document Chat", name_ar: "محادثة المستندات", included: false },
      { name: "Doc Knowledge Graph", name_ar: "الرسم البياني المعرفي", included: false },
      { name: "High Priority in AI Execution", name_ar: "أولوية عالية في تنفيذ الذكاء الاصطناعي", included: false },
    ],
  },
  {
    key: "sme",
    name: "Business Edition",
    name_ar: "إصدار الأعمال",
    description: "25 users · 50,000 docs/year · AED 25,000/year (AED 30,000 Year 1 incl. onboarding)",
    description_ar: "٢٥ مستخدم · ٥٠٬٠٠٠ مستند/سنة · ٢٥٬٠٠٠ درهم/سنة (٣٠٬٠٠٠ درهم للسنة الأولى شامل التأهيل)",
    visible: true,
    highlighted: false,
    prices: individualPricing.sme,
    features: [
      { name: "25 users included (AED 1,000 / extra user/year)", name_ar: "٢٥ مستخدم (١٬٠٠٠ درهم لكل مستخدم إضافي/سنة)", included: true },
      { name: "50,000 documents / year", name_ar: "٥٠٬٠٠٠ مستند / سنة", included: true },
      { name: "Doc Workspace", name_ar: "مساحة عمل المستندات", included: true },
      { name: "Auto Classification", name_ar: "تصنيف تلقائي", included: true },
      { name: "Auto Indexing", name_ar: "فهرسة تلقائية", included: true },
      { name: "Summarization", name_ar: "تلخيص", included: true },
      { name: "Document Chat", name_ar: "محادثة المستندات", included: true },
      { name: "Chat usage: Medium", name_ar: "استخدام المحادثة: متوسط", included: true },
      { name: "Onboarding (Year 1): AED 5,000", name_ar: "التأهيل (السنة الأولى): ٥٬٠٠٠ درهم", included: true },
      { name: "Doc Knowledge Graph", name_ar: "الرسم البياني المعرفي", included: false },
      { name: "High Priority in AI Execution", name_ar: "أولوية عالية في تنفيذ الذكاء الاصطناعي", included: false },
    ],
  },
  {
    key: "enterprise",
    name: "Professional Edition",
    name_ar: "إصدار المحترفين",
    description: "50 users · 250,000 docs/year · AED 50,000/year (AED 60,000 Year 1 incl. onboarding)",
    description_ar: "٥٠ مستخدم · ٢٥٠٬٠٠٠ مستند/سنة · ٥٠٬٠٠٠ درهم/سنة (٦٠٬٠٠٠ درهم للسنة الأولى شامل التأهيل)",
    visible: true,
    highlighted: false,
    prices: individualPricing.enterprise,
    features: [
      { name: "50 users included (AED 1,000 / extra user/year)", name_ar: "٥٠ مستخدم (١٬٠٠٠ درهم لكل مستخدم إضافي/سنة)", included: true },
      { name: "250,000 documents / year", name_ar: "٢٥٠٬٠٠٠ مستند / سنة", included: true },
      { name: "Doc Workspace", name_ar: "مساحة عمل المستندات", included: true },
      { name: "Auto Classification", name_ar: "تصنيف تلقائي", included: true },
      { name: "Auto Indexing", name_ar: "فهرسة تلقائية", included: true },
      { name: "Summarization", name_ar: "تلخيص", included: true },
      { name: "Document Chat", name_ar: "محادثة المستندات", included: true },
      { name: "Doc Knowledge Graph", name_ar: "الرسم البياني المعرفي", included: true },
      { name: "Chat usage: High", name_ar: "استخدام المحادثة: مرتفع", included: true },
      { name: "High Priority in AI Execution", name_ar: "أولوية عالية في تنفيذ الذكاء الاصطناعي", included: true },
      { name: "Onboarding (Year 1): AED 10,000", name_ar: "التأهيل (السنة الأولى): ١٠٬٠٠٠ درهم", included: true },
    ],
  },
];

export const DEFAULT_PRICING_PLAN_MAP = Object.fromEntries(
  DEFAULT_PRICING_PLANS.map((plan) => [plan.key, plan]),
) as Record<string, DefaultPricingPlan>;

export const DEFAULT_PRICING_CATALOG: PricingPlanCatalogItem[] = DEFAULT_PRICING_PLANS.map(
  ({ prices: _prices, features: _features, ...plan }) => plan,
);