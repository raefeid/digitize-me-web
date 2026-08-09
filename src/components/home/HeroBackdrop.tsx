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

      {/* Very light scrims so the photo stays the hero while text remains readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--hero-navy)/0.42)] via-[hsl(var(--hero-navy)/0.14)] to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--hero-navy)/0.18)] via-transparent to-[hsl(var(--hero-navy)/0.18)]" />

      {/* Soft fade down to the next section */}
      <div
        className="absolute inset-x-0 bottom-0 h-44 sm:h-56 md:h-72"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, hsl(var(--hero-navy) / 0) 0%, hsl(var(--hero-navy) / 0.08) 28%, hsl(var(--hero-navy) / 0.22) 52%, hsl(var(--hero-navy) / 0.46) 74%, hsl(var(--hero-navy) / 0.72) 90%, hsl(var(--hero-navy)) 100%)",
        }}
      />
    </div>
  );
};

export default HeroBackdrop;
