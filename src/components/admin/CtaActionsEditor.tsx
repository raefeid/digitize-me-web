import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Save, ExternalLink, Mail, Phone, MessageCircle, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CTA_REGISTRY, useCtaTargets, CtaKind, CtaDefinition } from "@/hooks/useCtaTargets";
import { useFeatures } from "@/hooks/useFeatures";
import { useCmsPricing } from "@/hooks/useCmsPricing";
import { useDynamicIndustries } from "@/hooks/useDynamicIndustries";
import { normalizeCtaDestination, ctaDestinationNeedsNormalization } from "@/lib/normalizeCtaDestination";

const KIND_OPTIONS: { value: CtaKind; label: string; icon: typeof Mail; placeholder: string; hint: string }[] = [
  { value: "link", label: "Internal page", icon: LinkIcon, placeholder: "/contact", hint: "Site path, e.g. /pricing or /contact" },
  { value: "email", label: "Email", icon: Mail, placeholder: "info@digitizeme.ae", hint: "Opens the user's mail app" },
  { value: "phone", label: "Phone", icon: Phone, placeholder: "+971 4 580 8611", hint: "Opens the dialer on mobile" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, placeholder: "+971 56 522 6587", hint: "Opens wa.me chat in a new tab" },
  { value: "external", label: "External URL", icon: ExternalLink, placeholder: "https://calendly.com/...", hint: "Opens in a new tab" },
];

const CTA_PAGE = "cta_actions";

interface RowState {
  kind: CtaKind;
  value: string;
}

/**
 * Admin panel: per-button editor that writes the destination of every CTA
 * into the `site_content` table under page=cta_actions.
 */
const CtaActionsEditor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { get, rows, isLoading } = useCtaTargets();
  const { data: features = [] } = useFeatures();
  const { catalog } = useCmsPricing();
  const { list: industries } = useDynamicIndustries();

  const editableDefinitions = useMemo<CtaDefinition[]>(() => {
    const dynamic: CtaDefinition[] = [
      ...catalog.map((plan) => ({
        key: `pricing_plan_cta_${plan.key}`,
        location: `Pricing — ${plan.name} plan button`,
        defaultKind: "link" as const,
        defaultValue: "/contact",
      })),
      ...features.flatMap((feature) => [
        {
          key: `feature_hero_primary_${feature.slug}`,
          location: `Feature page — ${feature.slug} hero primary`,
          defaultKind: "link" as const,
          defaultValue: feature.cta_primary_link || "/contact",
        },
        {
          key: `feature_hero_secondary_${feature.slug}`,
          location: `Feature page — ${feature.slug} hero secondary`,
          defaultKind: "link" as const,
          defaultValue: feature.cta_secondary_link || "/pricing",
        },
      ]),
      ...industries.flatMap((industry) => [
        {
          key: `industries_detail_hero_pricing_${industry.slug}`,
          location: `Industry detail (${industry.slug}) — Hero View pricing`,
          defaultKind: "link" as const,
          defaultValue: "/pricing",
        },
        {
          key: `industries_detail_cta_pricing_${industry.slug}`,
          location: `Industry detail (${industry.slug}) — Final CTA View pricing`,
          defaultKind: "link" as const,
          defaultValue: "/pricing",
        },
      ]),
    ];
    const seen = new Set<string>();
    return [...CTA_REGISTRY, ...dynamic].filter((def) => {
      if (seen.has(def.key)) return false;
      seen.add(def.key);
      return true;
    });
  }, [catalog, features, industries]);

  // Initialize local state from the CMS (or defaults)
  const initial = useMemo(() => {
    const map: Record<string, RowState> = {};
    for (const def of editableDefinitions) {
      const t = get(def.key);
      map[def.key] = { kind: t.kind || def.defaultKind, value: t.value || def.defaultValue };
    }
    return map;
  }, [editableDefinitions, get]); // recompute when CTA data or dynamic buttons change
  const [state, setState] = useState<Record<string, RowState>>(initial);
  const [saving, setSaving] = useState<string | null>(null);

  // Sync state when initial data changes (e.g. first load)
  useEffect(() => {
    setState(initial);
  }, [initial]);

  const update = (key: string, patch: Partial<RowState>) => {
    setState((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const save = async (key: string) => {
    const cur = state[key];
    if (!cur) return;
    setSaving(key);
    try {
      // Normalize internal-link destinations so they stay language-agnostic
      // (e.g. "/ar/contact" → "/contact"). The runtime localizer adds "/ar"
      // automatically based on the visitor's language.
      const normalizedValue = normalizeCtaDestination(cur.kind, cur.value);
      if (normalizedValue !== cur.value) {
        update(key, { value: normalizedValue });
      }

      // Upsert two rows: kind + value
      for (const [contentKey, value] of [["kind", cur.kind], ["value", normalizedValue]] as const) {
        const { data: existing } = await supabase
          .from("site_content")
          .select("id")
          .eq("page", CTA_PAGE)
          .eq("section", key)
          .eq("content_key", contentKey)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("site_content")
            .update({ value, content_type: "text" })
            .eq("id", existing.id);
        } else {
          await supabase.from("site_content").insert({
            page: CTA_PAGE,
            section: key,
            content_key: contentKey,
            value,
            content_type: "text",
            sort_order: 0,
          });
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["cta-actions"] });
      toast({ title: "Saved", description: `${key} updated.` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Save failed", description: message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading buttons…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Buttons & links</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Choose what every call-to-action button on your site does. Pick a destination type
          (page, email, phone, WhatsApp, or external URL) and enter the value. Changes apply
          instantly site-wide.
        </p>
      </div>

      <div className="space-y-3">
        {editableDefinitions.map((def) => {
          const cur = state[def.key] ?? { kind: def.defaultKind, value: def.defaultValue };
          const opt = KIND_OPTIONS.find((o) => o.value === cur.kind) ?? KIND_OPTIONS[0];
          const Icon = opt.icon;
          return (
            <div
              key={def.key}
              className="bg-card border border-border rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">{def.location}</div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{def.key}</div>
                </div>
                <Button
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1 shrink-0"
                  onClick={() => save(def.key)}
                  disabled={saving === def.key}
                >
                  <Save size={14} /> {saving === def.key ? "Saving…" : "Save"}
                </Button>
              </div>

              <div className="grid sm:grid-cols-[200px_1fr] gap-2">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">
                    Destination type
                  </label>
                  <select
                    value={cur.kind}
                    onChange={(e) => update(def.key, { kind: e.target.value as CtaKind })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm h-10"
                  >
                    {KIND_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">
                    Value
                  </label>
                  <div className="relative">
                    <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={cur.value}
                      onChange={(e) => update(def.key, { value: e.target.value })}
                      placeholder={opt.placeholder}
                      className="pl-9 h-10"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{opt.hint}</p>
                  {ctaDestinationNeedsNormalization(cur.kind, cur.value) && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                      Tip: don't include the <code className="font-mono">/ar</code> prefix —
                      we'll save this as <code className="font-mono">{normalizeCtaDestination(cur.kind, cur.value)}</code> so
                      Arabic and English visitors are routed correctly.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CtaActionsEditor;
