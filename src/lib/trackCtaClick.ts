/**
 * Fires a `cta_click` event to every analytics provider currently loaded on the
 * page. We don't import any vendor SDK — instead we feature-detect the global
 * each provider exposes after `useTrackingScripts` injects its snippet.
 * Failures are swallowed so a misbehaving pixel never breaks the user's click.
 *
 * Used by both:
 *   - Custom Button blocks (admin-added, page-level)
 *   - The smart `<CtaButton>` (registry-based — navbar, hero, pricing, etc.)
 *
 * Keep the payload shape consistent across providers so dashboards can group
 * registry CTAs and custom buttons under the same `cta_click` event.
 */
export interface CtaClickPayload {
  /** Visible button text (or registry key when no label is available). */
  label: string;
  /** Where the click leads — URL, email, phone, etc. */
  destination: string;
  /** Destination type: link | email | phone | whatsapp | external | registry */
  kind: string;
  /** Page slug the click happened on (e.g. "home", "navbar", "pricing"). */
  page?: string;
  /** Optional source identifier — registry key for CtaButton, block id for Button blocks. */
  source?: string;
  /** Free-form extras (variant, button id, etc.). Merged into the event. */
  [key: string]: unknown;
}

interface AnalyticsGlobals {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: Array<Record<string, unknown>>;
  plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
  fbq?: (action: string, name: string, props?: Record<string, unknown>) => void;
  ttq?: { track?: (name: string, props?: Record<string, unknown>) => void };
}

export const trackCtaClick = (payload: CtaClickPayload): void => {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as AnalyticsGlobals;
    // Google Analytics 4 (gtag.js)
    w.gtag?.("event", "cta_click", {
      event_category: "CTA",
      event_label: payload.label,
      ...payload,
    });
    // Google Tag Manager dataLayer (works even without gtag.js)
    w.dataLayer?.push({ event: "cta_click", ...payload });
    // Plausible Analytics
    w.plausible?.("CTA Click", { props: payload });
    // Meta / Facebook Pixel
    w.fbq?.("trackCustom", "CTAClick", payload);
    // TikTok Pixel
    w.ttq?.track?.("ClickButton", payload);
  } catch {
    /* never let analytics break navigation */
  }
};
