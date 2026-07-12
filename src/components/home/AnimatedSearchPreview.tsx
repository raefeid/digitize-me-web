import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, CheckCircle, Calendar, Building2, Tag, Clock, MapPin, User } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { forwardRef, useState, useEffect } from "react";

const AnimatedSearchPreview = forwardRef<HTMLDivElement>((_, ref) => {
  const { isRTL } = useLanguage();
  const [typedText, setTypedText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeResult, setActiveResult] = useState(-1);
  const [cycle, setCycle] = useState(0);

  const query = isRTL ? "عقد تجاري ٢٠٢٤" : "Commercial contract 2024";

  const docs = [
    {
      title: "Contract_2024_AlAhly.pdf",
      type: isRTL ? "قانوني" : "Legal",
      speed: isRTL ? "٢.٣ ثانية" : "2.3s",
      tag: isRTL ? "OCR عربي" : "Arabic OCR",
      relevance: 98,
      metadata: {
        date: "Jan 15, 2024",
        company: isRTL ? "شركة الأهلي" : "Al Ahly Trading Co.",
        pages: 12,
        language: isRTL ? "عربي" : "Arabic",
      },
    },
    {
      title: "Invoice_Q4_2024.pdf",
      type: isRTL ? "مالي" : "Finance",
      speed: isRTL ? "١.٨ ثانية" : "1.8s",
      tag: isRTL ? "مصنف تلقائيًا" : "Auto-classified",
      relevance: 85,
      metadata: {
        date: "Dec 3, 2024",
        company: isRTL ? "مجموعة الفطيم" : "Al Futtaim Group",
        pages: 4,
        language: isRTL ? "إنجليزي" : "English",
      },
    },
  ];

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let charIndex = 0;

    const typeNext = () => {
      if (charIndex <= query.length) {
        setTypedText(query.slice(0, charIndex));
        charIndex++;
        timeout = setTimeout(typeNext, 80 + Math.random() * 40);
      } else {
        timeout = setTimeout(() => setShowResults(true), 400);
      }
    };

    setTypedText("");
    setShowResults(false);
    setActiveResult(-1);

    timeout = setTimeout(typeNext, 800);

    return () => clearTimeout(timeout);
  }, [cycle, query]);

  useEffect(() => {
    if (!showResults) return;
    let i = 0;
    const interval = setInterval(() => {
      setActiveResult(i);
      i++;
      if (i >= docs.length) {
        clearInterval(interval);
        setTimeout(() => setCycle((c) => c + 1), 4000);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [showResults, docs.length]);

  return (
    <div ref={ref} className="rounded-2xl border border-border bg-card shadow-2xl shadow-dm-navy/5 p-4 md:p-5">
      {/* Window chrome */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-accent/60" />
          <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
          <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="flex-1 h-8 bg-muted rounded-lg flex items-center px-3 overflow-hidden">
          <Search size={14} className="text-muted-foreground shrink-0 mr-2" />
          <span className="text-sm text-foreground whitespace-nowrap">
            {typedText}
            <motion.span
              className="inline-block w-0.5 h-4 bg-accent ml-0.5 align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </span>
        </div>
      </div>

      {/* Search stats */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-3 px-1"
          >
            <span className="text-[10px] text-muted-foreground">
              {isRTL ? "٢ نتيجة في ٠.٨ ثانية" : "2 results in 0.8s"}
            </span>
            <span className="text-[10px] text-accent font-medium">
              {isRTL ? "مرتب حسب الصلة" : "Sorted by relevance"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="space-y-3 min-h-[220px]">
        {/* mode="popLayout" — list of staggered children needs each item to
            mount/unmount independently. mode="wait" only works with a single
            child and was triggering a console warning. */}
        <AnimatePresence mode="popLayout">
          {showResults &&
            docs.map((doc, i) => (
              <motion.div
                key={`${cycle}-${i}`}
                className="rounded-xl border border-border bg-muted/30 p-3.5 transition-colors"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={
                  activeResult >= i
                    ? { opacity: 1, y: 0, scale: 1, borderColor: "hsl(var(--accent) / 0.3)" }
                    : { opacity: 0, y: 12, scale: 0.97 }
                }
                transition={{ duration: 0.35, delay: i * 0.1 }}
              >
                {/* Top row: tag + relevance */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-accent" />
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {doc.tag}
                    </span>
                  </div>
                  {activeResult >= i && (
                    <motion.div
                      className="flex items-center gap-1.5"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
                    >
                      <span className="text-[10px] font-bold text-accent">{doc.relevance}%</span>
                      <CheckCircle size={13} className="text-accent" />
                    </motion.div>
                  )}
                </div>

                {/* File name */}
                <p className="text-sm font-semibold text-foreground truncate">{doc.title}</p>

                {/* Metadata row */}
                <motion.div
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2"
                  initial={{ opacity: 0, y: 4 }}
                  animate={activeResult >= i ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Tag size={10} className="text-accent/60" />
                    {doc.type}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar size={10} className="text-accent/60" />
                    {doc.metadata.date}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Building2 size={10} className="text-accent/60" />
                    {doc.metadata.company}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock size={10} className="text-accent/60" />
                    {doc.speed}
                  </span>
                </motion.div>

                {/* Extracted snippet */}
                <motion.div
                  className="mt-2 px-2.5 py-1.5 bg-accent/5 rounded-lg border border-accent/10"
                  initial={{ opacity: 0, height: 0 }}
                  animate={activeResult >= i ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                  transition={{ delay: 0.45 + i * 0.1 }}
                >
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground/70">
                      {isRTL ? "مقتطف:" : "Preview:"}
                    </span>{" "}
                    {i === 0
                      ? isRTL
                        ? "...عقد تجاري بين شركة الأهلي وشركة المورد بمبلغ ٥٠٠,٠٠٠ درهم..."
                        : "...commercial agreement between Al Ahly Trading and supplier for AED 500,000..."
                      : isRTL
                      ? "...فاتورة ربع سنوية للخدمات المقدمة بتاريخ ديسمبر ٢٠٢٤..."
                      : "...quarterly invoice for services rendered, dated December 2024..."}
                  </p>
                </motion.div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

AnimatedSearchPreview.displayName = "AnimatedSearchPreview";

export default AnimatedSearchPreview;
