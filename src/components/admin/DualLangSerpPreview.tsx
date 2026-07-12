import { Search as GoogleIcon } from "lucide-react";

/**
 * Side-by-side Google SERP snippet preview for both English and Arabic.
 * Lets editors see how each localized version of a page will render in
 * Google search results without toggling the language tab. Pure
 * presentational — fed by the SEO editor's pending state so it updates
 * live on every keystroke.
 */

type LangSnippet = {
  metaTitle: string;
  metaDescription: string;
};

type Props = {
  pagePath: string;
  en: LangSnippet;
  ar: LangSnippet;
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

const DualLangSerpPreview = ({ pagePath, en, ar }: Props) => {
  const breadcrumb = buildBreadcrumb(pagePath);
  const fullUrl = `${baseUrl}${pagePath === "/" ? "" : pagePath}`;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GoogleIcon size={16} className="text-accent" />
          <h4 className="text-sm font-semibold text-foreground">
            Google SERP — both languages
          </h4>
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          updates as you type
        </span>
      </div>

      <div className="p-5 bg-muted/20 grid lg:grid-cols-2 gap-4">
        <SerpCard
          langLabel="English"
          langCode="EN"
          dir="ltr"
          title={en.metaTitle}
          description={en.metaDescription}
          breadcrumb={breadcrumb}
          url={fullUrl}
        />
        <SerpCard
          langLabel="العربية"
          langCode="AR"
          dir="rtl"
          title={ar.metaTitle}
          description={ar.metaDescription}
          breadcrumb={breadcrumb}
          url={fullUrl}
        />
      </div>
    </div>
  );
};

const SerpCard = ({
  langLabel,
  langCode,
  dir,
  title,
  description,
  breadcrumb,
  url,
}: {
  langLabel: string;
  langCode: string;
  dir: "ltr" | "rtl";
  title: string;
  description: string;
  breadcrumb: string[];
  url: string;
}) => {
  const trimmedTitle = (title || "").trim();
  const trimmedDesc = (description || "").trim();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {langLabel}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-mono">
          {langCode}
        </span>
      </div>
      <div className="bg-white text-black p-4 rounded-lg shadow-sm" dir={dir}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500 grid place-items-center text-[10px] font-bold text-white">
            D
          </div>
          <div className="leading-tight">
            <div className="text-[13px] text-[#202124]">{SITE_NAME}</div>
            <div className="text-[12px] text-[#5f6368] flex items-center gap-1 flex-wrap">
              {breadcrumb.map((b, i) => (
                <span key={i} className="capitalize">
                  {b}
                  {i < breadcrumb.length - 1 && (
                    <span className="mx-1 text-[#9aa0a6]">›</span>
                  )}
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
          {trimmedTitle ? truncate(trimmedTitle, 60) : (
            <span className="italic text-[#9aa0a6]">No title set</span>
          )}
        </a>
        <p className="text-[14px] text-[#4d5156] leading-snug">
          {trimmedDesc ? (
            truncate(trimmedDesc, 160)
          ) : (
            <span className="italic text-[#9aa0a6]">
              No meta description — Google will pick a snippet from your page.
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
        <span>
          Title:{" "}
          <span className={trimmedTitle.length > 60 ? "text-destructive" : "text-foreground"}>
            {trimmedTitle.length}
          </span>{" "}
          / 60
        </span>
        <span>
          Desc:{" "}
          <span className={trimmedDesc.length > 160 ? "text-destructive" : "text-foreground"}>
            {trimmedDesc.length}
          </span>{" "}
          / 160
        </span>
      </div>
    </div>
  );
};

export default DualLangSerpPreview;
