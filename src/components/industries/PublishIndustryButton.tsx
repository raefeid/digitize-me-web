import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEditMode } from "@/components/cms/EditModeContext";
import { useSaveContent, useSiteContent } from "@/hooks/useSiteContent";
import { useToast } from "@/hooks/use-toast";

interface Props {
  slug: string;
  name: string;
  /** Current published state, used to render the right label. */
  published: boolean;
  /** Optional className override for layout */
  className?: string;
}

/**
 * Toggle the `published` flag on a custom industry registry row.
 * Renders only for admins in edit mode. Updates the JSON value in-place
 * (preserves name + icon) so existing content/translations are kept.
 */
const PublishIndustryButton = ({ slug, name, published, className = "" }: Props) => {
  const { canEdit, enabled } = useEditMode();
  const { items } = useSiteContent("industries", "registry");
  const save = useSaveContent();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  if (!canEdit || !enabled) return null;

  const row = items.find((i) => i.content_key === slug && i.content_type === "industry_card");
  if (!row) return null; // Only meaningful for custom industries

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    try {
      // Mutate only the `published` flag, preserve everything else in the JSON
      let parsed: Record<string, unknown> = {};
      try { parsed = JSON.parse(row.value); } catch { /* ignore */ }
      const next = { ...parsed, published: !published };
      await save.mutateAsync({
        id: row.id,
        page: row.page,
        section: row.section,
        content_key: row.content_key,
        content_type: row.content_type,
        value: JSON.stringify(next),
        value_ar: row.value_ar,
        sort_order: row.sort_order,
      });
      toast({
        title: !published ? "Published" : "Unpublished",
        description: !published
          ? `"${name}" is now visible to visitors.`
          : `"${name}" is back to a draft (admin-only).`,
      });
    } catch (err: any) {
      toast({
        title: "Could not update",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={busy}
      title={published ? "Unpublish (back to draft)" : "Publish (make visible to visitors)"}
      className={
        className ||
        `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
          published
            ? "border-muted-foreground/30 bg-card text-muted-foreground hover:bg-muted"
            : "border-accent/40 bg-accent text-accent-foreground hover:bg-accent/90"
        } disabled:opacity-50`
      }
    >
      {busy ? (
        <Loader2 size={11} className="animate-spin" />
      ) : published ? (
        <EyeOff size={11} />
      ) : (
        <Eye size={11} />
      )}
      {busy ? "Saving…" : published ? "Unpublish" : "Publish"}
    </button>
  );
};

export default PublishIndustryButton;
