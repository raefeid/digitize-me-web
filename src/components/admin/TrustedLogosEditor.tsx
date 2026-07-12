import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, ArrowUp, ArrowDown, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent, useSaveContent, useDeleteContent } from "@/hooks/useSiteContent";
import { formatUploadBytes, getImageUploadGuidance, validateImageFileWithDimensions } from "@/lib/imageUploadGuidance";
import ImageUploadPreviewDialog from "./ImageUploadPreviewDialog";
import { optimizeImageForUpload } from "@/lib/imageUploadOptimization";

/**
 * Trusted Logos editor.
 * Stores each logo as a row in site_content (page=home, section=trusted_logos):
 *  - content_key: storage path (e.g. "trusted-logos/<timestamp>-name.png")
 *  - value:       public URL of the image
 *  - value_ar:    optional alt text / company name
 *  - content_type: "image_url"
 *  - sort_order:  display order
 */
const TrustedLogosEditor = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [optimizeUploads, setOptimizeUploads] = useState(true);
  const queryClient = useQueryClient();
  const guidance = getImageUploadGuidance("trusted-logos");
  const { items, isLoading } = useSiteContent("home", "trusted_logos");
  const saveContent = useSaveContent();
  const deleteContent = useDeleteContent();

  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order);

  const handleUpload = async (picked: File[]) => {
    if (!picked.length) return;
    const validations = await Promise.all(
      picked.map((file) => validateImageFileWithDimensions(file, guidance)),
    );
    const firstError = validations.find(Boolean);
    if (firstError) {
      toast({ title: "Upload blocked", description: firstError, variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const startOrder = sorted.length;
      for (let i = 0; i < picked.length; i++) {
        const file = await optimizeImageForUpload(picked[i], optimizeUploads);
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const path = `trusted-logos/${Date.now()}-${i}-${safeName}`;
        const { error: upErr } = await supabase.storage
          .from("cms-images")
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("cms-images").getPublicUrl(path);
        await saveContent.mutateAsync({
          page: "home",
          section: "trusted_logos",
          content_key: path,
          value: data.publicUrl,
          value_ar: file.name.replace(/\.[^.]+$/, ""),
          content_type: "image_url",
          sort_order: startOrder + i,
        });
      }
      toast({ title: `Uploaded ${picked.length} logo(s)` });
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setPreviewOpen(false);
      setPendingFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFilesPicked = (files: FileList | null) => {
    if (!files || !files.length) return;
    setPendingFiles(Array.from(files));
    setPreviewOpen(true);
  };

  const handleDelete = async (id: string, path: string) => {
    try {
      await supabase.storage.from("cms-images").remove([path]);
      await deleteContent.mutateAsync(id);
      toast({ title: "Logo removed" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  const handleMove = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[target];
    await Promise.all([
      saveContent.mutateAsync({
        id: a.id,
        page: a.page,
        section: a.section,
        content_key: a.content_key,
        value: a.value,
        value_ar: a.value_ar ?? "",
        content_type: a.content_type,
        sort_order: b.sort_order,
      }),
      saveContent.mutateAsync({
        id: b.id,
        page: b.page,
        section: b.section,
        content_key: b.content_key,
        value: b.value,
        value_ar: b.value_ar ?? "",
        content_type: b.content_type,
        sort_order: a.sort_order,
      }),
    ]);
  };

  const handleAltUpdate = async (id: string, alt: string) => {
    const item = sorted.find((i) => i.id === id);
    if (!item) return;
    await saveContent.mutateAsync({
      id: item.id,
      page: item.page,
      section: item.section,
      content_key: item.content_key,
      value: item.value,
      value_ar: alt,
      content_type: item.content_type,
      sort_order: item.sort_order,
    });
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-accent" />
          <h3 className="font-semibold text-foreground">Trusted By Logos (Home page)</h3>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFilesPicked(e.target.files)}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading..." : "Upload Logos"}
          </Button>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Recommended:</span> {guidance.recommended} · <span className="font-medium text-foreground">Formats:</span> {guidance.formats} · <span className="font-medium text-foreground">Max:</span> {formatUploadBytes(guidance.maxBytes)}
          <div className="mt-1">{guidance.notes}</div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading logos...</p>
        ) : sorted.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
            <ImageIcon size={32} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mb-3">No logos uploaded yet.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={14} className="mr-1" /> Upload your first logo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sorted.map((logo, idx) => (
              <div
                key={logo.id}
                className="border border-border rounded-lg overflow-hidden bg-background flex flex-col"
              >
                <div className="aspect-video bg-muted/30 flex items-center justify-center p-3">
                  <img
                    src={logo.value}
                    alt={logo.value_ar ?? "logo"}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="p-2 space-y-2">
                  <Input
                    placeholder="Company name / alt"
                    value={logo.value_ar ?? ""}
                    onChange={(e) => handleAltUpdate(logo.id, e.target.value)}
                    className="text-xs h-8"
                  />
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                      >
                        <ArrowUp size={12} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === sorted.length - 1}
                      >
                        <ArrowDown size={12} />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(logo.id, logo.content_key)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageUploadPreviewDialog
        open={previewOpen}
        files={pendingFiles}
        guidance={guidance}
        title="Preview logo crop"
        description="Check the visible logo framing at the recommended website ratio before upload."
        confirmLabel={`Upload ${pendingFiles.length || ""} logo${pendingFiles.length === 1 ? "" : "s"}`.trim()}
        isSubmitting={uploading}
        optimizeUploads={optimizeUploads}
        onCancel={() => {
          setPreviewOpen(false);
          setPendingFiles([]);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onOptimizeUploadsChange={setOptimizeUploads}
        onConfirm={handleUpload}
      />
    </div>
  );
};

export default TrustedLogosEditor;
