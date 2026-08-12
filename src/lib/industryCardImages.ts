// Locally bundled, optimized photos (real Vite assets — hashed and served from
// our own origin). A direct image import resolves to the URL string.
import accounting from "@/assets/industries/industry_accounting.jpg";
import banking from "@/assets/industries/industry_banking.jpg";
import education from "@/assets/industries/industry_education.jpg";
import trade from "@/assets/industries/industry_trade.jpg";
import insurance from "@/assets/industries/industry_insurance.jpg";
import logistics from "@/assets/industries/industry_logistics.jpg";
import retail from "@/assets/industries/industry_retail.jpg";
import lawFirms from "@/assets/industries/industry_law_firms.jpg";
import government from "@/assets/industries/industry_government.jpg";
import manufacturing from "@/assets/industries/industry_manufacturing.jpg";
import oilGas from "@/assets/industries/industry_oilgas.jpg";
import construction from "@/assets/industries/industry_construction.jpg";
import healthcare from "@/assets/industries/industry_healthcare.jpg";
import realEstate from "@/assets/industries/industry_real_estate.jpg";

/**
 * Photo headers for the /industries cards, keyed by industry slug.
 */
export const industryCardImages: Record<string, string> = {
  "law-firms": lawFirms,
  accounting,
  "real-estate": realEstate,
  healthcare,
  government,
  "banking-finance": banking,
  logistics,
  education,
  manufacturing,
  construction,
  "import-export": trade,
  "oil-gas": oilGas,
  insurance,
  retail,
};

export const getIndustryCardImage = (slug: string): string | undefined =>
  industryCardImages[slug];

/** Alt-text pattern locked by brand guidelines. */
export const industryCardAlt = (name: string): string =>
  `${name} professionals managing documents in a UAE office`;
