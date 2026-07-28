import { useState, useRef, lazy, Suspense, useMemo } from "react";
import { Plus, Edit, Trash2, Save, Upload, Image, FileText, Code, ChevronDown, ChevronRight, ImagePlus, X, FolderOpen, Search } from "lucide-react";

const BlockEditor = lazy(() => import("./BlockEditor"));
import MediaPicker from "./MediaPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useAllSiteContent,
  useSaveContent,
  useDeleteContent,
  useUploadCmsImage,
  SiteContentItem,
} from "@/hooks/useSiteContent";
import { formatUploadBytes, getImageUploadGuidance, validateImageFileWithDimensions } from "@/lib/imageUploadGuidance";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageUploadPreviewDialog from "./ImageUploadPreviewDialog";
import { optimizeImageForUpload } from "@/lib/imageUploadOptimization";

const PAGES = [
  { id: "home", label: "Homepage" },
  { id: "product", label: "Product" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
  { id: "industries", label: "Industries" },
  { id: "features", label: "Features" },
  { id: "blog", label: "Blog" },
  
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms of Service" },
  { id: "not_found", label: "404 Page" },
  { id: "footer", label: "Footer" },
  { id: "navbar", label: "Navigation" },
];

const CONTENT_TYPES = [
  { value: "text", label: "Text", icon: FileText },
  { value: "html", label: "HTML", icon: Code },
  { value: "image_url", label: "Image URL", icon: Image },
  { value: "json", label: "JSON", icon: Code },
];

type ContentForm = {
  id?: string;
  page: string;
  section: string;
  content_key: string;
  value: string;
  value_ar: string;
  content_type: string;
  sort_order: number;
};

const emptyForm: ContentForm = {
  page: "home",
  section: "",
  content_key: "",
  value: "",
  value_ar: "",
  content_type: "text",
  sort_order: 0,
};

const SiteContentManager = () => {
  const { toast } = useToast();
  const { data: allContent, isLoading } = useAllSiteContent();
  const saveContent = useSaveContent();
  const deleteContent = useDeleteContent();
  const uploadImage = useUploadCmsImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ContentForm>(emptyForm);
  const [expandedPages, setExpandedPages] = useState<string[]>(["home"]);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [optimizeUploads, setOptimizeUploads] = useState(true);
  const [search, setSearch] = useState("");
  const imageGuidance = getImageUploadGuidance(form.page);

  const togglePage = (page: string) => {
    setExpandedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    );
  };

  const filteredContent = useMemo(() => {
    const list = allContent ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) =>
      item.content_key.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q) ||
      item.page.toLowerCase().includes(q) ||
      (item.value ?? "").toLowerCase().includes(q) ||
      (item.value_ar ?? "").toLowerCase().includes(q)
    );
  }, [allContent, search]);

  const grouped = filteredContent.reduce<Record<string, Record<string, SiteContentItem[]>>>((acc, item) => {
    if (!acc[item.page]) acc[item.page] = {};
    if (!acc[item.page][item.section]) acc[item.page][item.section] = [];
    acc[item.page][item.section].push(item);
    return acc;
  }, {});

  const matchingPages = useMemo(() => {
    if (!search.trim()) return null;
    return new Set(filteredContent.map((i) => i.page));
  }, [filteredContent, search]);

  const handleSave = async () => {
    try {
      await saveContent.mutateAsync(form as any);
      toast({ title: "Content saved" });
      setDialogOpen(false);
      setForm(emptyForm);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContent.mutateAsync(id);
      toast({ title: "Content deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const uploadImageFile = async (file: File) => {
    if (!file) return;
    const error = await validateImageFileWithDimensions(file, imageGuidance);
    if (error) {
      toast({ title: "Upload blocked", description: error, variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const optimizedFile = await optimizeImageForUpload(file, optimizeUploads);
      const path = `${form.page}/${Date.now()}-${optimizedFile.name}`;
      const url = await uploadImage.mutateAsync({ file: optimizedFile, path });
      setForm({ ...form, value: url, content_type: "image_url" });
      toast({ title: "Image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFiles([file]);
    setPreviewOpen(true);
  };

  const openEdit = (item: SiteContentItem) => {
    setForm({
      id: item.id,
      page: item.page,
      section: item.section,
      content_key: item.content_key,
      value: item.value,
      value_ar: item.value_ar ?? "",
      content_type: item.content_type,
      sort_order: item.sort_order,
    });
    setDialogOpen(true);
  };

  const openNew = (page = "home") => {
    setForm({ ...emptyForm, page });
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-9 w-full sm:w-32" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalItems = (allContent ?? []).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Site Content</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalItems} item{totalItems === 1 ? "" : "s"} across {PAGES.length} pages
          </p>
        </div>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1 w-full sm:w-auto"
          onClick={() => openNew()}
        >
          <Plus size={16} /> Add Content
        </Button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search across pages, sections, keys, EN & AR values…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
        {search && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {filteredContent.length} match{filteredContent.length === 1 ? "" : "es"} across {matchingPages?.size ?? 0} page{(matchingPages?.size ?? 0) === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {totalItems === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl mb-4">
          <FolderOpen size={40} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground mb-3">No content yet — start by adding your first item.</p>
          <Button size="sm" variant="outline" onClick={() => openNew()}>
            <Plus size={14} className="mr-1" /> Add first content
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {PAGES.map((page) => {
          const sections = grouped[page.id] ?? {};
          const count = Object.values(sections).flat().length;
          // While searching, hide pages with no matches and force-expand the rest
          if (search.trim() && count === 0) return null;
          const isExpanded = search.trim() ? true : expandedPages.includes(page.id);

          return (
            <div key={page.id} className="border border-border rounded-xl bg-card overflow-hidden">
              <button
                onClick={() => togglePage(page.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="font-semibold text-foreground">{page.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {count} items
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-accent"
                  onClick={(e) => {
                    e.stopPropagation();
                    openNew(page.id);
                  }}
                >
                  <Plus size={14} />
                </Button>
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {Object.keys(sections).length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">No content yet. Click + to add.</p>
                  ) : (
                    Object.entries(sections).map(([section, items]) => (
                      <div key={section} className="border-b border-border/50 last:border-b-0">
                        <div className="px-4 py-2 bg-muted/30">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {section}
                          </span>
                        </div>
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{item.content_key}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                                  {item.content_type}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate max-w-md mt-0.5">
                                {item.content_type === "image_url" ? (
                                  <span className="flex items-center gap-1">
                                    <Image size={10} /> {item.value.split("/").pop()}
                                  </span>
                                ) : (
                                  item.value.substring(0, 80) + (item.value.length > 80 ? "..." : "")
                                )}
                              </p>
                            </div>
                            <div className="flex gap-1 ml-3">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                                <Edit size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit / Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Content" : "Add Content"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Page *</label>
                <select
                  value={form.page}
                  onChange={(e) => setForm({ ...form, page: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  disabled={!!form.id}
                >
                  {PAGES.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Section *</label>
                <Input
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  placeholder="e.g. hero, stats, features"
                  disabled={!!form.id}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Key *</label>
                <Input
                  value={form.content_key}
                  onChange={(e) => setForm({ ...form, content_key: e.target.value })}
                  placeholder="e.g. title, description, cta_text"
                  disabled={!!form.id}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select
                  value={form.content_type}
                  onChange={(e) => setForm({ ...form, content_type: e.target.value })}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Value (EN) *</label>
              {form.content_type === "html" ? (
                <Suspense fallback={<Textarea value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} rows={6} placeholder="HTML content..." />}>
                  <BlockEditor
                    value={form.value}
                    onChange={(html) => setForm((prev) => ({ ...prev, value: html }))}
                    placeholder="Start writing... Type '/' for block menu"
                  />
                </Suspense>
              ) : form.content_type === "image_url" ? (
                <div className="space-y-2">
                  {form.value && form.value.startsWith("http") && (
                    <div className="relative inline-block rounded-md overflow-hidden border border-border">
                      <img src={form.value} alt="Preview" className="max-h-40 max-w-full object-contain bg-muted/30" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, value: "" })}
                        className="absolute top-1 right-1 bg-background/90 hover:bg-destructive hover:text-destructive-foreground rounded-full p-1 shadow"
                        title="Clear"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => setPickerOpen(true)}
                    >
                      <ImagePlus size={14} /> Choose from library
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <Upload size={14} /> {uploading ? "Uploading..." : "Upload new"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Recommended: {imageGuidance.recommended} · Formats: {imageGuidance.formats} · Max: {formatUploadBytes(imageGuidance.maxBytes)}
                  </p>
                  <Input
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="...or paste URL"
                    className="text-sm"
                  />
                </div>
              ) : (
                <Textarea
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  rows={3}
                  placeholder="Content value..."
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Value (AR)</label>
              {form.content_type === "html" ? (
                <Suspense fallback={<Textarea value={form.value_ar} onChange={(e) => setForm({ ...form, value_ar: e.target.value })} rows={3} dir="rtl" placeholder="Arabic content (optional)" />}>
                  <BlockEditor
                    value={form.value_ar}
                    onChange={(html) => setForm((prev) => ({ ...prev, value_ar: html }))}
                    placeholder="Arabic content..."
                    dir="rtl"
                  />
                </Suspense>
              ) : (
                <Textarea
                  value={form.value_ar}
                  onChange={(e) => setForm({ ...form, value_ar: e.target.value })}
                  rows={3}
                  dir="rtl"
                  placeholder="Arabic content (optional)"
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Sort Order</label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
              disabled={saveContent.isPending || !form.section || !form.content_key}
            >
              <Save size={16} /> {saveContent.isPending ? "Saving..." : "Save Content"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(url) => setForm((prev) => ({ ...prev, value: url, content_type: "image_url" }))}
        uploadFolder={form.page}
        title="Choose image for content"
      />

      <ImageUploadPreviewDialog
        open={previewOpen}
        files={pendingImageFiles}
        guidance={imageGuidance}
        title="Preview content image crop"
        description="Confirm how this image will frame on the website before uploading it."
        confirmLabel="Upload image"
        isSubmitting={uploading}
        optimizeUploads={optimizeUploads}
        onCancel={() => {
          setPreviewOpen(false);
          setPendingImageFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onOptimizeUploadsChange={setOptimizeUploads}
        onConfirm={async (files) => {
          const file = files[0];
          if (!file) return;
          await uploadImageFile(file);
          setPreviewOpen(false);
          setPendingImageFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />
    </div>
  );
};

export default SiteContentManager;
