import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Archival-style bilingual hero for Digitize me.
 *
 * Design language:
 * - Asymmetric split: editorial headline on one side, a real scanned-invoice
 *   specimen on the other with a scan-line sweep revealing extracted fields.
 * - Arabic script as a first-class display element, not a toggle.
 * - Warm parchment + ink + brick-stamp red + ledger teal palette.
 */
const ArchivalHero = () => {
  const { isRTL } = useLanguage();

  const enHeadline = "From paper archives to";
  const enHeadlineAccent = "structured data.";
  const enSub =
    "One OCR engine for right-to-left Arabic and left-to-right English. Contracts, invoices, Commercial Registers and TRNs, read with the precision of a notary — not a template.";

  const arDisplay = "توثيق";
  const arCaption = "قراءة عربية أصلية — من الأرشيف إلى البيانات المهيكلة.";

  return (
    <section className="relative overflow-hidden bg-background" aria-label="Bilingual document intelligence">
      {/* Parchment texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--foreground)) 0.6px, transparent 0.6px)",
          backgroundSize: "18px 18px",
        }}
      />
      {/* Ledger rule */}
      <div aria-hidden className="absolute top-8 left-0 right-0 h-px bg-foreground/10" />
      <div aria-hidden className="absolute bottom-8 left-0 right-0 h-px bg-foreground/10" />

      <div className="container-max relative py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: editorial headline */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            {/* Filing marks */}
            <div className="flex items-center gap-4 mb-10 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              <span className="inline-block h-px w-8 bg-accent" />
              <span>File · 001 / DM-AR-EN</span>
              <span className="text-accent">●</span>
              <span>Bilingual engine</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal text-foreground leading-[1.05] tracking-tight mb-6">
              {enHeadline}
              <br />
              <span className="italic text-accent">{enHeadlineAccent}</span>
            </h1>

            {/* Arabic display block, given equal weight */}
            <div dir="rtl" className="mb-8 pt-6 border-t border-foreground/10">
              <div className="font-arabic text-6xl md:text-7xl leading-none text-foreground/90 mb-3">
                {arDisplay}
              </div>
              <p dir="rtl" className="font-arabic text-base text-muted-foreground max-w-md">
                {arCaption}
              </p>
            </div>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-10">
              {enSub}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/pricing"
                className="group inline-flex items-center gap-3 bg-foreground text-background px-7 py-4 font-medium hover:bg-accent transition-colors"
              >
                Start digitizing
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/product"
                className="inline-flex items-center gap-3 px-7 py-4 font-medium text-foreground border border-foreground/20 hover:border-foreground hover:bg-foreground/[0.03] transition-colors"
              >
                See it read Arabic
              </Link>
            </div>
          </div>

          {/* Right: specimen document with scan-line + extracted fields */}
          <div className="lg:col-span-6 order-1 lg:order-2 relative">
            <SpecimenDocument />
          </div>
        </div>
      </div>
    </section>
  );
};

const SpecimenDocument = () => {
  return (
    <div className="relative w-full aspect-[4/5] max-w-[520px] mx-auto lg:mx-0 lg:ml-auto">
      {/* Paper stack shadow */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 bg-foreground/[0.06] rotate-[1.5deg]" aria-hidden />
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground/[0.04] rotate-[0.5deg]" aria-hidden />

      {/* The paper */}
      <motion.div
        initial={{ opacity: 0, rotate: -3, y: 20 }}
        animate={{ opacity: 1, rotate: -1.2, y: 0 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative bg-card border border-foreground/10 shadow-[0_30px_60px_-30px_hsl(var(--foreground)/0.35)] overflow-hidden h-full"
      >
        {/* Header of the specimen */}
        <div className="flex justify-between items-start p-6 border-b border-foreground/10">
          <div>
            <div className="font-display text-lg font-medium">Al Ahly Trading LLC</div>
            <div dir="rtl" className="font-arabic text-sm text-muted-foreground">شركة الأهلي للتجارة</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Commercial Invoice
            </div>
            <div className="font-mono text-sm text-foreground">#8821</div>
          </div>
        </div>

        {/* Body lines */}
        <div className="p-6 space-y-3">
          <div className="h-2.5 bg-foreground/10 w-11/12" />
          <div className="h-2.5 bg-foreground/10 w-9/12" />
          <div dir="rtl" className="font-arabic text-sm text-foreground/70 pt-2">
            المبلغ الإجمالي شامل ضريبة القيمة المضافة، مستحق خلال ثلاثين يوماً من تاريخ الإصدار.
          </div>
          <div className="h-2.5 bg-foreground/10 w-10/12" />
          <div className="h-2.5 bg-foreground/10 w-7/12" />
        </div>

        {/* Ink stamp */}
        <div
          aria-hidden
          className="absolute bottom-16 right-6 w-28 h-28 rounded-full border-[3px] border-accent/70 text-accent/80 flex items-center justify-center rotate-[-12deg] font-display uppercase text-[11px] tracking-widest text-center leading-tight"
        >
          Verified
          <br />
          Digitize·me
        </div>

        {/* Scan-line sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            initial={{ y: "-10%" }}
            animate={{ y: "110%" }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
            className="absolute left-0 right-0 h-16"
            style={{
              background:
                "linear-gradient(to bottom, transparent, hsl(var(--accent)/0.12) 40%, hsl(var(--accent)/0.35) 50%, hsl(var(--accent)/0.12) 60%, transparent)",
              boxShadow: "0 0 24px hsl(var(--accent)/0.35)",
            }}
          />
        </div>
      </motion.div>

      {/* Extracted field chips, pulled off the page */}
      <ExtractedField
        className="left-[-8%] top-[22%]"
        label="Vendor"
        value="Al Ahly Trading"
        delay={0.6}
      />
      <ExtractedField
        className="right-[-6%] top-[42%]"
        label="TRN"
        value="100 349 285 500 003"
        mono
        delay={1.1}
      />
      <ExtractedField
        className="left-[-5%] bottom-[18%]"
        label="Total (AED)"
        value="14,752.00"
        mono
        delay={1.6}
      />
    </div>
  );
};

const ExtractedField = ({
  label,
  value,
  className = "",
  mono = false,
  delay = 0,
}: {
  label: string;
  value: string;
  className?: string;
  mono?: boolean;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -12, scale: 0.95 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={{ delay, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
    className={`absolute z-10 bg-foreground text-background px-4 py-3 shadow-[0_10px_30px_-10px_hsl(var(--foreground)/0.55)] ${className}`}
  >
    <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-background/60 mb-1">
      {label}
    </div>
    <div className={`${mono ? "font-mono" : "font-display"} text-sm text-background whitespace-nowrap`}>
      {value}
    </div>
    {/* Connector tick */}
    <div aria-hidden className="absolute top-1/2 -right-2 w-2 h-px bg-foreground/60" />
  </motion.div>
);

export default ArchivalHero;
