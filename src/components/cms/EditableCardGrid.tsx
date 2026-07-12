import { ReactNode, useMemo, useState } from "react";
import { Plus, Copy, Trash2, Sparkles, GripVertical } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditMode } from "./EditModeContext";
import { useSiteContent, useSaveContent, useDeleteContent } from "@/hooks/useSiteContent";
import EditableText from "./EditableText";
import EditableIcon from "./EditableIcon";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Storage convention:
 *   page=<page>, section="cards_<gridKey>"
 *   content_key = "card_<id>__<field>"
 *     fields: "marker"   (presence row, value="1"; sort_order = card position)
 *             "title"    (EditableText handles this row directly)
 *             "desc"     (EditableText handles this row directly)
 *             "anim"     (animation style: none|lift|glow|float|tilt|pulse)
 *   Icons live in section="overrides", slotKey=`card_<gridKey>_<id>_icon`
 */

export type CardAnimation = "none" | "lift" | "glow" | "float" | "tilt" | "pulse";

const ANIM_OPTIONS: { value: CardAnimation; label: string; hint: string }[] = [
  { value: "none", label: "None", hint: "Static card" },
  { value: "lift", label: "Lift", hint: "Rises on hover" },
  { value: "glow", label: "Glow", hint: "Soft accent halo" },
  { value: "float", label: "Float", hint: "Gently bobs forever" },
  { value: "tilt", label: "Tilt", hint: "3D wobble on hover" },
  { value: "pulse", label: "Pulse", hint: "Slow breathing scale" },
];

export interface CardSeed {
  /** Stable key used as the card id when first materialized */
  key: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  /** Optional default animation style */
  anim?: CardAnimation;
}

interface EditableCardGridProps {
  page: string;
  /** Unique grid identifier within the page (e.g. "features", "diffs") */
  gridKey: string;
  seeds: CardSeed[];
  /**
   * How to render an individual card. Receives ready-made editable nodes.
   * The `wrapperClassName` already encodes the animation style — apply it to
   * the card's outer element.
   */
  renderCard?: (args: {
    id: string;
    index: number;
    icon: ReactNode;
    title: ReactNode;
    desc: ReactNode;
    /** Animation classes (hover:* and animate-*) — apply to the outermost element */
    animClass: string;
  }) => ReactNode;
  className?: string;
}

interface CardRecord {
  id: string;
  sortOrder: number;
  seed?: CardSeed;
  iconNode: ReactNode;
  anim: CardAnimation;
}

const sectionFor = (gridKey: string) => `cards_${gridKey}`;
const markerKey = (id: string) => `card_${id}__marker`;
const animKey = (id: string) => `card_${id}__anim`;
const cardIdFromMarkerKey = (k: string) => k.replace(/^card_/, "").replace(/__marker$/, "");

/**
 * Build the className fragment that applies the chosen animation effect.
 * Combines Tailwind utilities with custom keyframes from index.css.
 */
const animClassFor = (anim: CardAnimation): string => {
  switch (anim) {
    case "lift":
      return "transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-accent/30";
    case "glow":
      return "transition-all duration-300 hover:shadow-[0_8px_30px_-4px_hsl(var(--accent)/0.35)] hover:border-accent/40";
    case "float":
      return "animate-[float_3.5s_ease-in-out_infinite] hover:shadow-lg transition-shadow";
    case "tilt":
      return "transition-transform duration-300 hover:[transform:perspective(800px)_rotateX(4deg)_rotateY(-4deg)] hover:shadow-lg";
    case "pulse":
      return "animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] hover:animation-none transition-shadow hover:shadow-lg";
    case "none":
    default:
      return "";
  }
};

const defaultRenderCard: NonNullable<EditableCardGridProps["renderCard"]> = ({
  index,
  icon,
  title,
  desc,
  animClass,
}) => (
  <motion.div
    className={`bg-card rounded-xl p-6 border border-border h-full ${animClass}`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.08, duration: 0.5 }}
  >
    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
      {icon}
    </div>
    {title}
    {desc}
  </motion.div>
);

