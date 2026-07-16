import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Fullscreen "paper turning into digital" transition. Dispatch:
 *   launchExternal("https://fotofind.digitizeme.ae/")
 */
export const launchExternal = (url: string, newTab = false) => {
  window.dispatchEvent(new CustomEvent("launch-external", { detail: { url, newTab } }));
};

type Payload = { url: string; newTab: boolean };

const DURATION = 2800; // ms

const LaunchOverlay = () => {
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Payload>;
      if (!ce.detail?.url) return;
      setPayload(ce.detail);
      window.setTimeout(() => {
        if (ce.detail.newTab) {
          window.open(ce.detail.url, "_blank", "noopener,noreferrer");
          // keep overlay a bit longer so the homepage isn't visible behind
          window.setTimeout(() => setPayload(null), 1200);
        } else {
          // same-tab: leave overlay mounted until the browser navigates away
          window.location.href = ce.detail.url;
        }
      }, DURATION);
    };
    window.addEventListener("launch-external", handler as EventListener);
    return () => window.removeEventListener("launch-external", handler as EventListener);
  }, []);

  if (!payload) return null;

  // Precompute particle positions for the "paper → pixels" dissolve.
  const particles = Array.from({ length: 42 }).map((_, i) => {
    const angle = (i / 42) * Math.PI * 2;
    const radius = 120 + ((i * 17) % 90);
    return {
      dx: Math.cos(angle) * radius,
      dy: Math.sin(angle) * radius,
      delay: 900 + (i % 10) * 40,
      size: 4 + (i % 4) * 2,
      hue: i % 3, // 0 = accent, 1 = primary, 2 = neutral
    };
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md animate-launch-fade" />

      {/* Soft radial glow behind the paper */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[55vmin] h-[55vmin] rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.35)_0%,hsl(var(--accent)/0)_70%)] animate-launch-glow" />
      </div>

      {/* Center stage */}
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-8">
        {/* Paper -> digital scene */}
        <div className="relative w-[220px] h-[280px]">
          {/* Paper sheet */}
          <div className="paper-sheet absolute inset-0 rounded-md bg-card border border-border shadow-[0_25px_60px_hsl(var(--foreground)/0.18)] overflow-hidden">
            {/* Folded corner */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-muted border-l border-b border-border" style={{ clipPath: "polygon(0 0, 100% 100%, 100% 0)" }} />
            {/* Text lines */}
            <div className="pt-8 px-6 space-y-2.5">
              <div className="h-2 rounded bg-foreground/70 w-1/2" />
              <div className="h-1.5 rounded bg-foreground/25 w-full" />
              <div className="h-1.5 rounded bg-foreground/25 w-11/12" />
              <div className="h-1.5 rounded bg-foreground/25 w-10/12" />
              <div className="h-1.5 rounded bg-foreground/25 w-full" />
              <div className="h-1.5 rounded bg-foreground/25 w-9/12" />
              <div className="h-1.5 rounded bg-foreground/25 w-11/12" />
              <div className="h-1.5 rounded bg-foreground/25 w-8/12" />
              <div className="mt-4 h-10 rounded bg-muted border border-border" />
              <div className="h-1.5 rounded bg-foreground/25 w-10/12" />
              <div className="h-1.5 rounded bg-foreground/25 w-6/12" />
            </div>

            {/* OCR scan beam */}
            <div className="scan-beam absolute left-0 right-0 h-8 bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
            {/* Scan line */}
            <div className="scan-line absolute left-0 right-0 h-px bg-accent shadow-[0_0_12px_hsl(var(--accent))]" />
          </div>

          {/* Dissolving pixel particles */}
          {particles.map((p, i) => (
            <span
              key={i}
              className={`particle absolute top-1/2 left-1/2 rounded-[2px] ${
                p.hue === 0 ? "bg-accent" : p.hue === 1 ? "bg-primary" : "bg-foreground/60"
              }`}
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                // CSS custom properties consumed by the keyframes below
                ["--dx" as any]: `${p.dx}px`,
                ["--dy" as any]: `${p.dy}px`,
                animationDelay: `${p.delay}ms`,
              }}
            />
          ))}

          {/* Digital badge that resolves at the end */}
          <div className="digital-badge absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto w-[150px] h-[150px] rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shadow-[0_20px_50px_hsl(var(--accent)/0.55)]">
            <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16" strokeWidth={2.2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h10l6 6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              <path d="M14 4v6h6" />
              <path d="m8 15 2.5 2.5L16 12" />
            </svg>
          </div>
        </div>

        {/* Caption */}
        <div className="text-center animate-launch-text">
          <p className="text-lg md:text-xl font-semibold text-foreground">
            Digitizing your workspace
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Paper in, intelligence out…
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-56 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-accent rounded-full animate-launch-progress" />
        </div>
      </div>

      <style>{`
        @keyframes launch-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes launch-glow {
          0% { transform: scale(0.6); opacity: 0 }
          40% { opacity: 1 }
          100% { transform: scale(1.4); opacity: 0.6 }
        }

        /* Paper appears, gets scanned, then dissolves */
        @keyframes paper-in {
          0%   { opacity: 0; transform: translateY(20px) rotate(-6deg) scale(0.85) }
          18%  { opacity: 1; transform: translateY(0) rotate(0deg) scale(1) }
          55%  { opacity: 1; transform: translateY(0) rotate(0deg) scale(1) }
          72%  { opacity: 1; transform: translateY(-4px) scale(1.02); filter: brightness(1.15) }
          85%  { opacity: 0; transform: translateY(-8px) scale(0.9); filter: brightness(1.4) blur(2px) }
          100% { opacity: 0 }
        }

        /* OCR scan beam sweeps top→bottom */
        @keyframes scan-beam {
          0%, 22%   { opacity: 0; transform: translateY(-40px) }
          30%       { opacity: 1 }
          60%       { opacity: 1; transform: translateY(280px) }
          75%, 100% { opacity: 0; transform: translateY(280px) }
        }
        @keyframes scan-line {
          0%, 22%   { opacity: 0; top: 0 }
          30%       { opacity: 1 }
          60%       { opacity: 1; top: 100% }
          75%, 100% { opacity: 0; top: 100% }
        }

        /* Pixel particles fly outward as the paper dissolves */
        @keyframes particle {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5) }
          20%  { opacity: 1; transform: translate(-50%, -50%) scale(1) }
          100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.3) }
        }

        /* Digital badge assembles at the end */
        @keyframes digital-in {
          0%, 78%  { opacity: 0; transform: translateY(-50%) scale(0.4); filter: blur(6px) }
          88%      { opacity: 1; transform: translateY(-50%) scale(1.06); filter: blur(0) }
          100%     { opacity: 1; transform: translateY(-50%) scale(1) }
        }

        @keyframes launch-text {
          0% { opacity: 0; transform: translateY(8px) }
          20% { opacity: 1; transform: translateY(0) }
          85% { opacity: 1 }
          100% { opacity: 0 }
        }
        @keyframes launch-progress {
          0% { width: 0% }
          100% { width: 100% }
        }

        .animate-launch-fade { animation: launch-fade 220ms ease-out forwards }
        .animate-launch-glow { animation: launch-glow ${DURATION}ms ease-out forwards }
        .animate-launch-text { animation: launch-text ${DURATION}ms ease-out forwards }
        .animate-launch-progress { animation: launch-progress ${DURATION - 200}ms cubic-bezier(0.4, 0, 0.2, 1) forwards }

        .paper-sheet { animation: paper-in ${DURATION}ms cubic-bezier(0.4, 0, 0.2, 1) forwards; transform-origin: 50% 50% }
        .scan-beam   { animation: scan-beam ${DURATION}ms ease-in-out forwards }
        .scan-line   { animation: scan-line ${DURATION}ms ease-in-out forwards }
        .particle    { opacity: 0; animation: particle 1400ms cubic-bezier(0.2, 0.7, 0.2, 1) forwards }
        .digital-badge { opacity: 0; animation: digital-in ${DURATION}ms cubic-bezier(0.4, 0, 0.2, 1) forwards }
      `}</style>
    </div>,
    document.body,
  );
};

export default LaunchOverlay;
