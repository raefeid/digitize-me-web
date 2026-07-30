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
    key: "individual",
    name: "Individual",
    name_ar: "فردي",
    description: "14-day free trial",
    description_ar: "تجربة مجانية ١٤ يوم",
    visible: true,
    highlighted: true,
    prices: individualPricing.individual,
    features: [
      { name: "1 user", name_ar: "١ مستخدم", included: true },
      { name: "50 GB storage", name_ar: "٥٠ جيجا تخزين", included: true },
      { name: "Unlimited documents intellegance\u00a0\u00a0", name_ar: "مستندات غير محدودة", included: true },
      { name: "AI-Powered OCR", name_ar: "التعرف الضوئي بالذكاء الاصطناعي", included: true },
      { name: "Automatic Classification", name_ar: "تصنيف تلقائي", included: true },
      { name: "Document Chat", name_ar: "محادثة المستندات", included: true },
      { name: "Full-Text Search", name_ar: "بحث نصي كامل", included: true },
      { name: "\n", name_ar: "تكامل Google Drive وOneDrive", included: true },
      { name: "Email Support", name_ar: "دعم بالبريد الإلكتروني", included: true },
      { name: "Knowledge Graph", name_ar: "الرسم البياني المعرفي", included: true },
      { name: "\n", name_ar: "أولوية عالية في تنفيذ الذكاء الاصطناعي", included: true },
    ],
  },
  {
    key: "starter",
    name: "Starter",
    name_ar: "البداية",
    description: "$20 per user/mo",
    description_ar: "٢٠ دولار/مستخدم/شهر",
    visible: true,
    highlighted: false,
    prices: individualPricing.starter,
    features: [
      { name: "5 users minimum", name_ar: "٥ مستخدمين كحد أدنى", included: true },
      { name: "250 GB shared storage", name_ar: "٢٥٠ جيجا تخزين مشترك", included: true },
      { name: "25,000 documents\u00a0 intellegance", name_ar: "١٥٬٠٠٠ مستند / سنة", included: true },
      { name: "Doc Workspace", name_ar: "مساحة عمل المستندات", included: true },
      { name: "Auto Classification", name_ar: "تصنيف تلقائي", included: true },
      { name: "Auto Indexing", name_ar: "فهرسة تلقائية", included: true },
      { name: "Summarization", name_ar: "تلخيص", included: true },
      { name: "Document Chat", name_ar: "محادثة المستندات", included: true },
      { name: "Chat usage: Limited", name_ar: "استخدام المحادثة: محدود", included: true },
      { name: "Email Support", name_ar: "دعم بالبريد الإلكتروني", included: true },
      { name: "Self-serve onboarding", name_ar: "تأهيل ذاتي الخدمة", included: true },
      { name: "Knowledge Graph", name_ar: "الرسم البياني المعرفي", included: false },
      { name: "high Priority in AI Execution", name_ar: "أولوية عالية في تنفيذ الذكاء الاصطناعي", included: false },
    ],
  },
  {
    key: "productivity",
    name: "Productivity Edition",
    name_ar: "إصدار الإنتاجية",
    description: "$30 per user/mo",
    description_ar: "٣٠ دولار/مستخدم/شهر",
    visible: true,
    highlighted: false,
    prices: individualPricing.productivity,
    features: [
      { name: "10 users minimum", name_ar: "١٠ مستخدمين كحد أدنى", included: true },
      { name: "1 TB shared storage", name_ar: "١ تيرا تخزين مشترك", included: true },
      { name: "50,000 document intelligance\u00a0", name_ar: "٥٠٬٠٠٠ مستند / سنة", included: true },
      { name: "Doc Workspace", name_ar: "مساحة عمل المستندات", included: true },
      { name: "Auto Classification", name_ar: "تصنيف تلقائي", included: true },
      { name: "Auto Indexing", name_ar: "فهرسة تلقائية", included: true },
      { name: "Summarization", name_ar: "تلخيص", included: true },
      { name: "Document Chat", name_ar: "محادثة المستندات", included: true },
      { name: "Knowledge Graph", name_ar: "الرسم البياني المعرفي", included: true },
      { name: "Chat usage: Medium", name_ar: "استخدام المحادثة: متوسط", included: true },
      { name: "Priority email support", name_ar: "دعم بالبريد الإلكتروني ذو أولوية", included: true },
      { name: "Guided onboarding", name_ar: "تأهيل موجه", included: true },
      { name: "High Priority in AI Execution", name_ar: "أولوية عالية في تنفيذ الذكاء الاصطناعي", included: false },
    ],
  },
  {
    key: "professional",
    name: "Professional Edition",
    name_ar: "إصدار المحترفين",
    description: "$50 per user/mo",
    description_ar: "٥٠ دولار/مستخدم/شهر",
    visible: true,
    highlighted: false,
    prices: individualPricing.professional,
    features: [
      { name: "20 users minimum", name_ar: "٢٠ مستخدمًا كحد أدنى", included: true },
      { name: "2 TB shared storage", name_ar: "٢ تيرا تخزين مشترك", included: true },
      { name: "500,000 document intellagance\u00a0", name_ar: "٢٥٠٬٠٠٠ مستند / سنة", included: true },
      { name: "Doc Workspace", name_ar: "مساحة عمل المستندات", included: true },
      { name: "Auto Classification", name_ar: "تصنيف تلقائي", included: true },
      { name: "Auto Indexing", name_ar: "فهرسة تلقائية", included: true },
      { name: "Summarization", name_ar: "تلخيص", included: true },
      { name: "Document Chat", name_ar: "محادثة المستندات", included: true },
      { name: "Knowledge Graph", name_ar: "الرسم البياني المعرفي", included: true },
      { name: "Chat usage: High", name_ar: "استخدام المحادثة: مرتفع", included: true },
      { name: "High Priority in AI Execution", name_ar: "أولوية عالية في تنفيذ الذكاء الاصطناعي", included: true },
      { name: "Dedicated onboarding", name_ar: "تأهيل مخصص", included: true },
      { name: "Premium support\nHighest priority in AI Execution", name_ar: "دعم مميز", included: true },
    ],
  },
];

export const DEFAULT_PRICING_PLAN_MAP = Object.fromEntries(
  DEFAULT_PRICING_PLANS.map((plan) => [plan.key, plan]),
) as Record<string, DefaultPricingPlan>;

export const DEFAULT_PRICING_CATALOG: PricingPlanCatalogItem[] = DEFAULT_PRICING_PLANS.map(
  ({ prices: _prices, features: _features, ...plan }) => plan,
);