const EditableCardGrid = ({
  page,
  gridKey,
  seeds,
  renderCard = defaultRenderCard,
  className = "grid sm:grid-cols-2 lg:grid-cols-3 gap-6",
}: EditableCardGridProps) => {
  const section = sectionFor(gridKey);
  const { enabled } = useEditMode();
  const { items } = useSiteContent(page, section);
  const saveContent = useSaveContent();
  const deleteContent = useDeleteContent();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const cards = useMemo<CardRecord[]>(() => {
    const markers = items.filter((i) => i.content_key.endsWith("__marker"));
    if (markers.length > 0) {
      return markers
        .map((m) => {
          const id = cardIdFromMarkerKey(m.content_key);
          const seed = seeds.find((s) => s.key === id);
          const SeedIcon = seed?.icon;
          const animRow = items.find((i) => i.content_key === animKey(id));
          const anim = ((animRow?.value as CardAnimation) || seed?.anim || "lift") as CardAnimation;
          return {
            id,
            sortOrder: m.sort_order,
            seed,
            iconNode: SeedIcon ? <SeedIcon size={22} className="text-accent" /> : null,
            anim,
          };
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
    // Pure seed mode (nothing in CMS yet)
    return seeds.map((s, i) => ({
      id: s.key,
      sortOrder: i,
      seed: s,
      iconNode: <s.icon size={22} className="text-accent" />,
      anim: (s.anim || "lift") as CardAnimation,
    }));
  }, [items, seeds]);

  const writeCards = async (
    next: { id: string; title: string; desc: string; anim: CardAnimation }[]
  ) => {
    const oldRows = items.filter(
      (i) =>
        i.content_key.endsWith("__marker") ||
        i.content_key.endsWith("__title") ||
        i.content_key.endsWith("__desc") ||
        i.content_key.endsWith("__anim")
    );
    for (const r of oldRows) await deleteContent.mutateAsync(r.id);

    for (let i = 0; i < next.length; i++) {
      const c = next[i];
      await saveContent.mutateAsync({
        page,
        section,
        content_key: markerKey(c.id),
        value: "1",
        content_type: "text",
        sort_order: i,
      });
      await saveContent.mutateAsync({
        page,
        section,
        content_key: `card_${c.id}__title`,
        value: c.title,
        content_type: "text",
        sort_order: i,
      });
      await saveContent.mutateAsync({
        page,
        section,
        content_key: `card_${c.id}__desc`,
        value: c.desc,
        content_type: "text",
        sort_order: i,
      });
      await saveContent.mutateAsync({
        page,
        section,
        content_key: animKey(c.id),
        value: c.anim,
        content_type: "text",
        sort_order: i,
      });
    }
  };

  /** Snapshot current cards (DB values when present, otherwise seed values) */
  const snapshot = () =>
    cards.map((c) => {
      const titleRow = items.find((i) => i.content_key === `card_${c.id}__title`);
      const descRow = items.find((i) => i.content_key === `card_${c.id}__desc`);
      return {
        id: c.id,
        title: titleRow?.value || c.seed?.title || "",
        desc: descRow?.value || c.seed?.desc || "",
        anim: c.anim,
      };
    });

  const newId = () => Math.random().toString(36).slice(2, 10);

  const addCard = async () => {
    setBusy("add");
    try {
      const next = [
        ...snapshot(),
        { id: newId(), title: "New card", desc: "Click to edit this description.", anim: "lift" as CardAnimation },
      ];
      await writeCards(next);
      toast({ title: "Card added" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const duplicateCard = async (id: string) => {
    setBusy(`dup-${id}`);
    try {
      const list = snapshot();
      const idx = list.findIndex((c) => c.id === id);
      if (idx === -1) return;
      const original = list[idx];
      const copy = { id: newId(), title: original.title, desc: original.desc, anim: original.anim };
      list.splice(idx + 1, 0, copy);
      await writeCards(list);
      toast({ title: "Card duplicated" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const deleteCard = async (id: string) => {
    if (!window.confirm("Delete this card?")) return;
    setBusy(`del-${id}`);
    try {
      const next = snapshot().filter((c) => c.id !== id);
      await writeCards(next);
      toast({ title: "Card deleted" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const setAnim = async (id: string, anim: CardAnimation) => {
    setBusy(`anim-${id}`);
    try {
      // Make sure cards are persisted first (so the animKey row has a marker pair)
      const list = snapshot().map((c) => (c.id === id ? { ...c, anim } : c));
      await writeCards(list);
      toast({ title: "Animation updated" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  // Local optimistic order — when set, overrides the DB-derived order until the
  // next items refresh comes through. Lets the dragged card snap into its new
  // slot instantly while the writeCards mutations finish in the background.
  const [optimisticOrder, setOptimisticOrder] = useState<string[] | null>(null);

  const orderedCards = useMemo(() => {
    if (!optimisticOrder) return cards;
    const byId = new Map(cards.map((c) => [c.id, c]));
    const arranged = optimisticOrder
      .map((id) => byId.get(id))
      .filter(Boolean) as typeof cards;
    const seen = new Set(optimisticOrder);
    cards.forEach((c) => {
      if (!seen.has(c.id)) arranged.push(c);
    });
    return arranged;
  }, [cards, optimisticOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 6px threshold so clicks on inline editable text don't trigger drags
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = orderedCards.map((c) => c.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const newIds = arrayMove(ids, oldIndex, newIndex);
    setOptimisticOrder(newIds);

    setBusy("reorder");
    try {
      const snap = snapshot();
      const byId = new Map(snap.map((c) => [c.id, c]));
      const next = newIds.map((id) => byId.get(id)!).filter(Boolean);
      await writeCards(next);
      toast({ title: "Order updated" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
      setOptimisticOrder(null);
    } finally {
      setBusy(null);
    }
  };

  const renderCardItem = (card: CardRecord, index: number) => {
    const iconSlot = `card_${gridKey}_${card.id}_icon`;
    const titleNode = (
      <EditableText
        as="h3"
        page={page}
        section={section}
        contentKey={`card_${card.id}__title`}
        fallback={card.seed?.title ?? "Card title"}
        className="font-semibold text-foreground mb-2 block"
      />
    );
    const descNode = (
      <EditableText
        as="p"
        page={page}
        section={section}
        contentKey={`card_${card.id}__desc`}
        fallback={card.seed?.desc ?? "Card description"}
        multiline
        className="text-sm text-muted-foreground"
        rich
      />
    );
    const iconNode = (
      <EditableIcon page={page} slotKey={iconSlot} size={22}>
        {card.iconNode}
      </EditableIcon>
    );
    const animClass = animClassFor(card.anim);

    return renderCard({
      id: card.id,
      index,
      icon: iconNode,
      title: titleNode,
      desc: descNode,
      animClass,
    });
  };

  /** Toolbar shown in edit mode (animation, duplicate, delete) */
  const renderToolbar = (card: CardRecord, dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>) => (
    <div className="absolute -top-2 -right-2 z-20 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
      {dragHandleProps && (
        <button
          {...dragHandleProps}
          type="button"
          className="bg-card border border-border rounded-full p-1.5 shadow-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-grab active:cursor-grabbing touch-none"
          title="Drag to reorder"
          aria-label="Drag to reorder card"
        >
          <GripVertical size={12} />
        </button>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <button
            disabled={!!busy}
            className="bg-card border border-border rounded-full p-1.5 shadow-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
            title={`Animation: ${card.anim}`}
          >
            <Sparkles size={12} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-1.5" onClick={(e) => e.stopPropagation()}>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-1">
            Animation
          </div>
          {ANIM_OPTIONS.map((opt) => {
            const active = card.anim === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAnim(card.id, opt.value)}
                disabled={!!busy}
                className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left ${
                  active ? "bg-accent/15 text-accent font-medium" : "hover:bg-accent/10 text-foreground"
                }`}
              >
                <div className="min-w-0">
                  <div>{opt.label}</div>
                  <div className="text-[10px] text-muted-foreground">{opt.hint}</div>
                </div>
                {active && <span className="text-accent text-xs">●</span>}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
      <button
        onClick={() => duplicateCard(card.id)}
        disabled={!!busy}
        className="bg-card border border-border rounded-full p-1.5 shadow-md text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
        title="Duplicate card"
      >
        <Copy size={12} />
      </button>
      <button
        onClick={() => deleteCard(card.id)}
        disabled={!!busy || orderedCards.length <= 1}
        className="bg-card border border-border rounded-full p-1.5 shadow-md text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-30"
        title={orderedCards.length <= 1 ? "Can't delete the last card" : "Delete card"}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );

  const addButton = enabled && (
    <button
      onClick={addCard}
      disabled={!!busy}
      className="rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-colors p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent min-h-[160px] disabled:opacity-50"
      title="Add a new card"
    >
      <Plus size={24} />
      <span className="text-sm font-medium">{busy === "add" ? "Adding…" : "Add card"}</span>
    </button>
  );

  // Read-only mode: skip DndContext entirely (zero overhead for visitors)
  if (!enabled) {
    return (
      <div className={className}>
        {orderedCards.map((card, index) => (
          <div key={card.id} className="relative">
            {renderCardItem(card, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={orderedCards.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className={className}>
          {orderedCards.map((card, index) => (
            <SortableCardItem
              key={card.id}
              id={card.id}
              renderToolbar={(handleProps) => renderToolbar(card, handleProps)}
            >
              {renderCardItem(card, index)}
            </SortableCardItem>
          ))}
          {addButton}
        </div>
      </SortableContext>
    </DndContext>
  );
};

/**
 * Wraps a single card in dnd-kit's useSortable so it can be dragged. The drag
 * handle itself is rendered via `renderToolbar(handleProps)` so the entire card
 * body remains clickable for inline editing.
 */
interface SortableCardItemProps {
  id: string;
  children: ReactNode;
  renderToolbar: (
    handleProps: React.HTMLAttributes<HTMLButtonElement>
  ) => ReactNode;
}

const SortableCardItem = ({ id, children, renderToolbar }: SortableCardItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 30 : undefined,
  };

  // Combine dnd-kit's listeners + attributes so the drag handle activates dnd
  const handleProps = { ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>;

  return (
    <div ref={setNodeRef} style={style} className="relative group/card">
      {renderToolbar(handleProps)}
      {children}
    </div>
  );
};

export default EditableCardGrid;
