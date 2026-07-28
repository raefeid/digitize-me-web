import Lottie from "lottie-react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import balanceScale from "@/assets/balance-scale.json";

const FILE_COUNT = 9;

interface OrbitFile {
  id: number;
  radius: number;
  duration: number;
  delay: number;
  size: number;
}

const FILES: OrbitFile[] = Array.from({ length: FILE_COUNT }, (_, i) => {
  const ring = i % 3;
  return {
    id: i,
    radius: 150 + ring * 46 + ((i * 13) % 17),
    duration: 26 + ring * 6 + ((i * 7) % 9),
    delay: (i * 1.7) % 12,
    size: ring === 0 ? 34 : ring === 1 ? 30 : 26,
  };
});

/**
 * Law-firm hero visual: a scales-of-justice core (plays once on load) with
 * case files orbiting in front of it in calm circles.
 */
const LawFirmHeroAnimation = () => (
  <div
    className="relative mx-auto aspect-square w-full max-w-[560px] select-none"
    aria-hidden="true"
  >
    {/* ambient glow */}
    <div className="absolute inset-0 rounded-full bg-accent/10 blur-3xl" />

    {/* core — sits in front of the orbiting papers */}
    <div className="absolute left-1/2 top-1/2 z-20 flex h-80 w-80 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
      <Lottie
        animationData={balanceScale}
        loop={false}
        autoplay
        className="h-full w-full"
      />
    </div>

    {/* orbit rings */}
    {[0, 1, 2].map((ring) => (
      <div
        key={ring}
        className="absolute left-1/2 top-1/2 z-10 rounded-full border border-accent/15"
        style={{
          width: `${(150 + ring * 46) * 2}px`,
          height: `${(150 + ring * 46) * 2}px`,
          transform: "translate(-50%, -50%)",
        }}
      />
    ))}

    {/* orbiting files — rendered behind the core icon */}
    {FILES.map((file) => (
      <motion.div
        key={file.id}
        className="absolute left-1/2 top-1/2 z-0"
        style={{ width: 0, height: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration: file.duration,
          repeat: Infinity,
          ease: "linear",
          delay: -file.delay,
        }}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${file.radius}px, 0) translate(-50%, -50%)`,
          }}
        >
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: file.duration,
              repeat: Infinity,
              ease: "linear",
              delay: -file.delay,
            }}
          >
            <div
              className="flex items-center justify-center rounded-lg border border-border bg-card/90 shadow-sm backdrop-blur-sm"
              style={{ width: file.size + 12, height: file.size + 16 }}
            >
              <FileText size={file.size * 0.5} className="text-muted-foreground" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default LawFirmHeroAnimation;
