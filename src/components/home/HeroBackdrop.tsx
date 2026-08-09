import { motion } from "framer-motion";
import heroImage from "@/assets/hero/digitizeme-hero-v2.jpg.asset.json";

const HeroBackdrop = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Full-bleed hero image at 100% opacity — no cross-fade */}
      <motion.div
        className="absolute inset-0 bg-cover bg-left bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage.url})` }}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ opacity: { duration: 0.9, ease: "easeOut" }, scale: { duration: 8, ease: "easeOut" } }}
      />

      {/* Localized left-side scrim so the copy stays readable without dimming the photo */}
      <div
        className="absolute inset-y-0 left-0 w-full sm:w-[60%] md:w-[45%]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--hero-navy) / 0.48) 0%, hsl(var(--hero-navy) / 0.22) 50%, hsl(var(--hero-navy) / 0) 100%)",
        }}
      />

      {/* Barely-there fade down to the next section */}
      <div
        className="absolute inset-x-0 bottom-0 h-44 sm:h-56 md:h-72"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, hsl(var(--hero-navy) / 0) 0%, hsl(var(--hero-navy) / 0.05) 32%, hsl(var(--hero-navy) / 0.16) 58%, hsl(var(--hero-navy) / 0.36) 80%, hsl(var(--hero-navy) / 0.62) 100%)",
        }}
      />
    </div>
  );
};

export default HeroBackdrop;
