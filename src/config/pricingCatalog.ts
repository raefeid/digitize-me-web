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
    name: "Individuals Edition",
    name_ar: "إصدار الأفراد",
    description: "For freelancers & solo professionals",
    description_ar: "للمستخدمين الأفراد والمستقلين",
    visible: true,
    highlighted: false,
    prices: individualPricing.free,
    features: [
      { name: "Single User", name_ar: "مستخدم واحد", included: true },
      { name: "Unlimited Page Ingestion", name_ar: "مسح غير محدود للصفحات", included: true },
      { name: "5 GB Storage", name_ar: "٥ جيجا تخزين", included: true },
      { name: "10 MB Upload Limit Per File", name_ar: "١٠ ميجا حد الرفع لكل ملف", included: true },
      { name: "Standard Search & Retrieval", name_ar: "بحث واسترجاع قياسي", included: true },
      { name: "Manual Document Tagging & Metadata", name_ar: "وسم يدوي وبيانات وصفية", included: true },
      { name: "Basic Capture", name_ar: "مسح أساسي", included: true },
      { name: "Manual Document Classification", name_ar: "تصنيف يدوي للمستندات", included: true },
      { name: "Email Support", name_ar: "دعم بالبريد الإلكتروني", included: true },
      { name: "AI-Powered OCR", name_ar: "التعرف الضوئي بالذكاء الاصطناعي", included: false },
      { name: "Automatic Classification", name_ar: "تصنيف تلقائي", included: false },
      { name: "REST APIs & Webhooks", name_ar: "واجهات برمجة REST", included: false },
    ],
  },
  {
    key: "starter",
    name: "Starter Edition",
    name_ar: "إصدار البداية",
    description: "For growing professionals who need more capacity",
    description_ar: "للمحترفين النامين الذين يحتاجون سعة أكبر",
    visible: true,
    highlighted: false,
    prices: individualPricing.starter,
    features: [
      { name: "Single User", name_ar: "مستخدم واحد", included: true },
      { name: "Unlimited Page Ingestion", name_ar: "مسح غير محدود للصفحات", included: true },
      { name: "20 GB Storage", name_ar: "٢٠ جيجا تخزين", included: true },
      { name: "50 MB Upload Limit Per File", name_ar: "٥٠ ميجا حد الرفع لكل ملف", included: true },
      { name: "Standard Search & Retrieval", name_ar: "بحث واسترجاع قياسي", included: true },
      { name: "Manual Document Tagging & Metadata", name_ar: "وسم يدوي وبيانات وصفية", included: true },
      { name: "Capture + Basic OCR (AR/EN)", name_ar: "مسح + OCR أساسي", included: true },
      { name: "Manual Document Classification", name_ar: "تصنيف يدوي للمستندات", included: true },
      { name: "Email Support", name_ar: "دعم بالبريد الإلكتروني", included: true },
      { name: "AI-Powered OCR", name_ar: "التعرف الضوئي بالذكاء الاصطناعي", included: false },
      { name: "Automatic Classification", name_ar: "تصنيف تلقائي", included: false },
      { name: "REST APIs & Webhooks", name_ar: "واجهات برمجة REST", included: false },
    ],
  },
  {
    key: "sme",
    name: "Business Edition",
    name_ar: "إصدار الأعمال",
    description: "For small & medium businesses needing OCR & automation",
    description_ar: "للشركات الصغيرة والمتوسطة التي تحتاج OCR وأتمتة",
    visible: true,
    highlighted: true,
    prices: individualPricing.sme,
    features: [
      { name: "Up to 5 Users", name_ar: "حتى ٥ مستخدمين", included: true },
      { name: "Unlimited Page Ingestion", name_ar: "مسح غير محدود للصفحات", included: true },
      { name: "50 GB Storage", name_ar: "٥٠ جيجا تخزين", included: true },
      { name: "100 MB Upload Limit Per File", name_ar: "١٠٠ ميجا حد الرفع لكل ملف", included: true },
      { name: "Advanced Search & Retrieval", name_ar: "بحث واسترجاع متقدم", included: true },
      { name: "Auto Document Tagging & Metadata", name_ar: "وسم تلقائي وبيانات وصفية", included: true },
      { name: "Capture + Basic OCR (AR/EN)", name_ar: "مسح + OCR أساسي", included: true },
      { name: "Manual Document Classification", name_ar: "تصنيف يدوي للمستندات", included: true },
      { name: "Priority Email Support", name_ar: "دعم بالبريد الإلكتروني ذو أولوية", included: true },
      { name: "AI-Powered OCR", name_ar: "التعرف الضوئي بالذكاء الاصطناعي", included: true },
      { name: "Automatic Classification", name_ar: "تصنيف تلقائي", included: false },
      { name: "REST APIs & Webhooks", name_ar: "واجهات برمجة REST", included: false },
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise Edition",
    name_ar: "إصدار المؤسسات",
    description: "For enterprises requiring full AI automation & integrations",
    description_ar: "للمؤسسات التي تحتاج أتمتة ذكاء اصطناعي كاملة وتكامل",
    visible: true,
    highlighted: false,
    prices: individualPricing.enterprise,
    features: [
      { name: "Single User", name_ar: "مستخدم واحد", included: true },
      { name: "Unlimited Page Ingestion", name_ar: "مسح غير محدود للصفحات", included: true },
      { name: "200 GB Storage", name_ar: "٢٠٠ جيجا تخزين", included: true },
      { name: "500 MB Upload Limit Per File", name_ar: "٥٠٠ ميجا حد الرفع لكل ملف", included: true },
      { name: "AI-Powered Search & Retrieval", name_ar: "بحث واسترجاع بالذكاء الاصطناعي", included: true },
      { name: "Automatic AI Doc Tagging & Metadata", name_ar: "وسم تلقائي بالذكاء الاصطناعي", included: true },
      { name: "AI Professional Capture + Fotognize IDP", name_ar: "مسح احترافي + Fotognize IDP", included: true },
      { name: "Automatic AI-Powered Document Classification", name_ar: "تصنيف تلقائي بالذكاء الاصطناعي", included: true },
      { name: "REST APIs + Webhooks", name_ar: "واجهات برمجة REST + Webhooks", included: true },
      { name: "Priority Support", name_ar: "دعم ذو أولوية", included: true },
      { name: "Arabic & English Advanced OCR", name_ar: "OCR متقدم بالعربية والإنجليزية", included: true },
      { name: "Priority Onboarding", name_ar: "تأهيل ذو أولوية", included: true },
    ],
  },
];

export const DEFAULT_PRICING_PLAN_MAP = Object.fromEntries(
  DEFAULT_PRICING_PLANS.map((plan) => [plan.key, plan]),
) as Record<string, DefaultPricingPlan>;

export const DEFAULT_PRICING_CATALOG: PricingPlanCatalogItem[] = DEFAULT_PRICING_PLANS.map(
  ({ prices: _prices, features: _features, ...plan }) => plan,
);