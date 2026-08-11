import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCookieConsent } from "@/hooks/useCookieConsent";

const COPY = {
  en: {
    title: "We value your privacy",
    body: "We use cookies to run essential features, understand how the site is used, and measure our marketing. You can accept all, reject non-essential, or choose what to allow.",
    privacy: "Privacy Policy",
    acceptAll: "Accept all",
    rejectAll: "Reject non-essential",
    manage: "Manage preferences",
    save: "Save choices",
    back: "Back",
    close: "Close",
    necessary: "Strictly necessary",
    necessaryDesc: "Required for the site to function. Always on.",
    analytics: "Analytics",
    analyticsDesc: "Usage measurement and session insights (Google Analytics, Clarity, Hotjar).",
    marketing: "Marketing",
    marketingDesc: "Ad and audience pixels (Meta, LinkedIn, TikTok, Tag Manager).",
    alwaysOn: "Always on",
  },
  ar: {
    title: "نحن نحترم خصوصيتك",
    body: "نستخدم ملفات تعريف الارتباط لتشغيل الميزات الأساسية، وفهم كيفية استخدام الموقع، وقياس تسويقنا. يمكنك قبول الكل، أو رفض غير الضروري، أو اختيار ما تسمح به.",
    privacy: "سياسة الخصوصية",
    acceptAll: "قبول الكل",
    rejectAll: "رفض غير الضروري",
    manage: "إدارة التفضيلات",
    save: "حفظ الاختيارات",
    back: "رجوع",
    close: "إغلاق",
    necessary: "ضرورية للغاية",
    necessaryDesc: "مطلوبة لعمل الموقع. مفعّلة دائماً.",
    analytics: "التحليلات",
    analyticsDesc: "قياس الاستخدام ورؤى الجلسات (Google Analytics وClarity وHotjar).",
    marketing: "التسويق",
    marketingDesc: "بكسلات الإعلانات والجمهور (Meta وLinkedIn وTikTok ومدير العلامات).",
    alwaysOn: "مفعّلة دائماً",
  },
} as const;

const CookieConsentBanner = () => {
  const { lang, dir } = useLanguage();
  const { bannerOpen, decided, acceptAll, rejectAll, save, closeBanner, analytics, marketing } =
    useCookieConsent();
  const t = COPY[lang] ?? COPY.en;

  const [showDetails, setShowDetails] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(analytics);
  const [marketingOn, setMarketingOn] = useState(marketing);

  // Re-sync toggles with stored consent whenever the panel is (re)opened.
  useEffect(() => {
    if (bannerOpen) {
      setAnalyticsOn(analytics);
      setMarketingOn(marketing);
      setShowDetails(false);
    }
  }, [bannerOpen, analytics, marketing]);

  if (!bannerOpen) return null;

  return (
    <div
      dir={dir}
      role="dialog"
      aria-modal="false"
      aria-label={t.title}
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 backdrop-blur shadow-2xl">
        <div className="relative p-5 sm:p-6">
          {decided && (
            <button
              type="button"
              onClick={closeBanner}
              aria-label={t.close}
              className="absolute top-3 end-3 text-muted-foreground hover:text-foreground rounded-md p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X size={18} />
            </button>
          )}

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Cookie size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground">{t.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t.body}{" "}
                <Link
                  to="/privacy"
                  className="text-accent underline underline-offset-2 hover:opacity-80"
                >
                  {t.privacy}
                </Link>
              </p>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4 space-y-3">
              <ConsentRow
                title={t.necessary}
                desc={t.necessaryDesc}
                checked
                disabled
                alwaysOnLabel={t.alwaysOn}
              />
              <ConsentRow
                title={t.analytics}
                desc={t.analyticsDesc}
                checked={analyticsOn}
                onChange={setAnalyticsOn}
              />
              <ConsentRow
                title={t.marketing}
                desc={t.marketingDesc}
                checked={marketingOn}
                onChange={setMarketingOn}
              />
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:justify-end">
            {!showDetails ? (
              <>
                <Button
                  variant="outline"
                  className="sm:order-1"
                  onClick={() => setShowDetails(true)}
                >
                  {t.manage}
                </Button>
                <Button
                  variant="outline"
                  className="sm:order-2"
                  onClick={rejectAll}
                >
                  {t.rejectAll}
                </Button>
                <Button className="sm:order-3" onClick={acceptAll}>
                  {t.acceptAll}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="sm:order-1 sm:me-auto"
                  onClick={() => setShowDetails(false)}
                >
                  {t.back}
                </Button>
                <Button
                  variant="outline"
                  className="sm:order-2"
                  onClick={rejectAll}
                >
                  {t.rejectAll}
                </Button>
                <Button
                  className="sm:order-3"
                  onClick={() => save({ analytics: analyticsOn, marketing: marketingOn })}
                >
                  {t.save}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ConsentRowProps {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  alwaysOnLabel?: string;
}

const ConsentRow = ({ title, desc, checked, disabled, onChange, alwaysOnLabel }: ConsentRowProps) => (
  <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background/50 p-3">
    <div className="min-w-0">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
    </div>
    {disabled ? (
      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
        {alwaysOnLabel}
      </span>
    ) : (
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-label={title}
        className="shrink-0 mt-0.5"
      />
    )}
  </div>
);

export default CookieConsentBanner;
