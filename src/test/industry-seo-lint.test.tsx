import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildIndustrySeo } from "@/lib/industrySeo";
import { localizeInternalPath } from "@/lib/localizedRoutes";
import { industriesData } from "@/pages/Industries";

const mockUseLanguage = vi.fn();

vi.mock("@/i18n/LanguageContext", () => ({
  useLanguage: () => mockUseLanguage(),
}));

vi.mock("@/hooks/useSiteContent", () => ({
  useSiteContent: () => ({
    getContent: (_key: string, fallback = "") => fallback,
    getImage: (_key: string, fallback = "") => fallback,
  }),
}));

vi.mock("@/hooks/useBranding", () => ({
  useBrandingAsset: () => "/og-image.jpg",
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const industriesPageSource = fs.readFileSync(path.resolve(__dirname, "../pages/Industries.tsx"), "utf8");
const seoHeadSource = fs.readFileSync(path.resolve(__dirname, "../components/SEOHead.tsx"), "utf8");

const getIndustryDetailSource = () => {
  const start = industriesPageSource.indexOf("export const IndustryDetail = () => {");
  return start >= 0 ? industriesPageSource.slice(start) : industriesPageSource;
};

const countIndustryH1s = () => {
  const source = getIndustryDetailSource();
  const renderPathStart = source.indexOf("const arData");
  const renderPathSource = renderPathStart >= 0 ? source.slice(renderPathStart) : source;
  const matches = renderPathSource.match(/as=\"h1\"|<h1\b/g) ?? [];
  return matches.length;
};

const countIndustryH2s = () => {
  const source = getIndustryDetailSource();
  const renderPathStart = source.indexOf("const arData");
  const renderPathSource = renderPathStart >= 0 ? source.slice(renderPathStart) : source;
  const matches = renderPathSource.match(/as=\"h2\"|<h2\b/g) ?? [];
  return matches.length;
};

afterEach(() => {
  mockUseLanguage.mockReset();
});

describe("industry SEO build-time linter", () => {
  it("enforces exactly one H1 in the industry page template", () => {
    expect(countIndustryH1s()).toBe(1);
  });

  it("keeps a meaningful H2 hierarchy across the industry template", () => {
    expect(countIndustryH2s()).toBeGreaterThanOrEqual(4);
  });

  it("keeps every generated industry title within target length bounds", () => {
    const violations = industriesData.flatMap((industry) => {
      return (["en", "ar"] as const).flatMap((lang) => {
        const title = buildIndustrySeo(industry.name, industry.headline, lang).title.trim();
        return title.length >= 30 && title.length <= 60
          ? []
          : [`${lang}:${industry.slug}:${title.length}:${title}`];
      });
    });

    expect(violations).toEqual([]);
  });

  it("renders canonical and og:url tags in the correct industry-page format", () => {
    expect(seoHeadSource).toContain('<link rel="canonical" href={canonical} />');
    expect(seoHeadSource).toContain('<meta property="og:url" content={canonical} />');
    expect(seoHeadSource).toContain('<link rel="alternate" hrefLang="en" href={enUrl} />');
    expect(seoHeadSource).toContain('<link rel="alternate" hrefLang="ar" href={arUrl} />');
    expect(seoHeadSource).toContain('<meta property="og:image" content={ogImage} />');

    const violations = industriesData.flatMap((industry) => {
      return (["en", "ar"] as const).flatMap((lang) => {
        const expectedCanonical = `https://www.digitizeme.ae${lang === "ar" ? "/ar" : ""}/industries/${industry.slug}`;
        const expectedAltEn = `https://www.digitizeme.ae/industries/${industry.slug}`;
        const expectedAltAr = `https://www.digitizeme.ae/ar/industries/${industry.slug}`;
        const computedCanonical = `https://www.digitizeme.ae${localizeInternalPath(`/industries/${industry.slug}`, lang)}`;
        const computedAltEn = `https://www.digitizeme.ae${localizeInternalPath(`/industries/${industry.slug}`, "en")}`;
        const computedAltAr = `https://www.digitizeme.ae${localizeInternalPath(`/industries/${industry.slug}`, "ar")}`;

        const issues: string[] = [];
        if (computedCanonical !== expectedCanonical) {
          issues.push(`${lang}:${industry.slug}:canonical`);
        }
        if (computedCanonical !== expectedCanonical) {
          issues.push(`${lang}:${industry.slug}:og:url`);
        }
        if (computedAltEn !== expectedAltEn) {
          issues.push(`${lang}:${industry.slug}:hreflang-en`);
        }
        if (computedAltAr !== expectedAltAr) {
          issues.push(`${lang}:${industry.slug}:hreflang-ar`);
        }

        return issues;
      });
    });

    expect(violations).toEqual([]);
  });
});