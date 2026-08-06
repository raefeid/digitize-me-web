import { motion, AnimatePresence } from "framer-motion";
import digitalControlAsset from "@/assets/hero/hero-digital-control.jpg.asset.json";
import smartArchivesAsset from "@/assets/hero/hero-smart-archives.jpg.asset.json";
import aiPowerAsset from "@/assets/hero/hero-ai-power.jpg.asset.json";

interface HeroBackdropProps {
  /** Index of the currently shown rotating hero word (0..2) */
  index: number;
}

const scenes = [
  {
    // Digital Control
    image: digitalControlAsset.url,
    glow: "hsl(var(--primary) / 0.22)",
  },
  {
    // Smart Archives
    image: smartArchivesAsset.url,
    glow: "hsl(var(--accent) / 0.18)",
  },
  {
    // AI Power
    image: aiPowerAsset.url,
    glow: "hsl(var(--accent) / 0.26)",
  },
];

const HeroBackdrop = ({ index }: HeroBackdropProps) => {
  const scene = scenes[index % scenes.length];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Cross-fading photographic backdrop */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`img-${index}`}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${scene.image})` }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Readability wash so the left-side copy always stays legible */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30 md:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

      {/* Soft moving glow orb */}
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
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(circle at 75% 50%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at 75% 50%, black, transparent 75%)",
        }}
      />
    </div>
  );
};

export default HeroBackdrop;
