import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import digitalControlImage from "@/assets/hero/digitizeme-hero-v5.jpg.asset.json";
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
          style={{ backgroundImage: `url(${SCENES[sceneIndex].image})` }}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{
            opacity: { duration: 1.8, ease: [0.4, 0, 0.2, 1] },
            scale: { duration: 10, ease: [0.25, 0.1, 0.25, 1] },
          }}
        />
      </AnimatePresence>

      {/* Global subtle darkening so every scene has consistent contrast for text */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 70% 50%, hsl(var(--hero-navy) / 0.22) 0%, transparent 60%)",
        }}
      />

      {/* Strong left-side scrim so the headline stays readable without dimming the photo */}
      <div
        className="absolute inset-y-0 left-0 w-[85%] sm:w-[70%] md:w-[58%] lg:w-[50%]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--hero-navy) / 0.55) 0%, hsl(var(--hero-navy) / 0.35) 45%, hsl(var(--hero-navy) / 0.08) 75%, hsl(var(--hero-navy) / 0) 100%)",
        }}
      />
    </div>
  );
};

export default HeroBackdrop;
