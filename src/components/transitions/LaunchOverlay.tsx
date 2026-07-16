import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Rocket, Sparkles } from "lucide-react";

/**
 * Dispatch this event to trigger the fullscreen launch animation and
 * then open the given URL. Usage:
 *   launchExternal("https://fotofind.digitizeme.ae/")
 */
export const launchExternal = (url: string, newTab = true) => {
  // Open the tab synchronously inside the click handler so popup blockers
  // don't kill it. We navigate it after the animation finishes.
  let win: Window | null = null;
  if (newTab && typeof window !== "undefined") {
    win = window.open("about:blank", "_blank", "noopener,noreferrer");
  }
  window.dispatchEvent(new CustomEvent("launch-external", { detail: { url, newTab, win } }));
};

type Payload = { url: string; newTab: boolean; win: Window | null };

const DURATION = 2600; // ms — show rocket, THEN redirect

const LaunchOverlay = () => {
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Payload>;
      if (!ce.detail?.url) return;
      setPayload(ce.detail);
      // Fire the actual navigation slightly before the overlay fades so the
      // new tab opens as part of the same user gesture (popup blockers).
      window.setTimeout(() => {
        try {
          if (ce.detail.newTab && ce.detail.win && !ce.detail.win.closed) {
            ce.detail.win.location.href = ce.detail.url;
          } else if (ce.detail.newTab) {
            window.open(ce.detail.url, "_blank", "noopener,noreferrer");
          } else {
            window.location.href = ce.detail.url;
          }
        } catch {
          window.location.href = ce.detail.url;
        }
      }, DURATION);
      window.setTimeout(() => setPayload(null), DURATION + 250);
    };
    window.addEventListener("launch-external", handler as EventListener);
    return () => window.removeEventListener("launch-external", handler as EventListener);
  }, []);

  if (!payload) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-md animate-launch-fade" />

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[60vmin] h-[60vmin] rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.55)_0%,hsl(var(--accent)/0)_65%)] animate-launch-glow" />
      </div>

      {/* Starfield streaks */}
      <div className="absolute inset-0">
        {Array.from({ length: 22 }).map((_, i) => {
          const top = (i * 37) % 100;
          const delay = (i % 8) * 60;
          const dur = 700 + ((i * 53) % 500);
          return (
            <span
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-accent to-transparent animate-launch-streak"
              style={{
                top: `${top}%`,
                left: "-20%",
                width: `${30 + ((i * 13) % 40)}%`,
                animationDelay: `${delay}ms`,
                animationDuration: `${dur}ms`,
                opacity: 0.7,
              }}
            />
          );
        })}
      </div>

      {/* Center content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-accent/30 blur-2xl animate-launch-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-[0_20px_60px_hsl(var(--accent)/0.55)] animate-launch-rocket">
            <Rocket className="w-11 h-11" strokeWidth={2.2} />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-launch-sparkle" />
        </div>

        <div className="text-center animate-launch-text">
          <p className="text-lg md:text-xl font-semibold text-foreground">
            Launching DigitizeMe
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Taking you to the app…
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
          0% { transform: scale(0.4); opacity: 0 }
          40% { opacity: 1 }
          100% { transform: scale(1.6); opacity: 0 }
        }
        @keyframes launch-streak {
          0% { transform: translateX(0) scaleX(0.4); opacity: 0 }
          30% { opacity: 1 }
          100% { transform: translateX(140vw) scaleX(1); opacity: 0 }
        }
        @keyframes launch-rocket {
          0% { transform: translateY(20px) scale(0.6); opacity: 0 }
          30% { transform: translateY(0) scale(1); opacity: 1 }
          70% { transform: translateY(-6px) scale(1.04); opacity: 1 }
          100% { transform: translateY(-120vh) scale(0.6); opacity: 0 }
        }
        @keyframes launch-pulse {
          0%, 100% { transform: scale(0.9); opacity: 0.5 }
          50% { transform: scale(1.4); opacity: 0.9 }
        }
        @keyframes launch-sparkle {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.8 }
          50% { transform: rotate(180deg) scale(1.3); opacity: 1 }
        }
        @keyframes launch-text {
          0% { opacity: 0; transform: translateY(8px) }
          30% { opacity: 1; transform: translateY(0) }
          80% { opacity: 1 }
          100% { opacity: 0 }
        }
        @keyframes launch-progress {
          0% { width: 0% }
          100% { width: 100% }
        }
        .animate-launch-fade { animation: launch-fade 220ms ease-out forwards, launch-fade 260ms ease-in ${DURATION - 260}ms reverse forwards }
        .animate-launch-glow { animation: launch-glow ${DURATION}ms ease-out forwards }
        .animate-launch-streak { animation-name: launch-streak; animation-timing-function: cubic-bezier(0.2, 0.7, 0.2, 1); animation-fill-mode: forwards; animation-iteration-count: 1 }
        .animate-launch-rocket { animation: launch-rocket ${DURATION}ms cubic-bezier(0.5, 0, 0.2, 1) forwards }
        .animate-launch-pulse { animation: launch-pulse 900ms ease-in-out infinite }
        .animate-launch-sparkle { animation: launch-sparkle 1200ms ease-in-out infinite }
        .animate-launch-text { animation: launch-text ${DURATION}ms ease-out forwards }
        .animate-launch-progress { animation: launch-progress ${DURATION - 200}ms cubic-bezier(0.4, 0, 0.2, 1) forwards }
      `}</style>
    </div>,
    document.body,
  );
};

export default LaunchOverlay;
