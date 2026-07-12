import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export type Region = "EG" | "AE" | "SA" | "DEFAULT";

export interface GeoInfo {
  region: Region;
  country: string;
  currency: string;
  currencySymbol: string;
  loading: boolean;
}

const regionMap: Record<string, Region> = {
  EG: "EG",
  AE: "AE",
  SA: "SA", // Saudi Arabia → SAR pricing (own region, separate from AED)
  BH: "AE", QA: "AE", KW: "AE", OM: "AE", // Other GCC → AED pricing
};

const currencyMap: Record<Region, { code: string; symbol: string }> = {
  EG: { code: "EGP", symbol: "ج.م" },
  AE: { code: "AED", symbol: "د.إ" },
  SA: { code: "SAR", symbol: "ر.س" },
  DEFAULT: { code: "USD", symbol: "$" },
};

const GeoContext = createContext<GeoInfo>({
  region: "DEFAULT",
  country: "",
  currency: "USD",
  currencySymbol: "$",
  loading: true,
});

export const useGeo = ({ respectLanguageOverride = true }: { respectLanguageOverride?: boolean } = {}): GeoInfo => {
  const ctx = useContext(GeoContext);
  useLanguage();
  return useMemo(() => ctx, [ctx, respectLanguageOverride]);
};

export const GeoProvider = ({ children }: { children: ReactNode }) => {
  const [geo, setGeo] = useState<GeoInfo>({
    region: "DEFAULT",
    country: "",
    currency: "USD",
    currencySymbol: "$",
    loading: true,
  });

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Try primary API
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          const countryCode = data.country_code || "";
          const region = regionMap[countryCode] || "DEFAULT";
          const cur = currencyMap[region];
          setGeo({ region, country: countryCode, currency: cur.code, currencySymbol: cur.symbol, loading: false });
          return;
        }
      } catch {
        // fallback
      }

      try {
        // Fallback API
        const res = await fetch("https://ip2c.org/s", { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const text = await res.text();
          const parts = text.split(";");
          if (parts[0] === "1") {
            const countryCode = parts[1] || "";
            const region = regionMap[countryCode] || "DEFAULT";
            const cur = currencyMap[region];
            setGeo({ region, country: countryCode, currency: cur.code, currencySymbol: cur.symbol, loading: false });
            return;
          }
        }
      } catch {
        // default
      }

      setGeo(prev => ({ ...prev, loading: false }));
    };

    // Check if user manually set a region
    const saved = localStorage.getItem("dm-region");
    if (saved && (saved === "EG" || saved === "AE" || saved === "SA" || saved === "DEFAULT")) {
      const cur = currencyMap[saved as Region];
      setGeo({ region: saved as Region, country: saved, currency: cur.code, currencySymbol: cur.symbol, loading: false });
    } else {
      detectCountry();
    }
  }, []);

  return <GeoContext.Provider value={geo}>{children}</GeoContext.Provider>;
};
