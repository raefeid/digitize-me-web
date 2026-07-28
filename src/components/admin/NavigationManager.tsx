import { ReactNode, useMemo, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavItems, useSaveNavItem, useDeleteNavItem, type NavItemRow, type NavLocation } from "@/hooks/useNavItems";
import { useCustomPages } from "@/hooks/useCustomPages";
import { useFeatures } from "@/hooks/useFeatures";
import { useDynamicIndustries } from "@/hooks/useDynamicIndustries";
import SortableGrid from "@/components/cms/SortableGrid";
import { buildSortPayload, useReorder } from "@/hooks/useReorder";
import { buildIndustrySeo } from "@/lib/industrySeo";
import IndustrySeoNavEditor from "@/components/admin/IndustrySeoNavEditor";

const BUILT_IN_ROUTES = [
  { label: "Home", path: "/" },
  { label: "Product", path: "/product" },
  { label: "Features", path: "/features" },
  { label: "Industries", path: "/industries" },
  
  { label: "Pricing", path: "/pricing" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

type FormState = Partial<NavItemRow> & { label: string; location: NavLocation };
type GeneratedNavChild = {
  id: string;
  parent_id: string;
  location: NavLocation;
  footer_column: null;
  label: string;
  label_ar: null;
  published: boolean;
  target_type: "route";
  target_route: string;
  custom_page_id: null;
  external_url: null;
  open_in_new_tab: false;
  sort_order: number;
  created_at: string;
  updated_at: string;
  isGenerated: true;
  sourceLabel: string;
  seoSlug?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackH1?: string;
};
type DisplayNavItem = NavItemRow | GeneratedNavChild;

const empty = (location: NavLocation): FormState => ({
  label: "",
  label_ar: "",
  location,
  target_type: "route",
  target_route: "/",
  open_in_new_tab: false,
  published: true,
  sort_order: 0,
});

const NavigationManager = () => {
  const { toast } = useToast();
  const { data: items, isLoading } = useNavItems();
  const { data: pages } = useCustomPages({ includeDrafts: true });
  const { data: features } = useFeatures();
  const { publishedList: industries } = useDynamicIndustries();
  const save = useSaveNavItem();
  const reorder = useReorder({ table: "nav_items", invalidateKeys: [["nav_items"], ["nav_items", "all"], ["nav_items", "navbar"], ["nav_items", "footer"]] });
  const del = useDeleteNavItem();
  const [tab, setTab] = useState<NavLocation>("navbar");
  const [editing, setEditing] = useState<FormState | null>(null);

  const filtered = useMemo(
    () => (items ?? []).filter((i) => i.location === tab),
    [items, tab]
  );

  const topLevel = filtered.filter((i) => !i.parent_id).sort((a, b) => a.sort_order - b.sort_order);
  const getDescendantIds = (itemId: string): string[] => {
    const directChildren = filtered.filter((i) => i.parent_id === itemId);
    return directChildren.flatMap((child) => [child.id, ...getDescendantIds(child.id)]);
  };
  const getParentOptions = (item?: Partial<NavItemRow> | null) => {
    const blockedIds = item?.id ? new Set([item.id, ...getDescendantIds(item.id)]) : new Set<string>();
    return (items ?? []).filter(
      (candidate) =>
        candidate.location === (item?.location ?? tab) &&
        !candidate.parent_id &&
        !blockedIds.has(candidate.id),
    );
  };
  const generatedChildrenByParent = useMemo(() => {
    const byParent = new Map<string, GeneratedNavChild[]>();

    if (tab !== "navbar") return byParent;

    for (const item of topLevel) {
      if (item.target_type !== "route") continue;

      if (item.target_route === "/features") {
        byParent.set(
          item.id,
          (features ?? [])
            .filter((feature) => feature.published)
            .map((feature) => ({
              id: `generated-feature-${feature.id}`,
              parent_id: item.id,
              location: "navbar",
              footer_column: null,
              label: feature.hero_title,
              label_ar: null,
              published: true,
              target_type: "route",
              target_route: `/features/${feature.slug}`,
              custom_page_id: null,
              external_url: null,
              open_in_new_tab: false as const,
              sort_order: feature.sort_order,
              created_at: "",
              updated_at: "",
              isGenerated: true as const,
              sourceLabel: "Feature page",
            }))
        );
      }

      if (item.target_route === "/industries") {
        byParent.set(
          item.id,
          industries.map((industry) => {
            const seo = buildIndustrySeo(industry.name, industry.headline, "en");
            return {
              id: `generated-industry-${industry.slug}`,
              parent_id: item.id,
              location: "navbar",
              footer_column: null,
              label: industry.name,
              label_ar: null,
              published: true,
              target_type: "route",
              target_route: `/industries/${industry.slug}`,
              custom_page_id: null,
              external_url: null,
              open_in_new_tab: false as const,
              sort_order: 0,
              created_at: "",
              updated_at: "",
              isGenerated: true as const,
              sourceLabel: "Industry page",
              seoSlug: industry.slug,
              fallbackTitle: seo.title,
              fallbackDescription: seo.description,
              fallbackH1: industry.headline,
            };
          })
        );
      }
    }

    return byParent;
  }, [features, industries, tab, topLevel]);

  const childrenOf = (item: NavItemRow): DisplayNavItem[] => {
    const savedChildren = filtered
      .filter((i) => i.parent_id === item.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const generatedChildren = generatedChildrenByParent.get(item.id) ?? [];
    return [...savedChildren, ...generatedChildren];
  };

  const persistSiblingOrder = (ordered: DisplayNavItem[]) => {
    const saved = ordered.filter((item): item is NavItemRow => !("isGenerated" in item));
    if (saved.length <= 1) return;
    reorder.mutate(buildSortPayload(saved));
  };

  const handleSubmit = async () => {
    if (!editing) return;
    if (!editing.label.trim()) {
      toast({ title: "Label required", variant: "destructive" });
      return;
    }
    try {
      await save.mutateAsync(editing);
      toast({ title: "Menu item saved" });
      setEditing(null);
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Navigation</h2>
          <p className="text-xs text-muted-foreground">Manage navbar dropdowns and footer columns. Items below appear in addition to built-in links.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border border-border p-0.5">
            <button onClick={() => setTab("navbar")} className={`px-3 py-1 text-xs rounded ${tab === "navbar" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>Navbar</button>
            <button onClick={() => setTab("footer")} className={`px-3 py-1 text-xs rounded ${tab === "footer" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>Footer</button>
          </div>
          <Button size="sm" onClick={() => setEditing(empty(tab))}><Plus className="w-4 h-4" /> Add item</Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : topLevel.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">No custom {tab} items yet.</p>
          <Button size="sm" onClick={() => setEditing(empty(tab))}><Plus className="w-4 h-4" /> Add the first one</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          <SortableGrid
            items={topLevel}
            editMode={true}
            onReorder={persistSiblingOrder}
            className="space-y-2"
            renderItem={(item, dragHandle) => (
              <NavRow item={item} dragHandle={dragHandle} getChildren={childrenOf} getParentOptions={getParentOptions} pages={pages ?? []} onEdit={(it) => setEditing(it)} onDelete={(id) => del.mutate(id)} onReorder={persistSiblingOrder} tab={tab} />
            )}
          />
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit menu item" : "New menu item"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Label (EN)</Label><Input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} /></div>
                <div><Label className="text-xs">Label (AR)</Label><Input dir="rtl" value={editing.label_ar ?? ""} onChange={(e) => setEditing({ ...editing, label_ar: e.target.value })} /></div>
              </div>

              <div>
                <Label className="text-xs">Where</Label>
                <Select value={editing.location} onValueChange={(v) => setEditing({ ...editing, location: v as NavLocation })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="navbar">Navbar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Parent (for nested menus)</Label>
                <Select value={editing.parent_id ?? "none"} onValueChange={(v) => setEditing({ ...editing, parent_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="Top-level (no parent)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Top-level —</SelectItem>
                    {getParentOptions(editing).map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editing.location === "footer" && (
                <div>
                  <Label className="text-xs">Footer column heading (top-level only)</Label>
                  <Input value={editing.footer_column ?? ""} onChange={(e) => setEditing({ ...editing, footer_column: e.target.value })} placeholder="e.g. Resources" />
                </div>
              )}

              <div>
                <Label className="text-xs">Destination</Label>
                <Select value={editing.target_type} onValueChange={(v) => setEditing({ ...editing, target_type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="route">Built-in page</SelectItem>
                    <SelectItem value="custom_page">Custom page</SelectItem>
                    <SelectItem value="external">External URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editing.target_type === "route" && (
                <Select value={editing.target_route ?? "/"} onValueChange={(v) => setEditing({ ...editing, target_route: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BUILT_IN_ROUTES.map((r) => <SelectItem key={r.path} value={r.path}>{r.label} — {r.path}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}

              {editing.target_type === "custom_page" && (
                <Select value={editing.custom_page_id ?? ""} onValueChange={(v) => setEditing({ ...editing, custom_page_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Pick a custom page" /></SelectTrigger>
                  <SelectContent>
                    {(pages ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title} ({p.status})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {editing.target_type === "external" && (
                <Input placeholder="https://…" value={editing.external_url ?? ""} onChange={(e) => setEditing({ ...editing, external_url: e.target.value })} />
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch checked={editing.open_in_new_tab ?? false} onCheckedChange={(v) => setEditing({ ...editing, open_in_new_tab: v })} />
                  <Label className="text-xs">Open in new tab</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editing.published ?? true} onCheckedChange={(v) => setEditing({ ...editing, published: v })} />
                  <Label className="text-xs">Published</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={save.isPending}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const NavRow = ({
  item,
  dragHandle,
  getChildren,
  getParentOptions,
  pages,
  onEdit,
  onDelete,
  onReorder,
  tab,
}: {
  item: DisplayNavItem;
  dragHandle: ReactNode;
  getChildren: (item: NavItemRow) => DisplayNavItem[];
  getParentOptions: (item?: Partial<NavItemRow> | null) => NavItemRow[];
  pages: { id: string; slug: string; title: string }[];
  onEdit: (it: FormState) => void;
  onDelete: (id: string) => void;
  onReorder: (ordered: DisplayNavItem[]) => void;
  tab: NavLocation;
}) => {
  const isGenerated = "isGenerated" in item;
  const children = isGenerated ? [] : getChildren(item);
  const parentOptions = isGenerated ? [] : getParentOptions(item);
  const dest =
    item.target_type === "external"
      ? item.external_url
      : item.target_type === "custom_page"
      ? "/" + (pages.find((p) => p.id === item.custom_page_id)?.slug ?? "?")
      : item.target_route;

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        <div className="shrink-0">{dragHandle}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{item.label}</p>
            {!item.published && <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">hidden</span>}
            {isGenerated && <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded">auto</span>}
            {item.location === "footer" && item.footer_column && <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded">{item.footer_column}</span>}
          </div>
          <code className="text-[11px] text-muted-foreground">{dest}</code>
          {isGenerated && <p className="text-[11px] text-muted-foreground mt-1">{item.sourceLabel}</p>}
          {isGenerated && item.seoSlug && item.fallbackTitle && item.fallbackDescription && item.fallbackH1 && (
            <IndustrySeoNavEditor
              slug={item.seoSlug}
              fallbackTitle={item.fallbackTitle}
              fallbackDescription={item.fallbackDescription}
              fallbackH1={item.fallbackH1}
            />
          )}
          {!isGenerated && (
            <div className="mt-2 max-w-[240px]">
              <Select
                value={item.parent_id ?? "none"}
                onValueChange={(value) =>
                  onEdit({
                    ...item,
                    parent_id: value === "none" ? null : value,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Parent menu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Top-level</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {!isGenerated && <Button size="sm" variant="ghost" onClick={() => onEdit(item as any)}><Pencil className="w-3.5 h-3.5" /></Button>}
        {!isGenerated && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (window.confirm(`Delete "${item.label}"?`)) onDelete(item.id); }}><Trash2 className="w-3.5 h-3.5" /></Button>}
      </div>
      {children.length > 0 && (
        <div className="ml-6 mt-2 space-y-1.5 border-l-2 border-border pl-3">
          <SortableGrid
            items={children}
            editMode={children.some((child) => !("isGenerated" in child))}
            onReorder={onReorder}
            className="space-y-1.5"
            renderItem={(child, childDragHandle) => (
              <NavRow key={child.id} item={child} dragHandle={childDragHandle} getChildren={getChildren} getParentOptions={getParentOptions} pages={pages} onEdit={onEdit} onDelete={onDelete} onReorder={onReorder} tab={tab} />
            )}
          />
        </div>
      )}
    </Card>
  );
};

export default NavigationManager;
