import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ScanLine, Brain, FolderCheck, FileText, Tag, Search, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";

const STATION_DEFAULTS = [
  {
    icon: Upload,
    labelEn: "Upload",
    labelAr: "رفع",
    descEn: "Drop any document, PDF, image, or scan",
    descAr: "أسقط أي مستند, PDF أو صورة أو مسح ضوئي",
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

const AnimatedDocFlow = () => {
  const { isRTL, lang } = useLanguage();
  const { getContent } = useSiteContent("home", "doc_flow");

  // Build stations dynamically — admins override label/desc per step via CMS keys
  // step{n}_label / step{n}_desc (with _ar suffix handled by getContent)
  const stations = STATION_DEFAULTS.map((s, i) => {
    const n = i + 1;
    const fallbackLabel = isRTL ? s.labelAr : s.labelEn;
    const fallbackDesc = isRTL ? s.descAr : s.descEn;
    return {
      icon: s.icon,
      label: getContent(`step${n}_label`, fallbackLabel),
      desc: getContent(`step${n}_desc`, fallbackDesc),
    };
  });
  const stepLabel = (i: number) => getContent("step_word", isRTL ? "خطوة" : "Step");
  // suppress unused lang warning by referencing
  void lang;
  const [activeStep, setActiveStep] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <motion.div
      className="relative py-8"
      onViewportEnter={() => setIsInView(true)}
      viewport={{ once: true }}
    >
      {/* Station nodes */}
      <div className="relative flex items-start justify-between max-w-3xl mx-auto">
        {/* Connecting line */}
        <div className="absolute top-7 left-[8%] right-[8%] h-0.5 bg-border z-0">
          <motion.div
            className="h-full bg-accent origin-left"
            animate={{ scaleX: activeStep / 3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {stations.map((station, i) => {
          const Icon = station.icon;
          const isActive = i === activeStep;
          const isPast = i < activeStep;

          return (
            <div
              key={i}
              className="relative z-10 flex flex-col items-center w-1/4 cursor-pointer"
              onClick={() => setActiveStep(i)}
            >
              {/* Node circle */}
              <motion.div
                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isActive
                    ? "bg-accent border-accent shadow-lg shadow-accent/25"
                    : isPast
                    ? "bg-accent/10 border-accent"
                    : "bg-card border-border"
                }`}
                animate={{
                  scale: isActive ? 1.15 : 1,
                }}
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

              {/* Label */}
              <span
                className={`mt-2 text-xs md:text-sm font-semibold text-center transition-colors duration-300 ${
                  isActive ? "text-accent" : isPast ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {station.label}
              </span>

              {/* Step number */}
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {isRTL ? `${i + 1} ${stepLabel(i)}` : `${stepLabel(i)} ${i + 1}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Document card that morphs at each station */}
      <div className="mt-8 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.35, type: "spring", stiffness: 250, damping: 22 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-lg relative overflow-hidden"
          >
            {/* Step 0: Upload */}
            {activeStep === 0 && (
              <div className="flex flex-col items-center gap-3 py-4">
                <motion.div
                  className="w-16 h-16 rounded-2xl border-2 border-dashed border-accent/40 flex items-center justify-center bg-accent/5"
                  animate={{ borderColor: ["hsl(var(--accent) / 0.3)", "hsl(var(--accent) / 0.7)", "hsl(var(--accent) / 0.3)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Upload size={24} className="text-accent" />
                </motion.div>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <FileText size={14} className="text-accent" />
                    <span className="text-xs font-medium text-foreground">Contract_2024.pdf</span>
                  </motion.div>
                  <motion.span
                    className="text-[10px] text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    2.3 MB
                  </motion.span>
                </div>
                <motion.div
                  className="h-1.5 w-48 bg-muted rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.7, duration: 1.5, ease: "easeOut" }}
                  />
                </motion.div>
              </div>
            )}

            {/* Step 1: Scan & OCR */}
            {activeStep === 1 && (
              <div className="relative py-2">
                {/* Scan line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-accent/60"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="space-y-2.5">
                  {[
                    isRTL ? "عقد تجاري رقم ٤٥٦٧" : "Commercial Contract #4567",
                    isRTL ? "شركة الأهلي للتجارة" : "Al Ahly Trading Company",
                    isRTL ? "بتاريخ ١٥ يناير ٢٠٢٤" : "Dated January 15, 2024",
                  ].map((line, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: isRTL ? 15 : -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.3 }}
                    >
                      <motion.div
                        className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.3, type: "spring" }}
                      >
                        <CheckCircle size={10} className="text-accent" />
                      </motion.div>
                      <span className="text-sm text-foreground">{line}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  className="mt-3 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                    99% {isRTL ? "دقة" : "accuracy"}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {isRTL ? "عربي + إنجليزي" : "Arabic + English"}
                  </span>
                </motion.div>
              </div>
            )}

            {/* Step 2: AI Classify */}
            {activeStep === 2 && (
              <div className="py-2">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={16} className="text-accent" />
                  <span className="text-sm font-semibold text-foreground">
                    {isRTL ? "تصنيف تلقائي..." : "Auto-classifying..."}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(isRTL
                    ? ["عقد", "تجاري", "عربي", "موقّع", "٢٠٢٤", "قانوني"]
                    : ["Contract", "Commercial", "Arabic", "Signed", "2024", "Legal"]
                  ).map((tag, i) => (
                    <motion.span
                      key={tag}
                      className="px-2.5 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium flex items-center gap-1"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.12, type: "spring" }}
                    >
                      <Tag size={10} />
                      {tag}
                    </motion.span>
                  ))}
                </div>
                <motion.div
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <Search size={12} />
                  <span>{isRTL ? "مفهرس للبحث الكامل" : "Indexed for full-text search"}</span>
                </motion.div>
              </div>
            )}

            {/* Step 3: Ready */}
            {activeStep === 3 && (
              <div className="flex flex-col items-center gap-3 py-3">
                <motion.div
                  className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <CheckCircle size={28} className="text-accent" />
                </motion.div>
                <div className="text-center">
                  <motion.p
                    className="text-sm font-semibold text-foreground"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {isRTL ? "المستند جاهز!" : "Document Ready!"}
                  </motion.p>
                  <motion.p
                    className="text-xs text-muted-foreground mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {isRTL ? "قابل للبحث • قابل للمشاركة • مؤرشف بأمان" : "Searchable • Shareable • Securely Archived"}
                  </motion.p>
                </div>
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {["< 5s", isRTL ? "مؤمّن" : "Encrypted", isRTL ? "نسخة احتياطية" : "Backed up"].map((badge, i) => (
                    <span key={i} className="px-2 py-0.5 bg-accent/10 text-accent rounded text-[10px] font-medium">
                      {badge}
                    </span>
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Description below card */}
        <AnimatePresence mode="wait">
          <motion.p
            key={activeStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm text-muted-foreground mt-4"
          >
            {stations[activeStep].desc}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AnimatedDocFlow;
