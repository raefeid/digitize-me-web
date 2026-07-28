import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Receipt, CreditCard, CheckCircle2, Scan, File, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

type DemoStage = "idle" | "uploading" | "scanning" | "extracted";

const extractionResults: Record<string, { fields: { label: string; labelAr: string; value: string; valueAr: string }[] }> = {
  invoice: {
    fields: [
      { label: "Vendor", value: "Fotopia Technologies LLC", labelAr: "المورد", valueAr: "فوتوبيا تكنولوجيز ش.ذ.م.م" },
      { label: "Invoice #", value: "INV-2024-0847", labelAr: "رقم الفاتورة", valueAr: "INV-2024-0847" },
      { label: "Amount", value: "AED 12,500.00", labelAr: "المبلغ", valueAr: "١٢,٥٠٠.٠٠ د.إ" },
      { label: "Date", value: "March 15, 2024", labelAr: "التاريخ", valueAr: "١٥ مارس ٢٠٢٤" },
      { label: "Status", value: "Paid", labelAr: "الحالة", valueAr: "مدفوعة" },
    ],
  },
  contract: {
    fields: [
      { label: "Parties", value: "Acme Corp ↔ Gulf Trading", labelAr: "الأطراف", valueAr: "أكمي كورب ↔ تجارة الخليج" },
      { label: "Contract #", value: "CT-2024-1293", labelAr: "رقم العقد", valueAr: "CT-2024-1293" },
      { label: "Value", value: "AED 450,000.00", labelAr: "القيمة", valueAr: "٤٥٠,٠٠٠.٠٠ د.إ" },
      { label: "Effective", value: "Jan 1 – Dec 31, 2024", labelAr: "السريان", valueAr: "١ يناير – ٣١ ديسمبر ٢٠٢٤" },
      { label: "Type", value: "Service Agreement", labelAr: "النوع", valueAr: "اتفاقية خدمات" },
    ],
  },
  other: {
    fields: [
      { label: "Document Type", value: "General Document", labelAr: "نوع المستند", valueAr: "مستند عام" },
      { label: "Pages", value: "3", labelAr: "الصفحات", valueAr: "٣" },
      { label: "Language", value: "Arabic / English", labelAr: "اللغة", valueAr: "عربي / إنجليزي" },
      { label: "Confidence", value: "99.2%", labelAr: "نسبة الدقة", valueAr: "٩٩.٢%" },
      { label: "Extracted Fields", value: "12 fields", labelAr: "الحقول المستخرجة", valueAr: "١٢ حقل" },
    ],
  },
};

function detectDocType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("invoice") || lower.includes("فاتورة") || lower.includes("bill") || lower.includes("receipt")) return "invoice";
  if (lower.includes("contract") || lower.includes("عقد") || lower.includes("agreement") || lower.includes("lease")) return "contract";
  return "other";
}

const LiveDemoSection = () => {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [stage, setStage] = useState<DemoStage>("idle");
  const [fileName, setFileName] = useState("");
  const [docType, setDocType] = useState("other");
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateProcessing = useCallback((name: string) => {
    const type = detectDocType(name);
    setDocType(type);
    setFileName(name);
    setStage("uploading");
    setProgress(0);

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(uploadInterval);
          return 100;
        }
        return p + Math.random() * 15 + 5;
      });
    }, 150);

    // After upload, start scanning
    setTimeout(() => {
      clearInterval(uploadInterval);
      setProgress(100);
      setStage("scanning");

      // After scanning, show results
      setTimeout(() => {
        setStage("extracted");
      }, 2200);
    }, 1500);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) simulateProcessing(file.name);
  }, [simulateProcessing]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateProcessing(file.name);
  }, [simulateProcessing]);

  const reset = () => {
    setStage("idle");
    setFileName("");
    setProgress(0);
  };

  const result = extractionResults[docType] || extractionResults.other;

  return (
    <section aria-label="Live Demo" className="section-padding bg-muted/30">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">{t("demo.badge")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">{t("demo.title")}</h2>
          <p className="text-muted-foreground">{t("demo.desc")}</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Idle, Drop zone */}
            {stage === "idle" && (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <label
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    isDragOver
                      ? "border-accent bg-accent/5 scale-[1.01]"
                      : "border-border bg-card hover:border-accent/30 hover:bg-muted/50"
                  }`}
                >
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center"
                    animate={isDragOver ? { scale: [1, 1.15, 1] } : { y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Upload size={28} className="text-accent" />
                  </motion.div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{t("demo.dropTitle")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t("demo.dropDesc")}</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[
                      { icon: Receipt, label: t("demo.invoice") },
                      { icon: FileText, label: t("demo.contract") },
                      { icon: CreditCard, label: t("demo.idCard") },
                    ].map((item) => (
                      <span key={item.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                        <item.icon size={12} />
                        {item.label}
                      </span>
                    ))}
                  </div>
                  <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleFileSelect} />
                </label>
              </motion.div>
            )}

            {/* Uploading / Scanning */}
            {(stage === "uploading" || stage === "scanning") && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-2xl border border-border p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <File size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {stage === "uploading" ? t("demo.uploading") : t("demo.scanning")}
                    </p>
                  </div>
                  <Loader2 size={20} className="text-accent animate-spin" />
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-6">
                  <motion.div
                    className="h-full rounded-full bg-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: stage === "uploading" ? `${Math.min(progress, 100)}%` : "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Scan animation */}
                {stage === "scanning" && (
                  <div className="relative rounded-xl bg-muted/50 p-6 overflow-hidden min-h-[140px]">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="h-3 rounded-full bg-muted mb-3"
                        style={{ width: `${55 + Math.random() * 40}%` }}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12 }}
                      />
                    ))}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-accent/60"
                      animate={{ top: ["10%", "90%", "10%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute top-2 right-3 flex items-center gap-1.5 text-xs text-accent font-medium"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Scan size={12} />
                      {t("demo.aiProcessing")}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Extracted Results */}
            {stage === "extracted" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Source file */}
                <div className="bg-card rounded-2xl border border-border p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <File size={14} />
                      {fileName}
                    </div>
                    <button
                      onClick={reset}
                      aria-label={t("demo.reset") || "Reset demo"}
                      className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="h-3 rounded-full bg-muted" style={{ width: `${55 + Math.random() * 40}%` }} />
                    ))}
                  </div>
                  <motion.div
                    className="absolute top-3 right-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                      <CheckCircle2 size={12} />
                      {t("demo.processed")}
                    </span>
                  </motion.div>
                </div>

                {/* Extracted fields */}
                <div className="bg-card rounded-2xl border border-accent/20 p-6 shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-medium text-accent mb-5">
                    <CheckCircle2 size={14} />
                    {t("demo.extracted")}
                  </div>
                  <div className="space-y-4">
                    {result.fields.map((field, i) => (
                      <motion.div
                        key={field.label}
                        className="flex justify-between items-center gap-4"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12 }}
                      >
                        <span className="text-xs text-muted-foreground uppercase tracking-wide shrink-0">
                          {isAr ? field.labelAr : field.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {isAr ? field.valueAr : field.value}
                          </span>
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.1, type: "spring" }}>
                            <CheckCircle2 size={14} className="text-accent" />
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    onClick={reset}
                    className="mt-6 w-full py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-accent/30 transition-all"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    {t("demo.tryAnother")}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default LiveDemoSection;
