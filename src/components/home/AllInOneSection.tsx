import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSyncedComparison } from "@/hooks/useSyncedComparison";
import { icons, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import EditableText from "@/components/cms/EditableText";
import { useAioTools, DEFAULT_AIO_TOOLS, type AioTool } from "@/hooks/useAioTools";
import logo from "@/assets/digitizeme-logo.png";

/** Resolve a Lucide icon by name, falling back to a generic check icon. */
const resolveIcon = (name: string) => {
  const Icon = (icons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name];
  return Icon ?? Check;
};

const AllInOneSection = () => {
  const { t, isRTL } = useLanguage();
  const { getContent } = useSiteContent("home", "allinone");
  const sectionRef = useRef<HTMLElement>(null);
  // Shared toggle: this section and BeforeAfterSection flip together on one timer.
  const { active: absorbed, toggle } = useSyncedComparison(sectionRef);

  // Pull the admin-managed tool list (falls back to defaults until query resolves).
  const { data: toolsData } = useAioTools();
  const tools: AioTool[] = toolsData ?? DEFAULT_AIO_TOOLS;

  const resolvedTools = tools;

  return (
    <section ref={sectionRef} className="section-padding bg-muted/20 overflow-hidden" aria-label="All in One Platform">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">{getContent("aio_badge", t("aio.badge"))}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">{getContent("aio_title", t("aio.title"))}</h2>
          <p className="text-muted-foreground">{getContent("aio_desc", t("aio.desc"))}</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <span className={`text-sm font-medium transition-colors ${!absorbed ? "text-red-600 font-bold" : "text-muted-foreground"}`}>{t("aio.without")}</span>
          <button onClick={toggle} className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${absorbed ? "bg-emerald-500" : "bg-red-500"}`} aria-label="Toggle with/without Digitize me">
            <motion.div className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md" animate={{ x: absorbed ? 30 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </button>
          <span className={`text-sm font-medium transition-colors ${absorbed ? "text-emerald-600 font-bold" : "text-muted-foreground"}`}>{t("aio.with")}</span>
        </div>

        {/*
          One AnimatePresence in "wait" mode so only a single panel is ever
          mounted: the outgoing one fully exits before the incoming one mounts.
          Two overlapping panels used to briefly stack in normal flow, doubling
          the section height and flashing content into the next section.
        */}
        <AnimatePresence mode="wait">
          {absorbed ? (
            <motion.div key="with" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.4, type: "spring", stiffness: 150, damping: 20 }} className="w-full max-w-md mx-auto flex flex-col items-center mb-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1, boxShadow: "0 0 80px 20px hsl(160 84% 39% / 0.4)" }} transition={{ duration: 0.5, type: "spring" }} className="w-28 h-28 rounded-full bg-white border-2 border-emerald-500/40 flex items-center justify-center p-4 mb-4">
                <img src={logo} alt="Digitize me" className="w-20 h-auto object-contain" />
              </motion.div>
              <div className="bg-card/90 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 shadow-xl w-full">
                <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 mb-5">
                  {resolvedTools.map((tool, i) => (
                    <motion.div key={tool.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.04 }} className="flex items-center gap-2">
                      <Check size={17} className="text-emerald-500 shrink-0" />
                      <EditableText as="span" page="home" section="aio_tools" contentKey={`${tool.id}_name`} fallback={isRTL && tool.name_ar ? tool.name_ar : tool.name} className="text-sm md:text-[0.95rem] text-foreground/80" />
                    </motion.div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 flex items-center justify-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }} className="bg-emerald-500/10 text-emerald-600 text-sm font-bold px-6 py-2.5 rounded-full text-center">
                    {t("aio.unified")}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="without"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3 md:gap-3.5"
            >
              {resolvedTools.map((tool, i) => {
                const Icon = resolveIcon(tool.icon);
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.04, type: "spring", stiffness: 140, damping: 18 }}
                    className="group rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5 transition-all flex flex-row sm:flex-col items-center text-left sm:text-center gap-3 sm:gap-1.5 sm:min-h-[140px]"
                  >
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 shrink-0 rounded-xl sm:rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <Icon size={20} className="sm:hidden" />
                      <Icon size={22} className="hidden sm:block" />
                    </div>
                    <div className="flex flex-col sm:items-center sm:contents min-w-0">
                      <EditableText as="span" page="home" section="aio_tools" contentKey={`${tool.id}_name`} fallback={isRTL && tool.name_ar ? tool.name_ar : tool.name} className="text-sm md:text-base font-semibold text-foreground leading-tight" />
                      <EditableText as="span" page="home" section="aio_tools" contentKey={`${tool.id}_competitor`} fallback={tool.competitor} className="text-xs text-muted-foreground sm:mt-auto" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

export default AllInOneSection;
