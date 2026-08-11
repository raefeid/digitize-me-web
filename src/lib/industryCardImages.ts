// CDN-pointer assets (Lovable) for industries not yet refreshed locally.
import government from "@/assets/industries/industry_government.webp.asset.json";
import healthcare from "@/assets/industries/industry_healthcare.webp.asset.json";
import lawFirms from "@/assets/industries/industry_law_firms.webp.asset.json";
import realEstate from "@/assets/industries/industry_real_estate.webp.asset.json";
import manufacturing from "@/assets/industries/industry_manufacturing.jpg.asset.json";
import construction from "@/assets/industries/industry_construction.jpg.asset.json";
import oilGas from "@/assets/industries/industry_oilgas.jpg.asset.json";

// Locally bundled, optimized photos (real Vite assets — hashed and served from
// our own origin). A direct image import resolves to the URL string.
import accounting from "@/assets/industries/industry_accounting.jpg";
import banking from "@/assets/industries/industry_banking.jpg";
import education from "@/assets/industries/industry_education.jpg";
import trade from "@/assets/industries/industry_trade.jpg";
import insurance from "@/assets/industries/industry_insurance.jpg";
import logistics from "@/assets/industries/industry_logistics.jpg";
import retail from "@/assets/industries/industry_retail.jpg";

/**
 * Photo headers for the /industries cards, keyed by industry slug.
 */
export const industryCardImages: Record<string, string> = {
  "law-firms": lawFirms.url,
  accounting,
  "real-estate": realEstate.url,
  healthcare: healthcare.url,
  government: government.url,
  "banking-finance": banking,
  logistics,
  education,
  manufacturing: manufacturing.url,
  construction: construction.url,
  "import-export": trade,
  "oil-gas": oilGas.url,
  insurance,
  retail,
};

export const getIndustryCardImage = (slug: string): string | undefined =>
  industryCardImages[slug];

/** Alt-text pattern locked by brand guidelines. */
export const industryCardAlt = (name: string): string =>
  `${name} professionals managing documents in a UAE office`;
