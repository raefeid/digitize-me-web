import { motion } from "framer-motion";
import { FileText, ScanLine, Sparkles, Brain, Search, Database } from "lucide-react";
import { useMotionPreference } from "@/hooks/useReducedMotion";

interface AnimatedFeatureHeroProps {
  /** Lucide icon name from the feature record — controls which scene plays. */
  icon?: string | null;
  /** Optional class to size the wrapper. */
  className?: string;
}

/**
 * Per-feature animated hero illustration. Picks one of three SVG/Canvas
 * scenes based on the feature's icon family (OCR scan, document flow,
 * AI sparkles). Falls back to a calm doc-stack for unknown icons.
 *
 * Respects prefers-reduced-motion (renders a static frame) and goes
 * lighter on mobile (fewer particles, slower loops).
 */
const AnimatedFeatureHero = ({ icon, className = "" }: AnimatedFeatureHeroProps) => {
  const { reduced, mobile } = useMotionPreference();
  const scene = pickScene(icon);

  const wrapper = `relative w-full max-w-md mx-auto aspect-square ${className}`;

  if (scene === "ocr") return <OcrScanScene wrapper={wrapper} reduced={reduced} mobile={mobile} />;
  if (scene === "ai") return <AiSparklesScene wrapper={wrapper} reduced={reduced} mobile={mobile} />;
  if (scene === "search") return <SearchScene wrapper={wrapper} reduced={reduced} mobile={mobile} />;
  if (scene === "data") return <DataPipelineScene wrapper={wrapper} reduced={reduced} mobile={mobile} />;
  return <DocFlowScene wrapper={wrapper} reduced={reduced} mobile={mobile} />;
};

type Scene = "ocr" | "doc" | "ai" | "search" | "data";

const pickScene = (icon?: string | null): Scene => {
  const k = (icon ?? "").toLowerCase();
  if (k.includes("scan") || k.includes("camera") || k.includes("eye")) return "ocr";
  if (k.includes("brain") || k.includes("sparkle") || k.includes("wand") || k.includes("zap")) return "ai";
  if (k.includes("search") || k.includes("find") || k.includes("filter")) return "search";
  if (k.includes("database") || k.includes("server") || k.includes("cloud") || k.includes("network")) return "data";
  return "doc";
};

interface SceneProps {
  wrapper: string;
  reduced: boolean;
  mobile: boolean;
}

