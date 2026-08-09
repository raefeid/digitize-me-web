import { forwardRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, CheckCircle2, Languages, ScanLine } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import EditableText from "@/components/cms/EditableText";
import { useSiteContent } from "@/hooks/useSiteContent";

/**
 * BilingualOCRHero — interactive feature section that demonstrates how
 * the OCR engine reads Arabic & English documents. Users toggle between
 * the two scripts and watch the AI scan, extract text, and structure
 * fields in real time.
 *
 * Design choices:
 *  - Toggle is the focal interaction (single, deliberate switch).
 *  - Re-runs the scan animation every time the language flips, so the
 *    demo always feels alive (key={lang} on the doc panel).
 *  - Extracted fields populate sequentially with staggered springs to
 *    sell the "AI parsing" feel without feeling fake.
 */

type OcrLang = "en" | "ar";

const SAMPLE: Record<OcrLang, {
  fileName: string;
  rawLines: string[];
  fields: { key: string; label: string; value: string }[];
  dir: "ltr" | "rtl";
}> = {
  en: {
    fileName: "Commercial_Invoice_8821.pdf",
    rawLines: [
      "Commercial Invoice — INV-8821",
      "Vendor: Gulf Logistics Co. LLC",
      "Date: 12 March 2026 · Total: AED 48,250",
      "Payment terms: Net 30 · TRN: 100123456700003",
    ],
    fields: [
      { key: "doc_type", label: "Document type", value: "Invoice" },
      { key: "vendor", label: "Vendor", value: "Gulf Logistics Co." },
      { key: "amount", label: "Amount", value: "AED 48,250" },
      { key: "trn", label: "TRN", value: "100123456700003" },
      { key: "date", label: "Issue date", value: "2026-03-12" },
    ],
    dir: "ltr",
  },
  ar: {
    fileName: "فاتورة_تجارية_٨٨٢١.pdf",
    rawLines: [
      "فاتورة تجارية — رقم ٨٨٢١",
      "صادرة إلى: شركة الخليج للخدمات اللوجستية ذ.م.م",
      "التاريخ: ١٢ مارس ٢٠٢٦ · المجموع: ٤٨٬٢٥٠ د.إ",
      "شروط الدفع: ٣٠ يومًا · الرقم الضريبي: ١٠٠١٢٣٤٥٦٧٠٠٠٠٣",
    ],
    fields: [
      { key: "doc_type", label: "نوع المستند", value: "فاتورة" },
      { key: "vendor", label: "المورّد", value: "شركة الخليج للخدمات" },
      { key: "amount", label: "المبلغ", value: "٤٨٬٢٥٠ د.إ" },
      { key: "trn", label: "الرقم الضريبي", value: "١٠٠١٢٣٤٥٦٧٠٠٠٠٣" },
      { key: "date", label: "تاريخ الإصدار", value: "٢٠٢٦-٠٣-١٢" },
    ],
    dir: "rtl",
  },
};

