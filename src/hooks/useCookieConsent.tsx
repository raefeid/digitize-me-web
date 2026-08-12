import { createContext, useContext, useState, useCallback, ReactNode } from "react";

/**
 * Cookie/consent state for GDPR & UAE PDPL compliance.
 *
 * No non-essential tracker is allowed to load until the visitor makes a choice.
 * Consent is split into two opt-in categories consumed by useTrackingScripts:
 *   - analytics : GA4, Microsoft Clarity, Hotjar
 *   - marketing : Meta Pixel, LinkedIn, TikTok, GTM, custom_head/custom_body
 * "Necessary" cookies (and the cookieless Google Search Console meta tag) always
 * load and are not represented here.
 *
 * The choice is persisted in localStorage with a version so the banner can be
 * re-shown if the category model changes.
 */

export type ConsentCategories = { analytics: boolean; marketing: boolean };

const STORAGE_KEY = "dm-cookie-consent";
const CONSENT_VERSION = 1;

type StoredConsent = ConsentCategories & { v: number; ts: number };

const readStored = (): StoredConsent | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed?.v !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeStored = (categories: ConsentCategories) => {
  try {
    const payload: StoredConsent = {
      ...categories,
      v: CONSENT_VERSION,
      ts: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable (private mode) — consent is session-only, banner re-shows */
  }
};

interface CookieConsentValue {
  analytics: boolean;
  marketing: boolean;
  /** true once the visitor has made an explicit choice */
  decided: boolean;
  /** whether the banner/preferences UI should be visible */
  bannerOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  save: (categories: ConsentCategories) => void;
  openPreferences: () => void;
  closeBanner: () => void;
}

const CookieConsentContext = createContext<CookieConsentValue | undefined>(undefined);

export const useCookieConsent = () => {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return ctx;
};

export const CookieConsentProvider = ({ children }: { children: ReactNode }) => {
  const initial = readStored();
  const [categories, setCategories] = useState<ConsentCategories>({
    analytics: initial?.analytics ?? false,
    marketing: initial?.marketing ?? false,
  });
  const [decided, setDecided] = useState<boolean>(initial !== null);
  const [bannerOpen, setBannerOpen] = useState<boolean>(initial === null);

  const commit = useCallback(
    (next: ConsentCategories) => {
      // If the visitor is revoking a category that was previously granted, the
      // third-party globals/cookies are already in memory — reload to purge them.
      const downgraded =
        (categories.analytics && !next.analytics) ||
        (categories.marketing && !next.marketing);

      writeStored(next);
      setCategories(next);
      setDecided(true);
      setBannerOpen(false);

      if (downgraded && typeof window !== "undefined") {
        window.location.reload();
      }
    },
    [categories],
  );

  const acceptAll = useCallback(() => commit({ analytics: true, marketing: true }), [commit]);
  const rejectAll = useCallback(() => commit({ analytics: false, marketing: false }), [commit]);
  const save = useCallback((next: ConsentCategories) => commit(next), [commit]);
  const openPreferences = useCallback(() => setBannerOpen(true), []);
  const closeBanner = useCallback(() => {
    // Only allow dismissing without a choice implicitly if already decided.
    setBannerOpen((open) => (decided ? false : open));
  }, [decided]);

  return (
    <CookieConsentContext.Provider
      value={{
        analytics: categories.analytics,
        marketing: categories.marketing,
        decided,
        bannerOpen,
        acceptAll,
        rejectAll,
        save,
        openPreferences,
        closeBanner,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};
