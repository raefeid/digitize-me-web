import { motion } from "framer-motion";
import { Scan, Brain, FolderOpen, Search } from "lucide-react";

const steps = [
  {
    icon: Scan,
    tile: "bg-gradient-to-br from-dm-coral to-dm-coral-light",
    glow: "shadow-dm-coral/40",
    ring: "border-dm-coral/40",
    halo: "bg-dm-coral/20",
  },
  {
    icon: Brain,
    tile: "bg-gradient-to-br from-dm-navy to-dm-navy-light",
    glow: "shadow-dm-navy/40",
    ring: "border-dm-navy/40",
    halo: "bg-dm-navy/20",
  },
  {
    icon: FolderOpen,
    tile: "bg-gradient-to-br from-dm-coral-light to-dm-navy-light",
    glow: "shadow-dm-coral/30",
    ring: "border-dm-coral-light/50",
    halo: "bg-dm-coral-light/20",
  },
  {
    icon: Search,
    tile: "bg-gradient-to-br from-dm-navy-light to-dm-coral",
    glow: "shadow-dm-navy/30",
    ring: "border-dm-navy-light/50",
    halo: "bg-dm-navy-light/20",
  },
];

const AnimatedWorkflow = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto py-8">
      {/* Ambient colour wash */}
      <div className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-60">
        <div className="absolute left-[5%] top-1/4 h-32 w-32 rounded-full bg-dm-coral/25" />
        <div className="absolute right-[5%] bottom-1/4 h-32 w-32 rounded-full bg-dm-navy/25" />
      </div>

      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <motion.div
          className="absolute top-1/2 left-[10%] right-[10%] h-1 rounded-full bg-gradient-to-r from-dm-coral via-dm-navy to-dm-coral-light -translate-y-1/2"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ transformOrigin: "left" }}
        />

        {/* Travelling shimmer along the line */}
        <motion.div
          className="absolute top-1/2 left-[10%] right-[10%] h-1 rounded-full -translate-y-1/2 overflow-hidden"
          aria-hidden
        >
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-background/70 to-transparent"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          />
        </motion.div>

        {/* Animated data packet */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-dm-coral shadow-lg shadow-dm-coral/60 z-20 ring-4 ring-dm-coral/20"
          initial={{ left: "10%" }}
          animate={{ left: ["10%", "90%"], scale: [1, 1.35, 1] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1,
          }}
        />

        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={i}
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.2, duration: 0.5 }}
            >
              {/* Soft colour halo */}
              <motion.div
                className={`absolute inset-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl blur-xl ${step.halo}`}
                animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.95, 1.15, 0.95] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
              />

              <motion.div
                className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl ${step.tile} flex items-center justify-center shadow-lg ${step.glow}`}
                whileHover={{ scale: 1.12, y: -6, rotate: -3 }}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  y: { duration: 3.5, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" },
                  type: "spring",
                  stiffness: 300,
                }}
              >
                <Icon size={28} className="text-primary-foreground drop-shadow" />
              </motion.div>

              {/* Pulse ring */}
              <motion.div
                className={`absolute inset-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 ${step.ring}`}
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.7, 0, 0.7],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};


export default AnimatedWorkflow;
