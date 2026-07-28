import { useEffect, useState } from "react";
import { Loader2, Save, ExternalLink, CheckCircle2, type LucideIcon, BarChart3, Tag, Search, Activity, Eye, Music2, Code2, Share2, Briefcase } from "lucide-react";
import { useSiteContent, useSaveContent, type SiteContentItem } from "@/hooks/useSiteContent";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * Admin panel where the marketing team pastes tracking IDs (GA4, GTM,
 * Google Search Console verification, Meta Pixel, LinkedIn, Clarity, etc.).
 *
 * Values are stored in site_content and consumed by useTrackingScripts().
 * No code changes are required when a new tag is added later — paste & save.
 */

type Field = {
  key: string;
  label: string;
  placeholder: string;
  helper: string;
  pattern?: RegExp;
  icon: LucideIcon;
  textarea?: boolean;
  /** External link to where the user finds this ID */
  helpUrl?: string;
  helpUrlLabel?: string;
};

const groups: Array<{ title: string; description: string; fields: Field[] }> = [
  {
    title: "Google",
    description: "Analytics, Tag Manager and Search Console verification.",
    fields: [
      {
        key: "ga4_id",
        label: "Google Analytics 4 (Measurement ID)",
        placeholder: "G-XXXXXXXXXX",
        helper: "Tracks visits and events. Loads gtag.js automatically.",
        pattern: /^G-[A-Z0-9]+$/i,
        icon: BarChart3,
        helpUrl: "https://analytics.google.com/",
        helpUrlLabel: "Open Analytics",
      },
      {
        key: "gtm_id",
        label: "Google Tag Manager (Container ID)",
        placeholder: "GTM-XXXXXXX",
        helper: "Loads GTM with both <script> and <noscript> snippets.",
        pattern: /^GTM-[A-Z0-9]+$/i,
        icon: Tag,
        helpUrl: "https://tagmanager.google.com/",
        helpUrlLabel: "Open Tag Manager",
      },
      {
        key: "gsc_token",
        label: "Google Search Console — verification token",
        placeholder: "google-site-verification value",
        helper: "Paste only the value (not the whole meta tag). Used to verify ownership.",
        icon: Search,
        helpUrl: "https://search.google.com/search-console",
        helpUrlLabel: "Open Search Console",
      },
    ],
  },
  {
    title: "Marketing pixels",
    description: "Conversion tracking for paid campaigns.",
    fields: [
      {
        key: "meta_pixel_id",
        label: "Meta / Facebook Pixel ID",
        placeholder: "1234567890123456",
        helper: "Pixel ID only — found in Events Manager.",
        pattern: /^\d+$/,
        icon: Share2,
        helpUrl: "https://business.facebook.com/events_manager",
        helpUrlLabel: "Open Events Manager",
      },
      {
        key: "linkedin_id",
        label: "LinkedIn Insight Partner ID",
        placeholder: "1234567",
        helper: "Numeric ID from your LinkedIn Campaign Manager.",
        pattern: /^\d+$/,
        icon: Briefcase,
      },
      {
        key: "tiktok_id",
        label: "TikTok Pixel ID",
        placeholder: "C12ABCDEFGHIJKLMNOP",
        helper: "Found under Events → Web Events in TikTok Ads Manager.",
        icon: Music2,
      },
    ],
  },
  {
    title: "Heatmaps & session replay",
    description: "Optional behaviour analytics.",
    fields: [
      {
        key: "clarity_id",
        label: "Microsoft Clarity Project ID",
        placeholder: "abcdefghij",
        helper: "Free heatmaps and session recordings.",
        pattern: /^[a-z0-9]+$/i,
        icon: Eye,
        helpUrl: "https://clarity.microsoft.com/",
        helpUrlLabel: "Open Clarity",
      },
      {
        key: "hotjar_id",
        label: "Hotjar Site ID",
        placeholder: "1234567",
        helper: "Numeric site ID from Hotjar dashboard.",
        pattern: /^\d+$/,
        icon: Activity,
      },
    ],
  },
  {
    title: "Custom code (advanced)",
    description: "For tags not in the list above. Pasted as-is — be careful.",
    fields: [
      {
        key: "custom_head",
        label: "Custom <head> HTML",
        placeholder: "<script>...</script>",
        helper: "Appended to the document <head> on every page.",
        icon: Code2,
        textarea: true,
      },
      {
        key: "custom_body",
        label: "Custom <body> HTML",
        placeholder: "<noscript>...</noscript>",
        helper: "Appended to the document <body> (e.g. pixel <noscript> fallbacks).",
        icon: Code2,
        textarea: true,
      },
    ],
  },
];

