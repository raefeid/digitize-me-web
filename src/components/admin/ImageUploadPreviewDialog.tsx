import { useEffect, useMemo, useState } from "react";
import { ImageIcon, Move, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { type ImageUploadGuidance, formatUploadBytes } from "@/lib/imageUploadGuidance";
import ImageOptimizationToggle from "./ImageOptimizationToggle";

type PreviewFile = {
  file: File;
  previewUrl: string;
  focusX: number;
  focusY: number;
};

interface ImageUploadPreviewDialogProps {
  open: boolean;
  files: File[];
  guidance: ImageUploadGuidance;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  optimizeUploads?: boolean;
  onCancel: () => void;
  onOptimizeUploadsChange?: (checked: boolean) => void;
  onConfirm: (files: File[]) => void | Promise<void>;
}

const ImageUploadPreviewDialog = ({
  open,
  files,
  guidance,
  title = "Confirm image crop",
  description = "Preview the exact recommended crop before uploading.",
  confirmLabel = "Use this image",
  isSubmitting = false,
  optimizeUploads = false,
  onCancel,
  onOptimizeUploadsChange,
  onConfirm,
}: ImageUploadPreviewDialogProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);

  useEffect(() => {
    if (!open || files.length === 0) {
      setPreviewFiles((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        return [];
      });
      setSelectedIndex(0);
      return;
    }

    const next = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      focusX: 50,
      focusY: 50,
    }));

    setPreviewFiles((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return next;
    });
    setSelectedIndex(0);

    return () => {
      next.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [files, open]);

  const activeItem = previewFiles[selectedIndex];

  const focusStyle = useMemo(
    () => ({ objectPosition: `${activeItem?.focusX ?? 50}% ${activeItem?.focusY ?? 50}%` }),
    [activeItem?.focusX, activeItem?.focusY],
  );

  const updateFocus = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!activeItem) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPreviewFiles((prev) =>
      prev.map((item, index) =>
        index === selectedIndex
          ? {
              ...item,
              focusX: Math.max(0, Math.min(100, x)),
              focusY: Math.max(0, Math.min(100, y)),
            }
          : item,
      ),
    );
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent className="max-w-5xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Recommended:</span> {guidance.recommended} ·{" "}
          <span className="font-medium text-foreground">Aspect ratio:</span> {guidance.aspectRatioLabel} ·{" "}
          <span className="font-medium text-foreground">Formats:</span> {guidance.formats} ·{" "}
          <span className="font-medium text-foreground">Max:</span> {formatUploadBytes(guidance.maxBytes)}
          <div className="mt-1">{guidance.notes}</div>
        </div>

        {onOptimizeUploadsChange ? (
          <ImageOptimizationToggle
            checked={optimizeUploads}
            disabled={isSubmitting}
            onCheckedChange={onOptimizeUploadsChange}
          />
        ) : null}

        {activeItem ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Website crop preview</p>
                    <p className="text-xs text-muted-foreground">This shows the exact recommended frame.</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{guidance.aspectRatioLabel}</span>
                </div>
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <AspectRatio ratio={guidance.aspectRatio}>
                    <img
                      src={activeItem.previewUrl}
                      alt={activeItem.file.name}
                      className="h-full w-full object-cover"
                      style={focusStyle}
                    />
                  </AspectRatio>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Move size={14} className="text-accent" />
                  Choose the focal area
                </div>
                <p className="text-xs text-muted-foreground">
                  Click anywhere on the full image to center the preview crop around that area.
                </p>
                <button
                  type="button"
                  onClick={updateFocus}
                  className="relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-3"
                >
                  <img
                    src={activeItem.previewUrl}
                    alt={activeItem.file.name}
                    className="max-h-[24rem] w-auto max-w-full object-contain"
                  />
                  <span
                    className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-accent shadow-sm"
                    style={{ left: `${activeItem.focusX}%`, top: `${activeItem.focusY}%` }}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">Selected file</p>
                <p className="mt-1 break-all text-xs text-muted-foreground">{activeItem.file.name}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Original file uploads unchanged — this step helps you confirm the visible crop before saving.
                </p>
              </div>

              {previewFiles.length > 1 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Files to review</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {previewFiles.map((item, index) => (
                      <button
                        key={`${item.file.name}-${index}`}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        className={`overflow-hidden rounded-lg border bg-card transition-colors ${
                          selectedIndex === index ? "border-accent ring-2 ring-accent" : "border-border"
                        }`}
                      >
                        <AspectRatio ratio={1}>
                          <img src={item.previewUrl} alt={item.file.name} className="h-full w-full object-cover" />
                        </AspectRatio>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <ImageIcon size={14} className="text-accent" />
                  What this checks
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>The visible crop at the recommended website ratio</li>
                  <li>Whether the subject stays centered on the page</li>
                  <li>Whether the image feels too tight before upload</li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onConfirm(files)} disabled={files.length === 0 || isSubmitting} className="gap-1 bg-accent text-accent-foreground hover:bg-accent/90">
            <Upload size={14} />
            {isSubmitting ? "Uploading..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadPreviewDialog;