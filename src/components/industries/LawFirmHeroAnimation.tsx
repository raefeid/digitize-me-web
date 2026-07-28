import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scale, FileText } from "lucide-react";

const FILE_COUNT = 9;

interface OrbitFile {
  id: number;
  radius: number;
  duration: number;
  delay: number;
  tilt: number;
  size: number;
}

const FILES: OrbitFile[] = Array.from({ length: FILE_COUNT }, (_, i) => {
  const ring = i % 3;
  return {
    id: i,
    radius: 96 + ring * 46 + ((i * 13) % 17),
    duration: 14 + ring * 5 + ((i * 7) % 9),
    delay: (i * 1.7) % 12,
    tilt: (i * 40) % 360,
    size: ring === 0 ? 34 : ring === 1 ? 30 : 26,
  };
});

/**
 * Law-firm hero visual: a scales-of-justice core with case files orbiting in
 * random circles. Periodically a retrieval beam extends from the core, locks
 * onto one file and pulls it in — the "find any document in seconds" idea.
 */
const LawFirmHeroAnimation = () => {
  const [targetId, setTargetId] = useState(0);
  const [phase, setPhase] = useState<"idle" | "beam" | "fetch">("idle");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        await new Promise((r) => setTimeout(r, 1400));
        if (cancelled) return;
        setTargetId(Math.floor(Math.random() * FILE_COUNT));
        setPhase("beam");
        await new Promise((r) => setTimeout(r, 900));
        if (cancelled) return;
        setPhase("fetch");
        await new Promise((r) => setTimeout(r, 1600));
        if (cancelled) return;
        setPhase("idle");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const target = FILES[targetId];

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[460px] select-none"
      aria-hidden="true"
    >
      {/* ambient glow */}
      <div className="absolute inset-0 rounded-full bg-accent/10 blur-3xl" />

      {/* orbit rings */}
      {[0, 1, 2].map((ring) => (
        <div
          key={ring}
          className="absolute left-1/2 top-1/2 rounded-full border border-accent/15"
          style={{
            width: `${(96 + ring * 46) * 2}px`,
            height: `${(96 + ring * 46) * 2}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* retrieval beam */}
      <motion.div
        className="absolute left-1/2 top-1/2 origin-left"
        style={{ rotate: target.tilt }}
        animate={{ rotate: target.tilt }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="h-[2px] rounded-full bg-gradient-to-r from-accent via-accent/70 to-transparent shadow-[0_0_12px_hsl(var(--accent)/0.8)]"
          initial={{ width: 0, opacity: 0 }}
          animate={
            phase === "idle"
              ? { width: 0, opacity: 0 }
              : { width: target.radius, opacity: 1 }
          }
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </motion.div>

      {/* orbiting files */}
      {FILES.map((file) => {
        const isTarget = file.id === targetId && phase !== "idle";
        return (
          <motion.div
            key={file.id}
            className="absolute left-1/2 top-1/2"
            style={{ width: 0, height: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: file.duration,
              repeat: Infinity,
              ease: "linear",
              delay: -file.delay,
            }}
          >
            <motion.div
              className="absolute"
              animate={{
                x: isTarget && phase === "fetch" ? 0 : file.radius,
                y: 0,
              }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              style={{ translateX: "-50%", translateY: "-50%" }}
            >
              <motion.div
                className={`flex items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm ${
                  isTarget
                    ? "border-accent bg-accent/20 shadow-[0_0_18px_hsl(var(--accent)/0.55)]"
                    : "border-border bg-card/90"
                }`}
                style={{ width: file.size + 12, height: file.size + 16 }}
                animate={{
                  scale: isTarget ? 1.15 : 1,
                  opacity: isTarget || phase === "idle" ? 1 : 0.65,
                }}
                transition={{ duration: 0.4 }}
              >
                <FileText
                  size={file.size * 0.5}
                  className={isTarget ? "text-accent" : "text-muted-foreground"}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* core */}
      <motion.div
        className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-accent/30 bg-card shadow-lg"
        animate={{
          scale: phase === "fetch" ? [1, 1.08, 1] : 1,
          boxShadow:
            phase === "idle"
              ? "0 0 0 hsl(var(--accent)/0)"
              : "0 0 34px hsl(var(--accent)/0.45)",
        }}
        transition={{ duration: 0.8 }}
      >
        <Scale size={44} className="text-accent" />
      </motion.div>
    </div>
  );
};

export default LawFirmHeroAnimation;
