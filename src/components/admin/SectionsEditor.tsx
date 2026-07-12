import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical, List, BarChart3, ImageIcon, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FeatureSection, FeatureSectionItem } from "@/hooks/useFeatures";

interface Props {
  value: FeatureSection[];
  onChange: (next: FeatureSection[]) => void;
  rtl?: boolean;
}

const sectionMeta: Record<
  string,
  { label: string; icon: typeof List; defaultItem?: FeatureSectionItem; defaults?: Partial<FeatureSection> }
> = {
  feature_list: {
    label: "Feature list",
    icon: List,
    defaultItem: { icon: "Sparkles", title: "", desc: "" },
    defaults: { title: "" },
  },
  stats: {
    label: "Stats",
    icon: BarChart3,
    defaultItem: { value: "", label: "" },
    defaults: { title: "" },
  },
  image_text: {
    label: "Image + text",
    icon: ImageIcon,
    defaults: { title: "", desc: "", image: "" },
  },
  cta: {
    label: "Call to action",
    icon: Megaphone,
    defaults: { title: "", desc: "" },
  },
};

const newSection = (type: string): FeatureSection => {
  const meta = sectionMeta[type];
  const base: FeatureSection = { type, ...(meta?.defaults ?? {}) };
  if (meta?.defaultItem) base.items = [{ ...meta.defaultItem }];
  return base;
};

const SectionsEditor = ({ value, onChange, rtl }: Props) => {
  const sections = value ?? [];

  const update = (idx: number, patch: Partial<FeatureSection>) => {
    const next = sections.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChange(next);
  };

  const updateItem = (sIdx: number, iIdx: number, patch: Partial<FeatureSectionItem>) => {
    const items = [...(sections[sIdx].items ?? [])];
    items[iIdx] = { ...items[iIdx], ...patch };
    update(sIdx, { items });
  };

  const addItem = (sIdx: number) => {
    const meta = sectionMeta[sections[sIdx].type];
    if (!meta?.defaultItem) return;
    const items = [...(sections[sIdx].items ?? []), { ...meta.defaultItem }];
    update(sIdx, { items });
  };

  const removeItem = (sIdx: number, iIdx: number) => {
    const items = (sections[sIdx].items ?? []).filter((_, i) => i !== iIdx);
    update(sIdx, { items });
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const removeSection = (idx: number) => {
    if (!confirm("Remove this section?")) return;
    onChange(sections.filter((_, i) => i !== idx));
  };

  const addSection = (type: string) => onChange([...sections, newSection(type)]);

  return (
    <div className="space-y-3" dir={rtl ? "rtl" : undefined}>
      {sections.length === 0 && (
        <Card className="p-6 text-center text-xs text-muted-foreground border-dashed">
          No sections yet — add one below.
        </Card>
      )}

      {sections.map((s, idx) => {
        const meta = sectionMeta[s.type] ?? { label: s.type, icon: GripVertical };
        const Icon = meta.icon;
        return (
          <Card key={idx} className="p-3 bg-muted/20">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-accent" />
              </div>
              <span className="text-sm font-semibold text-foreground flex-1">{meta.label}</span>
              <Button variant="ghost" size="sm" onClick={() => move(idx, -1)} disabled={idx === 0} className="h-7 w-7 p-0">
                <ChevronUp size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => move(idx, 1)} disabled={idx === sections.length - 1} className="h-7 w-7 p-0">
                <ChevronDown size={14} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => removeSection(idx)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                <Trash2 size={14} />
              </Button>
            </div>

            {/* Common fields */}
            {s.type !== "image_text" && "title" in (sectionMeta[s.type]?.defaults ?? {}) && (
              <Input
                placeholder="Section title (optional)"
                className="mb-2"
                value={s.title ?? ""}
                onChange={(e) => update(idx, { title: e.target.value })}
              />
            )}

            {/* Type-specific */}
            {s.type === "feature_list" && (
              <div className="space-y-2">
                {(s.items ?? []).map((it, iIdx) => (
                  <div key={iIdx} className="grid grid-cols-12 gap-2 p-2 rounded-md bg-background border border-border">
                    <Input
                      className="col-span-3 h-8 text-xs"
                      placeholder="Lucide icon"
                      value={it.icon ?? ""}
                      onChange={(e) => updateItem(idx, iIdx, { icon: e.target.value })}
                    />
                    <Input
                      className="col-span-4 h-8 text-xs"
                      placeholder="Title"
                      value={it.title ?? ""}
                      onChange={(e) => updateItem(idx, iIdx, { title: e.target.value })}
                    />
                    <Input
                      className="col-span-4 h-8 text-xs"
                      placeholder="Description"
                      value={it.desc ?? ""}
                      onChange={(e) => updateItem(idx, iIdx, { desc: e.target.value })}
                    />
                    <Button variant="ghost" size="sm" className="col-span-1 h-8 w-8 p-0 text-destructive justify-self-end" onClick={() => removeItem(idx, iIdx)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addItem(idx)} className="gap-1.5 h-7 text-xs">
                  <Plus size={12} /> Add feature
                </Button>
              </div>
            )}

            {s.type === "stats" && (
              <div className="space-y-2">
                {(s.items ?? []).map((it, iIdx) => (
                  <div key={iIdx} className="grid grid-cols-12 gap-2 p-2 rounded-md bg-background border border-border">
                    <Input
                      className="col-span-5 h-8 text-xs"
                      placeholder="Value (e.g. 99%)"
                      value={it.value ?? ""}
                      onChange={(e) => updateItem(idx, iIdx, { value: e.target.value })}
                    />
                    <Input
                      className="col-span-6 h-8 text-xs"
                      placeholder="Label"
                      value={it.label ?? ""}
                      onChange={(e) => updateItem(idx, iIdx, { label: e.target.value })}
                    />
                    <Button variant="ghost" size="sm" className="col-span-1 h-8 w-8 p-0 text-destructive justify-self-end" onClick={() => removeItem(idx, iIdx)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addItem(idx)} className="gap-1.5 h-7 text-xs">
                  <Plus size={12} /> Add stat
                </Button>
              </div>
            )}

            {s.type === "image_text" && (
              <div className="space-y-2">
                <Input
                  placeholder="Title"
                  value={s.title ?? ""}
                  onChange={(e) => update(idx, { title: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={s.desc ?? ""}
                  onChange={(e) => update(idx, { desc: e.target.value })}
                />
                <Input
                  placeholder="Image URL (https://…)"
                  value={s.image ?? ""}
                  onChange={(e) => update(idx, { image: e.target.value })}
                />
              </div>
            )}

            {s.type === "cta" && (
              <div className="space-y-2">
                <Input
                  placeholder="CTA title"
                  value={s.title ?? ""}
                  onChange={(e) => update(idx, { title: e.target.value })}
                />
                <Textarea
                  placeholder="Short description"
                  value={s.desc ?? ""}
                  onChange={(e) => update(idx, { desc: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">
                  Renders the lead-capture button automatically.
                </p>
              </div>
            )}
          </Card>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Plus size={14} /> Add section
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {Object.entries(sectionMeta).map(([type, m]) => {
            const Icon = m.icon;
            return (
              <DropdownMenuItem key={type} onClick={() => addSection(type)} className="gap-2">
                <Icon size={14} /> {m.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SectionsEditor;
