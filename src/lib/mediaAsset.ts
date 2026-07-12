import type { ImageUploadGuidance } from "@/lib/imageUploadGuidance";
import { validateImageFile, validateImageFileWithDimensions } from "@/lib/imageUploadGuidance";

export type MediaAssetKind = "image" | "gif" | "video";

export const MEDIA_VIDEO_MAX_BYTES = 30 * 1024 * 1024;
export const MEDIA_GIF_MAX_BYTES = 20 * 1024 * 1024;
export const MEDIA_FILE_ACCEPT = "image/*,video/*";

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v", "ogg", "ogv"]);

const getExtension = (value: string) => value.split(".").pop()?.toLowerCase() ?? "";

export const getMediaAssetKind = (path: string, mimeType?: string): MediaAssetKind => {
  if (mimeType?.startsWith("video/")) return "video";
  if (mimeType === "image/gif") return "gif";

  const extension = getExtension(path);
  if (extension === "gif") return "gif";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";

  return "image";
};

export const validateMediaUpload = async (file: File, guidance: ImageUploadGuidance) => {
  const kind = getMediaAssetKind(file.name, file.type);

  if (kind === "video") {
    if (file.size > MEDIA_VIDEO_MAX_BYTES) {
      return `"${file.name}" is too large. Maximum size is 30 MB for videos.`;
    }

    if (!file.type.startsWith("video/")) {
      return `"${file.name}" is not a supported video file.`;
    }

    return null;
  }

  if (kind === "gif") {
    return validateImageFile(file, {
      ...guidance,
      maxBytes: Math.max(guidance.maxBytes, MEDIA_GIF_MAX_BYTES),
    });
  }

  return validateImageFileWithDimensions(file, guidance);
};