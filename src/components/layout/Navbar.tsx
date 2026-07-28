import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Menu, X, Globe, ChevronDown, ChevronRight, ChevronLeft, Sparkles, LogIn, UserPlus, LogOut, Plug, Layers } from "lucide-react";
import CtaButton from "@/components/cms/CtaButton";
import EditableText from "@/components/cms/EditableText";
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/i18n/LanguageContext";
import { useDynamicIndustries } from "@/hooks/useDynamicIndustries";
import { useFeatures } from "@/hooks/useFeatures";
import { useAuth } from "@/hooks/useAuth";
import logoFallback from "@/assets/digitizeme-logo-light.png";
import { useBrandingAsset } from "@/hooks/useBranding";
import { useNavItems, navItemHref } from "@/hooks/useNavItems";
import { useCustomPages } from "@/hooks/useCustomPages";
import { launchExternal } from "@/components/transitions/LaunchOverlay";

import { localizeInternalPath, switchLanguagePath } from "@/lib/localizedRoutes";

type MobileNavNode = {
  id: string;
  label: string;
  href: string;
  external: boolean;
  newTab: boolean;
  children?: MobileNavNode[];
  iconName?: string | null;
};

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "عربي", flag: "🇦🇪" },
];

const FeatureIcon = ({ name, className }: { name?: string | null; className?: string }) => {
  if (!name) return <Sparkles className={className} />;
  const Cmp = (LucideIcons as any)[name];
  if (!Cmp) return <Sparkles className={className} />;
  return <Cmp className={className} />;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [featuresFlyoutOpen, setFeaturesFlyoutOpen] = useState(false);
  const [mobileOpenIds, setMobileOpenIds] = useState<string[]>([]);
  const langRef = useRef<HTMLDivElement>(null);
  const industriesRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const industriesTimeout = useRef<ReturnType<typeof setTimeout>>();
  const productTimeout = useRef<ReturnType<typeof setTimeout>>();
  const featuresFlyoutTimeout = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang, isRTL } = useLanguage();
  const { user, signOut, isCustomer } = useAuth();
  // The navbar auth buttons are for CUSTOMERS only — admins use /admin-login separately.
  // Show "Log out" only when the signed-in user holds the customer role.
  const showCustomerSignedIn = !!user && isCustomer;
  const { publishedList: industriesData, getName: getCustomIndustryName } = useDynamicIndustries();
  const { data: featuresData } = useFeatures();
  const publishedFeatures = (featuresData ?? []).filter((f) => f.published);
  const logo = useBrandingAsset("logo_navbar", logoFallback);
  const { data: navbarItems } = useNavItems("navbar");
  const { data: customPages } = useCustomPages({ includeDrafts: false });
  const pagesById = (customPages ?? []).reduce<Record<string, { slug: string }>>((acc, p) => {
    acc[p.id] = { slug: p.slug };
    return acc;
  }, {});
  const customNavTopLevel = (navbarItems ?? []).filter((n) => n.published && !n.parent_id);

  // Routes that have built-in mega-dropdowns. CMS rows matching these routes
  // keep the dropdown UX; their CMS label / order / visibility are honoured.
  const dropdownByRoute: Record<string, "industries" | "product"> = {
    "/industries": "industries",
    "/product": "product",
  };

  const arabicTopLevelLabels: Record<string, string> = {
    "/product": "المنتج",
    "/industries": "القطاعات",
    "/pricing": "الأسعار",
    "/about": "من نحن",
    "/contact": "تواصل معنا",
  };

  // Fallback shown only when nav_items table is empty (first run).
  // Note: "Home" is intentionally omitted — clicking the logo returns home.
  // Features live inside the Product dropdown; Blog lives in footer.
  const defaultNavLinks = [
    { label: t("nav.product"), href: "/product", dropdown: "product" as const, external: false, newTab: false },
    { label: t("nav.industries"), href: "/industries", dropdown: "industries" as const, external: false, newTab: false },
    { label: t("nav.pricing"), href: "/pricing", dropdown: null, external: false, newTab: false },
    { label: isRTL ? "من نحن" : t("nav.about"), href: "/about", dropdown: null, external: false, newTab: false },
    { label: t("nav.contact"), href: "/contact", dropdown: null, external: false, newTab: false },
  ];

  const cmsNavLinks = customNavTopLevel
    // Hide any CMS-managed "Home" entry — the logo handles home navigation.
    .filter((n) => {
      const href = navItemHref(n, pagesById);
      return href !== "/" && href !== `/${lang === "ar" ? "ar" : ""}`;
    })
    .map((n) => {
      const baseHref = navItemHref(n, pagesById);
      const href = localizeInternalPath(baseHref, lang);
      const label = isRTL ? (arabicTopLevelLabels[baseHref] || n.label_ar || n.label) : n.label;
      return {
        label,
        href,
        dropdown: (n.target_type === "route" ? dropdownByRoute[baseHref] : null) ?? null,
        external: n.target_type === "external",
        newTab: n.open_in_new_tab,
      };
    });

  // Hide Features and Blog from top-level — Features live inside Product; Blog lives in footer.
  const topLevelBlacklist = new Set(["/features", "/blog", "/ar/features", "/ar/blog"]);
  const baseNavLinks = (cmsNavLinks.length > 0 ? cmsNavLinks : defaultNavLinks).filter((l) => !topLevelBlacklist.has(l.href));
  const hasAbout = baseNavLinks.some((l) => l.href === "/about");
  const navLinks = hasAbout ? baseNavLinks : [...baseNavLinks, defaultNavLinks.find((l) => l.href === "/about")!];

  const toggleMobileNode = (id: string) => {
    setMobileOpenIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const getGeneratedChildren = (parentHref: string, parentId: string): MobileNavNode[] => {
    if (parentHref === "/industries") {
      return industriesData.map((industry) => ({
        id: `${parentId}-industry-${industry.slug}`,
        label: industry.isCustom
          ? (getCustomIndustryName(industry.slug, lang === "ar" ? "ar" : "en") || industry.name)
          : (t(`ind.${industry.slug}`) || industry.name),
        href: localizeInternalPath(`/industries/${industry.slug}`, lang),
        external: false,
        newTab: false,
        iconName: industry.icon?.displayName ?? industry.icon?.name ?? null,
      }));
    }

    if (parentHref === "/product") {
      const featureChildren: MobileNavNode[] = publishedFeatures.map((feature) => ({
        id: `${parentId}-feature-${feature.id}`,
        label: (lang === "ar" && feature.hero_title_ar) || feature.hero_title,
        href: `/features/${feature.slug}`,
        external: false,
        newTab: false,
        iconName: feature.icon,
      }));
      return featureChildren;
    }

    return [];
  };

  const cmsMobileTree: MobileNavNode[] = (navbarItems ?? []).some((n) => n.published)
    ? customNavTopLevel
        .filter((item) => {
          const href = navItemHref(item, pagesById);
          return !topLevelBlacklist.has(href);
        })
        .map((item) => {
          const href = navItemHref(item, pagesById);
          const savedChildren = (navbarItems ?? [])
            .filter((child) => child.published && child.parent_id === item.id)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((child) => ({
              id: child.id,
              label: (isRTL && child.label_ar) || child.label,
              href: navItemHref(child, pagesById),
              external: child.target_type === "external",
              newTab: child.open_in_new_tab,
            }));
          const generatedChildren = getGeneratedChildren(href, item.id);

          return {
            id: item.id,
            label: isRTL ? (arabicTopLevelLabels[href] || item.label_ar || item.label) : item.label,
            href,
            external: item.target_type === "external",
            newTab: item.open_in_new_tab,
            children: [...savedChildren, ...generatedChildren],
          };
        })
    : [];

  const hasAboutMobile = cmsMobileTree.some((n) => n.href === "/about");
  const mobileNavTree: MobileNavNode[] = (navbarItems ?? []).some((n) => n.published)
    ? (hasAboutMobile ? cmsMobileTree : [...cmsMobileTree, {
        id: "default-/about",
        label: isRTL ? (arabicTopLevelLabels["/about"] || t("nav.about")) : t("nav.about"),
        href: "/about",
        external: false,
        newTab: false,
        children: [],
      }])
    : defaultNavLinks
        .filter((link) => !topLevelBlacklist.has(link.href))
        .map((link) => ({
          id: `default-${link.href}`,
          label: link.label,
          href: link.href,
          external: link.external,
          newTab: link.newTab,
          children: link.href === "/industries"
            ? getGeneratedChildren(link.href, `default-${link.href}`)
            : link.href === "/product"
              ? getGeneratedChildren(link.href, `default-${link.href}`)
              : [],
        }));

  const currentLang = languages.find((l) => l.code === lang)!;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (industriesRef.current && !industriesRef.current.contains(e.target as Node)) setIndustriesOpen(false);
      if (productRef.current && !productRef.current.contains(e.target as Node)) setProductOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleEnter = (which: "industries" | "product") => {
    if (which === "industries") {
      clearTimeout(industriesTimeout.current);
      setIndustriesOpen(true);
    } else {
      clearTimeout(productTimeout.current);
      setProductOpen(true);
    }
  };

  const handleLeave = (which: "industries" | "product") => {
    if (which === "industries") {
      industriesTimeout.current = setTimeout(() => setIndustriesOpen(false), 200);
    } else {
      productTimeout.current = setTimeout(() => {
        setProductOpen(false);
        setFeaturesFlyoutOpen(false);
      }, 200);
    }
  };

  const handleFeaturesFlyoutEnter = () => {
    clearTimeout(featuresFlyoutTimeout.current);
    setFeaturesFlyoutOpen(true);
  };
  const handleFeaturesFlyoutLeave = () => {
    featuresFlyoutTimeout.current = setTimeout(() => setFeaturesFlyoutOpen(false), 180);
  };

  const handleLanguageChange = (nextLang: Language) => {
    setLang(nextLang);
    navigate(switchLanguagePath(`${location.pathname}${location.search}${location.hash}`, nextLang));
  };

  const colSize = Math.ceil(industriesData.length / 3);
  const columns = [
    industriesData.slice(0, colSize),
    industriesData.slice(colSize, colSize * 2),
    industriesData.slice(colSize * 2),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="container-max px-4 sm:px-6 lg:px-8 pt-3 md:pt-4">
        <div className="flex items-center justify-between min-h-[60px] md:min-h-[72px] bg-card/95 backdrop-blur-xl border border-border/70 rounded-[1.75rem] px-4 md:px-6 lg:px-5 xl:px-4 2xl:px-7 shadow-[0_10px_30px_hsl(var(--foreground)/0.06)] gap-2 xl:gap-2 2xl:gap-3">
          {/* Logo */}
          <Link to={localizeInternalPath("/", lang)} className="flex items-center shrink-0 min-w-0">
            <img src={logo} alt="Digitize me" className="h-9 md:h-10 2xl:h-12 w-auto" />
          </Link>

          {/* Desktop Nav, center pill */}
          <div className="hidden xl:flex flex-1 min-w-0 justify-center px-2">
            <div className="flex items-center gap-0.5 xl:gap-0.5 2xl:gap-1 bg-muted/60 rounded-[1.15rem] px-1 xl:px-1.5 2xl:px-2 py-1.5 border border-border/40 max-w-full">
            {navLinks.map((link) => {
              if (link.dropdown === "product") {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    ref={productRef}
                    onMouseEnter={() => handleEnter("product")}
                    onMouseLeave={() => handleLeave("product")}
                  >
                    <Link
                      to={link.href}
                      className={`flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 2xl:px-4 py-2 rounded-xl text-[0.95rem] 2xl:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        location.pathname.startsWith("/product") || location.pathname.startsWith("/features")
                          ? "text-accent bg-card shadow-[0_4px_12px_hsl(var(--foreground)/0.06)]"
                          : "text-muted-foreground hover:text-foreground hover:bg-card/80"
                      }`}
                    >
                      {link.label}
                      <ChevronDown size={13} className={`transition-transform duration-200 ${productOpen ? "rotate-180" : ""}`} />
                    </Link>

                    {productOpen && (
                      <div className={`absolute top-full mt-3 ${isRTL ? "right-0" : "left-1/2 -translate-x-1/2"} bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-[0_22px_50px_hsl(var(--foreground)/0.12)] py-2 px-2 z-50 w-[210px] animate-in fade-in-0 zoom-in-95 duration-150`}>
                        <Link
                          to={localizeInternalPath("/product", lang)}
                          onClick={() => { setProductOpen(false); setFeaturesFlyoutOpen(false); }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            location.pathname === "/product" || location.pathname === "/ar/product"
                              ? "text-accent bg-accent/10 font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                          }`}
                        >
                          {isRTL ? "نظرة عامة" : "Overview"}
                        </Link>

                        {publishedFeatures.length > 0 && (
                          <>
                            <div className="mx-3 my-1.5 h-px bg-border/60" />
                            <p className="px-3 pb-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                              {isRTL ? "الميزات" : "Features"}
                            </p>
                            {publishedFeatures.map((f) => {
                              const title = (lang === "ar" && f.hero_title_ar) || f.hero_title;
                              const active = location.pathname === `/features/${f.slug}`;
                              return (
                                <Link
                                  key={f.id}
                                  to={`/features/${f.slug}`}
                                  onClick={() => { setProductOpen(false); setFeaturesFlyoutOpen(false); }}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    active ? "text-accent bg-accent/10 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                  }`}
                                >
                                  <FeatureIcon name={f.icon} className="w-3.5 h-3.5 text-accent/70" />
                                  <span className="truncate">{title}</span>
                                </Link>
                              );
                            })}
                            <Link
                              to={localizeInternalPath("/features", lang)}
                              onClick={() => { setProductOpen(false); setFeaturesFlyoutOpen(false); }}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-accent hover:bg-accent/10 transition-colors font-medium"
                            >
                              {isRTL ? "كل الميزات" : "View all features"}
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              if (link.dropdown === "industries") {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    ref={industriesRef}
                    onMouseEnter={() => handleEnter("industries")}
                    onMouseLeave={() => handleLeave("industries")}
                  >
                    <Link
                      to={link.href}
                        className={`flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 2xl:px-4 py-2 rounded-xl text-[0.95rem] 2xl:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        location.pathname.startsWith("/industries")
                            ? "text-accent bg-card shadow-[0_4px_12px_hsl(var(--foreground)/0.06)]"
                            : "text-muted-foreground hover:text-foreground hover:bg-card/80"
                      }`}
                    >
                      {link.label}
                      <ChevronDown size={13} className={`transition-transform duration-200 ${industriesOpen ? "rotate-180" : ""}`} />
                    </Link>

                    {industriesOpen && (
                      <div className={`absolute top-full mt-3 ${isRTL ? "right-0" : "left-1/2 -translate-x-1/2"} bg-card/95 backdrop-blur-xl border border-border/60 rounded-[1.5rem] shadow-[0_22px_50px_hsl(var(--foreground)/0.12)] py-5 px-6 z-50 w-[620px] animate-in fade-in-0 zoom-in-95 duration-150`}>
                        <div className="flex items-center justify-between mb-3 px-1">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("nav.industries")}</p>
                           <Link to={localizeInternalPath("/industries", lang)} onClick={() => setIndustriesOpen(false)} className="text-xs text-accent hover:underline font-medium">
                            {t("industries.viewAll")} →
                          </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
                          {columns.map((col, ci) => (
                            <div key={ci} className="flex flex-col">
                              {col.map((industry) => {
                                const Icon = industry.icon;
                                return (
                                  <Link
                                    key={industry.slug}
                                    to={`/industries/${industry.slug}`}
                                    onClick={() => setIndustriesOpen(false)}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                                      location.pathname === `/industries/${industry.slug}`
                                        ? "text-accent bg-accent/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                    }`}
                                  >
                                    <Icon size={15} className="text-accent/60 group-hover:text-accent shrink-0 transition-colors" />
                                    <span className="truncate">{industry.isCustom ? (getCustomIndustryName(industry.slug, lang === "ar" ? "ar" : "en") || industry.name) : (t(`ind.${industry.slug}`) || industry.name)}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (link.dropdown === "features" && publishedFeatures.length > 0) {
                // Rendered inside the Product dropdown — not as a standalone pill.
                return null;
              }

              const cls = `px-2.5 xl:px-3 2xl:px-4 py-2 rounded-xl text-[0.95rem] 2xl:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                location.pathname === link.href
                  ? "text-accent bg-card shadow-[0_4px_12px_hsl(var(--foreground)/0.06)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/80"
              }`;
              if ((link as any).external || (link as any).newTab) {
                return (
                  <a key={link.href} href={link.href} target={(link as any).newTab ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>
                    {link.label}
                  </a>
                );
              }
              return (
                <Link key={link.href} to={link.href} className={cls}>
                  {link.label}
                </Link>
              );
            })}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden xl:flex items-center gap-1.5 2xl:gap-2 shrink-0">
            {showCustomerSignedIn && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl h-10 px-3 xl:px-4 text-[0.95rem] 2xl:text-sm whitespace-nowrap"
              >
                <button onClick={() => signOut()} className="flex items-center gap-1.5">
                  <LogOut size={14} />
                  {isRTL ? "تسجيل الخروج" : "Log out"}
                </button>
              </Button>
            )}
            <a
              href="https://fotofind.digitizeme.ae/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { e.preventDefault(); launchExternal("https://fotofind.digitizeme.ae/"); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[0.95rem] 2xl:text-sm font-semibold transition-all whitespace-nowrap text-accent-foreground bg-accent hover:bg-accent/90 h-10 shadow-[0_10px_24px_hsl(var(--accent)/0.28)]"
            >
              {isRTL ? "ابدأ مجانًا" : "Start Free"}
            </a>

            {/* Language toggle — placed to the right of "Start Free" per design */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2.5 2xl:px-3 py-2 rounded-xl text-[0.95rem] 2xl:text-sm text-muted-foreground border border-border/40 bg-card hover:text-foreground hover:bg-muted/50 transition-all whitespace-nowrap h-10"
                aria-label="Switch language"
              >
                <Globe size={15} />
                <span className="text-xs font-medium">{currentLang.flag}</span>
                <ChevronDown size={12} className={`transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div className="absolute top-full mt-3 right-0 bg-card/95 backdrop-blur-xl border border-border/60 rounded-[1.15rem] shadow-[0_18px_40px_hsl(var(--foreground)/0.12)] py-1.5 min-w-[150px] z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { handleLanguageChange(l.code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-sm transition-colors ${
                          lang === l.code ? "text-accent bg-accent/10 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile toggle */}
          <button className="xl:hidden p-2.5 rounded-xl border border-border/40 bg-card text-foreground shrink-0" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="xl:hidden mt-3 bg-card/95 backdrop-blur-xl border border-border/60 rounded-[1.5rem] shadow-[0_18px_40px_hsl(var(--foreground)/0.12)] p-4">
            <div className="flex flex-col gap-1">
              {mobileNavTree.map((item) => (
                <MobileNavItem
                  key={item.id}
                  item={item}
                  locationPath={location.pathname}
                  openIds={mobileOpenIds}
                  onToggle={toggleMobileNode}
                  onNavigate={() => setIsOpen(false)}
                />
              ))}
              <div className="px-3 py-2 mt-1">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">{t("nav.language")}</p>
                <div className="flex gap-2">
                  {languages.map((l) => (
                    <button key={l.code} onClick={() => { handleLanguageChange(l.code); setIsOpen(false); }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        lang === l.code ? "text-accent bg-accent/10" : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
                <a
                  href="https://fotofind.digitizeme.ae/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => { e.preventDefault(); setIsOpen(false); launchExternal("https://fotofind.digitizeme.ae/"); }}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isRTL ? "ابدأ مجانًا" : "Start Free"}
                </a>
            </div>
          </div>

        )}
      </div>
    </nav>
  );
};

const MobileNavItem = ({
  item,
  locationPath,
  openIds,
  onToggle,
  onNavigate,
  depth = 0,
}: {
  item: MobileNavNode;
  locationPath: string;
  openIds: string[];
  onToggle: (id: string) => void;
  onNavigate: () => void;
  depth?: number;
}) => {
  const hasChildren = !!item.children?.length;
  const isOpen = openIds.includes(item.id);
  const isActive = locationPath === item.href || locationPath.startsWith(`${item.href}/`);
  const icon = item.iconName ? <FeatureIcon name={item.iconName} className="w-3.5 h-3.5 text-accent/60 shrink-0" /> : null;
  const itemClass = `w-full flex items-center ${hasChildren ? "justify-between" : ""} gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
    isActive ? "text-accent bg-accent/10" : "text-foreground/70 hover:text-foreground hover:bg-muted/50"
  }`;

  return (
    <div>
      {hasChildren ? (
        <button onClick={() => onToggle(item.id)} className={itemClass}>
          <span className="flex items-center gap-2 min-w-0">
            {icon}
            <span className="truncate">{item.label}</span>
          </span>
          <ChevronDown size={15} className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      ) : item.external || item.newTab ? (
        <a href={item.href} target={item.newTab ? "_blank" : undefined} rel="noopener noreferrer" onClick={onNavigate} className={itemClass}>
          {icon}
          <span className="truncate">{item.label}</span>
        </a>
      ) : (
        <Link to={item.href} onClick={onNavigate} className={itemClass}>
          {icon}
          <span className="truncate">{item.label}</span>
        </Link>
      )}

      {hasChildren && isOpen && (
        <div className={`mt-1 mb-2 flex flex-col gap-0.5 ${depth === 0 ? "ml-3 border-l-2 border-accent/20 pl-3" : "ml-4 pl-2"}`}>
          {(!item.external && !item.newTab) && (
            <Link to={item.href} onClick={onNavigate} className="px-3 py-2 rounded-lg text-sm font-medium text-accent hover:bg-accent/10 transition-colors">
              View {item.label}
            </Link>
          )}
          {item.children?.map((child) => (
            <MobileNavItem
              key={child.id}
              item={child}
              locationPath={locationPath}
              openIds={openIds}
              onToggle={onToggle}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Navbar;
