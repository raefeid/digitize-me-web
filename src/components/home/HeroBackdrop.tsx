import { motion, AnimatePresence } from "framer-motion";
import bannerAsset from "@/assets/hero/hero-smart-archives-banner.png.asset.json";

interface HeroBackdropProps {
  /** Index of the currently shown rotating hero word (0..2) */
  index: number;
}

/** Accent glow tint that shifts with the rotating hero word */
const glows = [
  "hsl(var(--primary) / 0.22)",
  "hsl(var(--accent) / 0.18)",
  "hsl(var(--accent) / 0.26)",
];

const HeroBackdrop = ({ index }: HeroBackdropProps) => {
  const glow = glows[index % glows.length];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Deep navy base so the left column always reads as a solid panel */}
      <div className="absolute inset-0 bg-[hsl(var(--hero-navy))]" />

      {/* Photographic banner, anchored right so the archive scene stays visible */}
      <motion.div
        className="absolute inset-0 bg-cover bg-right bg-no-repeat"
        style={{ backgroundImage: `url(${bannerAsset.url})` }}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />

      {/* Left navy wash for copy legibility — vertical on small screens, horizontal on wide */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--hero-navy))] via-[hsl(var(--hero-navy)/0.85)] to-[hsl(var(--hero-navy)/0.55)] md:bg-gradient-to-r md:from-[hsl(var(--hero-navy))] md:via-[hsl(var(--hero-navy)/0.92)] md:to-transparent" />
      <div className="hidden md:block absolute inset-y-0 left-0 w-[58%] bg-[hsl(var(--hero-navy)/0.55)]" />

      {/* Soft moving glow orb tied to the rotating word */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`glow-${index}`}
          className="absolute right-[-10%] top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)` }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Bottom fade so the hero blends seamlessly into the next section */}
      <div className="absolute inset-x-0 bottom-0 h-40 md:h-56 bg-gradient-to-b from-transparent via-background/70 to-background" />
    </div>
  );
};

export default HeroBackdrop;
