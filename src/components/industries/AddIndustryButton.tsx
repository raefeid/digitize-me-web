import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, icons as lucideIcons } from "lucide-react";
import { useEditMode } from "@/components/cms/EditModeContext";
import { useSaveContent } from "@/hooks/useSiteContent";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LucideIconPicker from "@/components/cms/LucideIconPicker";
import { industriesData } from "@/pages/Industries";
import { useSeoTemplates, useTemplateGlobals, applySeoTemplate } from "@/hooks/useSeoTemplates";
import { supabase } from "@/integrations/supabase/client";

/**
 * Slug-ify: lower-case, hyphenate, strip non-alphanumerics.
 */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

interface Props {
  /** Existing slugs to prevent duplicates */
  existingSlugs: string[];
}

/**
 * Floating "Add industry" button shown only to admins in edit mode.
 * Opens a dialog where they pick a name + icon. On save we insert a
 * site_content row (page=industries, section=registry, content_type=industry_card)
 * and navigate to the new detail page so they can fill in the body content.
 */
const AddIndustryButton = ({ existingSlugs }: Props) => {
  const { canEdit, enabled } = useEditMode();
  const save = useSaveContent();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: templates } = useSeoTemplates();
  const templateGlobals = useTemplateGlobals();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [iconName, setIconName] = useState<string>("Briefcase");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!canEdit || !enabled) return null;

  const SelectedIcon = (lucideIcons[iconName as keyof typeof lucideIcons] ?? lucideIcons.Briefcase);
  const slug = slugify(name);
  const slugTaken = !!slug && existingSlugs.includes(slug);
  const canSubmit = !!name.trim() && !!slug && !slugTaken && !submitting;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await save.mutateAsync({
        page: "industries",
        section: "registry",
        content_key: slug,
        content_type: "industry_card",
        // New industries start as drafts so admins can fill in the page
        // body before exposing them publicly.
        value: JSON.stringify({ name: name.trim(), icon: iconName, published: false }),
        value_ar: nameAr.trim() ? JSON.stringify({ name: nameAr.trim() }) : null,
        sort_order: existingSlugs.length,
      });

      // Auto-fill SEO from the saved Industry template so the new page lands
      // with sensible meta tags. Admins can refine via the SEO editor's
      // "Apply template" button anytime.
      if (templates) {
        const ctx = {
          ...templateGlobals,
          name: name.trim(),
          slug,
          primary_keyword: name.trim(),
          industry_keywords: name.trim(),
        };
        const en = applySeoTemplate(templates, "industry", "en", ctx);
        const ar = applySeoTemplate(templates, "industry", "ar", ctx);
        const pageKey = `industry_${slug}`;
        const seoRows = [
          { content_key: "meta_title", value: en.meta_title, value_ar: ar.meta_title },
          { content_key: "meta_description", value: en.meta_description, value_ar: ar.meta_description },
          { content_key: "meta_keywords", value: en.meta_keywords, value_ar: ar.meta_keywords },
        ];
        try {
          await supabase.from("site_content").insert(
            seoRows.map((r) => ({
              page: pageKey,
              section: "seo",
              content_key: r.content_key,
              value: r.value,
              value_ar: r.value_ar || null,
              content_type: "text",
              sort_order: 0,
            })),
          );
        } catch {
          // Non-fatal — page is still created, admin can fill SEO manually.
        }
      }

      toast({
        title: "Draft created",
        description: `"${name.trim()}" is saved as a draft with SEO auto-filled. Edit, then click Publish.`,
      });
      setOpen(false);
      setName("");
      setNameAr("");
      setIconName("Briefcase");
      // Jump straight to the new page so the admin can edit the body
      navigate(`/industries/${slug}`);
    } catch (err: any) {
      toast({
        title: "Could not add industry",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-6 text-accent hover:border-accent hover:bg-accent/10 transition-all min-h-[180px]"
        title="Add a new industry card"
      >
        <Plus size={28} />
        <span className="text-sm font-semibold">Add industry</span>
        <span className="text-xs text-muted-foreground">Creates a new card, page & menu link</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a new industry</DialogTitle>
            <DialogDescription>
              This creates a new card on /industries, a dedicated page at
              /industries/{slug || "your-slug"}, and a link in the navbar dropdown.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ind-name">Name (English)</Label>
              <Input
                id="ind-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hospitality"
                autoFocus
              />
              {slug && (
                <p className="text-xs text-muted-foreground">
                  URL: <code className="text-foreground">/industries/{slug}</code>
                  {slugTaken && <span className="text-destructive ml-2">— already taken</span>}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ind-name-ar">Name (Arabic, optional)</Label>
              <Input
                id="ind-name-ar"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: الضيافة"
                dir="rtl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Icon</Label>
              <button
                type="button"
                onClick={() => setIconPickerOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-input bg-background hover:bg-accent/5 hover:border-accent transition-colors text-left"
              >
                <SelectedIcon size={20} className="text-accent" />
                <span className="text-sm flex-1">{iconName}</span>
                <span className="text-xs text-muted-foreground">Click to change</span>
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!canSubmit}>
              {submitting && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Create industry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LucideIconPicker
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        value={iconName}
        onSelect={setIconName}
        title="Pick an icon for this industry"
      />
    </>
  );
};

/** Sentinel export used elsewhere if we want to filter hardcoded slugs */
export const isHardcodedIndustry = (slug: string) =>
  industriesData.some((i) => i.slug === slug);

export default AddIndustryButton;
