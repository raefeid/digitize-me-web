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

/**
 * Canonical checklist features shared across every tier.
 * The first 3 entries per plan are "spec strip" values (users, storage, docs)
 * and are plan-specific. The remaining entries are the same feature names
 * for all plans — only the `included` boolean differs per tier.
 */
const SHARED_FEATURES: Omit<PricingPlanFeature, "included">[] = [
  { name: "Auto Classification", name_ar: "تصنيف تلقائي" },
  { name: "Auto Indexing", name_ar: "فهرسة تلقائية" },
  { name: "Full-Text Search", name_ar: "بحث نصي كامل" },
  { name: "Document Chat", name_ar: "محادثة المستندات" },
  { name: "Summarization", name_ar: "تلخيص" },
  { name: "Knowledge Graph", name_ar: "الرسم البياني المعرفي" },
  { name: "Document Workspace", name_ar: "مساحة عمل المستندات" },
  { name: "Multi-repository Integration", name_ar: "تكامل مستودعات متعددة" },
  { name: "High Priority AI Execution", name_ar: "أولوية عالية في تنفيذ الذكاء الاصطناعي" },
  { name: "Guided Onboarding", name_ar: "تأهيل موجه" },
  { name: "Priority Support", name_ar: "دعم ذو أولوية" },
];

/** Per-tier included flags for the shared checklist features (same order as above). */
const FEATURE_FLAGS: Record<string, boolean[]> = {
  individual:  [true,  true,  true,  true,  true,  false, true,  true,  true,  true,  true ],
  starter:     [true,  true,  true,  true,  true,  false, true,  true,  true,  true,  true ],
  productivity:[true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true ],
  professional:[true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true ],
};

/** Per-tier label overrides for shared features (index -> { name, name_ar }). */
const FEATURE_NAME_OVERRIDES: Record<string, Record<number, { name: string; name_ar?: string }>> = {
  individual: {
    8: { name: "Normal AI Execution", name_ar: "تنفيذ عادي للذكاء الاصطناعي" },
    10: { name: "Email Support", name_ar: "دعم عبر البريد الإلكتروني" },
  },
  starter: {
    8: { name: "Normal AI Execution", name_ar: "تنفيذ عادي للذكاء الاصطناعي" },
    10: { name: "Email Support", name_ar: "دعم عبر البريد الإلكتروني" },
  },
  professional: {
    8: { name: "Highest Priority AI Execution", name_ar: "أعلى أولوية في تنفيذ الذكاء الاصطناعي" },
  },
};

const buildFeatures = (
  planKey: string,
  specs: PricingPlanFeature[],
): PricingPlanFeature[] => {
  const flags = FEATURE_FLAGS[planKey];
  const overrides = FEATURE_NAME_OVERRIDES[planKey] ?? {};
  return [
    ...specs,
    ...SHARED_FEATURES.map((f, i) => ({ ...f, ...(overrides[i] ?? {}), included: flags[i] })),
  ];
};


export const DEFAULT_PRICING_PLANS: DefaultPricingPlan[] = [
  {
    key: "individual",
    name: "Individual",
    name_ar: "فردي",
    description: "",
    description_ar: "",
    visible: true,
    highlighted: false,
    prices: individualPricing.individual,
    features: buildFeatures("individual", [
      { name: "1 user", name_ar: "١ مستخدم", included: true },
      { name: "50GB storage", name_ar: "٥٠ جيجا تخزين", included: true },
    ]),
  },
  {
    key: "starter",
    name: "Work Group",
    name_ar: "مجموعة العمل",
    description: "",
    description_ar: "",
    visible: true,
    highlighted: false,
    prices: individualPricing.starter,
    features: buildFeatures("starter", [
      { name: "3 users", name_ar: "٣ مستخدمين", included: true },
      { name: "250 GB shared storage", name_ar: "٢٥٠ جيجا تخزين مشترك", included: true },
    ]),
  },
  {
    key: "productivity",
    name: "Productivity",
    name_ar: "الإنتاجية",
    description: "",
    description_ar: "",
    visible: true,
    highlighted: true,
    prices: individualPricing.productivity,
    features: buildFeatures("productivity", [
      { name: "10 users", name_ar: "١٠ مستخدمين", included: true },
      { name: "2 TB shared storage", name_ar: "٢ تيرا تخزين مشترك", included: true },
    ]),
  },
  {
    key: "professional",
    name: "Professional",
    name_ar: "المحترفين",
    description: "",
    description_ar: "",
    visible: true,
    highlighted: false,
    prices: individualPricing.professional,
    features: buildFeatures("professional", [
      { name: "20 users", name_ar: "٢٠ مستخدمًا", included: true },
      { name: "5 TB shared storage", name_ar: "٥ تيرا تخزين مشترك", included: true },
    ]),
  },
];


export const DEFAULT_PRICING_PLAN_MAP = Object.fromEntries(
  DEFAULT_PRICING_PLANS.map((plan) => [plan.key, plan]),
) as Record<string, DefaultPricingPlan>;

export const DEFAULT_PRICING_CATALOG: PricingPlanCatalogItem[] = DEFAULT_PRICING_PLANS.map(
  ({ prices: _prices, features: _features, ...plan }) => plan,
);
