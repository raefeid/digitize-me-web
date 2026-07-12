import { useMemo } from "react";
import { useSiteContent, useSaveContent, useDeleteContent, SiteContentItem } from "./useSiteContent";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Promotions
 * ----------
 * One CMS-driven row per promotion stored in the `site_content` table:
 *   page="promotions", section="registry", content_type="promotion"
 *   content_key = promo id (random), sort_order = display order
 *   value     = JSON (English text + display settings, see PromoData below)
 *   value_ar  = JSON (Arabic overrides for the translatable text fields only)
 *
 * Why one row per promo?  It keeps add/remove/reorder trivial (no fan-out
 * of N rows) and it lets us copy a promo by duplicating a single row.
 */

export type PromoMode = "bar" | "popup" | "inline";
export type PromoTheme = "accent" | "success" | "warning" | "info" | "dark";
export type PromoDismiss = "forever" | "week" | "always";

export interface PromoData {
  enabled: boolean;
  mode: PromoMode;
  theme: PromoTheme;
  /** Translatable text */
  headline: string;
  body: string;
  ctaLabel: string;
  /** Destination of the CTA — same shape as the Button block */
  ctaKind: "link" | "email" | "phone" | "whatsapp" | "external" | "none";
  ctaValue: string;
  /** Optional banner image (popup + inline) */
  imageUrl: string;
  /** Optional ISO date strings — bounds when the promo is shown */
  startAt: string | null;
  endAt: string | null;
  dismiss: PromoDismiss;
}

export const defaultPromo = (): PromoData => ({
  enabled: false,
  mode: "bar",
  theme: "accent",
  headline: "",
  body: "",
  ctaLabel: "",
  ctaKind: "none",
  ctaValue: "",
  imageUrl: "",
  startAt: null,
  endAt: null,
  dismiss: "forever",
});

export interface Promo extends PromoData {
  /** Site-content row id (UUID) — used for save/delete */
  rowId: string;
  /** Stable promo id used as content_key + dismiss-storage key */
  id: string;
  sortOrder: number;
  /** Arabic overrides for the translatable fields */
  ar: { headline?: string; body?: string; ctaLabel?: string };
}

const safeParse = <T,>(raw: string | null | undefined, fallback: T): T => {
  if (!raw) return fallback;
  try { return { ...fallback, ...(JSON.parse(raw) as object) } as T; } catch { return fallback; }
};

const dismissedKey = (id: string) => `promo-dismissed:${id}`;

/** Returns true when this device has dismissed the promo according to its rule. */
export const isPromoDismissed = (promo: Promo): boolean => {
  if (promo.dismiss === "always") return false;
  try {
    const raw = localStorage.getItem(dismissedKey(promo.id));
    if (!raw) return false;
    if (promo.dismiss === "forever") return true;
    if (promo.dismiss === "week") {
      const ts = Number(raw);
      if (!Number.isFinite(ts)) return true;
      return Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
    }
  } catch { /* SSR / private mode */ }
  return false;
};

export const dismissPromo = (promo: Promo) => {
  try {
    localStorage.setItem(dismissedKey(promo.id), String(Date.now()));
  } catch { /* ignore */ }
};

/** Returns true when the current time is within the promo's schedule window. */
export const isPromoLive = (promo: Promo): boolean => {
  if (!promo.enabled) return false;
  const now = Date.now();
  if (promo.startAt) {
    const t = Date.parse(promo.startAt);
    if (Number.isFinite(t) && now < t) return false;
  }
  if (promo.endAt) {
    const t = Date.parse(promo.endAt);
    if (Number.isFinite(t) && now > t) return false;
  }
  return true;
};

const rowToPromo = (row: SiteContentItem): Promo => {
  const en = safeParse<PromoData>(row.value, defaultPromo());
  const ar = safeParse<{ headline?: string; body?: string; ctaLabel?: string }>(
    row.value_ar,
    {}
  );
  return {
    rowId: row.id,
    id: row.content_key,
    sortOrder: row.sort_order,
    ar,
    ...en,
  };
};

/** Read all promotions, ordered by sort_order. */
export const usePromotions = () => {
  const { items, isLoading } = useSiteContent("promotions", "registry");
  const promos = useMemo<Promo[]>(
    () =>
      (items ?? [])
        .filter((i) => i.content_type === "promotion")
        .map(rowToPromo)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [items]
  );
  return { promos, isLoading };
};

/**
 * Resolve a translated promo text field. Falls back to EN if AR is missing.
 * Use inside components so the value reacts to language changes.
 */
export const useLocalizedPromo = (promo: Promo) => {
  const { lang } = useLanguage();
  const pick = (en: string, ar?: string) => (lang === "ar" && ar ? ar : en);
  return {
    headline: pick(promo.headline, promo.ar.headline),
    body: pick(promo.body, promo.ar.body),
    ctaLabel: pick(promo.ctaLabel, promo.ar.ctaLabel),
  };
};

/** Save a promotion (creates the row if rowId is missing). */
export const useSavePromotion = () => {
  const save = useSaveContent();
  return {
    ...save,
    mutateAsync: (input: {
      rowId?: string;
      id: string;
      sortOrder?: number;
      en: PromoData;
      ar: { headline?: string; body?: string; ctaLabel?: string };
    }) =>
      save.mutateAsync({
        id: input.rowId,
        page: "promotions",
        section: "registry",
        content_key: input.id,
        content_type: "promotion",
        value: JSON.stringify(input.en),
        value_ar: JSON.stringify(input.ar ?? {}),
        sort_order: input.sortOrder ?? 0,
      }),
  };
};

export const useDeletePromotion = useDeleteContent;

/** Generate a stable id for a new promo row. */
export const newPromoId = () => `promo_${Math.random().toString(36).slice(2, 9)}`;
