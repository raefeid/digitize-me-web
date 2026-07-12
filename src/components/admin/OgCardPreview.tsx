import { useState } from "react";
import { ImageOff, Globe, Share2, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * OgCardPreview — interactive preview of how a page renders as a social
 * card on LinkedIn, Facebook/Slack, and X/Twitter, using the same fields
 * (seo_title, seo_description, seo_og_image) that get baked into <meta>
 * tags at publish time. Designed to live inside the SEO inspector panel.
 */

type Platform = "linkedin" | "facebook" | "twitter";

type Props = {
  title: string;
  description: string;
  ogImage: string;
  slug: string;
  siteOrigin?: string;
  fallbackTitle?: string;
};

const PLATFORM_META: Record<Platform, { label: string; icon: typeof Globe; titleMax: number; descMax: number }> = {
  linkedin: { label: "LinkedIn", icon: Share2, titleMax: 70, descMax: 160 },
  facebook: { label: "Facebook / Slack", icon: Globe, titleMax: 60, descMax: 110 },
  twitter: { label: "X (Twitter)", icon: AtSign, titleMax: 70, descMax: 125 },
};

const truncate = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…");

const OgCardPreview = ({ title, description, ogImage, slug, siteOrigin, fallbackTitle }: Props) => {
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [imgError, setImgError] = useState(false);

  const origin = siteOrigin ?? (typeof window !== "undefined" ? window.location.origin : "https://example.com");
  const host = origin.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = slug ? `${origin.replace(/\/$/, "")}/${slug}` : origin;

  const meta = PLATFORM_META[platform];
  const displayTitle = truncate(title || fallbackTitle || "Untitled page", meta.titleMax);
  const displayDesc = description ? truncate(description, meta.descMax) : "";
  const hasImage = ogImage && /^https?:\/\//i.test(ogImage) && !imgError;

  // Reset image error when source changes
  if (hasImage === false && imgError && !ogImage) setImgError(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Social preview</p>
        <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
          {(Object.keys(PLATFORM_META) as Platform[]).map((p) => {
            const Icon = PLATFORM_META[p].icon;
            const active = platform === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                title={PLATFORM_META[p].label}
                className={`p-1 rounded transition ${
                  active ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3 h-3" />
              </button>
            );
          })}
        </div>
      </div>

      {platform === "twitter" ? (
        <TwitterCard
          host={host}
          url={url}
          displayTitle={displayTitle}
          displayDesc={displayDesc}
          ogImage={hasImage ? ogImage : null}
          onImgError={() => setImgError(true)}
        />
      ) : (
        <FacebookLikeCard
          host={host}
          displayTitle={displayTitle}
          displayDesc={displayDesc}
          ogImage={hasImage ? ogImage : null}
          variant={platform}
          onImgError={() => setImgError(true)}
        />
      )}

      <p className="text-[10px] text-muted-foreground">
        Live preview using meta title, description, and OG image. Actual rendering may vary slightly per platform.
      </p>
    </div>
  );
};

const ImagePlaceholder = ({ className }: { className?: string }) => (
  <div
    className={`flex flex-col items-center justify-center gap-1 bg-muted/60 text-muted-foreground ${className ?? ""}`}
  >
    <ImageOff className="w-5 h-5" />
    <span className="text-[10px]">No OG image</span>
  </div>
);

const FacebookLikeCard = ({
  host,
  displayTitle,
  displayDesc,
  ogImage,
  variant,
  onImgError,
}: {
  host: string;
  displayTitle: string;
  displayDesc: string;
  ogImage: string | null;
  variant: "linkedin" | "facebook";
  onImgError: () => void;
}) => (
  <div className="rounded-md border border-border overflow-hidden bg-card shadow-sm">
    {ogImage ? (
      <div className="aspect-[1.91/1] bg-muted overflow-hidden">
        <img src={ogImage} alt="" className="w-full h-full object-cover" onError={onImgError} loading="lazy" />
      </div>
    ) : (
      <ImagePlaceholder className="aspect-[1.91/1]" />
    )}
    <div className={`px-3 py-2 ${variant === "linkedin" ? "bg-muted/30" : "bg-card"}`}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground truncate">{host}</p>
      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug mt-0.5">{displayTitle}</p>
      {displayDesc && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-snug">{displayDesc}</p>
      )}
    </div>
  </div>
);

const TwitterCard = ({
  host,
  url,
  displayTitle,
  displayDesc,
  ogImage,
  onImgError,
}: {
  host: string;
  url: string;
  displayTitle: string;
  displayDesc: string;
  ogImage: string | null;
  onImgError: () => void;
}) => (
  <div className="rounded-2xl border border-border overflow-hidden bg-card relative">
    {ogImage ? (
      <div className="aspect-[2/1] bg-muted overflow-hidden">
        <img src={ogImage} alt="" className="w-full h-full object-cover" onError={onImgError} loading="lazy" />
      </div>
    ) : (
      <ImagePlaceholder className="aspect-[2/1]" />
    )}
    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] truncate max-w-[80%]">
      {displayTitle}
    </div>
    <div className="px-3 py-1.5 bg-card text-[10px] text-muted-foreground truncate">From {host}</div>
  </div>
);

export default OgCardPreview;
