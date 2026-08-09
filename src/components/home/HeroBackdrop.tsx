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
    </div>
  );
};

export default HeroBackdrop;
