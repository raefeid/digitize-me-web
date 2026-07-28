import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import ocrLoop from "@/assets/ocr-engine-loop.mp4.asset.json";

export interface ShowcaseFeature {
  key: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface Props {
  features: ShowcaseFeature[];
}

/**
 * Sticky scroll-telling block: a boomerang (ping-pong) video on one side,
 * the USP copy list on the other. The active USP + visual accent change
 * as the user scrolls through the block.
 */
const ScrollFeatureShowcase = ({ features }: Props) => {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Boomerang playback: play forward, then rewind, then repeat.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let reverse = false;
    let raf = 0;

    const tick = () => {
      if (reverse) {
        video.currentTime = Math.max(0, video.currentTime - 0.033);
        if (video.currentTime <= 0.05) {
          reverse = false;
          video.play().catch(() => {});
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const onEnded = () => {
      reverse = true;
      video.pause();
    };
    const onTimeUpdate = () => {
      if (!reverse && video.duration && video.currentTime >= video.duration - 0.08) onEnded();
    };

    video.addEventListener("ended", onEnded);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.play().catch(() => {});
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  // Track which USP is centered in the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = itemRefs.current.indexOf(visible.target as HTMLDivElement);
          if (idx !== -1) setActive(idx);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.5, 1] },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [features.length]);

  const ActiveIcon = features[active]?.icon;

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
      {/* Visual — sticky on the left */}
      <div className="lg:sticky lg:top-28">
        <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-xl bg-muted/20 aspect-[4/3]">
          <video
            ref={videoRef}
            src={ocrLoop.url}
            muted
            playsInline
            autoPlay
            preload="auto"
            aria-label="AI document digitization animation"
            className="w-full h-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/30 via-transparent to-accent/10" />

          <AnimatePresence mode="wait">
            <motion.div
              key={features[active]?.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="absolute left-5 right-5 bottom-5 rounded-xl border border-border/60 bg-background/85 backdrop-blur-sm px-5 py-4 flex items-center gap-4 shadow-lg"
            >
              {ActiveIcon && (
                <span className="shrink-0 h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <ActiveIcon className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-accent font-semibold">
                  {String(active + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
                </p>
                <p className="font-semibold text-foreground truncate">{features[active]?.title}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="hidden lg:flex gap-2 mt-5 justify-center">
          {features.map((f, i) => (
            <span
              key={f.key}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-8 bg-accent" : "w-3 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Copy — scrolls on the right */}
      <div className="space-y-6 lg:space-y-16 lg:py-16">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.key}
              ref={(el) => (itemRefs.current[i] = el)}
              className={`transition-all duration-500 border-s-2 ps-6 ${
                i === active ? "border-accent opacity-100" : "border-border opacity-45"
              }`}
            >
              <span className="inline-flex h-10 w-10 rounded-lg bg-accent/10 text-accent items-center justify-center mb-4">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScrollFeatureShowcase;
