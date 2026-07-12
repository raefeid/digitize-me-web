import { useEffect, useMemo, useState } from "react";
import { GripVertical, ListOrdered, Loader2, Save, X } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEditMode } from "@/components/cms/EditModeContext";
import { useSiteContent, useSaveContent } from "@/hooks/useSiteContent";
import { useToast } from "@/hooks/use-toast";
import { useDynamicIndustries, DynamicIndustry } from "@/hooks/useDynamicIndustries";
import { useLanguage } from "@/i18n/LanguageContext";

interface SortableRowProps {
  industry: DynamicIndustry;
  displayName: string;
}

const SortableRow = ({ industry, displayName }: SortableRowProps) => {
  const Icon = industry.icon;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: industry.slug,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 ${
        isDragging ? "border-accent shadow-lg ring-2 ring-accent/40" : "border-border"
      }`}
    >
      <button
        type="button"
        aria-label={`Drag ${displayName}`}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      <Icon size={20} className="text-accent shrink-0" />
      <span className="flex-1 truncate text-sm font-medium text-foreground">{displayName}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {industry.isCustom && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
            Custom
          </span>
        )}
        {!industry.published && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
            Draft
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Admin-only floating button + dialog that lets admins reorder all industries
 * (hardcoded + custom) via drag-and-drop. The order is persisted as a JSON
 * array of slugs in site_content (page=industries, section=order).
 */
const ReorderIndustriesButton = () => {
  const { canEdit, enabled } = useEditMode();
  const { list, getName } = useDynamicIndustries();
  const { items: orderItems } = useSiteContent("industries", "order");
  const save = useSaveContent();
  const { toast } = useToast();
  const { lang } = useLanguage();

  const [open, setOpen] = useState(false);
  const [slugs, setSlugs] = useState<string[]>([]);

  // Sync local sortable state with the live list whenever the dialog opens
  useEffect(() => {
    if (open) setSlugs(list.map((i) => i.slug));
  }, [open, list]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const bySlug = useMemo(() => {
    const m = new Map<string, DynamicIndustry>();
    for (const i of list) m.set(i.slug, i);
    return m;
  }, [list]);

  if (!canEdit || !enabled) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = slugs.indexOf(String(active.id));
    const newIndex = slugs.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    setSlugs((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const handleSave = async () => {
    try {
      const existing = orderItems.find(
        (i) => i.content_key === "slug_order" && i.content_type === "industry_order",
      );
      await save.mutateAsync({
        id: existing?.id,
        page: "industries",
        section: "order",
        content_key: "slug_order",
        content_type: "industry_order",
        value: JSON.stringify(slugs),
        value_ar: existing?.value_ar ?? null,
        sort_order: 0,
      });
      toast({ title: "Order saved", description: "Industry order updated everywhere." });
      setOpen(false);
    } catch (err: any) {
      toast({
        title: "Could not save order",
        description: err?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 border-accent/40 text-accent hover:bg-accent/10 hover:text-accent"
      >
        <ListOrdered size={16} />
        Reorder industries
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reorder industries</DialogTitle>
            <DialogDescription>
              Drag to reorder. The new order applies to the /industries grid and the navbar
              dropdown for everyone.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={slugs} strategy={verticalListSortingStrategy}>
                {slugs.map((slug) => {
                  const industry = bySlug.get(slug);
                  if (!industry) return null;
                  const displayName = industry.isCustom
                    ? getName(slug, lang === "ar" ? "ar" : "en") || industry.name
                    : industry.name;
                  return (
                    <SortableRow key={slug} industry={industry} displayName={displayName} />
                  );
                })}
              </SortableContext>
            </DndContext>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={save.isPending}>
              <X size={16} /> Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={save.isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {save.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {save.isPending ? "Saving…" : "Save order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReorderIndustriesButton;
