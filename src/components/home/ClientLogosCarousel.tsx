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
    <section className="py-14 bg-muted/30 border-y border-border overflow-hidden">
      <EditableText
        page="home"
        section="client_logos"
        contentKey="label"
        fallback={
          isRTL
            ? "موثوق من الحكومات والمؤسسات والشركات في دول الخليج"
            : "Trusted by Governments, Enterprises and Businesses Across the GCC"
        }
        className="block text-center text-sm text-foreground/70 font-semibold uppercase tracking-[0.2em] mb-8"
      />
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />
        <div
          className="flex items-center whitespace-nowrap w-max animate-marquee"
          style={{ animationDuration: `${Math.max(20, logos.length * 4)}s` }}
        >
          {display.map((logo, i) => {
            const img = (
              <img
                src={logo.logo_url}
                alt={logo.company_name}
                className="h-14 md:h-16 w-auto object-contain shrink-0 opacity-100 hover:scale-105 transition-transform duration-300 select-none mx-8"
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
        </div>
      </div>
    </section>
  );
};

export default ClientLogosCarousel;
