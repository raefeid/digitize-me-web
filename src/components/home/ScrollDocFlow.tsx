import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
  MotionValue,
} from "framer-motion";
import {
  Upload,
  ScanLine,
  Brain,
  FolderCheck,
  FileText,
  Tag,
  CheckCircle,
  MousePointer2,
  Search,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useMotionPreference } from "@/hooks/useReducedMotion";
import AnimatedDocFlow from "./AnimatedDocFlow";

const STATION_DEFAULTS = [
  {
    icon: Upload,
    labelEn: "Upload",
    labelAr: "رفع",
    descEn: "Drop any document, PDF, image, or scan",
    descAr: "أسقط أي مستند، PDF أو صورة أو مسح ضوئي",
  },
  {
    icon: ScanLine,
    labelEn: "Scan & OCR",
    labelAr: "مسح وتعرف ضوئي",
    descEn: "AI reads Arabic & English text instantly",
    descAr: "الذكاء الاصطناعي يقرأ النص العربي والإنجليزي فوراً",
  },
  {
    icon: Brain,
    labelEn: "AI Classify",
    labelAr: "تصنيف ذكي",
    descEn: "Auto-tagged, categorized & metadata extracted",
    descAr: "وسوم تلقائية وتصنيف واستخراج البيانات",
  },
  {
    icon: FolderCheck,
    labelEn: "Ready",
    labelAr: "جاهز",
    descEn: "Searchable, shareable & securely archived",
    descAr: "قابل للبحث والمشاركة ومؤرشف بأمان",
  },
];

/** Cross-fade opacity centered on step index (0..3). */
const stepOpacity = (progress: MotionValue<number>, step: number) => {
  const span = 1 / 4;
  const center = step * span + span / 2;
  const half = span * 0.6;
  const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
  const raw = [center - half, center - half / 2, center + half / 2, center + half].map(clamp01);
  // Ensure monotonic non-decreasing for WAAPI
  const input = raw.map((v, i) => (i > 0 ? Math.max(v, raw[i - 1]) : v));
  return useTransform(progress, input, [0, 1, 1, 0], { clamp: true });
};

