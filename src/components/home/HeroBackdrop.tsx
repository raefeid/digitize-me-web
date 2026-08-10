import { useEffect, useRef } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import heroVideo from "@/assets/hero/hero-seamless-loop.mp4.asset.json";

interface HeroBackdropProps {
  activeScene?: number;
}

const HeroBackdrop = ({ activeScene = 0 }: HeroBackdropProps) => {
  const { isRTL } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Slow the playback for a calmer, more cinematic feel.
  // Seamless loop: restart slightly before the very end to avoid the
  // single-frame stall some browsers show at the loop boundary.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = 0.5;
    const onTimeUpdate = () => {
      if (v.duration && v.currentTime >= v.duration - 0.08) {
        v.currentTime = 0.02;
        void v.play();
      }
    };
    v.addEventListener("timeupdate", onTimeUpdate);
    return () => v.removeEventListener("timeupdate", onTimeUpdate);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideo.url}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{ transform: isRTL ? "scaleX(-1)" : undefined }}
      />

      {/* Global subtle darkening so the scene has consistent contrast for text */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            `radial-gradient(ellipse at ${isRTL ? "30%" : "70%"} 50%, hsl(var(--hero-navy) / 0.22) 0%, transparent 60%)`,
        }}
      />

      {/* Left-side scrim so the headline stays readable */}
      <div
        className="absolute inset-y-0 ltr:left-0 rtl:right-0 w-[85%] sm:w-[70%] md:w-[58%] lg:w-[50%]"
        style={{
          opacity: 0.5,
          backgroundImage:
            `linear-gradient(to ${isRTL ? "left" : "right"}, hsl(var(--hero-navy) / 0.55) 0%, hsl(var(--hero-navy) / 0.35) 45%, hsl(var(--hero-navy) / 0.08) 75%, hsl(var(--hero-navy) / 0) 100%)`,
        }}
      />
    </div>
  );
};

export default HeroBackdrop;
