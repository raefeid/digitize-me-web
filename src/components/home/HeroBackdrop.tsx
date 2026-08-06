import { motion, AnimatePresence } from "framer-motion";
import { FileText, ShieldCheck, Sparkles, Search, FolderLock, Cpu } from "lucide-react";

interface HeroBackdropProps {
  /** Index of the currently shown rotating hero word (0..2) */
  index: number;
}

const scenes = [
  {
    // Digital Control
    tint: "from-dm-navy-light/70 via-background to-background",
    glow: "hsl(var(--primary) / 0.28)",
    icons: [FileText, ShieldCheck, Cpu],
  },
  {
    // Smart Archives
    tint: "from-background via-background to-dm-navy-light/70",
    glow: "hsl(var(--accent) / 0.22)",
    icons: [FolderLock, Search, FileText],
  },
  {
    // AI Power
    tint: "from-dm-coral-light/60 via-background to-dm-navy-light/60",
    glow: "hsl(var(--accent) / 0.3)",
    icons: [Sparkles, Cpu, Search],
  },
];

const HeroBackdrop = ({ index }: HeroBackdropProps) => {
  const scene = scenes[index % scenes.length];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <AnimatePresence mode="sync">
        <motion.div
          key={`tint-${index}`}
          className={`absolute inset-0 bg-gradient-to-br ${scene.tint}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Soft moving glow orb, sits behind the visual cluster */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`glow-${index}`}
          className="absolute right-[-10%] top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${scene.glow}, transparent 70%)` }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(circle at 75% 50%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 75% 50%, black, transparent 75%)",
        }}
      />

      {/* Floating cards cluster (right side) */}
      <div className="absolute inset-y-0 right-0 hidden w-1/2 items-center justify-center lg:flex">
        <div className="relative h-[26rem] w-[26rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`cluster-${index}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.94, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.05, rotate: 3 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {scene.icons.map((Icon, i) => {
                const positions = [
                  { top: "6%", left: "12%" },
                  { top: "38%", left: "52%" },
                  { top: "70%", left: "18%" },
                ];
                return (
                  <motion.div
                    key={i}
                    className="absolute flex h-24 w-24 items-center justify-center rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md shadow-lg"
                    style={positions[i]}
                    animate={{ y: [0, -14, 0] }}
                    transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                  >
                    <Icon className="h-9 w-9 text-accent" strokeWidth={1.5} />
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HeroBackdrop;
