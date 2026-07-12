import { ReactNode, forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useEditMode } from "./EditModeContext";
import { useImageOverride } from "@/hooks/useImageOverride";
import { useSiteContent } from "@/hooks/useSiteContent";
import MediaPicker from "@/components/admin/MediaPicker";
import { getMediaAssetKind } from "@/lib/mediaAsset";

interface EditableImageProps {
  page: string;
  /** Unique key under page/section=overrides */
  slotKey: string;
  /** Animated default rendered when no override is set */
  children: ReactNode;
  alt?: string;
  className?: string;
  imgClassName?: string;
}

/**
 * Combines VisualSlot (display) with in-place "Change image" controls when
 * Edit Mode is on. Admins click "Change image" to pick from the media library.
 */
const EditableImage = forwardRef<HTMLDivElement, EditableImageProps>(({ 
  page,
  slotKey,
  children,
  alt = "",
  className = "w-full",
  imgClassName = "w-full h-auto rounded-2xl object-contain",
}, forwardedRef) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { enabled, stageChange, getStaged } = useEditMode();
  const savedOverride = useImageOverride(page, slotKey);
  const staged = getStaged(page, "overrides", slotKey, "en");
  // Staged "" means user is clearing the override
  const override = staged !== undefined ? staged : savedOverride;

  // CMS-managed alt text (set in admin SEO editor) overrides the prop
  const { getContent } = useSiteContent(page, "overrides");
  const cmsAlt = getContent(`${slotKey}__alt`, "");
  const finalAlt = cmsAlt || alt;

  const [pickerOpen, setPickerOpen] = useState(false);

  useImperativeHandle(forwardedRef, () => rootRef.current, []);

  const setUrl = (url: string) => {
    stageChange({
      page,
      section: "overrides",
      content_key: slotKey,
      content_type: "image_url",
      lang: "en",
      value: url,
    });
  };

  const showOverride = !!override;

  return (
    <div ref={rootRef} className={`${enabled ? "relative group/edit" : ""}`}>
      {showOverride ? (
        <div className={className}>
          {getMediaAssetKind(override) === "video" ? (
            <video src={override} aria-label={finalAlt} className={imgClassName} controls playsInline preload="metadata" />
          ) : (
            <img src={override} alt={finalAlt} className={imgClassName} loading="lazy" />
          )}
        </div>
      ) : (
        children
      )}

      {enabled && (
        <>
          {/* Hover overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl outline-dashed outline-2 outline-offset-2 outline-accent/60 group-hover/edit:outline-accent transition-colors" />
          <div className="absolute top-2 right-2 z-20 flex gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPickerOpen(true);
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-md px-2.5 py-1.5 text-xs font-medium shadow-lg flex items-center gap-1"
            >
              <ImagePlus size={12} />
               {showOverride ? "Change" : "Add media"}
            </button>
            {showOverride && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUrl("");
                }}
                className="bg-background hover:bg-destructive hover:text-destructive-foreground rounded-md p-1.5 shadow-lg border border-border"
                title="Remove image (revert to animation)"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </>
      )}

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(url) => setUrl(url)}
        uploadFolder={page}
         title="Choose media"
      />
    </div>
  );
});

EditableImage.displayName = "EditableImage";

export default EditableImage;
