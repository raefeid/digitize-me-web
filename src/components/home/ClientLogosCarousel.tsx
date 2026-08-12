import { useLanguage } from "@/i18n/LanguageContext";
import { useClientLogos } from "@/hooks/useClientLogos";
import EditableText from "@/components/cms/EditableText";

/**
 * Client logos carousel. Uses published rows from the `client_logos` table when
 * present (admin-managed via the CMS); otherwise falls back to the bundled
 * default set below. The defaults live in public/logos/ so they are same-origin
 * and render on any host without a database seed.
 */
const DEFAULT_LOGOS = [
  { id: "def-dubai-municipality", company_name: "Dubai Municipality", logo_url: "/logos/dubai-municipality.png", link_url: null as string | null },
  { id: "def-dubai-det", company_name: "Dubai Department of Economy and Tourism", logo_url: "/logos/dubai-det.svg", link_url: null as string | null },
  { id: "def-rta", company_name: "Roads and Transport Authority", logo_url: "/logos/rta-new.png", link_url: null as string | null },
  { id: "def-gov-sharjah", company_name: "Government of Sharjah", logo_url: "/logos/gov-sharjah.png", link_url: null as string | null },
  { id: "def-gov-uaq", company_name: "Government of Umm Al Quwain", logo_url: "/logos/gov-uaq.png", link_url: null as string | null },
  { id: "def-rak-municipality", company_name: "Ras Al Khaimah Municipality", logo_url: "/logos/rak-municipality.png", link_url: null as string | null },
  { id: "def-cbd", company_name: "Commercial Bank of Dubai", logo_url: "/logos/cbd.png", link_url: null as string | null },
  { id: "def-qnb", company_name: "QNB", logo_url: "/logos/qnb.webp", link_url: null as string | null },
  { id: "def-du", company_name: "du", logo_url: "/logos/du.png", link_url: null as string | null },
  { id: "def-union-insurance", company_name: "Union Insurance", logo_url: "/logos/union-insurance.png", link_url: null as string | null },
  { id: "def-globalpharma", company_name: "Global Pharma", logo_url: "/logos/globalpharma.png", link_url: null as string | null },
  { id: "def-eneo", company_name: "ENEO", logo_url: "/logos/eneo.png", link_url: null as string | null },
];

const ClientLogosCarousel = () => {
  const { isRTL } = useLanguage();
  const { data = [], isLoading } = useClientLogos();
  // Ignore legacy Lovable-CDN URLs (/__l5e/…) — they don't resolve on our own
  // host. Valid admin uploads (Supabase storage URLs) still take precedence.
  const published = data.filter((l) => l.published && !l.logo_url.startsWith("/__l5e/"));
  const logos = published.length > 0 ? published : DEFAULT_LOGOS;

  if (isLoading) return null;

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
            ? "مدعوم من Infasme — موثوق من الجهات الحكومية في دولة الإمارات"
            : "Powered by Infasme — trusted by government entities across the UAE"
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
      <EditableText
        page="home"
        section="client_logos"
        contentKey="sublabel"
        fallback={
          isRTL
            ? "‏Digitize me هي المنصة الرائدة من Infasme"
            : "Digitize me is the flagship platform from Infasme"
        }
        className="block text-center text-xs text-foreground/50 mt-6"
      />
    </section>
  );
};

export default ClientLogosCarousel;
