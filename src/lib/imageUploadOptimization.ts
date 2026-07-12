const WEBP_QUALITY = 0.82;

const WEBP_CONVERTIBLE_TYPES = new Set(["image/jpeg", "image/png"]);

const fileToObjectUrl = (file: File) => URL.createObjectURL(file);

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = fileToObjectUrl(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to optimize \"${file.name}\".`));
    };

    image.src = objectUrl;
  });

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", WEBP_QUALITY);
  });

export const canConvertImageToWebP = (file: File) => WEBP_CONVERTIBLE_TYPES.has(file.type);

export const optimizeImageForUpload = async (file: File, enabled: boolean) => {
  if (!enabled || !canConvertImageToWebP(file)) return file;

  try {
    const image = await loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas);

    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
};