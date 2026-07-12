import { ReactNode, forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ImagePlus, X, Sparkles, Upload, RotateCcw, icons as lucideIcons } from "lucide-react";
import { useEditMode } from "./EditModeContext";
import { useImageOverride } from "@/hooks/useImageOverride";
import MediaPicker from "@/components/admin/MediaPicker";
import LucideIconPicker from "./LucideIconPicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EditableIconProps {
  page: string;
  /** Unique slot key under page/section=overrides (e.g. "ind_law-firms_icon") */
  slotKey: string;
  /** The original Lucide icon (or any node) shown when no override is set */
  children: ReactNode;
  /** Tailwind classes applied to the override <img> */
  imgClassName?: string;
  /** Pixel size used for the uploaded icon if no className overrides it */
  size?: number;
}

const LUCIDE_PREFIX = "lucide:";

/**
 * Wraps any icon (typically a Lucide component) so admins can replace it with
 * either:
 *   1. Another Lucide icon picked from the built-in 1,700+ icon library, OR
 *   2. An uploaded SVG/PNG via the MediaPicker
 *
 * Storage:
 *   - Lucide overrides are saved as `lucide:IconName` (text)
 *   - Image overrides are saved as a public URL (image_url)
 *   - Both share the same slot key under section="overrides"
 *
 * The stored value's prefix decides how it's rendered.
 */
const EditableIcon = forwardRef<HTMLSpanElement, EditableIconProps>(({ 
  page,
  slotKey,
  children,
  imgClassName,
  size = 24,
}, forwardedRef) => {
  const rootRef = useRef<HTMLSpanElement>(null);
  const { enabled, stageChange, getStaged } = useEditMode();
  const savedOverride = useImageOverride(page, slotKey);
  // Staged value can be either text (lucide:Name or "") or image URL.
  // We check both image_url and text staged values; image_url wins if both exist.
  const stagedImage = getStaged(page, "overrides", slotKey, "en");
  const override = stagedImage !== undefined ? stagedImage : savedOverride;

  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useImperativeHandle(forwardedRef, () => rootRef.current, []);

  const isLucide = !!override && override.startsWith(LUCIDE_PREFIX);
  const lucideName = isLucide ? override!.slice(LUCIDE_PREFIX.length) : null;
  const LucideOverride = lucideName ? lucideIcons[lucideName as keyof typeof lucideIcons] : null;
  const showImage = !!override && !isLucide;

  const setLucide = (name: string) => {
    stageChange({
      page,
      section: "overrides",
      content_key: slotKey,
      content_type: "text",
      lang: "en",
      value: `${LUCIDE_PREFIX}${name}`,
    });
  };

  const setImage = (url: string) => {
    stageChange({
      page,
      section: "overrides",
      content_key: slotKey,
      content_type: "image_url",
      lang: "en",
      value: url,
    });
  };

  const reset = () => {
    // Stage an empty value to remove the override
    stageChange({
      page,
      section: "overrides",
      content_key: slotKey,
      content_type: "image_url",
      lang: "en",
      value: "",
    });
  };

  // Renders the active override (lucide or image) or the original children
  const renderActiveIcon = () => {
    if (LucideOverride) {
      return <LucideOverride size={size} className="text-accent" />;
    }
    if (showImage) {
      return (
        <img
          src={override!}
          alt=""
          width={size}
          height={size}
          className={imgClassName ?? "object-contain"}
          style={imgClassName ? undefined : { width: size, height: size }}
          loading="lazy"
        />
      );
    }
    return <>{children}</>;
  };

  // Read-only mode
  if (!enabled) {
    return <>{renderActiveIcon()}</>;
  }

  // Edit mode: hover overlay + popover with action choices
  return (
    <span ref={rootRef} className="relative inline-flex items-center justify-center group/icon-edit">
      {renderActiveIcon()}

      <span className="absolute inset-0 outline-dashed outline-1 outline-offset-2 outline-accent/50 group-hover/icon-edit:outline-accent rounded-sm pointer-events-none" />

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full p-0.5 shadow-lg opacity-0 group-hover/icon-edit:opacity-100 transition-opacity z-10"
            title="Change icon"
          >
            <ImagePlus size={10} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="bottom"
          className="w-52 p-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setPopoverOpen(false);
              setIconPickerOpen(true);
            }}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent/10 hover:text-accent text-foreground transition-colors text-left"
          >
            <Sparkles size={14} className="text-accent shrink-0" />
            <div className="min-w-0">
              <div className="font-medium">Pick from library</div>
              <div className="text-[10px] text-muted-foreground">1,700+ Lucide icons</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              setPopoverOpen(false);
              setImagePickerOpen(true);
            }}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent/10 hover:text-accent text-foreground transition-colors text-left"
          >
            <Upload size={14} className="text-accent shrink-0" />
            <div className="min-w-0">
              <div className="font-medium">Upload image</div>
              <div className="text-[10px] text-muted-foreground">SVG / PNG</div>
            </div>
          </button>
          {!!override && (
            <>
              <div className="h-px bg-border my-1" />
              <button
                type="button"
                onClick={() => {
                  setPopoverOpen(false);
                  reset();
                }}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-destructive/10 hover:text-destructive text-foreground transition-colors text-left"
              >
                <RotateCcw size={14} className="shrink-0" />
                <div className="font-medium">Reset to original</div>
              </button>
            </>
          )}
        </PopoverContent>
      </Popover>

      {/* Quick reset (X) — only when an override is set */}
      {!!override && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            reset();
          }}
          className="absolute -bottom-2 -right-2 bg-background text-foreground hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 shadow-lg border border-border opacity-0 group-hover/icon-edit:opacity-100 transition-opacity z-10"
          title="Reset to original icon"
        >
          <X size={10} />
        </button>
      )}

      <LucideIconPicker
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        value={lucideName}
        onSelect={setLucide}
      />

      <MediaPicker
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onSelect={(url) => setImage(url)}
        uploadFolder={`${page}/icons`}
        title="Upload or choose icon image"
      />
    </span>
  );
});

EditableIcon.displayName = "EditableIcon";

export default EditableIcon;
