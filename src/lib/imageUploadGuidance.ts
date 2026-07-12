export type ImageUploadGuidance = {
  label: string;
  recommended: string;
  formats: string;
  maxBytes: number;
  notes: string;
  aspectRatio: number;
  aspectRatioLabel: string;
  recommendedWidth: number;
  recommendedHeight: number;
  preferredFormats: string[];
};

export type UploadedImageAssessment = {
  label: string;
  tone: "success" | "warning" | "destructive";
  details: string;
  dimensions?: { width: number; height: number };
};

const MB = 1024 * 1024;

const GUIDANCE: Record<string, ImageUploadGuidance> = {
  general: {
    label: "Website images",
    recommended: "1600×900px",
    formats: "JPG, PNG, or WebP",
    maxBytes: 10 * MB,
    notes: "Use WebP for smaller files; keep the main subject centered for responsive crops.",
    aspectRatio: 16 / 9,
    aspectRatioLabel: "16:9",
    recommendedWidth: 1600,
    recommendedHeight: 900,
    preferredFormats: ["webp", "jpg", "jpeg"],
  },
  logo: {
    label: "Logos",
    recommended: "320×160px",
    formats: "SVG, PNG, or WebP",
    maxBytes: 3 * MB,
    notes: "Prefer transparent backgrounds and wide horizontal artwork for best results.",
    aspectRatio: 2,
    aspectRatioLabel: "2:1",
    recommendedWidth: 320,
    recommendedHeight: 160,
    preferredFormats: ["svg", "webp", "png"],
  },
  og: {
    label: "Social share images",
    recommended: "1200×630px",
    formats: "JPG, PNG, or WebP",
    maxBytes: 5 * MB,
    notes: "Keep important text away from the edges so previews crop cleanly on social platforms.",
    aspectRatio: 1200 / 630,
    aspectRatioLabel: "1.91:1",
    recommendedWidth: 1200,
    recommendedHeight: 630,
    preferredFormats: ["webp", "jpg", "jpeg", "png"],
  },
  blog: {
    label: "Article images",
    recommended: "1600×900px",
    formats: "JPG, PNG, or WebP",
    maxBytes: 8 * MB,
    notes: "Landscape images work best inside content blocks and card layouts.",
    aspectRatio: 16 / 9,
    aspectRatioLabel: "16:9",
    recommendedWidth: 1600,
    recommendedHeight: 900,
    preferredFormats: ["webp", "jpg", "jpeg"],
  },
};

export const formatUploadBytes = (bytes: number) => {
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / MB).toFixed(bytes % MB === 0 ? 0 : 1)} MB`;
};

export const getImageUploadGuidance = (context?: string): ImageUploadGuidance => {
  const key = (context ?? "").toLowerCase();

  if (key.includes("logo") || key.includes("trusted-logos")) return GUIDANCE.logo;
  if (key.includes("seo") || key.includes("og") || key.includes("social") || key.includes("share")) return GUIDANCE.og;
  if (key.includes("blog")) return GUIDANCE.blog;

  return GUIDANCE.general;
};

export const validateImageFile = (file: File, guidance: ImageUploadGuidance) => {
  if (file.size > guidance.maxBytes) {
    return `\"${file.name}\" is too large. Maximum size is ${formatUploadBytes(guidance.maxBytes)}.`;
  }

  if (!file.type.startsWith("image/")) {
    return `\"${file.name}\" is not a supported image file.`;
  }

  return null;
};

const getImageDimensions = (file: File) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };

    image.onerror = () => {
      reject(new Error(`Unable to read dimensions for \"${file.name}\".`));
      URL.revokeObjectURL(objectUrl);
    };

    image.src = objectUrl;
  });

export const validateImageFileWithDimensions = async (file: File, guidance: ImageUploadGuidance) => {
  const basicError = validateImageFile(file, guidance);
  if (basicError) return basicError;

  const { width, height } = await getImageDimensions(file);
  if (width !== guidance.recommendedWidth || height !== guidance.recommendedHeight) {
    return `\"${file.name}\" must be exactly ${guidance.recommendedWidth}×${guidance.recommendedHeight}px. Uploaded image is ${width}×${height}px.`;
  }

  return null;
};

const getFileExtension = (path: string) => path.split(".").pop()?.toLowerCase() ?? "";

export const loadImageDimensions = (src: string) =>
  new Promise<{ width: number; height: number } | undefined>((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(undefined);
    image.src = src;
  });

export const assessUploadedImage = ({
  path,
  size,
  guidance,
  dimensions,
}: {
  path: string;
  size?: number;
  guidance: ImageUploadGuidance;
  dimensions?: { width: number; height: number };
}): UploadedImageAssessment => {
  const extension = getFileExtension(path);
  const sizeOk = typeof size !== "number" || size <= guidance.maxBytes;
  const formatPreferred = guidance.preferredFormats.includes(extension);
  const dimensionsExact =
    !dimensions ||
    (dimensions.width === guidance.recommendedWidth && dimensions.height === guidance.recommendedHeight);

  if (sizeOk && formatPreferred && dimensionsExact) {
    return {
      label: "Optimized",
      tone: "success",
      details: `Meets ${guidance.recommended}, stays under ${formatUploadBytes(guidance.maxBytes)}, and uses an SEO-friendly format.`,
      dimensions,
    };
  }

  if (!sizeOk) {
    return {
      label: "Too large",
      tone: "destructive",
      details: `File exceeds the ${formatUploadBytes(guidance.maxBytes)} limit for ${guidance.label.toLowerCase()}.`,
      dimensions,
    };
  }

  const issues: string[] = [];
  if (!dimensionsExact) issues.push(`resize to ${guidance.recommended}`);
  if (!formatPreferred) issues.push(`convert to ${guidance.preferredFormats[0].toUpperCase()}`);

  return {
    label: issues.length > 0 ? "Needs optimization" : "Check image",
    tone: "warning",
    details: issues.length > 0 ? `Recommended: ${issues.join(" and ")}.` : guidance.notes,
    dimensions,
  };
};