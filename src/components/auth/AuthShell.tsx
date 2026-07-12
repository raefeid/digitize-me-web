import { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
  User as UserIcon,
  Mail,
  Star,
  CheckCircle2,
  Award,
  type LucideIcon,
} from "lucide-react";
import logoFallback from "@/assets/digitizeme-logo-light.png";
import { useBrandingAsset } from "@/hooks/useBranding";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";
import type { AuthBenefit, AuthPageContent } from "@/hooks/useAuthPageContent";
import PatternOverlay from "@/components/auth/PatternOverlay";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Optional CMS-driven content overrides for the brand panel. */
  content?: AuthPageContent | null;
}

const ICONS: Record<string, LucideIcon> = {
  Zap,
  Globe2,
  ShieldCheck,
  Sparkles,
  Lock,
  User: UserIcon,
  Mail,
  Star,
  CheckCircle2,
  Award,
};

const fallbackBenefits = (l: (en: string, ar: string) => string): AuthBenefit[] => [
  { icon: "Zap", title: l("Lightning-fast OCR", "تعرّف نصوص فائق السرعة"), desc: l("Process Arabic & English documents in seconds with AI accuracy.", "عالج المستندات العربية والإنجليزية في ثوانٍ بدقة الذكاء الاصطناعي.") },
  { icon: "Globe2", title: l("Bilingual by design", "ثنائية اللغة بالتصميم"), desc: l("Built for the Middle East — full RTL support, native Arabic search.", "مصممة للشرق الأوسط — دعم كامل للكتابة من اليمين لليسار وبحث عربي أصلي.") },
  { icon: "ShieldCheck", title: l("Enterprise-grade security", "أمان على مستوى المؤسسات"), desc: l("Your documents stay encrypted at rest and in transit.", "تبقى مستنداتك مشفرة عند التخزين والنقل.") },
];

