import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, ArrowLeft, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

/**
 * Phase 3: Admin manager for the new `industries` table.
 *
 * Two views:
 *  - List: every industry with publish toggle + edit/delete actions.
 *  - Detail: bilingual editor for hero, pain points, solutions, use cases,
 *    before/after, and CTA.
 *
 * Hardcoded industries (is_hardcoded=true) cannot be deleted but are fully
 * editable so admins can refine the seeded copy.
 */

interface IndustryRow {
  id: string;
  slug: string;
  name: string;
  name_ar: string | null;
  icon: string;
  headline: string;
  headline_ar: string | null;
  description: string;
  description_ar: string | null;
  pain_points: string[];
  pain_points_ar: string[];
  solutions: string[];
  solutions_ar: string[];
  use_cases: string[];
  use_cases_ar: string[];
  before_text: string;
  before_text_ar: string | null;
  after_text: string;
  after_text_ar: string | null;
  cta: string;
  cta_ar: string | null;
  published: boolean;
  is_hardcoded: boolean;
  sort_order: number;
}

const useIndustriesAdmin = () =>
  useQuery({
    queryKey: ["industries-admin-list"],
    queryFn: async (): Promise<IndustryRow[]> => {
      const { data, error } = await supabase
        .from("industries")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as unknown as IndustryRow[];
    },
  });

/** Editable list field (one string per line in a textarea). */
const ListField = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">{label}</Label>
    <Textarea
      rows={Math.max(3, value.length + 1)}
      value={value.join("\n")}
      placeholder={placeholder ?? "One item per line"}
      onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
    />
    <p className="text-xs text-muted-foreground">One item per line · {value.length} items</p>
  </div>
);

