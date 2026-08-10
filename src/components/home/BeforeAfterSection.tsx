import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Clock, AlertTriangle, TrendingDown, Zap, CheckCircle2, TrendingUp, FileX, Search, ShieldAlert, ShieldCheck, XCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";

const BeforeAfterSection = () => {
  const { t } = useLanguage();
  const { getContent } = useSiteContent("home", "before_after");
  const [isDigitize, setIsDigitize] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-30% 0px -30% 0px" });

  useEffect(() => {
    if (inView && !autoTriggered) {
      setAutoTriggered(true);
    }
  }, [inView, autoTriggered]);

  useEffect(() => {
    if (!autoTriggered) return;
    const interval = setInterval(() => {
      setIsDigitize((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoTriggered]);

  const gauges = [
    {
      label: t("ba.before1"),
      before: { value: 20, unit: "min", percent: 85, color: "hsl(0 84% 60%)" },
      after: { value: 5, unit: "sec", percent: 8, color: "hsl(142 71% 45%)" },
    },
    {
      label: t("ba.before2"),
      before: { value: 35, unit: "%", percent: 35, color: "hsl(0 84% 60%)" },
      after: { value: 99.2, unit: "%", percent: 99, color: "hsl(142 71% 45%)" },
    },
    {
      label: t("ba.before3"),
      before: { value: "4+", unit: "hrs/day", percent: 70, color: "hsl(0 84% 60%)" },
      after: { value: 80, unit: "% saved", percent: 15, color: "hsl(142 71% 45%)" },
    },
  ];

  const statusItems = [
    { before: { icon: FileX, text: "Lost documents", status: "critical" }, after: { icon: CheckCircle, text: "100% indexed", status: "ok" } },
    { before: { icon: ShieldAlert, text: "No audit trail", status: "critical" }, after: { icon: ShieldCheck, text: "Full compliance", status: "ok" } },
    { before: { icon: XCircle, text: "Manual errors", status: "critical" }, after: { icon: CheckCircle, text: "AI-verified", status: "ok" } },
  ];

  const chartBars = [
    { before: 85, after: 12 }, { before: 70, after: 18 }, { before: 90, after: 8 },
    { before: 60, after: 15 }, { before: 75, after: 10 }, { before: 80, after: 5 },
  ];

  return (
    <section ref={sectionRef} aria-label="Before After Comparison" className="section-padding bg-background">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">{getContent("ba_badge", t("ba.badge"))}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">{getContent("ba_title", t("ba.title"))}</h2>
        </div>

        {/* Auto-loop indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-medium transition-colors duration-500 ${!isDigitize ? "text-destructive font-bold" : "text-muted-foreground"}`}>
            {t("ba.beforeTitle")}
          </span>
          <div className="relative w-14 h-7 rounded-full transition-colors duration-500 bg-muted overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              animate={{ width: "100%" }}
              transition={{ duration: 4.6, ease: "linear", repeat: Infinity, repeatType: "reverse", repeatDelay: 0.4 }}
              style={{ backgroundColor: isDigitize ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)" }}
            />
            <motion.div className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md" animate={{ x: isDigitize ? 30 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </div>
          <span className={`text-sm font-medium transition-colors duration-500 ${isDigitize ? "text-accent font-bold" : "text-muted-foreground"}`}>
            {t("ba.afterTitle")}
          </span>
        </div>

        {/* Dashboard */}
        <div className="max-w-6xl mx-auto">
          <motion.div className="rounded-2xl border bg-card p-6 md:p-8 shadow-lg overflow-hidden" animate={{ borderColor: isDigitize ? "hsl(142 71% 45% / 0.3)" : "hsl(0 84% 60% / 0.2)" }} transition={{ duration: 0.4 }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div className="w-3 h-3 rounded-full" animate={{ backgroundColor: isDigitize ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)" }} transition={{ duration: 0.3 }} />
                <span className="text-sm font-semibold text-foreground">{isDigitize ? "Digitize me Dashboard" : "Manual Process Overview"}</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.span key={isDigitize ? "good" : "bad"} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`text-xs font-bold px-3 py-1 rounded-full ${isDigitize ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                  {isDigitize ? "✓ Optimized" : "⚠ Inefficient"}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-5">
                {gauges.map((gauge, i) => {
                  const data = isDigitize ? gauge.after : gauge.before;
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{gauge.label}</span>
                        <motion.span key={`${isDigitize}-${i}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="font-bold" style={{ color: data.color }}>
                          {data.value} {data.unit}
                        </motion.span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${data.percent}%`, backgroundColor: data.color }} transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }} />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-3 border-t border-border space-y-3">
                  {statusItems.map((item, i) => {
                    const current = isDigitize ? item.after : item.before;
                    const Icon = current.icon;
                    return (
                      <motion.div key={`${isDigitize}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }} className="flex items-center gap-2">
                        <Icon size={15} className={current.status === "ok" ? "text-accent" : "text-destructive"} />
                        <span className="text-xs text-muted-foreground">{current.text}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground mb-3 block">{isDigitize ? "Time per task (optimized)" : "Time per task (manual)"}</span>
                <div className="flex items-end gap-2 h-40">
                  {chartBars.map((bar, i) => {
                    const height = isDigitize ? bar.after : bar.before;
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end h-full">
                        <motion.div className="w-full rounded-t-md" initial={false} animate={{ height: `${height}%`, backgroundColor: isDigitize ? "hsl(142 71% 45%)" : "hsl(0 84% 60% / 0.7)" }} transition={{ duration: 0.5, delay: i * 0.06, type: "spring", stiffness: 120 }} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {chartBars.map((_, i) => (<div key={i} className="flex-1 text-center text-[10px] text-muted-foreground">T{i + 1}</div>))}
                </div>
                <motion.div className="mt-4 p-3 rounded-xl text-center" animate={{ backgroundColor: isDigitize ? "hsl(142 71% 45% / 0.08)" : "hsl(0 84% 60% / 0.06)" }} transition={{ duration: 0.3 }}>
                  <AnimatePresence mode="wait">
                    <motion.div key={isDigitize ? "after" : "before"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                      {isDigitize ? (
                        <>
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <TrendingUp size={16} className="text-accent" />
                            <span className="text-xl font-extrabold text-accent">80%</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{t("ba.after3")}</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <TrendingDown size={16} className="text-destructive" />
                            <span className="text-xl font-extrabold text-destructive">4+ hrs</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{t("ba.before3")}</span>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