const AuthShell = ({ title, subtitle, children, footer, content }: AuthShellProps) => {
  const { lang, isRTL, t } = useLanguage();
  const siteLogo = useBrandingAsset("logo_navbar", logoFallback);
  const l = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const showBrand = content?.show_brand_panel !== false;
  const badge = isRTL ? content?.brand_badge_ar : content?.brand_badge;
  const headline = isRTL ? content?.brand_headline_ar : content?.brand_headline;
  const benefitsRaw = isRTL ? content?.brand_benefits_ar : content?.brand_benefits;
  const benefits = benefitsRaw && benefitsRaw.length > 0 ? benefitsRaw : fallbackBenefits(l);
  const brandFooter = isRTL ? content?.brand_footer_text_ar : content?.brand_footer_text;

  // Background — image wins, otherwise gradient
  const bgImage = content?.background_image_url ?? null;
  const gradFrom = content?.background_gradient_from || "hsl(var(--primary))";
  const gradTo = content?.background_gradient_to || "hsl(var(--accent))";
  const overlay = content?.background_overlay_opacity ?? 0;

  const asideStyle: React.CSSProperties = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundImage: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` };

  // Logo: only render in brand panel when logo_visible is true.
  const brandLogoVisible = content?.logo_visible === true;
  const brandLogoSrc = content?.logo_url || siteLogo;
  const brandLogoPos = content?.logo_position ?? "top-left";

  // Foreground illustration
  const illustration = content?.illustration_url ?? null;
  const illustrationAlign = content?.illustration_alignment ?? "center";
  const illustrationMaxW = content?.illustration_max_width ?? 420;

  const renderBrandLogo = () => (
    <Link to={localizeInternalPath("/", lang)} className="inline-flex items-center gap-2">
      <img
        src={brandLogoSrc}
        alt="Logo"
        className={`h-10 w-auto ${content?.logo_url ? "" : "brightness-0 invert"}`}
      />
    </Link>
  );

  // Top slot: only used when logo position is top-left or top-center.
  const topSlot =
    brandLogoVisible && brandLogoPos !== "above-headline" ? (
      <div
        className={`relative z-10 ${brandLogoPos === "top-center" ? "flex justify-center" : ""}`}
      >
        {renderBrandLogo()}
      </div>
    ) : (
      // Reserve space so the layout stays balanced even without a top logo.
      <div className="relative z-10 h-10" aria-hidden />
    );

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen bg-background text-foreground grid ${showBrand ? "lg:grid-cols-2" : "grid-cols-1"}`}
    >
      {/* Brand panel */}
      {showBrand && (
        <aside
          className="relative hidden lg:flex flex-col justify-between overflow-hidden text-primary-foreground p-12"
          style={asideStyle}
        >
          {/* Optional dark overlay */}
          {overlay > 0 && (
            <div
              className="pointer-events-none absolute inset-0 bg-foreground"
              style={{ opacity: overlay }}
            />
          )}
          {/* Decorative orbs (only when no image and no pattern) */}
          {!bgImage && (content?.pattern_overlay ?? "none") === "none" && (
            <>
              <div className="pointer-events-none absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-accent/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-40 -right-32 w-[32rem] h-[32rem] rounded-full bg-primary-foreground/10 blur-3xl" />
            </>
          )}

          {/* Pattern overlay (above background, below content) */}
          <PatternOverlay content={content} />

          {topSlot}

          <div className="relative z-10 flex flex-col gap-8 max-w-md">
            {illustration && illustrationAlign === "top" && (
              <img
                src={illustration}
                alt=""
                className="w-full h-auto object-contain"
                style={{ maxWidth: illustrationMaxW }}
              />
            )}

            <div>
              {brandLogoVisible && brandLogoPos === "above-headline" && (
                <div className="mb-4">{renderBrandLogo()}</div>
              )}
              {badge && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/25">
                  <Sparkles className="w-3.5 h-3.5" />
                  {badge}
                </span>
              )}
              {headline && (
                <h2 className="mt-4 text-3xl xl:text-4xl font-bold leading-tight">{headline}</h2>
              )}
            </div>

            {illustration && illustrationAlign === "center" && (
              <img
                src={illustration}
                alt=""
                className="w-full h-auto object-contain"
                style={{ maxWidth: illustrationMaxW }}
              />
            )}

            {benefits.length > 0 && (
              <ul className="space-y-5">
                {benefits.map((b, idx) => {
                  const Icon = ICONS[b.icon ?? "Sparkles"] ?? Sparkles;
                  return (
                    <li key={`${b.title}-${idx}`} className="flex items-start gap-3">
                      <span className="shrink-0 w-9 h-9 rounded-lg bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </span>
                      <div>
                        {b.title && <p className="font-semibold text-sm">{b.title}</p>}
                        {b.desc && (
                          <p className="text-sm text-primary-foreground/75 mt-0.5 leading-relaxed">
                            {b.desc}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {illustration && illustrationAlign === "bottom" && (
              <img
                src={illustration}
                alt=""
                className="w-full h-auto object-contain"
                style={{ maxWidth: illustrationMaxW }}
              />
            )}
          </div>

          {brandFooter && (
            <p className="relative z-10 text-xs text-primary-foreground/60">{brandFooter}</p>
          )}
        </aside>
      )}

      {/* Form panel */}
      <section className="flex flex-col px-5 py-8 sm:px-10 lg:px-14 xl:px-20">
        <div className="lg:hidden mb-8">
          <Link to={localizeInternalPath("/", lang)}>
            <img src={siteLogo} alt="Logo" className="h-9 w-auto" />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 text-sm text-muted-foreground text-center">{footer}</div>}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link to={localizeInternalPath("/", lang)} className="hover:text-foreground transition-colors">
            ← {t("nav.home") || l("Back to home", "العودة للرئيسية")}
          </Link>
        </p>
      </section>
    </main>
  );
};

export default AuthShell;
