import { useSiteContent } from "@/hooks/useSiteContent";
import type { PlanPricing } from "@/config/regionPricing";
import { useLanguage } from "@/i18n/LanguageContext";
import { useGeo, type Region } from "@/hooks/useGeoLocation";
import {
  DEFAULT_PRICING_CATALOG,
  DEFAULT_PRICING_PLAN_MAP,
  EMPTY_PLAN_PRICING,
  type PricingPlanCatalogItem,
} from "@/config/pricingCatalog";

export interface CmsFeature {
  name: string;
  name_ar?: string;
  included: boolean;
  geoTargets?: Region[];
}

export interface CmsPromoOverride {
  monthly?: number | null;
  yearly?: number | null;
}

export interface CmsPromo {
  enabled: boolean;
  discountPercent: number;
  label: string;
  label_ar?: string;
  endsAt?: string;
  saveLine?: string;
  saveLine_ar?: string;
  overrides?: {
    EG?: CmsPromoOverride;
    AE?: CmsPromoOverride;
    SA?: CmsPromoOverride;
    DEFAULT?: CmsPromoOverride;
  };
}

export interface CmsPricingPlan extends PricingPlanCatalogItem {
  pricing: PlanPricing;
  features: { name: string; name_ar?: string; included: boolean }[];
  promo: CmsPromo | null;
}

const parseJson = <T,>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const useCmsPricing = (regionOverride?: Region) => {
  const { lang } = useLanguage();
  const { region } = useGeo();
  const activeRegion = regionOverride ?? region;
  const { getContent: getPrice, items: priceItems, isLoading: loadingPrices } = useSiteContent("pricing", "prices");
  const { items: featureItems, isLoading: loadingFeatures } = useSiteContent("pricing", "features");
  const { items: promoItems, isLoading: loadingPromos } = useSiteContent("pricing", "promos");
  const { items: planItems, isLoading: loadingPlans } = useSiteContent("pricing", "plans");

  const parsePrice = (key: string, fallback: PlanPricing): PlanPricing => {
    const raw = getPrice(key);
    return raw ? parseJson(raw, fallback) : fallback;
  };

  const parsePlanCatalog = (): PricingPlanCatalogItem[] => {
    const fromCms = planItems
      .filter((item) => item.content_type === "pricing_plan")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item): PricingPlanCatalogItem | null => {
        const parsed = parseJson<Partial<PricingPlanCatalogItem>>(item.value, {});
        if (!parsed.key) return null;
        const defaults = DEFAULT_PRICING_PLAN_MAP[parsed.key];
        return {
          key: parsed.key,
          name: parsed.name ?? defaults?.name ?? parsed.key,
          name_ar: parsed.name_ar ?? defaults?.name_ar,
          description: parsed.description ?? defaults?.description ?? "",
          description_ar: parsed.description_ar ?? defaults?.description_ar,
          visible: parsed.visible ?? defaults?.visible ?? true,
          highlighted: parsed.highlighted ?? defaults?.highlighted ?? false,
        };
      })
      .filter((item): item is PricingPlanCatalogItem => item !== null);

    return fromCms.length > 0 ? fromCms : DEFAULT_PRICING_CATALOG;
  };

  const parseFeatures = (key: string): CmsFeature[] | null => {
    const item = featureItems.find((i) => i.content_key === key);
    if (!item?.value) return null;
    const arr = parseJson<unknown>(item.value, null);
    return Array.isArray(arr) ? (arr as CmsFeature[]) : null;
  };

  const localizeFeatures = (feats: CmsFeature[] | null) => {
    if (!feats) return null;
    return feats
      .filter((f) => {
        const targets = f.geoTargets;
        return !targets || targets.length === 0 || targets.includes(activeRegion);
      })
      .map((f) => ({
        name: f.name,
        name_ar: f.name_ar,
        included: f.included,
      }));
  };

  const parsePromo = (key: string): CmsPromo | null => {
    const item = promoItems.find((i) => i.content_key === key);
    if (!item?.value) return null;
    const p = parseJson<CmsPromo | null>(item.value, null);
    if (!p?.enabled) return null;
    const pct = Number(p.discountPercent);
    if (!pct || pct <= 0 || pct >= 100) return null;
    if (p.endsAt) {
      const ends = new Date(p.endsAt).getTime();
      if (!Number.isNaN(ends) && ends < Date.now()) return null;
    }
    return p;
  };

  const localizePromo = (p: CmsPromo | null): CmsPromo | null => {
    if (!p) return null;
    return {
      ...p,
      label: lang === "ar" && p.label_ar ? p.label_ar : p.label,
      saveLine: lang === "ar" && p.saveLine_ar ? p.saveLine_ar : p.saveLine,
    };
  };

  const catalog = parsePlanCatalog();

  const plans = Object.fromEntries(
    catalog.map((plan) => [
      plan.key,
      parsePrice(`individual_${plan.key}`, DEFAULT_PRICING_PLAN_MAP[plan.key]?.prices ?? EMPTY_PLAN_PRICING),
    ]),
  ) as Record<string, PlanPricing>;

  const features = Object.fromEntries(
    catalog.map((plan) => [
      plan.key,
      localizeFeatures(parseFeatures(`individual_${plan.key}`)) ??
        localizeFeatures(DEFAULT_PRICING_PLAN_MAP[plan.key]?.features ?? null),
    ]),
  ) as Record<string, { name: string; name_ar?: string; included: boolean }[] | null>;

  const promos = Object.fromEntries(
    catalog.map((plan) => [plan.key, localizePromo(parsePromo(`individual_${plan.key}`))]),
  ) as Record<string, CmsPromo | null>;

  const planCards: CmsPricingPlan[] = catalog
    .filter((plan) => plan.visible)
    .map((plan) => ({
      ...plan,
      name: lang === "ar" && plan.name_ar ? plan.name_ar : plan.name,
      description: lang === "ar" && plan.description_ar ? plan.description_ar : plan.description,
      pricing: plans[plan.key] ?? EMPTY_PLAN_PRICING,
      features: features[plan.key] ?? [],
      promo: promos[plan.key] ?? null,
    }));

  return {
    catalog,
    planCards,
    plans,
    features,
    promos,
    priceItems,
    isLoading: loadingPrices || loadingFeatures || loadingPromos || loadingPlans,
  };
};
