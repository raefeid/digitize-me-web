import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, ImageIcon, Loader2, Search, Check, X, Film, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatUploadBytes, getImageUploadGuidance } from "@/lib/imageUploadGuidance";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import ImageOptimizationToggle from "./ImageOptimizationToggle";
import { optimizeImageForUpload } from "@/lib/imageUploadOptimization";
import { getMediaAssetKind, MEDIA_FILE_ACCEPT, validateMediaUpload } from "@/lib/mediaAsset";

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size?: number;
  /** Custom alt description stored as user metadata on the storage object */
  alt?: string;
  contentType?: string;
}

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (url: string, alt?: string) => void;
  /** Optional folder to upload into when uploading new files via this picker */
  uploadFolder?: string;
  title?: string;
}

/** Sanitize a filename — keeps the extension and replaces illegal chars. */
const sanitizeName = (raw: string, originalExt: string) => {
  const base = raw.trim().replace(/\.[^.]+$/, "");
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "image";
  return `${slug}.${originalExt.toLowerCase()}`;
};

/** Pending upload sitting in the rename/alt step. */
interface PendingUpload {
  file: File;
  /** Filename without extension that the admin can edit */
  baseName: string;
  /** Original extension preserved across renames */
  ext: string;
  /** SEO alt text */
  alt: string;
  previewUrl: string;
  kind: "image" | "gif" | "video";
}

/**
 * Modal media library picker.
 * - Browse all images already in the cms-images bucket
 * - Search by filename
 * - Upload new images with custom filename + SEO alt text (stored in metadata)
 * - Click any image to insert its public URL via onSelect
 */
