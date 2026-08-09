import { motion } from "framer-motion";
import heroImage from "@/assets/hero/digitizeme-hero-v2.jpg.asset.json";

const HeroBackdrop = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Full-bleed hero image at 100% opacity — no cross-fade */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage.url})` }}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ opacity: { duration: 0.9, ease: "easeOut" }, scale: { duration: 8, ease: "easeOut" } }}
      />

      {/* Left-side legibility scrim so headline stays crisp over the bright office scene */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--hero-navy)/0.88)] via-[hsl(var(--hero-navy)/0.55)] to-[hsl(var(--hero-navy)/0.18)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--hero-navy)/0.65)] via-transparent to-[hsl(var(--hero-navy)/0.55)]" />

      {/* Subtle coral/navy ambient glow on the right for depth */}
      <div
        className="absolute right-[-8%] top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full blur-3xl opacity-70"
        style={{ background: "radial-gradient(circle, hsl(var(--dm-coral) / 0.18), transparent 70%)" }}
      />

      {/* Smooth fade down to the next section */}
      <div
        className="absolute inset-x-0 bottom-0 h-44 sm:h-56 md:h-72"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, hsl(var(--hero-navy) / 0) 0%, hsl(var(--hero-navy) / 0.15) 18%, hsl(var(--hero-navy) / 0.38) 36%, hsl(var(--hero-navy) / 0.62) 54%, hsl(var(--hero-navy) / 0.84) 76%, hsl(var(--hero-navy)) 100%)",
        }}
      />
    </div>
  );
};

export default HeroBackdrop;
