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

      {/* Minimal left-side scrim so the headline stays readable without dimming the photo */}
      <div
        className="absolute inset-y-0 left-0 w-[70%] sm:w-[55%] md:w-[45%]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--hero-navy) / 0.28) 0%, hsl(var(--hero-navy) / 0.12) 55%, hsl(var(--hero-navy) / 0) 100%)",
        }}
      />

      {/* Barely-there bottom fade for a smooth hand-off to the next section */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 sm:h-40 md:h-52"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, hsl(var(--hero-navy) / 0) 0%, hsl(var(--hero-navy) / 0.03) 40%, hsl(var(--hero-navy) / 0.12) 70%, hsl(var(--hero-navy) / 0.35) 100%)",
        }}
      />
    </div>
  );
};

export default HeroBackdrop;
