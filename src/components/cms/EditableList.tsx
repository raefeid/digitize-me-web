import { ReactNode, useMemo, useState } from "react";
import { Plus, Copy, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditMode } from "./EditModeContext";
import { useSiteContent, useSaveContent, useDeleteContent } from "@/hooks/useSiteContent";
import EditableText from "./EditableText";
import { useToast } from "@/hooks/use-toast";

/**
 * Storage convention (mirrors EditableCardGrid but for single-text items):
 *   page=<page>, section="list_<listKey>"
 *   content_key = "item_<id>__marker"  → presence row, sort_order = position
 *   content_key = "item_<id>__text"    → the editable text (handled by EditableText)
 *
 * If no marker rows exist, falls back to `seeds` so the public site renders the
 * original hard-coded items unchanged until an admin makes a change.
 */

export interface ListSeed {
  /** Stable key used as the item id when first materialized */
  key: string;
  text: string;
}

interface EditableListProps {
  page: string;
  /** Unique list identifier within the page (e.g. "pain_points", "solutions") */
  listKey: string;
  seeds: ListSeed[];
  /**
   * Render a single item. Receives the editable text node and item index.
   * Handle drag handle / toolbar wrapping is added automatically.
   */
  renderItem: (args: {
    id: string;
    index: number;
    text: ReactNode;
  }) => ReactNode;
  /** Wrapper element classname (defaults to "space-y-4") */
  className?: string;
}

interface ItemRecord {
  id: string;
  sortOrder: number;
  seed?: ListSeed;
}

const sectionFor = (listKey: string) => `list_${listKey}`;
const markerKey = (id: string) => `item_${id}__marker`;
const textKey = (id: string) => `item_${id}__text`;
const idFromMarkerKey = (k: string) => k.replace(/^item_/, "").replace(/__marker$/, "");

