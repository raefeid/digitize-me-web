import { useMemo, useState, useDeferredValue } from "react";
import { icons, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LucideIconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Currently selected icon name (e.g. "Camera"). null = nothing picked. */
  value?: string | null;
  /** Called with the canonical Lucide icon name when the user picks one. */
  onSelect: (name: string) => void;
  title?: string;
}

/**
 * Pre-computed sorted list of all Lucide icon names. Lives at module scope so
 * it isn't recreated on every render (1700+ entries).
 */
const ALL_NAMES = Object.keys(icons).sort();

/**
 * Convert "PascalCase" → "pascal case" for case-insensitive substring matching.
 */
const normalize = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();

const LucideIconPicker = ({
  open,
  onOpenChange,
  value,
  onSelect,
  title = "Pick an icon",
}: LucideIconPickerProps) => {
  const [search, setSearch] = useState("");
  // useDeferredValue keeps typing snappy when filtering 1700+ icons
  const deferred = useDeferredValue(search);

  const filtered = useMemo(() => {
    const q = normalize(deferred.trim());
    if (!q) return ALL_NAMES.slice(0, 300); // Show first 300 by default
    return ALL_NAMES.filter((n) => normalize(n).includes(q)).slice(0, 600);
  }, [deferred]);

  const pick = (name: string) => {
    onSelect(name);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Search 1,700+ free icons from the Lucide library. Click one to apply.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search icons (e.g. shield, mail, file)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1 -mx-1 px-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No icons match “{search}”
            </p>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
              {filtered.map((name) => {
                const Icon = icons[name as keyof typeof icons];
                const isActive = value === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => pick(name)}
                    title={name}
                    className={`group aspect-square rounded-lg border flex items-center justify-center transition-all hover:bg-accent/10 hover:border-accent ${
                      isActive
                        ? "border-accent bg-accent/15 ring-2 ring-accent/40"
                        : "border-border bg-card"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={isActive ? "text-accent" : "text-foreground group-hover:text-accent transition-colors"}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {filtered.length === 600
              ? "Showing top 600 matches — refine your search for more."
              : `${filtered.length} icon${filtered.length === 1 ? "" : "s"}`}
          </p>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LucideIconPicker;