const BilingualOCRHero = forwardRef<HTMLElement, Record<string, never>>((_, ref) => {
  const { isRTL, t } = useLanguage();
  const { getContent } = useSiteContent("home", "bilingual_ocr");
  const [lang, setLang] = useState<OcrLang>(isRTL ? "ar" : "en");

  // Re-trigger the scan whenever the language flips
  const [scanKey, setScanKey] = useState(0);
  useEffect(() => {
    setScanKey((k) => k + 1);
  }, [lang]);

  const sample = SAMPLE[lang];

  return (
    <section
      ref={ref}
      aria-label="Bilingual Arabic & English OCR demo"
      className="section-padding pt-40 md:pt-52 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden"
    >
      {/* Continues the hero: solid navy at the seam, easing down into the page background */}
      <div
        className="absolute inset-x-0 top-0 h-40 md:h-56 pointer-events-none z-10"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, hsl(var(--hero-navy)) 0%, hsl(var(--hero-navy) / 0.92) 18%, hsl(var(--hero-navy) / 0.7) 36%, hsl(var(--hero-navy) / 0.42) 55%, hsl(var(--hero-navy) / 0.18) 74%, hsl(var(--hero-navy) / 0.05) 88%, transparent 100%)",
        }}
      />


      {/* Decorative grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container-max relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Copy column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={isRTL ? "lg:order-2" : ""}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
              <Languages size={14} />
              <EditableText
                page="home"
                section="bilingual_ocr"
                contentKey="badge"
                fallback={isRTL ? "تعرّف ضوئي ثنائي اللغة" : "Bilingual OCR"}
              />
            </span>

            <EditableText
              as="h2"
              page="home"
              section="bilingual_ocr"
              contentKey="title"
              fallback={
                isRTL
                  ? "ذكاء اصطناعي يفهم العربية والإنجليزية بنفس الدقة"
                  : "AI that reads Arabic and English with equal precision"
              }
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4"
              rich
            />

            <EditableText
              as="p"
              page="home"
              section="bilingual_ocr"
              contentKey="desc"
              fallback={
                isRTL
                  ? "اضغط على المُبدّل وشاهد كيف يقرأ المحرّك مستندًا حقيقيًا، يستخرج الحقول المهمة، ويحوّلها إلى بيانات منظّمة جاهزة للبحث."
                  : "Flip the switch and watch the engine read a real document — extracting key fields and turning them into structured, searchable data."
              }
              multiline
              className="text-base md:text-lg text-muted-foreground mb-6"
              rich
            />

            <ul className="space-y-3 mb-8">
              {[
                getContent("bullet_1", isRTL ? "دقة ‎+99% للنصوص المطبوعة والخط اليدوي" : "99%+ accuracy on print & handwriting"),
                getContent("bullet_2", isRTL ? "تخطيط من اليمين لليسار أصلي بدون انعكاس" : "Native right-to-left layout — no flipping"),
                getContent("bullet_3", isRTL ? "يستخرج الحقول كجدول قابل للتصدير" : "Extracts fields as exportable structured data"),
              ].map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 text-sm md:text-base text-foreground"
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <CheckCircle2 size={20} className="text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>

            {/* Toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-card border border-border shadow-sm">
              {(["en", "ar"] as OcrLang[]).map((opt) => {
                const active = lang === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setLang(opt)}
                    aria-pressed={active}
                    aria-label={opt === "en" ? "Show English OCR demo" : "Show Arabic OCR demo"}
                    className={`relative px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
                      active ? "text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="ocr-toggle-pill"
                        className="absolute inset-0 bg-accent rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <span className="relative">{opt === "en" ? "English" : "العربية"}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Demo column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`relative ${isRTL ? "lg:order-1" : ""}`}
          >
            {/* Glow */}
            <div
              aria-hidden
              className="absolute -inset-6 bg-gradient-to-tr from-accent/20 via-transparent to-primary/20 blur-3xl opacity-60"
            />

            <div className="relative grid sm:grid-cols-5 gap-4">
              {/* Document panel — 3 cols */}
              <div className="sm:col-span-3 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-accent" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {sample.fileName}
                      </div>
                      <div className="text-[10px] text-muted-foreground">2.4 MB · PDF</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-accent font-semibold shrink-0">
                    <ScanLine size={12} className="animate-pulse" />
                    <span>{getContent("scanning_label", isRTL ? "جاري المسح" : "Scanning")}</span>
                  </div>
                </div>

                <div className="relative p-5 min-h-[260px]" key={`scan-${scanKey}`}>
                  {/* Scan line */}
                  <motion.div
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent shadow-[0_0_12px_2px_hsl(var(--accent))]"
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 2.4, ease: "easeInOut" }}
                  />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={lang}
                      dir={sample.dir}
                      className="space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {sample.rawLines.map((line, i) => (
                        <motion.div
                          key={i}
                          className="text-sm md:text-base font-medium text-foreground"
                          initial={{ opacity: 0, filter: "blur(6px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          transition={{ delay: 0.4 + i * 0.35, duration: 0.4 }}
                        >
                          <motion.span
                            className="inline-block"
                            initial={{ background: "hsl(var(--accent) / 0.25)" }}
                            animate={{ background: "hsl(var(--accent) / 0)" }}
                            transition={{ delay: 0.4 + i * 0.35 + 0.4, duration: 0.8 }}
                          >
                            {line}
                          </motion.span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Extracted fields panel — 2 cols */}
              <div className="sm:col-span-2 bg-card border border-border rounded-2xl shadow-xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                  <Sparkles size={14} className="text-accent" />
                  <span className="text-xs font-semibold text-foreground">
                    {getContent("extracted_label", isRTL ? "بيانات مستخرجة" : "Extracted fields")}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={lang}
                      className="space-y-2.5"
                      dir={sample.dir}
                    >
                      {sample.fields.map((f, i) => (
                        <motion.div
                          key={f.key}
                          className="group"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 1.2 + i * 0.18,
                            type: "spring",
                            stiffness: 300,
                            damping: 22,
                          }}
                        >
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                            {f.label}
                          </div>
                          <div className="text-sm font-semibold text-foreground bg-muted/40 group-hover:bg-accent/10 transition-colors rounded-md px-2.5 py-1.5">
                            {f.value}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <motion.div
                  className="mt-3 pt-3 border-t border-border flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.4 }}
                >
                  <div className="text-[10px] text-muted-foreground">
                    {getContent("accuracy_label", isRTL ? "الدقة" : "Accuracy")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-foreground">99.4%</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

BilingualOCRHero.displayName = "BilingualOCRHero";

export default BilingualOCRHero;
