import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { icons, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useGeo } from "@/hooks/useGeoLocation";
import { formatRegionPrice } from "@/config/regionPricing";
import EditableText from "@/components/cms/EditableText";
import { useAioTools, DEFAULT_AIO_TOOLS, type AioTool } from "@/hooks/useAioTools";
import logo from "@/assets/digitizeme-logo.png";

/**
 * Lay out N tools in a centered grid around the absolute origin (0,0).
 * Used by the "scattered" view so the canvas adapts to any tool count
 * (the section was previously hardcoded for exactly 12).
 *
 * - 1-4 tools  → single row
 * - 5-8 tools  → 4 columns × 2 rows
 * - 9+ tools   → 4 columns × ceil(N/4) rows
 */
const computePositions = (count: number): { x: number; y: number }[] => {
  if (count === 0) return [];
  const cols = count <= 4 ? count : 4;
  const rows = Math.ceil(count / cols);
  const colGap = 160;
  const rowGap = 145;
  const xOffset = -((cols - 1) * colGap) / 2;
  const yOffset = 0;
  return Array.from({ length: count }, (_, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    return { x: xOffset + c * colGap, y: yOffset + r * rowGap };
  });
};

/** Resolve a Lucide icon by name, falling back to a generic check icon. */
const resolveIcon = (name: string) => {
  const Icon = (icons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[name];
  return Icon ?? Check;
};

const AllInOneSection = () => {
  const { t, isRTL } = useLanguage();
  const { getContent } = useSiteContent("home", "allinone");
  const { getContent: getToolContent } = useSiteContent("home", "aio_tools");
  const [absorbed, setAbsorbed] = useState(false);
  const { region } = useGeo({ respectLanguageOverride: false });

  // Pull the admin-managed tool list (falls back to defaults until query resolves).
  const { data: toolsData } = useAioTools();
  const tools: AioTool[] = toolsData ?? DEFAULT_AIO_TOOLS;

  // Per-tool inline text overrides (name + competitor) and price overrides keep working
  // by addressing each row's stable `id` — admins can either edit inline OR via the panel.
  const resolvedTools = tools.map((tool) => {
    const overridePrice = parseFloat(getToolContent(`${tool.id}_price`, ""));
    return {
      ...tool,
      displayName: getToolContent(`${tool.id}_name`, isRTL && tool.name_ar ? tool.name_ar : tool.name),
      displayCompetitor: getToolContent(`${tool.id}_competitor`, tool.competitor),
      effectivePrice: !isNaN(overridePrice) && overridePrice > 0 ? overridePrice : tool.price,
    };
  });

  const totalPrice = resolvedTools.reduce((sum, t) => sum + t.effectivePrice, 0);
  const bundlePriceUsd = parseFloat(getContent("aio_bundle_price_usd", "49")) || 49;

  // Recompute scatter positions whenever the tool count changes.
  const positions = useMemo(() => computePositions(resolvedTools.length), [resolvedTools.length]);

  // Canvas height adapts to the number of rows so taller lists don't get clipped.
  const canvasHeight = useMemo(() => {
    const rows = Math.ceil(resolvedTools.length / 4) || 1;
    return Math.max(320, rows * 160 + 80);
  }, [resolvedTools.length]);

  const formatPrice = (usdAmount: number, suffix = true) => {
    const rates: Record<string, number> = { EG: 50, AE: 3.67, SA: 3.75, DEFAULT: 1 };
    const localAmount = Math.round(usdAmount * (rates[region] || 1));
    const per = suffix ? (isRTL ? "/شهر" : "/mo") : "";
    return formatRegionPrice(localAmount, region, per, isRTL ? "مجاني" : "Free", isRTL);
  };

  return (
    <section className="section-padding bg-muted/20 overflow-hidden" aria-label="All in One Platform">
      <div className="container-max">
        <div className="text-center max-w-2xl mx-auto mb-12">
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
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(totalPrice)}</span>
                    <div className="text-xl font-extrabold text-accent">{formatPrice(bundlePriceUsd)}</div>
                  </div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: "spring" }} className="bg-accent/10 text-accent text-xs font-bold px-3 py-1.5 rounded-full">
                    {isRTL ? `وفّر ` : `Save `}{formatPrice(totalPrice - bundlePriceUsd)}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!absorbed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full max-w-3xl mx-auto flex flex-col items-center" style={{ minHeight: canvasHeight }}>
              {resolvedTools.map((tool, i) => {
                const pos = positions[i] ?? { x: 0, y: 0 };
                const Icon = resolveIcon(tool.icon);
                return (
                  <motion.div key={tool.id} className="absolute left-1/2 top-0 z-20" initial={false} animate={{ x: pos.x, y: pos.y, scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: (resolvedTools.length - i) * 0.03, type: "spring", stiffness: 120, damping: 18 }} style={{ marginLeft: -56, marginTop: 48 }}>
                    <div className="w-28 flex flex-col items-center gap-1.5 group">
                      <div className="w-14 h-14 rounded-2xl bg-card border border-border shadow-md flex items-center justify-center group-hover:shadow-lg group-hover:border-accent/30 transition-all">
                        <Icon size={22} className="text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      <EditableText as="span" page="home" section="aio_tools" contentKey={`${tool.id}_name`} fallback={isRTL && tool.name_ar ? tool.name_ar : tool.name} className="text-xs text-muted-foreground font-medium text-center leading-tight" />
                      <EditableText as="span" page="home" section="aio_tools" contentKey={`${tool.id}_competitor`} fallback={tool.competitor} className="text-[11px] text-foreground/50 font-medium" />
                      <span className="text-[11px] font-bold text-destructive/70">{formatPrice(tool.effectivePrice)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!absorbed && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-muted-foreground mt-8 text-sm">
              💸 {t("aio.costNote").replace("{{total}}", formatPrice(totalPrice, false))}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AllInOneSection;
