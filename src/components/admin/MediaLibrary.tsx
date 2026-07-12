import { useState, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, Copy, ImageIcon, Loader2, Search, Film, Download, FileSpreadsheet, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { assessUploadedImage, formatUploadBytes, getImageUploadGuidance, loadImageDimensions } from "@/lib/imageUploadGuidance";
import ImageUploadPreviewDialog from "./ImageUploadPreviewDialog";
import { optimizeImageForUpload } from "@/lib/imageUploadOptimization";
import { getMediaAssetKind, MEDIA_FILE_ACCEPT, validateMediaUpload } from "@/lib/mediaAsset";

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size?: number;
  created_at?: string;
   contentType?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Media Library — browse, upload, copy URL, and delete files in cms-images bucket.
 */
const MediaLibrary = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [optimizeUploads, setOptimizeUploads] = useState(true);
  const guidance = getImageUploadGuidance("general");

  const [folderFilter, setFolderFilter] = useState<string>("all");

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["media-library"],
    queryFn: async (): Promise<MediaFile[]> => {
      // Recursively walk all folders inside cms-images (BFS)
      const all: MediaFile[] = [];
      const queue: string[] = [""];
      const visited = new Set<string>();
      while (queue.length) {
        const folder = queue.shift() as string;
        if (visited.has(folder)) continue;
        visited.add(folder);
        const { data, error } = await supabase.storage
          .from("cms-images")
          .list(folder, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
        if (error) continue;
        for (const f of data ?? []) {
          if (!f.name || f.name === ".emptyFolderPlaceholder") continue;
          const fullPath = folder ? `${folder}/${f.name}` : f.name;
          if (!f.metadata) {
            // Subfolder — enqueue
            queue.push(fullPath);
            continue;
          }
          const { data: pub } = supabase.storage.from("cms-images").getPublicUrl(fullPath);
          all.push({
            name: f.name,
            path: fullPath,
            url: pub.publicUrl,
            size: (f.metadata as any)?.size,
            created_at: f.created_at,
            contentType: (f.metadata as any)?.mimetype,
          });
        }
      }
      return Promise.all(
        all.map(async (file) => ({
          ...file,
          dimensions:
            getMediaAssetKind(file.path, file.contentType) === "video"
              ? undefined
              : await loadImageDimensions(file.url),
        })),
      );
    },
  });

  // Build folder list dynamically from discovered files
  const folders = useMemo(() => {
    const set = new Set<string>(["root"]);
    for (const f of files) {
      if (f.path.includes("/")) {
        const parts = f.path.split("/");
        parts.pop();
        // accumulate nested folders e.g. integrations, integrations/logos
        let acc = "";
        for (const p of parts) {
          acc = acc ? `${acc}/${p}` : p;
          set.add(acc);
        }
      }
    }
    return Array.from(set).sort();
  }, [files]);

  const handleUpload = async (picked: File[]) => {
    if (!picked.length) return;
    const validations = await Promise.all(picked.map((file) => validateMediaUpload(file, guidance)));
    const firstError = validations.find(Boolean);
    if (firstError) {
      toast({ title: "Upload blocked", description: firstError, variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      for (let i = 0; i < picked.length; i++) {
        const originalFile = picked[i];
        const file = getMediaAssetKind(originalFile.name, originalFile.type) === "image"
          ? await optimizeImageForUpload(originalFile, optimizeUploads)
          : originalFile;
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const path = `${Date.now()}-${i}-${safeName}`;
        const { error } = await supabase.storage
          .from("cms-images")
          .upload(path, file, { upsert: true });
        if (error) throw error;
      }
      toast({ title: `Uploaded ${picked.length} file(s)` });
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      setPreviewOpen(false);
      setPendingFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFilesPicked = (uploaded: FileList | null) => {
    if (!uploaded || !uploaded.length) return;
    const nextFiles = Array.from(uploaded);
    setPendingFiles(nextFiles);
    const hasOnlyImages = nextFiles.every((file) => getMediaAssetKind(file.name, file.type) !== "video");
    setPreviewOpen(hasOnlyImages);
    if (!hasOnlyImages) {
      void handleUpload(nextFiles);
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm(`Delete ${path}? This cannot be undone.`)) return;
    const { error } = await supabase.storage.from("cms-images").remove([path]);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "File deleted" });
    queryClient.invalidateQueries({ queryKey: ["media-library"] });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copied to clipboard" });
  };

  const filtered = files.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.path.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (folderFilter === "all") return true;
    if (folderFilter === "root") return !f.path.includes("/");
    return f.path.startsWith(`${folderFilter}/`);
  });

  const exportCsv = () => {
    const header = ["name", "path", "folder", "url", "size_bytes", "size_human", "content_type", "created_at"];
    const rows = filtered.map((f) => {
      const folder = f.path.includes("/") ? f.path.substring(0, f.path.lastIndexOf("/")) : "root";
      return [
        f.name,
        f.path,
        folder,
        f.url,
        f.size ?? "",
        f.size ? formatSize(f.size) : "",
        f.contentType ?? "",
        f.created_at ?? "",
      ];
    });
    const escape = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `media-library-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${rows.length} file${rows.length === 1 ? "" : "s"} to CSV` });
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getAssessmentClasses = (tone: "success" | "warning" | "destructive") => {
    if (tone === "success") return "border-transparent bg-accent/15 text-foreground";
    if (tone === "destructive") return "border-transparent bg-destructive/15 text-destructive";
    return "border-transparent bg-secondary text-secondary-foreground";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-bold text-foreground">Media Library</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
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
            onClick={exportCsv}
            disabled={!files.length}
            variant="outline"
            className="gap-1"
            title="Export current filtered list as CSV"
          >
            <FileSpreadsheet size={14} /> CSV
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {/* Folder filter — discovered dynamically from storage */}
      {folders.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <FolderOpen size={14} className="text-muted-foreground" />
          <button
            onClick={() => setFolderFilter("all")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              folderFilter === "all"
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-card text-foreground/70 border-border hover:border-accent/40"
            }`}
          >
            All ({files.length})
          </button>
          {folders.map((folder) => {
            const count = files.filter((f) =>
              folder === "root" ? !f.path.includes("/") : f.path.startsWith(`${folder}/`),
            ).length;
            if (!count) return null;
            return (
              <button
                key={folder}
                onClick={() => setFolderFilter(folder)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  folderFilter === folder
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card text-foreground/70 border-border hover:border-accent/40"
                }`}
              >
                {folder} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-4 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Recommended:</span> {guidance.recommended} · <span className="font-medium text-foreground">Formats:</span> {guidance.formats} · <span className="font-medium text-foreground">Max:</span> {formatUploadBytes(guidance.maxBytes)}
        <div className="mt-1">{guidance.notes}</div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" aria-label="Loading media files">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden bg-card">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="p-2 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
                <div className="flex gap-1">
                  <Skeleton className="h-7 flex-1" />
                  <Skeleton className="h-7 w-7" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <ImageIcon size={40} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground mb-3">
            {search ? "No matching files" : "No files uploaded yet."}
          </p>
          {!search && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={14} className="mr-1" /> Upload your first file
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((file) => (
            (() => {
              const kind = getMediaAssetKind(file.path, file.contentType);
              const assessment = kind === "video"
                ? {
                    label: "Video",
                    tone: "warning" as const,
                    details: "Playable media asset for section backgrounds, demos, or embeds.",
                  }
                : assessUploadedImage({
                path: file.path,
                size: file.size,
                guidance,
                dimensions: file.dimensions,
              });

              return (
                <div
                  key={file.path}
                  className="group border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
                    {kind === "video" ? (
                      <div className="relative h-full w-full">
                        <video src={file.url} className="w-full h-full object-contain p-2" muted playsInline preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-background/10">
                          <Film size={18} className="text-accent" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-2 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-foreground truncate" title={file.path}>
                        {file.name}
                      </p>
                      <Badge className={getAssessmentClasses(assessment.tone)}>{assessment.label}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate" title={file.path}>
                      {file.path.includes("/") ? file.path.substring(0, file.path.lastIndexOf("/")) : "root"}
                    </p>
                    <div className="rounded-md border border-border/70 bg-muted/20 px-2 py-1.5 text-[10px] text-muted-foreground space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span>Final size</span>
                        <span className="text-foreground">{file.size ? formatSize(file.size) : "Unknown"}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span>Dimensions</span>
                        <span className="text-foreground">
                          {kind === "video" ? "Video" : file.dimensions ? `${file.dimensions.width}×${file.dimensions.height}px` : "Unknown"}
                        </span>
                      </div>
                      <div className="pt-1 text-[10px] leading-relaxed">{assessment.details}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs gap-1"
                        onClick={() => copyUrl(file.url)}
                      >
                        <Copy size={11} /> Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="h-7 w-7 p-0"
                        title="Download file"
                      >
                        <a href={file.url} download={file.name} target="_blank" rel="noreferrer">
                          <Download size={12} />
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(file.path)}
                        title="Delete file"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-6">
        {filtered.length} of {files.length} file{files.length === 1 ? "" : "s"}
      </p>

      <ImageUploadPreviewDialog
        open={previewOpen}
        files={pendingFiles}
        guidance={guidance}
        title="Preview website image crop"
        description="Confirm the recommended website crop before these files are uploaded to your library."
        confirmLabel={`Upload ${pendingFiles.length || ""} image${pendingFiles.length === 1 ? "" : "s"}`.trim()}
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

export default MediaLibrary;