/* -------------------- OCR scan beam over a document -------------------- */
const OcrScanScene = ({ wrapper, reduced, mobile }: SceneProps) => (
  <div className={wrapper} aria-hidden>
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent" />
    <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="paper" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="hsl(var(--card))" />
          <stop offset="1" stopColor="hsl(var(--muted))" />
        </linearGradient>
        <linearGradient id="scanBeam" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="hsl(var(--accent))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--accent))" stopOpacity="0.7" />
          <stop offset="1" stopColor="hsl(var(--accent))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Paper */}
      <rect x="80" y="60" width="240" height="280" rx="14" fill="url(#paper)" stroke="hsl(var(--border))" strokeWidth="1.5" />
      {/* Header strip */}
      <rect x="100" y="84" width="120" height="14" rx="3" fill="hsl(var(--foreground))" opacity="0.85" />
      <rect x="100" y="106" width="80" height="8" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.5" />

      {/* Text lines (revealed as the scan passes) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.rect
          key={i}
          x={100}
          y={140 + i * 22}
          width={i % 3 === 2 ? 140 : 200}
          height={8}
          rx={2}
          fill="hsl(var(--muted-foreground))"
          opacity={0.25}
          initial={{ opacity: 0.1 }}
          animate={
            reduced
              ? { opacity: 0.45 }
              : { opacity: [0.1, 0.55, 0.45] }
          }
          transition={
            reduced ? undefined : { duration: 4, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }
          }
        />
      ))}

      {/* Scan beam */}
      {!reduced && (
        <motion.rect
          x="80"
          width="240"
          height="36"
          fill="url(#scanBeam)"
          initial={{ y: 60 }}
          animate={{ y: [60, 304, 60] }}
          transition={{ duration: mobile ? 6 : 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Corner brackets */}
      {[
        { x: 70, y: 50, dx: 20, dy: 20 },
        { x: 330, y: 50, dx: -20, dy: 20 },
        { x: 70, y: 350, dx: 20, dy: -20 },
        { x: 330, y: 350, dx: -20, dy: -20 },
      ].map((c, i) => (
        <g key={i} stroke="hsl(var(--accent))" strokeWidth="2.5" fill="none">
          <line x1={c.x} y1={c.y} x2={c.x + c.dx} y2={c.y} />
          <line x1={c.x} y1={c.y} x2={c.x} y2={c.y + c.dy} />
        </g>
      ))}
    </svg>

    {/* Floating chip */}
    <div className="absolute bottom-4 right-4 bg-card border border-border rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
      <ScanLine size={16} className="text-accent" />
      <span className="text-xs font-semibold text-foreground">99.7% accuracy</span>
    </div>
  </div>
);

/* -------------------- Document flow stack -------------------- */
const DocFlowScene = ({ wrapper, reduced, mobile }: SceneProps) => {
  const cards = mobile ? 3 : 4;
  return (
    <div className={wrapper} aria-hidden>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent" />
      {Array.from({ length: cards }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 w-44 h-56 -mt-28 -ml-22 bg-card border border-border rounded-2xl shadow-xl p-4"
          style={{ zIndex: cards - i, marginLeft: -88 }}
          initial={{ y: 0, x: 0, rotate: (i - 1) * 4 }}
          animate={
            reduced
              ? { x: (i - 1) * 14, y: i * 6, rotate: (i - 1) * 4 }
              : { x: (i - 1) * 14, y: [i * 6, i * 6 - 6, i * 6], rotate: (i - 1) * 4 }
          }
          transition={
            reduced ? undefined : { duration: 4, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }
          }
        >
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          </div>
          <FileText size={20} className="text-accent mb-3" />
          <div className="space-y-2">
            <div className="h-2 rounded bg-muted-foreground/30 w-3/4" />
            <div className="h-2 rounded bg-muted-foreground/20 w-full" />
            <div className="h-2 rounded bg-muted-foreground/20 w-2/3" />
            <div className="h-2 rounded bg-muted-foreground/20 w-5/6" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/* -------------------- AI sparkles around a brain -------------------- */
const AiSparklesScene = ({ wrapper, reduced, mobile }: SceneProps) => {
  const count = mobile ? 6 : 12;
  return (
    <div className={wrapper} aria-hidden>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/15 via-primary/5 to-transparent" />
      {/* Pulsing center */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-accent/20 flex items-center justify-center"
        animate={reduced ? undefined : { scale: [1, 1.08, 1] }}
        transition={reduced ? undefined : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-24 h-24 rounded-full bg-accent/30 flex items-center justify-center">
          <Brain size={40} className="text-accent" />
        </div>
      </motion.div>

      {/* Orbiting sparkles */}
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = mobile ? 110 : 140;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{ marginLeft: x - 8, marginTop: y - 8 }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={
              reduced
                ? { opacity: 0.6, scale: 1 }
                : { opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }
            }
            transition={
              reduced
                ? undefined
                : { duration: 2.4, repeat: Infinity, delay: (i / count) * 2.4, ease: "easeInOut" }
            }
          >
            <Sparkles size={16} className="text-accent" />
          </motion.div>
        );
      })}
    </div>
  );
};

/* -------------------- Search ripple over results -------------------- */
const SearchScene = ({ wrapper, reduced }: SceneProps) => (
  <div className={wrapper} aria-hidden>
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />
    <div className="absolute inset-8 bg-card border border-border rounded-2xl shadow-xl p-5">
      <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-muted">
        <Search size={16} className="text-accent" />
        <div className="h-2.5 rounded bg-muted-foreground/30 w-32" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-3 py-2.5 border-b border-border/60 last:border-b-0"
          initial={{ opacity: 0, x: -8 }}
          animate={reduced ? { opacity: 1, x: 0 } : { opacity: [0, 1, 1, 0.6], x: [-8, 0, 0, 0] }}
          transition={reduced ? undefined : { duration: 3, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
        >
          <FileText size={14} className="text-muted-foreground" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2 rounded bg-foreground/60" style={{ width: `${60 + i * 8}%` }} />
            <div className="h-1.5 rounded bg-muted-foreground/30 w-1/2" />
          </div>
        </motion.div>
      ))}
    </div>

    {/* Ripple */}
    {!reduced && (
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent/40"
        initial={{ width: 40, height: 40, opacity: 0.6 }}
        animate={{ width: [40, 220], height: [40, 220], opacity: [0.6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
      />
    )}
  </div>
);

/* -------------------- Data pipeline (DB → API) -------------------- */
const DataPipelineScene = ({ wrapper, reduced }: SceneProps) => (
  <div className={wrapper} aria-hidden>
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />
    <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="pipe" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="hsl(var(--accent))" />
          <stop offset="1" stopColor="hsl(var(--primary))" />
        </linearGradient>
      </defs>

      {/* Three nodes */}
      {[
        { x: 70, y: 200, label: "DB" },
        { x: 200, y: 90, label: "API" },
        { x: 200, y: 310, label: "API" },
        { x: 330, y: 200, label: "OUT" },
      ].map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="34" fill="hsl(var(--card))" stroke="hsl(var(--accent))" strokeWidth="2" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="hsl(var(--foreground))">{n.label}</text>
        </g>
      ))}

      {/* Pipes */}
      {[
        "M104 200 Q150 145 166 110",
        "M104 200 Q150 255 166 290",
        "M234 110 Q280 145 296 200",
        "M234 290 Q280 255 296 200",
      ].map((d, i) => (
        <g key={i}>
          <path d={d} stroke="hsl(var(--border))" strokeWidth="3" fill="none" />
          {!reduced && (
            <circle r="4" fill="url(#pipe)">
              <animateMotion dur={`${3 + i * 0.4}s`} repeatCount="indefinite" path={d} />
            </circle>
          )}
        </g>
      ))}
    </svg>

    <div className="absolute top-3 left-3 bg-card border rounded-lg px-2.5 py-1 text-[10px] font-semibold text-accent">
      <Database size={11} className="inline mr-1 -mt-0.5" /> Real-time
    </div>
  </div>
);

export default AnimatedFeatureHero;
