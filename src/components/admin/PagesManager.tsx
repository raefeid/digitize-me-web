import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Type, Layout as LayoutIcon, Megaphone, FileText, Save, Eye, ExternalLink, Sparkles, Loader2, AlertTriangle, CheckCircle2, XCircle, ArrowRight, Download, HelpCircle, Quote, BarChart3, Building2, Columns2, Video, DollarSign, Minus, MousePointerClick, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCustomPages, useSaveCustomPage, useDeleteCustomPage, type CustomPageRow, type PageBlock } from "@/hooks/useCustomPages";
import { BlockRenderer } from "@/components/cms/BlockRenderer";
import { supabase } from "@/integrations/supabase/client";
import MediaPicker from "./MediaPicker";
import CustomPageSeoChecklist from "./CustomPageSeoChecklist";
import OgCardPreview from "./OgCardPreview";
import SeoAuditTrail from "./SeoAuditTrail";
import IndustryPagesGenerator from "./IndustryPagesGenerator";

const uid = () => Math.random().toString(36).slice(2, 10);
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const RESERVED_SLUGS = new Set([
  "admin", "blog", "contact", "features", "industries", "pricing",
  "privacy", "product", "terms",
]);

type SeoIssue = { field: string; message: string; severity: "error" | "warning" };

const validateSeo = (p: {
  slug?: string;
  title?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_og_image?: string | null;
}): SeoIssue[] => {
  const issues: SeoIssue[] = [];
  const slug = (p.slug ?? "").trim();
  const title = (p.seo_title ?? "").trim();
  const desc = (p.seo_description ?? "").trim();
  const og = (p.seo_og_image ?? "").trim();

  if (!slug) issues.push({ field: "Canonical URL", message: "Slug is required to build the canonical URL.", severity: "error" });
  else if (!/^[a-z0-9-]+$/.test(slug)) issues.push({ field: "Canonical URL", message: "Slug must use lowercase letters, numbers, and dashes only.", severity: "error" });
  else if (RESERVED_SLUGS.has(slug)) issues.push({ field: "Canonical URL", message: `"${slug}" is reserved by the app.`, severity: "error" });
  else if (slug.length > 60) issues.push({ field: "Canonical URL", message: `Slug is ${slug.length} chars — keep under 60 for shareability.`, severity: "warning" });

  if (!title) issues.push({ field: "Meta title", message: `Missing — falls back to page title "${p.title ?? ""}".`, severity: "warning" });
  else if (title.length < 30) issues.push({ field: "Meta title", message: `Too short (${title.length} chars). Aim for 30-60.`, severity: "warning" });
  else if (title.length > 70) issues.push({ field: "Meta title", message: `Too long (${title.length} chars). Google truncates above 60.`, severity: "warning" });

  if (!desc) issues.push({ field: "Meta description", message: "Missing — search engines will auto-generate one.", severity: "warning" });
  else if (desc.length < 70) issues.push({ field: "Meta description", message: `Too short (${desc.length} chars). Aim for 70-160.`, severity: "warning" });
  else if (desc.length > 170) issues.push({ field: "Meta description", message: `Too long (${desc.length} chars). Google truncates above 160.`, severity: "warning" });

  if (!og) issues.push({ field: "OG image", message: "No social preview image — LinkedIn / X / Slack will show a blank card.", severity: "warning" });
  else if (!/^https?:\/\//i.test(og)) issues.push({ field: "OG image", message: "Use an absolute https:// URL — relative paths break on social platforms.", severity: "error" });

  return issues;
};

/**
 * Recommended-fix copy keyed by `field` so the downloaded report is
 * actionable rather than just a list of validator messages.
 */
const SEO_FIX_HINTS: Record<string, string> = {
  "Meta title": "Write a 30–60 character title with the primary keyword near the start. Include the brand name only if space allows.",
  "Meta description": "Write a 70–160 character summary that mirrors the page intent and ends with a soft CTA (e.g. \"Learn more\", \"Get a demo\").",
  "Canonical URL": "Use a short, lowercase, dash-separated slug (≤60 chars). Avoid stop words and reserved app routes.",
  "OG image": "Provide an absolute https:// URL to a 1200×630 PNG/JPG. Show the page topic clearly and keep text legible at small sizes.",
};

/**
 * Build a printable, standalone HTML report summarising the page's SEO
 * publish-readiness. Returns a Blob so the caller can trigger a download.
 *
 * The report intentionally embeds all styles + content (no external assets)
 * so it can be opened offline, emailed, or printed to PDF via the browser.
 */
const buildSeoReportHtml = (
  page: { title: string; slug: string; status: string; seo_title?: string | null; seo_description?: string | null; seo_og_image?: string | null },
  issues: SeoIssue[],
  blockers: SeoIssue[],
): string => {
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const generated = new Date().toLocaleString();
  const ready = blockers.length === 0 && errors.length === 0;
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const renderRow = (i: SeoIssue) => `
    <tr>
      <td class="field">${escape(i.field)}</td>
      <td>${escape(i.message)}</td>
      <td class="fix">${escape(SEO_FIX_HINTS[i.field] ?? "Review the field and re-run the checklist.")}</td>
    </tr>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>SEO publish readiness — ${escape(page.title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; max-width: 880px; margin: 32px auto; padding: 0 24px; line-height: 1.5; }
  header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin: 28px 0 10px; }
  .meta { font-size: 12px; color: #64748b; }
  .summary { display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0 0; }
  .pill { font-size: 12px; padding: 6px 10px; border-radius: 999px; font-weight: 600; }
  .pill.ok { background: #dcfce7; color: #166534; }
  .pill.bad { background: #fee2e2; color: #991b1b; }
  .pill.warn { background: #fef3c7; color: #92400e; }
  .pill.info { background: #e0e7ff; color: #3730a3; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
  th, td { text-align: left; padding: 10px 12px; vertical-align: top; border-bottom: 1px solid #e2e8f0; }
  th { background: #f8fafc; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #475569; }
  td.field { font-weight: 600; white-space: nowrap; }
  td.fix { color: #334155; font-style: italic; }
  .verdict { padding: 14px 16px; border-radius: 10px; margin-top: 12px; font-weight: 600; }
  .verdict.go { background: #dcfce7; color: #166534; }
  .verdict.stop { background: #fee2e2; color: #991b1b; }
  .empty { padding: 12px; background: #f8fafc; border-radius: 8px; color: #64748b; font-size: 13px; }
  dl { display: grid; grid-template-columns: 160px 1fr; gap: 6px 16px; font-size: 13px; margin: 0; }
  dt { color: #64748b; }
  dd { margin: 0; word-break: break-word; }
  footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; }
  @media print { body { margin: 0; padding: 16px; } header { page-break-after: avoid; } table { page-break-inside: auto; } tr { page-break-inside: avoid; } }
</style>
</head>
<body>
  <header>
    <h1>SEO publish readiness — ${escape(page.title)}</h1>
    <div class="meta">Generated ${escape(generated)} · Status: ${escape(page.status)}</div>
    <div class="summary">
      <span class="pill ${ready ? "ok" : "bad"}">${ready ? "Ready to publish" : "Not ready"}</span>
      <span class="pill bad">${errors.length} error${errors.length === 1 ? "" : "s"}</span>
      <span class="pill warn">${blockers.filter((b) => b.severity !== "error").length} publish blocker${blockers.filter((b) => b.severity !== "error").length === 1 ? "" : "s"}</span>
      <span class="pill info">${warnings.length} warning${warnings.length === 1 ? "" : "s"}</span>
    </div>
  </header>

  <div class="verdict ${ready ? "go" : "stop"}">
    ${ready
      ? "✓ All required SEO fields are populated. This page can be published."
      : `✗ Resolve ${blockers.length + errors.filter((e) => !blockers.includes(e)).length} blocking item(s) before publishing.`}
  </div>

  <h2>Page snapshot</h2>
  <dl>
    <dt>Slug</dt><dd>/${escape(page.slug || "—")}</dd>
    <dt>Meta title</dt><dd>${escape(page.seo_title || "(not set — falls back to page title)")}</dd>
    <dt>Meta description</dt><dd>${escape(page.seo_description || "(not set)")}</dd>
    <dt>OG image</dt><dd>${escape(page.seo_og_image || "(not set)")}</dd>
  </dl>

  <h2>Errors blocking save (${errors.length})</h2>
  ${errors.length === 0
    ? '<div class="empty">No save-blocking errors.</div>'
    : `<table><thead><tr><th>Field</th><th>Issue</th><th>Recommended fix</th></tr></thead><tbody>${errors.map(renderRow).join("")}</tbody></table>`}

  <h2>Publish blockers (${blockers.length})</h2>
  ${blockers.length === 0
    ? '<div class="empty">No publish-blocking issues — required SEO fields are complete.</div>'
    : `<table><thead><tr><th>Field</th><th>Issue</th><th>Recommended fix</th></tr></thead><tbody>${blockers.map(renderRow).join("")}</tbody></table>`}

  <h2>Warnings (${warnings.length})</h2>
  ${warnings.length === 0
    ? '<div class="empty">No warnings.</div>'
    : `<table><thead><tr><th>Field</th><th>Issue</th><th>Recommended fix</th></tr></thead><tbody>${warnings.map(renderRow).join("")}</tbody></table>`}

  <footer>Tip: open this report in a browser and use “Print → Save as PDF” to share with stakeholders.</footer>
</body>
</html>`;
};

const blockTemplates: Record<PageBlock["type"], () => PageBlock> = {
  hero: () => ({ id: uid(), type: "hero", eyebrow: "New", title: "Headline goes here", desc: "Short supporting paragraph.", cta_label: "Get started", cta_link: "/contact" }),
  rich_text: () => ({ id: uid(), type: "rich_text", html: "<p>Write your content here…</p>" }),
  cards: () => ({ id: uid(), type: "cards", title: "Why choose us", cards: [
    { icon: "Sparkles", title: "Card 1", desc: "Describe this benefit." },
    { icon: "Zap", title: "Card 2", desc: "Describe this benefit." },
    { icon: "ShieldCheck", title: "Card 3", desc: "Describe this benefit." },
  ] }),
  image: () => ({ id: uid(), type: "image", url: "", alt: "", caption: "" }),
  cta: () => ({ id: uid(), type: "cta", title: "Ready to start?", desc: "Talk to our team today.", cta_label: "Contact us", cta_link: "/contact" }),
  faq: () => ({ id: uid(), type: "faq", title: "Frequently asked questions", items: [
    { q: "What is included?", a: "Describe what customers get with this plan." },
    { q: "How do I get started?", a: "Walk through the onboarding steps here." },
    { q: "Can I cancel anytime?", a: "Explain your cancellation policy." },
  ] }),
  testimonial: () => ({ id: uid(), type: "testimonial", quote: "This product completely changed how we work.", author: "Jane Doe", role: "Head of Operations", company: "Acme Inc." }),
  stats: () => ({ id: uid(), type: "stats", title: "By the numbers", stats: [
    { value: "10K+", label: "Active customers" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "24/7", label: "Support" },
  ] }),
  logo_strip: () => ({ id: uid(), type: "logo_strip", title: "Trusted by leading teams", logos: [
    { url: "", alt: "Company 1" },
    { url: "", alt: "Company 2" },
    { url: "", alt: "Company 3" },
    { url: "", alt: "Company 4" },
  ] }),
  two_column: () => ({ id: uid(), type: "two_column", title: "Built for your team", desc: "Describe how your product solves the customer's problem on this side, with a supporting visual on the other.", image: "", image_side: "right", cta_label: "Learn more", cta_link: "/features" }),
  video: () => ({ id: uid(), type: "video", url: "", title: "", caption: "" }),
  pricing_teaser: () => ({ id: uid(), type: "pricing_teaser", title: "Simple, transparent pricing", desc: "Pick the plan that fits your team.", tiers: [
    { name: "Starter", price: "$0", features: "Up to 3 users\nCommunity support" },
    { name: "Growth", price: "$49/mo", features: "Unlimited users\nPriority support\nAdvanced analytics" },
    { name: "Enterprise", price: "Custom", features: "SSO & SAML\nDedicated CSM\nCustom SLA" },
  ], cta_label: "See full pricing", cta_link: "/pricing" }),
  divider: () => ({ id: uid(), type: "divider", style: "line", size: "md" }),
  button: () => ({ id: uid(), type: "button", label: "Click me", link: "/contact", variant: "default", size: "default", align: "center" }),
  container: () => ({ id: uid(), type: "container", title: "Section title", desc: "Add supporting copy here.", image: "", align: "left", background: "muted" }),
};

const blockMeta: Record<PageBlock["type"], { label: string; icon: any }> = {
  hero: { label: "Hero", icon: LayoutIcon },
  rich_text: { label: "Rich text", icon: Type },
  cards: { label: "Cards", icon: FileText },
  image: { label: "Image", icon: ImageIcon },
  cta: { label: "CTA banner", icon: Megaphone },
  faq: { label: "FAQ", icon: HelpCircle },
  testimonial: { label: "Testimonial", icon: Quote },
  stats: { label: "Stats", icon: BarChart3 },
  logo_strip: { label: "Logo strip", icon: Building2 },
  two_column: { label: "Two-column", icon: Columns2 },
  video: { label: "Video", icon: Video },
  pricing_teaser: { label: "Pricing", icon: DollarSign },
  divider: { label: "Divider", icon: Minus },
  button: { label: "Button", icon: MousePointerClick },
  container: { label: "Container", icon: Box },
};

const PagesManager = () => {
  const { toast } = useToast();
  const { data: pages, isLoading } = useCustomPages({ includeDrafts: true });
  const save = useSaveCustomPage();
  const del = useDeleteCustomPage();

  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = useMemo(
    () => (editingId ? pages?.find((p) => p.id === editingId) ?? null : null),
    [editingId, pages]
  );

  // Local working copy so edits don't autosave on every keystroke
  const [draft, setDraft] = useState<CustomPageRow | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [mediaFor, setMediaFor] = useState<{ blockId: string; field: "image" | "url" } | null>(null);
  const [generatingSeo, setGeneratingSeo] = useState(false);

  /**
   * Generate SEO suggestions via the AI edge function.
   *
   * @param onlyMissing  If true, only fields that are currently empty are
   *                     overwritten — used by the banner's "Fix missing with AI"
   *                     action so user-edited values are preserved.
   */
  const handleGenerateSeo = async (onlyMissing = false) => {
    if (!draft) return;
    setGeneratingSeo(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-page-seo", {
        body: { title: draft.title, slug: draft.slug, blocks: draft.blocks },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const cleanSlug = slugify(data.slug || draft.slug);
      const titleEmpty = !(draft.seo_title ?? "").trim();
      const descEmpty = !(draft.seo_description ?? "").trim();
      const slugEmpty = !(draft.slug ?? "").trim();

      // Compute the diff up-front so we can both update draft and write a
      // single audit log entry capturing exactly what the AI changed.
      const before: Record<string, string | null> = {};
      const after: Record<string, string | null> = {};
      const changed: string[] = [];

      const titleApplies = (!onlyMissing || titleEmpty) && data.seo_title && data.seo_title !== draft.seo_title;
      if (titleApplies) {
        before.seo_title = draft.seo_title ?? null;
        after.seo_title = data.seo_title;
        changed.push("seo_title");
      }
      const descApplies = (!onlyMissing || descEmpty) && data.seo_description && data.seo_description !== draft.seo_description;
      if (descApplies) {
        before.seo_description = draft.seo_description ?? null;
        after.seo_description = data.seo_description;
        changed.push("seo_description");
      }
      const slugCandidate = cleanSlug && !RESERVED_SLUGS.has(cleanSlug) ? cleanSlug : null;
      const slugApplies = !!slugCandidate && (!onlyMissing || slugEmpty) && slugCandidate !== draft.slug;
      if (slugApplies) {
        before.slug = draft.slug ?? null;
        after.slug = slugCandidate!;
        changed.push("slug");
      }

      setDraft((d) => {
        if (!d) return d;
        return {
          ...d,
          ...(titleApplies ? { seo_title: data.seo_title } : {}),
          ...(descApplies ? { seo_description: data.seo_description } : {}),
          ...(slugApplies ? { slug: slugCandidate! } : {}),
        };
      });

      // Persist an audit entry only when something actually changed and the
      // page already has a stable id (drafts are saved before first edit).
      if (changed.length > 0 && draft.id) {
        const { data: userData } = await supabase.auth.getUser();
        const { error: auditErr } = await supabase.from("seo_audit_log").insert({
          page_id: draft.id,
          actor_id: userData.user?.id ?? null,
          actor_email: userData.user?.email ?? null,
          source: "ai_generate",
          mode: onlyMissing ? "fill_missing" : "regenerate_all",
          fields_changed: changed,
          before_values: before,
          after_values: after,
        });
        // Audit failures shouldn't block the user — surface quietly.
        if (auditErr) console.warn("SEO audit log insert failed", auditErr);
        // Notify the viewer panel to refresh.
        window.dispatchEvent(new CustomEvent("seo-audit-log-updated", { detail: { pageId: draft.id } }));
      }

      const friendlyNames: Record<string, string> = {
        seo_title: "Meta title",
        seo_description: "Meta description",
        slug: "Canonical slug",
      };
      toast({
        title: onlyMissing
          ? changed.length
            ? `Filled ${changed.length} missing field${changed.length === 1 ? "" : "s"}`
            : "Nothing to fill"
          : "SEO generated",
        description: changed.length
          ? changed.map((f) => friendlyNames[f] ?? f).join(", ")
          : "Review suggestions before publishing.",
      });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    } finally {
      setGeneratingSeo(false);
    }
  };

  useEffect(() => {
    setDraft(editing ? { ...editing, blocks: [...editing.blocks] } : null);
    setSelectedBlockId(editing && editing.blocks[0] ? editing.blocks[0].id : null);
  }, [editing]);

  const updateBlock = (id: string, patch: Partial<PageBlock>) => {
    setDraft((d) =>
      d ? { ...d, blocks: d.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as PageBlock) : b)) } : d
    );
  };

  const addBlock = (type: PageBlock["type"]) => {
    const block = blockTemplates[type]();
    setDraft((d) => (d ? { ...d, blocks: [...d.blocks, block] } : d));
    setSelectedBlockId(block.id);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    setDraft((d) => {
      if (!d) return d;
      const idx = d.blocks.findIndex((b) => b.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= d.blocks.length) return d;
      const blocks = [...d.blocks];
      const [m] = blocks.splice(idx, 1);
      blocks.splice(target, 0, m);
      return { ...d, blocks };
    });
  };

  const removeBlock = (id: string) => {
    setDraft((d) => (d ? { ...d, blocks: d.blocks.filter((b) => b.id !== id) } : d));
    setSelectedBlockId(null);
  };

  const seoIssues = useMemo(
    () =>
      draft
        ? validateSeo({
            slug: slugify(draft.slug || draft.title || ""),
            title: draft.title,
            seo_title: draft.seo_title,
            seo_description: draft.seo_description,
            seo_og_image: draft.seo_og_image,
          })
        : [],
    [draft]
  );
  const seoErrors = seoIssues.filter((i) => i.severity === "error");
  const seoWarnings = seoIssues.filter((i) => i.severity === "warning");

  // Publish-blocking = any error OR any "missing" warning on critical SEO fields.
  // These mirror the SEO checklist's blocking checks shown to the user.
  const PUBLISH_BLOCKING_FIELDS = new Set(["Meta title", "Meta description", "Canonical URL", "OG image"]);
  const publishBlockers = seoIssues.filter(
    (i) => i.severity === "error" || (PUBLISH_BLOCKING_FIELDS.has(i.field) && /missing/i.test(i.message))
  );

  const handleSave = async (publish?: boolean) => {
    if (!draft) return;
    const slug = slugify(draft.slug || draft.title);
    if (!slug) {
      toast({ title: "Slug required", variant: "destructive" });
      return;
    }
    if (RESERVED_SLUGS.has(slug)) {
      toast({ title: `"${slug}" is reserved`, description: "Pick a different URL.", variant: "destructive" });
      return;
    }
    // Errors always block both save and publish.
    if (seoErrors.length > 0) {
      toast({
        title: "Fix SEO errors before saving",
        description: seoErrors.map((e) => `${e.field}: ${e.message}`).join(" • "),
        variant: "destructive",
      });
      return;
    }
    // Publish has stricter rules: every blocking SEO field must be filled.
    if (publish && publishBlockers.length > 0) {
      toast({
        title: `Cannot publish — ${publishBlockers.length} required SEO field${publishBlockers.length === 1 ? "" : "s"} missing`,
        description: publishBlockers.map((e) => e.field).join(", "),
        variant: "destructive",
      });
      return;
    }
    // Non-blocking warnings (length, slug shape) just need a confirm on publish.
    if (publish && seoWarnings.length > 0) {
      const ok = window.confirm(
        `This page has ${seoWarnings.length} SEO warning${seoWarnings.length === 1 ? "" : "s"}. Publish anyway?`
      );
      if (!ok) return;
    }
    try {
      const id = await save.mutateAsync({
        ...draft,
        slug,
        status: publish ? "published" : draft.status,
        published_at: publish ? new Date().toISOString() : draft.published_at,
      });
      toast({ title: publish ? "Page published" : "Page saved" });
      if (!editingId) setEditingId(id);
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    }
  };

  const handleNew = async () => {
    const title = window.prompt("New page title?", "About us");
    if (!title) return;
    const slug = slugify(title);
    if (RESERVED_SLUGS.has(slug)) {
      toast({ title: `"${slug}" is reserved`, variant: "destructive" });
      return;
    }
    try {
      const id = await save.mutateAsync({
        slug,
        title,
        blocks: [blockTemplates.hero()],
        blocks_ar: [],
        status: "draft",
      } as any);
      toast({ title: "Draft created" });
      setEditingId(id);
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" });
    }
  };

  if (editing && draft) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>← Pages</Button>
            <span className={`text-xs px-2 py-1 rounded-md font-medium ${draft.status === "published" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
              {draft.status === "published" ? "Published" : "Draft"}
            </span>
            <code className="text-xs text-muted-foreground">/{draft.slug}</code>
          </div>
          <div className="flex items-center gap-2">
            {draft.status === "published" && (
              <Button variant="outline" size="sm" asChild>
                <a href={`/${draft.slug}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4" /> View live
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const html = buildSeoReportHtml(draft, seoIssues, publishBlockers);
                const blob = new Blob([html], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `seo-report-${draft.slug || "page"}-${new Date().toISOString().slice(0, 10)}.html`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                toast({ title: "SEO report downloaded", description: "Open it in a browser and Print → Save as PDF to share." });
              }}
              title="Download a printable SEO publish-readiness report"
            >
              <Download className="w-4 h-4" /> SEO report
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={save.isPending}>
              <Save className="w-4 h-4" /> Save draft
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(true)}
              disabled={save.isPending || publishBlockers.length > 0}
              title={
                publishBlockers.length > 0
                  ? `Fix required SEO fields first: ${publishBlockers.map((p) => p.field).join(", ")}`
                  : undefined
              }
            >
              <ExternalLink className="w-4 h-4" /> {draft.status === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        {(seoErrors.length > 0 || publishBlockers.length > 0 || seoWarnings.length > 0) && (
          <div
            role="alert"
            className={`flex gap-3 rounded-lg border p-3 ${
              seoErrors.length > 0 || publishBlockers.length > 0
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-xs font-semibold">
                {seoErrors.length > 0
                  ? `${seoErrors.length} SEO error${seoErrors.length === 1 ? "" : "s"} blocking save`
                  : publishBlockers.length > 0
                    ? `Publishing blocked — ${publishBlockers.length} required SEO field${publishBlockers.length === 1 ? "" : "s"} missing`
                    : `${seoWarnings.length} SEO warning${seoWarnings.length === 1 ? "" : "s"} — review before publish`}
              </p>
              {publishBlockers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {publishBlockers.map((b, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/15 border border-destructive/30"
                      title={b.message}
                    >
                      {b.field}
                    </span>
                  ))}
                </div>
              )}
              <ul className="text-[11px] space-y-0.5 list-disc pl-4 marker:text-current/60">
                {[...seoErrors, ...publishBlockers.filter((b) => b.severity !== "error"), ...seoWarnings.filter((w) => !publishBlockers.includes(w))]
                  .slice(0, 6)
                  .map((i, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{i.field}:</span> {i.message}
                    </li>
                  ))}
                {seoIssues.length > 6 && (
                  <li className="opacity-70">+{seoIssues.length - 6} more…</li>
                )}
              </ul>
            </div>
            {(() => {
              // Show the one-click AI fix only when at least one of the
              // AI-fillable fields is missing. OG image is excluded — the AI
              // generator does not produce images.
              const missingTitle = !(draft.seo_title ?? "").trim();
              const missingDesc = !(draft.seo_description ?? "").trim();
              const missingSlug = !(draft.slug ?? "").trim();
              const aiFillable = missingTitle || missingDesc || missingSlug;
              if (!aiFillable) return null;
              return (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] gap-1.5 shrink-0 self-start bg-background"
                  onClick={() => handleGenerateSeo(true)}
                  disabled={generatingSeo || draft.blocks.length === 0}
                  title="Generate missing meta title, description, and slug with AI — existing values are preserved"
                >
                  {generatingSeo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {generatingSeo ? "Filling…" : "Fix missing with AI"}
                </Button>
              );
            })()}
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          {/* Left: palette + block list */}
          <Card className="col-span-12 lg:col-span-3 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Add block</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(Object.keys(blockMeta) as PageBlock["type"][]).map((t) => {
                const M = blockMeta[t].icon;
                return (
                  <button
                    key={t}
                    onClick={() => addBlock(t)}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition text-xs"
                  >
                    <M className="w-4 h-4 text-accent" />
                    {blockMeta[t].label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Page blocks</p>
            <div className="flex flex-col gap-1">
              {draft.blocks.map((b, i) => {
                const M = blockMeta[b.type].icon;
                const active = selectedBlockId === b.id;
                return (
                  <div key={b.id} className={`group flex items-center gap-1 px-2 py-1.5 rounded-md text-sm cursor-pointer ${active ? "bg-accent/10 text-accent" : "hover:bg-muted"}`} onClick={() => setSelectedBlockId(b.id)}>
                    <M className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate flex-1">{blockMeta[b.type].label}</span>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(b.id, -1); }} disabled={i === 0} className="opacity-0 group-hover:opacity-100 disabled:opacity-20 hover:text-foreground"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(b.id, 1); }} disabled={i === draft.blocks.length - 1} className="opacity-0 group-hover:opacity-100 disabled:opacity-20 hover:text-foreground"><ArrowDown className="w-3 h-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeBlock(b.id); }} className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                  </div>
                );
              })}
              {draft.blocks.length === 0 && (
                <p className="text-xs text-muted-foreground italic px-2 py-3">No blocks yet — add one above.</p>
              )}
            </div>
          </Card>

          {/* Middle: live preview */}
          <Card className="col-span-12 lg:col-span-6 overflow-hidden">
            <div className="bg-muted/30 px-3 py-2 text-xs text-muted-foreground border-b border-border">Live preview</div>
            <div className="max-h-[70vh] overflow-y-auto bg-background">
              {draft.blocks.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBlockId(b.id)}
                  className={`relative cursor-pointer transition ${selectedBlockId === b.id ? "ring-2 ring-accent ring-inset" : "hover:ring-1 hover:ring-accent/40 hover:ring-inset"}`}
                >
                  <BlockRenderer block={b} />
                </div>
              ))}
              {draft.blocks.length === 0 && (
                <div className="p-12 text-center text-muted-foreground text-sm">Empty page — add a block from the left.</div>
              )}
            </div>
          </Card>

          {/* Right: inspector */}
          <Card className="col-span-12 lg:col-span-3 p-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Page settings</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[11px] gap-1.5"
                onClick={() => handleGenerateSeo(false)}
                disabled={generatingSeo || draft.blocks.length === 0}
                title="Auto-fill meta title, description, and slug from page content"
              >
                {generatingSeo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {generatingSeo ? "Generating…" : "AI generate SEO"}
              </Button>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  id="seo-field-page-title"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">URL slug</Label>
                <Input
                  id="seo-field-slug"
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Page will be at /{draft.slug || "…"}</p>
              </div>
              <div>
                <SeoFieldLabel label="SEO title" value={draft.seo_title ?? ""} optimal={[30, 60]} hardLimit={70} />
                <Input
                  id="seo-field-title"
                  value={draft.seo_title ?? ""}
                  onChange={(e) => setDraft({ ...draft, seo_title: e.target.value })}
                />
                <SeoLengthBar value={(draft.seo_title ?? "").length} optimal={[30, 60]} hardLimit={70} />
              </div>
              <div>
                <SeoFieldLabel label="SEO description" value={draft.seo_description ?? ""} optimal={[70, 160]} hardLimit={170} />
                <Textarea
                  id="seo-field-desc"
                  rows={2}
                  value={draft.seo_description ?? ""}
                  onChange={(e) => setDraft({ ...draft, seo_description: e.target.value })}
                />
                <SeoLengthBar value={(draft.seo_description ?? "").length} optimal={[70, 160]} hardLimit={170} />
              </div>
              <div>
                <Label className="text-xs">OG image URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="seo-field-og"
                    value={draft.seo_og_image ?? ""}
                    onChange={(e) => setDraft({ ...draft, seo_og_image: e.target.value })}
                    placeholder="https://…/og.jpg"
                  />
                  <Button size="sm" variant="outline" onClick={() => setMediaFor({ blockId: "__seo_og__", field: "url" })}>Pick</Button>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3 mb-4">
              <OgCardPreview
                title={draft.seo_title ?? ""}
                description={draft.seo_description ?? ""}
                ogImage={draft.seo_og_image ?? ""}
                slug={draft.slug}
                fallbackTitle={draft.title}
              />
            </div>

            <div className="border-t border-border pt-3 mb-4">
              <PublishBlockerChecklist draft={draft} blockers={publishBlockers} />
            </div>

            <div className="border-t border-border pt-3 mb-4">
              <CustomPageSeoChecklist page={draft} />
            </div>

            <div className="border-t border-border pt-3 mb-4">
              <SeoAuditTrail pageId={draft.id ?? null} />
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Selected block</p>
              {selectedBlockId ? (
                <BlockInspector
                  block={draft.blocks.find((b) => b.id === selectedBlockId)!}
                  onChange={(patch) => updateBlock(selectedBlockId, patch)}
                  onPickImage={(field) => setMediaFor({ blockId: selectedBlockId, field })}
                />
              ) : (
                <p className="text-xs text-muted-foreground italic">Click a block in the preview to edit it.</p>
              )}
            </div>
          </Card>
        </div>

        <MediaPicker
          open={!!mediaFor}
          onOpenChange={(o) => !o && setMediaFor(null)}
          onSelect={(url) => {
            if (mediaFor?.blockId === "__seo_og__") {
              setDraft((d) => (d ? { ...d, seo_og_image: url } : d));
            } else if (mediaFor) {
              updateBlock(mediaFor.blockId, { [mediaFor.field]: url } as any);
            }
            setMediaFor(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Custom pages</h2>
          <p className="text-xs text-muted-foreground">Build pages with the visual block editor and choose where they appear in the menu.</p>
        </div>
        <Button onClick={handleNew} size="sm"><Plus className="w-4 h-4" /> New page</Button>
      </div>

      <IndustryPagesGenerator />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (pages ?? []).length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">No custom pages yet.</p>
          <Button onClick={handleNew}><Plus className="w-4 h-4" /> Create your first page</Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pages!.map((p) => (
            <Card key={p.id} className="p-4 hover:border-accent/50 transition">
              <div className="flex items-start justify-between gap-2 mb-1">
                <button onClick={() => setEditingId(p.id)} className="text-left font-semibold text-foreground hover:text-accent flex-1 truncate">
                  {p.title}
                </button>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${p.status === "published" ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
                  {p.status}
                </span>
              </div>
              <code className="text-xs text-muted-foreground block truncate">/{p.slug}</code>
              <p className="text-[11px] text-muted-foreground mt-1">{p.blocks.length} block{p.blocks.length === 1 ? "" : "s"}</p>
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setEditingId(p.id)}>Edit</Button>
                {p.status === "published" && (
                  <Button size="sm" variant="ghost" asChild>
                    <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive ml-auto"
                  onClick={() => {
                    if (window.confirm(`Delete "${p.title}"?`)) del.mutate(p.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Publish-blocker checklist — lists exactly the SEO fields required to
 * publish, with one-click navigation that scrolls to and focuses the
 * corresponding input/textarea in the editor.
 */
const PublishBlockerChecklist = ({
  draft,
  blockers,
}: {
  draft: CustomPageRow;
  blockers: SeoIssue[];
}) => {
  // Canonical list of fields required for publish. Each maps to the input id
  // rendered in the page settings panel above.
  const REQUIRED: { field: string; fieldId: string; label: string; getValue: () => string }[] = [
    { field: "Meta title", fieldId: "seo-field-title", label: "Meta title", getValue: () => (draft.seo_title ?? "").trim() },
    { field: "Meta description", fieldId: "seo-field-desc", label: "Meta description", getValue: () => (draft.seo_description ?? "").trim() },
    { field: "Canonical URL", fieldId: "seo-field-slug", label: "Canonical URL (slug)", getValue: () => (draft.slug ?? "").trim() },
    { field: "OG image", fieldId: "seo-field-og", label: "OG image", getValue: () => (draft.seo_og_image ?? "").trim() },
  ];

  const blockersByField = new Map(blockers.map((b) => [b.field, b]));

  const jumpTo = (fieldId: string) => {
    const el = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    requestAnimationFrame(() => {
      el.focus();
      el.classList.add("ring-2", "ring-destructive", "ring-offset-2");
      setTimeout(() => el.classList.remove("ring-2", "ring-destructive", "ring-offset-2"), 1600);
    });
  };

  const blocking = REQUIRED.filter((r) => blockersByField.has(r.field));
  const ready = REQUIRED.length - blocking.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publish requirements</p>
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            blocking.length === 0
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {ready}/{REQUIRED.length}
        </span>
      </div>
      <ul className="space-y-1">
        {REQUIRED.map((r) => {
          const blocker = blockersByField.get(r.field);
          const ok = !blocker;
          return (
            <li key={r.field}>
              <button
                type="button"
                onClick={() => jumpTo(r.fieldId)}
                className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-md border transition group ${
                  ok
                    ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                    : "border-destructive/40 bg-destructive/5 hover:bg-destructive/10"
                }`}
              >
                {ok ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ${ok ? "text-foreground" : "text-destructive"}`}>{r.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {ok ? (r.getValue() || "Set") : blocker?.message ?? "Required"}
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const BlockInspector = ({
  block,
  onChange,
  onPickImage,
}: {
  block: PageBlock;
  onChange: (patch: Partial<PageBlock>) => void;
  onPickImage: (field: "image" | "url") => void;
}) => {
  if (block.type === "hero") {
    return (
      <div className="space-y-2">
        <Field label="Eyebrow"><Input value={block.eyebrow ?? ""} onChange={(e) => onChange({ eyebrow: e.target.value } as any)} /></Field>
        <Field label="Title"><Input value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
        <Field label="Description"><Textarea rows={3} value={block.desc ?? ""} onChange={(e) => onChange({ desc: e.target.value } as any)} /></Field>
        <Field label="CTA label"><Input value={block.cta_label ?? ""} onChange={(e) => onChange({ cta_label: e.target.value } as any)} /></Field>
        <Field label="CTA link"><Input value={block.cta_link ?? ""} onChange={(e) => onChange({ cta_link: e.target.value } as any)} placeholder="/contact or https://…" /></Field>
        <Field label="Image">
          <div className="flex items-center gap-2">
            <Input value={block.image ?? ""} onChange={(e) => onChange({ image: e.target.value } as any)} placeholder="URL" />
            <Button size="sm" variant="outline" onClick={() => onPickImage("image")}>Pick</Button>
          </div>
        </Field>
      </div>
    );
  }
  if (block.type === "rich_text") {
    return (
      <Field label="HTML / Markup">
        <Textarea rows={10} value={block.html ?? ""} onChange={(e) => onChange({ html: e.target.value } as any)} className="font-mono text-xs" />
      </Field>
    );
  }
  if (block.type === "cards") {
    return (
      <div className="space-y-2">
        <Field label="Section title"><Input value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
        <p className="text-xs font-medium text-muted-foreground mt-2">Cards</p>
        {(block.cards ?? []).map((c, i) => (
          <div key={i} className="border border-border rounded-md p-2 space-y-1.5">
            <Input placeholder="Lucide icon name (e.g. Sparkles)" value={c.icon ?? ""} onChange={(e) => {
              const cards = [...(block.cards ?? [])];
              cards[i] = { ...c, icon: e.target.value };
              onChange({ cards } as any);
            }} />
            <Input placeholder="Title" value={c.title ?? ""} onChange={(e) => {
              const cards = [...(block.cards ?? [])];
              cards[i] = { ...c, title: e.target.value };
              onChange({ cards } as any);
            }} />
            <Textarea rows={2} placeholder="Description" value={c.desc ?? ""} onChange={(e) => {
              const cards = [...(block.cards ?? [])];
              cards[i] = { ...c, desc: e.target.value };
              onChange({ cards } as any);
            }} />
            <Button size="sm" variant="ghost" className="text-destructive w-full" onClick={() => {
              const cards = [...(block.cards ?? [])];
              cards.splice(i, 1);
              onChange({ cards } as any);
            }}><Trash2 className="w-3 h-3" /> Remove card</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="w-full" onClick={() => {
          const cards = [...(block.cards ?? []), { title: "New card", desc: "" }];
          onChange({ cards } as any);
        }}><Plus className="w-3 h-3" /> Add card</Button>
      </div>
    );
  }
  if (block.type === "image") {
    return (
      <div className="space-y-2">
        <Field label="Image URL">
          <div className="flex items-center gap-2">
            <Input value={block.url ?? ""} onChange={(e) => onChange({ url: e.target.value } as any)} />
            <Button size="sm" variant="outline" onClick={() => onPickImage("url")}>Pick</Button>
          </div>
        </Field>
        <Field label="Alt text"><Input value={block.alt ?? ""} onChange={(e) => onChange({ alt: e.target.value } as any)} /></Field>
        <Field label="Caption"><Input value={block.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value } as any)} /></Field>
      </div>
    );
  }
  if (block.type === "cta") {
    return (
      <div className="space-y-2">
        <Field label="Title"><Input value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
        <Field label="Description"><Textarea rows={2} value={block.desc ?? ""} onChange={(e) => onChange({ desc: e.target.value } as any)} /></Field>
        <Field label="CTA label"><Input value={block.cta_label ?? ""} onChange={(e) => onChange({ cta_label: e.target.value } as any)} /></Field>
        <Field label="CTA link"><Input value={block.cta_link ?? ""} onChange={(e) => onChange({ cta_link: e.target.value } as any)} /></Field>
      </div>
    );
  }
  if (block.type === "faq") {
    return (
      <div className="space-y-2">
        <Field label="Section title"><Input value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
        <p className="text-xs font-medium text-muted-foreground mt-2">Questions</p>
        {(block.items ?? []).map((it, i) => (
          <div key={i} className="border border-border rounded-md p-2 space-y-1.5">
            <Input placeholder="Question" value={it.q ?? ""} onChange={(e) => {
              const items = [...(block.items ?? [])];
              items[i] = { ...it, q: e.target.value };
              onChange({ items } as any);
            }} />
            <Textarea rows={2} placeholder="Answer" value={it.a ?? ""} onChange={(e) => {
              const items = [...(block.items ?? [])];
              items[i] = { ...it, a: e.target.value };
              onChange({ items } as any);
            }} />
            <Button size="sm" variant="ghost" className="text-destructive w-full" onClick={() => {
              const items = [...(block.items ?? [])];
              items.splice(i, 1);
              onChange({ items } as any);
            }}><Trash2 className="w-3 h-3" /> Remove</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="w-full" onClick={() => {
          const items = [...(block.items ?? []), { q: "New question", a: "" }];
          onChange({ items } as any);
        }}><Plus className="w-3 h-3" /> Add question</Button>
      </div>
    );
  }
  if (block.type === "testimonial") {
    return (
      <div className="space-y-2">
        <Field label="Quote"><Textarea rows={3} value={block.quote ?? ""} onChange={(e) => onChange({ quote: e.target.value } as any)} /></Field>
        <Field label="Author name"><Input value={block.author ?? ""} onChange={(e) => onChange({ author: e.target.value } as any)} /></Field>
        <Field label="Role"><Input value={block.role ?? ""} onChange={(e) => onChange({ role: e.target.value } as any)} /></Field>
        <Field label="Company"><Input value={block.company ?? ""} onChange={(e) => onChange({ company: e.target.value } as any)} /></Field>
        <Field label="Avatar URL">
          <div className="flex items-center gap-2">
            <Input value={block.avatar ?? ""} onChange={(e) => onChange({ avatar: e.target.value } as any)} />
            <Button size="sm" variant="outline" onClick={() => onPickImage("image")}>Pick</Button>
          </div>
        </Field>
      </div>
    );
  }
  if (block.type === "stats") {
    return (
      <div className="space-y-2">
        <Field label="Section title"><Input value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
        <p className="text-xs font-medium text-muted-foreground mt-2">Stats</p>
        {(block.stats ?? []).map((s, i) => (
          <div key={i} className="border border-border rounded-md p-2 space-y-1.5">
            <Input placeholder="Value (e.g. 99.9%)" value={s.value ?? ""} onChange={(e) => {
              const stats = [...(block.stats ?? [])];
              stats[i] = { ...s, value: e.target.value };
              onChange({ stats } as any);
            }} />
            <Input placeholder="Label" value={s.label ?? ""} onChange={(e) => {
              const stats = [...(block.stats ?? [])];
              stats[i] = { ...s, label: e.target.value };
              onChange({ stats } as any);
            }} />
            <Button size="sm" variant="ghost" className="text-destructive w-full" onClick={() => {
              const stats = [...(block.stats ?? [])];
              stats.splice(i, 1);
              onChange({ stats } as any);
            }}><Trash2 className="w-3 h-3" /> Remove</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="w-full" onClick={() => {
          const stats = [...(block.stats ?? []), { value: "0", label: "Metric" }];
          onChange({ stats } as any);
        }}><Plus className="w-3 h-3" /> Add stat</Button>
      </div>
    );
  }
  if (block.type === "logo_strip") {
    return (
      <div className="space-y-2">
        <Field label="Section title"><Input value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
        <p className="text-xs font-medium text-muted-foreground mt-2">Logos</p>
        {(block.logos ?? []).map((l, i) => (
          <div key={i} className="border border-border rounded-md p-2 space-y-1.5">
            <Input placeholder="Logo URL" value={l.url ?? ""} onChange={(e) => {
              const logos = [...(block.logos ?? [])];
              logos[i] = { ...l, url: e.target.value };
              onChange({ logos } as any);
            }} />
            <Input placeholder="Alt text / company name" value={l.alt ?? ""} onChange={(e) => {
              const logos = [...(block.logos ?? [])];
              logos[i] = { ...l, alt: e.target.value };
              onChange({ logos } as any);
            }} />
            <Input placeholder="Optional link (https://…)" value={l.href ?? ""} onChange={(e) => {
              const logos = [...(block.logos ?? [])];
              logos[i] = { ...l, href: e.target.value };
              onChange({ logos } as any);
            }} />
            <Button size="sm" variant="ghost" className="text-destructive w-full" onClick={() => {
              const logos = [...(block.logos ?? [])];
              logos.splice(i, 1);
              onChange({ logos } as any);
            }}><Trash2 className="w-3 h-3" /> Remove</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="w-full" onClick={() => {
          const logos = [...(block.logos ?? []), { url: "", alt: "" }];
          onChange({ logos } as any);
        }}><Plus className="w-3 h-3" /> Add logo</Button>
      </div>
    );
  }
  if (block.type === "two_column") {
    return (
      <div className="space-y-2">
        <Field label="Title"><Input value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
        <Field label="Description"><Textarea rows={4} value={block.desc ?? ""} onChange={(e) => onChange({ desc: e.target.value } as any)} /></Field>
        <Field label="Image">
          <div className="flex items-center gap-2">
            <Input value={block.image ?? ""} onChange={(e) => onChange({ image: e.target.value } as any)} />
            <Button size="sm" variant="outline" onClick={() => onPickImage("image")}>Pick</Button>
          </div>
        </Field>
        <Field label="Image alt"><Input value={block.image_alt ?? ""} onChange={(e) => onChange({ image_alt: e.target.value } as any)} /></Field>
        <Field label="Image side">
          <Select value={block.image_side ?? "right"} onValueChange={(v) => onChange({ image_side: v } as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="CTA label"><Input value={block.cta_label ?? ""} onChange={(e) => onChange({ cta_label: e.target.value } as any)} /></Field>
        <Field label="CTA link"><Input value={block.cta_link ?? ""} onChange={(e) => onChange({ cta_link: e.target.value } as any)} /></Field>
      </div>
    );
  }
  if (block.type === "video") {
    return (
      <div className="space-y-2">
        <Field label="Video URL (YouTube / Vimeo / mp4)">
          <Input value={block.url ?? ""} onChange={(e) => onChange({ url: e.target.value } as any)} placeholder="https://www.youtube.com/watch?v=…" />
        </Field>
        <Field label="Title"><Input value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
        <Field label="Caption"><Input value={block.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value } as any)} /></Field>
      </div>
    );
  }
  if (block.type === "pricing_teaser") {
    return (
      <div className="space-y-2">
        <Field label="Title"><Input value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
        <Field label="Description"><Textarea rows={2} value={block.desc ?? ""} onChange={(e) => onChange({ desc: e.target.value } as any)} /></Field>
        <p className="text-xs font-medium text-muted-foreground mt-2">Tiers</p>
        {(block.tiers ?? []).map((t, i) => (
          <div key={i} className="border border-border rounded-md p-2 space-y-1.5">
            <Input placeholder="Plan name" value={t.name ?? ""} onChange={(e) => {
              const tiers = [...(block.tiers ?? [])];
              tiers[i] = { ...t, name: e.target.value };
              onChange({ tiers } as any);
            }} />
            <Input placeholder="Price (e.g. $49/mo)" value={t.price ?? ""} onChange={(e) => {
              const tiers = [...(block.tiers ?? [])];
              tiers[i] = { ...t, price: e.target.value };
              onChange({ tiers } as any);
            }} />
            <Textarea rows={3} placeholder="One feature per line" value={t.features ?? ""} onChange={(e) => {
              const tiers = [...(block.tiers ?? [])];
              tiers[i] = { ...t, features: e.target.value };
              onChange({ tiers } as any);
            }} />
            <Button size="sm" variant="ghost" className="text-destructive w-full" onClick={() => {
              const tiers = [...(block.tiers ?? [])];
              tiers.splice(i, 1);
              onChange({ tiers } as any);
            }}><Trash2 className="w-3 h-3" /> Remove</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="w-full" onClick={() => {
          const tiers = [...(block.tiers ?? []), { name: "New tier", price: "", features: "" }];
          onChange({ tiers } as any);
        }}><Plus className="w-3 h-3" /> Add tier</Button>
        <Field label="CTA label"><Input value={block.cta_label ?? ""} onChange={(e) => onChange({ cta_label: e.target.value } as any)} /></Field>
        <Field label="CTA link"><Input value={block.cta_link ?? ""} onChange={(e) => onChange({ cta_link: e.target.value } as any)} /></Field>
      </div>
    );
  }
  if (block.type === "divider") {
    return (
      <div className="space-y-2">
        <Field label="Style">
          <Select value={block.style ?? "line"} onValueChange={(v) => onChange({ style: v } as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Horizontal line</SelectItem>
              <SelectItem value="space">Empty spacer</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Size">
          <Select value={block.size ?? "md"} onValueChange={(v) => onChange({ size: v } as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    );
  }
  if (block.type === "button") {
    return (
      <div className="space-y-2">
        <Field label="Label"><Input value={block.label ?? ""} onChange={(e) => onChange({ label: e.target.value } as any)} /></Field>
        <Field label="Link"><Input value={block.link ?? ""} onChange={(e) => onChange({ link: e.target.value } as any)} placeholder="/contact or https://…" /></Field>
        <Field label="Variant">
          <Select value={block.variant ?? "default"} onValueChange={(v) => onChange({ variant: v } as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Solid</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Size">
          <Select value={block.size ?? "default"} onValueChange={(v) => onChange({ size: v } as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Alignment">
          <Select value={block.align ?? "center"} onValueChange={(v) => onChange({ align: v } as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    );
  }
  if (block.type === "container") {
    return (
      <div className="space-y-2">
        <Field label="Title"><Input value={block.title ?? ""} onChange={(e) => onChange({ title: e.target.value } as any)} /></Field>
        <Field label="Description"><Textarea rows={4} value={block.desc ?? ""} onChange={(e) => onChange({ desc: e.target.value } as any)} /></Field>
        <Field label="Image (optional)">
          <div className="flex items-center gap-2">
            <Input value={block.image ?? ""} onChange={(e) => onChange({ image: e.target.value } as any)} />
            <Button size="sm" variant="outline" onClick={() => onPickImage("image")}>Pick</Button>
          </div>
        </Field>
        <Field label="Image alt"><Input value={block.image_alt ?? ""} onChange={(e) => onChange({ image_alt: e.target.value } as any)} /></Field>
        <Field label="Text alignment">
          <Select value={block.align ?? "left"} onValueChange={(v) => onChange({ align: v } as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Background">
          <Select value={block.background ?? "none"} onValueChange={(v) => onChange({ background: v } as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="muted">Muted</SelectItem>
              <SelectItem value="accent">Accent tint</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    );
  }
  return null;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-xs">{label}</Label>
    {children}
  </div>
);

/**
 * Label row for SEO fields with a live character counter and a status word
 * (Too short / Optimal / Long / Truncated). Colors come from semantic tokens.
 */
const SeoFieldLabel = ({
  label,
  value,
  optimal,
  hardLimit,
}: {
  label: string;
  value: string;
  optimal: [number, number];
  hardLimit: number;
}) => {
  const len = value.length;
  const [min, max] = optimal;
  const status =
    len === 0
      ? { text: "Empty", cls: "text-muted-foreground" }
      : len < min
        ? { text: `Too short (+${min - len})`, cls: "text-amber-500" }
        : len <= max
          ? { text: "Optimal", cls: "text-emerald-500" }
          : len <= hardLimit
            ? { text: `Long (-${len - max} to fit)`, cls: "text-amber-500" }
            : { text: "Will be truncated", cls: "text-destructive" };

  return (
    <div className="flex items-baseline justify-between mb-1">
      <Label className="text-xs">{label}</Label>
      <span className="text-[10px] flex items-center gap-1.5">
        <span className={status.cls}>{status.text}</span>
        <span className={len > hardLimit ? "text-destructive font-medium" : "text-muted-foreground"}>
          {len}/{max}
        </span>
      </span>
    </div>
  );
};

/**
 * Slim 3-zone bar visualising current length: green (optimal), amber (over-max
 * but within Google's display window), red (truncated). A vertical tick marks
 * the typical Google truncation point.
 */
const SeoLengthBar = ({
  value,
  optimal,
  hardLimit,
}: {
  value: number;
  optimal: [number, number];
  hardLimit: number;
}) => {
  const [, max] = optimal;
  // Show up to 1.4× hard limit so users see how far over they are
  const scale = Math.max(value, hardLimit) * 1.05;
  const pct = Math.min(100, (value / scale) * 100);
  const truncatePct = Math.min(100, (max / scale) * 100);
  const color =
    value === 0
      ? "bg-muted-foreground/30"
      : value < optimal[0]
        ? "bg-amber-500"
        : value <= max
          ? "bg-emerald-500"
          : value <= hardLimit
            ? "bg-amber-500"
            : "bg-destructive";

  return (
    <div className="relative h-1 mt-1.5 rounded-full bg-muted overflow-hidden">
      <div className={`h-full ${color} transition-all duration-150`} style={{ width: `${pct}%` }} />
      {/* Truncation tick — where Google starts cutting off */}
      <div
        className="absolute top-0 bottom-0 w-px bg-foreground/40"
        style={{ left: `${truncatePct}%` }}
        aria-hidden
        title={`Search engines may truncate after ${max} chars`}
      />
    </div>
  );
};

export default PagesManager;
