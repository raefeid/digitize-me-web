import { useMemo, useState } from "react";
import { Wand2, Loader2, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useDynamicIndustries } from "@/hooks/useDynamicIndustries";
import { useCustomPages, useSaveCustomPage, type PageBlock } from "@/hooks/useCustomPages";
import { supabase } from "@/integrations/supabase/client";
import { industriesData } from "@/data/industries";

type GenStatus = "idle" | "running" | "done" | "error" | "skipped";
type Row = { slug: string; name: string; status: GenStatus; message?: string };

/**
 * Bulk-generate SEO landing pages, one per industry, using Lovable AI.
 *
 * Flow per industry:
 *   1. Skip if a custom_pages row already exists matching the generated slug.
 *   2. Call edge function `generate-industry-page` for tailored copy + blocks.
 *   3. Insert as a draft so the admin can review before publishing.
 *
 * Output pages live at `/<industry-slug>-document-management` and contain a
 * hero, intro, value cards, an FAQ block (auto-emits FAQPage JSON-LD via
 * SEOHead), a CTA → /contact, and a secondary button → /pricing.
 */
const IndustryPagesGenerator = () => {
  const { toast } = useToast();
  const { publishedList } = useDynamicIndustries();
  const { data: existingPages } = useCustomPages({ includeDrafts: true });
  const save = useSaveCustomPage();

  // Pre-select all hardcoded industries the first time
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(industriesData.map((i) => i.slug)),
  );
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);

  const existingSlugSet = useMemo(
    () => new Set((existingPages ?? []).map((p) => p.slug)),
    [existingPages],
  );

  const toggle = (slug: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  const setRow = (slug: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.slug === slug ? { ...r, ...patch } : r)));

  const run = async () => {
    const targets = publishedList.filter((i) => selected.has(i.slug));
    if (targets.length === 0) {
      toast({ title: "Pick at least one industry", variant: "destructive" });
      return;
    }
    setBusy(true);
    setRows(targets.map((i) => ({ slug: i.slug, name: i.name, status: "idle" })));

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const ind of targets) {
      // Find the rich source data — hardcoded industries carry pain points/solutions.
      const source = industriesData.find((d) => d.slug === ind.slug);
      const expectedSlug = `${ind.slug}-document-management`;

      if (existingSlugSet.has(expectedSlug)) {
        setRow(ind.slug, { status: "skipped", message: "Page already exists" });
        skipped += 1;
        continue;
      }

      setRow(ind.slug, { status: "running" });

      try {
        const { data, error } = await supabase.functions.invoke("generate-industry-page", {
          body: {
            industry: {
              slug: ind.slug,
              name: ind.name,
              headline: source?.headline,
              description: source?.description,
              painPoints: source?.painPoints,
              solutions: source?.solutions,
            },
          },
        });
        if (error) throw error;
        if (!data?.blocks) throw new Error("No page payload");

        await save.mutateAsync({
          slug: data.slug,
          title: data.title,
          seo_title: data.seo_title,
          seo_description: data.seo_description,
          blocks: data.blocks as PageBlock[],
          status: "draft",
        });

        setRow(ind.slug, { status: "done", message: `/${data.slug}` });
        created += 1;
      } catch (e: any) {
        const msg = e?.message || String(e);
        setRow(ind.slug, { status: "error", message: msg });
        failed += 1;
      }

      // Gentle pacing to stay clear of rate limits.
      await new Promise((r) => setTimeout(r, 800));
    }

    setBusy(false);
    toast({
      title: "Generation complete",
      description: `${created} created · ${skipped} skipped · ${failed} failed`,
    });
  };

  return (
    <Card className="p-4 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">AI industry landing pages</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Generates a tailored draft page per industry with hero, value cards, FAQ, and links to{" "}
            <code>/pricing</code> + <code>/contact</code>. FAQ schema is emitted automatically.
          </p>
        </div>
        <Button onClick={run} disabled={busy} size="sm">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {busy ? "Generating…" : "Generate"}
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
        {publishedList.map((ind) => {
          const expectedSlug = `${ind.slug}-document-management`;
          const exists = existingSlugSet.has(expectedSlug);
          const row = rows.find((r) => r.slug === ind.slug);
          return (
            <label
              key={ind.slug}
              className={`flex items-center gap-2 px-2 py-1.5 rounded border text-xs ${
                exists ? "border-muted bg-muted/30 opacity-70" : "border-border bg-background"
              }`}
            >
              <Checkbox
                checked={selected.has(ind.slug)}
                onCheckedChange={() => toggle(ind.slug)}
                disabled={busy}
              />
              <span className="flex-1 truncate font-medium">{ind.name}</span>
              {row?.status === "running" && <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />}
              {row?.status === "done" && <Check className="w-3.5 h-3.5 text-primary" />}
              {row?.status === "error" && <X className="w-3.5 h-3.5 text-destructive" />}
              {row?.status === "skipped" && (
                <span className="text-[10px] text-muted-foreground">exists</span>
              )}
              {!row && exists && (
                <span className="text-[10px] text-muted-foreground">exists</span>
              )}
            </label>
          );
        })}
      </div>

      {rows.some((r) => r.status === "error") && (
        <ul className="mt-3 space-y-1 text-[11px] text-destructive">
          {rows
            .filter((r) => r.status === "error")
            .map((r) => (
              <li key={r.slug}>
                <strong>{r.name}:</strong> {r.message}
              </li>
            ))}
        </ul>
      )}
    </Card>
  );
};

export default IndustryPagesGenerator;
