import { forwardRef, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Eye,
  EyeOff,
  ListChecks,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDeleteContent, useSaveContent, useSiteContent } from "@/hooks/useSiteContent";
import { useDeletePricingHighlight, usePricingHighlights } from "@/hooks/usePricingHighlights";
import {
  DEFAULT_PRICING_CATALOG,
  DEFAULT_PRICING_PLAN_MAP,
  EMPTY_PLAN_PRICING,
  type PricingPlanCatalogItem,
  type PricingPlanFeature,
} from "@/config/pricingCatalog";
import type { PlanPricing } from "@/config/regionPricing";
import type { CmsPromo } from "@/hooks/useCmsPricing";

interface PromoOverride {
  monthly?: number | null;
  yearly?: number | null;
}

interface PromoItem extends CmsPromo {
  overrides?: {
    EG?: PromoOverride;
    AE?: PromoOverride;
    SA?: PromoOverride;
    DEFAULT?: PromoOverride;
  };
}

const REGIONS = [
  { key: "EG" as const, label: "Egypt (EGP)", symbol: "ج.م" },
  { key: "AE" as const, label: "UAE (AED)", symbol: "د.إ" },
  { key: "SA" as const, label: "Saudi Arabia (SAR)", symbol: "ر.س" },
  { key: "DEFAULT" as const, label: "International (USD)", symbol: "$" },
];

const FEATURE_GEO_OPTIONS = [
  { key: "EG" as const, label: "EGY" },
  { key: "SA" as const, label: "SA" },
  { key: "AE" as const, label: "UAE" },
  { key: "DEFAULT" as const, label: "Globally" },
];

const defaultPromo: PromoItem = {
  enabled: false,
  discountPercent: 50,
  label: "50% off for 3 months",
  label_ar: "خصم 50٪ لمدة 3 أشهر",
  endsAt: "",
  saveLine: "You pay {price} instead of {original}",
  saveLine_ar: "تدفع {price} بدلاً من {original}",
  overrides: {},
};

const clonePricing = (pricing: PlanPricing): PlanPricing => ({
  EG: { ...pricing.EG },
  AE: { ...pricing.AE },
  SA: { ...pricing.SA },
  DEFAULT: { ...pricing.DEFAULT },
});

const clonePromo = (promo?: PromoItem | null): PromoItem => ({
  ...defaultPromo,
  ...(promo ?? {}),
  overrides: {
    ...(promo?.overrides ?? {}),
  },
});

const buildDefaultPlan = (index: number): PricingPlanCatalogItem => ({
  key: `custom_${Date.now()}_${index}`,
  name: `New plan ${index + 1}`,
  name_ar: "",
  description: "Add a short plan summary",
  description_ar: "أضف وصفًا قصيرًا للخطة",
  visible: true,
  highlighted: false,
});

