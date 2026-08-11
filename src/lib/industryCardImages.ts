import accounting from "@/assets/industries/industry_accounting.webp.asset.json";
import banking from "@/assets/industries/industry_banking.webp.asset.json";
import government from "@/assets/industries/industry_government.webp.asset.json";
import healthcare from "@/assets/industries/industry_healthcare.webp.asset.json";
import lawFirms from "@/assets/industries/industry_law_firms.webp.asset.json";
import realEstate from "@/assets/industries/industry_real_estate.webp.asset.json";
import logistics from "@/assets/industries/industry_logistics.jpg.asset.json";
import education from "@/assets/industries/industry_education.jpg.asset.json";
import manufacturing from "@/assets/industries/industry_manufacturing.jpg.asset.json";
import construction from "@/assets/industries/industry_construction.jpg.asset.json";
import trade from "@/assets/industries/industry_trade.jpg.asset.json";
import oilGas from "@/assets/industries/industry_oilgas.jpg.asset.json";
import insurance from "@/assets/industries/industry_insurance.jpg.asset.json";
import retail from "@/assets/industries/industry_retail.jpg.asset.json";

/**
 * Photo headers for the /industries cards, keyed by industry slug.
 */
export const industryCardImages: Record<string, string> = {
  "law-firms": lawFirms.url,
  accounting: accounting.url,
  "real-estate": realEstate.url,
  healthcare: healthcare.url,
  government: government.url,
  "banking-finance": banking.url,
  logistics: logistics.url,
  education: education.url,
  manufacturing: manufacturing.url,
  construction: construction.url,
  "import-export": trade.url,
  "oil-gas": oilGas.url,
  insurance: insurance.url,
  retail: retail.url,
};

export const getIndustryCardImage = (slug: string): string | undefined =>
  industryCardImages[slug];

/** Alt-text pattern locked by brand guidelines. */
export const industryCardAlt = (name: string): string =>
  `${name} professionals managing documents in a UAE office`;