const ALL_FIELDS = groups.flatMap((g) => g.fields);

const TrackingScriptsEditor = () => {
  const { items, isLoading } = useSiteContent("integrations", "tracking");
  const saveContent = useSaveContent();
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  // Hydrate local state from DB
  useEffect(() => {
    if (isLoading) return;
    const next: Record<string, string> = {};
    ALL_FIELDS.forEach((f) => {
      const row = items.find((i) => i.content_key === f.key);
      next[f.key] = row?.value ?? "";
    });
    setValues(next);
    setDirty(false);
  }, [items, isLoading]);

  const findRow = (key: string): SiteContentItem | undefined =>
    items.find((i) => i.content_key === key);

  const setField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const validateAll = (): string | null => {
    for (const f of ALL_FIELDS) {
      const v = (values[f.key] ?? "").trim();
      if (v && f.pattern && !f.pattern.test(v)) {
        return `${f.label}: format looks wrong. Expected like "${f.placeholder}".`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const error = validateAll();
    if (error) {
      toast({ title: "Check your IDs", description: error, variant: "destructive" });
      return;
    }
    try {
      for (const f of ALL_FIELDS) {
        const trimmed = (values[f.key] ?? "").trim();
        const existing = findRow(f.key);
        // Skip rows that are still empty and never existed
        if (!trimmed && !existing) continue;
        await saveContent.mutateAsync({
          id: existing?.id,
          page: "integrations",
          section: "tracking",
          content_key: f.key,
          value: trimmed,
          content_type: "text",
          sort_order: existing?.sort_order ?? 0,
        });
      }
      toast({
        title: "Tracking scripts saved",
        description: "Reload any open page to see the new tags fire.",
      });
      setDirty(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-8">
        <Loader2 className="animate-spin" size={16} /> Loading tracking scripts…
      </div>
    );
  }

  const filledCount = ALL_FIELDS.filter((f) => (values[f.key] ?? "").trim()).length;

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="bg-gradient-to-br from-card to-muted/30 border border-border rounded-xl p-5 flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
          <Tag size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Tracking & analytics integrations</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Paste your IDs below and hit <strong>Save</strong>. The matching scripts will be loaded on every page automatically — no code changes needed. Leave any field empty to disable that tag.
          </p>
          <div className="text-xs text-muted-foreground mt-2">
            <CheckCircle2 size={12} className="inline -mt-0.5 mr-1 text-emerald-500" />
            {filledCount} of {ALL_FIELDS.length} integrations configured
          </div>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.title} className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <h4 className="font-semibold text-foreground">{group.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
          </div>
          <div className="space-y-4">
            {group.fields.map((f) => {
              const Icon = f.icon;
              const v = values[f.key] ?? "";
              const invalid = v.trim() && f.pattern && !f.pattern.test(v.trim());
              return (
                <div key={f.key} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Icon size={14} className="text-muted-foreground" />
                      {f.label}
                      {v.trim() && !invalid && (
                        <CheckCircle2 size={12} className="text-emerald-500" />
                      )}
                    </label>
                    {f.helpUrl && (
                      <a
                        href={f.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline inline-flex items-center gap-0.5"
                      >
                        {f.helpUrlLabel ?? "Where to find it"} <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  {f.textarea ? (
                    <Textarea
                      value={v}
                      onChange={(e) => setField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  ) : (
                    <Input
                      value={v}
                      onChange={(e) => setField(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className={invalid ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                  )}
                  <p className={`text-[11px] ${invalid ? "text-destructive" : "text-muted-foreground"}`}>
                    {invalid ? `Expected format: ${f.placeholder}` : f.helper}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-10 bg-card border border-border rounded-xl p-3 flex items-center justify-between shadow-lg">
        <div className="text-xs text-muted-foreground">
          {dirty ? "You have unsaved changes." : "All changes saved."}
        </div>
        <Button
          onClick={handleSave}
          disabled={!dirty || saveContent.isPending}
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5"
        >
          {saveContent.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          Save tracking settings
        </Button>
      </div>
    </div>
  );
};

export default TrackingScriptsEditor;
