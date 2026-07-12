import { motion } from "framer-motion";
import { FileText, Brain, Search, Shield, Zap } from "lucide-react";

const floatingDoc = {
  animate: {
    y: [0, -12, 0],
    rotate: [0, 2, -2, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const pulseGlow = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.6, 1, 0.6],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const AnimatedHeroVisual = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      {/* Orbital rings */}
      <motion.div
        className="absolute inset-8 rounded-full border border-accent/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <motion.div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-accent/40" {...pulseGlow} />
      </motion.div>
      <motion.div
        className="absolute inset-16 rounded-full border border-accent/15"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <motion.div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-dm-coral" {...pulseGlow} />
      </motion.div>
      <motion.div
        className="absolute inset-4 rounded-full border border-dm-navy/5"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <motion.div className="absolute top-0 right-4 w-2 h-2 rounded-full bg-accent/30" />
      </motion.div>

      {/* Connecting lines (behind boxes) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
        <motion.line
          x1="80" y1="100" x2="170" y2="180"
          stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ delay: 1.5, duration: 1 }}
        />
        <motion.line
          x1="320" y1="90" x2="230" y2="180"
          stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ delay: 1.8, duration: 1 }}
        />
        <motion.line
          x1="320" y1="320" x2="230" y2="220"
          stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ delay: 2.1, duration: 1 }}
        />
        <motion.line
          x1="80" y1="310" x2="170" y2="220"
          stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ delay: 2.4, duration: 1 }}
        />
      </svg>

      {/* Center brain/AI icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-dm-coral flex items-center justify-center shadow-lg shadow-accent/20"
          animate={{ scale: [1, 1.08, 1], boxShadow: ["0 10px 30px -10px hsl(var(--accent)/0.2)", "0 10px 40px -10px hsl(var(--accent)/0.4)", "0 10px 30px -10px hsl(var(--accent)/0.2)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-white font-bold text-lg tracking-tight">AI</span>
        </motion.div>
      </div>

      {/* Floating document cards */}
      {[
        { icon: FileText, label: "PDF", x: "5%", y: "15%", delay: 0 },
        { icon: Search, label: "OCR", x: "70%", y: "10%", delay: 0.5 },
        { icon: Shield, label: "Secure", x: "75%", y: "70%", delay: 1 },
        { icon: Zap, label: "Fast", x: "5%", y: "68%", delay: 1.5 },
      ].map((item, i) => (
        <motion.div
          key={item.label}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{
            opacity: { delay: 0.8 + item.delay, duration: 0.5 },
            scale: { delay: 0.8 + item.delay, duration: 0.5 },
            y: { delay: 1.3 + item.delay, duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="bg-card border border-border rounded-xl p-3 shadow-lg backdrop-blur-sm flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <item.icon size={16} className="text-accent" />
            </div>
            <span className="text-xs font-semibold text-foreground">{item.label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedHeroVisual;
