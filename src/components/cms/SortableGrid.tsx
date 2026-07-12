import { ReactNode, forwardRef, useEffect, useState } from "react";
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Generic drag-to-reorder grid wrapper.
 *
 * Wraps any list of cards with @dnd-kit. Each card gets a draggable handle
 * (⋮⋮ icon) that appears only when `editMode` is true — so live visitors
 * never see it. On drop, calls `onReorder` with the items in their new order.
 *
 * Usage:
 *   <SortableGrid
 *     items={visible}
 *     editMode={editMode}
 *     onReorder={(next) => reorderMutation.mutate(buildSortPayload(next))}
 *     className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
 *     renderItem={(item, dragHandle) => (
 *       <YourCard item={item} dragHandle={dragHandle} />
 *     )}
 *   />
 */
interface SortableGridProps<T extends { id: string }> {
  items: T[];
  editMode: boolean;
  onReorder: (next: T[]) => void;
  /** Tailwind grid/flex classes for the container. */
  className?: string;
  /** Render a single card. `dragHandle` is the JSX to slot in for the handle. */
  renderItem: (item: T, dragHandle: ReactNode, isDragging: boolean) => ReactNode;
  /** Optional content rendered after the items (e.g. "+ Add" button). */
  trailing?: ReactNode;
}

const SortableItem = <T extends { id: string }>({
  item,
  editMode,
  renderItem,
}: {
  item: T;
  editMode: boolean;
  renderItem: SortableGridProps<T>["renderItem"];
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: !editMode });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const handle = editMode ? (
    <button
      type="button"
      ref={setNodeRef as never}
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      className={cn(
        "absolute top-2 left-2 z-10 inline-flex items-center justify-center w-7 h-7 rounded-md",
        "bg-card/90 backdrop-blur border border-border shadow-sm text-muted-foreground",
        "hover:text-foreground hover:bg-card cursor-grab active:cursor-grabbing",
        "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity",
      )}
      title="Drag to reorder"
    >
      <GripVertical size={14} />
    </button>
  ) : null;

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      {renderItem(item, handle, isDragging)}
    </div>
  );
};

const SortableGridInner = <T extends { id: string }>({
  items,
  editMode,
  onReorder,
  className,
  renderItem,
  trailing,
}: SortableGridProps<T>, ref: React.ForwardedRef<HTMLDivElement>) => {
  // Local mirror to keep the UI snappy during the drag; sync from prop changes.
  const [local, setLocal] = useState(items);
  useEffect(() => setLocal(items), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = local.findIndex((i) => i.id === active.id);
    const newIdx = local.findIndex((i) => i.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(local, oldIdx, newIdx);
    setLocal(next);
    onReorder(next);
  };

  if (!editMode) {
    // No DnD overhead in view mode — render plain children.
      return (
        <div ref={ref} className={className}>
        {local.map((item) => (
          <div key={item.id} className="contents">
            {renderItem(item, null, false)}
          </div>
        ))}
        {trailing}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={local.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div ref={ref} className={className}>
          {local.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              editMode={editMode}
              renderItem={renderItem}
            />
          ))}
          {trailing}
        </div>
      </SortableContext>
    </DndContext>
  );
};

const SortableGrid = forwardRef(SortableGridInner) as (<T extends { id: string }>(
  props: SortableGridProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement) & { displayName?: string };

SortableGrid.displayName = "SortableGrid";

export default SortableGrid;
