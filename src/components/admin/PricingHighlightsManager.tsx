import { useState, useEffect } from "react";
import { Sparkles, Save } from "lucide-react";
import {
  usePricingHighlights,
  useSavePricingHighlight,
  PricingHighlight,
} from "@/hooks/usePricingHighlights";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

/**
 * Plan keys used across the pricing page. Keep in sync with the keys passed
 * to `usePricingHighlightMap()` lookups in Pricing.tsx and Index.tsx.
 */
const PLAN_KEYS = [
  { key: "free", label: "Individuals (Free)" },
  { key: "sme", label: "SMEs Edition" },
  { key: "enterprise", label: "Enterprise Edition" },
  { key: "entry", label: "Business Entry" },
  { key: "business", label: "Business" },
  { key: "ai", label: "AI Edition" },
];

type RowState = Omit<PricingHighlight, "id"> & { id?: string };

const PricingHighlightsManager = () => {
  const { data: rows = [], isLoading } = usePricingHighlights();
  const save = useSavePricingHighlight();
  const { toast } = useToast();

  const [edits, setEdits] = useState<Record<string, RowState>>({});

  useEffect(() => {
    // Hydrate row state once data loads
    if (rows.length === 0 && Object.keys(edits).length === 0) return;
    const map: Record<string, RowState> = {};
    PLAN_KEYS.forEach(({ key }) => {
      const existing = rows.find((r) => r.plan_key === key);
      map[key] = existing ?? {
        plan_key: key,
        most_popular: false,
        badge_label: null,
        badge_label_ar: null,
        cta_label_override: null,
        cta_label_override_ar: null,
        cta_link_override: null,
      };
    });
    setEdits(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  const update = (key: string, patch: Partial<RowState>) => {
    setEdits((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const persist = (key: string) => {
    const row = edits[key];
    if (!row) return;
    save.mutate(row, {
      onSuccess: () => toast({ title: `${key} saved` }),
      onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted/40 border border-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Pricing highlights</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Mark a plan as "Most Popular" and override its CTA label/link. Only one plan per group should be popular at a time.
        </p>
      </div>

      <div className="space-y-3">
        {PLAN_KEYS.map(({ key, label }) => {
          const row = edits[key];
          if (!row) return null;
          return (
            <div key={key} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <div className="font-semibold text-foreground">{label}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{key}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`pop-${key}`}
                    checked={row.most_popular}
                    onCheckedChange={(v) => update(key, { most_popular: v })}
                  />
                  <label htmlFor={`pop-${key}`} className="text-sm font-medium inline-flex items-center gap-1">
                    <Sparkles size={14} className="text-accent" /> Most Popular
                  </label>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground/70 mb-1 block">Badge label (EN)</label>
                  <Input
                    placeholder="Most Popular"
                    value={row.badge_label ?? ""}
                    onChange={(e) => update(key, { badge_label: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/70 mb-1 block">Badge label (AR)</label>
                  <Input
                    dir="rtl"
                    placeholder="الأكثر شعبية"
                    value={row.badge_label_ar ?? ""}
                    onChange={(e) => update(key, { badge_label_ar: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/70 mb-1 block">CTA label override (EN)</label>
                  <Input
                    placeholder="(uses default)"
                    value={row.cta_label_override ?? ""}
                    onChange={(e) => update(key, { cta_label_override: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground/70 mb-1 block">CTA label override (AR)</label>
                  <Input
                    dir="rtl"
                    value={row.cta_label_override_ar ?? ""}
                    onChange={(e) => update(key, { cta_label_override_ar: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-foreground/70 mb-1 block">CTA link override</label>
                  <Input
                    placeholder="/contact or https://…"
                    value={row.cta_link_override ?? ""}
                    onChange={(e) => update(key, { cta_link_override: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-3">
                <Button
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
                  onClick={() => persist(key)}
                  disabled={save.isPending}
                >
                  <Save size={14} /> Save
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingHighlightsManager;
