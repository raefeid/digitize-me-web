import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import digitalControlImage from "@/assets/hero/digitizeme-hero-v6.png.asset.json";
import smartArchivesImage from "@/assets/hero/digitizeme-smart-archives.jpg.asset.json";
import aiPowerImage from "@/assets/hero/hero-ai-power-scene.jpg.asset.json";

const SCENES = [
  { name: "Digital Control", image: digitalControlImage.url },
  { name: "Smart Archives", image: smartArchivesImage.url },
  { name: "AI Power", image: aiPowerImage.url },
];

interface HeroBackdropProps {
  activeScene?: number;
}

const HeroBackdrop = ({ activeScene = 0 }: HeroBackdropProps) => {
  const { isRTL } = useLanguage();
  const sceneIndex = ((activeScene % SCENES.length) + SCENES.length) % SCENES.length;

  // Preload all scene images so transitions never flash a blank frame.
  useEffect(() => {
    SCENES.forEach((scene) => {
      const img = new Image();
      img.src = scene.image;
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Cross-fading scene images with a cinematic Ken Burns crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={SCENES[sceneIndex].name}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={{
            backgroundImage: `url(${SCENES[sceneIndex].image})`,
            transform: isRTL ? "scaleX(-1)" : undefined,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 3, ease: [0.4, 0, 0.2, 1] },
          }}
        />
      </AnimatePresence>

      {/* Global subtle darkening so every scene has consistent contrast for text */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            `radial-gradient(ellipse at ${isRTL ? "30%" : "70%"} 50%, hsl(var(--hero-navy) / 0.22) 0%, transparent 60%)`,
        }}
      />

      {/* Strong left-side scrim so the headline stays readable without dimming the photo */}
      <div
        className="absolute inset-y-0 ltr:left-0 rtl:right-0 w-[85%] sm:w-[70%] md:w-[58%] lg:w-[50%]"
        style={{
          backgroundImage:
            `linear-gradient(to ${isRTL ? "left" : "right"}, hsl(var(--hero-navy) / 0.55) 0%, hsl(var(--hero-navy) / 0.35) 45%, hsl(var(--hero-navy) / 0.08) 75%, hsl(var(--hero-navy) / 0) 100%)`,
        }}
      />
    </div>
  );
};

export default HeroBackdrop;