const ScrollDocFlow = () => {
  const { isRTL } = useLanguage();
  const { getContent } = useSiteContent("home", "doc_flow");
  const { reduced, mobile } = useMotionPreference();

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const [activeStep, setActiveStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(3, Math.max(0, Math.floor(v * 4 - 0.001)));
    if (idx !== activeStep) setActiveStep(idx);
  });

  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Cursor path across the screen (only meaningful for step 0)
  const cursorX = useTransform(scrollYProgress, [0, 0.12, 0.22], ["10%", "55%", "50%"]);
  const cursorY = useTransform(scrollYProgress, [0, 0.12, 0.22], ["20%", "55%", "60%"]);

  const scenes = [0, 1, 2, 3].map((i) => stepOpacity(scrollYProgress, i));

  const stations = STATION_DEFAULTS.map((s, i) => {
    const n = i + 1;
    return {
      icon: s.icon,
      label: getContent(`step${n}_label`, isRTL ? s.labelAr : s.labelEn),
      desc: getContent(`step${n}_desc`, isRTL ? s.descAr : s.descEn),
    };
  });
  const stepWord = getContent("step_word", isRTL ? "خطوة" : "Step");

  // Fallback for reduced motion / very small screens
  if (reduced || mobile) {
    return <AnimatedDocFlow />;
  }

  return (
    <div ref={sectionRef} className="relative" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Step rail */}
        <div className="relative w-full max-w-3xl px-4 mb-8">
          <div className="relative flex items-start justify-between">
            <div className="absolute top-7 left-[8%] right-[8%] h-0.5 bg-border z-0">
              <motion.div
                className="h-full bg-accent origin-left"
                style={{ scaleX: progressScaleX }}
              />
            </div>

            {stations.map((station, i) => {
              const Icon = station.icon;
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center w-1/4">
                  <motion.div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                      isActive
                        ? "bg-accent border-accent shadow-lg shadow-accent/25"
                        : isPast
                        ? "bg-accent/10 border-accent"
                        : "bg-card border-border"
                    }`}
                    animate={{ scale: isActive ? 1.15 : 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Icon
                      size={22}
                      className={
                        isActive
                          ? "text-accent-foreground"
                          : isPast
                          ? "text-accent"
                          : "text-muted-foreground"
                      }
                    />
                  </motion.div>
                  <span
                    className={`mt-2 text-xs md:text-sm font-semibold text-center transition-colors duration-300 ${
                      isActive ? "text-accent" : isPast ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {station.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {isRTL ? `${i + 1} ${stepWord}` : `${stepWord} ${i + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Browser mockup */}
        <div className="w-full max-w-3xl px-4">
          <motion.div
            className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
              <span className="w-3 h-3 rounded-full bg-destructive/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="flex-1 mx-3 h-6 rounded-md bg-background border border-border flex items-center px-3">
                <span className="text-[11px] text-muted-foreground truncate">
                  app.infasme.com/documents
                </span>
              </div>
            </div>

            {/* Stage */}
            <div className="relative h-[380px] md:h-[440px] bg-background">
              {/* Cursor (only visible during upload step) */}
              <motion.div
                className="absolute z-30 pointer-events-none"
                style={{ left: cursorX, top: cursorY, opacity: scenes[0] }}
              >
                <MousePointer2
                  className="text-foreground drop-shadow"
                  size={22}
                  fill="currentColor"
                />
              </motion.div>

              {/* Scene 0 — Upload */}
              <motion.div
                className="absolute inset-0 p-6 flex flex-col"
                style={{ opacity: scenes[0] }}
              >
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {["Contract_2024.pdf", "Invoice_Q3.pdf", "NDA_signed.pdf"].map((name, i) => (
                    <div
                      key={name}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${
                        i === 0 ? "border-accent bg-accent/5" : "border-border bg-card"
                      }`}
                    >
                      <FileText size={14} className="text-accent" />
                      <span className="text-[11px] text-foreground truncate">{name}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 flex flex-col items-center justify-center gap-3">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  >
                    <Upload size={36} className="text-accent" />
                  </motion.div>
                  <p className="text-sm font-medium text-foreground">
                    {isRTL ? "أفلت الملف لبدء الرفع" : "Drop file to start upload"}
                  </p>
                  <div className="h-1.5 w-56 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent"
                      style={{
                        scaleX: useTransform(scrollYProgress, [0.05, 0.24], [0, 1], {
                          clamp: true,
                        }),
                        transformOrigin: "left",
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Scene 1 — Scan & OCR */}
              <motion.div
                className="absolute inset-0 p-6"
                style={{ opacity: scenes[1] }}
              >
                <div className="relative h-full rounded-xl border border-border bg-card p-5 overflow-hidden">
                  <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-accent shadow-[0_0_12px_hsl(var(--accent))] z-10"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="space-y-3">
                    {[
                      isRTL ? "عقد تجاري رقم ٤٥٦٧" : "Commercial Contract #4567",
                      isRTL ? "شركة الأهلي للتجارة" : "Al Ahly Trading Company",
                      isRTL ? "بتاريخ ١٥ يناير ٢٠٢٤" : "Dated January 15, 2024",
                      isRTL ? "قيمة العقد: ٢٥٠,٠٠٠ درهم" : "Contract value: AED 250,000",
                      isRTL ? "توقيع الطرفين معتمد" : "Signatures verified",
                    ].map((line, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center">
                          <CheckCircle size={10} className="text-accent" />
                        </div>
                        <span className="text-sm text-foreground">{line}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-5 right-5 flex items-center gap-2">
                    <div className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                      99% {isRTL ? "دقة" : "accuracy"}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {isRTL ? "عربي + إنجليزي" : "Arabic + English"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Scene 2 — Classify */}
              <motion.div
                className="absolute inset-0 p-6"
                style={{ opacity: scenes[2] }}
              >
                <div className="h-full rounded-xl border border-border bg-card p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    >
                      <Brain size={20} className="text-accent" />
                    </motion.div>
                    <span className="text-sm font-semibold text-foreground">
                      {isRTL ? "تصنيف تلقائي..." : "Auto-classifying..."}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(isRTL
                      ? ["عقد", "تجاري", "عربي", "موقّع", "٢٠٢٤", "قانوني", "AED", "معتمد"]
                      : ["Contract", "Commercial", "Arabic", "Signed", "2024", "Legal", "AED", "Verified"]
                    ).map((tag, i) => (
                      <motion.span
                        key={tag}
                        className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium flex items-center gap-1"
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: false, amount: 0.6 }}
                        transition={{ delay: i * 0.08, type: "spring" }}
                      >
                        <Tag size={10} />
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                    <Search size={12} />
                    <span>{isRTL ? "مفهرس للبحث الكامل" : "Indexed for full-text search"}</span>
                  </div>
                </div>
              </motion.div>

              {/* Scene 3 — Ready */}
              <motion.div
                className="absolute inset-0 p-6 flex items-center justify-center"
                style={{ opacity: scenes[3] }}
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    <CheckCircle size={40} className="text-accent" />
                  </motion.div>
                  <p className="text-lg font-semibold text-foreground">
                    {isRTL ? "المستند جاهز!" : "Document Ready!"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? "قابل للبحث • قابل للمشاركة • مؤرشف بأمان"
                      : "Searchable • Shareable • Securely Archived"}
                  </p>
                  <div className="flex gap-2">
                    {["< 5s", isRTL ? "مؤمّن" : "Encrypted", isRTL ? "نسخة احتياطية" : "Backed up"].map(
                      (badge, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-accent/10 text-accent rounded text-xs font-medium"
                        >
                          {badge}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Caption */}
          <div className="mt-5 h-6 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-sm text-muted-foreground"
              >
                {stations[activeStep].desc}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Scroll hint */}
          <p className="text-center text-[11px] text-muted-foreground/70 mt-3">
            {isRTL ? "مرر للأسفل لمشاهدة الخطوة التالية" : "Scroll to advance"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScrollDocFlow;
