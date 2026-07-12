import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useEditMode } from "@/components/cms/EditModeContext";
import { useDeleteContent, useSiteContent } from "@/hooks/useSiteContent";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  slug: string;
  name: string;
}

/**
 * Small destructive button overlaid on a custom (CMS-added) industry card
 * during edit mode. Removes the registry row; body content rows are left
 * orphaned (not auto-deleted) so re-adding the same slug recovers content.
 */
const DeleteIndustryButton = ({ slug, name }: Props) => {
  const { canEdit, enabled } = useEditMode();
  const { items } = useSiteContent("industries", "registry");
  const del = useDeleteContent();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!canEdit || !enabled) return null;

  const row = items.find((i) => i.content_key === slug && i.content_type === "industry_card");
  if (!row) return null; // Only show on custom industries

  const handleDelete = async () => {
    setBusy(true);
    try {
      await del.mutateAsync(row.id);
      toast({ title: "Industry removed", description: `"${name}" was removed from the menu.` });
      setOpen(false);
    } catch (err: any) {
      toast({
        title: "Could not delete",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        title="Delete industry"
        className="absolute top-2 right-2 z-10 bg-background/90 backdrop-blur text-destructive border border-destructive/30 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
      >
        <Trash2 size={13} />
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the card from /industries and the link from the navbar
              dropdown. The page content (text, lists) is kept in case you re-add
              the same slug later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteIndustryButton;
