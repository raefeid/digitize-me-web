import accounting from "@/assets/industries/industry_accounting.webp.asset.json";
import banking from "@/assets/industries/industry_banking.webp.asset.json";
import government from "@/assets/industries/industry_government.webp.asset.json";
import healthcare from "@/assets/industries/industry_healthcare.webp.asset.json";
import lawFirms from "@/assets/industries/industry_law_firms.webp.asset.json";
import realEstate from "@/assets/industries/industry_real_estate.webp.asset.json";

/**
 * Photo headers for the /industries cards, keyed by industry slug.
 * Industries without an entry keep the icon-only card design until an
 * image file is supplied.
 */
export const industryCardImages: Record<string, string> = {
  "law-firms": lawFirms.url,
  accounting: accounting.url,
  "real-estate": realEstate.url,
  healthcare: healthcare.url,
  government: government.url,
  "banking-finance": banking.url,
};

export const getIndustryCardImage = (slug: string): string | undefined =>
  industryCardImages[slug];

/** Alt-text pattern locked by brand guidelines. */
export const industryCardAlt = (name: string): string =>
  `${name} professionals managing documents in a UAE office`;