const IndustryDetailEditor = ({ row, onBack }: { row: IndustryRow; onBack: () => void }) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [draft, setDraft] = useState<IndustryRow>(row);

  const update = <K extends keyof IndustryRow>(key: K, value: IndustryRow[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("industries")
        .update({
          name: draft.name,
          name_ar: draft.name_ar,
          icon: draft.icon,
          headline: draft.headline,
          headline_ar: draft.headline_ar,
          description: draft.description,
          description_ar: draft.description_ar,
          pain_points: draft.pain_points,
          pain_points_ar: draft.pain_points_ar,
          solutions: draft.solutions,
          solutions_ar: draft.solutions_ar,
          use_cases: draft.use_cases,
          use_cases_ar: draft.use_cases_ar,
          before_text: draft.before_text,
          before_text_ar: draft.before_text_ar,
          after_text: draft.after_text,
          after_text_ar: draft.after_text_ar,
          cta: draft.cta,
          cta_ar: draft.cta_ar,
          published: draft.published,
        })
        .eq("id", draft.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Saved", description: `“${draft.name}” updated.` });
      qc.invalidateQueries({ queryKey: ["industries-admin-list"] });
      qc.invalidateQueries({ queryKey: ["industries-table"] });
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to list
        </Button>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="h-4 w-4 mr-2" /> {save.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Identity</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Slug (URL)</Label>
            <Input value={draft.slug} disabled className="font-mono" />
          </div>
          <div>
            <Label>Lucide icon name</Label>
            <Input value={draft.icon} onChange={(e) => update("icon", e.target.value)} placeholder="Briefcase" />
          </div>
          <div>
            <Label>Name (English)</Label>
            <Input value={draft.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <Label>Name (Arabic)</Label>
            <Input dir="rtl" value={draft.name_ar ?? ""} onChange={(e) => update("name_ar", e.target.value || null)} />
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Hero</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Headline (EN)</Label>
            <Textarea rows={2} value={draft.headline} onChange={(e) => update("headline", e.target.value)} />
          </div>
          <div>
            <Label>Headline (AR)</Label>
            <Textarea rows={2} dir="rtl" value={draft.headline_ar ?? ""} onChange={(e) => update("headline_ar", e.target.value || null)} />
          </div>
          <div>
            <Label>Description (EN)</Label>
            <Textarea rows={4} value={draft.description} onChange={(e) => update("description", e.target.value)} />
          </div>
          <div>
            <Label>Description (AR)</Label>
            <Textarea rows={4} dir="rtl" value={draft.description_ar ?? ""} onChange={(e) => update("description_ar", e.target.value || null)} />
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Pain points</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ListField label="English" value={draft.pain_points} onChange={(v) => update("pain_points", v)} />
          <ListField label="Arabic" value={draft.pain_points_ar} onChange={(v) => update("pain_points_ar", v)} />
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Solutions</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ListField label="English" value={draft.solutions} onChange={(v) => update("solutions", v)} />
          <ListField label="Arabic" value={draft.solutions_ar} onChange={(v) => update("solutions_ar", v)} />
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Use cases</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <ListField label="English" value={draft.use_cases} onChange={(v) => update("use_cases", v)} />
          <ListField label="Arabic" value={draft.use_cases_ar} onChange={(v) => update("use_cases_ar", v)} />
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Before / After</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Before (EN)</Label>
            <Input value={draft.before_text} onChange={(e) => update("before_text", e.target.value)} />
          </div>
          <div>
            <Label>Before (AR)</Label>
            <Input dir="rtl" value={draft.before_text_ar ?? ""} onChange={(e) => update("before_text_ar", e.target.value || null)} />
          </div>
          <div>
            <Label>After (EN)</Label>
            <Input value={draft.after_text} onChange={(e) => update("after_text", e.target.value)} />
          </div>
          <div>
            <Label>After (AR)</Label>
            <Input dir="rtl" value={draft.after_text_ar ?? ""} onChange={(e) => update("after_text_ar", e.target.value || null)} />
          </div>
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold">Closing CTA</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>CTA copy (EN)</Label>
            <Textarea rows={2} value={draft.cta} onChange={(e) => update("cta", e.target.value)} />
          </div>
          <div>
            <Label>CTA copy (AR)</Label>
            <Textarea rows={2} dir="rtl" value={draft.cta_ar ?? ""} onChange={(e) => update("cta_ar", e.target.value || null)} />
          </div>
        </div>
      </Card>

      <Card className="p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Published</h3>
          <p className="text-sm text-muted-foreground">Drafts are only visible to admins.</p>
        </div>
        <Switch checked={draft.published} onCheckedChange={(v) => update("published", v)} />
      </Card>
    </div>
  );
};

const IndustriesContentManager = () => {
  const { data, isLoading } = useIndustriesAdmin();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("industries").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["industries-admin-list"] });
      qc.invalidateQueries({ queryKey: ["industries-table"] });
    },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("industries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Industry deleted" });
      qc.invalidateQueries({ queryKey: ["industries-admin-list"] });
      qc.invalidateQueries({ queryKey: ["industries-table"] });
    },
    onError: (e: Error) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  const create = useMutation({
    mutationFn: async () => {
      const slug = `new-industry-${Date.now()}`;
      const nextOrder = (data?.length ?? 0);
      const { data: inserted, error } = await supabase
        .from("industries")
        .insert({
          slug,
          name: "New industry",
          icon: "Briefcase",
          published: false,
          is_hardcoded: false,
          sort_order: nextOrder,
        })
        .select()
        .single();
      if (error) throw error;
      return inserted as IndustryRow;
    },
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["industries-admin-list"] });
      qc.invalidateQueries({ queryKey: ["industries-table"] });
      setEditingId(row.id);
    },
    onError: (e: Error) => toast({ title: "Create failed", description: e.message, variant: "destructive" }),
  });

  const editing = useMemo(
    () => (editingId ? data?.find((r) => r.id === editingId) : undefined),
    [editingId, data],
  );

  if (editing) {
    return <IndustryDetailEditor row={editing} onBack={() => setEditingId(null)} />;
  }

  const filtered = (data ?? []).filter(
    (r) =>
      !filter ||
      r.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.slug.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Industries content</h2>
          <p className="text-sm text-muted-foreground">
            Manage every industry page: hero, pain points, solutions, use cases, CTA — bilingual.
          </p>
        </div>
        <Button onClick={() => create.mutate()} disabled={create.isPending}>
          <Plus className="h-4 w-4 mr-2" /> New industry
        </Button>
      </div>

      <Input
        placeholder="Filter by name or slug…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <p className="text-muted-foreground">Loading industries…</p>
      ) : (
        <div className="border border-border rounded-lg divide-y divide-border">
          {filtered.map((row) => (
            <div key={row.id} className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">{row.name}</span>
                  {row.is_hardcoded && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Seeded
                    </span>
                  )}
                  {!row.published && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">/{row.slug}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePublish.mutate({ id: row.id, published: !row.published })}
                  title={row.published ? "Unpublish" : "Publish"}
                >
                  {row.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditingId(row.id)}>
                  Edit
                </Button>
                {!row.is_hardcoded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete “${row.name}”? This cannot be undone.`)) remove.mutate(row.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No industries match.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default IndustriesContentManager;
