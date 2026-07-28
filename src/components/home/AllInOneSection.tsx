import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [absorbed, setAbsorbed] = useState(false);

  // Pull the admin-managed tool list (falls back to defaults until query resolves).
  const { data: toolsData } = useAioTools();
  const tools: AioTool[] = toolsData ?? DEFAULT_AIO_TOOLS;

  const resolvedTools = tools;

  return (
    <section className="section-padding bg-muted/20 overflow-hidden" aria-label="All in One Platform">
      <div className="container-max">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">{getContent("aio_badge", t("aio.badge"))}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">{getContent("aio_title", t("aio.title"))}</h2>
          <p className="text-muted-foreground">{getContent("aio_desc", t("aio.desc"))}</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <span className={`text-sm font-medium transition-colors ${!absorbed ? "text-foreground" : "text-muted-foreground"}`}>{t("aio.without")}</span>
          <button onClick={() => setAbsorbed(!absorbed)} className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${absorbed ? "bg-accent" : "bg-border"}`} aria-label="Toggle with/without Digitize me">
            <motion.div className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md" animate={{ x: absorbed ? 30 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </button>
          <span className={`text-sm font-medium transition-colors ${absorbed ? "text-accent font-bold" : "text-muted-foreground"}`}>{t("aio.with")}</span>
        </div>

        <AnimatePresence>
          {absorbed && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 150, damping: 20 }} className="w-full max-w-sm mx-auto flex flex-col items-center mb-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1, boxShadow: "0 0 80px 20px hsl(var(--accent) / 0.4)" }} transition={{ duration: 0.5, type: "spring" }} className="w-24 h-24 rounded-full bg-white border-2 border-accent/40 flex items-center justify-center p-3 mb-2">
                <img src={logo} alt="Digitize me" className="w-20 h-auto object-contain" />
              </motion.div>
              <div className="bg-card/90 backdrop-blur-md border border-accent/20 rounded-2xl p-5 shadow-xl w-full">
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4">
                  {resolvedTools.map((tool, i) => (
                    <motion.div key={tool.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.04 }} className="flex items-center gap-1.5">
                      <Check size={13} className="text-accent shrink-0" />
                      <EditableText as="span" page="home" section="aio_tools" contentKey={`${tool.id}_name`} fallback={isRTL && tool.name_ar ? tool.name_ar : tool.name} className="text-xs text-muted-foreground" />
                    </motion.div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring" }} className="bg-accent/10 text-accent text-xs font-bold px-4 py-2 rounded-full">
                    {t("aio.unified")}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!absorbed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
            >
              {resolvedTools.map((tool, i) => {
                const Icon = resolveIcon(tool.icon);
                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.04, type: "spring", stiffness: 140, damping: 18 }}
                    className="group rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5 transition-all flex flex-col items-center text-center gap-2 min-h-[170px]"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <Icon size={26} />
                    </div>
                    <EditableText as="span" page="home" section="aio_tools" contentKey={`${tool.id}_name`} fallback={isRTL && tool.name_ar ? tool.name_ar : tool.name} className="text-sm md:text-base font-semibold text-foreground leading-tight" />
                    <EditableText as="span" page="home" section="aio_tools" contentKey={`${tool.id}_competitor`} fallback={tool.competitor} className="text-xs text-muted-foreground mt-auto" />
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
