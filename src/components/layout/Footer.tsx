import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import EditableText from "@/components/cms/EditableText";
import EditableLink from "@/components/cms/EditableLink";
import logoFallback from "@/assets/digitizeme-logo-dark.png";
import fotopiaLogoFallback from "@/assets/fotopia-logo.png";
import { useBrandingAsset } from "@/hooks/useBranding";
import { useNavItems, navItemHref } from "@/hooks/useNavItems";
import { useCustomPages } from "@/hooks/useCustomPages";
import { localizeInternalPath } from "@/lib/localizedRoutes";
import UAEHostingBadge from "@/components/common/UAEHostingBadge";

const Footer = () => {
  const { t, isRTL, lang } = useLanguage();
  const { getContent } = useSiteContent("footer");
  const logo = useBrandingAsset("logo_footer", logoFallback);
  const fotopiaLogo = useBrandingAsset("logo_powered_by", fotopiaLogoFallback);
  const { data: footerItems } = useNavItems("footer");
  const { data: customPages } = useCustomPages({ includeDrafts: false });
  const pagesById = (customPages ?? []).reduce<Record<string, { slug: string }>>((acc, p) => {
    acc[p.id] = { slug: p.slug };
    return acc;
  }, {});
  // Group published top-level footer items by their column heading
  const customColumns = (footerItems ?? [])
    .filter((n) => n.published && !n.parent_id && n.footer_column)
    .reduce<Record<string, typeof footerItems>>((acc, n) => {
      const k = n.footer_column!;
      (acc[k] ||= [] as any).push(n);
      return acc;
    }, {});

  // Social URLs are stored in CMS so admins can update them without code
  const linkedinUrl = getContent("social_linkedin", "#");
  const facebookUrl = getContent("social_facebook", "#");
  const xUrl = getContent("social_x", "#");
  const youtubeUrl = getContent("social_youtube", "#");

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <img src={logo} alt="Digitize me" className="h-14 md:h-[4.5rem] w-auto object-contain" loading="lazy" />
            <EditableText as="p" page="footer" section="brand" contentKey="desc" fallback={t("footer.desc")} multiline className="text-primary-foreground/70 text-sm leading-relaxed" rich />
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <EditableText as="span" page="footer" section="brand" contentKey="poweredBy" fallback={t("footer.poweredBy")} className="text-xs text-primary-foreground/50" />
              <img src={fotopiaLogo} alt="Fotopia Technologies" className="h-10 md:h-12 w-auto opacity-80" loading="lazy" />
            </div>
          </div>

          <div>
            <EditableText as="h4" page="footer" section="cols" contentKey="product_title" fallback={t("footer.product")} className="font-semibold text-sm mb-4 uppercase tracking-wider text-primary-foreground/50 block" />
            <ul className="space-y-3">
              {[
                { keyName: "product_features", ctaKey: "footer_product_features", label: t("footer.features"), href: "/product" },
                { keyName: "product_saas", ctaKey: "footer_product_saas", label: t("footer.saas"), href: "/product#saas" },
                { keyName: "product_onprem", ctaKey: "footer_product_onprem", label: t("footer.onprem"), href: "/product#on-premise" },
                { keyName: "product_aiocr", ctaKey: "footer_product_aiocr", label: t("footer.aiocr"), href: "/product#ai-ocr" },
                { keyName: "product_pricing", ctaKey: "footer_product_pricing", label: t("nav.pricing"), href: "/pricing" },
                { keyName: "product_blog", ctaKey: "footer_product_blog", label: isRTL ? "المدونة" : "Blog", href: "/blog" },
              ].map((link) => (
                <li key={link.ctaKey}>
                  <EditableLink ctaKey={link.ctaKey} defaultTo={link.href} trackingPage="footer_product" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    <EditableText page="footer" section="cols" contentKey={link.keyName} fallback={link.label} />
                  </EditableLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <EditableText as="h4" page="footer" section="cols" contentKey="industries_title" fallback={t("footer.industries")} className="font-semibold text-sm mb-4 uppercase tracking-wider text-primary-foreground/50 block" />
            <ul className="space-y-3">
              {[
                { keyName: "ind_law", ctaKey: "footer_ind_law", label: t("ind.law-firms"), href: "/industries/law-firms" },
                { keyName: "ind_acc", ctaKey: "footer_ind_acc", label: t("ind.accounting"), href: "/industries/accounting" },
                { keyName: "ind_health", ctaKey: "footer_ind_health", label: t("ind.healthcare"), href: "/industries/healthcare" },
                { keyName: "ind_re", ctaKey: "footer_ind_re", label: t("ind.real-estate"), href: "/industries/real-estate" },
                { keyName: "ind_log", ctaKey: "footer_ind_log", label: t("ind.logistics"), href: "/industries/logistics" },
                { keyName: "ind_all", ctaKey: "footer_ind_all", label: t("footer.allIndustries"), href: "/industries" },
              ].map((link) => (
                <li key={link.ctaKey}>
                  <EditableLink ctaKey={link.ctaKey} defaultTo={link.href} trackingPage="footer_industries" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    <EditableText page="footer" section="cols" contentKey={link.keyName} fallback={link.label} />
                  </EditableLink>
                </li>
              ))}
            </ul>
          </div>

          {Object.entries(customColumns).map(([colName, items]) => (
            <div key={colName}>
              <h4 className="font-semibold text-sm mb-4 uppercase tracking-wider text-primary-foreground/50 block">{colName}</h4>
              <ul className="space-y-3">
                {(items ?? []).map((n) => {
                  const href = localizeInternalPath(navItemHref(n, pagesById), lang);
                  const label = (isRTL && n.label_ar) || n.label;
                  const external = n.target_type === "external";
                  return (
                    <li key={n.id}>
                      {external || n.open_in_new_tab ? (
                        <a href={href} target={n.open_in_new_tab ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{label}</a>
                      ) : (
                        <Link to={href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{label}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div>
            <EditableText as="h4" page="footer" section="cols" contentKey="contact_title" fallback={t("footer.contact")} className="font-semibold text-sm mb-4 uppercase tracking-wider text-primary-foreground/50 block" />
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <EditableText page="footer" section="contact" contentKey="address" fallback="Dubai, UAE" />
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail size={16} className="shrink-0" />
                <a href={`mailto:${getContent("email", "info@digitizeme.ae")}`} className="hover:text-primary-foreground transition-colors">
                  <EditableText page="footer" section="contact" contentKey="email" fallback="info@digitizeme.ae" />
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone size={16} className="shrink-0" />
                <a href={`tel:${getContent("phone1", "+97145808611")}`} className="hover:text-primary-foreground transition-colors">
                  <EditableText page="footer" section="contact" contentKey="phone1" fallback="+971 4 580 8611" />
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Phone size={16} className="shrink-0" />
                <a href={`tel:${getContent("phone2", "+971565226587")}`} className="hover:text-primary-foreground transition-colors">
                  <EditableText page="footer" section="contact" contentKey="phone2" fallback="+971 56 522 6587" />
                </a>
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 mt-6">
              <EditableLink ctaKey="footer_social_linkedin" defaultTo={linkedinUrl} trackingPage="footer_social" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </EditableLink>
              <EditableLink ctaKey="footer_social_facebook" defaultTo={facebookUrl} trackingPage="footer_social" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </EditableLink>
              <EditableLink ctaKey="footer_social_x" defaultTo={xUrl} trackingPage="footer_social" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors" aria-label="X">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </EditableLink>
              <EditableLink ctaKey="footer_social_youtube" defaultTo={youtubeUrl} trackingPage="footer_social" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors" aria-label="YouTube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </EditableLink>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs text-primary-foreground/50">
              © {new Date().getFullYear()} <EditableText page="footer" section="legal" contentKey="rights" fallback={t("footer.rights")} />
            </p>
            <UAEHostingBadge variant="footer" />
          </div>
          <div className="flex gap-6 text-xs text-primary-foreground/50">
            <EditableLink ctaKey="footer_legal_privacy" defaultTo="/privacy" trackingPage="footer_legal" className="hover:text-primary-foreground/70 transition-colors">
              <EditableText page="footer" section="legal" contentKey="privacy" fallback={t("footer.privacy")} />
            </EditableLink>
            <EditableLink ctaKey="footer_legal_terms" defaultTo="/terms" trackingPage="footer_legal" className="hover:text-primary-foreground/70 transition-colors">
              <EditableText page="footer" section="legal" contentKey="terms" fallback={t("footer.terms")} />
            </EditableLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
