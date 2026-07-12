import { ReactNode } from "react";
import { useImageOverride } from "@/hooks/useImageOverride";
import { getMediaAssetKind } from "@/lib/mediaAsset";

interface VisualSlotProps {
  page: string;
  /** Unique key under page/section=overrides */
  slotKey: string;
  /** Animated default rendered when no override is set */
  children: ReactNode;
  alt?: string;
  /** Tailwind classes applied to the override <img> wrapper */
  className?: string;
  imgClassName?: string;
}

/**
 * Wraps an animated illustration. If the admin uploaded an image for this slot
 * (page=<page>, section=overrides, content_key=<slotKey>, type=image_url),
 * shows that image instead of the children.
 */
const VisualSlot = ({
  page,
  slotKey,
  children,
  alt = "",
  className = "w-full",
  imgClassName = "w-full h-auto rounded-2xl object-contain",
}: VisualSlotProps) => {
  const override = useImageOverride(page, slotKey);
  if (override) {
    return (
      <div className={className}>
        {getMediaAssetKind(override) === "video" ? (
          <video src={override} aria-label={alt} className={imgClassName} controls playsInline preload="metadata" />
        ) : (
          <img src={override} alt={alt} className={imgClassName} loading="lazy" />
        )}
      </div>
    );
  }
  return <>{children}</>;
};

export default VisualSlot;
