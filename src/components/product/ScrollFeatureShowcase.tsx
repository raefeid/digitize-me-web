import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import productVideo from "@/assets/digitizeme-product.mp4.asset.json";

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

  // Seamless loop: cross-fade the last moments back into the start.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const FADE = 0.6;

    const onTimeUpdate = () => {
      const d = video.duration;
      if (!d || Number.isNaN(d)) return;
      const remaining = d - video.currentTime;
      const t = video.currentTime;
      const opacity =
        remaining < FADE ? remaining / FADE : t < FADE ? Math.max(t / FADE, 0.15) : 1;
      video.style.opacity = String(opacity);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  // Track which USP is closest to the viewport centre (scroll-driven, no jitter).
  useEffect(() => {
    let raf = 0;
    let last = -1;

    const compute = () => {
      raf = 0;
      const centre = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - centre);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      if (best !== last) {
        last = best;
        setActive(best);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [features.length]);


  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
      {/* Visual — sticky on the left */}
      <div className="lg:sticky lg:top-28">
        <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-xl bg-muted/20 aspect-video">
          <video
            ref={videoRef}
            src={productVideo.url}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            style={{ transition: "opacity 120ms linear" }}
            aria-label="AI document digitization animation"
            className="w-full h-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/30 via-transparent to-accent/10" />
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
