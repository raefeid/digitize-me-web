import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useClientLogos } from "@/hooks/useClientLogos";
import EditableText from "@/components/cms/EditableText";

/**
 * Higher-fidelity client logos carousel using uploaded images stored in
 * the dedicated `client_logos` table. Hidden when empty so the existing
 * `TrustedBySection` (which falls back to text names) remains the primary
 * trust strip until admins upload real logos.
 */
const ClientLogosCarousel = () => {
  const { isRTL } = useLanguage();
  const { data = [], isLoading } = useClientLogos();
  const logos = data.filter((l) => l.published);

  if (isLoading || logos.length === 0) return null;

  // Duplicate for seamless infinite scroll
  const display = [...logos, ...logos];

  return (
    <section className="py-10 bg-background border-y border-border/60 overflow-hidden">
      <EditableText
        page="home"
        section="client_logos"
        contentKey="label"
        fallback={isRTL ? "شركات تثق بنا" : "Companies that trust us"}
        className="block text-center text-xs text-muted-foreground/70 font-semibold uppercase tracking-[0.2em] mb-6"
      />
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-12 items-center whitespace-nowrap"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {display.map((logo, i) => {
            const img = (
              <img
                src={logo.logo_url}
                alt={logo.company_name}
                className="h-10 md:h-12 w-auto object-contain shrink-0 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300 select-none"
                loading="lazy"
              />
            );
            return logo.link_url ? (
              <a
                key={`${logo.id}-${i}`}
                href={logo.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                {img}
              </a>
            ) : (
              <span key={`${logo.id}-${i}`} className="shrink-0">
                {img}
              </span>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ClientLogosCarousel;
