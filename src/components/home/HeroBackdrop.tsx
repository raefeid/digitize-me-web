import { motion, AnimatePresence } from "framer-motion";
import digitalControl from "@/assets/hero/hero-digital-control.jpg.asset.json";
import smartArchives from "@/assets/hero/hero-smart-archives.jpg.asset.json";
import aiPower from "@/assets/hero/hero-ai-power-scene.jpg.asset.json";

interface HeroBackdropProps {
  /** Index of the currently shown rotating hero word (0..2) */
  index: number;
}

/** Scenes matched to the rotating hero words: Digital Control / Smart Archives / AI Power */
const scenes = [
  { url: digitalControl.url, glow: "hsl(var(--primary) / 0.22)" },
  { url: smartArchives.url, glow: "hsl(var(--accent) / 0.18)" },
  { url: aiPower.url, glow: "hsl(var(--accent) / 0.28)" },
];

const HeroBackdrop = ({ index }: HeroBackdropProps) => {
  const scene = scenes[index % scenes.length];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Deep navy base */}
      <div className="absolute inset-0 bg-[hsl(var(--hero-navy))]" />

      {/* Cross-fading cinematic scene tied to the rotating word */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`scene-${index}`}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${scene.url})` }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ opacity: { duration: 1.1, ease: "easeInOut" }, scale: { duration: 6, ease: "easeOut" } }}
        />
      </AnimatePresence>

      {/* Cinematic scrims: dark from the left for copy, soft top band under the navbar */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--hero-navy)/0.92)] via-[hsl(var(--hero-navy)/0.6)] to-[hsl(var(--hero-navy)/0.15)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--hero-navy)/0.75)] via-transparent to-[hsl(var(--hero-navy)/0.7)]" />

      {/* Soft moving glow orb tied to the rotating word */}
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

      {/* Eased fade down to solid navy; the next section continues navy -> background */}
      <div
        className="absolute inset-x-0 bottom-0 h-44 sm:h-56 md:h-72"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, hsl(var(--hero-navy) / 0) 0%, hsl(var(--hero-navy) / 0.1) 16%, hsl(var(--hero-navy) / 0.28) 32%, hsl(var(--hero-navy) / 0.52) 48%, hsl(var(--hero-navy) / 0.76) 66%, hsl(var(--hero-navy) / 0.93) 84%, hsl(var(--hero-navy)) 100%)",
        }}
      />


    </div>
  );
};

export default HeroBackdrop;
