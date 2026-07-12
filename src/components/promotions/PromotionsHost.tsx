import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Sparkles } from "lucide-react";
import {
  Promo,
  dismissPromo,
  isPromoDismissed,
  isPromoLive,
  useLocalizedPromo,
  usePromotions,
} from "@/hooks/usePromotions";
import { targetToAnchor } from "@/hooks/useCtaTargets";
import { useEditMode } from "@/components/cms/EditModeContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { localizeInternalPath } from "@/lib/localizedRoutes";

/* ----------------------------- shared helpers ----------------------------- */

/** Theme classes (uses semantic design tokens — no raw colors). */
const themeClasses: Record<Promo["theme"], { bar: string; chip: string; ring: string }> = {
  accent:  { bar: "bg-accent text-accent-foreground",                chip: "bg-accent-foreground/15 text-accent-foreground",  ring: "ring-accent/30" },
  success: { bar: "bg-emerald-600 text-white",                        chip: "bg-white/15 text-white",                          ring: "ring-emerald-500/30" },
  warning: { bar: "bg-amber-500 text-amber-950",                      chip: "bg-amber-950/10 text-amber-950",                  ring: "ring-amber-500/30" },
  info:    { bar: "bg-sky-600 text-white",                            chip: "bg-white/15 text-white",                          ring: "ring-sky-500/30" },
  dark:    { bar: "bg-foreground text-background",                    chip: "bg-background/15 text-background",                ring: "ring-foreground/30" },
};

/** Render the CTA as a Link / <a> / nothing depending on its kind. */
const PromoCta = ({ promo, label, className }: { promo: Promo; label: string; className: string }) => {
  const { lang } = useLanguage();
  if (promo.ctaKind === "none" || !promo.ctaValue || !label) return null;
  if (promo.ctaKind === "link") {
    return <Link to={localizeInternalPath(promo.ctaValue, lang)} className={className}>{label}</Link>;
  }
  const anchor = targetToAnchor({ kind: promo.ctaKind, value: promo.ctaValue });
  if (!anchor) return null;
  return (
    <a
      href={anchor.href}
      {...(anchor.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
    >
      {label}
    </a>
  );
};

/* --------------------------- Top announcement bar --------------------------- */

const PromoBar = ({ promo }: { promo: Promo }) => {
  const t = themeClasses[promo.theme];
  const { headline, body, ctaLabel } = useLocalizedPromo(promo);
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className={`relative w-full ${t.bar} shadow-sm`} role="region" aria-label="Site promotion">
      <div className="container-max px-4 py-2.5 flex items-center justify-center gap-3 flex-wrap text-sm">
        <Sparkles size={14} className="opacity-70 hidden sm:inline shrink-0" />
        {headline && <span className="font-semibold">{headline}</span>}
        {body && <span className="opacity-90 hidden sm:inline">— {body}</span>}
        <PromoCta
          promo={promo}
          label={ctaLabel}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${t.chip} hover:opacity-90 transition-opacity`}
        />
      </div>
      <button
        type="button"
        onClick={() => { dismissPromo(promo); setHidden(true); }}
        aria-label="Dismiss promotion"
        className={`absolute top-1/2 -translate-y-1/2 ${promo.headline ? "right-3" : "right-3"} p-1 rounded-md hover:bg-black/10 transition-colors`}
      >
        <X size={14} />
      </button>
    </div>
  );
};

/* --------------------------------- Popup --------------------------------- */

const PromoPopup = ({ promo }: { promo: Promo }) => {
  const t = themeClasses[promo.theme];
  const { headline, body, ctaLabel } = useLocalizedPromo(promo);
  const [open, setOpen] = useState(false);

  // Trigger after a short delay so the popup doesn't slam the user instantly
  useEffect(() => {
    const id = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  if (!open) return null;
  const close = () => { dismissPromo(promo); setOpen(false); };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`promo-${promo.id}-title`}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-in fade-in"
      onClick={close}
    >
      <div
        className={`relative w-full max-w-md bg-card rounded-2xl shadow-2xl ring-1 ${t.ring} overflow-hidden animate-in zoom-in-95`}
        onClick={(e) => e.stopPropagation()}
      >
        {promo.imageUrl && (
          <div className="h-44 w-full bg-muted overflow-hidden">
            <img src={promo.imageUrl} alt={headline || "Promotion"} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
        <button
          type="button"
          onClick={close}
          aria-label="Close promotion"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur text-foreground hover:bg-background flex items-center justify-center shadow-md"
        >
          <X size={16} />
        </button>
        <div className="p-6 space-y-3 text-center">
          {headline && (
            <h3 id={`promo-${promo.id}-title`} className="text-2xl font-bold text-foreground">
              {headline}
            </h3>
          )}
          {body && <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>}
          <PromoCta
            promo={promo}
            label={ctaLabel}
            className={`mt-2 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm ${t.bar} hover:opacity-90 transition-opacity`}
          />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------- Inline -------------------------------- */

export const InlinePromoSection = ({ promo }: { promo: Promo }) => {
  const t = themeClasses[promo.theme];
  const { headline, body, ctaLabel } = useLocalizedPromo(promo);
  return (
    <section className="section-padding">
      <div className="container-max px-4">
        <div className={`relative rounded-3xl overflow-hidden shadow-xl ${t.bar}`}>
          <div className="grid md:grid-cols-2 gap-0 items-center">
            {promo.imageUrl && (
              <div className="h-56 md:h-full w-full overflow-hidden order-last md:order-first">
                <img src={promo.imageUrl} alt={headline || "Promotion"} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <div className={`p-8 md:p-12 ${promo.imageUrl ? "" : "md:col-span-2 text-center"}`}>
              {headline && <h3 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">{headline}</h3>}
              {body && <p className="opacity-90 text-base md:text-lg mb-6 leading-relaxed">{body}</p>}
              <PromoCta
                promo={promo}
                label={ctaLabel}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold ${t.chip} hover:opacity-90 transition-opacity`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Render every active inline promo for a given page slot (currently always "home"). */
export const InlinePromotions = () => {
  const { promos } = usePromotions();
  const visible = useMemo(
    () => promos.filter((p) => p.mode === "inline" && isPromoLive(p)),
    [promos]
  );
  if (visible.length === 0) return null;
  return <>{visible.map((p) => <InlinePromoSection key={p.id} promo={p} />)}</>;
};

/* ------------------------ App-wide bar/popup mount ------------------------ */

/**
 * Mounts at the app root and decides which non-inline promos to show.
 * - Hidden on /admin* routes so admins can configure without overlays in the way.
 * - Honors per-promo dismiss rules + schedule.
 * - Re-checks `isPromoDismissed` on each render so saving a promo with
 *   dismiss="always" surfaces it again immediately for testing.
 */
export const PromotionsHost = () => {
  const { promos } = usePromotions();
  const { enabled: editing } = useEditMode();
  const location = useLocation();
  const onAdmin = location.pathname.startsWith("/admin");

  const live = useMemo(
    () => promos.filter((p) => p.mode !== "inline" && isPromoLive(p)),
    [promos]
  );
  if (onAdmin || live.length === 0) return null;

  // First active bar (only one at a time to avoid stacking)
  const bar = live.find((p) => p.mode === "bar" && (editing || !isPromoDismissed(p)));
  // First active popup
  const popup = live.find((p) => p.mode === "popup" && (editing || !isPromoDismissed(p)));

  return (
    <>
      {bar && <PromoBar key={bar.id} promo={bar} />}
      {popup && <PromoPopup key={popup.id} promo={popup} />}
    </>
  );
};