const EditableList = ({
  page,
  listKey,
  seeds,
  renderItem,
  className = "space-y-4",
}: EditableListProps) => {
  const section = sectionFor(listKey);
  const { enabled } = useEditMode();
  const { items } = useSiteContent(page, section);
  const saveContent = useSaveContent();
  const deleteContent = useDeleteContent();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [optimisticOrder, setOptimisticOrder] = useState<string[] | null>(null);

  const records = useMemo<ItemRecord[]>(() => {
    const markers = items.filter((i) => i.content_key.endsWith("__marker"));
    if (markers.length > 0) {
      return markers
        .map((m) => {
          const id = idFromMarkerKey(m.content_key);
          return {
            id,
            sortOrder: m.sort_order,
            seed: seeds.find((s) => s.key === id),
          };
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return seeds.map((s, i) => ({ id: s.key, sortOrder: i, seed: s }));
  }, [items, seeds]);

  const orderedRecords = useMemo(() => {
    if (!optimisticOrder) return records;
    const byId = new Map(records.map((r) => [r.id, r]));
    const arranged = optimisticOrder.map((id) => byId.get(id)).filter(Boolean) as ItemRecord[];
    const seen = new Set(optimisticOrder);
    records.forEach((r) => {
      if (!seen.has(r.id)) arranged.push(r);
    });
    return arranged;
  }, [records, optimisticOrder]);

  /** Snapshot current items (DB text when present, otherwise seed text) */
  const snapshot = () =>
    records.map((r) => {
      const textRow = items.find((i) => i.content_key === textKey(r.id));
      return {
        id: r.id,
        text: textRow?.value || r.seed?.text || "",
      };
    });

  const writeItems = async (next: { id: string; text: string }[]) => {
    const oldRows = items.filter(
      (i) => i.content_key.endsWith("__marker") || i.content_key.endsWith("__text")
    );
    for (const r of oldRows) await deleteContent.mutateAsync(r.id);

    for (let i = 0; i < next.length; i++) {
      const it = next[i];
      await saveContent.mutateAsync({
        page,
        section,
        content_key: markerKey(it.id),
        value: "1",
        content_type: "text",
        sort_order: i,
      });
      await saveContent.mutateAsync({
        page,
        section,
        content_key: textKey(it.id),
        value: it.text,
        content_type: "text",
        sort_order: i,
      });
    }
  };

  const newId = () => Math.random().toString(36).slice(2, 10);

  const addItem = async () => {
    setBusy("add");
    try {
      const next = [...snapshot(), { id: newId(), text: "New item" }];
      await writeItems(next);
      toast({ title: "Item added" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const duplicateItem = async (id: string) => {
    setBusy(`dup-${id}`);
    try {
      const list = snapshot();
      const idx = list.findIndex((i) => i.id === id);
      if (idx === -1) return;
      list.splice(idx + 1, 0, { id: newId(), text: list[idx].text });
      await writeItems(list);
      toast({ title: "Item duplicated" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("Delete this item?")) return;
    setBusy(`del-${id}`);
    try {
      const next = snapshot().filter((i) => i.id !== id);
      await writeItems(next);
      toast({ title: "Item deleted" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = orderedRecords.map((r) => r.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const newIds = arrayMove(ids, oldIndex, newIndex);
    setOptimisticOrder(newIds);

    setBusy("reorder");
    try {
      const snap = snapshot();
      const byId = new Map(snap.map((s) => [s.id, s]));
      const next = newIds.map((id) => byId.get(id)!).filter(Boolean);
      await writeItems(next);
      toast({ title: "Order updated" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
      setOptimisticOrder(null);
    } finally {
      setBusy(null);
    }
  };

  const renderRow = (record: ItemRecord, index: number) => {
    const textNode = (
      <EditableText
        page={page}
        section={section}
        contentKey={textKey(record.id)}
        fallback={record.seed?.text ?? "Item text"}
        multiline
        rich
      />
    );
    return renderItem({ id: record.id, index, text: textNode });
  };

  const renderToolbar = (record: ItemRecord, dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>) => (
    <div className="absolute -top-2 -right-2 z-20 flex gap-1 opacity-0 group-hover/list-item:opacity-100 transition-opacity">
      {dragHandleProps && (
        <button
          {...dragHandleProps}
          type="button"
          className="bg-card border border-border rounded-full p-1 shadow-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-grab active:cursor-grabbing touch-none"
          title="Drag to reorder"
          aria-label="Drag to reorder item"
        >
          <GripVertical size={11} />
        </button>
      )}
      <button
        onClick={() => duplicateItem(record.id)}
        disabled={!!busy}
        className="bg-card border border-border rounded-full p-1 shadow-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
        title="Duplicate item"
      >
        <Copy size={11} />
      </button>
      <button
        onClick={() => deleteItem(record.id)}
        disabled={!!busy || orderedRecords.length <= 1}
        className="bg-card border border-border rounded-full p-1 shadow-md text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-30"
        title={orderedRecords.length <= 1 ? "Can't delete the last item" : "Delete item"}
      >
        <Trash2 size={11} />
      </button>
    </div>
  );

  // Read-only mode: render plain list, zero dnd overhead
  if (!enabled) {
    return (
      <div className={className}>
        {orderedRecords.map((r, i) => (
          <div key={r.id}>{renderRow(r, i)}</div>
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedRecords.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {orderedRecords.map((record, index) => (
            <SortableListItem
              key={record.id}
              id={record.id}
              renderToolbar={(handleProps) => renderToolbar(record, handleProps)}
            >
              {renderRow(record, index)}
            </SortableListItem>
          ))}
          <button
            onClick={addItem}
            disabled={!!busy}
            className="w-full rounded-lg border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-colors py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-accent disabled:opacity-50"
            title="Add a new item"
          >
            <Plus size={16} />
            <span className="font-medium">{busy === "add" ? "Adding…" : "Add item"}</span>
          </button>
        </div>
      </SortableContext>
    </DndContext>
  );
};

interface SortableListItemProps {
  id: string;
  children: ReactNode;
  renderToolbar: (handleProps: React.HTMLAttributes<HTMLButtonElement>) => ReactNode;
}

const SortableListItem = ({ id, children, renderToolbar }: SortableListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 30 : undefined,
  };
  const handleProps = { ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>;
  return (
    <div ref={setNodeRef} style={style} className="relative group/list-item">
      {renderToolbar(handleProps)}
      {children}
    </div>
  );
};

export default EditableList;