const SectionShell = forwardRef<HTMLElement, {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}>(({ title, description, icon, children, actions }, ref) => (
  <section ref={ref} className="rounded-md border border-border bg-background">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
      <div>
        <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {icon}
          {title}
        </h4>
        {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {actions}
    </div>
    <div className="p-4">{children}</div>
  </section>
));

SectionShell.displayName = "SectionShell";

const PricingEditor = () => {
  const { toast } = useToast();
  const { items: planItems, isLoading: loadingPlans } = useSiteContent("pricing", "plans");
  const { items: priceItems, isLoading: loadingPrices } = useSiteContent("pricing", "prices");
  const { items: featureItems, isLoading: loadingFeatures } = useSiteContent("pricing", "features");
  const { items: promoItems, isLoading: loadingPromos } = useSiteContent("pricing", "promos");
  const { data: highlightRows = [] } = usePricingHighlights();
  const saveContent = useSaveContent();
  const deleteContent = useDeleteContent();
  const deleteHighlight = useDeletePricingHighlight();

  const [catalog, setCatalog] = useState<PricingPlanCatalogItem[]>([]);
  const [prices, setPrices] = useState<Record<string, PlanPricing>>({});
  const [features, setFeatures] = useState<Record<string, PricingPlanFeature[]>>({});
  const [promos, setPromos] = useState<Record<string, PromoItem>>({});
  const [removedKeys, setRemovedKeys] = useState<string[]>([]);
  const [expandedPlans, setExpandedPlans] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const highlightIdsByKey = useMemo(
    () => Object.fromEntries(highlightRows.map((row) => [row.plan_key, row.id])) as Record<string, string>,
    [highlightRows],
  );

  useEffect(() => {
    const parsedCatalog = planItems
      .filter((item) => item.content_type === "pricing_plan")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => {
        try {
          return JSON.parse(item.value) as PricingPlanCatalogItem;
        } catch {
          return null;
        }
      })
      .filter((item): item is PricingPlanCatalogItem => !!item?.key);

    const nextCatalog = parsedCatalog.length > 0 ? parsedCatalog : DEFAULT_PRICING_CATALOG;
    setCatalog(nextCatalog);

    const nextPrices: Record<string, PlanPricing> = {};
    const nextFeatures: Record<string, PricingPlanFeature[]> = {};
    const nextPromos: Record<string, PromoItem> = {};

    nextCatalog.forEach((plan) => {
      const contentKey = `individual_${plan.key}`;
      const priceRow = priceItems.find((item) => item.content_key === contentKey);
      const featureRow = featureItems.find((item) => item.content_key === contentKey);
      const promoRow = promoItems.find((item) => item.content_key === contentKey);

      try {
        nextPrices[plan.key] = priceRow?.value
          ? clonePricing(JSON.parse(priceRow.value) as PlanPricing)
          : clonePricing(DEFAULT_PRICING_PLAN_MAP[plan.key]?.prices ?? EMPTY_PLAN_PRICING);
      } catch {
        nextPrices[plan.key] = clonePricing(DEFAULT_PRICING_PLAN_MAP[plan.key]?.prices ?? EMPTY_PLAN_PRICING);
      }

      try {
        nextFeatures[plan.key] = featureRow?.value
          ? (JSON.parse(featureRow.value) as PricingPlanFeature[])
          : [...(DEFAULT_PRICING_PLAN_MAP[plan.key]?.features ?? [])];
      } catch {
        nextFeatures[plan.key] = [...(DEFAULT_PRICING_PLAN_MAP[plan.key]?.features ?? [])];
      }

      try {
        nextPromos[plan.key] = clonePromo(promoRow?.value ? (JSON.parse(promoRow.value) as PromoItem) : null);
      } catch {
        nextPromos[plan.key] = clonePromo();
      }
    });

    setPrices(nextPrices);
    setFeatures(nextFeatures);
    setPromos(nextPromos);
    setRemovedKeys([]);
    setExpandedPlans((prev) => {
      const validKeys = nextCatalog.map((plan) => plan.key);
      const kept = prev.filter((key) => validKeys.includes(key));
      if (kept.length > 0) return kept;
      return nextCatalog[0] ? [nextCatalog[0].key] : [];
    });
  }, [planItems, priceItems, featureItems, promoItems]);

  const movePlan = (index: number, direction: -1 | 1) => {
    setCatalog((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const updatePlan = (planKey: string, patch: Partial<PricingPlanCatalogItem>) => {
    setCatalog((prev) => prev.map((plan) => (plan.key === planKey ? { ...plan, ...patch } : plan)));
  };

  const addPlan = () => {
    const plan = buildDefaultPlan(catalog.length);
    setCatalog((prev) => [...prev, plan]);
    setPrices((prev) => ({ ...prev, [plan.key]: clonePricing(EMPTY_PLAN_PRICING) }));
    setFeatures((prev) => ({ ...prev, [plan.key]: [] }));
    setPromos((prev) => ({ ...prev, [plan.key]: clonePromo() }));
    setExpandedPlans((prev) => [...prev, plan.key]);
  };

  const removePlan = (planKey: string) => {
    setCatalog((prev) => prev.filter((plan) => plan.key !== planKey));
    setPrices((prev) => {
      const next = { ...prev };
      delete next[planKey];
      return next;
    });
    setFeatures((prev) => {
      const next = { ...prev };
      delete next[planKey];
      return next;
    });
    setPromos((prev) => {
      const next = { ...prev };
      delete next[planKey];
      return next;
    });
    setExpandedPlans((prev) => prev.filter((key) => key !== planKey));
    setRemovedKeys((prev) => (prev.includes(planKey) ? prev : [...prev, planKey]));
  };

  const togglePlanExpansion = (planKey: string) => {
    setExpandedPlans((prev) => (prev.includes(planKey) ? prev.filter((key) => key !== planKey) : [...prev, planKey]));
  };

  const updatePrice = (
    planKey: string,
    region: "EG" | "AE" | "SA" | "DEFAULT",
    cycle: "monthly" | "yearly",
    value: string,
  ) => {
    const num = value === "" ? 0 : parseInt(value, 10);
    if (Number.isNaN(num) || num < 0) return;
    setPrices((prev) => ({
      ...prev,
      [planKey]: {
        ...(prev[planKey] ?? clonePricing(EMPTY_PLAN_PRICING)),
        [region]: {
          ...(prev[planKey]?.[region] ?? { monthly: 0, yearly: 0 }),
          [cycle]: num,
        },
      },
    }));
  };

  const setPriceFlag = (
    planKey: string,
    region: "EG" | "AE" | "SA" | "DEFAULT",
    flag: "hidden" | "contactOnly",
    value: boolean,
  ) => {
    setPrices((prev) => {
      const current = prev[planKey] ?? clonePricing(EMPTY_PLAN_PRICING);
      const next = { ...(current[region] ?? { monthly: 0, yearly: 0 }), [flag]: value } as any;
      // The two flags are mutually exclusive — turning one on clears the other.
      if (value && flag === "hidden") next.contactOnly = false;
      if (value && flag === "contactOnly") next.hidden = false;
      return {
        ...prev,
        [planKey]: { ...current, [region]: next },
      };
    });
  };

  const updateFeature = (planKey: string, idx: number, patch: Partial<PricingPlanFeature>) => {
    setFeatures((prev) => ({
      ...prev,
      [planKey]: (prev[planKey] ?? []).map((feature, featureIndex) =>
        featureIndex === idx ? { ...feature, ...patch } : feature,
      ),
    }));
  };

  const addFeature = (planKey: string) => {
    setFeatures((prev) => ({
      ...prev,
      [planKey]: [...(prev[planKey] ?? []), { name: "", name_ar: "", included: true, geoTargets: [] }],
    }));
  };

  const toggleFeatureGeo = (planKey: string, idx: number, geo: "EG" | "AE" | "SA" | "DEFAULT") => {
    setFeatures((prev) => ({
      ...prev,
      [planKey]: (prev[planKey] ?? []).map((feature, featureIndex) => {
        if (featureIndex !== idx) return feature;
        const current = feature.geoTargets ?? [];
        const next = current.includes(geo)
          ? current.filter((item) => item !== geo)
          : [...current, geo];
        return { ...feature, geoTargets: next };
      }),
    }));
  };

  const setFeatureAllGeos = (planKey: string, idx: number, enabled: boolean) => {
    setFeatures((prev) => ({
      ...prev,
      [planKey]: (prev[planKey] ?? []).map((feature, featureIndex) =>
        featureIndex === idx ? { ...feature, geoTargets: enabled ? [] : ["DEFAULT"] } : feature,
      ),
    }));
  };

  const removeFeature = (planKey: string, idx: number) => {
    setFeatures((prev) => ({
      ...prev,
      [planKey]: (prev[planKey] ?? []).filter((_, featureIndex) => featureIndex !== idx),
    }));
  };

  const moveFeature = (planKey: string, idx: number, direction: -1 | 1) => {
    setFeatures((prev) => {
      const next = [...(prev[planKey] ?? [])];
      const target = idx + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prev, [planKey]: next };
    });
  };

  const updatePromo = (planKey: string, patch: Partial<PromoItem>) => {
    setPromos((prev) => ({
      ...prev,
      [planKey]: { ...(prev[planKey] ?? clonePromo()), ...patch },
    }));
  };

  const updatePromoOverride = (
    planKey: string,
    region: "EG" | "AE" | "SA" | "DEFAULT",
    cycle: "monthly" | "yearly",
    raw: string,
  ) => {
    const value = raw.trim() === "" ? null : Math.max(0, parseInt(raw, 10) || 0);
    setPromos((prev) => {
      const current = prev[planKey] ?? clonePromo();
      return {
        ...prev,
        [planKey]: {
          ...current,
          overrides: {
            ...(current.overrides ?? {}),
            [region]: { ...(current.overrides?.[region] ?? {}), [cycle]: value },
          },
        },
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [index, plan] of catalog.entries()) {
        const contentKey = `individual_${plan.key}`;
        const planRow = planItems.find((item) => item.content_key === contentKey);
        const priceRow = priceItems.find((item) => item.content_key === contentKey);
        const featureRow = featureItems.find((item) => item.content_key === contentKey);
        const promoRow = promoItems.find((item) => item.content_key === contentKey);

        await saveContent.mutateAsync({
          id: planRow?.id,
          page: "pricing",
          section: "plans",
          content_key: contentKey,
          value: JSON.stringify(plan),
          content_type: "pricing_plan",
          sort_order: index + 1,
        });

        await saveContent.mutateAsync({
          id: priceRow?.id,
          page: "pricing",
          section: "prices",
          content_key: contentKey,
          value: JSON.stringify(prices[plan.key] ?? clonePricing(EMPTY_PLAN_PRICING)),
          content_type: "json",
          sort_order: index + 1,
        });

        await saveContent.mutateAsync({
          id: featureRow?.id,
          page: "pricing",
          section: "features",
          content_key: contentKey,
          value: JSON.stringify(features[plan.key] ?? []),
          content_type: "json",
          sort_order: index + 1,
        });

        await saveContent.mutateAsync({
          id: promoRow?.id,
          page: "pricing",
          section: "promos",
          content_key: contentKey,
          value: JSON.stringify(promos[plan.key] ?? clonePromo()),
          content_type: "json",
          sort_order: index + 1,
        });
      }

      for (const planKey of removedKeys) {
        const contentKey = `individual_${planKey}`;
        const rowsToDelete = [
          ...planItems.filter((item) => item.content_key === contentKey),
          ...priceItems.filter((item) => item.content_key === contentKey),
          ...featureItems.filter((item) => item.content_key === contentKey),
          ...promoItems.filter((item) => item.content_key === contentKey),
        ];

        for (const row of rowsToDelete) {
          await deleteContent.mutateAsync(row.id);
        }

        if (highlightIdsByKey[planKey]) {
          await deleteHighlight.mutateAsync(highlightIdsByKey[planKey]);
        }
      }

      setRemovedKeys([]);
      toast({ title: "Pricing plans saved" });
    } catch (error: any) {
      toast({ title: "Error saving pricing plans", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loadingPlans || loadingPrices || loadingFeatures || loadingPromos) {
    return <p className="text-muted-foreground">Loading pricing data...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Pricing tables</h2>
          <p className="text-sm text-muted-foreground">Add, hide, remove, and edit plan cards with their feature lists.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={addPlan} className="gap-2">
            <Plus size={14} /> Add plan
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="gap-2">
            <Save size={14} /> {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {catalog.map((plan, index) => (
          <div key={plan.key} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-4">
              <button
                type="button"
                onClick={() => togglePlanExpansion(plan.key)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                aria-expanded={expandedPlans.includes(plan.key)}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                  {expandedPlans.includes(plan.key) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                <DollarSign size={16} className="shrink-0 text-primary" />
                <div>
                  <div className="font-semibold text-foreground">{plan.name || "Untitled plan"}</div>
                  <div className="text-xs text-muted-foreground">Key: {plan.key}</div>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" onClick={() => movePlan(index, -1)} disabled={index === 0}>
                  <ArrowUp size={14} />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => movePlan(index, 1)}
                  disabled={index === catalog.length - 1}
                >
                  <ArrowDown size={14} />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => removePlan(plan.key)} className="text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>

            {expandedPlans.includes(plan.key) ? <div className="space-y-6 p-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
                <SectionShell
                  title="Plan copy"
                  description="Keep the English and Arabic text for this card together in one place."
                  icon={<DollarSign size={14} />}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="mb-1 block text-xs text-muted-foreground">Plan name (English)</Label>
                      <Input value={plan.name} onChange={(e) => updatePlan(plan.key, { name: e.target.value })} />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-muted-foreground">Plan name (Arabic)</Label>
                      <Input dir="rtl" value={plan.name_ar ?? ""} onChange={(e) => updatePlan(plan.key, { name_ar: e.target.value })} />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-muted-foreground">Description (English)</Label>
                      <Input value={plan.description} onChange={(e) => updatePlan(plan.key, { description: e.target.value })} />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-muted-foreground">Description (Arabic)</Label>
                      <Input dir="rtl" value={plan.description_ar ?? ""} onChange={(e) => updatePlan(plan.key, { description_ar: e.target.value })} />
                    </div>
                  </div>
                </SectionShell>

                <SectionShell
                  title="Plan settings"
                  description="Status and spotlight controls are grouped here instead of split across multiple boxes."
                  icon={plan.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/20 px-3 py-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">Show this pricing table</div>
                        <div className="text-xs text-muted-foreground">Hide it from the live pricing page without deleting it.</div>
                      </div>
                      <Switch checked={plan.visible} onCheckedChange={(checked) => updatePlan(plan.key, { visible: checked })} />
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/20 px-3 py-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">Default highlighted plan</div>
                        <div className="text-xs text-muted-foreground">Use this when the plan should stand out by default.</div>
                      </div>
                      <Switch
                        checked={!!plan.highlighted}
                        onCheckedChange={(checked) => updatePlan(plan.key, { highlighted: checked })}
                      />
                    </div>
                  </div>
                </SectionShell>
              </div>

              <SectionShell
                title="Prices"
                description="Edit monthly and yearly values by region. Use the toggles to hide a region (fall back to the global price) or hide the price entirely (Contact Us only)."
                icon={<DollarSign size={14} />}
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {REGIONS.map((region) => {
                    const regionPrice = prices[plan.key]?.[region.key];
                    const isHidden = !!regionPrice?.hidden;
                    const isContactOnly = !!regionPrice?.contactOnly;
                    const isGlobal = region.key === "DEFAULT";
                    const inputsDisabled = isContactOnly || (isHidden && !isGlobal);
                    return (
                      <div key={region.key} className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-foreground">{region.label}</div>
                          <span className="text-xs text-muted-foreground">{region.symbol}</span>
                        </div>
                        <div>
                          <Label className="mb-1 block text-xs text-muted-foreground">Monthly</Label>
                          <Input
                            type="number"
                            min={0}
                            value={regionPrice?.monthly ?? 0}
                            onChange={(e) => updatePrice(plan.key, region.key, "monthly", e.target.value)}
                            disabled={inputsDisabled}
                          />
                        </div>
                        <div>
                          <Label className="mb-1 block text-xs text-muted-foreground">Yearly (per month)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={regionPrice?.yearly ?? 0}
                            onChange={(e) => updatePrice(plan.key, region.key, "yearly", e.target.value)}
                            disabled={inputsDisabled}
                          />
                        </div>
                        <div className="space-y-2 rounded-md border border-border bg-background p-2">
                          {!isGlobal && (
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-foreground">Hide this region</div>
                                <div className="text-[11px] text-muted-foreground">Fall back to the global (USD) price.</div>
                              </div>
                              <Switch
                                checked={isHidden}
                                onCheckedChange={(checked) => setPriceFlag(plan.key, region.key, "hidden", checked)}
                              />
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-foreground">Hide price (Contact Us only)</div>
                              <div className="text-[11px] text-muted-foreground">Show only the Contact button — no amount.</div>
                            </div>
                            <Switch
                              checked={isContactOnly}
                              onCheckedChange={(checked) => setPriceFlag(plan.key, region.key, "contactOnly", checked)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionShell>

              <SectionShell
                title="Promotion / Discount"
                description="Promo text, timing, and per-region override prices are organized together."
                icon={<Tag size={14} />}
                actions={
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">{promos[plan.key]?.enabled ? "Active" : "Off"}</Label>
                    <Switch checked={!!promos[plan.key]?.enabled} onCheckedChange={(checked) => updatePromo(plan.key, { enabled: checked })} />
                  </div>
                }
              >
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <div>
                      <Label className="mb-1 block text-xs text-muted-foreground">Discount %</Label>
                      <Input
                        type="number"
                        min={1}
                        max={99}
                        value={promos[plan.key]?.discountPercent ?? 0}
                        onChange={(e) =>
                          updatePromo(plan.key, {
                            discountPercent: Math.max(0, Math.min(99, parseInt(e.target.value || "0", 10) || 0)),
                          })
                        }
                        disabled={!promos[plan.key]?.enabled}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block text-xs text-muted-foreground">Promo label (English)</Label>
                      <Input
                        value={promos[plan.key]?.label ?? ""}
                        onChange={(e) => updatePromo(plan.key, { label: e.target.value })}
                        disabled={!promos[plan.key]?.enabled}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} /> Ends on
                      </Label>
                      <Input
                        type="date"
                        value={promos[plan.key]?.endsAt ?? ""}
                        onChange={(e) => updatePromo(plan.key, { endsAt: e.target.value })}
                        disabled={!promos[plan.key]?.enabled}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block text-xs text-muted-foreground">Promo label (Arabic)</Label>
                      <Input
                        dir="rtl"
                        value={promos[plan.key]?.label_ar ?? ""}
                        onChange={(e) => updatePromo(plan.key, { label_ar: e.target.value })}
                        disabled={!promos[plan.key]?.enabled}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-muted-foreground">Savings line (English)</Label>
                      <Input
                        value={promos[plan.key]?.saveLine ?? ""}
                        onChange={(e) => updatePromo(plan.key, { saveLine: e.target.value })}
                        disabled={!promos[plan.key]?.enabled}
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block text-xs text-muted-foreground">Savings line (Arabic)</Label>
                      <Input
                        dir="rtl"
                        value={promos[plan.key]?.saveLine_ar ?? ""}
                        onChange={(e) => updatePromo(plan.key, { saveLine_ar: e.target.value })}
                        disabled={!promos[plan.key]?.enabled}
                      />
                    </div>
                  </div>

                  <div className="rounded-md border border-border bg-muted/20 p-3">
                    <div className="mb-3 text-xs font-medium text-muted-foreground">Regional promo price overrides</div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {REGIONS.map((region) => {
                        const override = promos[plan.key]?.overrides?.[region.key];
                        return (
                          <div key={region.key} className="rounded-md border border-border bg-background p-3">
                            <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              <span>{region.label}</span>
                              <span>{region.symbol}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="mb-1 block text-[10px] text-muted-foreground">Monthly</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="auto"
                                  value={override?.monthly ?? ""}
                                  onChange={(e) => updatePromoOverride(plan.key, region.key, "monthly", e.target.value)}
                                  disabled={!promos[plan.key]?.enabled}
                                />
                              </div>
                              <div>
                                <Label className="mb-1 block text-[10px] text-muted-foreground">Yearly</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder="auto"
                                  value={override?.yearly ?? ""}
                                  onChange={(e) => updatePromoOverride(plan.key, region.key, "yearly", e.target.value)}
                                  disabled={!promos[plan.key]?.enabled}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </SectionShell>

              <SectionShell
                title="Features"
                description="Feature text, geo targeting, order, and inclusion state stay in one list."
                icon={<ListChecks size={14} />}
                actions={
                  <Button type="button" variant="outline" size="sm" onClick={() => addFeature(plan.key)} className="gap-2">
                    <Plus size={14} /> Add feature
                  </Button>
                }
              >
                <div className="space-y-3">
                  {(features[plan.key] ?? []).map((feature, featureIndex) => (
                    <div key={`${plan.key}-${featureIndex}`} className="rounded-md border border-border bg-muted/20 p-3">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-medium text-muted-foreground">Feature {featureIndex + 1}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => moveFeature(plan.key, featureIndex, -1)}
                            disabled={featureIndex === 0}
                          >
                            <ArrowUp size={14} />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => moveFeature(plan.key, featureIndex, 1)}
                            disabled={featureIndex === (features[plan.key]?.length ?? 0) - 1}
                          >
                            <ArrowDown size={14} />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={feature.included ? "default" : "outline"}
                            onClick={() => updateFeature(plan.key, featureIndex, { included: !feature.included })}
                            className="gap-2"
                          >
                            {feature.included ? <Check size={14} /> : <X size={14} />}
                            {feature.included ? "Included" : "Excluded"}
                          </Button>
                          <Button type="button" size="icon" variant="ghost" onClick={() => removeFeature(plan.key, featureIndex)} className="text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <div>
                          <Label className="mb-1 block text-xs text-muted-foreground">Feature name (English)</Label>
                          <Input
                            placeholder="Feature name (English)"
                            value={feature.name}
                            onChange={(e) => updateFeature(plan.key, featureIndex, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="mb-1 block text-xs text-muted-foreground">Feature name (Arabic)</Label>
                          <Input
                            dir="rtl"
                            placeholder="اسم الميزة"
                            value={feature.name_ar ?? ""}
                            onChange={(e) => updateFeature(plan.key, featureIndex, { name_ar: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="mt-3 rounded-md border border-border bg-background px-3 py-3">
                        <div className="mb-2 text-xs font-medium text-muted-foreground">Where this feature should appear</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={(feature.geoTargets?.length ?? 0) === 0 ? "default" : "outline"}
                            onClick={() => setFeatureAllGeos(plan.key, featureIndex, (feature.geoTargets?.length ?? 0) !== 0)}
                          >
                            All geos
                          </Button>
                          {FEATURE_GEO_OPTIONS.map((option) => (
                            <Button
                              key={option.key}
                              type="button"
                              size="sm"
                              variant={feature.geoTargets?.includes(option.key) ? "default" : "outline"}
                              onClick={() => toggleFeatureGeo(plan.key, featureIndex, option.key)}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionShell>
            </div> : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingEditor;
