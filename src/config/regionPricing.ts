import { Region } from "@/hooks/useGeoLocation";

export interface RegionPrice {
  monthly: number | null; // null = "Custom" / contact sales
  yearly: number | null;
  /**
   * When true, this region has no specific price and the live page should
   * fall back to the DEFAULT (global) pricing for this region.
   */
  hidden?: boolean;
  /**
   * When true, hide the price entirely for this region and only show the
   * "Contact us" CTA button — no monthly/yearly amount is rendered.
   */
  contactOnly?: boolean;
}

export interface PlanPricing {
  EG: RegionPrice;
  AE: RegionPrice;
  SA: RegionPrice;
  DEFAULT: RegionPrice;
}

// SAR ≈ AED (1 AED ≈ 1.02 SAR), so we mirror AE pricing for SA by default.
// Admins can override per-region from the Pricing editor.

// Individual plans
export const individualPricing: Record<string, PlanPricing> = {
  free: {
    EG: { monthly: 0, yearly: 0 },
    AE: { monthly: 0, yearly: 0 },
    SA: { monthly: 0, yearly: 0 },
    DEFAULT: { monthly: 0, yearly: 0 },
  },
  starter: {
    EG: { monthly: 500, yearly: 350 },
    AE: { monthly: 99, yearly: 69 },
    SA: { monthly: 99, yearly: 69 },
    DEFAULT: { monthly: 25, yearly: 17 },
  },
  sme: {
    EG: { monthly: 1000, yearly: 700 },
    AE: { monthly: 199, yearly: 139 },
    SA: { monthly: 199, yearly: 139 },
    DEFAULT: { monthly: 49, yearly: 34 },
  },
  enterprise: {
    EG: { monthly: 2500, yearly: 1750 },
    AE: { monthly: 599, yearly: 419 },
    SA: { monthly: 599, yearly: 419 },
    DEFAULT: { monthly: 99, yearly: 69 },
  },
};

// Business plans
export const businessPricing: Record<string, PlanPricing> = {
  entry: {
    EG: { monthly: 2500, yearly: 1750 },
    AE: { monthly: 599, yearly: 419 },
    SA: { monthly: 599, yearly: 419 },
    DEFAULT: { monthly: 99, yearly: 69 },
  },
  business: {
    EG: { monthly: 6500, yearly: 4550 },
    AE: { monthly: 1499, yearly: 1049 },
    SA: { monthly: 1499, yearly: 1049 },
    DEFAULT: { monthly: 249, yearly: 174 },
  },
  ai: {
    EG: { monthly: 12500, yearly: 8750 },
    AE: { monthly: 2499, yearly: 1749 },
    SA: { monthly: 2499, yearly: 1749 },
    DEFAULT: { monthly: 499, yearly: 349 },
  },
};

// Per-region currency formatting. English uses ISO currency codes, Arabic uses
// localized currency symbols.
const currencyFormats: Record<Region, { symbol: string; symbolEn?: string; position: "before" | "after"; decimals: number }> = {
  EG: { symbol: "ج.م", symbolEn: "EGP", position: "after", decimals: 0 },
  AE: { symbol: "د.إ", symbolEn: "AED", position: "after", decimals: 0 },
  SA: { symbol: "ر.س", symbolEn: "SAR", position: "after", decimals: 0 },
  DEFAULT: { symbol: "$", position: "before", decimals: 0 },
};

export const formatRegionPrice = (
  amount: number | null,
  region: Region,
  period: string = "/mo",
  freeLabel: string = "Free",
  isRTL: boolean = false
): string => {
  if (amount === null) return "Custom";
  if (amount === 0) return freeLabel;
  const fmt = currencyFormats[region];
  const symbol = !isRTL && fmt.symbolEn ? fmt.symbolEn : fmt.symbol;
  const num = fmt.decimals > 0 ? amount.toFixed(fmt.decimals) : amount.toLocaleString();
  if (fmt.position === "before") return `${symbol}${num}${period}`;
  return `${num} ${symbol}${period}`;
};

// Payment gateway info per region
export const paymentGateways: Record<Region, { name: string; id: string }> = {
  EG: { name: "Paymob", id: "paymob" },
  AE: { name: "Tap Payments", id: "tap" },
  SA: { name: "HyperPay (Mada)", id: "hyperpay" },
  DEFAULT: { name: "Stripe", id: "stripe" },
};
