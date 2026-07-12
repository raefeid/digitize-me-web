import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const AnimatedOCRVisual = () => {
  const { isRTL } = useLanguage();

  const arabicLines = ["عقد تجاري رقم ٤٥٦٧", "شركة الأهلي للتجارة", "بتاريخ ١٥ يناير ٢٠٢٤"];
  const englishLines = ["Commercial Contract #4567", "Al Ahly Trading Company", "Dated January 15, 2024"];
  const lines = isRTL ? arabicLines : englishLines;

  return (
    <div className="relative w-full">
      {/* Document being scanned */}
      <motion.div
        className="bg-card rounded-xl border border-border p-5 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Scan line animation */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent"
          animate={{ top: ["10%", "90%", "10%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Document header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
            <span className="text-xs font-bold text-accent">PDF</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Contract_2024.pdf</div>
            <div className="text-xs text-muted-foreground">2.3 MB</div>
          </div>
        </div>

        {/* Text lines being recognized */}
        <div className="space-y-3">
          {lines.map((line, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.3, duration: 0.5 }}
            >
              <motion.div
                className="w-5 h-5 rounded-full border-2 border-accent flex items-center justify-center shrink-0"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * 0.3, type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-accent"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 + i * 0.3 }}
                />
              </motion.div>
              <motion.span
                className="text-sm text-foreground font-medium"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 + i * 0.3 }}
              >
                {line}
              </motion.span>
            </motion.div>
          ))}
        </div>

        {/* Extracted metadata tags */}
        <motion.div
          className="mt-4 pt-3 border-t border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 2 }}
        >
          <div className="text-xs text-muted-foreground mb-2">
            {isRTL ? "بيانات مستخرجة:" : "Extracted metadata:"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(isRTL
              ? ["عقد", "تجاري", "عربي", "موقّع", "٢٠٢٤"]
              : ["Contract", "Commercial", "Arabic", "Signed", "2024"]
            ).map((tag, i) => (
              <motion.span
                key={tag}
                className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 2.2 + i * 0.1, type: "spring" }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Accuracy indicator */}
      <motion.div
        className="mt-3 bg-card rounded-lg border border-border p-3 flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 2.5 }}
      >
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
            <motion.circle
              cx="18" cy="18" r="14" fill="none"
              stroke="hsl(var(--accent))" strokeWidth="3"
              strokeDasharray="88" strokeLinecap="round"
              initial={{ strokeDashoffset: 88 }}
              whileInView={{ strokeDashoffset: 4.4 }}
              viewport={{ once: true }}
              transition={{ delay: 2.7, duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-accent">99%</span>
        </div>
        <div>
          <div className="text-xs font-semibold text-foreground">{isRTL ? "دقة التعرف الضوئي" : "OCR Accuracy"}</div>
          <div className="text-[10px] text-muted-foreground">{isRTL ? "عربي + إنجليزي" : "Arabic + English"}</div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedOCRVisual;