const MediaPicker = ({
  open,
  onOpenChange,
  onSelect,
  uploadFolder = "",
  title = "Choose an image",
}: MediaPickerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingUpload[] | null>(null);
  const [optimizeUploads, setOptimizeUploads] = useState(true);
  const guidance = getImageUploadGuidance(uploadFolder || title);

  // Revoke blob URLs when the pending list changes/unmounts
  useEffect(() => {
    return () => {
      pending?.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["media-library"],
    queryFn: async (): Promise<MediaFile[]> => {
      const folders = ["", "blog", "trusted-logos", "home", "product", "pricing", "contact", "industries"];
      const all: MediaFile[] = [];
      for (const folder of folders) {
        const { data, error } = await supabase.storage
          .from("cms-images")
          .list(folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
        if (error) continue;
        for (const f of data ?? []) {
          if (!f.name || f.name === ".emptyFolderPlaceholder") continue;
          if (!f.metadata) continue;
          const path = folder ? `${folder}/${f.name}` : f.name;
          const { data: pub } = supabase.storage.from("cms-images").getPublicUrl(path);
          // user-defined metadata is exposed under `user_metadata` on list rows
           const alt =
            (f as any)?.user_metadata?.alt ??
            (f.metadata as any)?.alt ??
            undefined;
          all.push({
            name: f.name,
            path,
            url: pub.publicUrl,
            size: (f.metadata as any)?.size,
            alt,
            contentType: (f.metadata as any)?.mimetype,
          });
        }
      }
      return all;
    },
    enabled: open,
  });

  /** Step 1: user picked files → open the rename/alt form. */
  const handleFilesPicked = async (uploaded: FileList | null) => {
    if (!uploaded || !uploaded.length) return;
    const picked = Array.from(uploaded);
    const validations = await Promise.all(picked.map((file) => validateMediaUpload(file, guidance)));
    const firstError = validations.find(Boolean);
    if (firstError) {
      toast({ title: "Upload blocked", description: firstError, variant: "destructive" });
      return;
    }
    const next: PendingUpload[] = Array.from(uploaded).map((file) => {
      const dot = file.name.lastIndexOf(".");
      const ext = dot > -1 ? file.name.slice(dot + 1) : "png";
      const baseName = (dot > -1 ? file.name.slice(0, dot) : file.name)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "image";
      const kind = getMediaAssetKind(file.name, file.type);
      return {
        file,
        baseName,
        ext,
        alt: "",
        previewUrl: URL.createObjectURL(file),
        kind,
      };
    });
    setPending(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updatePending = (idx: number, patch: Partial<PendingUpload>) => {
    setPending((prev) => (prev ? prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)) : prev));
  };

  const cancelPending = () => {
    pending?.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPending(null);
  };

  /** Step 2: actually upload everything in `pending`. */
  const confirmUpload = async () => {
    if (!pending || !pending.length) return;
    // All items must have a non-empty alt? We allow empty alt (decorative) but warn.
    setUploading(true);
    try {
      let lastUrl = "";
      let lastAlt = "";
      for (let i = 0; i < pending.length; i++) {
        const item = pending[i];
         const optimizedFile = item.kind === "image"
           ? await optimizeImageForUpload(item.file, optimizeUploads)
           : item.file;
        const finalExt = optimizedFile.name.split(".").pop() || item.ext;
        const safeName = sanitizeName(item.baseName, finalExt);
        const folderPrefix = uploadFolder ? `${uploadFolder}/` : "";
        // Prefix with timestamp so two uploads with the same name don't clash
        const path = `${folderPrefix}${Date.now()}-${i}-${safeName}`;
        const { error } = await supabase.storage
          .from("cms-images")
          .upload(path, optimizedFile, {
            upsert: true,
            contentType: optimizedFile.type || undefined,
            metadata: { alt: item.alt },
          } as any);
        if (error) throw error;
        const { data: pub } = supabase.storage.from("cms-images").getPublicUrl(path);
        lastUrl = pub.publicUrl;
        lastAlt = item.alt;
      }
      toast({
         title: `Uploaded ${pending.length} file${pending.length === 1 ? "" : "s"}`,
        description: pending.length === 1 && lastAlt ? `Alt: "${lastAlt}"` : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      // Auto-select the just-uploaded file when only one was uploaded
      if (pending.length === 1) setSelected(lastUrl);
      setPending(null);
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const filtered = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.path.toLowerCase().includes(search.toLowerCase()) ||
    (f.alt ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const confirmSelection = () => {
    if (!selected) return;
    const file = files.find((f) => f.url === selected);
    // Prefer the saved alt text, fall back to the filename
    onSelect(selected, file?.alt || file?.name);
    onOpenChange(false);
    setSelected(null);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{pending ? "Add details before uploading" : title}</DialogTitle>
          <DialogDescription>
            {pending
               ? "Give each file a clean filename and alt description where relevant. Alt text is used for images and GIFs."
               : "Pick media from your library or upload a new image, GIF, or video."}
          </DialogDescription>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Recommended:</span> {guidance.recommended} · <span className="font-medium text-foreground">Formats:</span> {guidance.formats} · <span className="font-medium text-foreground">Max:</span> {formatUploadBytes(guidance.maxBytes)}
            <div className="mt-1">{guidance.notes}</div>
          </div>
        </DialogHeader>

        {/* === Upload details step === */}
        {pending ? (
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Batch upload specs:</span> {guidance.recommended} · <span className="font-medium text-foreground">Aspect ratio:</span> {guidance.aspectRatioLabel} · <span className="font-medium text-foreground">Max:</span> {formatUploadBytes(guidance.maxBytes)}
              <div className="mt-1">
                 Applies to all {pending.length} selected file{pending.length === 1 ? "" : "s"} before upload.
              </div>
            </div>
            <ImageOptimizationToggle
              checked={optimizeUploads}
              disabled={uploading}
              onCheckedChange={setOptimizeUploads}
            />
            {pending.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 border border-border rounded-lg p-3 bg-card"
              >
                <div className="w-44 shrink-0 space-y-2">
                  <div className="rounded-md overflow-hidden bg-muted/40 border border-border/60">
                    {item.kind === "video" ? (
                      <AspectRatio ratio={guidance.aspectRatio}>
                        <div className="relative flex h-full w-full items-center justify-center bg-muted/40">
                          <video src={item.previewUrl} className="h-full w-full object-cover" muted playsInline />
                          <div className="absolute inset-0 flex items-center justify-center bg-background/20">
                            <Play size={18} className="text-accent" />
                          </div>
                        </div>
                      </AspectRatio>
                    ) : (
                      <AspectRatio ratio={guidance.aspectRatio}>
                        <img
                          src={item.previewUrl}
                          alt="Crop preview"
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    )}
                  </div>
                  <div className="w-full h-24 rounded-md overflow-hidden bg-muted/40 border border-border/60 flex items-center justify-center">
                    {item.kind === "video" ? (
                      <video src={item.previewUrl} className="w-full h-full object-contain" muted playsInline controls={false} />
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt="Full preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {item.kind === "video" ? "Video preview" : "Website crop preview"} · {guidance.aspectRatioLabel}
                  </p>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Filename
                    </Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Input
                        value={item.baseName}
                        onChange={(e) => updatePending(idx, { baseName: e.target.value })}
                        placeholder="invoice-ocr-dashboard"
                        className="h-9 text-sm"
                      />
                      <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        .{item.ext.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Letters, numbers and dashes only. Used in the public URL.
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                       Alt description (SEO)
                    </Label>
                    <Textarea
                      value={item.alt}
                      onChange={(e) => updatePending(idx, { alt: e.target.value })}
                       placeholder={item.kind === "video" ? "Optional: describe the poster frame or clip context" : "Describe what the media shows — e.g. 'Digitize me OCR dashboard scanning an invoice'"}
                      rows={2}
                      className="text-sm mt-1"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                       {item.alt.length}/125 characters · used as alt text for images and GIFs.
                    </p>
                  </div>
                </div>
                {pending.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(item.previewUrl);
                      setPending((prev) => (prev ? prev.filter((_, i) => i !== idx) : prev));
                    }}
                    className="self-start text-muted-foreground hover:text-destructive transition-colors"
                    title="Remove from upload"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2 sticky top-0 bg-background pt-1 pb-2 z-10">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by filename or alt text..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                 accept={MEDIA_FILE_ACCEPT}
                className="hidden"
                onChange={(e) => handleFilesPicked(e.target.files)}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
                className="gap-1"
              >
                <Upload size={14} />
                 Upload media
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Loading library...</p>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                  <ImageIcon size={36} className="mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground mb-3">
                     {search ? "No matching media" : "No media yet — upload your first file."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filtered.map((file) => {
                     const isSelected = selected === file.url;
                     const kind = getMediaAssetKind(file.path, file.contentType);
                    return (
                      <button
                        key={file.path}
                        type="button"
                        onClick={() => setSelected(file.url)}
                        onDoubleClick={() => {
                          onSelect(file.url, file.alt || file.name);
                          onOpenChange(false);
                          setSelected(null);
                        }}
                        className={`group relative border rounded-lg overflow-hidden bg-card text-left transition-all ${
                          isSelected
                            ? "border-accent ring-2 ring-accent shadow-md"
                            : "border-border hover:border-accent/50"
                        }`}
                      >
                         <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden relative">
                           {kind === "video" ? (
                             <>
                               <video
                                 src={file.url}
                                 className="w-full h-full object-contain p-2"
                                 muted
                                 playsInline
                                 preload="metadata"
                               />
                               <div className="absolute inset-0 flex items-center justify-center bg-background/10">
                                 <Film size={18} className="text-accent" />
                               </div>
                             </>
                           ) : (
                             <img
                               src={file.url}
                               alt={file.alt || file.name}
                               className="w-full h-full object-contain p-2"
                               loading="lazy"
                             />
                           )}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-accent text-accent-foreground rounded-full p-1 shadow">
                            <Check size={12} />
                          </div>
                        )}
                        <div className="p-2 border-t border-border/50">
                          <p
                            className="text-[11px] font-medium text-foreground truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          {file.alt ? (
                            <p
                              className="text-[10px] text-accent truncate"
                              title={`Alt: ${file.alt}`}
                            >
                              alt: {file.alt}
                            </p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground">
                              {file.path.includes("/") ? file.path.split("/")[0] : "root"}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {pending
               ? `${pending.length} file${pending.length === 1 ? "" : "s"} ready to upload`
              : selected
                 ? "1 file selected"
                 : `${filtered.length} file${filtered.length === 1 ? "" : "s"}`}
          </p>
          <div className="flex gap-2">
            {pending ? (
              <>
                <Button variant="ghost" onClick={cancelPending} disabled={uploading}>
                  Back
                </Button>
                <Button
                  onClick={confirmUpload}
                  disabled={uploading || pending.length === 0}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                       <Upload size={14} /> Upload {pending.length} file
                       {pending.length === 1 ? "" : "s"}
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmSelection}
                  disabled={!selected}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                   Insert media
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPicker;
