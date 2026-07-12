import { useEffect, useState } from "react";
import { icons, GripVertical, Plus, Trash2, ArrowUp, ArrowDown, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import LucideIconPicker from "@/components/cms/LucideIconPicker";
import {
  useAioTools,
  useSaveAioTools,
  newAioToolId,
  DEFAULT_AIO_TOOLS,
  type AioTool,
} from "@/hooks/useAioTools";

/**
 * Admin panel for managing the All-in-One comparison tool list (Home page).
 *
 * The list is stored as a single JSON entry in `site_content`. Editors can:
 *  - add a new tool (default icon + sensible placeholder values)
 *  - remove a tool
 *  - reorder via the up/down buttons (keyboard-accessible)
 *  - edit icon / English name / Arabic name / competitor / price inline
 *  - reset back to the original 12 tools
 *
 * Stable per-row `id`s are preserved across reorders so any inline EditableText
 * overrides keyed on `${id}_name`, `${id}_competitor`, `${id}_price` keep working.
 */
const AioToolsEditor = () => {
  const { toast } = useToast();
  const { data, isLoading } = useAioTools();
  const save = useSaveAioTools();

  // Local working copy — only flushed to the database on Save.
  const [draft, setDraft] = useState<AioTool[]>([]);
  // Which row's icon picker is open (null = none).
  const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  const update = (id: string, patch: Partial<AioTool>) =>
    setDraft((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const remove = (id: string) =>
    setDraft((prev) => prev.filter((t) => t.id !== id));

  const move = (id: string, dir: -1 | 1) =>
    setDraft((prev) => {
      const i = prev.findIndex((t) => t.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const add = () =>
    setDraft((prev) => [
      ...prev,
      {
        id: newAioToolId(),
        icon: "Sparkles",
        name: "New tool",
        competitor: "Competitor",
        price: 30,
      },
    ]);

  const reset = () => {
    if (!confirm("Reset to the original 12 tools? Your unsaved edits will be lost.")) return;
    setDraft(DEFAULT_AIO_TOOLS);
  };

  const onSave = async () => {
    // Quick sanity check: at least one tool, every row has a non-empty name.
    if (draft.length === 0) {
      toast({ title: "Add at least one tool", description: "The section needs at least one entry.", variant: "destructive" });
      return;
    }
    const blank = draft.find((t) => !t.name.trim());
    if (blank) {
      toast({ title: "Missing name", description: "Every tool needs an English name.", variant: "destructive" });
      return;
    }
    try {
      await save.mutateAsync(draft);
      toast({ title: "Saved", description: `${draft.length} tools updated.` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err?.message ?? "Please try again.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading tools…</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>All-in-One tools</CardTitle>
          <CardDescription>
            Manage the comparison grid on the home page. Add, remove, or reorder the tools that appear in the
            "All-in-One" section. Inline text overrides set on the page itself continue to work.
          </CardDescription>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </Button>
          <Button type="button" size="sm" onClick={onSave} disabled={save.isPending}>
            <Save className="w-4 h-4 mr-1" /> {save.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {draft.map((tool, index) => {
          const Icon = (icons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[tool.icon];
          return (
            <div
              key={tool.id}
              className="grid grid-cols-[auto_auto_1fr_1fr_1fr_110px_auto] gap-2 items-center p-2 rounded-md border border-border bg-card/50 hover:bg-card transition-colors"
            >
              {/* Reorder handles */}
              <div className="flex flex-col gap-0.5 text-muted-foreground">
                <button
                  type="button"
                  onClick={() => move(tool.id, -1)}
                  disabled={index === 0}
                  className="hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(tool.id, 1)}
                  disabled={index === draft.length - 1}
                  className="hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Icon picker trigger */}
              <button
                type="button"
                onClick={() => setPickerOpenFor(tool.id)}
                className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:border-accent/50 transition-colors"
                title={`Icon: ${tool.icon}`}
                aria-label={`Change icon (currently ${tool.icon})`}
              >
                {Icon ? <Icon size={18} className="text-foreground" /> : <GripVertical size={18} className="text-muted-foreground" />}
              </button>

              {/* English name */}
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Name (EN)</Label>
                <Input
                  value={tool.name}
                  onChange={(e) => update(tool.id, { name: e.target.value })}
                  placeholder="Scanning"
                  className="h-8"
                />
              </div>

              {/* Arabic name */}
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Name (AR)</Label>
                <Input
                  value={tool.name_ar ?? ""}
                  onChange={(e) => update(tool.id, { name_ar: e.target.value })}
                  placeholder="مسح ضوئي"
                  dir="rtl"
                  className="h-8"
                />
              </div>

              {/* Competitor */}
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Replaces</Label>
                <Input
                  value={tool.competitor}
                  onChange={(e) => update(tool.id, { competitor: e.target.value })}
                  placeholder="ABBYY"
                  className="h-8"
                />
              </div>

              {/* Price (USD) */}
              <div>
                <Label className="text-[10px] uppercase text-muted-foreground">Price (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={tool.price}
                  onChange={(e) => update(tool.id, { price: parseFloat(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>

              {/* Delete */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(tool.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                aria-label="Remove tool"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}

        <Button type="button" variant="outline" size="sm" onClick={add} className="w-full">
          <Plus className="w-4 h-4 mr-1" /> Add tool
        </Button>

        <p className="text-xs text-muted-foreground">
          Tip: keep the list between 1 and 16 tools for best layout. The grid auto-arranges into rows of 4.
        </p>
      </CardContent>

      {/* Single shared icon picker — opens for whichever row was clicked */}
      <LucideIconPicker
        open={pickerOpenFor !== null}
        onOpenChange={(open) => !open && setPickerOpenFor(null)}
        value={pickerOpenFor ? draft.find((t) => t.id === pickerOpenFor)?.icon : null}
        onSelect={(name) => {
          if (pickerOpenFor) update(pickerOpenFor, { icon: name });
          setPickerOpenFor(null);
        }}
        title="Pick a tool icon"
      />
    </Card>
  );
};

export default AioToolsEditor;
