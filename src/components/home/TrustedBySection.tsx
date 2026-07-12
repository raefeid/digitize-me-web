import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";

const fallbackCompanies = [
  "ADNOC", "Emirates NBD", "Etisalat", "DEWA", "RTA", "Emaar", "DP World", "Majid Al Futtaim",
];

const TrustedBySection = () => {
  const { t } = useLanguage();
  const { getContent } = useSiteContent("home", "trusted");
  const { items: logoItems } = useSiteContent("home", "trusted_logos");

  // Sort logos by sort_order, then duplicate for seamless infinite scroll
  const sortedLogos = [...logoItems].sort((a, b) => a.sort_order - b.sort_order);
  const hasLogos = sortedLogos.length > 0;
  const displayLogos = hasLogos ? [...sortedLogos, ...sortedLogos] : null;
  const displayText = hasLogos ? null : [...fallbackCompanies, ...fallbackCompanies];

  return (
    <section className="py-8 bg-muted/10 overflow-hidden">
      <p className="text-center text-xs text-muted-foreground/60 font-medium uppercase tracking-[0.2em] mb-6">
        {getContent("trusted_title", t("trusted.title"))}
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <motion.div
          className="flex gap-16 items-center whitespace-nowrap"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {displayLogos?.map((logo, i) => (
            <img
              key={`${logo.id}-${i}`}
              src={logo.value}
              alt={logo.value_ar ?? "Trusted partner logo"}
              className="h-10 md:h-12 w-auto object-contain shrink-0 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-300 select-none"
              loading="lazy"
            />
          ))}
          {displayText?.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="text-lg font-bold text-foreground/20 tracking-wide shrink-0 select-none"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedBySection;
