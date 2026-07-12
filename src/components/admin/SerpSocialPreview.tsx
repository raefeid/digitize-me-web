import { useState } from "react";
import { Search as GoogleIcon, Globe } from "lucide-react";

/**
 * Live previews of how the page will appear on:
 *  - Google search results (SERP)
 *  - Facebook / LinkedIn share cards (large image preview)
 *  - X / Twitter card (compact)
 *
 * Pure presentational — fed by the SEO editor's local pending state so it
 * updates as the admin types, before saving.
 */

type Props = {
  pagePath: string;          // e.g. "/pricing"
  metaTitle: string;
  metaDescription: string;
  ogTitle?: string;          // falls back to metaTitle
  ogDescription?: string;    // falls back to metaDescription
  ogImage?: string;
  rtl?: boolean;             // when previewing Arabic content
};

const baseUrl = "https://www.digitizeme.ae";
const SITE_NAME = "Digitize me";

const truncate = (s: string, n: number) =>
  s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;

const buildBreadcrumb = (path: string): string[] => {
  const parts = path.replace(/^\//, "").split("/").filter(Boolean);
  if (parts.length === 0) return [baseUrl.replace(/^https?:\/\//, "")];
  return [
    baseUrl.replace(/^https?:\/\//, ""),
    ...parts.map((p) => p.replace(/-/g, " ")),
  ];
};

const SerpSocialPreview = ({
  pagePath,
  metaTitle,
  metaDescription,
  ogTitle,
  ogDescription,
  ogImage,
  rtl,
}: Props) => {
  const [tab, setTab] = useState<"google" | "facebook" | "linkedin" | "twitter">("google");

  const titleForSocial = (ogTitle || metaTitle || "Untitled page").trim();
  const descForSocial = (ogDescription || metaDescription || "").trim();
  const titleForSerp = (metaTitle || "Untitled page").trim();
  const descForSerp = (metaDescription || "").trim();
  const breadcrumb = buildBreadcrumb(pagePath);
  const fullUrl = `${baseUrl}${pagePath === "/" ? "" : pagePath}`;
  const domain = baseUrl.replace(/^https?:\/\//, "");

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header + tabs */}
      <div className="px-4 pt-3 border-b border-border">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold text-foreground">Live preview</h4>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            updates as you type
          </span>
        </div>
        <div className="flex gap-1 -mb-px">
          {[
            { id: "google", label: "Google" },
            { id: "facebook", label: "Facebook" },
            { id: "linkedin", label: "LinkedIn" },
            { id: "twitter", label: "X / Twitter" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 bg-muted/20">
        {tab === "google" && (
          <GooglePreview
            title={titleForSerp}
            description={descForSerp}
            breadcrumb={breadcrumb}
            url={fullUrl}
            rtl={rtl}
          />
        )}
        {tab === "facebook" && (
          <FacebookPreview
            title={titleForSocial}
            description={descForSocial}
            image={ogImage}
            domain={domain}
            rtl={rtl}
          />
        )}
        {tab === "linkedin" && (
          <LinkedInPreview
            title={titleForSocial}
            description={descForSocial}
            image={ogImage}
            domain={domain}
            rtl={rtl}
          />
        )}
        {tab === "twitter" && (
          <TwitterPreview
            title={titleForSocial}
            description={descForSocial}
            image={ogImage}
            domain={domain}
            rtl={rtl}
          />
        )}
      </div>
    </div>
  );
};

/* ---------------- Google ---------------- */

const GooglePreview = ({
  title, description, breadcrumb, url, rtl,
}: {
  title: string; description: string; breadcrumb: string[]; url: string; rtl?: boolean;
}) => (
  <div className="max-w-2xl bg-white text-black p-4 rounded-lg shadow-sm" dir={rtl ? "rtl" : "ltr"}>
    <div className="flex items-center gap-2 mb-1">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 grid place-items-center text-[10px] font-bold text-white">
        D
      </div>
      <div className="leading-tight">
        <div className="text-[13px] text-[#202124]">{SITE_NAME}</div>
        <div className="text-[12px] text-[#5f6368] flex items-center gap-1">
          {breadcrumb.map((b, i) => (
            <span key={i} className="capitalize">
              {b}
              {i < breadcrumb.length - 1 && <span className="mx-1 text-[#9aa0a6]">›</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-[20px] leading-snug text-[#1a0dab] visited:text-[#681da8] hover:underline cursor-pointer mb-1 font-normal"
    >
      {truncate(title || "Untitled page", 60)}
    </a>
    <p className="text-[14px] text-[#4d5156] leading-snug">
      {description ? truncate(description, 160) : (
        <span className="italic text-[#9aa0a6]">No meta description set — Google will pick a snippet from your page.</span>
      )}
    </p>
    {/* Pixel-width hint */}
    <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
      <GoogleIcon size={11} className="text-muted-foreground" />
      <span>{title.length} title chars · {description.length} description chars</span>
    </div>
  </div>
);

/* ---------------- Facebook ---------------- */

const FacebookPreview = ({
  title, description, image, domain, rtl,
}: {
  title: string; description: string; image?: string; domain: string; rtl?: boolean;
}) => (
  <div className="max-w-md bg-white rounded-lg overflow-hidden border border-[#dddfe2] shadow-sm" dir={rtl ? "rtl" : "ltr"}>
    <ImageOrPlaceholder image={image} />
    <div className="bg-[#f2f3f5] px-3 py-2 border-t border-[#dddfe2]">
      <div className="text-[12px] uppercase text-[#606770] tracking-wider truncate">{domain}</div>
      <div className="text-[16px] font-semibold text-[#1d2129] leading-snug mt-0.5 line-clamp-2">
        {truncate(title, 100)}
      </div>
      {description && (
        <div className="text-[14px] text-[#606770] leading-snug mt-0.5 line-clamp-2">
          {truncate(description, 200)}
        </div>
      )}
    </div>
  </div>
);

/* ---------------- LinkedIn ---------------- */

const LinkedInPreview = ({
  title, description, image, domain, rtl,
}: {
  title: string; description: string; image?: string; domain: string; rtl?: boolean;
}) => (
  <div className="max-w-md bg-white rounded-lg overflow-hidden border border-[#e0e0e0] shadow-sm" dir={rtl ? "rtl" : "ltr"}>
    <ImageOrPlaceholder image={image} />
    <div className="bg-[#f3f6f8] px-3 py-2 border-t border-[#e0e0e0]">
      <div className="text-[14px] font-semibold text-[#000000e6] leading-snug line-clamp-2">
        {truncate(title, 100)}
      </div>
      <div className="text-[12px] text-[#00000099] mt-0.5 truncate">{domain}</div>
    </div>
  </div>
);

/* ---------------- Twitter / X ---------------- */

const TwitterPreview = ({
  title, description, image, domain, rtl,
}: {
  title: string; description: string; image?: string; domain: string; rtl?: boolean;
}) => (
  <div className="max-w-md bg-white rounded-2xl overflow-hidden border border-[#cfd9de]" dir={rtl ? "rtl" : "ltr"}>
    <ImageOrPlaceholder image={image} />
    <div className="px-3 py-2 border-t border-[#cfd9de]">
      <div className="text-[13px] text-[#536471] flex items-center gap-1">
        <Globe size={11} /> {domain}
      </div>
      <div className="text-[15px] text-[#0f1419] leading-snug mt-0.5 line-clamp-1">
        {truncate(title, 70)}
      </div>
      {description && (
        <div className="text-[13px] text-[#536471] leading-snug mt-0.5 line-clamp-2">
          {truncate(description, 140)}
        </div>
      )}
    </div>
  </div>
);

/* ---------------- Shared helpers ---------------- */

const ImageOrPlaceholder = ({ image }: { image?: string }) =>
  image ? (
    <img
      src={image}
      alt="Social preview"
      className="w-full aspect-[1.91/1] object-cover bg-muted"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  ) : (
    <div className="w-full aspect-[1.91/1] bg-gradient-to-br from-muted to-muted-foreground/10 grid place-items-center text-xs text-muted-foreground">
      No social image — uploads appear here
    </div>
  );

export default SerpSocialPreview;
