import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getLanguageFromPath, isLocalizablePublicPath } from "@/lib/localizedRoutes";

export type Language = "en" | "ar";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};

import { translations } from "@/i18n/translations";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [lang, setLangState] = useState<Language>(() => {
    const initialPath = typeof window !== "undefined" ? window.location.pathname : "/";
    if (isLocalizablePublicPath(initialPath)) {
      return getLanguageFromPath(initialPath);
    }
    const saved = localStorage.getItem("dm-lang");
    if (saved === "ar") return "ar";
    // Migrate any legacy "fr" preference to English
    if (saved === "fr") {
      localStorage.setItem("dm-lang", "en");
      return "en";
    }
    return "en";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("dm-lang", newLang);
  };

  useEffect(() => {
    if (!isLocalizablePublicPath(location.pathname)) return;
    const routeLang = getLanguageFromPath(location.pathname);
    setLangState((current) => {
      if (current === routeLang) return current;
      localStorage.setItem("dm-lang", routeLang);
      return routeLang;
    });
  }, [location.pathname]);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const isRTL = lang === "ar";

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  };

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
    document.body.style.fontFamily =
      lang === "ar"
        ? '"Noto Sans Arabic", "Plus Jakarta Sans", system-ui, sans-serif'
        : '"Plus Jakarta Sans", system-ui, sans-serif';
  }, [lang, dir]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};
